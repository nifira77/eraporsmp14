import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  ERaporState, 
  StudentGrade, 
  TujuanPembelajaran, 
  Subject, 
  Rombel,
  AssessmentMode
} from '../types/erapor';
import {
  Save,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  Info,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ChevronDown,
  Edit2,
  Check,
  Clock,
  Award,
  Calendar,
  Layers,
  FileSpreadsheet,
  FileCheck,
  X,
  AlertCircle,
  Users,
  Send
} from 'lucide-react';

interface InputNilaiViewProps {
  state: ERaporState;
  onUpdateGrades: (updatedGrades: StudentGrade[]) => void;
  onUpdateSubjectKKTP?: (subjectId: string, newKKTP: number) => void;
  initialSubjectId?: string;
}

export const InputNilaiView: React.FC<InputNilaiViewProps> = ({
  state,
  onUpdateGrades,
  onUpdateSubjectKKTP,
  initialSubjectId
}) => {
  const { 
    students, 
    subjects, 
    rombels, 
    learningObjectives, 
    grades, 
    currentUser, 
    isLocked 
  } = state;

  // Selected filters
  const [selectedRombelId, setSelectedRombelId] = useState<string>(
    currentUser.rombelId || rombels[0]?.id || '7.1'
  );
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || currentUser.subjectId || 'mtk'
  );

  useEffect(() => {
    if (initialSubjectId && subjects.some(s => s.id === initialSubjectId)) {
      setSelectedSubjectId(initialSubjectId);
    }
  }, [initialSubjectId, subjects]);

  // Assessment Mode: Sumatif Tengah Semester (STS) vs Sumatif Akhir Semester (SAS)
  const [assessmentMode, setAssessmentMode] = useState<AssessmentMode>('akhir_semester');

  // Active student grades in memory for editing
  const [localGrades, setLocalGrades] = useState<Record<string, StudentGrade>>({});
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [editingDeskripsiFor, setEditingDeskripsiFor] = useState<string | null>(null);

  // Excel Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [previewGrades, setPreviewGrades] = useState<Array<{
    studentId: string;
    nisn: string;
    nama: string;
    tp1: number;
    tp2: number;
    tp3: number;
    tp4: number;
    nonTes: number;
    tes: number;
    nilaiSTS?: number;
    status: 'Cocok' | 'Siswa Tidak Ditemukan';
  }>>([]);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  // Find relevant objects
  const selectedRombel = rombels.find(r => r.id === selectedRombelId) || rombels[0];
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  const isTeacherRole = currentUser.role === 'guru_mapel' || currentUser.role === 'wali_kelas';

  // Handle KKTP change dynamically
  const handleKKTPChange = (valStr: string) => {
    if (isLocked && isTeacherRole) return;
    const newKKTP = Math.min(100, Math.max(1, parseInt(valStr, 10) || 0));
    if (onUpdateSubjectKKTP) {
      onUpdateSubjectKKTP(selectedSubjectId, newKKTP);
    }
    setLocalGrades(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => {
        const g = next[id];
        const finalGrade = g.nilaiAkhirRapor || 0;
        next[id] = {
          ...g,
          statusKetercapaian: finalGrade >= newKKTP ? 'Tercapai' : 'Perlu Peningkatan'
        };
      });
      return next;
    });
  };

  // Get TPs for this subject and rombel
  const currentTPs = useMemo(() => {
    return learningObjectives.filter(
      tp => tp.subjectId === selectedSubjectId && (!tp.rombelId || tp.rombelId === 'all' || tp.rombelId === selectedRombelId)
    );
  }, [learningObjectives, selectedSubjectId, selectedRombelId]);

  // Check if subject is religion subject and detect required student religion
  const religionRequirement = useMemo(() => {
    const sId = (selectedSubjectId || '').toLowerCase();
    const sName = (selectedSubject?.nama || '').toLowerCase();

    if (sId === 'pak_kristen' || sName.includes('kristen protestan') || (sName.includes('kristen') && !sName.includes('katolik'))) {
      return { 
        isNonIslamReligion: true, 
        agamaLabel: 'Kristen Protestan', 
        matches: (ag: string) => ag.includes('kristen') || ag.includes('protestan') 
      };
    }
    if (sId === 'pak_katolik' || sName.includes('katolik')) {
      return { 
        isNonIslamReligion: true, 
        agamaLabel: 'Katolik', 
        matches: (ag: string) => ag.includes('katolik') || ag.includes('khatolik') 
      };
    }
    if (sId === 'pah_hindu' || sName.includes('hindu')) {
      return { 
        isNonIslamReligion: true, 
        agamaLabel: 'Hindu', 
        matches: (ag: string) => ag.includes('hindu') 
      };
    }
    if (sId === 'pab_buddha' || sName.includes('buddha') || sName.includes('budha')) {
      return { 
        isNonIslamReligion: true, 
        agamaLabel: 'Buddha', 
        matches: (ag: string) => ag.includes('buddha') || ag.includes('budha') 
      };
    }
    if (sName.includes('khonghucu')) {
      return { 
        isNonIslamReligion: true, 
        agamaLabel: 'Khonghucu', 
        matches: (ag: string) => ag.includes('khonghucu') || ag.includes('konghucu') 
      };
    }
    return null;
  }, [selectedSubjectId, selectedSubject]);

  // Filter students belonging to this rombel, with strict faith filtering for religious subjects other than Islam
  const rombelStudents = useMemo(() => {
    const inClass = students.filter(s => s.rombelId === selectedRombelId);
    if (religionRequirement?.isNonIslamReligion) {
      return inClass.filter(s => {
        const ag = (s.agama || '').toLowerCase();
        return religionRequirement.matches(ag);
      });
    }
    return inClass;
  }, [students, selectedRombelId, religionRequirement]);

  // Submission status of current subject & rombel
  const currentSubmissionStatus = useMemo<'draft' | 'terkirim' | 'perbaikan'>(() => {
    const list = Object.values(localGrades);
    if (list.length === 0) return 'draft';
    if (list.some(g => g.statusKirim === 'perbaikan')) return 'perbaikan';
    if (list.some(g => g.statusKirim === 'terkirim')) return 'terkirim';
    return 'draft';
  }, [localGrades]);

  const lastSubmittedTime = useMemo(() => {
    const list = Object.values(localGrades);
    const item = list.find(g => g.tanggalKirim);
    return item?.tanggalKirim ? new Date(item.tanggalKirim).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : null;
  }, [localGrades]);

  // Initialize or synchronize local editable state whenever filters change or external grades change
  useEffect(() => {
    const map: Record<string, StudentGrade> = {};
    rombelStudents.forEach(student => {
      const existingGrade = grades.find(
        g => g.studentId === student.id && g.subjectId === selectedSubjectId
      );

      if (existingGrade) {
        map[student.id] = { ...existingGrade };
      } else {
        // Create blank template
        map[student.id] = {
          id: `grade-${student.id}-${selectedSubjectId}`,
          studentId: student.id,
          subjectId: selectedSubjectId,
          rombelId: selectedRombelId,
          sumatifLM: {
            'tp-1': 0,
            'tp-2': 0,
            'tp-3': 0,
            'tp-4': 0
          },
          nilaiAkhirLM: 0,
          nonTesSTS: 0,
          tesSTS: 0,
          nilaiAkhirSTS: 0,
          deskripsiSTS: 'Menunjukkan penguasaan materi tengah semester yang baik.',
          nonTesSAS: 0,
          tesSAS: 0,
          nilaiAkhirSAS: 0,
          nilaiAkhirRapor: 0,
          deskripsiTertinggi: 'Menunjukkan pemahaman yang memadai terhadap materi yang diajarkan.',
          deskripsiTerendah: 'Perlu latihan lebih lanjut dalam materi yang belum dikuasai.',
          statusKetercapaian: 'Perlu Peningkatan',
          statusKirim: 'draft',
          updatedAt: new Date().toISOString()
        };
      }
    });
    setLocalGrades(map);
  }, [selectedRombelId, selectedSubjectId, grades, rombelStudents]);

  // Recalculate grade calculations for a single student (supporting both direct STS and SAS)
  const recalculateGrade = (current: StudentGrade): StudentGrade => {
    const lmValues = Object.values(current.sumatifLM).map(v => Number(v) || 0);
    const validLMs = lmValues.filter(v => v > 0);
    const avgLM = validLMs.length > 0 
      ? Math.round(validLMs.reduce((a, b) => a + b, 0) / validLMs.length) 
      : 0;

    // Sumatif Tengah Semester: Langsung Nilai Jadi STS (tidak perlu pembagian 60% 40%)
    const finalSTS = current.nilaiAkhirSTS !== undefined 
      ? Number(current.nilaiAkhirSTS) || 0 
      : (Number(current.tesSTS) || Number(current.nonTesSTS) || 0);

    // Sumatif Akhir Semester
    const nonTesSAS = Number(current.nonTesSAS) || 0;
    const tesSAS = Number(current.tesSAS) || 0;
    const avgSAS = (nonTesSAS > 0 || tesSAS > 0) ? Math.round((nonTesSAS + tesSAS) / 2) : 0;
    const finalGrade = Math.round((avgLM * 0.6) + (avgSAS * 0.4));
    
    const kktp = selectedSubject.kktp || 75;

    return {
      ...current,
      nilaiAkhirLM: avgLM,
      nilaiAkhirSTS: finalSTS,
      nilaiAkhirSAS: avgSAS,
      nilaiAkhirRapor: finalGrade,
      statusKetercapaian: finalGrade >= kktp ? 'Tercapai' : 'Perlu Peningkatan'
    };
  };

  // Handle score input change
  const handleScoreChange = (
    studentId: string, 
    field: 'lm' | 'nilaiAkhirSTS' | 'nonTesSTS' | 'tesSTS' | 'nonTesSAS' | 'tesSAS', 
    value: string, 
    tpKey?: string
  ) => {
    if (isLocked && isTeacherRole) return;

    const numValue = Math.min(100, Math.max(0, parseInt(value, 10) || 0));
    setLocalGrades(prev => {
      const current = { ...prev[studentId] };
      if (!current) return prev;

      if (field === 'nilaiAkhirSTS') {
        current.nilaiAkhirSTS = numValue;
      } else if (field === 'lm' && tpKey) {
        current.sumatifLM = {
          ...current.sumatifLM,
          [tpKey]: numValue
        };
      } else if (field === 'nonTesSTS') {
        current.nonTesSTS = numValue;
      } else if (field === 'tesSTS') {
        current.tesSTS = numValue;
      } else if (field === 'nonTesSAS') {
        current.nonTesSAS = numValue;
      } else if (field === 'tesSAS') {
        current.tesSAS = numValue;
      }

      const recalculated = recalculateGrade(current);
      recalculated.updatedAt = new Date().toISOString();

      // Immediately propagate to global state, localStorage, and Firestore cloud
      onUpdateGrades([recalculated]);

      return {
        ...prev,
        [studentId]: recalculated
      };
    });
  };

  // Auto-generate descriptions based on TPs and performance
  const handleAutoGenerateDescriptions = () => {
    setLocalGrades(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(studentId => {
        const item = next[studentId];
        const kktp = selectedSubject.kktp || 75;

        if (assessmentMode === 'tengah_semester') {
          // STS Description directly based on Nilai Jadi STS
          const stsScore = item.nilaiAkhirSTS ?? 0;
          const tp1 = currentTPs[0];

          let desc = '';
          if (stsScore >= kktp) {
            desc = tp1 
              ? `Menunjukkan penguasaan yang sangat baik dalam ${tp1.deskripsi} pada asesmen tengah semester.`
              : `Menunjukkan penguasaan materi tengah semester ${selectedSubject.nama} dengan sangat memuaskan.`;
          } else {
            desc = tp1
              ? `Perlu bimbingan dan peningkatan pemahaman dalam ${tp1.deskripsi} pada asesmen tengah semester.`
              : `Perlu meningkatkan ketekunan dan belajar mandiri pada materi tengah semester ${selectedSubject.nama}.`;
          }

          next[studentId] = {
            ...item,
            deskripsiSTS: desc,
            updatedAt: new Date().toISOString()
          };
        } else {
          // SAS Description
          const entries = Object.entries(item.sumatifLM);
          let maxVal = -1;
          let minVal = 999;
          let maxKey = '';
          let minKey = '';

          entries.forEach(([key, val]) => {
            if (val > maxVal) {
              maxVal = val;
              maxKey = key;
            }
            if (val < minVal && val > 0) {
              minVal = val;
              minKey = key;
            }
          });

          const maxTP = currentTPs[parseInt(maxKey.replace('tp-', '')) - 1] || currentTPs[0];
          const minTP = currentTPs[parseInt(minKey.replace('tp-', '')) - 1] || currentTPs[currentTPs.length - 1];

          const highDesc = maxTP
            ? `Menunjukkan penguasaan yang sangat baik dalam ${maxTP.deskripsi}.`
            : `Menunjukkan penguasaan kompetensi ${selectedSubject.nama} yang sangat baik.`;

          let lowDesc = '';
          if (item.nilaiAkhirRapor < kktp && minTP) {
            lowDesc = `Perlu bimbingan dan peningkatan intensif dalam ${minTP.deskripsi}.`;
          } else if (minTP && minVal < 80) {
            lowDesc = `Perlu peningkatan dalam ${minTP.deskripsi}.`;
          } else {
            lowDesc = `Pertahankan pencapaian kompetensi dalam seluruh materi ${selectedSubject.nama}.`;
          }

          next[studentId] = {
            ...item,
            deskripsiTertinggi: highDesc,
            deskripsiTerendah: lowDesc,
            updatedAt: new Date().toISOString()
          };
        }
      });

      onUpdateGrades(Object.values(next));
      return next;
    });

    setSaveSuccessMessage(
      assessmentMode === 'tengah_semester'
        ? 'Deskripsi capaian Sumatif Tengah Semester (STS) berhasil digenerate otomatis dan tersimpan.'
        : 'Deskripsi capaian rapor Sumatif Akhir Semester (SAS) berhasil digenerate otomatis dan tersimpan.'
    );
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  // Quick fill helper
  const handleQuickFill = (targetAvg: number) => {
    if (isLocked && isTeacherRole) return;

    setLocalGrades(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(studentId => {
        const item = next[studentId];
        const delta = Math.floor(Math.random() * 7) - 3;
        const val = Math.min(98, Math.max(68, targetAvg + delta));

        let updated: StudentGrade;
        if (assessmentMode === 'tengah_semester') {
          updated = {
            ...item,
            nilaiAkhirSTS: val,
            updatedAt: new Date().toISOString()
          };
        } else {
          updated = {
            ...item,
            sumatifLM: {
              'tp-1': val,
              'tp-2': val + 1,
              'tp-3': val - 1,
              'tp-4': val
            },
            nonTesSAS: val + 2,
            tesSAS: val - 1,
            updatedAt: new Date().toISOString()
          };
        }

        next[studentId] = recalculateGrade(updated);
      });

      onUpdateGrades(Object.values(next));
      return next;
    });
  };

  // Save changes to application state
  const handleSave = () => {
    const updatedList = Object.values(localGrades);
    onUpdateGrades(updatedList);
    setSaveSuccessMessage(
      `✓ Nilai ${assessmentMode === 'tengah_semester' ? 'Sumatif Tengah Semester (STS)' : 'Sumatif Akhir Semester (SAS)'} mata pelajaran ${selectedSubject.nama} berhasil disimpan dan langsung tampil pada seluruh modul e-Rapor.`
    );
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  // Kirim Nilai ke Rapor
  const handleKirimNilai = () => {
    const now = new Date().toISOString();
    const isPerbaikan = currentSubmissionStatus === 'perbaikan';
    const updatedList = Object.values(localGrades).map(g => ({
      ...g,
      statusKirim: 'terkirim' as const,
      tanggalKirim: now,
      updatedAt: now
    }));
    const newMap: Record<string, StudentGrade> = {};
    updatedList.forEach(g => {
      newMap[g.studentId] = g;
    });
    setLocalGrades(newMap);
    onUpdateGrades(updatedList);
    setSaveSuccessMessage(
      isPerbaikan
        ? `✓ PERBAIKAN NILAI ${selectedSubject.nama} untuk ${selectedRombel.nama} BERHASIL DIKIRIM KE RAPOR!`
        : `✓ NILAI ${selectedSubject.nama} untuk ${selectedRombel.nama} RESMI DIKIRIM KE RAPOR & WALI KELAS!`
    );
    setTimeout(() => setSaveSuccessMessage(null), 5000);
  };

  // Buka Status Perbaikan Nilai
  const handleBukaPerbaikan = () => {
    const now = new Date().toISOString();
    const updatedList = Object.values(localGrades).map(g => ({
      ...g,
      statusKirim: 'perbaikan' as const,
      updatedAt: now
    }));
    const newMap: Record<string, StudentGrade> = {};
    updatedList.forEach(g => {
      newMap[g.studentId] = g;
    });
    setLocalGrades(newMap);
    onUpdateGrades(updatedList);
    setSaveSuccessMessage(
      `⚠️ MODE PERBAIKAN NILAI AKTIF untuk ${selectedSubject.nama} (${selectedRombel.nama}). Silakan sesuaikan nilai kemudian klik "Kirim Nilai Perbaikan".`
    );
    setTimeout(() => setSaveSuccessMessage(null), 5000);
  };

  // Download Excel Format Template for Grades
  const handleDownloadExcelTemplate = () => {
    const isSTS = assessmentMode === 'tengah_semester';
    const templateRows = rombelStudents.map((s, idx) => {
      const g = localGrades[s.id];
      if (isSTS) {
        return {
          'No': idx + 1,
          'NISN': s.nisn,
          'Nama Peserta Didik': s.nama,
          'Nilai Jadi STS (0-100)': g?.nilaiAkhirSTS ?? 80,
          'Catatan Capaian STS': g?.deskripsiSTS ?? 'Menunjukkan penguasaan materi tengah semester yang baik.'
        };
      } else {
        return {
          'No': idx + 1,
          'NISN': s.nisn,
          'Nama Peserta Didik': s.nama,
          'TP 1 (0-100)': g?.sumatifLM['tp-1'] ?? 80,
          'TP 2 (0-100)': g?.sumatifLM['tp-2'] ?? 82,
          'TP 3 (0-100)': g?.sumatifLM['tp-3'] ?? 85,
          'TP 4 (0-100)': g?.sumatifLM['tp-4'] ?? 78,
          'Non Tes SAS (0-100)': g?.nonTesSAS ?? 85,
          'Tes Tulis SAS (0-100)': g?.tesSAS ?? 80
        };
      }
    });

    const infoRows = [
      { 'Parameter': 'Satuan Pendidikan', 'Keterangan': 'SMP Negeri 14 Tulang Bawang Barat' },
      { 'Parameter': 'Tahun Pelajaran', 'Keterangan': '2026/2027' },
      { 'Parameter': 'Semester', 'Keterangan': 'Ganjil' },
      { 'Parameter': 'Rombel / Kelas', 'Keterangan': selectedRombel.nama },
      { 'Parameter': 'Mata Pelajaran', 'Keterangan': `${selectedSubject.nama} (${selectedSubject.kode})` },
      { 'Parameter': 'KKTP Mata Pelajaran', 'Keterangan': `${selectedSubject.kktp} / 100` },
      { 'Parameter': 'Mode Penilaian', 'Keterangan': isSTS ? 'Sumatif Tengah Semester (STS)' : 'Sumatif Akhir Semester (SAS)' },
      { 'Parameter': 'Petunjuk Pengisian', 'Keterangan': 'Rentang nilai angka 0 - 100. Jangan mengubah susunan kolom NISN.' },
      { 'Parameter': 'Sistem Perhitungan', 'Keterangan': isSTS ? 'Nilai Jadi STS langsung (tanpa pembagian 60% 40%)' : '60% Rata-rata LM + 40% Nilai SAS' }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateRows);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 28 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 18 }
    ];

    const wsInfo = XLSX.utils.json_to_sheet(infoRows);
    wsInfo['!cols'] = [
      { wch: 22 },
      { wch: 55 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Format_Nilai');
    XLSX.utils.book_append_sheet(wb, wsInfo, 'Petunjuk_Penilaian');
    const modeName = isSTS ? 'STS' : 'SAS';
    XLSX.writeFile(wb, `Template_Nilai_${selectedSubject.kode}_${selectedRombel.nama.replace(/\s+/g, '_')}_${modeName}_2026-2027.xlsx`);
  };

  // Parse Excel file for grade import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        if (!data || data.length === 0) {
          setImportError('File Excel tidak berisi data yang dapat dibaca.');
          return;
        }

        const isSTS = assessmentMode === 'tengah_semester';
        const parsed: Array<{
          studentId: string;
          nisn: string;
          nama: string;
          tp1: number;
          tp2: number;
          tp3: number;
          tp4: number;
          nonTes: number;
          tes: number;
          nilaiSTS?: number;
          status: 'Cocok' | 'Siswa Tidak Ditemukan';
        }> = [];

        data.forEach((row, idx) => {
          const nisn = String(row['NISN'] || row['nisn'] || '').trim();
          const rawNama = String(row['Nama Peserta Didik'] || row['Nama Siswa'] || row['Nama'] || row['nama'] || '').trim();
          
          const matchedStudent = rombelStudents.find(s => 
            (nisn && s.nisn === nisn) || 
            (rawNama && s.nama.toLowerCase() === rawNama.toLowerCase())
          );

          const getScore = (keyPatterns: string[]) => {
            for (const k of Object.keys(row)) {
              const lowerK = k.toLowerCase();
              if (keyPatterns.some(p => lowerK.includes(p))) {
                const v = parseInt(row[k], 10);
                if (!isNaN(v)) return Math.min(100, Math.max(0, v));
              }
            }
            return 0;
          };

          const nilaiJadiSTS = isSTS 
            ? getScore(['nilai jadi sts', 'nilai sts', 'nilai akhir sts', 'sts', 'nilai']) 
            : 0;
          const tp1 = getScore(['tp 1', 'tp1']);
          const tp2 = getScore(['tp 2', 'tp2']);
          const tp3 = getScore(['tp 3', 'tp3']);
          const tp4 = getScore(['tp 4', 'tp4']);
          const nonTes = isSTS 
            ? getScore(['non tes sts', 'nontes sts', 'non tes', 'nontes']) 
            : getScore(['non tes sas', 'nontes sas', 'non tes', 'nontes']);
          const tes = isSTS 
            ? getScore(['tes tulis sts', 'tes sts', 'tes']) 
            : getScore(['tes tulis sas', 'tes sas', 'tes']);

          // If isSTS, use direct score if present, else fallback
          const stsFinal = isSTS ? (nilaiJadiSTS || tes || nonTes || 0) : 0;

          if (matchedStudent) {
            parsed.push({
              studentId: matchedStudent.id,
              nisn: matchedStudent.nisn,
              nama: matchedStudent.nama,
              tp1,
              tp2,
              tp3,
              tp4,
              nonTes,
              tes,
              nilaiSTS: stsFinal,
              status: 'Cocok'
            });
          } else {
            parsed.push({
              studentId: `unknown-${idx}`,
              nisn: nisn || '-',
              nama: rawNama || `Baris ${idx + 1}`,
              tp1,
              tp2,
              tp3,
              tp4,
              nonTes,
              tes,
              nilaiSTS: stsFinal,
              status: 'Siswa Tidak Ditemukan'
            });
          }
        });

        setPreviewGrades(parsed);
        setImportError(null);
      } catch (err: any) {
        console.error('Error parsing Excel:', err);
        setImportError('Gagal membaca file Excel. Pastikan format kolom sesuai dengan template.');
      }
    };

    reader.readAsBinaryString(file);
  };

  // Commit imported grades to localGrades
  const handleCommitImport = () => {
    const matchedItems = previewGrades.filter(p => p.status === 'Cocok');
    if (matchedItems.length === 0) {
      setImportError('Tidak ada data siswa yang cocok dengan rombel saat ini.');
      return;
    }

    const isSTS = assessmentMode === 'tengah_semester';

    setLocalGrades(prev => {
      const next = { ...prev };
      matchedItems.forEach(item => {
        const current = next[item.studentId] || {
          id: `grade-${item.studentId}-${selectedSubjectId}`,
          studentId: item.studentId,
          subjectId: selectedSubjectId,
          rombelId: selectedRombelId,
          sumatifLM: {},
          nilaiAkhirLM: 0,
          nonTesSTS: 0,
          tesSTS: 0,
          nilaiAkhirSTS: 0,
          deskripsiSTS: '',
          nonTesSAS: 0,
          tesSAS: 0,
          nilaiAkhirSAS: 0,
          nilaiAkhirRapor: 0,
          deskripsiTertinggi: '',
          deskripsiTerendah: '',
          statusKetercapaian: 'Perlu Peningkatan',
          updatedAt: new Date().toISOString()
        };

        let updated: StudentGrade;
        if (isSTS) {
          updated = {
            ...current,
            nilaiAkhirSTS: item.nilaiSTS || item.tes || item.nonTes || current.nilaiAkhirSTS || 0,
            updatedAt: new Date().toISOString()
          };
        } else {
          updated = {
            ...current,
            sumatifLM: {
              'tp-1': item.tp1 || (current.sumatifLM['tp-1'] || 0),
              'tp-2': item.tp2 || (current.sumatifLM['tp-2'] || 0),
              'tp-3': item.tp3 || (current.sumatifLM['tp-3'] || 0),
              'tp-4': item.tp4 || (current.sumatifLM['tp-4'] || 0)
            },
            nonTesSAS: item.nonTes || current.nonTesSAS || 0,
            tesSAS: item.tes || current.tesSAS || 0,
            updatedAt: new Date().toISOString()
          };
        }

        next[item.studentId] = recalculateGrade(updated);
      });
      return next;
    });

    setIsImportModalOpen(false);
    setPreviewGrades([]);
    setImportFileName(null);
    setSaveSuccessMessage(`Berhasil mengimpor nilai ${matchedItems.length} siswa dari file Excel ke form input. Silakan periksa hasil dan klik "Simpan Nilai".`);
    setTimeout(() => setSaveSuccessMessage(null), 5000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const isSTS = assessmentMode === 'tengah_semester';
    const headers = isSTS
      ? ['NISN', 'Nama Siswa', 'Nilai Jadi STS', 'KKTP', 'Status Ketercapaian', 'Capaian Tengah Semester']
      : ['NISN', 'Nama Siswa', 'TP 1', 'TP 2', 'TP 3', 'TP 4', 'Nilai Akhir LM', 'Non Tes SAS', 'Tes SAS', 'Nilai Akhir Rapor', 'Capaian Tertinggi', 'Capaian Terendah'];

    const rows = rombelStudents.map(student => {
      const g = localGrades[student.id];
      if (isSTS) {
        const stsScore = g?.nilaiAkhirSTS || 0;
        const isPass = stsScore >= (selectedSubject.kktp || 75);
        return [
          `"${student.nisn}"`,
          `"${student.nama}"`,
          stsScore,
          selectedSubject.kktp || 75,
          `"${isPass ? 'Tercapai' : 'Perlu Peningkatan'}"`,
          `"${(g?.deskripsiSTS || '').replace(/"/g, '""')}"`
        ].join(',');
      } else {
        return [
          `"${student.nisn}"`,
          `"${student.nama}"`,
          g?.sumatifLM['tp-1'] || 0,
          g?.sumatifLM['tp-2'] || 0,
          g?.sumatifLM['tp-3'] || 0,
          g?.sumatifLM['tp-4'] || 0,
          g?.nilaiAkhirLM || 0,
          g?.nonTesSAS || 0,
          g?.tesSAS || 0,
          g?.nilaiAkhirRapor || 0,
          `"${(g?.deskripsiTertinggi || '').replace(/"/g, '""')}"`,
          `"${(g?.deskripsiTerendah || '').replace(/"/g, '""')}"`
        ].join(',');
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const modeName = isSTS ? 'STS_TengahSemester' : 'SAS_AkhirSemester';
    link.setAttribute('download', `Nilai_${modeName}_${selectedSubject.kode}_${selectedRombel.nama}_SMPN14Tubaba.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isEditable = !isLocked || currentUser.role === 'admin' || currentUser.role === 'kepala_sekolah';

  return (
    <div className="space-y-5">
      {/* Page Title & Filter Bar */}
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Input Nilai Sumatif Kurikulum Merdeka
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mendukung penginputan Sumatif Tengah Semester (STS) dan Sumatif Akhir Semester (SAS)
          </p>
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Rombel Selector */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Rombel / Kelas
            </label>
            <select
              value={selectedRombelId}
              onChange={(e) => setSelectedRombelId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {rombels.map(r => (
                <option key={r.id} value={r.id}>
                  {r.nama} ({r.fase})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Mata Pelajaran
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs cursor-pointer"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.kode})
                </option>
              ))}
            </select>
          </div>

          {/* KKTP Input Field (Kriteria Ketercapaian Tujuan Pembelajaran) */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Batas KKTP Mapel
            </label>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <input
                type="number"
                min={50}
                max={100}
                disabled={!isEditable}
                value={selectedSubject.kktp || 75}
                onChange={(e) => handleKKTPChange(e.target.value)}
                className="w-10 text-center font-mono font-bold text-xs bg-transparent focus:outline-none text-blue-900"
                title="Sesuaikan nilai Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) untuk mata pelajaran ini"
              />
              <span className="text-[10px] font-semibold text-slate-400">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODE ASSESSMENT SWITCHER (FITUR PILIHAN INPUT STS vs SAS) */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-xs font-bold text-slate-900">Pilih Periode Penilaian:</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setAssessmentMode('tengah_semester')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              assessmentMode === 'tengah_semester'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Sumatif Tengah Semester (STS)</span>
          </button>

          <button
            type="button"
            onClick={() => setAssessmentMode('akhir_semester')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              assessmentMode === 'akhir_semester'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Sumatif Akhir Semester (SAS / Rapor)</span>
          </button>
        </div>
      </div>

      {/* Mode Information Banner */}
      {assessmentMode === 'tengah_semester' ? (
        <div className="bg-gradient-to-r from-blue-50/90 to-sky-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-center justify-between text-xs text-blue-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900">Mode Aktif: Sumatif Tengah Semester (STS)</span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Penginputan Nilai Jadi STS langsung per siswa tanpa perlu pembagian bobot 60% : 40%.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-1 bg-blue-100 text-blue-900 rounded-lg font-bold text-[10.5px] border border-blue-200">
            Nilai Jadi STS
          </span>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-indigo-50/90 to-purple-50/70 border border-indigo-200/80 rounded-2xl p-4 flex items-center justify-between text-xs text-indigo-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900">Mode Aktif: Sumatif Akhir Semester (SAS / SAT)</span>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Fokus laporan akhir: Menilai seluruh TP (TP 1 s.d 4), Tes & Non-Tes SAS, dan perumusan deskripsi capaian rapor.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-2.5 py-1 bg-indigo-100 text-indigo-900 rounded-lg font-bold text-[10.5px] border border-indigo-200">
            Bobot: 60% LM + 40% SAS
          </span>
        </div>
      )}

      {/* Religion Filter Banner for non-Islamic religious subjects */}
      {religionRequirement?.isNonIslamReligion && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold text-sm">
              ✝️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">
                  Filter Khusus Peserta Didik Beragama {religionRequirement.agamaLabel}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                  {rombelStudents.length} Siswa Terdaftar
                </span>
              </div>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Sesuai Kurikulum Merdeka Kemdikbud, penginputan nilai mata pelajaran ini <strong>hanya menampilkan peserta didik yang memeluk agama {religionRequirement.agamaLabel}</strong> di {selectedRombel.nama}. Siswa pemeluk agama lain tidak dicantumkan di sini.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lock Warning if locked */}
      {!isEditable && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-center gap-3 text-xs text-amber-800">
          <Lock className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <p className="font-bold">Penginputan Nilai Sedang Dikunci oleh Administrator</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Hubungi Kepala Sekolah atau Administrator untuk membuka penguncian jika ada perbaikan nilai.
            </p>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {saveSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-200 shadow-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{saveSuccessMessage}</span>
        </div>
      )}

      {/* Status Pengiriman & Sinkronisasi Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-700">Status Penilaian:</span>
            {currentSubmissionStatus === 'terkirim' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                SUDAH DIKIRIM KE RAPOR {lastSubmittedTime && `(${lastSubmittedTime})`}
              </span>
            ) : currentSubmissionStatus === 'perbaikan' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg font-bold text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                DALAM PERBAIKAN NILAI (MODE EDIT)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg font-semibold text-[11px]">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                DRAFT (BELUM DIKIRIM)
              </span>
            )}
          </div>

          <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-500 border-l border-slate-200 pl-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Tersimpan & tersinkron otomatis ke seluruh modul</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentSubmissionStatus === 'terkirim' && isEditable && (
            <button
              type="button"
              onClick={handleBukaPerbaikan}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title="Buka akses pengeditan untuk merevisi nilai yang sudah dikirim"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
              <span>Buka Status Perbaikan</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleKirimNilai}
            disabled={!isEditable}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer ${
              currentSubmissionStatus === 'terkirim'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-blue-500/20'
            }`}
            title="Kirim nilai resmi ke buku rapor dan wali kelas"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{currentSubmissionStatus === 'perbaikan' ? 'Kirim Nilai Perbaikan' : currentSubmissionStatus === 'terkirim' ? 'Kirim Ulang Nilai' : 'Kirim Nilai ke Rapor'}</span>
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100/70 p-3 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAutoGenerateDescriptions}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-blue-700 shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Generate Deskripsi Otomatis</span>
          </button>

          {isEditable && (
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleQuickFill(85)}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-[11px] font-medium text-slate-700 cursor-pointer"
                title="Isi simulasi nilai rata-rata 85"
              >
                Isi Simulasi 85
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadExcelTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-800 shadow-2xs transition-colors cursor-pointer"
            title={`Unduh format file Excel pengisian nilai ${selectedSubject.nama} (${assessmentMode === 'tengah_semester' ? 'STS' : 'SAS'})`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Unduh Template Excel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPreviewGrades([]);
              setImportFileName(null);
              setImportError(null);
              setIsImportModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Impor nilai langsung dari file Microsoft Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Impor Nilai Excel</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV ({assessmentMode === 'tengah_semester' ? 'STS' : 'SAS'})</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!isEditable}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Nilai</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: TABEL INPUT SUMATIF TENGAH SEMESTER (STS) - NILAI JADI */}
      {/* ============================================================== */}
      {assessmentMode === 'tengah_semester' && (
        <div className="space-y-3">
          {/* Info Banner: Direct STS Score */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full font-bold bg-blue-600 text-white text-[10px]">
                SISTEM NILAI JADI
              </span>
              <span className="font-medium">
                Input Nilai Sumatif Tengah Semester (STS) langsung menggunakan <strong>Nilai Jadi (0 - 100)</strong> tanpa pembagian bobot 60% dan 40%.
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold text-blue-800">
              <span>KKTP Mapel: <strong className="font-mono text-xs">{selectedSubject.kktp || 75}</strong></span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white border-b border-slate-700">
                    <th className="py-3 px-3 w-12 text-center font-bold">No</th>
                    <th className="py-3 px-4 min-w-[220px] font-bold">Nama Peserta Didik</th>
                    <th className="py-3 px-4 w-44 text-center font-bold bg-blue-900/80 border-l border-r border-slate-700">
                      Nilai Jadi STS (0 - 100)
                    </th>
                    <th className="py-3 px-4 w-36 text-center font-bold bg-slate-900/60">
                      Status KKTP ({selectedSubject.kktp || 75})
                    </th>
                    <th className="py-3 px-4 min-w-[280px] font-bold border-l border-slate-700">
                      Capaian Kompetensi Tengah Semester
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {rombelStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                          <Users className="w-8 h-8 text-slate-400" />
                          <p className="font-semibold text-slate-700">
                            {religionRequirement?.isNonIslamReligion 
                              ? `Tidak ada peserta didik beragama ${religionRequirement.agamaLabel} di ${selectedRombel?.nama || 'kelas ini'}`
                              : `Belum ada peserta didik di ${selectedRombel?.nama || 'kelas ini'}`
                            }
                          </p>
                          <p className="text-xs text-slate-500">
                            {religionRequirement?.isNonIslamReligion
                              ? `Mata pelajaran ${selectedSubject.nama} hanya ditempuh oleh peserta didik yang beragama ${religionRequirement.agamaLabel}. Siswa di rombel ini menempuh mapel agama yang sesuai dengan keyakinannya.`
                              : `Silakan tambahkan data peserta didik melalui menu Data Siswa atau Impor File Excel.`
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rombelStudents.map((student, idx) => {
                    const grade = localGrades[student.id];
                    const finalSTS = grade?.nilaiAkhirSTS ?? 0;
                    const isPassing = finalSTS >= (selectedSubject.kktp || 75);

                    return (
                      <tr key={student.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3 px-3 text-center font-mono text-slate-500 font-medium">
                          {idx + 1}
                        </td>

                        {/* Student Name */}
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900 text-xs">{student.nama}</p>
                          <p className="text-[10.5px] text-slate-500 font-mono mt-0.5">NISN: {student.nisn}</p>
                        </td>

                        {/* Input Nilai Jadi STS */}
                        <td className="py-2.5 px-4 text-center bg-blue-50/20 border-l border-r border-slate-100">
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              disabled={!isEditable}
                              value={grade?.nilaiAkhirSTS !== undefined && grade?.nilaiAkhirSTS !== 0 ? grade.nilaiAkhirSTS : (grade?.nilaiAkhirSTS === 0 ? '0' : '')}
                              placeholder="0 - 100"
                              onChange={(e) => handleScoreChange(student.id, 'nilaiAkhirSTS', e.target.value)}
                              className={`w-24 py-2 px-3 text-center font-mono font-bold text-base rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                isPassing 
                                  ? 'bg-white border-blue-400 text-blue-900 focus:border-blue-600 shadow-2xs' 
                                  : finalSTS > 0 
                                    ? 'bg-rose-50 border-rose-300 text-rose-900 focus:border-rose-500' 
                                    : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-500'
                              }`}
                            />
                            <span className="text-[11px] font-semibold text-slate-400">/ 100</span>
                          </div>
                        </td>

                        {/* Status KKTP */}
                        <td className="py-3 px-4 text-center">
                          {finalSTS > 0 ? (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                              isPassing 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}>
                              {isPassing ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-700" />}
                              <span>{isPassing ? 'Tercapai' : 'Belum Tercapai'}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Belum Diisi</span>
                          )}
                        </td>

                        {/* Deskripsi Capaian STS */}
                        <td className="py-3 px-4 border-l border-slate-100">
                          <div className="space-y-1.5 text-xs">
                            <p className="line-clamp-2 text-slate-700 leading-relaxed font-medium">
                              {grade?.deskripsiSTS || 'Menunjukkan pencapaian kompetensi tengah semester yang baik.'}
                            </p>
                            <button
                              type="button"
                              onClick={() => setEditingDeskripsiFor(student.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Edit Catatan STS</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: TABEL INPUT SUMATIF AKHIR SEMESTER (SAS / RAPOR) */}
      {/* ============================================================== */}
      {assessmentMode === 'akhir_semester' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800 text-white border-b border-slate-700">
                  <th rowSpan={2} className="py-3 px-3 w-10 text-center font-bold">No</th>
                  <th rowSpan={2} className="py-3 px-3 min-w-[180px] font-bold">Nama Peserta Didik</th>
                  <th colSpan={4} className="py-2 px-2 text-center font-bold border-l border-r border-slate-700 bg-slate-900/40">
                    Sumatif Lingkup Materi (LM 1 s.d 4)
                  </th>
                  <th rowSpan={2} className="py-3 px-2 text-center font-bold bg-slate-900/60 w-16">
                    Rerata LM (60%)
                  </th>
                  <th colSpan={2} className="py-2 px-2 text-center font-bold border-l border-r border-slate-700 bg-slate-900/30">
                    Sumatif Akhir Sem. (SAS)
                  </th>
                  <th rowSpan={2} className="py-3 px-2 text-center font-bold bg-slate-900/60 w-16">
                    Rerata SAS (40%)
                  </th>
                  <th rowSpan={2} className="py-3 px-3 text-center font-bold bg-blue-800 text-white w-20">
                    Nilai Akhir
                  </th>
                  <th rowSpan={2} className="py-3 px-3 min-w-[260px] font-bold">
                    Capaian Kompetensi & Deskripsi Rapor
                  </th>
                </tr>
                <tr className="bg-slate-700 text-slate-200 border-b border-slate-600 text-[11px]">
                  <th className="py-1 px-2 text-center border-l border-slate-600 w-14" title={currentTPs[0]?.deskripsi || 'TP 1'}>TP 1</th>
                  <th className="py-1 px-2 text-center w-14" title={currentTPs[1]?.deskripsi || 'TP 2'}>TP 2</th>
                  <th className="py-1 px-2 text-center w-14" title={currentTPs[2]?.deskripsi || 'TP 3'}>TP 3</th>
                  <th className="py-1 px-2 text-center border-r border-slate-600 w-14" title={currentTPs[3]?.deskripsi || 'TP 4'}>TP 4</th>
                  <th className="py-1 px-2 text-center border-l border-slate-600 w-16">Non-Tes</th>
                  <th className="py-1 px-2 text-center border-r border-slate-600 w-16">Tes Tulis</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {rombelStudents.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
                        <Users className="w-8 h-8 text-slate-400" />
                        <p className="font-semibold text-slate-700">
                          {religionRequirement?.isNonIslamReligion 
                            ? `Tidak ada peserta didik beragama ${religionRequirement.agamaLabel} di ${selectedRombel?.nama || 'kelas ini'}`
                            : `Belum ada peserta didik di ${selectedRombel?.nama || 'kelas ini'}`
                          }
                        </p>
                        <p className="text-xs text-slate-500">
                          {religionRequirement?.isNonIslamReligion
                            ? `Mata pelajaran ${selectedSubject.nama} hanya ditempuh oleh peserta didik yang beragama ${religionRequirement.agamaLabel}. Di rombel ini seluruh siswa menempuh mapel agama yang sesuai dengan agamanya.`
                            : `Silakan tambahkan data peserta didik melalui menu Data Siswa atau Impor File Excel.`
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rombelStudents.map((student, idx) => {
                  const grade = localGrades[student.id];
                  const isPassing = (grade?.nilaiAkhirRapor || 0) >= (selectedSubject.kktp || 75);

                  return (
                    <tr key={student.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500 font-medium">
                        {idx + 1}
                      </td>

                      {/* Student Name */}
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-slate-900">{student.nama}</p>
                        <p className="text-[10px] text-slate-500 font-mono">NISN: {student.nisn}</p>
                      </td>

                      {/* TP 1 */}
                      <td className="py-1.5 px-1 text-center border-l border-slate-100">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          disabled={!isEditable}
                          value={grade?.sumatifLM['tp-1'] ?? ''}
                          onChange={(e) => handleScoreChange(student.id, 'lm', e.target.value, 'tp-1')}
                          className="w-12 py-1 text-center font-mono font-medium text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-blue-600 focus:outline-none"
                        />
                      </td>

                      {/* TP 2 */}
                      <td className="py-1.5 px-1 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          disabled={!isEditable}
                          value={grade?.sumatifLM['tp-2'] ?? ''}
                          onChange={(e) => handleScoreChange(student.id, 'lm', e.target.value, 'tp-2')}
                          className="w-12 py-1 text-center font-mono font-medium text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-blue-600 focus:outline-none"
                        />
                      </td>

                      {/* TP 3 */}
                      <td className="py-1.5 px-1 text-center">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          disabled={!isEditable}
                          value={grade?.sumatifLM['tp-3'] ?? ''}
                          onChange={(e) => handleScoreChange(student.id, 'lm', e.target.value, 'tp-3')}
                          className="w-12 py-1 text-center font-mono font-medium text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-blue-600 focus:outline-none"
                        />
                      </td>

                      {/* TP 4 */}
                      <td className="py-1.5 px-1 text-center border-r border-slate-100">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          disabled={!isEditable}
                          value={grade?.sumatifLM['tp-4'] ?? ''}
                          onChange={(e) => handleScoreChange(student.id, 'lm', e.target.value, 'tp-4')}
                          className="w-12 py-1 text-center font-mono font-medium text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-blue-600 focus:outline-none"
                        />
                      </td>

                      {/* Rata-rata LM */}
                      <td className="py-2.5 px-2 text-center font-mono font-semibold text-slate-700 bg-slate-50/70">
                        {grade?.nilaiAkhirLM || 0}
                      </td>

                      {/* Non-Tes SAS */}
                      <td className="py-1.5 px-1 text-center border-l border-slate-100">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          disabled={!isEditable}
                          value={grade?.nonTesSAS ?? ''}
                          onChange={(e) => handleScoreChange(student.id, 'nonTesSAS', e.target.value)}
                          className="w-12 py-1 text-center font-mono font-medium text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-blue-600 focus:outline-none"
                        />
                      </td>

                      {/* Tes SAS */}
                      <td className="py-1.5 px-1 text-center border-r border-slate-100">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          disabled={!isEditable}
                          value={grade?.tesSAS ?? ''}
                          onChange={(e) => handleScoreChange(student.id, 'tesSAS', e.target.value)}
                          className="w-12 py-1 text-center font-mono font-medium text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:border-blue-600 focus:outline-none"
                        />
                      </td>

                      {/* Rata-rata SAS */}
                      <td className="py-2.5 px-2 text-center font-mono font-semibold text-slate-700 bg-slate-50/70">
                        {grade?.nilaiAkhirSAS || 0}
                      </td>

                      {/* Nilai Akhir Rapor */}
                      <td className={`py-2.5 px-3 text-center font-mono font-bold text-sm ${
                        isPassing ? 'bg-blue-50 text-blue-900' : 'bg-rose-50 text-rose-800'
                      }`}>
                        {grade?.nilaiAkhirRapor || 0}
                      </td>

                      {/* Deskripsi Capaian Kompetensi */}
                      <td className="py-2 px-3">
                        <div className="space-y-1.5 text-[11px]">
                          <div className="text-slate-800">
                            <span className="font-semibold text-emerald-700 block">Capaian Tertinggi:</span>
                            <p className="line-clamp-2 text-slate-700">{grade?.deskripsiTertinggi}</p>
                          </div>
                          <div className="text-slate-800">
                            <span className="font-semibold text-amber-700 block">Perlu Peningkatan:</span>
                            <p className="line-clamp-2 text-slate-600">{grade?.deskripsiTerendah}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEditingDeskripsiFor(student.id)}
                            className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Kustomisasi Kalimat Deskripsi</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Edit Deskripsi Siswa */}
      {editingDeskripsiFor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              {assessmentMode === 'tengah_semester' 
                ? 'Ubah Kalimat Capaian Sumatif Tengah Semester' 
                : 'Ubah Kalimat Capaian Kompetensi Rapor Akhir Semester'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Siswa: <strong>{students.find(s => s.id === editingDeskripsiFor)?.nama}</strong> · {selectedSubject.nama}
            </p>

            <div className="mt-4 space-y-4 text-xs">
              {assessmentMode === 'tengah_semester' ? (
                <div>
                  <label className="block font-semibold text-blue-800 mb-1">
                    Deskripsi Capaian Tengah Semester:
                  </label>
                  <textarea
                    rows={3}
                    value={localGrades[editingDeskripsiFor]?.deskripsiSTS || ''}
                    onChange={(e) => {
                      const text = e.target.value;
                      setLocalGrades(prev => ({
                        ...prev,
                        [editingDeskripsiFor]: {
                          ...prev[editingDeskripsiFor],
                          deskripsiSTS: text
                        }
                      }));
                    }}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block font-semibold text-emerald-800 mb-1">
                      Deskripsi Capaian Tertinggi:
                    </label>
                    <textarea
                      rows={3}
                      value={localGrades[editingDeskripsiFor]?.deskripsiTertinggi || ''}
                      onChange={(e) => {
                        const text = e.target.value;
                        setLocalGrades(prev => ({
                          ...prev,
                          [editingDeskripsiFor]: {
                            ...prev[editingDeskripsiFor],
                            deskripsiTertinggi: text
                          }
                        }));
                      }}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-amber-800 mb-1">
                      Deskripsi Perlu Peningkatan:
                    </label>
                    <textarea
                      rows={3}
                      value={localGrades[editingDeskripsiFor]?.deskripsiTerendah || ''}
                      onChange={(e) => {
                        const text = e.target.value;
                        setLocalGrades(prev => ({
                          ...prev,
                          [editingDeskripsiFor]: {
                            ...prev[editingDeskripsiFor],
                            deskripsiTerendah: text
                          }
                        }));
                      }}
                      className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingDeskripsiFor(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL IMPOR NILAI EXCEL (STS / SAS) */}
      {/* ============================================================== */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Impor Nilai {assessmentMode === 'tengah_semester' ? 'Sumatif Tengah Semester (STS)' : 'Sumatif Akhir Semester (SAS)'} dari Excel
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mata Pelajaran: <strong>{selectedSubject.nama}</strong> ({selectedSubject.kode}) · Kelas: <strong>{selectedRombel.nama}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 flex-1 overflow-y-auto pr-1 text-xs">
              {importError && (
                <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Step 1: Download format template */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Download className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-900">1. Unduh Format Template Excel</p>
                    <p className="text-[11px] text-emerald-700">
                      File Excel otomatis terisi daftar {rombelStudents.length} siswa di {selectedRombel.nama} dan kolom nilai sesuai format {assessmentMode === 'tengah_semester' ? 'STS' : 'SAS'}.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadExcelTemplate}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs shrink-0 shadow-2xs cursor-pointer"
                >
                  Unduh Format Nilai Excel
                </button>
              </div>

              {/* Step 2: Upload file */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  2. Unggah File Excel yang Telah Diisi Nilai (.xlsx / .xls / .csv)
                </label>
                <input
                  ref={importFileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-slate-300 rounded-lg p-1"
                />
                {importFileName && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    File terpilih: {importFileName}
                  </p>
                )}
              </div>

              {/* Step 3: Preview */}
              {previewGrades.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden mt-3">
                  <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      3. Pratinjau Nilai ({previewGrades.filter(p => p.status === 'Cocok').length} Siswa Cocok dari {previewGrades.length} baris)
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Siap Diterapkan
                    </span>
                  </div>

                  <div className="max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 sticky top-0">
                        <tr>
                          <th className="py-2 px-2.5 w-8 text-center">No</th>
                          <th className="py-2 px-3">Nama Siswa & NISN</th>
                          {assessmentMode === 'tengah_semester' ? (
                            <th className="py-2 px-2 text-center w-28 bg-blue-100/70 text-blue-900 font-bold">Nilai Jadi STS</th>
                          ) : (
                            <>
                              <th className="py-2 px-2 text-center w-14">TP 1</th>
                              <th className="py-2 px-2 text-center w-14">TP 2</th>
                              <th className="py-2 px-2 text-center w-14">TP 3</th>
                              <th className="py-2 px-2 text-center w-14">TP 4</th>
                              <th className="py-2 px-2 text-center w-16">Non-Tes</th>
                              <th className="py-2 px-2 text-center w-16">Tes Tulis</th>
                            </>
                          )}
                          <th className="py-2 px-2 text-center w-24">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {previewGrades.map((p, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-2.5 text-center font-mono text-slate-500">{idx + 1}</td>
                            <td className="py-2 px-3">
                              <p className="font-semibold text-slate-900">{p.nama}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{p.nisn}</p>
                            </td>
                            {assessmentMode === 'tengah_semester' ? (
                              <td className="py-2 px-2 text-center font-mono font-bold text-sm text-blue-900 bg-blue-50/50">
                                {p.nilaiSTS || p.tes || p.nonTes || 0}
                              </td>
                            ) : (
                              <>
                                <td className="py-2 px-2 text-center font-mono font-bold text-blue-900">{p.tp1}</td>
                                <td className="py-2 px-2 text-center font-mono font-bold text-blue-900">{p.tp2}</td>
                                <td className="py-2 px-2 text-center font-mono font-bold text-blue-900">{p.tp3}</td>
                                <td className="py-2 px-2 text-center font-mono font-bold text-blue-900">{p.tp4}</td>
                                <td className="py-2 px-2 text-center font-mono text-slate-700">{p.nonTes}</td>
                                <td className="py-2 px-2 text-center font-mono text-slate-700">{p.tes}</td>
                              </>
                            )}
                            <td className="py-2 px-2 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                p.status === 'Cocok' 
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={previewGrades.filter(p => p.status === 'Cocok').length === 0}
                onClick={handleCommitImport}
                className="px-5 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileCheck className="w-4 h-4" />
                <span>Terapkan {previewGrades.filter(p => p.status === 'Cocok').length} Nilai ke Form</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
