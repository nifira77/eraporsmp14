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
  initialAchievements
} from './data/initialData';
import { 
  subscribeToCloudSync, 
  syncStateToCloud, 
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
import { LoginView } from './components/LoginView';

export default function App() {
  const [state, setState] = useState<ERaporState>(() => getInitialState());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [cloudStatus, setCloudStatus] = useState<'connected' | 'syncing' | 'offline'>('syncing');
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('erapor_smpn14tubaba_auth') === 'true';
    } catch {
      return false;
    }
  });
  const isRemoteUpdateRef = useRef(false);

  const handleLogin = (user: UserProfile) => {
    setIsAuthenticated(true);
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
    try {
      localStorage.removeItem('erapor_smpn14tubaba_auth');
    } catch (e) {
      console.error(e);
    }
  };

  // Subscribe to real-time cloud updates across multiple devices
  useEffect(() => {
    testConnection();

    const unsubscribe = subscribeToCloudSync((cloudData, metadata) => {
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
        setState(prev => {
          const remoteStudents = (cloudData.students || prev.students).filter((s: any) => !s.id?.startsWith('std-'));
          const remoteValidStudentIds = new Set(remoteStudents.map((s: any) => s.id));
          const remoteGrades = (cloudData.grades || prev.grades).filter((g: any) => remoteValidStudentIds.has(g.studentId));
          const remoteRombels = (cloudData.rombels || prev.rombels).map((r: any) => ({
            ...r,
            jumlahSiswa: remoteStudents.filter((s: any) => s.rombelId === r.id).length
          }));

          return {
            ...prev,
            school: cloudData.school ? { ...prev.school, ...cloudData.school } : prev.school,
            students: remoteStudents,
            grades: remoteGrades,
            rombels: remoteRombels,
            subjects: cloudData.subjects || prev.subjects,
            learningObjectives: cloudData.learningObjectives || prev.learningObjectives,
            attendances: (cloudData.attendances || prev.attendances).filter((a: any) => remoteValidStudentIds.has(a.studentId)),
            extracurriculars: cloudData.extracurriculars || prev.extracurriculars,
            studentExtracurriculars: (cloudData.studentExtracurriculars || prev.studentExtracurriculars).filter((se: any) => remoteValidStudentIds.has(se.studentId)),
            notes: (cloudData.notes || prev.notes).filter((n: any) => remoteValidStudentIds.has(n.studentId)),
            achievements: (cloudData.achievements || prev.achievements).filter((ach: any) => remoteValidStudentIds.has(ach.studentId)),
            users: cloudData.users || prev.users,
            isLocked: cloudData.isLocked !== undefined ? cloudData.isLocked : prev.isLocked
          };
        });

        if (metadata.updatedAt) {
          setLastSyncedTime(new Date(metadata.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        }
        setCloudStatus('connected');
      }
    }, (status) => {
      setCloudStatus(status === 'error' ? 'offline' : status);
    });

    return () => unsubscribe();
  }, []);

  // Autosave to localStorage and push to Firestore Cloud for multi-device sync
  useEffect(() => {
    saveStateToLocalStorage(state);

    // If change was received remotely from another device, skip re-pushing
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return;
    }

    setCloudStatus('syncing');
    syncStateToCloud(state, state.currentUser.name).then((success) => {
      if (success) {
        setCloudStatus('connected');
        setLastSyncedTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        setCloudStatus('offline');
      }
    });
  }, [state]);

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
    setState(prev => ({
      ...prev,
      isLocked: !prev.isLocked
    }));
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
    localStorage.removeItem('erapor_smpn14tubaba_state');
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

  // Grade updates
  const handleUpdateGrades = (updatedList: StudentGrade[]) => {
    setState(prev => {
      const gradeMap = new Map(prev.grades.map(g => [g.id, g]));
      updatedList.forEach(g => {
        gradeMap.set(g.id, g);
      });
      return {
        ...prev,
        grades: Array.from(gradeMap.values())
      };
    });
  };

  // TP updates
  const handleUpdateObjectives = (tps: TujuanPembelajaran[]) => {
    setState(prev => ({
      ...prev,
      learningObjectives: tps
    }));
  };

  // Attendance updates
  const handleUpdateAttendances = (attendances: StudentAttendance[]) => {
    setState(prev => ({
      ...prev,
      attendances
    }));
  };

  // Extracurricular updates
  const handleUpdateStudentExtracurriculars = (list: StudentExtracurricular[]) => {
    setState(prev => ({
      ...prev,
      studentExtracurriculars: list
    }));
  };

  // Notes updates
  const handleUpdateNotes = (notes: StudentNote[]) => {
    setState(prev => ({
      ...prev,
      notes
    }));
  };

  // Achievement updates
  const handleUpdateAchievements = (achievements: StudentAchievement[]) => {
    setState(prev => ({
      ...prev,
      achievements
    }));
  };

  // School info updates
  const handleUpdateSchool = (school: SchoolInfo) => {
    setState(prev => ({
      ...prev,
      school
    }));
  };

  // Rombel handlers
  const handleAddRombel = (newRombel: any) => {
    setState(prev => ({
      ...prev,
      rombels: [...prev.rombels, newRombel]
    }));
  };

  const handleDeleteRombel = (rombelId: string) => {
    setState(prev => ({
      ...prev,
      rombels: prev.rombels.filter(r => r.id !== rombelId)
    }));
  };

  // Subject KKTP update handler
  const handleUpdateSubjectKKTP = (subjectId: string, newKKTP: number) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === subjectId ? { ...s, kktp: newKKTP } : s)
    }));
  };

  // User / Teacher handlers
  const handleAddUser = (newUser: UserProfile) => {
    setState(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setState(prev => {
      const updatedUsers = prev.users.map(u => u.id === updatedUser.id ? updatedUser : u);
      const updatedCurrentUser = prev.currentUser.id === updatedUser.id ? updatedUser : prev.currentUser;
      
      // If this teacher is a Wali Kelas, synchronize rombel waliKelasNama & waliKelasNip
      let updatedRombels = prev.rombels;
      if (updatedUser.role === 'wali_kelas' && updatedUser.rombelId) {
        updatedRombels = prev.rombels.map(r => {
          if (r.id === updatedUser.rombelId || r.waliKelasId === updatedUser.id) {
            return {
              ...r,
              waliKelasNama: updatedUser.name,
              waliKelasNip: updatedUser.nip || '-'
            };
          }
          return r;
        });
      }

      // If this teacher has an assigned subject, synchronize subject guruPengampuNama
      const updatedSubjects = prev.subjects.map(s => {
        if (s.id === updatedUser.subjectId) {
          return {
            ...s,
            guruPengampuNama: updatedUser.name
          };
        }
        return s;
      });

      return {
        ...prev,
        users: updatedUsers,
        currentUser: updatedCurrentUser,
        rombels: updatedRombels,
        subjects: updatedSubjects
      };
    });
  };

  const handleDeleteUser = (userId: string) => {
    setState(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== userId)
    }));
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
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
      />

      {/* Main Workspace: Sidebar + Viewport */}
      <div className="flex-1 flex w-full max-w-[1600px] mx-auto">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentUser={state.currentUser}
          isLocked={state.isLocked}
          onLogout={handleLogout}
        />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
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
            />
          )}

          {activeTab === 'rekap_status' && (
            <StatusPenilaianView
              state={state}
              onOpenSubjectGrades={() => setActiveTab('input_nilai')}
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
        </main>
      </div>
    </div>
  );
}
