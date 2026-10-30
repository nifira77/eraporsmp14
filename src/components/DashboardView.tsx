import React, { useState } from 'react';
import { ERaporState } from '../types/erapor';
import { ActiveTab } from './Sidebar';
import {
  Users,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  School,
  Sparkles,
  CalendarCheck,
  Calendar,
  AlertCircle,
  Printer,
  ChevronRight,
  GraduationCap
} from 'lucide-react';

interface DashboardViewProps {
  state: ERaporState;
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ state, onNavigate }) => {
  const { school, currentUser, students, subjects, grades, rombels = [], isLocked, users = [] } = state;

  // Selected filter rombel for overview (defaults to user's class or 7.1)
  const defaultRombelId = currentUser.rombelId || (rombels[0]?.id ?? '7.1');
  const [selectedRombelId, setSelectedRombelId] = useState<string>(defaultRombelId);

  // Active class resolved
  const activeRombel = rombels.find(r => r.id === selectedRombelId) || rombels[0] || {
    id: '7.1',
    nama: 'Kelas 7.1',
    tingkat: 7,
    fase: 'Fase D'
  };

  const activeClassStudents = students.filter(s => s.rombelId === activeRombel.id);
  const classStudentCount = activeClassStudents.length;

  // Compute overall statistics
  const totalStudents = students.length;
  const totalSubjects = subjects.length;

  // Calculate average overall grade
  const validGrades = grades.filter(g => (g.nilaiAkhirRapor && g.nilaiAkhirRapor > 0) || (g.nilaiAkhirSTS && g.nilaiAkhirSTS > 0));
  const averageGrade = validGrades.length > 0 
    ? (validGrades.reduce((acc, curr) => acc + (curr.nilaiAkhirRapor || curr.nilaiAkhirSTS || 0), 0) / validGrades.length).toFixed(1)
    : '0';

  // Percentage of students achieving KKTP
  const passingGrades = validGrades.filter(g => {
    const subj = subjects.find(s => s.id === g.subjectId);
    const score = g.nilaiAkhirRapor || g.nilaiAkhirSTS || 0;
    return score >= (subj?.kktp || 75);
  });
  const passingRate = validGrades.length > 0 
    ? Math.round((passingGrades.length / validGrades.length) * 100) 
    : 0;

  // Calculate completion status per subject for the selected rombel
  const activeClassStudentIds = new Set(activeClassStudents.map(s => s.id));
  const subjectProgress = subjects.map(subject => {
    const subjectGrades = grades.filter(g => 
      g.subjectId === subject.id && 
      (activeClassStudentIds.has(g.studentId) || g.rombelId === activeRombel.id)
    );
    const completedCount = subjectGrades.filter(g => 
      (g.nilaiAkhirRapor && g.nilaiAkhirRapor > 0) || 
      (g.nilaiAkhirSTS && g.nilaiAkhirSTS > 0) || 
      (g.nilaiAkhirLM && g.nilaiAkhirLM > 0)
    ).length;
    const targetStudentCount = activeClassStudents.length || 1;
    const isComplete = completedCount >= targetStudentCount;
    const validScores = subjectGrades.map(g => g.nilaiAkhirRapor || g.nilaiAkhirSTS || 0).filter(v => v > 0);
    const avg = validScores.length > 0
      ? (validScores.reduce((sum, v) => sum + v, 0) / validScores.length).toFixed(1)
      : '-';

    return {
      ...subject,
      completedCount,
      totalStudents: targetStudentCount,
      isComplete,
      avg
    };
  });

  const completedSubjectsCount = subjectProgress.filter(s => s.isComplete).length;
  const overallClassProgress = Math.round((completedSubjectsCount / totalSubjects) * 100);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8">
      {/* ============================================================== */}
      {/* 1. HERO BANNER: EKSEKUTIF, MODERN & PENGINGAT RAPOR STS        */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 border border-slate-800 text-white shadow-xl">
        {/* Subtle Ambient Glow and Blueprint Texture */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <img 
            src="/src/assets/images/school_campus_banner_1790936926321.jpg" 
            alt="Kampus SMPN 14 Tulang Bawang Barat" 
            className="w-full h-full object-cover mix-blend-luminosity filter brightness-90"
          />
        </div>
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-sky-200 border border-white/15 font-semibold backdrop-blur-md">
                Kurikulum Merdeka · Fase D
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/15 font-semibold backdrop-blur-md">
                T.A. {school.tahunAjaran} · Semester {school.semester}
              </span>
              {isLocked ? (
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-200 border border-amber-400/30 font-semibold backdrop-blur-md flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Input Nilai Terkunci
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-semibold backdrop-blur-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Periode Penilaian Aktif
                </span>
              )}
            </div>

            {/* Greeting Headline */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Selamat Datang, {currentUser.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                Anda masuk sebagai{' '}
                <strong className="text-white font-semibold">
                  {currentUser.role === 'admin' && 'Administrator Sistem e-Rapor SP'}
                  {currentUser.role === 'kepala_sekolah' && 'Kepala Sekolah'}
                  {currentUser.role === 'wali_kelas' && `Wali Kelas ${activeRombel.nama}`}
                  {currentUser.role === 'guru_mapel' && 'Guru Mata Pelajaran'}
                </strong>{' '}
                pada portal resmi penilaian {school.namaSekolah}.
              </p>
            </div>

            {/* Prominent STS Distribution Reminder */}
            <div className="p-3.5 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-400/30 rounded-xl flex items-start gap-3 backdrop-blur-md text-amber-100">
              <Calendar className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-amber-200">
                  Agenda Akademik: Pembagian Rapor STS pada Selasa, 3 November 2026
                </p>
                <p className="text-[11px] text-slate-300">
                  Pastikan KKTP per mapel, Nilai Murni STS, dan presensi telah lengkap terinput sebelum proses pencetakan.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('input_nilai')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <FileText className="w-4 h-4" />
              <span>Input Nilai STS / SAS</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('cetak_rapor')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen Rapor</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('data_siswa')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-slate-200 rounded-xl text-xs font-semibold border border-white/15 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Users className="w-4 h-4 text-slate-300" />
              <span>Data Peserta Didik</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. TOP METRICS GRID (CLEAN, SINGLE ELEVATION, TABULAR NUMS)   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Peserta Didik */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all duration-150 flex items-center justify-between group">
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {currentUser.role === 'wali_kelas' ? `Peserta Didik (${activeRombel.nama})` : 'Total Peserta Didik'}
            </p>
            <p className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
              {currentUser.role === 'wali_kelas' ? classStudentCount : totalStudents}{' '}
              <span className="text-xs font-normal text-slate-500">Siswa</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              12 Rombongan Belajar (7.1 s.d. 9.4)
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Mata Pelajaran */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all duration-150 flex items-center justify-between group">
          <div>
            <p className="text-xs font-semibold text-slate-500">Mata Pelajaran</p>
            <p className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
              {totalSubjects} <span className="text-xs font-normal text-slate-500">Mapel</span>
            </p>
            <p className="text-[11px] text-indigo-700 font-medium mt-1 truncate max-w-[170px]">
              Termasuk Mulok Lampung & Tubaba
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Rerata Nilai Rapor */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all duration-150 flex items-center justify-between group">
          <div>
            <p className="text-xs font-semibold text-slate-500">Rerata Nilai STS</p>
            <p className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
              {averageGrade} <span className="text-xs font-normal text-slate-500">/ 100</span>
            </p>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-700 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Skala Penilaian Kualitatif</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Ketercapaian KKTP */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all duration-150 flex items-center justify-between group">
          <div>
            <p className="text-xs font-semibold text-slate-500">Ketuntasan KKTP</p>
            <p className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
              {passingRate}%
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {passingGrades.length} dari {validGrades.length} data nilai tuntas
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MAIN WORKSPACE: PROGRESS PENGINPUTAN NILAI & DETAIL MAPEL   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Progress Penginputan Nilai per Rombel (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Progress Penginputan Nilai Mata Pelajaran
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pemantauan kesiapan data rapor {activeRombel.nama} ({activeClassStudents.length} Peserta Didik)
              </p>
            </div>

            {/* Rombel Switcher (Allows Admin & Teachers to inspect classes) */}
            <div className="flex items-center gap-2">
              <label htmlFor="filter-rombel-select" className="text-xs font-medium text-slate-600">
                Kelas:
              </label>
              <select
                id="filter-rombel-select"
                value={selectedRombelId}
                onChange={(e) => setSelectedRombelId(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                {rombels.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.nama} ({r.fase})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Overall Progress Tracker Bar */}
          <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Kesiapan Rapor {activeRombel.nama}</span>
              <span className="font-bold text-blue-700 font-mono tabular-nums">
                {completedSubjectsCount} / {totalSubjects} Mapel ({overallClassProgress}%)
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallClassProgress}%` }}
              />
            </div>
          </div>

          {/* Subject Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Mata Pelajaran</th>
                  <th className="py-2.5 px-3 font-semibold">Guru Pengampu</th>
                  <th className="py-2.5 px-3 font-semibold text-center">KKTP</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Rerata</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status Input</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjectProgress.map((subj) => (
                  <tr key={subj.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span>{subj.nama}</span>
                        {subj.id === 'mulok_tubaba' && (
                          <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                            Mulok Tubaba
                          </span>
                        )}
                        {subj.id === 'mulok' && (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Mulok Lampung
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {subj.guruPengampuNama}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-700">
                      {subj.kktp}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-900">
                      {subj.avg}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {subj.isComplete ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Lengkap ({subj.completedCount}/{subj.totalStudents})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Proses ({subj.completedCount}/{subj.totalStudents})
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => onNavigate('input_nilai')}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        Buka Nilai
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Workflow Guide & Official School Data */}
        <div className="space-y-5">
          {/* Alur Kerja Rapor STS Kurikulum Merdeka */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Alur Kerja Penilaian Rapor STS
              </h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Panduan tahapan pengisian dan validasi data rapor Sumatif Tengah Semester:
            </p>

            <ol className="space-y-3 text-xs text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  <strong className="font-semibold text-slate-900">Input Nilai Murni STS:</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Guru mapel menginput nilai asesmen STS asli peserta didik sesuai KKTP masing-masing mapel.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  <strong className="font-semibold text-slate-900">Catatan & Ekstrakurikuler:</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Wali Kelas melengkapi kehadiran/presensi, nilai ekstrakurikuler, dan catatan wali kelas.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  <strong className="font-semibold text-slate-900">Cetak & Validasi Kepala Sekolah:</strong>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Cetak Buku Rapor resmi dengan tanda tangan digital dan stempel sekolah sebelum pembagian.
                  </p>
                </div>
              </li>
            </ol>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigate('analisis')}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Lihat Analisis Statistik Nilai</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* School Profile Card */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-xs space-y-2 text-slate-600">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-blue-700" />
              <h4 className="font-bold text-slate-900">{school.namaSekolah}</h4>
            </div>
            <p className="text-[11px] leading-relaxed">
              {school.alamat}, {school.kecamatan}, Kab. {school.kabupaten}, Provinsi {school.provinsi}
            </p>
            <div className="pt-2 border-t border-slate-200 text-[11px] space-y-1">
              <p>
                <span className="text-slate-500">NPSN:</span>{' '}
                <span className="font-mono font-semibold text-slate-800">{school.npsn}</span> ·{' '}
                <span className="text-slate-500">NSS NIS:</span>{' '}
                <span className="font-mono font-semibold text-slate-800">{school.nss}</span>
              </p>
              <p>
                <span className="text-slate-500">Kepala Sekolah:</span>{' '}
                <strong className="text-slate-800">
                  {users.find(u => u.role === 'admin' || u.role === 'kepala_sekolah')?.name || school.kepalaSekolah}
                </strong>
              </p>
              <p>
                <span className="text-slate-500">NIP:</span>{' '}
                <span className="font-mono font-semibold text-slate-800">
                  {users.find(u => u.role === 'admin' || u.role === 'kepala_sekolah')?.nip || school.nipKepalaSekolah}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

