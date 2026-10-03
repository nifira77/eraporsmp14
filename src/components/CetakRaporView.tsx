import React, { useState } from 'react';
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
  Calendar
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
    rombels 
  } = state;

  // Selected filters and print configurations
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [printMode, setPrintMode] = useState<PrintMode>('rapor_nilai');
  const [raporPeriod, setRaporPeriod] = useState<AssessmentMode>('akhir_semester');
  const [printTarget, setPrintTarget] = useState<PrintTarget>('single');

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];
  const selectedRombel = rombels.find(r => r.id === selectedStudent?.rombelId) || rombels[0];

  // List of students to render
  const targetStudents = printTarget === 'all' ? students : [selectedStudent];

  // Handler for direct browser print
  const handlePrint = () => {
    window.print();
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>
                {printTarget === 'all' 
                  ? `Cetak Semua Siswa (${students.length} Siswa)` 
                  : `Cetak Rapor (${selectedStudent?.nama.split(' ')[0]})`}
              </span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Pilihan Periode Rapor: STS vs SAS */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setRaporPeriod('tengah_semester')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                raporPeriod === 'tengah_semester'
                  ? 'bg-blue-600 text-white shadow-xs'
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
                  ? 'bg-blue-600 text-white shadow-xs'
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
              Cover
            </button>
            <button
              type="button"
              onClick={() => setPrintMode('identitas')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                printMode === 'identitas' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Biodata
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
                >
                  Per Siswa
                </button>
                <button
                  type="button"
                  onClick={() => setPrintTarget('all')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold cursor-pointer ${
                    printTarget === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Cetak Semua ({students.length})</span>
                </button>
              </div>

              {printTarget === 'single' && (
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs cursor-pointer"
                >
                  {students.map((s, idx) => (
                    <option key={s.id} value={s.id}>
                      {idx + 1}. {s.nama} ({s.nisn})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        {/* Mode Information Callout */}
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <span className="font-bold">Status Konfigurasi:</span>
            <span>
              {raporPeriod === 'tengah_semester' 
                ? 'Judul Rapor: LAPORAN HASIL BELAJAR TENGAH SEMESTER' 
                : 'Judul Rapor: LAPORAN HASIL BELAJAR (RAPOR AKHIR SEMESTER)'}
            </span>
            <span>·</span>
            <span className="font-semibold text-blue-800">
              {printTarget === 'all' ? `Mode Bundle: Semua Siswa (${students.length} Lembar)` : `Siswa: ${selectedStudent?.nama}`}
            </span>
          </div>

          <span className="hidden sm:inline-block text-[11px] text-blue-700">
            Otomatis terformat halaman A4 portrait & pemutus halaman (page-break) saat dicetak.
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
            {targetStudents.map((student, studentIndex) => {
              const studentData = getStudentData(student);
              const rombel = rombels.find(r => r.id === student.rombelId) || selectedRombel;

              return (
                <div 
                  key={student.id}
                  className="bg-white text-black p-8 sm:p-12 w-full max-w-[210mm] min-h-[297mm] shadow-xl border border-slate-300 rounded-sm font-sans text-xs print:m-0 print:p-0 print:w-full print:border-none print:shadow-none print-page-break"
                >
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
                      <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wide">
                        PEMERINTAH KABUPATEN {school.kabupaten}
                      </p>
                      <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wide">
                        DINAS PENDIDIKAN DAN KEBUDAYAAN
                      </p>
                      <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-tight">
                        {school.namaSekolah}
                      </h2>
                      <p className="text-[9.5px] leading-tight text-slate-800">
                        {school.alamat}, {school.kecamatan}, Kab. {school.kabupaten}, Provinsi {school.provinsi}
                      </p>
                      <p className="text-[9px] font-mono text-slate-700">
                        NPSN: {school.npsn} · NSS: {school.nss} · Telp: {school.telepon} · Email: {school.email}
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

                    {/* KETIDAKHADIRAN & PRESTASI */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Presensi */}
                      <div className="space-y-1">
                        <h3 className="font-bold text-[11px] uppercase tracking-wide">
                          {raporPeriod === 'tengah_semester' ? 'B. Ketidakhadiran (Presensi Tengah Semester)' : 'C. Ketidakhadiran (Presensi)'}
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

                      {/* Prestasi atau Catatan Singkat */}
                      <div className="space-y-1">
                        <h3 className="font-bold text-[11px] uppercase tracking-wide">
                          {raporPeriod === 'tengah_semester' ? 'C. Catatan Perkembangan' : 'D. Prestasi Yang Diraih'}
                        </h3>
                        {raporPeriod === 'tengah_semester' ? (
                          <div className="border border-black p-2 min-h-[62px] text-[10px] leading-relaxed italic bg-slate-50/20">
                            "Menunjukkan keaktifan dan semangat belajar yang konsisten pada paruh semester ganjil. Tingkatkan terus kesiapan menghadapi ujian semester."
                          </div>
                        ) : (
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
                        )}
                      </div>
                    </div>

                    {/* CATATAN WALI KELAS */}
                    <div className="space-y-1">
                      <h3 className="font-bold text-[11px] uppercase tracking-wide">
                        {raporPeriod === 'tengah_semester' ? 'D. Catatan Wali Kelas' : 'E. Catatan Wali Kelas'}
                      </h3>
                      <div className="border border-black p-2.5 min-h-[44px] text-[10.5px] leading-relaxed italic bg-slate-50/30">
                        "{studentData.studentNote}"
                      </div>
                    </div>

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
                          <p className="font-bold underline uppercase">{school.kepalaSekolah}</p>
                          <p className="font-mono text-[9.5px]">NIP. {school.nipKepalaSekolah}</p>
                        </div>
                      </div>

                      {/* Wali Kelas */}
                      <div className="space-y-14">
                        <div>
                          <p>
                            {school.tempatRapor},{' '}
                            {raporPeriod === 'tengah_semester' ? '17 Oktober 2026' : school.tanggalRapor}
                          </p>
                          <p className="font-medium">Wali Kelas {rombel.nama},</p>
                        </div>
                        <div>
                          <p className="font-bold underline uppercase">{rombel.waliKelasNama}</p>
                          <p className="font-mono text-[9.5px]">NIP. {rombel.waliKelasNip}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 2: COVER RAPOR RESMI KEMDIKBUD */}
        {/* ============================================================== */}
        {printMode === 'cover' && (
          <div className="w-full flex flex-col items-center gap-8 print:gap-0">
            {targetStudents.map((student) => (
              <div 
                key={student.id}
                className="bg-white text-black p-12 w-full max-w-[210mm] min-h-[297mm] shadow-xl border border-slate-300 rounded-sm flex flex-col justify-between items-center text-center font-serif print:m-0 print:p-0 print:border-none print:shadow-none print-page-break"
              >
                <div className="space-y-3 pt-6">
                  <div className="w-24 h-24 mx-auto mb-2">
                    <img 
                      src="/src/assets/images/kemdikbud_logo_1791032931328.jpg" 
                      alt="Logo Tut Wuri Handayani" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <h1 className="text-xl font-extrabold tracking-wider uppercase font-sans text-slate-900">
                    {raporPeriod === 'tengah_semester' 
                      ? 'LAPORAN HASIL BELAJAR TENGAH SEMESTER' 
                      : 'RAPOR PESERTA DIDIK'}
                  </h1>
                  <h2 className="text-base font-bold tracking-wide uppercase font-sans">
                    SEKOLAH MENENGAH PERTAMA (SMP)
                  </h2>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
                  </p>
                  <p className="text-xs font-sans tracking-wide">
                    KURIKULUM MERDEKA · FASE D
                  </p>
                </div>

                {/* School Emblem / Logo */}
                <div className="my-8 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full border-2 border-black flex items-center justify-center p-2 shadow-xs bg-white">
                    <img 
                      src={school.logoSekolah || "/src/assets/images/school_logo_emblem_1790936910635.jpg"} 
                      alt="Lambang SMPN 14 Tulang Bawang Barat" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Student Name Box */}
                <div className="space-y-6 w-full max-w-md font-sans">
                  <div className="space-y-2">
                    <p className="text-xs uppercase font-medium">Nama Peserta Didik:</p>
                    <div className="border border-black py-2 px-4 font-bold text-base uppercase bg-slate-50">
                      {student.nama}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs uppercase font-medium">NISN / NIS:</p>
                    <p className="font-mono font-bold text-sm">
                      {student.nisn} / {student.nis}
                    </p>
                  </div>
                </div>

                {/* Ministry & School Footer */}
                <div className="space-y-2 pt-8 font-sans">
                  <h3 className="text-base font-bold uppercase tracking-tight">
                    {school.namaSekolah}
                  </h3>
                  <p className="text-xs max-w-sm mx-auto leading-relaxed">
                    DINAS PENDIDIKAN DAN KEBUDAYAAN KABUPATEN TULANG BAWANG BARAT
                  </p>
                  <p className="text-xs font-semibold">
                    PROVINSI LAMPUNG
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 3: IDENTITAS PESERTA DIDIK (BIODATA) */}
        {/* ============================================================== */}
        {printMode === 'identitas' && (
          <div className="w-full flex flex-col items-center gap-8 print:gap-0">
            {targetStudents.map((student) => (
              <div 
                key={student.id}
                className="bg-white text-black p-10 sm:p-14 w-full max-w-[210mm] min-h-[297mm] shadow-xl border border-slate-300 rounded-sm font-sans text-xs print:m-0 print:p-0 print:border-none print:shadow-none print-page-break space-y-6"
              >
                <div className="text-center pb-4 border-b-2 border-black space-y-1">
                  <h2 className="text-sm font-bold uppercase tracking-wide">
                    IDENTITAS PESERTA DIDIK
                  </h2>
                  <p className="text-xs font-medium">
                    KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI
                  </p>
                </div>

                <div className="space-y-3 leading-relaxed text-xs">
                  <div className="flex">
                    <span className="w-8 font-mono">1.</span>
                    <span className="w-56 font-semibold">Nama Lengkap Siswa</span>
                    <span className="w-4">:</span>
                    <span className="font-bold uppercase">{student.nama}</span>
                  </div>
                  <div className="flex">
                    <span className="w-8 font-mono">2.</span>
                    <span className="w-56 font-semibold">Nomor Induk Siswa (NIS)</span>
                    <span className="w-4">:</span>
                    <span className="font-mono">{student.nis}</span>
                  </div>
                  <div className="flex">
                    <span className="w-8 font-mono">3.</span>
                    <span className="w-56 font-semibold">Nomor Induk Siswa Nasional (NISN)</span>
                    <span className="w-4">:</span>
                    <span className="font-mono font-semibold">{student.nisn}</span>
                  </div>
                  <div className="flex">
                    <span className="w-8 font-mono">4.</span>
                    <span className="w-56 font-semibold">Tempat, Tanggal Lahir</span>
                    <span className="w-4">:</span>
                    <span>{student.tempatLahir}, {student.tanggalLahir}</span>
                  </div>
                  <div className="flex">
                    <span className="w-8 font-mono">5.</span>
                    <span className="w-56 font-semibold">Jenis Kelamin</span>
                    <span className="w-4">:</span>
                    <span>{student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-8 font-mono">6.</span>
                    <span className="w-56 font-semibold">Agama</span>
                    <span className="w-4">:</span>
                    <span>{student.agama}</span>
                  </div>
                  <div className="flex">
                    <span className="w-8 font-mono">7.</span>
                    <span className="w-56 font-semibold">Pendidikan Sebelumnya</span>
                    <span className="w-4">:</span>
                    <span>Sekolah Dasar (SD / MI)</span>
                  </div>
                  <div className="flex">
                    <span className="w-8 font-mono">8.</span>
                    <span className="w-56 font-semibold">Alamat Peserta Didik</span>
                    <span className="w-4">:</span>
                    <span>{student.alamat}</span>
                  </div>
                  <div className="flex">
                    <span className="w-8 font-mono">9.</span>
                    <span className="w-56 font-semibold">Nama Orang Tua</span>
                    <span className="w-4">:</span>
                    <div className="space-y-1">
                      <p>a. Ayah : {student.namaAyah}</p>
                      <p>b. Ibu : {student.namaIbu}</p>
                    </div>
                  </div>
                  <div className="flex">
                    <span className="w-8 font-mono">10.</span>
                    <span className="w-56 font-semibold">Pekerjaan Orang Tua</span>
                    <span className="w-4">:</span>
                    <span>{student.pekerjaanOrangTua}</span>
                  </div>
                  <div className="flex">
                    <span className="w-8 font-mono">11.</span>
                    <span className="w-56 font-semibold">Alamat Orang Tua</span>
                    <span className="w-4">:</span>
                    <span>{student.alamat}</span>
                  </div>
                </div>

                {/* Pasfoto & TTD Kepala Sekolah */}
                <div className="pt-12 flex justify-between items-end">
                  <div className="w-28 h-36 border border-black flex items-center justify-center text-[10px] text-slate-400 font-mono">
                    Pasfoto 3 x 4
                  </div>

                  <div className="text-center space-y-16">
                    <div>
                      <p>{school.tempatRapor}, 15 Juli 2024</p>
                      <p className="font-semibold">Kepala {school.namaSekolah},</p>
                    </div>
                    <div>
                      <p className="font-bold underline uppercase">{school.kepalaSekolah}</p>
                      <p className="font-mono text-[10px]">NIP. {school.nipKepalaSekolah}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ============================================================== */}
        {/* MODE 4: LEGER NILAI SEMESTER (FORMAT SHEET LENGKAP KELAS VII-A) */}
        {/* ============================================================== */}
        {printMode === 'leger' && (
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

                    return students.map((student, idx) => {
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
            <div className="pt-6 grid grid-cols-2 text-center text-xs">
              <div className="space-y-14">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-semibold">Kepala SMPN 14 Tulang Bawang Barat,</p>
                </div>
                <div>
                  <p className="font-bold underline uppercase">{school.kepalaSekolah}</p>
                  <p className="font-mono text-[10px]">NIP. {school.nipKepalaSekolah}</p>
                </div>
              </div>

              <div className="space-y-14">
                <div>
                  <p>
                    {school.tempatRapor},{' '}
                    {raporPeriod === 'tengah_semester' ? '17 Oktober 2026' : school.tanggalRapor}
                  </p>
                  <p className="font-semibold">Wali Kelas {selectedRombel.nama},</p>
                </div>
                <div>
                  <p className="font-bold underline uppercase">{selectedRombel.waliKelasNama}</p>
                  <p className="font-mono text-[10px]">NIP. {selectedRombel.waliKelasNip}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
