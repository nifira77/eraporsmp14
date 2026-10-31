/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ERaporState, 
  UserProfile, 
  StudentGrade, 
  TujuanPembelajaran, 
  StudentAttendance, 
  StudentExtracurricular, 
  StudentNote, 
  StudentAchievement, 
  SchoolInfo,
  Student
} from './types/erapor';
import { 
  getInitialState, 
  saveStateToLocalStorage,
  initialSchoolInfo,
  initialUsers,
  initialRombels,
  initialSubjects,
  initialLearningObjectives,
  initialStudents,
  initialGrades,
  initialAttendances,
  initialExtracurriculars,
  initialStudentExtracurriculars,
  initialNotes,
  initialAchievements,
  isSampleTP
} from './data/initialData';
import { 
  subscribeToCloudSync, 
  syncStateToCloud, 
  fetchCloudStateOnce,
  resumeNetworkFromQuota,
  isQuotaExhausted,
  CURRENT_DEVICE_ID 
} from './services/realtimeSync';
import { testConnection } from './services/firebase';

import { Header } from './components/Header';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { InputNilaiView } from './components/InputNilaiView';
import { TujuanPembelajaranView } from './components/TujuanPembelajaranView';
import { StatusPenilaianView } from './components/StatusPenilaianView';
import { KehadiranEkskulView } from './components/KehadiranEkskulView';
import { CatatanWaliView } from './components/CatatanWaliView';
import { CetakRaporView } from './components/CetakRaporView';
import { AnalisisPerkembanganView } from './components/AnalisisPerkembanganView';
import { DataSekolahView } from './components/DataSekolahView';
import { PenilaianEkskulView } from './components/PenilaianEkskulView';
import { DataPendidikView } from './components/DataPendidikView';
import { DataSiswaView } from './components/DataSiswaView';
import { BukuIndukView } from './components/BukuIndukView';
import { LoginView } from './components/LoginView';

function mergeCloudWithLocalState(prev: ERaporState, cloudData: Partial<ERaporState>): ERaporState {
  const remoteStudents = cloudData.students !== undefined ? cloudData.students : prev.students;
  const remoteValidStudentIds = new Set(remoteStudents.map((s: any) => s.id));

  const remoteRombels = (cloudData.rombels !== undefined ? cloudData.rombels : prev.rombels).map((r: any) => ({
    ...r,
    jumlahSiswa: remoteStudents.filter((s: any) => s.rombelId === r.id).length
  }));

  const remoteUsers = (cloudData.users && Array.isArray(cloudData.users) && cloudData.users.length > 0)
    ? cloudData.users 
    : prev.users;
  const remoteCurrentUser = remoteUsers.find((u: any) => u.id === prev.currentUser?.id) || prev.currentUser;

  // SMART MERGE FOR GRADES:
  // Prevents old cloud snapshot from overwriting newer local grades entered by the user
  const mergedGradesMap = new Map<string, StudentGrade>();

  // 1. Populate with remote grades from cloud
  if (cloudData.grades && Array.isArray(cloudData.grades)) {
    cloudData.grades.forEach((rg: any) => {
      if (rg && rg.studentId && rg.subjectId && remoteValidStudentIds.has(rg.studentId)) {
        mergedGradesMap.set(`${rg.studentId}-${rg.subjectId}`, rg);
      }
    });
  }

  // 2. Protect and merge local grades:
  // If local grade has higher timestamp or has scores while remote doesn't, local WINS
  (prev.grades || []).forEach((lg: StudentGrade) => {
    if (lg && lg.studentId && lg.subjectId && remoteValidStudentIds.has(lg.studentId)) {
      const key = `${lg.studentId}-${lg.subjectId}`;
      const remote = mergedGradesMap.get(key);
      if (!remote) {
        mergedGradesMap.set(key, lg);
      } else {
        const localTime = new Date(lg.updatedAt || 0).getTime();
        const remoteTime = new Date(remote.updatedAt || 0).getTime();
        const localHasScore = Boolean((lg.nilaiAkhirSTS && lg.nilaiAkhirSTS > 0) || (lg.nilaiAkhirRapor && lg.nilaiAkhirRapor > 0) || (lg.nilaiAkhirLM && lg.nilaiAkhirLM > 0));
        const remoteHasScore = Boolean((remote.nilaiAkhirSTS && remote.nilaiAkhirSTS > 0) || (remote.nilaiAkhirRapor && remote.nilaiAkhirRapor > 0) || (remote.nilaiAkhirLM && remote.nilaiAkhirLM > 0));

        if ((localHasScore && !remoteHasScore) || (localTime >= remoteTime)) {
          mergedGradesMap.set(key, lg);
        }
      }
    }
  });

  // Smart merge for attendance
  const mergedAttendancesMap = new Map<string, StudentAttendance>();
  if (cloudData.attendances && Array.isArray(cloudData.attendances)) {
    cloudData.attendances.forEach((ra: any) => {
      if (ra && ra.studentId && remoteValidStudentIds.has(ra.studentId)) {
        mergedAttendancesMap.set(ra.studentId, ra);
      }
    });
  }
  (prev.attendances || []).forEach((la: StudentAttendance) => {
    if (la && la.studentId && remoteValidStudentIds.has(la.studentId)) {
      const existing = mergedAttendancesMap.get(la.studentId);
      if (!existing || ((la.sakit > 0 || la.izin > 0 || la.alpa > 0) && (existing.sakit === 0 && existing.izin === 0 && existing.alpa === 0))) {
        mergedAttendancesMap.set(la.studentId, la);
      }
    }
  });

  // Smart merge for notes
  const mergedNotesMap = new Map<string, StudentNote>();
  if (cloudData.notes && Array.isArray(cloudData.notes)) {
    cloudData.notes.forEach((rn: any) => {
      if (rn && rn.studentId && remoteValidStudentIds.has(rn.studentId)) {
        mergedNotesMap.set(rn.studentId, rn);
      }
    });
  }
  (prev.notes || []).forEach((ln: StudentNote) => {
    if (ln && ln.studentId && remoteValidStudentIds.has(ln.studentId)) {
      const existing = mergedNotesMap.get(ln.studentId);
      if (!existing || (ln.catatan && ln.catatan.trim() && (!existing.catatan || !existing.catatan.trim()))) {
        mergedNotesMap.set(ln.studentId, ln);
      }
    }
  });

  const remoteSchool = cloudData.school ? {
    ...prev.school,
    ...cloudData.school,
    kabupaten: (cloudData.school.kabupaten === 'Tulag Bawang Barat' || !cloudData.school.kabupaten) ? 'Tulang Bawang Barat' : cloudData.school.kabupaten,
    tanggalRapor: (cloudData.school.tanggalRapor === '19 Desember 2026' || cloudData.school.tanggalRapor === '17 Oktober 2026' || !cloudData.school.tanggalRapor) ? '3 November 2026' : cloudData.school.tanggalRapor,
    alamat: (!cloudData.school.alamat || cloudData.school.alamat.includes('Tulag Bawang Barat') || cloudData.school.alamat === 'Jl. Poros Tiyuh Marga Jaya, Kec. Gunung Agung, Kab. Tulag Bawang Barat, Kode Pos 34783') ? 'Jl. Poros Tiyuh Marga Jaya, Kec, Gunung Agung, Kab. Tulang Bawang Barat Kode Pos 34783' : cloudData.school.alamat
  } : prev.school;

  const nextState: ERaporState = {
    ...prev,
    school: remoteSchool,
    students: remoteStudents,
    grades: Array.from(mergedGradesMap.values()),
    rombels: remoteRombels,
    subjects: cloudData.subjects !== undefined ? cloudData.subjects : prev.subjects,
    learningObjectives: (cloudData.learningObjectives !== undefined 
      ? (cloudData.learningObjectives as any[]) 
      : prev.learningObjectives
    ).filter(tp => !isSampleTP(tp)),
    attendances: Array.from(mergedAttendancesMap.values()),
    extracurriculars: cloudData.extracurriculars !== undefined ? cloudData.extracurriculars : prev.extracurriculars,
    studentExtracurriculars: cloudData.studentExtracurriculars !== undefined 
      ? (cloudData.studentExtracurriculars as any[]).filter((se: any) => remoteValidStudentIds.has(se.studentId))
      : prev.studentExtracurriculars,
    notes: Array.from(mergedNotesMap.values()),
    achievements: cloudData.achievements !== undefined 
      ? (cloudData.achievements as any[]).filter((ach: any) => remoteValidStudentIds.has(ach.studentId))
      : prev.achievements,
    users: remoteUsers,
    currentUser: remoteCurrentUser,
    isLocked: cloudData.isLocked !== undefined ? cloudData.isLocked : prev.isLocked
  };

  // Mirror directly to localStorage so it is never lost on refresh
  saveStateToLocalStorage(nextState);

  return nextState;
}

export default function App() {
  const [state, setState] = useState<ERaporState>(() => getInitialState());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [activeSubjectIdForInput, setActiveSubjectIdForInput] = useState<string | undefined>(undefined);
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'syncing' | 'offline'>('syncing');
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('erapor_smpn14tubaba_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isDesktopNavCollapsed, setIsDesktopNavCollapsed] = useState(false);
  const isInitialMountRef = useRef(true);
  const hasLoadedFromCloudRef = useRef(false);
  const isRemoteUpdateRef = useRef(false);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileNavOpen(prev => !prev);
    } else {
      setIsDesktopNavCollapsed(prev => !prev);
    }
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileNavOpen(false);
  };

  const handleLogin = (user: UserProfile) => {
    setIsAuthenticated(true);
    setIsMobileNavOpen(false);
    try {
      localStorage.setItem('erapor_smpn14tubaba_auth', 'true');
    } catch (e) {
      console.error(e);
    }
    setState(prev => ({
      ...prev,
      currentUser: user
    }));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsMobileNavOpen(false);
    try {
      localStorage.removeItem('erapor_smpn14tubaba_auth');
    } catch (e) {
      console.error(e);
    }
  };

  // Subscribe to real-time cloud updates across multiple devices
  useEffect(() => {
    if (!isQuotaExhausted()) {
      testConnection();
    } else {
      setCloudStatus('offline');
    }

    const unsubscribe = subscribeToCloudSync(
      (cloudData, metadata) => {
        hasLoadedFromCloudRef.current = true;

        // If update was dispatched by this exact device, skip to avoid state oscillation
        if (metadata.deviceOrigin === CURRENT_DEVICE_ID) {
          setCloudStatus('connected');
          if (metadata.updatedAt) {
            setLastSyncedTime(new Date(metadata.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          }
          return;
        }

        if (cloudData && Object.keys(cloudData).length > 0) {
          isRemoteUpdateRef.current = true;
          setState(prev => mergeCloudWithLocalState(prev, cloudData));

          if (metadata.updatedAt) {
            setLastSyncedTime(new Date(metadata.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          }
          setCloudStatus('connected');
        }
      },
      (status) => {
        setCloudStatus(status === 'error' ? 'offline' : status);
      },
      () => {
        // Cloud document does not exist yet; mark loaded and immediately seed cloud with local data
        hasLoadedFromCloudRef.current = true;
        setCloudStatus('syncing');
        syncStateToCloud(state, 'Inisialisasi Data Sekolah', { immediate: true, force: true }).then((success) => {
          if (success) {
            setCloudStatus('connected');
            setLastSyncedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          }
        });
      }
    );

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible' && !isQuotaExhausted()) {
        testConnection();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, []);

  // Autosave to localStorage and push to Firestore Cloud for multi-device sync
  useEffect(() => {
    // 1. Initial mount: do not overwrite cloud with initial client cache
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    // 2. If state update arrived from remote onSnapshot, do not echo back
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    // 3. If initial cloud state hasn't been retrieved yet, only mirror locally
    if (!hasLoadedFromCloudRef.current) {
      saveStateToLocalStorage(state);
      return;
    }

    // 4. This is an authentic user-initiated modification: persist locally and sync to cloud
    saveStateToLocalStorage(state);
    setCloudStatus('syncing');
    syncStateToCloud(state, state.currentUser?.name || 'Pengguna e-Rapor').then((success) => {
      if (success) {
        setCloudStatus('connected');
        setLastSyncedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        setCloudStatus('offline');
      }
    });
  }, [state]);

  // Manual refresh from Firestore cloud
  const handleManualRefreshCloud = async () => {
    setCloudStatus('syncing');
    try {
      await resumeNetworkFromQuota();
      const cloudData = await fetchCloudStateOnce();
      if (cloudData && Object.keys(cloudData).length > 0) {
        isRemoteUpdateRef.current = true;
        setState(prev => mergeCloudWithLocalState(prev, cloudData));
        setCloudStatus('connected');
        setLastSyncedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        setCloudStatus('connected');
      }
    } catch (e) {
      console.warn('Manual refresh error:', e);
      setCloudStatus('connected');
    }
  };

  // Role switch handler
  const handleSelectUser = (user: UserProfile) => {
    setState(prev => ({
      ...prev,
      currentUser: user
    }));

    // Auto navigate to their primary view if current tab is not accessible
    if (user.role === 'guru_mapel' && (activeTab === 'kehadiran_ekskul' || activeTab === 'catatan_wali' || activeTab === 'data_sekolah')) {
      setActiveTab('input_nilai');
    }
  };

  // Lock status toggle handler
  const handleToggleLock = () => {
    setState(prev => {
      const nextState: ERaporState = {
        ...prev,
        isLocked: !prev.isLocked
      };
      saveStateToLocalStorage(nextState);
      return nextState;
    });
  };

  // Reset to default seed data
  const handleResetData = () => {
    const defaultState: ERaporState = {
      school: initialSchoolInfo,
      users: initialUsers,
      currentUser: initialUsers[1], // Siti Rahmawati (Wali Kelas 7.1)
      rombels: initialRombels,
      subjects: initialSubjects,
      learningObjectives: initialLearningObjectives,
      students: initialStudents,
      grades: initialGrades,
      attendances: initialAttendances,
      extracurriculars: initialExtracurriculars,
      studentExtracurriculars: initialStudentExtracurriculars,
      notes: initialNotes,
      achievements: initialAchievements,
      isLocked: false
    };
    setState(defaultState);
    saveStateToLocalStorage(defaultState);
    setActiveTab('dashboard');
  };

  // Export JSON backup
  const handleExportData = () => {
    const jsonStr = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_eRapor_SMPN14Tubaba_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Grade updates with immediate synchronous local persistence
  const handleUpdateGrades = (updatedList: StudentGrade[]) => {
    setState(prev => {
      const gradeMap = new Map<string, StudentGrade>();
      // First register existing grades by unique key studentId-subjectId
      (prev.grades || []).forEach(g => {
        if (g && g.studentId && g.subjectId) {
          gradeMap.set(`${g.studentId}-${g.subjectId}`, g);
        }
      });
      // Override or add updated grades
      updatedList.forEach(g => {
        if (g && g.studentId && g.subjectId) {
          gradeMap.set(`${g.studentId}-${g.subjectId}`, {
            ...g,
            id: g.id || `grade-${g.studentId}-${g.subjectId}`,
            updatedAt: g.updatedAt || new Date().toISOString()
          });
        }
      });
      const nextGrades = Array.from(gradeMap.values());
      const nextState: ERaporState = {
        ...prev,
        grades: nextGrades
      };
      // Synchronously write to localStorage right here for zero-latency durability
      saveStateToLocalStorage(nextState);
      return nextState;
    });
  };

  // TP updates
  const handleUpdateObjectives = (tps: TujuanPembelajaran[]) => {
    setState(prev => {
      const nextState: ERaporState = {
        ...prev,
        learningObjectives: tps
      };
      saveStateToLocalStorage(nextState);
      return nextState;
    });
  };

  // Attendance updates
  const handleUpdateAttendances = (attendances: StudentAttendance[]) => {
    setState(prev => {
      const nextState: ERaporState = {
        ...prev,
        attendances
      };
      saveStateToLocalStorage(nextState);
      return nextState;
    });
  };

  // Extracurricular updates
  const handleUpdateStudentExtracurriculars = (list: StudentExtracurricular[]) => {
    setState(prev => {
      const nextState: ERaporState = {
        ...prev,
        studentExtracurriculars: list
      };
      saveStateToLocalStorage(nextState);
      return nextState;
    });
  };

  // Notes updates
  const handleUpdateNotes = (notes: StudentNote[]) => {
    setState(prev => {
      const nextState: ERaporState = {
        ...prev,
        notes
      };
      saveStateToLocalStorage(nextState);
      return nextState;
    });
  };

  // Achievement updates
  const handleUpdateAchievements = (achievements: StudentAchievement[]) => {
    setState(prev => {
      const nextState: ERaporState = {
        ...prev,
        achievements
      };
      saveStateToLocalStorage(nextState);
      return nextState;
    });
  };

  // School info updates with bidirectional sync to headmaster user
  const handleUpdateSchool = (school: SchoolInfo) => {
    setState(prev => {
      // Synchronize admin / kepala_sekolah user exact name and NIP with school.kepalaSekolah
      const updatedUsers = prev.users.map(u => {
        if (u.role === 'admin' || u.role === 'kepala_sekolah') {
          return {
            ...u,
            name: school.kepalaSekolah || u.name,
            nip: school.nipKepalaSekolah || u.nip
          };
        }
        return u;
      });

      const nextState = {
        ...prev,
        school,
        users: updatedUsers
      };
      saveStateToLocalStorage(nextState);
      return nextState;
    });
  };

  // Rombel handlers
  const handleAddRombel = (newRombel: any) => {
    setState(prev => {
      const nextState = {
        ...prev,
        rombels: [...prev.rombels, newRombel]
      };
      saveStateToLocalStorage(nextState);
      return nextState;
    });
  };

  const handleUpdateRombel = (updatedRombel: any) => {
    setState(prev => {
      const updatedRombels = prev.rombels.map(r => r.id === updatedRombel.id ? updatedRombel : r);

      // Bidirectional sync with users:
      // If updatedRombel has a waliKelasId, make sure that teacher's role is wali_kelas and rombelId is updatedRombel.id
      let updatedUsers = prev.users;
      if (updatedRombel.waliKelasId) {
        updatedUsers = prev.users.map(u => {
          if (u.id === updatedRombel.waliKelasId) {
            return {
              ...u,
              name: updatedRombel.waliKelasNama || u.name,
              nip: updatedRombel.waliKelasNip || u.nip,
              role: u.role === 'admin' || u.role === 'kepala_sekolah' ? u.role : 'wali_kelas',
              rombelId: updatedRombel.id
            };
          }
          // If another teacher previously had this rombel assigned, clear it
          if (u.id !== updatedRombel.waliKelasId && u.rombelId === updatedRombel.id) {
            return {
              ...u,
              rombelId: undefined
            };
          }
          return u;
        });
      }

      const nextState = {
        ...prev,
        rombels: updatedRombels,
        users: updatedUsers
      };
      saveStateToLocalStorage(nextState);
      return nextState;
    });
  };

  const handleDeleteRombel = (rombelId: string) => {
    setState(prev => {
      const updatedRombels = prev.rombels.filter(r => r.id !== rombelId);
      const updatedUsers = prev.users.map(u => u.rombelId === rombelId ? { ...u, rombelId: undefined } : u);
      return {
        ...prev,
        rombels: updatedRombels,
        users: updatedUsers
      };
    });
  };

  // Subject KKTP update handler
  const handleUpdateSubjectKKTP = (subjectId: string, newKKTP: number) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === subjectId ? { ...s, kktp: newKKTP } : s)
    }));
  };

  // User / Teacher handlers with instant persistence and cross-entity synchronization
  const handleAddUser = (newUser: UserProfile) => {
    setState(prev => {
      const updatedUsers = [...prev.users, newUser];

      let updatedRombels = prev.rombels;
      if (newUser.role === 'wali_kelas' && newUser.rombelId) {
        updatedRombels = prev.rombels.map(r => {
          if (r.id === newUser.rombelId) {
            return {
              ...r,
              waliKelasNama: newUser.name,
              waliKelasNip: newUser.nip || '-',
              waliKelasId: newUser.id
            };
          }
          return r;
        });
      }

      let updatedSubjects = prev.subjects;
      if (newUser.subjectId) {
        updatedSubjects = prev.subjects.map(s => {
          if (s.id === newUser.subjectId) {
            return {
              ...s,
              guruPengampuNama: newUser.name,
              guruPengampuId: newUser.id
            };
          }
          return s;
        });
      }

      const updatedSchool = (newUser.role === 'admin' || newUser.role === 'kepala_sekolah')
        ? { ...prev.school, kepalaSekolah: newUser.name, nipKepalaSekolah: newUser.nip || prev.school.nipKepalaSekolah }
        : prev.school;

      const nextState = {
        ...prev,
        school: updatedSchool,
        users: updatedUsers,
        rombels: updatedRombels,
        subjects: updatedSubjects
      };
      saveStateToLocalStorage(nextState);
      return nextState;
    });
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setState(prev => {
      const updatedCurrentUser = prev.currentUser.id === updatedUser.id ? updatedUser : prev.currentUser;

      // 1. Synchronize Rombels:
      // Clear previous assignment if user changed rombel or is no longer a wali_kelas
      let updatedRombels = prev.rombels.map(r => {
        // If this rombel was previously assigned to this teacher, but teacher is no longer wali or moved:
        if (r.waliKelasId === updatedUser.id && (updatedUser.role !== 'wali_kelas' || r.id !== updatedUser.rombelId)) {
          return {
            ...r,
            waliKelasNama: '-',
            waliKelasNip: '-',
            waliKelasId: undefined
          };
        }
        // If this rombel is the newly assigned rombel for this teacher:
        if (updatedUser.role === 'wali_kelas' && r.id === updatedUser.rombelId) {
          return {
            ...r,
            waliKelasNama: updatedUser.name,
            waliKelasNip: updatedUser.nip || '-',
            waliKelasId: updatedUser.id
          };
        }
        // If this rombel still belongs to this teacher, ensure name & NIP are updated:
        if (r.waliKelasId === updatedUser.id) {
          return {
            ...r,
            waliKelasNama: updatedUser.name,
            waliKelasNip: updatedUser.nip || '-'
          };
        }
        return r;
      });

      // 2. Synchronize Users list:
      // If updatedUser became wali of a rombel that was previously held by another teacher, clear the other teacher's rombelId
      const updatedUsers = prev.users.map(u => {
        if (u.id === updatedUser.id) {
          return updatedUser;
        }
        if (updatedUser.role === 'wali_kelas' && updatedUser.rombelId && u.rombelId === updatedUser.rombelId && u.id !== updatedUser.id) {
          return {
            ...u,
            rombelId: undefined
          };
        }
        return u;
      });

      // 3. Synchronize Subjects:
      const updatedSubjects = prev.subjects.map(s => {
        if (s.id === updatedUser.subjectId && updatedUser.subjectId) {
          return {
            ...s,
            guruPengampuNama: updatedUser.name,
            guruPengampuId: updatedUser.id
          };
        } else if (s.guruPengampuId === updatedUser.id && s.id !== updatedUser.subjectId) {
          return {
            ...s,
            guruPengampuNama: '-'
          };
        }
        return s;
      });

      // 4. Synchronize School Headmaster if role is admin or kepala_sekolah
      const updatedSchool = (updatedUser.role === 'admin' || updatedUser.role === 'kepala_sekolah')
        ? { ...prev.school, kepalaSekolah: updatedUser.name, nipKepalaSekolah: updatedUser.nip || prev.school.nipKepalaSekolah }
        : prev.school;

      const nextState = {
        ...prev,
        school: updatedSchool,
        users: updatedUsers,
        currentUser: updatedCurrentUser,
        rombels: updatedRombels,
        subjects: updatedSubjects
      };
      saveStateToLocalStorage(nextState);
      return nextState;
    });
  };

  const handleDeleteUser = (userId: string) => {
    setState(prev => {
      const userToDelete = prev.users.find(u => u.id === userId);
      const updatedUsers = prev.users.filter(u => u.id !== userId);
      const updatedCurrentUser = prev.currentUser.id === userId 
        ? (updatedUsers[0] || prev.currentUser)
        : prev.currentUser;

      // Clean up references in rombels and subjects
      const updatedRombels = prev.rombels.map(r => {
        if (r.waliKelasId === userId || (userToDelete && r.waliKelasNama === userToDelete.name)) {
          return { ...r, waliKelasNama: '-', waliKelasNip: '-', waliKelasId: undefined };
        }
        return r;
      });

      const updatedSubjects = prev.subjects.map(s => {
        if (s.guruPengampuId === userId || (userToDelete && s.guruPengampuNama === userToDelete.name)) {
          return { ...s, guruPengampuNama: '-', guruPengampuId: '' };
        }
        return s;
      });

      const nextState = {
        ...prev,
        users: updatedUsers,
        currentUser: updatedCurrentUser,
        rombels: updatedRombels,
        subjects: updatedSubjects
      };
      saveStateToLocalStorage(nextState);
      return nextState;
    });
  };

  const handleReplaceUsers = (newUsers: UserProfile[]) => {
    setState(prev => {
      if (!newUsers || newUsers.length === 0) return prev;

      // Ensure an active admin or first user
      const adminUser = newUsers.find(u => u.role === 'admin' || u.role === 'kepala_sekolah') || newUsers[0];

      // Reassign rombels based on new users
      const updatedRombels = prev.rombels.map(r => {
        const assignedWali = newUsers.find(u => u.role === 'wali_kelas' && u.rombelId === r.id);
        if (assignedWali) {
          return {
            ...r,
            waliKelasNama: assignedWali.name,
            waliKelasNip: assignedWali.nip || '-',
            waliKelasId: assignedWali.id
          };
        }
        return {
          ...r,
          waliKelasNama: '-',
          waliKelasNip: '-',
          waliKelasId: undefined
        };
      });

      // Reassign subjects based on new users
      const updatedSubjects = prev.subjects.map(s => {
        const assignedTeacher = newUsers.find(u => u.subjectId === s.id);
        if (assignedTeacher) {
          return {
            ...s,
            guruPengampuNama: assignedTeacher.name,
            guruPengampuId: assignedTeacher.id
          };
        }
        return {
          ...s,
          guruPengampuNama: '-',
          guruPengampuId: ''
        };
      });

      const updatedSchool = adminUser
        ? { ...prev.school, kepalaSekolah: adminUser.name, nipKepalaSekolah: adminUser.nip || prev.school.nipKepalaSekolah }
        : prev.school;

      const nextState = {
        ...prev,
        school: updatedSchool,
        users: newUsers,
        currentUser: adminUser,
        rombels: updatedRombels,
        subjects: updatedSubjects
      };
      saveStateToLocalStorage(nextState);
      return nextState;
    });
  };

  // Student handlers
  const handleUpdateStudents = (students: Student[]) => {
    setState(prev => {
      const validStudentIds = new Set(students.map(s => s.id));
      const updatedRombels = prev.rombels.map(r => ({
        ...r,
        jumlahSiswa: students.filter(s => s.rombelId === r.id).length
      }));
      return {
        ...prev,
        students,
        rombels: updatedRombels,
        grades: prev.grades.filter(g => validStudentIds.has(g.studentId)),
        attendances: prev.attendances.filter(a => validStudentIds.has(a.studentId)),
        notes: prev.notes.filter(n => validStudentIds.has(n.studentId)),
        studentExtracurriculars: prev.studentExtracurriculars.filter(se => validStudentIds.has(se.studentId)),
        achievements: prev.achievements.filter(ach => validStudentIds.has(ach.studentId))
      };
    });
  };

  const handleAddStudent = (newStudent: Student) => {
    setState(prev => {
      const updatedStudents = [...prev.students, newStudent];
      const updatedRombels = prev.rombels.map(r => ({
        ...r,
        jumlahSiswa: updatedStudents.filter(s => s.rombelId === r.id).length
      }));
      return {
        ...prev,
        students: updatedStudents,
        rombels: updatedRombels
      };
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    setState(prev => {
      const updatedStudents = prev.students.filter(s => s.id !== studentId);
      const validStudentIds = new Set(updatedStudents.map(s => s.id));
      const updatedRombels = prev.rombels.map(r => ({
        ...r,
        jumlahSiswa: updatedStudents.filter(s => s.rombelId === r.id).length
      }));
      return {
        ...prev,
        students: updatedStudents,
        rombels: updatedRombels,
        grades: prev.grades.filter(g => validStudentIds.has(g.studentId)),
        attendances: prev.attendances.filter(a => validStudentIds.has(a.studentId)),
        notes: prev.notes.filter(n => validStudentIds.has(n.studentId)),
        studentExtracurriculars: prev.studentExtracurriculars.filter(se => validStudentIds.has(se.studentId)),
        achievements: prev.achievements.filter(ach => validStudentIds.has(ach.studentId))
      };
    });
  };

  if (!isAuthenticated) {
    return <LoginView state={state} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/90 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-slate-50 to-indigo-50/40 flex flex-col font-sans">
      {/* Top Bar with School Emblem, Kemdikbud Brand, and Persona Switcher */}
      <Header
        school={state.school}
        users={state.users}
        currentUser={state.currentUser}
        isLocked={state.isLocked}
        cloudStatus={cloudStatus}
        lastSyncedTime={lastSyncedTime}
        onSelectUser={handleSelectUser}
        onUpdateUser={handleUpdateUser}
        onToggleLock={handleToggleLock}
        onResetData={handleResetData}
        onExportData={handleExportData}
        onLogout={handleLogout}
        onToggleSidebar={handleToggleSidebar}
        isSidebarOpen={isMobileNavOpen}
        onRefreshCloud={handleManualRefreshCloud}
      />

      {/* Main Workspace: Sidebar + Viewport */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto min-w-0 relative">
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          currentUser={state.currentUser}
          isLocked={state.isLocked}
          onLogout={handleLogout}
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
          isDesktopCollapsed={isDesktopNavCollapsed}
        />

        <main className="flex-1 min-w-0 p-3 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <DashboardView state={state} onNavigate={setActiveTab} />
          )}

          {activeTab === 'tp' && (
            <TujuanPembelajaranView
              learningObjectives={state.learningObjectives}
              subjects={state.subjects}
              rombels={state.rombels}
              currentUser={state.currentUser}
              onUpdateObjectives={handleUpdateObjectives}
            />
          )}

          {activeTab === 'input_nilai' && (
            <InputNilaiView
              state={state}
              onUpdateGrades={handleUpdateGrades}
              onUpdateSubjectKKTP={handleUpdateSubjectKKTP}
              initialSubjectId={activeSubjectIdForInput}
            />
          )}

          {activeTab === 'rekap_status' && (
            <StatusPenilaianView
              state={state}
              onUpdateGrades={handleUpdateGrades}
              onOpenSubjectGrades={(subjectId) => {
                if (subjectId) {
                  setActiveSubjectIdForInput(subjectId);
                }
                setActiveTab('input_nilai');
              }}
            />
          )}

          {activeTab === 'kehadiran_ekskul' && (
            <KehadiranEkskulView
              state={state}
              onUpdateAttendances={handleUpdateAttendances}
              onUpdateStudentExtracurriculars={handleUpdateStudentExtracurriculars}
            />
          )}

          {activeTab === 'penilaian_ekskul' && (
            <PenilaianEkskulView
              state={state}
              onUpdateStudentExtracurriculars={handleUpdateStudentExtracurriculars}
            />
          )}

          {activeTab === 'catatan_wali' && (
            <CatatanWaliView
              state={state}
              onUpdateNotes={handleUpdateNotes}
              onUpdateAchievements={handleUpdateAchievements}
            />
          )}

          {activeTab === 'cetak_rapor' && (
            <CetakRaporView state={state} />
          )}

          {activeTab === 'analisis' && (
            <AnalisisPerkembanganView state={state} />
          )}

          {activeTab === 'data_sekolah' && (
            <DataSekolahView
              state={state}
              onUpdateSchool={handleUpdateSchool}
              onToggleLock={handleToggleLock}
              onResetData={handleResetData}
              onAddRombel={handleAddRombel}
              onUpdateRombel={handleUpdateRombel}
              onDeleteRombel={handleDeleteRombel}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'data_pendidik' && (
            <DataPendidikView
              state={state}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onReplaceUsers={handleReplaceUsers}
            />
          )}

          {activeTab === 'data_siswa' && (
            <DataSiswaView
              state={state}
              onUpdateStudents={handleUpdateStudents}
              onAddStudent={handleAddStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeTab === 'buku_induk' && (
            <BukuIndukView
              state={state}
              onNavigate={setActiveTab}
              onUpdateStudents={handleUpdateStudents}
            />
          )}
        </main>
      </div>
    </div>
  );
}
