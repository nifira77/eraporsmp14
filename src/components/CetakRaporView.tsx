import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  ERaporState, 
  Student, 
  StudentGrade,
  AssessmentMode
} from '../types/erapor';
import { 
  Printer, 
  Download, 
  FileText, 
  Users, 
  CheckCircle, 
  Eye, 
  ChevronRight,
  School,
  TableProperties,
  BookOpen,
  Clock,
  Award,
  Layers,
  Calendar,
  FileSpreadsheet,
  FileDown
} from 'lucide-react';

interface CetakRaporViewProps {
  state: ERaporState;
}

type PrintMode = 'rapor_nilai' | 'cover' | 'identitas' | 'leger';
type PrintTarget = 'single' | 'all';

export const CetakRaporView: React.FC<CetakRaporViewProps> = ({ state }) => {
  const { 
    school, 
    students, 
    subjects, 
    grades, 
    attendances, 
    studentExtracurriculars, 
    extracurriculars, 
    notes, 
    achievements,
    rombels,
    users = [] 
  } = state;

  // Helpers to resolve teacher and principal data directly from Data Guru (state.users)
  // Ensures 100% exact match including upper/lower case letters, dots, and academic degrees
  const getKepsekInfo = () => {
    const matched = users.find(u => u.role === 'admin' || u.role === 'kepala_sekolah');
    return {
      nama: matched?.name || school.kepalaSekolah,
      nip: matched?.nip || school.nipKepalaSekolah
    };
  };

  const getWaliInfo = (rombelId?: string, fallbackName?: string, fallbackNip?: string) => {
    const matched = users.find(u => u.role === 'wali_kelas' && u.rombelId === rombelId);
    return {
      nama: matched?.name || fallbackName || '-',
      nip: matched?.nip || fallbackNip || '-'
    };
  };

  // Selected filters and print configurations
  // Selected class / rombel for printing
  const [selectedRombelId, setSelectedRombelId] = useState<string>(() => {
    if (state.currentUser?.rombelId && rombels.some(r => r.id === state.currentUser.rombelId)) {
      return state.currentUser.rombelId;
    }
    return rombels[0]?.id || '7.1';
  });

  const selectedRombel = rombels.find(r => r.id === selectedRombelId) || rombels[0];

  // Filter students based on selected class / rombel
  const classStudents: Student[] = useMemo(() => {
    const list = students.filter(s => s.rombelId === selectedRombelId);
    if (list.length === 0 && students.length > 0 && selectedRombelId === (rombels[0]?.id || '7.1')) {
      return students;
    }
    return list;
  }, [students, selectedRombelId, rombels]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    const list = students.filter(s => s.rombelId === (state.currentUser?.rombelId || rombels[0]?.id || '7.1'));
    return list[0]?.id || students[0]?.id || '';
  });

  // Keep selected student synced when class changes
  useEffect(() => {
    if (!classStudents.some(s => s.id === selectedStudentId)) {
      if (classStudents.length > 0) {
        setSelectedStudentId(classStudents[0].id);
      }
    }
  }, [classStudents, selectedStudentId]);

  const selectedStudent = classStudents.find(s => s.id === selectedStudentId) || classStudents[0] || students[0];

  const [printMode, setPrintMode] = useState<PrintMode>('rapor_nilai');
  const [raporPeriod, setRaporPeriod] = useState<AssessmentMode>('akhir_semester');
  const [printTarget, setPrintTarget] = useState<PrintTarget>('single');
  type SheetLayout = '2_lembar' | '3_lembar' | '1_lembar';
  const [sheetLayout, setSheetLayout] = useState<SheetLayout>('2_lembar');
  const [footerFormat, setFooterFormat] = useState<'hal' | 'hal_total' | 'slash_num'>('hal');
  type CoverSection = 'semua' | 'sampul_luar' | 'identitas_sekolah';
  const [coverSection, setCoverSection] = useState<CoverSection>('semua');

  const getStudentFooterText = (studentName: string, pageNum: number, totalPages: number) => {
    if (footerFormat === 'hal_total') {
      return `${studentName} / Hal. ${pageNum} dari ${totalPages}`;
    }
    if (footerFormat === 'slash_num') {
      return `${studentName} / ${pageNum}`;
    }
    return `${studentName} / Hal. ${pageNum}`;
  };

  // List of students to render
  const targetStudents = printTarget === 'all' ? classStudents : (selectedStudent ? [selectedStudent] : []);

  // Handler for direct browser print
  const handlePrint = () => {
    window.print();
  };

  // Dynamic label for the primary print action button based on selected class & target
  const getPrintButtonLabel = () => {
    const rombelName = selectedRombel?.nama || 'Kelas';
    const totalCount = classStudents.length;

    if (printMode === 'leger') {
      return `Cetak PDF Leger ${rombelName}`;
    }

    let docName = 'Rapor';
    if (printMode === 'cover') {
      docName = coverSection === 'sampul_luar' 
        ? 'Sampul Depan Rapor' 
        : coverSection === 'identitas_sekolah' 
        ? 'Identitas Satuan Pendidikan' 
        : 'Sampul Lengkap Rapor';
    }
    if (printMode === 'identitas') docName = 'Biodata Siswa';

    if (printTarget === 'all') {
      return `Cetak ${docName} ${rombelName} (Semua Siswa - ${totalCount})`;
    }

    const fullName = selectedStudent?.nama || 'Siswa';
    const shortName = fullName.length > 20 ? fullName.split(' ').slice(0, 2).join(' ') : fullName;
    return `Cetak ${docName} ${rombelName} (${shortName})`;
  };

  // Download Leger in Microsoft Excel format (.xlsx)
  const handleDownloadLegerExcel = () => {
    // 1. Calculate totals and rankings for students in this class
    const studentTotals = classStudents.map(student => {
      const studentSubjs = subjects.filter(subj => {
        const isReligious = ['pai', 'pak_kristen', 'pak_katolik', 'pah_hindu', 'pab_buddha'].includes(subj.id);
        if (!isReligious) return true;
        const ag = (student.agama || '').toLowerCase();
        if (subj.id === 'pai') return ag.includes('islam');
        if (subj.id === 'pak_kristen') return ag.includes('protestan') || (ag.includes('kristen') && !ag.includes('katolik'));
        if (subj.id === 'pak_katolik') return ag.includes('katolik') || ag.includes('khatolik');
        if (subj.id === 'pah_hindu') return ag.includes('hindu');
        if (subj.id === 'pab_buddha') return ag.includes('buddha') || ag.includes('budha');
        return false;
      });

      const effectiveSubjs = studentSubjs.length > 0 ? studentSubjs : subjects.filter(s => !['pak_kristen', 'pak_katolik', 'pah_hindu', 'pab_buddha'].includes(s.id));

      const total = effectiveSubjs.reduce((sum, subj) => {
        const g = grades.find(item => item.studentId === student.id && item.subjectId === subj.id);
        const val = raporPeriod === 'tengah_semester' 
          ? (g?.nilaiAkhirSTS ?? g?.nilaiAkhirRapor ?? 0)
          : (g?.nilaiAkhirRapor ?? 0);
        return sum + val;
      }, 0);
      const avg = parseFloat((total / effectiveSubjs.length).toFixed(1));
      return { student, total, avg, effectiveSubjs };
    });

    const sorted = [...studentTotals].sort((a, b) => b.total - a.total);
    const rankMap: Record<string, number> = {};
    sorted.forEach((item, index) => {
      rankMap[item.student.id] = index + 1;
    });

    // 2. Prepare Leger Sheet rows
    const rows = classStudents.map((student, idx) => {
      const studentRecord = studentTotals.find(s => s.student.id === student.id);
      const att = attendances.find(a => a.studentId === student.id) || { sakit: 0, izin: 0, alpa: 0 };

      const rowObj: Record<string, any> = {
        'No': idx + 1,
        'NISN': student.nisn,
        'NIS': student.nis || '-',
        'Nama Peserta Didik': student.nama,
        'JK': student.jenisKelamin
      };

      subjects.forEach(subj => {
        const isReligious = ['pai', 'pak_kristen', 'pak_katolik', 'pah_hindu', 'pab_buddha'].includes(subj.id);
        const ag = (student.agama || '').toLowerCase();
        const isStudentReligious = 
          (subj.id === 'pai' && ag.includes('islam')) ||
          (subj.id === 'pak_kristen' && (ag.includes('protestan') || (ag.includes('kristen') && !ag.includes('katolik')))) ||
          (subj.id === 'pak_katolik' && (ag.includes('katolik') || ag.includes('khatolik'))) ||
          (subj.id === 'pah_hindu' && ag.includes('hindu')) ||
          (subj.id === 'pab_buddha' && (ag.includes('buddha') || ag.includes('budha')));

        if (isReligious && !isStudentReligious) {
          rowObj[subj.kode] = '-';
        } else {
          const g = grades.find(item => item.studentId === student.id && item.subjectId === subj.id);
          const val = raporPeriod === 'tengah_semester' 
            ? (g?.nilaiAkhirSTS ?? g?.nilaiAkhirRapor ?? '-')
            : (g?.nilaiAkhirRapor ?? '-');
          rowObj[subj.kode] = val;
        }
      });

      rowObj['Total Nilai'] = studentRecord?.total ?? 0;
      rowObj['Rata-Rata'] = studentRecord?.avg ?? 0;
      rowObj['Peringkat'] = rankMap[student.id] ?? '-';
      rowObj['Sakit (Hari)'] = att.sakit;
      rowObj['Izin (Hari)'] = att.izin;
      rowObj['Alpa (Hari)'] = att.alpa;

      return rowObj;
    });

    // 3. Metadata Sheet
    const currentWali = getWaliInfo(selectedRombel.id, selectedRombel.waliKelasNama, selectedRombel.waliKelasNip);
    const currentKepsek = getKepsekInfo();

    const metaRows = [
      { 'Parameter': 'Satuan Pendidikan', 'Keterangan': school.namaSekolah },
      { 'Parameter': 'NPSN', 'Keterangan': school.npsn },
      { 'Parameter': 'NSS NIS', 'Keterangan': school.nss },
      { 'Parameter': 'Rombongan Belajar', 'Keterangan': selectedRombel.nama },
      { 'Parameter': 'Tahun Pelajaran', 'Keterangan': school.tahunAjaran },
      { 'Parameter': 'Semester', 'Keterangan': school.semester },
      { 'Parameter': 'Periode Penilaian', 'Keterangan': raporPeriod === 'tengah_semester' ? 'Sumatif Tengah Semester (STS)' : 'Sumatif Akhir Semester (SAS)' },
      { 'Parameter': 'Wali Kelas', 'Keterangan': `${currentWali.nama} (NIP: ${currentWali.nip})` },
      { 'Parameter': 'Kepala Sekolah', 'Keterangan': `${currentKepsek.nama} (NIP: ${currentKepsek.nip})` },
      { 'Parameter': 'Tanggal Dokumen', 'Keterangan': school.tanggalRapor || '3 November 2026' }
    ];

    const wb = XLSX.utils.book_new();
    const wsLeger = XLSX.utils.json_to_sheet(rows);
    const wsMeta = XLSX.utils.json_to_sheet(metaRows);

    wsLeger['!cols'] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 10 },
      { wch: 28 },
      { wch: 6 },
      ...subjects.map(() => ({ wch: 9 })),
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
    ];

    wsMeta['!cols'] = [{ wch: 22 }, { wch: 45 }];

    XLSX.utils.book_append_sheet(wb, wsLeger, 'Leger_Nilai');
    XLSX.utils.book_append_sheet(wb, wsMeta, 'Info_Sekolah');

    const periode = raporPeriod === 'tengah_semester' ? 'STS' : 'SAS';
    XLSX.writeFile(wb, `Leger_Nilai_${selectedRombel.nama.replace(/\s+/g, '_')}_${periode}_2026-2027.xlsx`);
  };

  // Download / Print Leger as PDF in Landscape A4 format
  const handleDownloadLegerPDF = () => {
    setPrintMode('leger');
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Helper to extract student's report data
  const getStudentData = (student: Student) => {
    // In Kurikulum Merdeka, for religious education subjects (PAI, Kristen, Katolik, Hindu, Buddha),
    // each student only receives an evaluation for the religion matching their faith (student.agama).
    const studentSubjects = subjects.filter(subject => {
      const isReligious = ['pai', 'pak_kristen', 'pak_katolik', 'pah_hindu', 'pab_buddha'].includes(subject.id);
      if (!isReligious) return true;
      const ag = (student.agama || '').toLowerCase();
      if (subject.id === 'pai') return ag.includes('islam');
      if (subject.id === 'pak_kristen') return ag.includes('protestan') || (ag.includes('kristen') && !ag.includes('katolik'));
      if (subject.id === 'pak_katolik') return ag.includes('katolik') || ag.includes('khatolik');
      if (subject.id === 'pah_hindu') return ag.includes('hindu');
      if (subject.id === 'pab_buddha') return ag.includes('buddha') || ag.includes('budha');
      return false;
    });

    const effectiveSubjects = studentSubjects.length > 0 && studentSubjects.some(s => ['pai', 'pak_kristen', 'pak_katolik', 'pah_hindu', 'pab_buddha'].includes(s.id))
      ? studentSubjects
      : subjects.filter(s => !['pak_kristen', 'pak_katolik', 'pah_hindu', 'pab_buddha'].includes(s.id));

    const studentGrades = effectiveSubjects.map(subject => {
      const g = grades.find(item => item.studentId === student.id && item.subjectId === subject.id);
      return {
        subject,
        grade: g
      };
    });

    const totalScoreSAS = studentGrades.reduce((sum, item) => sum + (item.grade?.nilaiAkhirRapor || 0), 0);
    const avgScoreSAS = effectiveSubjects.length > 0 ? (totalScoreSAS / effectiveSubjects.length).toFixed(1) : '0';

    const totalScoreSTS = studentGrades.reduce((sum, item) => sum + (item.grade?.nilaiAkhirSTS || item.grade?.nilaiAkhirRapor || 0), 0);
    const avgScoreSTS = effectiveSubjects.length > 0 ? (totalScoreSTS / effectiveSubjects.length).toFixed(1) : '0';

    const studentAttendance = attendances.find(a => a.studentId === student.id) || {
      studentId: student.id,
      rombelId: student.rombelId,
      sakit: 0,
      izin: 0,
      alpa: 0
    };

    const studentEkskuls = studentExtracurriculars.filter(e => e.studentId === student.id);

    const studentNote = notes.find(n => n.studentId === student.id)?.catatan || 
      'Pertahankan prestasi belajar dan keaktifan di kelas. Tingkatkan terus minat baca dan literasi sains.';

    const studentAchs = achievements.filter(a => a.studentId === student.id);

    return {
      studentGrades,
      totalScoreSAS,
      avgScoreSAS,
      totalScoreSTS,
      avgScoreSTS,
      studentAttendance,
      studentEkskuls,
      studentNote,
      studentAchs
    };
  };

  return (
    <div className="space-y-5">
      {/* Dynamic print orientation: Landscape for Leger Nilai, Portrait for Rapor/Cover */}
      <style>{`
        @media print {
          @page {
            size: ${printMode === 'leger' ? 'A4 landscape' : 'A4 portrait'} !important;
            margin: ${printMode === 'leger' ? '8mm' : '12mm 15mm 15mm 15mm'} !important;
          }
        }
      `}</style>

      {/* Top Filter and Actions Toolbar - HIDDEN ON PRINT */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-4 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Pusat Cetak Dokumen Rapor Resmi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Format Standar e-Rapor SMP Kurikulum Merdeka Kemdikbudristek · {school.namaSekolah}
            </p>
          </div>

          {/* Direct Print Button */}
          <div className="flex flex-wrap items-center gap-2">
            {printMode === 'leger' ? (
              <>
                <button
                  type="button"
                  onClick={handleDownloadLegerExcel}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                  title={`Unduh Leger Nilai ${selectedRombel?.nama} (.xlsx)`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Unduh Leger Excel {selectedRombel?.nama} (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadLegerPDF}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
                  title={`Unduh / Cetak Dokumen Leger Nilai ${selectedRombel?.nama} (PDF Landscape A4)`}
                >
                  <FileDown className="w-4 h-4" />
                  <span>{getPrintButtonLabel()}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handlePrint}
                disabled={targetStudents.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
                title={`Cetak dokumen rapor resmi untuk ${selectedRombel?.nama}`}
              >
                <Printer className="w-4 h-4" />
                <span>{getPrintButtonLabel()}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Class Selector Bar (Pilihan Cepat Berdasarkan Kelas 7, 8, 9) */}
        <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 shrink-0 font-bold text-slate-800">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Pilih Kelas Cetak Rapor:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Tingkat 7 */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 px-1.5">Kelas 7:</span>
              {['7.1', '7.2', '7.3', '7.4'].map(cId => {
                const isSelected = selectedRombelId === cId;
                const sCount = students.filter(s => s.rombelId === cId).length;
                return (
                  <button
                    key={cId}
                    type="button"
                    onClick={() => {
                      setSelectedRombelId(cId);
                      const first = students.find(s => s.rombelId === cId);
                      if (first) setSelectedStudentId(first.id);
                    }}
                    className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xs'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                    title={`Pilih Kelas ${cId} (${sCount} Siswa)`}
                  >
                    <span>{cId}</span>
                    <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {sCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tingkat 8 */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 px-1.5">Kelas 8:</span>
              {['8.1', '8.2', '8.3', '8.4'].map(cId => {
                const isSelected = selectedRombelId === cId;
                const sCount = students.filter(s => s.rombelId === cId).length;
                return (
                  <button
                    key={cId}
                    type="button"
                    onClick={() => {
                      setSelectedRombelId(cId);
                      const first = students.find(s => s.rombelId === cId);
                      if (first) setSelectedStudentId(first.id);
                    }}
                    className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xs'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                    title={`Pilih Kelas ${cId} (${sCount} Siswa)`}
                  >
                    <span>{cId}</span>
                    <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {sCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tingkat 9 */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500 px-1.5">Kelas 9:</span>
              {['9.1', '9.2', '9.3', '9.4'].map(cId => {
                const isSelected = selectedRombelId === cId;
                const sCount = students.filter(s => s.rombelId === cId).length;
                return (
                  <button
                    key={cId}
                    type="button"
                    onClick={() => {
                      setSelectedRombelId(cId);
                      const first = students.find(s => s.rombelId === cId);
                      if (first) setSelectedStudentId(first.id);
                    }}
                    className={`px-2 py-1 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xs'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                    title={`Pilih Kelas ${cId} (${sCount} Siswa)`}
                  >
                    <span>{cId}</span>
                    <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {sCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Pilihan Rombel / Kelas Dropdown */}
          <div className="flex items-center gap-1.5 bg-blue-50/90 px-3 py-1.5 rounded-xl border border-blue-200">
            <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5 shrink-0">
              <Layers className="w-3.5 h-3.5 text-blue-700" />
              <span>Kelas Aktif:</span>
            </label>
            <select
              value={selectedRombelId}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedRombelId(newId);
                const firstInNewClass = students.find(s => s.rombelId === newId);
                if (firstInNewClass) {
                  setSelectedStudentId(firstInNewClass.id);
                }
              }}
              className="bg-white border border-blue-300 text-blue-900 text-xs font-bold rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              {rombels.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama} ({students.filter(s => s.rombelId === r.id).length} Siswa)
                </option>
              ))}
            </select>
          </div>

          {/* Pilihan Periode Rapor: STS vs SAS */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setRaporPeriod('tengah_semester')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                raporPeriod === 'tengah_semester'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Rapor Tengah Semester (STS)</span>
            </button>

            <button
              type="button"
              onClick={() => setRaporPeriod('akhir_semester')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                raporPeriod === 'akhir_semester'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Rapor Akhir Semester (SAS)</span>
            </button>
          </div>

          {/* Pilihan Format Dokumen */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setPrintMode('rapor_nilai')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                printMode === 'rapor_nilai' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rapor Nilai
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('cover')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                printMode === 'cover' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sampul Rapor
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('identitas')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                printMode === 'identitas' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Biodata Siswa
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('leger')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                printMode === 'leger' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Leger Nilai
            </button>
          </div>

          {/* Sub-Pilihan Khusus Sampul Rapor (Halaman 1 Cover Depan / Halaman 2 Identitas Satuan Pendidikan) */}
          {printMode === 'cover' && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setCoverSection('semua')}
                className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  coverSection === 'semua' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Cetak Sampul Depan dan Lembar Identitas Satuan Pendidikan"
              >
                Sampul Lengkap (Hlm 1 & 2)
              </button>
              <button
                type="button"
                onClick={() => setCoverSection('sampul_luar')}
                className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  coverSection === 'sampul_luar' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Hanya Cover Depan Luar"
              >
                Cover Depan
              </button>
              <button
                type="button"
                onClick={() => setCoverSection('identitas_sekolah')}
                className={`px-2.5 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                  coverSection === 'identitas_sekolah' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Hanya Lembar Identitas Satuan Pendidikan Resmi"
              >
                Identitas Sekolah (Hlm 2)
              </button>
            </div>
          )}

          {/* Sasaran Cetak: Siswa Tunggal vs Cetak Semua Siswa */}
          {printMode !== 'leger' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPrintTarget('single')}
                  className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                    printTarget === 'single' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`Cetak rapor per siswa di ${selectedRombel?.nama}`}
                >
                  Per Siswa ({selectedRombel?.nama})
                </button>
                <button
                  type="button"
                  onClick={() => setPrintTarget('all')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold cursor-pointer ${
                    printTarget === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`Cetak rapor seluruh peserta didik di ${selectedRombel?.nama}`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Cetak 1 Kelas ({selectedRombel?.nama} - {classStudents.length} Siswa)</span>
                </button>
              </div>

              {printTarget === 'single' && (
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs cursor-pointer"
                >
                  {classStudents.map((s, idx) => (
                    <option key={s.id} value={s.id}>
                      {idx + 1}. {s.nama} ({s.nisn})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Footer & Pagination Options for Printed Report Sheets */}
        {printMode === 'rapor_nilai' && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Format Footer Cetak:</span>
              </span>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setFooterFormat('hal')}
                  className={`px-2.5 py-1 text-xs rounded font-semibold cursor-pointer transition-all ${
                    footerFormat === 'hal' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Contoh: ADITIA PRATAMA / Hal. 1"
                >
                  [Nama] / Hal. 1
                </button>
                <button
                  type="button"
                  onClick={() => setFooterFormat('hal_total')}
                  className={`px-2.5 py-1 text-xs rounded font-semibold cursor-pointer transition-all ${
                    footerFormat === 'hal_total' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Contoh: ADITIA PRATAMA / Hal. 1 dari 2"
                >
                  [Nama] / Hal. 1 dari 2
                </button>
                <button
                  type="button"
                  onClick={() => setFooterFormat('slash_num')}
                  className={`px-2.5 py-1 text-xs rounded font-semibold cursor-pointer transition-all ${
                    footerFormat === 'slash_num' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Contoh: ADITIA PRATAMA / 1"
                >
                  [Nama] / 1
                </button>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 ml-1">
                <span className="text-slate-500 font-semibold px-1.5 text-[11px]">Tata Letak Lembar:</span>
                <button
                  type="button"
                  onClick={() => setSheetLayout('2_lembar')}
                  className={`px-2.5 py-1 text-xs rounded font-semibold cursor-pointer transition-all ${
                    sheetLayout === '2_lembar' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Standar Kurikulum Merdeka (2 Lembar): Lembar 1 Nilai Mapel, Lembar 2 Ekskul/Presensi/Catatan & TTD"
                >
                  2 Lembar (Standar)
                </button>
                <button
                  type="button"
                  onClick={() => setSheetLayout('3_lembar')}
                  className={`px-2.5 py-1 text-xs rounded font-semibold cursor-pointer transition-all ${
                    sheetLayout === '3_lembar' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="3 Lembar: Lembar 1 Nilai Mapel 1-6, Lembar 2 Nilai Mapel 7-akhir, Lembar 3 Presensi & TTD"
                >
                  3 Lembar (Terurai)
                </button>
                <button
                  type="button"
                  onClick={() => setSheetLayout('1_lembar')}
                  className={`px-2.5 py-1 text-xs rounded font-semibold cursor-pointer transition-all ${
                    sheetLayout === '1_lembar' ? 'bg-white text-blue-700 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="1 Lembar Kompak: Format padat pas 1 halaman A4"
                >
                  1 Lembar (Kompak)
                </button>
              </div>
            </div>

            <div className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Nomor halaman dihitung per siswa (lanjut Hal. 2, 3.. &amp; reset Hal. 1 untuk siswa berikutnya)</span>
            </div>
          </div>
        )}

        {/* Mode Information Callout */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <span className="font-bold">Status Konfigurasi:</span>
            <span>
              {raporPeriod === 'tengah_semester' 
                ? `Laporan Hasil Belajar Tengah Semester (${sheetLayout === '2_lembar' ? '2 Lembar/Siswa' : sheetLayout === '3_lembar' ? '3 Lembar/Siswa' : '1 Lembar Kompak'})` 
                : `Laporan Hasil Belajar Akhir Semester (${sheetLayout === '2_lembar' ? '2 Lembar/Siswa' : sheetLayout === '3_lembar' ? '3 Lembar/Siswa' : '1 Lembar Kompak'})`}
            </span>
            <span>·</span>
            <span className="font-semibold text-blue-800">
              {printTarget === 'all' 
                ? `Semua Siswa ${selectedRombel?.nama} (${classStudents.length} Siswa - Reset Halaman Per Siswa)` 
                : `Siswa: ${selectedStudent?.nama} (${selectedRombel?.nama})`}
            </span>
          </div>

          <span className="hidden sm:inline-block text-[11px] text-blue-700 font-medium">
            Format Footer: <strong className="font-mono">{getStudentFooterText(targetStudents[0]?.nama || 'ADITIA PRATAMA', 1, sheetLayout === '3_lembar' ? 3 : sheetLayout === '2_lembar' ? 2 : 1)}</strong>
          </span>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER */}
      <div className="bg-slate-200/70 p-4 sm:p-8 rounded-2xl flex flex-col items-center overflow-x-auto shadow-inner no-print-bg">
        {/* ============================================================== */}
        {/* MODE 1: RAPOR NILAI (TENGAH SEMESTER ATAU AKHIR SEMESTER) */}
        {/* ============================================================== */}
        {printMode === 'rapor_nilai' && (
          <div className="w-full flex flex-col items-center gap-8 print:gap-0">
            {targetStudents.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center max-w-md w-full shadow-xs my-6 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Belum Ada Peserta Didik di {selectedRombel?.nama || 'Kelas Ini'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed text-center">
                  Semua sample peserta didik telah dikosongkan. Silakan tambahkan data peserta didik asli SMPN 14 Tulang Bawang Barat melalui menu Data Siswa atau Impor File Excel.
                </p>
              </div>
            ) : (
              targetStudents.map((student, studentIndex) => {
                const studentData = getStudentData(student);
                const rombel = rombels.find(r => r.id === student.rombelId) || selectedRombel;
                const rombelWali = getWaliInfo(rombel.id, rombel.waliKelasNama, rombel.waliKelasNip);
                const kepsekInfo = getKepsekInfo();

                const isTwoPages = sheetLayout === '2_lembar';
                const isThreePages = sheetLayout === '3_lembar';
                const totalStudentSheets = sheetLayout === '3_lembar' ? 3 : sheetLayout === '2_lembar' ? 2 : 1;

                if (isTwoPages) {
                  return (
                    <React.Fragment key={student.id}>
                      {/* PREVIEW INDICATOR LEMBAR 1 */}
                      <div className="no-print w-full max-w-[210mm] flex items-center justify-between px-2 text-xs font-semibold text-slate-600 mb-1">
                        <span className="flex items-center gap-1.5 font-bold text-slate-800">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Lembar 1: Laporan Hasil Belajar (Nilai & Capaian Belajar)</span>
                        </span>
                        <span className="text-[11px] bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded font-mono font-bold">
                          {student.nama} · Halaman 1 dari 2
                        </span>
                      </div>

                      {/* LEMBAR 1: KOP, IDENTITAS, TABEL NILAI */}
                      <div 
                        className="rapor-sheet bg-white text-black p-8 sm:p-12 w-full max-w-[210mm] min-h-[297mm] shadow-xl border border-slate-300 rounded-sm font-sans text-xs print:m-0 print:p-0 print:w-full print:border-none print:shadow-none print-page-break flex flex-col justify-between"
                      >
                        <div>
                          {/* KOP SURAT SEKOLAH RESMI */}
                          <div className="pb-2 border-b-2 border-black flex items-center justify-between gap-3">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                              {school.logoPemda ? (
                                <img src={school.logoPemda} alt="Logo Pemda" className="max-w-full max-h-full object-contain" />
                              ) : (
                                <div className="w-16 h-16 border border-dashed border-slate-300 rounded flex items-center justify-center text-[8px] text-slate-400">Logo Pemda</div>
                              )}
                            </div>
                            <div className="text-center flex-1 space-y-0.5">
                              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wide text-black">PEMERINTAH KABUPATEN {school.kabupaten}</p>
                              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-black">DINAS PENDIDIKAN DAN KEBUDAYAAN</p>
                              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-black">{school.namaSekolah}</h2>
                              <p className="text-[12px] font-bold text-black font-mono">NPSN: {school.npsn} · NSS NIS: {school.nss}</p>
                              <p className="text-[10px] sm:text-[10.5px] leading-tight text-slate-800">
                                {school.alamat.includes(school.kecamatan)
                                  ? school.alamat
                                  : `${school.alamat}, Kec. ${school.kecamatan}, Kab. ${school.kabupaten}, Provinsi ${school.provinsi}`}
                              </p>
                            </div>
                            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                              <img 
                                src={school.logoSekolah || "/src/assets/images/school_logo_emblem_1790936910635.jpg"} 
                                alt="Logo Sekolah" 
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                              />
                            </div>
                          </div>

                          {/* JUDUL LAPORAN */}
                          <div className="text-center py-2 border-b border-black">
                            <h1 className="text-xs sm:text-sm font-bold tracking-wider uppercase underline">
                              {raporPeriod === 'tengah_semester' 
                                ? 'LAPORAN HASIL BELAJAR TENGAH SEMESTER' 
                                : 'LAPORAN HASIL BELAJAR (RAPOR PESERTA DIDIK)'}
                            </h1>
                            <p className="text-[10px] font-semibold mt-0.5">
                              TAHUN AJARAN {school.tahunAjaran} · SEMESTER {school.semester.toUpperCase()}
                              {raporPeriod === 'tengah_semester' && ' (SUMATIF TENGAH SEMESTER)'}
                            </p>
                          </div>

                          {/* IDENTITAS SISWA & KELAS */}
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 my-3 text-[11px] border-b border-black pb-2.5">
                            <div className="space-y-1">
                              <div className="flex">
                                <span className="w-32 font-semibold">Nama Peserta Didik</span>
                                <span className="w-3">:</span>
                                <span className="font-bold uppercase">{student.nama}</span>
                              </div>
                              <div className="flex">
                                <span className="w-32 font-semibold">NIS / NISN</span>
                                <span className="w-3">:</span>
                                <span className="font-mono">{student.nis} / {student.nisn}</span>
                              </div>
                              <div className="flex">
                                <span className="w-32 font-semibold">Sekolah</span>
                                <span className="w-3">:</span>
                                <span>{school.namaSekolah}</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex">
                                <span className="w-28 font-semibold">Kelas / Fase</span>
                                <span className="w-3">:</span>
                                <span>{rombel.nama} / {rombel.fase}</span>
                              </div>
                              <div className="flex">
                                <span className="w-28 font-semibold">Semester</span>
                                <span className="w-3">:</span>
                                <span>{school.semester === 'Ganjil' ? '1 (Ganjil)' : '2 (Genap)'}</span>
                              </div>
                              <div className="flex">
                                <span className="w-28 font-semibold">Tahun Pelajaran</span>
                                <span className="w-3">:</span>
                                <span>{school.tahunAjaran}</span>
                              </div>
                            </div>
                          </div>

                          {/* A. TABEL NILAI */}
                          <div className="space-y-1.5">
                            <h3 className="font-bold text-[11px] uppercase tracking-wide">
                              {raporPeriod === 'tengah_semester'
                                ? 'A. Nilai dan Capaian Pembelajaran Tengah Semester'
                                : 'A. Nilai dan Capaian Kompetensi Peserta Didik'}
                            </h3>

                            {raporPeriod === 'tengah_semester' ? (
                              /* Tabel Nilai STS */
                              <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                                <thead>
                                  <tr className="bg-slate-100 border-b border-black text-center font-bold">
                                    <th className="border border-black py-1.5 px-2 w-8">No</th>
                                    <th className="border border-black py-1.5 px-2 w-48 text-left">Mata Pelajaran</th>
                                    <th className="border border-black py-1.5 px-2 w-14">KKTP</th>
                                    <th className="border border-black py-1.5 px-2 w-16">Nilai STS</th>
                                    <th className="border border-black py-1.5 px-3 text-left">Capaian Pembelajaran Tengah Semester</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {studentData.studentGrades.map(({ subject, grade }, idx) => {
                                    const scoreSTS = grade?.nilaiAkhirSTS ?? grade?.nilaiAkhirRapor ?? 0;
                                    const isPassing = scoreSTS >= subject.kktp;
                                    return (
                                      <tr key={subject.id} className="border-b border-black align-top">
                                        <td className="border border-black py-1.5 px-2 text-center font-mono font-medium">{idx + 1}</td>
                                        <td className="border border-black py-1.5 px-2 font-medium">{subject.nama}</td>
                                        <td className="border border-black py-1.5 px-2 text-center font-mono">{subject.kktp}</td>
                                        <td className="border border-black py-1.5 px-2 text-center font-mono font-bold">{scoreSTS}</td>
                                        <td className="border border-black py-1.5 px-3 leading-relaxed text-[10px]">
                                          {grade?.deskripsiSTS || (
                                            isPassing 
                                              ? `Menunjukkan pemahaman yang sangat baik dalam materi paruh pertama semester ${subject.nama}.`
                                              : `Perlu bimbingan dan peningkatan ketekunan belajar pada materi ${subject.nama}.`
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                                <tfoot className="bg-slate-50 font-bold border-t border-black">
                                  <tr>
                                    <td colSpan={3} className="border border-black py-1.5 px-3 text-right">Rata-rata Nilai Tengah Semester:</td>
                                    <td className="border border-black py-1.5 px-2 text-center font-mono font-bold">{studentData.avgScoreSTS}</td>
                                    <td className="border border-black py-1.5 px-3 text-[10px] text-slate-600 italic">
                                      Kategori: {parseFloat(studentData.avgScoreSTS) >= 80 ? 'Tuntas & Memuaskan' : 'Cukup, Terus Ditingkatkan'}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            ) : (
                              /* Tabel Nilai SAS Lengkap */
                              <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                                <thead>
                                  <tr className="bg-slate-100 border-b border-black text-center font-bold">
                                    <th className="border border-black py-1.5 px-2 w-8">No</th>
                                    <th className="border border-black py-1.5 px-2 w-48 text-left">Mata Pelajaran</th>
                                    <th className="border border-black py-1.5 px-2 w-14">Nilai Akhir</th>
                                    <th className="border border-black py-1.5 px-3 text-left">Capaian Kompetensi</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {studentData.studentGrades.map(({ subject, grade }, idx) => (
                                    <tr key={subject.id} className="border-b border-black align-top">
                                      <td className="border border-black py-1.5 px-2 text-center font-mono font-medium">{idx + 1}</td>
                                      <td className="border border-black py-1.5 px-2 font-medium">{subject.nama}</td>
                                      <td className="border border-black py-1.5 px-2 text-center font-mono font-bold">{grade?.nilaiAkhirRapor || 0}</td>
                                      <td className="border border-black py-1.5 px-3 leading-relaxed space-y-1">
                                        <div>
                                          <strong className="text-black block text-[10px]">Tercapai:</strong>
                                          <p className="text-[10px] text-justify">{grade?.deskripsiTertinggi}</p>
                                        </div>
                                        {grade?.deskripsiTerendah && (
                                          <div>
                                            <strong className="text-black block text-[10px]">Perlu Peningkatan:</strong>
                                            <p className="text-[10px] text-justify">{grade?.deskripsiTerendah}</p>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className="bg-slate-50 font-bold border-t border-black">
                                  <tr>
                                    <td colSpan={2} className="border border-black py-1.5 px-3 text-right">Rata-rata Nilai Akhir Semester:</td>
                                    <td className="border border-black py-1.5 px-2 text-center font-mono font-bold">{studentData.avgScoreSAS}</td>
                                    <td className="border border-black py-1.5 px-3 text-[10px] text-slate-600 italic">Memenuhi Kriteria Ketuntasan Kurikulum Merdeka Fase D</td>
                                  </tr>
                                </tfoot>
                              </table>
                            )}
                          </div>
                        </div>

                        {/* RUNNING FOOTER LEMBAR 1 */}
                        <div className="mt-auto pt-3 border-t border-black flex items-center justify-between text-[10px] text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{school.namaSekolah}</span>
                            <span>·</span>
                            <span>Kelas {rombel.nama}</span>
                            <span>·</span>
                            <span>Semester {school.semester}</span>
                          </div>
                          <div className="font-bold font-mono tracking-tight text-slate-900 text-xs">
                            {getStudentFooterText(student.nama, 1, 2)}
                          </div>
                        </div>
                      </div>

                      {/* PREVIEW INDICATOR LEMBAR 2 */}
                      <div className="no-print w-full max-w-[210mm] flex items-center justify-between px-2 text-xs font-semibold text-slate-600 mb-1 mt-6">
                        <span className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Lembar 2: {raporPeriod === 'akhir_semester' ? 'Ekstrakurikuler, Presensi, Prestasi & Catatan Wali Kelas' : 'Presensi & Catatan Wali Kelas'}</span>
                        </span>
                        <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded font-mono font-bold">
                          {student.nama} · Halaman 2 dari 2
                        </span>
                      </div>

                      {/* LEMBAR 2: HEADER RINGKAS, KONTEN PELENGKAP & TTD */}
                      <div 
                        className="rapor-sheet bg-white text-black p-8 sm:p-12 w-full max-w-[210mm] min-h-[297mm] shadow-xl border border-slate-300 rounded-sm font-sans text-xs print:m-0 print:p-0 print:w-full print:border-none print:shadow-none print-page-break flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          {/* Mini Header Siswa */}
                          <div className="pb-2.5 border-b-2 border-black flex items-center justify-between text-[11px]">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-600 font-semibold">Nama Peserta Didik:</span>
                                <span className="font-bold uppercase tracking-tight text-black">{student.nama}</span>
                              </div>
                              <div className="text-[10px] text-slate-700">
                                NIS / NISN: <span className="font-mono font-medium">{student.nis} / {student.nisn}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-black">
                                Kelas: {rombel.nama} ({rombel.fase})
                              </div>
                              <div className="text-[10px] text-slate-700">
                                Semester {school.semester} · TP {school.tahunAjaran}
                              </div>
                            </div>
                          </div>

                          {/* KONTEN SAS: EKSTRAKURIKULER, PRESENSI & PRESTASI, CATATAN WALI KELAS */}
                          {raporPeriod === 'akhir_semester' ? (
                            <>
                              {/* B. EKSTRAKURIKULER */}
                              <div className="space-y-1">
                                <h3 className="font-bold text-[11px] uppercase tracking-wide">B. Kegiatan Ekstrakurikuler</h3>
                                <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                                  <thead>
                                    <tr className="bg-slate-100 border-b border-black text-center font-bold">
                                      <th className="border border-black py-1 px-2 w-8">No</th>
                                      <th className="border border-black py-1 px-3 w-56 text-left">Kegiatan Ekstrakurikuler</th>
                                      <th className="border border-black py-1 px-2 w-24">Predikat</th>
                                      <th className="border border-black py-1 px-3 text-left">Keterangan</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {studentData.studentEkskuls.length > 0 ? (
                                      studentData.studentEkskuls.map((entry, idx) => {
                                        const eInfo = extracurriculars.find(e => e.id === entry.ekskulId);
                                        return (
                                          <tr key={entry.id} className="border-b border-black">
                                            <td className="border border-black py-1 px-2 text-center font-mono">{idx + 1}</td>
                                            <td className="border border-black py-1 px-3 font-medium">{eInfo?.nama}</td>
                                            <td className="border border-black py-1 px-2 text-center font-semibold">{entry.predikat}</td>
                                            <td className="border border-black py-1 px-3">{entry.keterangan}</td>
                                          </tr>
                                        );
                                      })
                                    ) : (
                                      <tr>
                                        <td colSpan={4} className="border border-black py-1 px-3 text-center text-slate-500">
                                          Mengikuti kegiatan kepramukaan wajib dengan baik.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              {/* C. KETIDAKHADIRAN & D. PRESTASI */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <h3 className="font-bold text-[11px] uppercase tracking-wide">C. Ketidakhadiran (Presensi)</h3>
                                  <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                                    <tbody>
                                      <tr className="border-b border-black">
                                        <td className="border border-black py-1 px-3 font-medium">1. Sakit</td>
                                        <td className="border border-black py-1 px-3 text-center font-mono w-24">{studentData.studentAttendance.sakit} hari</td>
                                      </tr>
                                      <tr className="border-b border-black">
                                        <td className="border border-black py-1 px-3 font-medium">2. Izin</td>
                                        <td className="border border-black py-1 px-3 text-center font-mono w-24">{studentData.studentAttendance.izin} hari</td>
                                      </tr>
                                      <tr className="border-b border-black">
                                        <td className="border border-black py-1 px-3 font-medium">3. Tanpa Keterangan</td>
                                        <td className="border border-black py-1 px-3 text-center font-mono w-24">{studentData.studentAttendance.alpa} hari</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>

                                <div className="space-y-1">
                                  <h3 className="font-bold text-[11px] uppercase tracking-wide">D. Prestasi Yang Diraih</h3>
                                  <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                                    <thead>
                                      <tr className="bg-slate-100 border-b border-black font-bold">
                                        <th className="border border-black py-1 px-2 w-8 text-center">No</th>
                                        <th className="border border-black py-1 px-2">Prestasi &amp; Keterangan</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {studentData.studentAchs.length > 0 ? (
                                        studentData.studentAchs.map((ach, idx) => (
                                          <tr key={ach.id} className="border-b border-black">
                                            <td className="border border-black py-1 px-2 text-center font-mono">{idx + 1}</td>
                                            <td className="border border-black py-1 px-2 font-medium">
                                              {ach.prestasi} ({ach.tingkat})
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan={2} className="border border-black py-1 px-2 text-center text-slate-500">
                                            - Tidak ada catatan prestasi khusus semester ini -
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* E. CATATAN WALI KELAS */}
                              <div className="space-y-1">
                                <h3 className="font-bold text-[11px] uppercase tracking-wide">E. Catatan Wali Kelas</h3>
                                <div className="border border-black p-2.5 min-h-[44px] text-[10.5px] leading-relaxed italic bg-slate-50/30">
                                  "{studentData.studentNote}"
                                </div>
                              </div>
                            </>
                          ) : (
                            /* KONTEN STS: PRESENSI & CATATAN WALI KELAS BERDAMPINGAN */
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <h3 className="font-bold text-[11px] uppercase tracking-wide">B. Ketidakhadiran (Presensi Tengah Semester)</h3>
                                <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                                  <tbody>
                                    <tr className="border-b border-black">
                                      <td className="border border-black py-1 px-3 font-medium">1. Sakit</td>
                                      <td className="border border-black py-1 px-3 text-center font-mono w-24">{studentData.studentAttendance.sakit} hari</td>
                                    </tr>
                                    <tr className="border-b border-black">
                                      <td className="border border-black py-1 px-3 font-medium">2. Izin</td>
                                      <td className="border border-black py-1 px-3 text-center font-mono w-24">{studentData.studentAttendance.izin} hari</td>
                                    </tr>
                                    <tr className="border-b border-black">
                                      <td className="border border-black py-1 px-3 font-medium">3. Tanpa Keterangan</td>
                                      <td className="border border-black py-1 px-3 text-center font-mono w-24">{studentData.studentAttendance.alpa} hari</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>

                              <div className="space-y-1 flex flex-col">
                                <h3 className="font-bold text-[11px] uppercase tracking-wide">C. Catatan Wali Kelas</h3>
                                <div className="border border-black p-2.5 flex-1 min-h-[85px] text-[10.5px] leading-relaxed italic bg-slate-50/30 flex items-start">
                                  "{studentData.studentNote}"
                                </div>
                              </div>
                            </div>
                          )}

                          {/* TANDA TANGAN RESMI */}
                          <div className="pt-4 grid grid-cols-3 gap-2 text-center text-[10.5px] print-avoid-break">
                            <div className="space-y-14">
                              <div>
                                <p>Mengetahui,</p>
                                <p className="font-medium">Orang Tua / Wali Peserta Didik,</p>
                              </div>
                              <div>
                                <p className="font-bold border-b border-black inline-block min-w-[130px] pb-0.5">( .................................................. )</p>
                              </div>
                            </div>

                            <div className="space-y-14">
                              <div>
                                <p>Mengetahui,</p>
                                <p className="font-medium">Kepala SMPN 14 Tulang Bawang Barat,</p>
                              </div>
                              <div>
                                <p className="font-bold underline">{kepsekInfo.nama}</p>
                                <p className="font-mono text-[9.5px]">NIP. {kepsekInfo.nip}</p>
                              </div>
                            </div>

                            <div className="space-y-14">
                              <div>
                                <p>{school.tempatRapor}, {school.tanggalRapor || '3 November 2026'}</p>
                                <p className="font-medium">Wali Kelas {rombel.nama},</p>
                              </div>
                              <div>
                                <p className="font-bold underline">{rombelWali.nama}</p>
                                <p className="font-mono text-[9.5px]">NIP. {rombelWali.nip}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* RUNNING FOOTER LEMBAR 2 */}
                        <div className="mt-auto pt-3 border-t border-black flex items-center justify-between text-[10px] text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{school.namaSekolah}</span>
                            <span>·</span>
                            <span>Kelas {rombel.nama}</span>
                            <span>·</span>
                            <span>Semester {school.semester}</span>
                          </div>
                          <div className="font-bold font-mono tracking-tight text-slate-900 text-xs">
                            {getStudentFooterText(student.nama, 2, 2)}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                }

                // ==============================================================
                // TATA LETAK 2: 3 LEMBAR (TERURAI / RINCI)
                // Lembar 1: Kop, Identitas, Mapel 1-6
                // Lembar 2: Mini Header, Mapel 7-akhir + Rata-rata
                // Lembar 3: Mini Header, Ekskul, Presensi, Prestasi, Catatan & TTD
                // ==============================================================
                if (isThreePages) {
                  const firstHalfGrades = studentData.studentGrades.slice(0, 6);
                  const secondHalfGrades = studentData.studentGrades.slice(6);

                  return (
                    <React.Fragment key={student.id}>
                      {/* ============================================================== */}
                      {/* 3 LEMBAR - LEMBAR 1: KOP, IDENTITAS, TABEL MAPEL 1-6 */}
                      {/* ============================================================== */}
                      <div className="no-print w-full max-w-[210mm] flex items-center justify-between px-2 text-xs font-semibold text-slate-600 mb-1">
                        <span className="flex items-center gap-1.5 font-bold text-slate-800">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Lembar 1: Laporan Hasil Belajar (Bagian I: Mapel 1 s.d. 6)</span>
                        </span>
                        <span className="text-[11px] bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded font-mono font-bold">
                          {student.nama} · Halaman 1 dari 3
                        </span>
                      </div>

                      <div className="rapor-sheet bg-white text-black p-8 sm:p-12 w-full max-w-[210mm] min-h-[297mm] shadow-xl border border-slate-300 rounded-sm font-sans text-xs print:m-0 print:p-0 print:w-full print:border-none print:shadow-none print-page-break flex flex-col justify-between">
                        <div>
                          {/* KOP SURAT SEKOLAH RESMI */}
                          <div className="pb-2 border-b-2 border-black flex items-center justify-between gap-3">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                              {school.logoPemda ? (
                                <img src={school.logoPemda} alt="Logo Pemda" className="max-w-full max-h-full object-contain" />
                              ) : (
                                <div className="w-16 h-16 border border-dashed border-slate-300 rounded flex items-center justify-center text-[8px] text-slate-400">Logo Pemda</div>
                              )}
                            </div>
                            <div className="text-center flex-1 space-y-0.5">
                              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wide text-black">PEMERINTAH KABUPATEN {school.kabupaten}</p>
                              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-black">DINAS PENDIDIKAN DAN KEBUDAYAAN</p>
                              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-black">{school.namaSekolah}</h2>
                              <p className="text-[12px] font-bold text-black font-mono">NPSN: {school.npsn} · NSS NIS: {school.nss}</p>
                              <p className="text-[10px] sm:text-[10.5px] leading-tight text-slate-800">
                                {school.alamat.includes(school.kecamatan)
                                  ? school.alamat
                                  : `${school.alamat}, Kec. ${school.kecamatan}, Kab. ${school.kabupaten}, Provinsi ${school.provinsi}`}
                              </p>
                            </div>
                            <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                              <img 
                                src={school.logoSekolah || "/src/assets/images/school_logo_emblem_1790936910635.jpg"} 
                                alt="Logo Sekolah" 
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                              />
                            </div>
                          </div>

                          {/* JUDUL LAPORAN */}
                          <div className="text-center py-2 border-b border-black">
                            <h1 className="text-xs sm:text-sm font-bold tracking-wider uppercase underline">
                              {raporPeriod === 'tengah_semester' 
                                ? 'LAPORAN HASIL BELAJAR TENGAH SEMESTER' 
                                : 'LAPORAN HASIL BELAJAR (RAPOR PESERTA DIDIK)'}
                            </h1>
                            <p className="text-[10px] font-semibold mt-0.5">
                              TAHUN AJARAN {school.tahunAjaran} · SEMESTER {school.semester.toUpperCase()}
                              {raporPeriod === 'tengah_semester' && ' (SUMATIF TENGAH SEMESTER)'}
                            </p>
                          </div>

                          {/* IDENTITAS SISWA & KELAS */}
                          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 my-3 text-[11px] border-b border-black pb-2.5">
                            <div className="space-y-1">
                              <div className="flex">
                                <span className="w-32 font-semibold">Nama Peserta Didik</span>
                                <span className="w-3">:</span>
                                <span className="font-bold uppercase">{student.nama}</span>
                              </div>
                              <div className="flex">
                                <span className="w-32 font-semibold">NIS / NISN</span>
                                <span className="w-3">:</span>
                                <span className="font-mono">{student.nis} / {student.nisn}</span>
                              </div>
                              <div className="flex">
                                <span className="w-32 font-semibold">Sekolah</span>
                                <span className="w-3">:</span>
                                <span>{school.namaSekolah}</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="flex">
                                <span className="w-28 font-semibold">Kelas / Fase</span>
                                <span className="w-3">:</span>
                                <span>{rombel.nama} / {rombel.fase}</span>
                              </div>
                              <div className="flex">
                                <span className="w-28 font-semibold">Semester</span>
                                <span className="w-3">:</span>
                                <span>{school.semester === 'Ganjil' ? '1 (Ganjil)' : '2 (Genap)'}</span>
                              </div>
                              <div className="flex">
                                <span className="w-28 font-semibold">Tahun Pelajaran</span>
                                <span className="w-3">:</span>
                                <span>{school.tahunAjaran}</span>
                              </div>
                            </div>
                          </div>

                          {/* TABEL NILAI BAGIAN I */}
                          <div className="space-y-1.5">
                            <h3 className="font-bold text-[11px] uppercase tracking-wide">
                              {raporPeriod === 'tengah_semester'
                                ? 'A. Nilai dan Capaian Pembelajaran Tengah Semester (Bagian I: Mapel 1 s.d. 6)'
                                : 'A. Nilai dan Capaian Kompetensi Peserta Didik (Bagian I: Mapel 1 s.d. 6)'}
                            </h3>

                            {raporPeriod === 'tengah_semester' ? (
                              <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                                <thead>
                                  <tr className="bg-slate-100 border-b border-black text-center font-bold">
                                    <th className="border border-black py-1.5 px-2 w-8">No</th>
                                    <th className="border border-black py-1.5 px-2 w-48 text-left">Mata Pelajaran</th>
                                    <th className="border border-black py-1.5 px-2 w-14">KKTP</th>
                                    <th className="border border-black py-1.5 px-2 w-16">Nilai STS</th>
                                    <th className="border border-black py-1.5 px-3 text-left">Capaian Pembelajaran Tengah Semester</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {firstHalfGrades.map(({ subject, grade }, idx) => {
                                    const scoreSTS = grade?.nilaiAkhirSTS ?? grade?.nilaiAkhirRapor ?? 0;
                                    const isPassing = scoreSTS >= subject.kktp;
                                    return (
                                      <tr key={subject.id} className="border-b border-black align-top">
                                        <td className="border border-black py-1.5 px-2 text-center font-mono font-medium">{idx + 1}</td>
                                        <td className="border border-black py-1.5 px-2 font-medium">{subject.nama}</td>
                                        <td className="border border-black py-1.5 px-2 text-center font-mono">{subject.kktp}</td>
                                        <td className="border border-black py-1.5 px-2 text-center font-mono font-bold">{scoreSTS}</td>
                                        <td className="border border-black py-1.5 px-3 leading-relaxed text-[10px]">
                                          {grade?.deskripsiSTS || (
                                            isPassing 
                                              ? `Menunjukkan pemahaman yang sangat baik dalam materi paruh pertama semester ${subject.nama}.`
                                              : `Perlu bimbingan dan peningkatan ketekunan belajar pada materi ${subject.nama}.`
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            ) : (
                              <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                                <thead>
                                  <tr className="bg-slate-100 border-b border-black text-center font-bold">
                                    <th className="border border-black py-1.5 px-2 w-8">No</th>
                                    <th className="border border-black py-1.5 px-2 w-48 text-left">Mata Pelajaran</th>
                                    <th className="border border-black py-1.5 px-2 w-14">Nilai Akhir</th>
                                    <th className="border border-black py-1.5 px-3 text-left">Capaian Kompetensi</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {firstHalfGrades.map(({ subject, grade }, idx) => (
                                    <tr key={subject.id} className="border-b border-black align-top">
                                      <td className="border border-black py-1.5 px-2 text-center font-mono font-medium">{idx + 1}</td>
                                      <td className="border border-black py-1.5 px-2 font-medium">{subject.nama}</td>
                                      <td className="border border-black py-1.5 px-2 text-center font-mono font-bold">{grade?.nilaiAkhirRapor || 0}</td>
                                      <td className="border border-black py-1.5 px-3 leading-relaxed space-y-1">
                                        <div>
                                          <strong className="text-black block text-[10px]">Tercapai:</strong>
                                          <p className="text-[10px] text-justify">{grade?.deskripsiTertinggi}</p>
                                        </div>
                                        {grade?.deskripsiTerendah && (
                                          <div>
                                            <strong className="text-black block text-[10px]">Perlu Peningkatan:</strong>
                                            <p className="text-[10px] text-justify">{grade?.deskripsiTerendah}</p>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}

                            <p className="text-[10px] italic text-slate-600 text-right pt-1">
                              * Daftar mata pelajaran berikutnya serta rata-rata nilai semester dilanjutkan pada Lembar 2.
                            </p>
                          </div>
                        </div>

                        {/* RUNNING FOOTER LEMBAR 1 */}
                        <div className="mt-auto pt-3 border-t border-black flex items-center justify-between text-[10px] text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{school.namaSekolah}</span>
                            <span>·</span>
                            <span>Kelas {rombel.nama}</span>
                            <span>·</span>
                            <span>{raporPeriod === 'tengah_semester' ? 'STS' : `Semester ${school.semester}`}</span>
                          </div>
                          <div className="font-bold font-mono tracking-tight text-slate-900 text-xs">
                            {getStudentFooterText(student.nama, 1, 3)}
                          </div>
                        </div>
                      </div>

                      {/* ============================================================== */}
                      {/* 3 LEMBAR - LEMBAR 2: MINI HEADER & TABEL MAPEL 7 DST + RERATA  */}
                      {/* ============================================================== */}
                      <div className="no-print w-full max-w-[210mm] flex items-center justify-between px-2 text-xs font-semibold text-slate-600 mb-1 mt-6">
                        <span className="flex items-center gap-1.5 font-bold text-slate-800">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>Lembar 2: Nilai &amp; Capaian Belajar (Bagian II: Mapel 7 s.d. Selesai)</span>
                        </span>
                        <span className="text-[11px] bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded font-mono font-bold">
                          {student.nama} · Halaman 2 dari 3
                        </span>
                      </div>

                      <div className="rapor-sheet bg-white text-black p-8 sm:p-12 w-full max-w-[210mm] min-h-[297mm] shadow-xl border border-slate-300 rounded-sm font-sans text-xs print:m-0 print:p-0 print:w-full print:border-none print:shadow-none print-page-break flex flex-col justify-between">
                        <div>
                          {/* Mini Header Siswa */}
                          <div className="pb-2.5 border-b-2 border-black flex items-center justify-between text-[11px] mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-600 font-semibold">Nama Peserta Didik:</span>
                                <span className="font-bold uppercase tracking-tight text-black">{student.nama}</span>
                              </div>
                              <div className="text-[10px] text-slate-700">
                                NIS / NISN: <span className="font-mono font-medium">{student.nis} / {student.nisn}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-black">
                                Kelas: {rombel.nama} ({rombel.fase})
                              </div>
                              <div className="text-[10px] text-slate-700">
                                Semester {school.semester} · TP {school.tahunAjaran}
                              </div>
                            </div>
                          </div>

                          {/* Tabel Nilai Bagian II */}
                          <div className="space-y-1.5">
                            <h3 className="font-bold text-[11px] uppercase tracking-wide">
                              {raporPeriod === 'tengah_semester'
                                ? 'A. Lanjutan Nilai dan Capaian Pembelajaran Tengah Semester (Bagian II)'
                                : 'A. Lanjutan Nilai dan Capaian Kompetensi Peserta Didik (Bagian II)'}
                            </h3>

                            {raporPeriod === 'tengah_semester' ? (
                              <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                                <thead>
                                  <tr className="bg-slate-100 border-b border-black text-center font-bold">
                                    <th className="border border-black py-1.5 px-2 w-8">No</th>
                                    <th className="border border-black py-1.5 px-2 w-48 text-left">Mata Pelajaran</th>
                                    <th className="border border-black py-1.5 px-2 w-14">KKTP</th>
                                    <th className="border border-black py-1.5 px-2 w-16">Nilai STS</th>
                                    <th className="border border-black py-1.5 px-3 text-left">Capaian Pembelajaran Tengah Semester</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {secondHalfGrades.map(({ subject, grade }, idx) => {
                                    const scoreSTS = grade?.nilaiAkhirSTS ?? grade?.nilaiAkhirRapor ?? 0;
                                    const isPassing = scoreSTS >= subject.kktp;
                                    return (
                                      <tr key={subject.id} className="border-b border-black align-top">
                                        <td className="border border-black py-1.5 px-2 text-center font-mono font-medium">{idx + 7}</td>
                                        <td className="border border-black py-1.5 px-2 font-medium">{subject.nama}</td>
                                        <td className="border border-black py-1.5 px-2 text-center font-mono">{subject.kktp}</td>
                                        <td className="border border-black py-1.5 px-2 text-center font-mono font-bold">{scoreSTS}</td>
                                        <td className="border border-black py-1.5 px-3 leading-relaxed text-[10px]">
                                          {grade?.deskripsiSTS || (
                                            isPassing 
                                              ? `Menunjukkan pemahaman yang sangat baik dalam materi paruh pertama semester ${subject.nama}.`
                                              : `Perlu bimbingan dan peningkatan ketekunan belajar pada materi ${subject.nama}.`
                                          )}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                                <tfoot className="bg-slate-50 font-bold border-t border-black">
                                  <tr>
                                    <td colSpan={3} className="border border-black py-1.5 px-3 text-right">Rata-rata Nilai Tengah Semester:</td>
                                    <td className="border border-black py-1.5 px-2 text-center font-mono font-bold">{studentData.avgScoreSTS}</td>
                                    <td className="border border-black py-1.5 px-3 text-[10px] text-slate-600 italic">
                                      Kategori: {parseFloat(studentData.avgScoreSTS) >= 80 ? 'Tuntas & Memuaskan' : 'Cukup, Terus Ditingkatkan'}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            ) : (
                              <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                                <thead>
                                  <tr className="bg-slate-100 border-b border-black text-center font-bold">
                                    <th className="border border-black py-1.5 px-2 w-8">No</th>
                                    <th className="border border-black py-1.5 px-2 w-48 text-left">Mata Pelajaran</th>
                                    <th className="border border-black py-1.5 px-2 w-14">Nilai Akhir</th>
                                    <th className="border border-black py-1.5 px-3 text-left">Capaian Kompetensi</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {secondHalfGrades.map(({ subject, grade }, idx) => (
                                    <tr key={subject.id} className="border-b border-black align-top">
                                      <td className="border border-black py-1.5 px-2 text-center font-mono font-medium">{idx + 7}</td>
                                      <td className="border border-black py-1.5 px-2 font-medium">{subject.nama}</td>
                                      <td className="border border-black py-1.5 px-2 text-center font-mono font-bold">{grade?.nilaiAkhirRapor || 0}</td>
                                      <td className="border border-black py-1.5 px-3 leading-relaxed space-y-1">
                                        <div>
                                          <strong className="text-black block text-[10px]">Tercapai:</strong>
                                          <p className="text-[10px] text-justify">{grade?.deskripsiTertinggi}</p>
                                        </div>
                                        {grade?.deskripsiTerendah && (
                                          <div>
                                            <strong className="text-black block text-[10px]">Perlu Peningkatan:</strong>
                                            <p className="text-[10px] text-justify">{grade?.deskripsiTerendah}</p>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                                <tfoot className="bg-slate-50 font-bold border-t border-black">
                                  <tr>
                                    <td colSpan={2} className="border border-black py-1.5 px-3 text-right">Rata-rata Nilai Akhir Semester:</td>
                                    <td className="border border-black py-1.5 px-2 text-center font-mono font-bold">{studentData.avgScoreSAS}</td>
                                    <td className="border border-black py-1.5 px-3 text-[10px] text-slate-600 italic">Memenuhi Kriteria Ketuntasan Kurikulum Merdeka Fase D</td>
                                  </tr>
                                </tfoot>
                              </table>
                            )}

                            <p className="text-[10px] italic text-slate-600 text-right pt-2">
                              * Rekap kehadiran, catatan wali kelas, dan tanda tangan resmi tercantum pada Lembar 3.
                            </p>
                          </div>
                        </div>

                        {/* RUNNING FOOTER LEMBAR 2 */}
                        <div className="mt-auto pt-3 border-t border-black flex items-center justify-between text-[10px] text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{school.namaSekolah}</span>
                            <span>·</span>
                            <span>Kelas {rombel.nama}</span>
                            <span>·</span>
                            <span>{raporPeriod === 'tengah_semester' ? 'STS' : `Semester ${school.semester}`}</span>
                          </div>
                          <div className="font-bold font-mono tracking-tight text-slate-900 text-xs">
                            {getStudentFooterText(student.nama, 2, 3)}
                          </div>
                        </div>
                      </div>

                      {/* ============================================================== */}
                      {/* 3 LEMBAR - LEMBAR 3: EKSKUL, PRESENSI, PRESTASI, CATATAN & TTD */}
                      {/* ============================================================== */}
                      <div className="no-print w-full max-w-[210mm] flex items-center justify-between px-2 text-xs font-semibold text-slate-600 mb-1 mt-6">
                        <span className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Lembar 3: {raporPeriod === 'akhir_semester' ? 'Ekstrakurikuler, Presensi, Prestasi & Catatan Wali Kelas' : 'Presensi, Catatan Wali Kelas & Tanda Tangan'}</span>
                        </span>
                        <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded font-mono font-bold">
                          {student.nama} · Halaman 3 dari 3
                        </span>
                      </div>

                      <div className="rapor-sheet bg-white text-black p-8 sm:p-12 w-full max-w-[210mm] min-h-[297mm] shadow-xl border border-slate-300 rounded-sm font-sans text-xs print:m-0 print:p-0 print:w-full print:border-none print:shadow-none print-page-break flex flex-col justify-between">
                        <div className="space-y-4">
                          {/* Mini Header Siswa */}
                          <div className="pb-2.5 border-b-2 border-black flex items-center justify-between text-[11px]">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-600 font-semibold">Nama Peserta Didik:</span>
                                <span className="font-bold uppercase tracking-tight text-black">{student.nama}</span>
                              </div>
                              <div className="text-[10px] text-slate-700">
                                NIS / NISN: <span className="font-mono font-medium">{student.nis} / {student.nisn}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-black">
                                Kelas: {rombel.nama} ({rombel.fase})
                              </div>
                              <div className="text-[10px] text-slate-700">
                                Semester {school.semester} · TP {school.tahunAjaran}
                              </div>
                            </div>
                          </div>

                          {/* KONTEN SAS ATAU STS */}
                          {raporPeriod === 'akhir_semester' ? (
                            <>
                              {/* B. EKSTRAKURIKULER */}
                              <div className="space-y-1">
                                <h3 className="font-bold text-[11px] uppercase tracking-wide">B. Kegiatan Ekstrakurikuler</h3>
                                <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                                  <thead>
                                    <tr className="bg-slate-100 border-b border-black text-center font-bold">
                                      <th className="border border-black py-1 px-2 w-8">No</th>
                                      <th className="border border-black py-1 px-3 w-56 text-left">Kegiatan Ekstrakurikuler</th>
                                      <th className="border border-black py-1 px-2 w-24">Predikat</th>
                                      <th className="border border-black py-1 px-3 text-left">Keterangan</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {studentData.studentEkskuls.length > 0 ? (
                                      studentData.studentEkskuls.map((entry, idx) => {
                                        const eInfo = extracurriculars.find(e => e.id === entry.ekskulId);
                                        return (
                                          <tr key={entry.id} className="border-b border-black">
                                            <td className="border border-black py-1 px-2 text-center font-mono">{idx + 1}</td>
                                            <td className="border border-black py-1 px-3 font-medium">{eInfo?.nama}</td>
                                            <td className="border border-black py-1 px-2 text-center font-semibold">{entry.predikat}</td>
                                            <td className="border border-black py-1 px-3">{entry.keterangan}</td>
                                          </tr>
                                        );
                                      })
                                    ) : (
                                      <tr>
                                        <td colSpan={4} className="border border-black py-1 px-3 text-center text-slate-500">
                                          Mengikuti kegiatan kepramukaan wajib dengan baik.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              {/* C. KETIDAKHADIRAN & D. PRESTASI */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <h3 className="font-bold text-[11px] uppercase tracking-wide">C. Ketidakhadiran (Presensi)</h3>
                                  <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                                    <tbody>
                                      <tr className="border-b border-black">
                                        <td className="border border-black py-1 px-3 font-medium">1. Sakit</td>
                                        <td className="border border-black py-1 px-3 text-center font-mono w-24">{studentData.studentAttendance.sakit} hari</td>
                                      </tr>
                                      <tr className="border-b border-black">
                                        <td className="border border-black py-1 px-3 font-medium">2. Izin</td>
                                        <td className="border border-black py-1 px-3 text-center font-mono w-24">{studentData.studentAttendance.izin} hari</td>
                                      </tr>
                                      <tr className="border-b border-black">
                                        <td className="border border-black py-1 px-3 font-medium">3. Tanpa Keterangan</td>
                                        <td className="border border-black py-1 px-3 text-center font-mono w-24">{studentData.studentAttendance.alpa} hari</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>

                                <div className="space-y-1">
                                  <h3 className="font-bold text-[11px] uppercase tracking-wide">D. Prestasi Yang Diraih</h3>
                                  <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                                    <thead>
                                      <tr className="bg-slate-100 border-b border-black font-bold">
                                        <th className="border border-black py-1 px-2 w-8 text-center">No</th>
                                        <th className="border border-black py-1 px-2">Prestasi &amp; Keterangan</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {studentData.studentAchs.length > 0 ? (
                                        studentData.studentAchs.map((ach, idx) => (
                                          <tr key={ach.id} className="border-b border-black">
                                            <td className="border border-black py-1 px-2 text-center font-mono">{idx + 1}</td>
                                            <td className="border border-black py-1 px-2 font-medium">
                                              {ach.prestasi} ({ach.tingkat})
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan={2} className="border border-black py-1 px-2 text-center text-slate-500">
                                            - Tidak ada catatan prestasi khusus semester ini -
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* E. CATATAN WALI KELAS */}
                              <div className="space-y-1">
                                <h3 className="font-bold text-[11px] uppercase tracking-wide">E. Catatan Wali Kelas</h3>
                                <div className="border border-black p-3 min-h-[56px] text-[10.5px] leading-relaxed italic bg-slate-50/30">
                                  "{studentData.studentNote}"
                                </div>
                              </div>
                            </>
                          ) : (
                            /* STS: PRESENSI & CATATAN */
                            <div className="space-y-3.5">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <h3 className="font-bold text-[11px] uppercase tracking-wide">B. Ketidakhadiran (Presensi Tengah Semester)</h3>
                                  <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                                    <tbody>
                                      <tr className="border-b border-black">
                                        <td className="border border-black py-1 px-3 font-medium">1. Sakit</td>
                                        <td className="border border-black py-1 px-3 text-center font-mono w-24">{studentData.studentAttendance.sakit} hari</td>
                                      </tr>
                                      <tr className="border-b border-black">
                                        <td className="border border-black py-1 px-3 font-medium">2. Izin</td>
                                        <td className="border border-black py-1 px-3 text-center font-mono w-24">{studentData.studentAttendance.izin} hari</td>
                                      </tr>
                                      <tr className="border-b border-black">
                                        <td className="border border-black py-1 px-3 font-medium">3. Tanpa Keterangan</td>
                                        <td className="border border-black py-1 px-3 text-center font-mono w-24">{studentData.studentAttendance.alpa} hari</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>

                                <div className="space-y-1 flex flex-col">
                                  <h3 className="font-bold text-[11px] uppercase tracking-wide">C. Catatan Wali Kelas</h3>
                                  <div className="border border-black p-3 flex-1 min-h-[76px] text-[10.5px] leading-relaxed italic bg-slate-50/30 flex items-start">
                                    "{studentData.studentNote}"
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* TANDA TANGAN RESMI */}
                          <div className="pt-6 grid grid-cols-3 gap-2 text-center text-[10.5px] print-avoid-break">
                            <div className="space-y-14">
                              <div>
                                <p>Mengetahui,</p>
                                <p className="font-medium">Orang Tua / Wali Peserta Didik,</p>
                              </div>
                              <div>
                                <p className="font-bold border-b border-black inline-block min-w-[130px] pb-0.5">
                                  ( .................................................. )
                                </p>
                              </div>
                            </div>

                            <div className="space-y-14">
                              <div>
                                <p>Mengetahui,</p>
                                <p className="font-medium">Kepala SMPN 14 Tulang Bawang Barat,</p>
                              </div>
                              <div>
                                <p className="font-bold underline">{kepsekInfo.nama}</p>
                                <p className="font-mono text-[9.5px]">NIP. {kepsekInfo.nip}</p>
                              </div>
                            </div>

                            <div className="space-y-14">
                              <div>
                                <p>{school.tempatRapor}, {school.tanggalRapor || '3 November 2026'}</p>
                                <p className="font-medium">Wali Kelas {rombel.nama},</p>
                              </div>
                              <div>
                                <p className="font-bold underline">{rombelWali.nama}</p>
                                <p className="font-mono text-[9.5px]">NIP. {rombelWali.nip}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* RUNNING FOOTER LEMBAR 3 */}
                        <div className="mt-auto pt-3 border-t border-black flex items-center justify-between text-[10px] text-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{school.namaSekolah}</span>
                            <span>·</span>
                            <span>Kelas {rombel.nama}</span>
                            <span>·</span>
                            <span>{raporPeriod === 'tengah_semester' ? 'STS' : `Semester ${school.semester}`}</span>
                          </div>
                          <div className="font-bold font-mono tracking-tight text-slate-900 text-xs">
                            {getStudentFooterText(student.nama, 3, 3)}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                }

                // ==============================================================
                // TATA LETAK 3: 1 LEMBAR (KOMPAK / RINGKAS)
                // Footer per siswa: [Nama] / Hal. 1 atau Hal. 1 dari 1
                // ==============================================================
                return (
                  <React.Fragment key={student.id}>
                    {/* PREVIEW INDICATOR 1 LEMBAR */}
                    <div className="no-print w-full max-w-[210mm] flex items-center justify-between px-2 text-xs font-semibold text-slate-600 mb-1">
                      <span className="flex items-center gap-1.5 font-bold text-slate-800">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span>Lembar Rapor (1 Lembar Kompak): {raporPeriod === 'tengah_semester' ? 'Nilai Tengah Semester (STS)' : 'Nilai Akhir Semester (SAS)'}</span>
                      </span>
                      <span className="text-[11px] bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded font-mono font-bold">
                        {student.nama} · Halaman 1 dari 1
                      </span>
                    </div>

                    <div 
                      className="rapor-sheet bg-white text-black p-8 sm:p-12 w-full max-w-[210mm] min-h-[297mm] shadow-xl border border-slate-300 rounded-sm font-sans text-xs print:m-0 print:p-0 print:w-full print:border-none print:shadow-none print-page-break flex flex-col justify-between"
                    >
                  <div>
                    {/* KOP SURAT SEKOLAH RESMI DENGAN LOGO PEMDA & LOGO SEKOLAH */}
                    <div className="pb-2 border-b-2 border-black flex items-center justify-between gap-3">
                      {/* Logo Pemda (Kiri) */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                        {school.logoPemda ? (
                          <img 
                            src={school.logoPemda} 
                            alt="Logo Pemda" 
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <div className="w-16 h-16 border border-dashed border-slate-300 rounded flex items-center justify-center text-[8px] text-slate-400">
                            Logo Pemda
                          </div>
                        )}
                      </div>

                      {/* Teks Kop Surat Resmi */}
                      <div className="text-center flex-1 space-y-0.5">
                        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wide text-black">
                          PEMERINTAH KABUPATEN {school.kabupaten}
                        </p>
                        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide text-black">
                          DINAS PENDIDIKAN DAN KEBUDAYAAN
                        </p>
                        <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-tight text-black">
                          {school.namaSekolah}
                        </h2>
                        <p className="text-[12px] font-bold text-black font-mono">
                          NPSN: {school.npsn} · NSS NIS: {school.nss}
                        </p>
                        <p className="text-[10px] sm:text-[10.5px] leading-tight text-slate-800">
                          {school.alamat.includes(school.kecamatan)
                            ? school.alamat
                            : `${school.alamat}, Kec. ${school.kecamatan}, Kab. ${school.kabupaten}, Provinsi ${school.provinsi}`}
                        </p>
                      </div>

                      {/* Logo Sekolah (Kanan) */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 flex items-center justify-center">
                        <img 
                          src={school.logoSekolah || "/src/assets/images/school_logo_emblem_1790936910635.jpg"} 
                          alt="Logo Sekolah" 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>

                    {/* JUDUL LAPORAN HASIL BELAJAR */}
                    <div className="text-center py-2 border-b border-black">
                      <h1 className="text-xs sm:text-sm font-bold tracking-wider uppercase underline">
                        {raporPeriod === 'tengah_semester'
                          ? 'LAPORAN HASIL BELAJAR TENGAH SEMESTER'
                          : 'LAPORAN HASIL BELAJAR (RAPOR PESERTA DIDIK)'}
                      </h1>
                      <p className="text-[10px] font-semibold mt-0.5">
                        TAHUN AJARAN {school.tahunAjaran} · SEMESTER {school.semester.toUpperCase()}
                      </p>
                    </div>

                    {/* IDENTITAS SISWA & KELAS */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 my-4 text-[11px] border-b border-black pb-3">
                      <div className="space-y-1">
                        <div className="flex">
                          <span className="w-32 font-semibold">Nama Peserta Didik</span>
                          <span className="w-3">:</span>
                          <span className="font-bold uppercase">{student.nama}</span>
                        </div>
                        <div className="flex">
                          <span className="w-32 font-semibold">NIS / NISN</span>
                          <span className="w-3">:</span>
                          <span className="font-mono">{student.nis} / {student.nisn}</span>
                        </div>
                        <div className="flex">
                          <span className="w-32 font-semibold">Sekolah</span>
                          <span className="w-3">:</span>
                          <span>{school.namaSekolah}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex">
                          <span className="w-28 font-semibold">Kelas / Fase</span>
                          <span className="w-3">:</span>
                          <span>{rombel.nama} / {rombel.fase}</span>
                        </div>
                        <div className="flex">
                          <span className="w-28 font-semibold">Semester</span>
                          <span className="w-3">:</span>
                          <span>
                            {school.semester === 'Ganjil' ? '1 (Ganjil)' : '2 (Genap)'}
                            {raporPeriod === 'tengah_semester' && ' - Tengah Semester'}
                          </span>
                        </div>
                        <div className="flex">
                          <span className="w-28 font-semibold">Tahun Pelajaran</span>
                          <span className="w-3">:</span>
                          <span>{school.tahunAjaran}</span>
                        </div>
                      </div>
                    </div>

                    {/* ========================================================= */}
                    {/* KONTEN A: TABEL LAPORAN HASIL BELAJAR */}
                    {/* ========================================================= */}
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-[11px] uppercase tracking-wide">
                        {raporPeriod === 'tengah_semester' 
                          ? 'A. Nilai dan Capaian Kompetensi Tengah Semester' 
                          : 'A. Nilai dan Capaian Kompetensi Peserta Didik'}
                      </h3>

                      {/* TABEL NILAI KHUSUS TENGAH SEMESTER (STS) */}
                      {raporPeriod === 'tengah_semester' ? (
                        <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                          <thead>
                            <tr className="bg-slate-100 border-b border-black text-center font-bold">
                              <th className="border border-black py-1.5 px-2 w-8">No</th>
                              <th className="border border-black py-1.5 px-2 w-48 text-left">Mata Pelajaran</th>
                              <th className="border border-black py-1.5 px-2 w-14">KKTP</th>
                              <th className="border border-black py-1.5 px-2 w-16">Nilai STS</th>
                              <th className="border border-black py-1.5 px-3 text-left">Capaian Pembelajaran Tengah Semester</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentData.studentGrades.map(({ subject, grade }, idx) => {
                              const scoreSTS = grade?.nilaiAkhirSTS ?? grade?.nilaiAkhirRapor ?? 0;
                              const isPassing = scoreSTS >= subject.kktp;

                              return (
                                <tr key={subject.id} className="border-b border-black align-top">
                                  <td className="border border-black py-1.5 px-2 text-center font-mono font-medium">
                                    {idx + 1}
                                  </td>
                                  <td className="border border-black py-1.5 px-2 font-medium">
                                    {subject.nama}
                                  </td>
                                  <td className="border border-black py-1.5 px-2 text-center font-mono">
                                    {subject.kktp}
                                  </td>
                                  <td className="border border-black py-1.5 px-2 text-center font-mono font-bold">
                                    {scoreSTS}
                                  </td>
                                  <td className="border border-black py-1.5 px-3 leading-relaxed text-[10px]">
                                    {grade?.deskripsiSTS || (
                                      isPassing 
                                        ? `Menunjukkan pemahaman yang sangat baik dalam materi paruh pertama semester ${subject.nama}.`
                                        : `Perlu bimbingan dan peningkatan ketekunan belajar pada materi ${subject.nama}.`
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="bg-slate-50 font-bold border-t border-black">
                            <tr>
                              <td colSpan={3} className="border border-black py-1.5 px-3 text-right">
                                Rata-rata Nilai Tengah Semester:
                              </td>
                              <td className="border border-black py-1.5 px-2 text-center font-mono font-bold">
                                {studentData.avgScoreSTS}
                              </td>
                              <td className="border border-black py-1.5 px-3 text-[10px] text-slate-600 italic">
                                Kategori: {parseFloat(studentData.avgScoreSTS) >= 80 ? 'Tuntas & Memuaskan' : 'Cukup, Terus Ditingkatkan'}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      ) : (
                        /* TABEL NILAI AKHIR SEMESTER (SAS) LENGKAP */
                        <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                          <thead>
                            <tr className="bg-slate-100 border-b border-black text-center font-bold">
                              <th className="border border-black py-1.5 px-2 w-8">No</th>
                              <th className="border border-black py-1.5 px-2 w-48 text-left">Mata Pelajaran</th>
                              <th className="border border-black py-1.5 px-2 w-14">Nilai Akhir</th>
                              <th className="border border-black py-1.5 px-3 text-left">Capaian Kompetensi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentData.studentGrades.map(({ subject, grade }, idx) => (
                              <tr key={subject.id} className="border-b border-black align-top">
                                <td className="border border-black py-1.5 px-2 text-center font-mono font-medium">
                                  {idx + 1}
                                </td>
                                <td className="border border-black py-1.5 px-2 font-medium">
                                  {subject.nama}
                                </td>
                                <td className="border border-black py-1.5 px-2 text-center font-mono font-bold">
                                  {grade?.nilaiAkhirRapor || 0}
                                </td>
                                <td className="border border-black py-1.5 px-3 leading-relaxed space-y-1">
                                  <div>
                                    <strong className="text-black block text-[10px]">Tercapai:</strong>
                                    <p className="text-[10px] text-justify">{grade?.deskripsiTertinggi}</p>
                                  </div>
                                  {grade?.deskripsiTerendah && (
                                    <div>
                                      <strong className="text-black block text-[10px]">Perlu Peningkatan:</strong>
                                      <p className="text-[10px] text-justify">{grade?.deskripsiTerendah}</p>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-slate-50 font-bold border-t border-black">
                            <tr>
                              <td colSpan={2} className="border border-black py-1.5 px-3 text-right">
                                Rata-rata Nilai Akhir Semester:
                              </td>
                              <td className="border border-black py-1.5 px-2 text-center font-mono font-bold">
                                {studentData.avgScoreSAS}
                              </td>
                              <td className="border border-black py-1.5 px-3 text-[10px] text-slate-600 italic">
                                Memenuhi Kriteria Ketuntasan Kurikulum Merdeka Fase D
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      )}
                    </div>

                    {/* ========================================================= */}
                    {/* KONTEN B, C, D: EKSTRAKURIKULER, PRESENSI & CATATAN */}
                    {/* ========================================================= */}
                    <div className="mt-5 pt-3 border-t border-black space-y-3.5 print-avoid-break">
                      {/* B. EKSTRAKURIKULER (Pada SAS lengkap, pada STS bersifat opsional/ringkas) */}
                      {raporPeriod === 'akhir_semester' && (
                        <div className="space-y-1">
                          <h3 className="font-bold text-[11px] uppercase tracking-wide">
                            B. Kegiatan Ekstrakurikuler
                          </h3>
                          <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                            <thead>
                              <tr className="bg-slate-100 border-b border-black text-center font-bold">
                                <th className="border border-black py-1 px-2 w-8">No</th>
                                <th className="border border-black py-1 px-3 w-56 text-left">Kegiatan Ekstrakurikuler</th>
                                <th className="border border-black py-1 px-2 w-24">Predikat</th>
                                <th className="border border-black py-1 px-3 text-left">Keterangan</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentData.studentEkskuls.length > 0 ? (
                                studentData.studentEkskuls.map((entry, idx) => {
                                  const eInfo = extracurriculars.find(e => e.id === entry.ekskulId);
                                  return (
                                    <tr key={entry.id} className="border-b border-black">
                                      <td className="border border-black py-1 px-2 text-center font-mono">{idx + 1}</td>
                                      <td className="border border-black py-1 px-3 font-medium">{eInfo?.nama}</td>
                                      <td className="border border-black py-1 px-2 text-center font-semibold">{entry.predikat}</td>
                                      <td className="border border-black py-1 px-3">{entry.keterangan}</td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={4} className="border border-black py-1 px-3 text-center text-slate-500">
                                    Mengikuti kegiatan kepramukaan wajib dengan baik.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* KETIDAKHADIRAN & PRESTASI / PRESENSI STS */}
                      {raporPeriod === 'akhir_semester' ? (
                        <div className="grid grid-cols-2 gap-4">
                          {/* Presensi SAS */}
                          <div className="space-y-1">
                            <h3 className="font-bold text-[11px] uppercase tracking-wide">
                              C. Ketidakhadiran (Presensi)
                            </h3>
                            <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                              <tbody>
                                <tr className="border-b border-black">
                                  <td className="border border-black py-1 px-3 font-medium">1. Sakit</td>
                                  <td className="border border-black py-1 px-3 text-center font-mono w-24">
                                    {studentData.studentAttendance.sakit} hari
                                  </td>
                                </tr>
                                <tr className="border-b border-black">
                                  <td className="border border-black py-1 px-3 font-medium">2. Izin</td>
                                  <td className="border border-black py-1 px-3 text-center font-mono w-24">
                                    {studentData.studentAttendance.izin} hari
                                  </td>
                                </tr>
                                <tr className="border-b border-black">
                                  <td className="border border-black py-1 px-3 font-medium">3. Tanpa Keterangan</td>
                                  <td className="border border-black py-1 px-3 text-center font-mono w-24">
                                    {studentData.studentAttendance.alpa} hari
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* Prestasi Yang Diraih SAS */}
                          <div className="space-y-1">
                            <h3 className="font-bold text-[11px] uppercase tracking-wide">
                              D. Prestasi Yang Diraih
                            </h3>
                            <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                              <thead>
                                <tr className="bg-slate-100 border-b border-black font-bold">
                                  <th className="border border-black py-1 px-2 w-8 text-center">No</th>
                                  <th className="border border-black py-1 px-2">Prestasi & Keterangan</th>
                                </tr>
                              </thead>
                              <tbody>
                                {studentData.studentAchs.length > 0 ? (
                                  studentData.studentAchs.map((ach, idx) => (
                                    <tr key={ach.id} className="border-b border-black">
                                      <td className="border border-black py-1 px-2 text-center font-mono">{idx + 1}</td>
                                      <td className="border border-black py-1 px-2 font-medium">
                                        {ach.prestasi} ({ach.tingkat})
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={2} className="border border-black py-1 px-2 text-center text-slate-500">
                                      - Tidak ada catatan prestasi khusus semester ini -
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        /* Presensi STS (Tengah Semester) & Catatan Wali Kelas Berdampingan */
                        <div className="grid grid-cols-2 gap-4">
                          {/* Kolom Kiri: Presensi STS */}
                          <div className="space-y-1">
                            <h3 className="font-bold text-[11px] uppercase tracking-wide">
                              B. Ketidakhadiran (Presensi Tengah Semester)
                            </h3>
                            <table className="w-full text-left text-[10.5px] border-collapse border border-black print-border-table">
                              <tbody>
                                <tr className="border-b border-black">
                                  <td className="border border-black py-1 px-3 font-medium">1. Sakit</td>
                                  <td className="border border-black py-1 px-3 text-center font-mono w-24">
                                    {studentData.studentAttendance.sakit} hari
                                  </td>
                                </tr>
                                <tr className="border-b border-black">
                                  <td className="border border-black py-1 px-3 font-medium">2. Izin</td>
                                  <td className="border border-black py-1 px-3 text-center font-mono w-24">
                                    {studentData.studentAttendance.izin} hari
                                  </td>
                                </tr>
                                <tr className="border-b border-black">
                                  <td className="border border-black py-1 px-3 font-medium">3. Tanpa Keterangan</td>
                                  <td className="border border-black py-1 px-3 text-center font-mono w-24">
                                    {studentData.studentAttendance.alpa} hari
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          {/* Kolom Kanan: Catatan Wali Kelas STS */}
                          <div className="space-y-1 flex flex-col">
                            <h3 className="font-bold text-[11px] uppercase tracking-wide">
                              C. Catatan Wali Kelas
                            </h3>
                            <div className="border border-black p-2.5 flex-1 min-h-[76px] text-[10.5px] leading-relaxed italic bg-slate-50/30 flex items-start">
                              "{studentData.studentNote}"
                            </div>
                          </div>
                        </div>
                      )}

                      {/* CATATAN WALI KELAS UNTUK SAS (Akhir Semester) */}
                      {raporPeriod === 'akhir_semester' && (
                        <div className="space-y-1">
                          <h3 className="font-bold text-[11px] uppercase tracking-wide">
                            E. Catatan Wali Kelas
                          </h3>
                          <div className="border border-black p-2.5 min-h-[44px] text-[10.5px] leading-relaxed italic bg-slate-50/30">
                            "{studentData.studentNote}"
                          </div>
                        </div>
                      )}

                      {/* TANDA TANGAN RESMI */}
                      <div className="pt-4 grid grid-cols-3 gap-2 text-center text-[10.5px] print-avoid-break">
                        {/* Orang Tua */}
                        <div className="space-y-14">
                          <div>
                            <p>Mengetahui,</p>
                            <p className="font-medium">Orang Tua / Wali Peserta Didik,</p>
                          </div>
                          <div>
                            <p className="font-bold border-b border-black inline-block min-w-[130px] pb-0.5">
                              ( .................................................. )
                            </p>
                          </div>
                        </div>

                        {/* Kepala Sekolah */}
                        <div className="space-y-14">
                          <div>
                            <p>Mengetahui,</p>
                            <p className="font-medium">Kepala SMPN 14 Tulang Bawang Barat,</p>
                          </div>
                          <div>
                            <p className="font-bold underline">{kepsekInfo.nama}</p>
                            <p className="font-mono text-[9.5px]">NIP. {kepsekInfo.nip}</p>
                          </div>
                        </div>

                        {/* Wali Kelas */}
                        <div className="space-y-14">
                          <div>
                            <p>
                              {school.tempatRapor},{' '}
                              {school.tanggalRapor || '3 November 2026'}
                            </p>
                            <p className="font-medium">Wali Kelas {rombel.nama},</p>
                          </div>
                          <div>
                            <p className="font-bold underline">{rombelWali.nama}</p>
                            <p className="font-mono text-[9.5px]">NIP. {rombelWali.nip}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RUNNING FOOTER LEMBAR 1 */}
                  <div className="mt-auto pt-3 border-t border-black flex items-center justify-between text-[10px] text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{school.namaSekolah}</span>
                      <span>·</span>
                      <span>Kelas {rombel.nama}</span>
                      <span>·</span>
                      <span>{raporPeriod === 'tengah_semester' ? 'Tengah Semester (STS)' : `Semester ${school.semester}`}</span>
                    </div>
                    <div className="font-bold font-mono tracking-tight text-slate-900 text-xs">
                      {getStudentFooterText(student.nama, 1, 1)}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          }))}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 2: SAMPUL RAPOR RESMI KEMDIKBUD (COVER LUAR & IDENTITAS SEKOLAH) */}
        {/* ============================================================== */}
        {printMode === 'cover' && (
          <div className="w-full flex flex-col items-center gap-8 print:gap-0">
            {(() => {
              const studentsToRender = targetStudents.length > 0 ? targetStudents : [{
                id: 'template-cover',
                nis: '..............................',
                nisn: '..............................',
                nama: '( .................................................................................. )',
                jenisKelamin: 'L' as const,
                rombelId: selectedRombel?.id || '7.1',
                tempatLahir: '-',
                tanggalLahir: '-',
                agama: 'Islam',
                namaAyah: '-',
                namaIbu: '-',
                pekerjaanOrangTua: '-',
                alamat: '-'
              }];

              return studentsToRender.map((student) => (
                <React.Fragment key={student.id}>
                  {/* 1. HALAMAN SAMPUL 1: COVER LUAR */}
                  {(coverSection === 'semua' || coverSection === 'sampul_luar') && (
                    <div className="bg-white text-black p-4 sm:p-6 w-full max-w-[210mm] min-h-[297mm] shadow-xl border border-slate-300 rounded-sm font-serif print:m-0 print:p-0 print:border-none print:shadow-none print-page-break flex flex-col">
                      {/* Double Border Frame Khas Sampul Rapor Resmi Kemdikbud */}
                      <div className="border-[3px] border-black p-2 h-full flex-1 flex flex-col justify-between">
                        <div className="border border-black p-6 sm:p-8 h-full flex-1 flex flex-col justify-between items-center text-center">
                          
                          {/* Header Atas */}
                          <div className="space-y-2 pt-3">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-800 font-sans">
                              KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
                            </p>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-800 font-sans">
                              REPUBLIK INDONESIA
                            </p>
                            <div className="pt-2">
                              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider uppercase font-sans text-slate-950">
                                {raporPeriod === 'tengah_semester' 
                                  ? 'LAPORAN HASIL BELAJAR TENGAH SEMESTER' 
                                  : 'RAPOR PESERTA DIDIK'}
                              </h1>
                              <h2 className="text-lg sm:text-xl font-bold tracking-widest uppercase font-sans mt-1">
                                SEKOLAH MENENGAH PERTAMA (SMP)
                              </h2>
                              <p className="text-xs font-semibold font-sans tracking-wider text-slate-600 mt-1 uppercase">
                                KURIKULUM MERDEKA · FASE D
                              </p>
                            </div>
                          </div>

                          {/* Logo Resmi Sekolah */}
                          <div className="my-5 flex flex-col items-center">
                            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl border-2 border-black flex items-center justify-center p-3 shadow-2xs bg-white">
                              <img 
                                src={school.logoSekolah || "/src/assets/images/school_logo_emblem_1790936910635.jpg"} 
                                alt={`Lambang ${school.namaSekolah}`} 
                                className="w-full h-full object-contain"
                              />
                            </div>
                          </div>

                          {/* Kotak Identitas Siswa */}
                          <div className="w-full max-w-md font-sans space-y-4 my-2">
                            <div className="space-y-1.5">
                              <p className="text-xs uppercase font-semibold text-slate-800 tracking-wide">
                                Nama Peserta Didik:
                              </p>
                              <div className="border-2 border-black py-2.5 px-4 font-extrabold text-base sm:text-lg uppercase bg-slate-50 tracking-wide text-slate-950 shadow-2xs">
                                {student.nama}
                              </div>
                            </div>

                            <div className="space-y-1">
                              <p className="text-xs uppercase font-semibold text-slate-800 tracking-wide">
                                NISN / NIS:
                              </p>
                              <div className="border border-black py-1.5 px-4 font-mono font-bold text-sm bg-white tracking-widest">
                                {student.nisn} / {student.nis}
                              </div>
                            </div>
                          </div>

                          {/* Footer Resmi Sekolah & Wilayah (Lengkap dengan Alamat & Kabupaten Tulang Bawang Barat) */}
                          <div className="pt-5 font-sans space-y-1.5 w-full max-w-lg border-t-2 border-black/80 mt-3">
                            <h3 className="text-lg font-black uppercase tracking-tight text-slate-950">
                              {school.namaSekolah}
                            </h3>
                            <p className="text-xs font-semibold text-slate-800">
                              NPSN: <span className="font-mono">{school.npsn}</span> {school.nss ? `· NSS: ${school.nss}` : ''}
                            </p>
                            <p className="text-[11px] leading-relaxed text-slate-800 max-w-md mx-auto">
                              {school.alamat}
                            </p>
                            <div className="pt-0.5 text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center justify-center gap-2">
                              <span>KABUPATEN {school.kabupaten.toUpperCase()}</span>
                              <span>·</span>
                              <span>PROVINSI {school.provinsi.toUpperCase()}</span>
                            </div>
                            <p className="text-xs font-bold text-slate-700 tracking-wide pt-0.5">
                              TAHUN AJARAN {school.tahunAjaran} · SEMESTER {school.semester.toUpperCase()}
                            </p>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. HALAMAN SAMPUL 2: IDENTITAS SATUAN PENDIDIKAN RESMI */}
                  {(coverSection === 'semua' || coverSection === 'identitas_sekolah') && (
                    <div className="bg-white text-black p-4 sm:p-6 w-full max-w-[210mm] min-h-[297mm] shadow-xl border border-slate-300 rounded-sm font-sans print:m-0 print:p-0 print:border-none print:shadow-none print-page-break flex flex-col">
                      <div className="border-[3px] border-black p-2 h-full flex-1 flex flex-col justify-between">
                        <div className="border border-black p-8 sm:p-12 h-full flex-1 flex flex-col justify-between text-xs leading-relaxed">
                          
                          {/* Header Halaman Identitas Sekolah */}
                          <div className="text-center pb-4 border-b-2 border-black space-y-1">
                            <h2 className="text-base sm:text-lg font-black uppercase tracking-wide">
                              RAPOR PESERTA DIDIK
                            </h2>
                            <h3 className="text-sm font-bold uppercase tracking-wide">
                              SEKOLAH MENENGAH PERTAMA (SMP)
                            </h3>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                              LEMBAR IDENTITAS SATUAN PENDIDIKAN
                            </p>
                          </div>

                          {/* Tabel Identitas Satuan Pendidikan */}
                          <div className="py-6 space-y-3.5 text-xs">
                            <div className="flex">
                              <span className="w-8 font-mono">1.</span>
                              <span className="w-56 sm:w-64 font-semibold text-slate-900">Nama Sekolah</span>
                              <span className="w-4">:</span>
                              <span className="font-bold uppercase flex-1">{school.namaSekolah}</span>
                            </div>

                            <div className="flex">
                              <span className="w-8 font-mono">2.</span>
                              <span className="w-56 sm:w-64 font-semibold text-slate-900">NPSN</span>
                              <span className="w-4">:</span>
                              <span className="font-mono font-bold flex-1">{school.npsn}</span>
                            </div>

                            <div className="flex">
                              <span className="w-8 font-mono">3.</span>
                              <span className="w-56 sm:w-64 font-semibold text-slate-900">NSS / NIS</span>
                              <span className="w-4">:</span>
                              <span className="font-mono flex-1">{school.nss || '-'}</span>
                            </div>

                            <div className="flex">
                              <span className="w-8 font-mono">4.</span>
                              <span className="w-56 sm:w-64 font-semibold text-slate-900">Alamat Sekolah</span>
                              <span className="w-4">:</span>
                              <span className="flex-1 leading-normal">{school.alamat}</span>
                            </div>

                            <div className="flex">
                              <span className="w-8 font-mono">5.</span>
                              <span className="w-56 sm:w-64 font-semibold text-slate-900">Kode Pos</span>
                              <span className="w-4">:</span>
                              <span className="font-mono flex-1">{school.kodePos || '34783'}</span>
                            </div>

                            <div className="flex">
                              <span className="w-8 font-mono">6.</span>
                              <span className="w-56 sm:w-64 font-semibold text-slate-900">Desa / Kelurahan</span>
                              <span className="w-4">:</span>
                              <span className="flex-1">{school.desaKelurahan || 'Marga Jaya'}</span>
                            </div>

                            <div className="flex">
                              <span className="w-8 font-mono">7.</span>
                              <span className="w-56 sm:w-64 font-semibold text-slate-900">Kecamatan</span>
                              <span className="w-4">:</span>
                              <span className="flex-1">{school.kecamatan || 'Gunung Agung'}</span>
                            </div>

                            <div className="flex">
                              <span className="w-8 font-mono">8.</span>
                              <span className="w-56 sm:w-64 font-semibold text-slate-900">Kabupaten / Kota</span>
                              <span className="w-4">:</span>
                              <span className="font-semibold flex-1">{school.kabupaten}</span>
                            </div>

                            <div className="flex">
                              <span className="w-8 font-mono">9.</span>
                              <span className="w-56 sm:w-64 font-semibold text-slate-900">Provinsi</span>
                              <span className="w-4">:</span>
                              <span className="flex-1">{school.provinsi || 'Lampung'}</span>
                            </div>

                            <div className="flex">
                              <span className="w-8 font-mono">10.</span>
                              <span className="w-56 sm:w-64 font-semibold text-slate-900">Website Resmi</span>
                              <span className="w-4">:</span>
                              <span className="text-blue-900 flex-1">{school.website || '-'}</span>
                            </div>

                            <div className="flex">
                              <span className="w-8 font-mono">11.</span>
                              <span className="w-56 sm:w-64 font-semibold text-slate-900">Email Sekolah</span>
                              <span className="w-4">:</span>
                              <span className="flex-1 font-mono">{school.email || '-'}</span>
                            </div>

                            <div className="flex">
                              <span className="w-8 font-mono">12.</span>
                              <span className="w-56 sm:w-64 font-semibold text-slate-900">Nomor Telepon</span>
                              <span className="w-4">:</span>
                              <span className="flex-1">{school.telepon || '-'}</span>
                            </div>
                          </div>

                          {/* Tanda Tangan Kepala Sekolah */}
                          {(() => {
                            const kepsekInfo = getKepsekInfo();
                            return (
                              <div className="pt-8 flex justify-end">
                                <div className="text-center space-y-16 min-w-[240px]">
                                  <div>
                                    <p>{school.tempatRapor || 'Tulang Bawang Barat'}, {school.tanggalRapor || '3 November 2026'}</p>
                                    <p className="font-semibold">Kepala {school.namaSekolah},</p>
                                  </div>
                                  <div>
                                    <p className="font-bold underline text-[12px]">{kepsekInfo.nama}</p>
                                    <p className="font-mono text-[10.5px]">NIP. {kepsekInfo.nip}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                        </div>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ));
            })()}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 3: IDENTITAS PESERTA DIDIK (BIODATA) */}
        {/* ============================================================== */}
        {printMode === 'identitas' && (
          <div className="w-full flex flex-col items-center gap-8 print:gap-0">
            {targetStudents.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center max-w-md w-full shadow-xs my-6 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Belum Ada Peserta Didik di {selectedRombel?.nama || 'Kelas Ini'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed text-center">
                  Semua sample peserta didik telah dikosongkan. Silakan tambahkan data peserta didik asli SMPN 14 Tulang Bawang Barat melalui menu Data Siswa atau Impor File Excel.
                </p>
              </div>
            ) : (
              targetStudents.map((student) => {
                const studentRombel = rombels.find(r => r.id === student.rombelId) || selectedRombel;

                return (
                  <div 
                    key={student.id}
                    className="bg-white text-black p-10 sm:p-14 w-full max-w-[210mm] min-h-[297mm] shadow-xl border border-slate-300 rounded-sm font-sans text-xs print:m-0 print:p-0 print:border-none print:shadow-none print-page-break space-y-5"
                  >
                    <div className="text-center pb-3 border-b-2 border-black space-y-1">
                      <h2 className="text-sm sm:text-base font-bold uppercase tracking-wide">
                        IDENTITAS PESERTA DIDIK
                      </h2>
                      <p className="text-xs font-medium">
                        KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
                      </p>
                    </div>

                    {/* List Identitas Lengkap Siswa (Persis Sama dengan Buku Induk Siswa) */}
                    <div className="space-y-2.5 leading-relaxed text-xs">
                      <div className="flex">
                        <span className="w-8 font-mono">1.</span>
                        <span className="w-64 font-semibold text-slate-900">Nama Lengkap Siswa</span>
                        <span className="w-4">:</span>
                        <span className="font-bold uppercase text-slate-900 flex-1">{student.nama}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">2.</span>
                        <span className="w-64 font-semibold text-slate-900">Nomor Induk Siswa (NIS)</span>
                        <span className="w-4">:</span>
                        <span className="font-mono font-medium flex-1">{student.nis}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">3.</span>
                        <span className="w-64 font-semibold text-slate-900">Nomor Induk Siswa Nasional (NISN)</span>
                        <span className="w-4">:</span>
                        <span className="font-mono font-bold flex-1">{student.nisn}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">4.</span>
                        <span className="w-64 font-semibold text-slate-900">Tempat, Tanggal Lahir</span>
                        <span className="w-4">:</span>
                        <span className="flex-1">{student.tempatLahir}, {student.tanggalLahir}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">5.</span>
                        <span className="w-64 font-semibold text-slate-900">Jenis Kelamin</span>
                        <span className="w-4">:</span>
                        <span className="flex-1">{student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">6.</span>
                        <span className="w-64 font-semibold text-slate-900">Agama & Kepercayaan</span>
                        <span className="w-4">:</span>
                        <span className="flex-1">{student.agama || 'Islam'}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">7.</span>
                        <span className="w-64 font-semibold text-slate-900">Status dalam Keluarga</span>
                        <span className="w-4">:</span>
                        <span className="flex-1">{student.statusKeluarga || 'Anak Kandung'}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">8.</span>
                        <span className="w-64 font-semibold text-slate-900">Anak Ke</span>
                        <span className="w-4">:</span>
                        <span className="flex-1">{student.anakKe || '1'}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">9.</span>
                        <span className="w-64 font-semibold text-slate-900">Sekolah Asal (Pendidikan Sebelumnya)</span>
                        <span className="w-4">:</span>
                        <span className="flex-1">{student.sekolahAsal || 'Sekolah Dasar (SD / MI)'}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">10.</span>
                        <span className="w-64 font-semibold text-slate-900">Diterima di Sekolah Ini</span>
                        <span className="w-4">:</span>
                        <div className="space-y-1 flex-1">
                          <p>a. Di Kelas / Rombel : <span className="font-semibold">{studentRombel?.nama || student.rombelId} ({studentRombel?.fase || 'Fase D'})</span></p>
                          <p>b. Pada Tanggal / Tahun Masuk : <span className="font-semibold">{student.tahunMasuk || (school.tahunAjaran ? school.tahunAjaran.split('/')[0] : '2026')}</span></p>
                          <p>c. Terdaftar Sebagai : <span className="font-semibold">{student.terdaftarSebagai || 'Peserta Didik Baru'}</span></p>
                        </div>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">11.</span>
                        <span className="w-64 font-semibold text-slate-900">Alamat Peserta Didik</span>
                        <span className="w-4">:</span>
                        <span className="flex-1 leading-normal">{student.alamat}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">12.</span>
                        <span className="w-64 font-semibold text-slate-900">Nomor Telepon / HP</span>
                        <span className="w-4">:</span>
                        <span className="flex-1">{student.telepon || '-'}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">13.</span>
                        <span className="w-64 font-semibold text-slate-900">Nama Orang Tua Kandung</span>
                        <span className="w-4">:</span>
                        <div className="space-y-1 flex-1">
                          <p>a. Ayah : <span className="font-semibold">{student.namaAyah || '-'}</span></p>
                          <p>b. Ibu  : <span className="font-semibold">{student.namaIbu || '-'}</span></p>
                        </div>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">14.</span>
                        <span className="w-64 font-semibold text-slate-900">Pekerjaan Orang Tua</span>
                        <span className="w-4">:</span>
                        <span className="flex-1">{student.pekerjaanOrangTua || 'Wiraswasta / Petani'}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">15.</span>
                        <span className="w-64 font-semibold text-slate-900">Alamat Orang Tua</span>
                        <span className="w-4">:</span>
                        <span className="flex-1 leading-normal">{student.alamat}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">16.</span>
                        <span className="w-64 font-semibold text-slate-900">Wali Peserta Didik (jika ada)</span>
                        <span className="w-4">:</span>
                        <div className="space-y-1 flex-1">
                          <p>a. Nama Wali : <span className="font-semibold">{student.namaWali || '-'}</span></p>
                          <p>b. Pekerjaan Wali : <span className="font-semibold">{student.pekerjaanWali || '-'}</span></p>
                          <p>c. Alamat Wali : <span className="font-semibold">{student.alamatWali || '-'}</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Pasfoto & TTD Kepala Sekolah */}
                    <div className="pt-6 flex justify-between items-end">
                      <div className="w-28 h-36 border-2 border-black flex items-center justify-center text-[10px] text-slate-400 font-mono overflow-hidden bg-slate-50 shadow-2xs">
                        {student.foto ? (
                          <img src={student.foto} alt={student.nama} className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-2">
                            <span className="font-bold text-slate-600">Pasfoto</span>
                            <span className="text-[9px]">3 x 4 cm</span>
                          </div>
                        )}
                      </div>

                      {(() => {
                        const kepsekInfo = getKepsekInfo();
                        return (
                          <div className="text-center space-y-16">
                            <div>
                              <p>{school.tempatRapor || 'Tulang Bawang Barat'}, {school.tanggalRapor || '3 November 2026'}</p>
                              <p className="font-semibold">Kepala {school.namaSekolah},</p>
                            </div>
                            <div>
                              <p className="font-bold underline text-[12px]">{kepsekInfo.nama}</p>
                              <p className="font-mono text-[10.5px]">NIP. {kepsekInfo.nip}</p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Running Footer Biodata Siswa */}
                    <div className="mt-auto pt-3 border-t border-black flex items-center justify-between text-[10px] text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{school.namaSekolah}</span>
                        <span>·</span>
                        <span>Buku Induk & Biodata Siswa</span>
                      </div>
                      <div className="font-bold font-mono tracking-tight text-slate-900 text-xs">
                        {getStudentFooterText(student.nama, 1, 1)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 4: LEGER NILAI SEMESTER (FORMAT SHEET LENGKAP) */}
        {/* ============================================================== */}
        {printMode === 'leger' && (
          <div className="flex flex-col items-center gap-4 w-full">
            {/* Quick Export Ribbon for Leger */}
            <div className="no-print bg-white border border-slate-200 rounded-xl p-3.5 w-full max-w-[297mm] flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <TableProperties className="w-4 h-4 text-blue-700 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 text-xs">Pilihan Format Unduh Leger Nilai:</span>
                  <span className="text-slate-500 text-[11px] block">
                    Pilih format Excel (.xlsx) untuk pengolahan spreadsheet atau PDF (Landscape A4) untuk arsip resmi.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadLegerExcel}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Unduh File Excel {selectedRombel?.nama} (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadLegerPDF}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Unduh / Cetak PDF Leger {selectedRombel?.nama}</span>
                </button>
              </div>
            </div>

            <div className="bg-white text-black p-6 sm:p-10 w-full max-w-[297mm] min-h-[210mm] shadow-xl border border-slate-300 rounded-sm font-sans text-[10px] print:m-0 print:p-0 print:w-full print:border-none print:shadow-none space-y-4">
            {/* Header Leger */}
            <div className="border-b-2 border-black pb-2 flex items-center justify-between gap-3">
              <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                {school.logoPemda && (
                  <img src={school.logoPemda} alt="Logo Pemda" className="max-w-full max-h-full object-contain" />
                )}
              </div>
              <div className="text-center flex-1 space-y-0.5">
                <h2 className="text-xs font-bold uppercase tracking-wider">
                  LEGER NILAI HASIL BELAJAR PESERTA DIDIK
                  {raporPeriod === 'tengah_semester' && ' (TENGAH SEMESTER)'}
                </h2>
                <h3 className="text-sm font-bold uppercase">
                  {school.namaSekolah} · {selectedRombel.nama}
                </h3>
                <p className="text-[10px]">
                  Semester {school.semester} · Tahun Ajaran {school.tahunAjaran} · Kurikulum Merdeka Fase D
                </p>
              </div>
              <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                <img 
                  src={school.logoSekolah || "/src/assets/images/school_logo_emblem_1790936910635.jpg"} 
                  alt="Logo Sekolah" 
                  className="max-w-full max-h-full object-contain" 
                />
              </div>
            </div>

            {/* Leger Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-black print-border-table">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold border-b border-black">
                    <th rowSpan={2} className="border border-black py-1 px-1.5 w-6">No</th>
                    <th rowSpan={2} className="border border-black py-1 px-2 w-20">NISN</th>
                    <th rowSpan={2} className="border border-black py-1 px-2 min-w-[140px] text-left">Nama Peserta Didik</th>
                    <th colSpan={subjects.length} className="border border-black py-1 px-1 text-center bg-slate-200">
                      Mata Pelajaran ({raporPeriod === 'tengah_semester' ? 'Nilai STS' : 'Nilai Akhir SAS'})
                    </th>
                    <th rowSpan={2} className="border border-black py-1 px-1.5 w-12 bg-slate-200">Jumlah</th>
                    <th rowSpan={2} className="border border-black py-1 px-1.5 w-12 bg-slate-200">Rerata</th>
                    <th rowSpan={2} className="border border-black py-1 px-1 w-8">Rank</th>
                    <th colSpan={3} className="border border-black py-1 px-1 text-center bg-slate-100">Presensi</th>
                  </tr>
                  <tr className="bg-slate-50 text-center font-bold text-[9px] border-b border-black">
                    {subjects.map(s => (
                      <th key={s.id} className="border border-black py-1 px-1 w-10" title={s.nama}>
                        {s.kode}
                      </th>
                    ))}
                    <th className="border border-black py-1 px-1 w-6">S</th>
                    <th className="border border-black py-1 px-1 w-6">I</th>
                    <th className="border border-black py-1 px-1 w-6">A</th>
                  </tr>
                </thead>

                <tbody>
                  {/* Calculate rankings based on active period (STS or SAS) */}
                  {(() => {
                    const studentTotals = students.map(student => {
                      const studentSubjs = subjects.filter(subj => {
                        const isReligious = ['pai', 'pak_kristen', 'pak_katolik', 'pah_hindu', 'pab_buddha'].includes(subj.id);
                        if (!isReligious) return true;
                        const ag = (student.agama || '').toLowerCase();
                        if (subj.id === 'pai') return ag.includes('islam');
                        if (subj.id === 'pak_kristen') return ag.includes('protestan') || (ag.includes('kristen') && !ag.includes('katolik'));
                        if (subj.id === 'pak_katolik') return ag.includes('katolik') || ag.includes('khatolik');
                        if (subj.id === 'pah_hindu') return ag.includes('hindu');
                        if (subj.id === 'pab_buddha') return ag.includes('buddha') || ag.includes('budha');
                        return false;
                      });

                      const effectiveSubjs = studentSubjs.length > 0 ? studentSubjs : subjects.filter(s => !['pak_kristen', 'pak_katolik', 'pah_hindu', 'pab_buddha'].includes(s.id));

                      const total = effectiveSubjs.reduce((sum, subj) => {
                        const g = grades.find(item => item.studentId === student.id && item.subjectId === subj.id);
                        const val = raporPeriod === 'tengah_semester' 
                          ? (g?.nilaiAkhirSTS ?? g?.nilaiAkhirRapor ?? 0)
                          : (g?.nilaiAkhirRapor ?? 0);
                        return sum + val;
                      }, 0);
                      const avg = (total / effectiveSubjs.length);
                      return { student, total, avg, effectiveSubjs };
                    });

                    // Sort descending for rank
                    const sorted = [...studentTotals].sort((a, b) => b.total - a.total);
                    const rankMap: Record<string, number> = {};
                    sorted.forEach((item, index) => {
                      rankMap[item.student.id] = index + 1;
                    });

                    if (classStudents.length === 0) {
                      return (
                        <tr>
                          <td colSpan={subjects.length + 8} className="border border-black py-8 text-center text-slate-500 font-sans">
                            Belum ada peserta didik di {selectedRombel?.nama || 'kelas ini'}. Silakan tambahkan data peserta didik asli melalui menu Data Siswa atau Impor File Excel.
                          </td>
                        </tr>
                      );
                    }

                    return classStudents.map((student, idx) => {
                      const studentRecord = studentTotals.find(s => s.student.id === student.id);
                      const att = attendances.find(a => a.studentId === student.id) || { sakit: 0, izin: 0, alpa: 0 };

                      return (
                        <tr key={student.id} className="border-b border-black hover:bg-slate-50">
                          <td className="border border-black py-1 px-1.5 text-center font-mono">{idx + 1}</td>
                          <td className="border border-black py-1 px-2 font-mono text-[9px]">{student.nisn}</td>
                          <td className="border border-black py-1 px-2 font-semibold">{student.nama}</td>

                          {subjects.map(subj => {
                            const isReligious = ['pai', 'pak_kristen', 'pak_katolik', 'pah_hindu', 'pab_buddha'].includes(subj.id);
                            const ag = (student.agama || '').toLowerCase();
                            const isStudentReligious = 
                              (subj.id === 'pai' && ag.includes('islam')) ||
                              (subj.id === 'pak_kristen' && (ag.includes('protestan') || (ag.includes('kristen') && !ag.includes('katolik')))) ||
                              (subj.id === 'pak_katolik' && (ag.includes('katolik') || ag.includes('khatolik'))) ||
                              (subj.id === 'pah_hindu' && ag.includes('hindu')) ||
                              (subj.id === 'pab_buddha' && (ag.includes('buddha') || ag.includes('budha')));

                            if (isReligious && !isStudentReligious) {
                              return (
                                <td key={subj.id} className="border border-black py-1 px-1 text-center font-mono text-slate-300">
                                  -
                                </td>
                              );
                            }

                            const g = grades.find(item => item.studentId === student.id && item.subjectId === subj.id);
                            const val = raporPeriod === 'tengah_semester' 
                              ? (g?.nilaiAkhirSTS ?? g?.nilaiAkhirRapor ?? '-')
                              : (g?.nilaiAkhirRapor ?? '-');

                            return (
                              <td key={subj.id} className="border border-black py-1 px-1 text-center font-mono font-medium">
                                {val}
                              </td>
                            );
                          })}

                          <td className="border border-black py-1 px-1.5 text-center font-mono font-bold bg-slate-50">
                            {studentRecord?.total}
                          </td>
                          <td className="border border-black py-1 px-1.5 text-center font-mono font-bold bg-slate-50">
                            {studentRecord?.avg.toFixed(1)}
                          </td>
                          <td className="border border-black py-1 px-1 text-center font-mono font-bold text-blue-900">
                            {rankMap[student.id]}
                          </td>
                          <td className="border border-black py-1 px-1 text-center font-mono">{att.sakit}</td>
                          <td className="border border-black py-1 px-1 text-center font-mono">{att.izin}</td>
                          <td className="border border-black py-1 px-1 text-center font-mono">{att.alpa}</td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>

            {/* Leger Signatures */}
            {(() => {
              const selectedWali = getWaliInfo(selectedRombel.id, selectedRombel.waliKelasNama, selectedRombel.waliKelasNip);
              const kepsekInfo = getKepsekInfo();
              return (
                <div className="pt-6 grid grid-cols-2 text-center text-xs">
                  <div className="space-y-14">
                    <div>
                      <p>Mengetahui,</p>
                      <p className="font-semibold">Kepala SMPN 14 Tulang Bawang Barat,</p>
                    </div>
                    <div>
                      <p className="font-bold underline">{kepsekInfo.nama}</p>
                      <p className="font-mono text-[10px]">NIP. {kepsekInfo.nip}</p>
                    </div>
                  </div>

                  <div className="space-y-14">
                    <div>
                      <p>
                        {school.tempatRapor},{' '}
                        {school.tanggalRapor || '3 November 2026'}
                      </p>
                      <p className="font-semibold">Wali Kelas {selectedRombel.nama},</p>
                    </div>
                    <div>
                      <p className="font-bold underline">{selectedWali.nama}</p>
                      <p className="font-mono text-[10px]">NIP. {selectedWali.nip}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
