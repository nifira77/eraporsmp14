import React from 'react';
import { ERaporState, UserRole } from '../types/erapor';
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
  AlertCircle,
  School,
  Sparkles,
  CalendarCheck
} from 'lucide-react';

interface DashboardViewProps {
  state: ERaporState;
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ state, onNavigate }) => {
  const { school, currentUser, students, subjects, grades, rombels = [], isLocked } = state;

  // Resolve current active class for user (wali kelas or default rombel)
  const userRombel = (rombels && rombels.length > 0)
    ? (rombels.find(r => r.id === currentUser.rombelId) ||
       rombels.find(r => r.waliKelasId === currentUser.id) ||
       rombels[0])
    : { id: '7.1', nama: 'Kelas 7.1', tingkat: 7, fase: 'Fase D' };
  const activeClassName = userRombel.nama;
  const activeClassStudents = students.filter(s => s.rombelId === userRombel.id);
  const classStudentCount = activeClassStudents.length;

  // Compute school & class statistics
  const totalStudents = students.length;
  const totalSubjects = subjects.length;

  // Calculate average overall grade
  const validGrades = grades.filter(g => g.nilaiAkhirRapor > 0);
  const averageGrade = validGrades.length > 0 
    ? (validGrades.reduce((acc, curr) => acc + curr.nilaiAkhirRapor, 0) / validGrades.length).toFixed(1)
    : '0';

  // Percentage of students achieving KKTP
  const passingGrades = grades.filter(g => {
    const subj = subjects.find(s => s.id === g.subjectId);
    return g.nilaiAkhirRapor >= (subj?.kktp || 75);
  });
  const passingRate = validGrades.length > 0 
    ? Math.round((passingGrades.length / validGrades.length) * 100) 
    : 0;

  // Calculate completion status per subject for active class
  const subjectProgress = subjects.map(subject => {
    const subjectGrades = grades.filter(g => g.subjectId === subject.id && (g.rombelId === userRombel.id || g.rombelId === '7.1'));
    const completedCount = subjectGrades.filter(g => g.nilaiAkhirRapor > 0).length;
    const isComplete = (activeClassStudents.length > 0 || totalStudents > 0) && completedCount >= (activeClassStudents.length || totalStudents);
    const avg = subjectGrades.length > 0
      ? (subjectGrades.reduce((sum, g) => sum + g.nilaiAkhirRapor, 0) / subjectGrades.length).toFixed(1)
      : '0';

    return {
      ...subject,
      completedCount,
      totalStudents: activeClassStudents.length || totalStudents,
      isComplete,
      avg
    };
  });

  const completedSubjectsCount = subjectProgress.filter(s => s.isComplete).length;
  const overallClassProgress = Math.round((completedSubjectsCount / totalSubjects) * 100);

  return (
    <div className="space-y-6">
      {/* Official Kemdikbud e-Rapor SP Banner */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 border-l-4 border-l-blue-600 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 border border-blue-900 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-xs">
            {school.logoSekolah ? (
              <img 
                src={school.logoSekolah} 
                alt="Logo Sekolah" 
                className="w-full h-full object-contain"
              />
            ) : (
              <School className="w-7 h-7 text-white" />
            )}
          </div>
          <div>
            <p className="text-[11px] font-bold text-blue-700 tracking-wider uppercase">
              Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi
            </p>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Aplikasi e-Rapor SP Kurikulum Merdeka
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {school.namaSekolah} · Jenjang SMP (Fase D) · Tahun Pelajaran {school.tahunAjaran} Semester {school.semester}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentUser.role === 'guru_mapel' && (
            <button
              type="button"
              onClick={() => onNavigate('input_nilai')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Input Nilai Sumatif</span>
            </button>
          )}

          {currentUser.role === 'wali_kelas' && (
            <button
              type="button"
              onClick={() => onNavigate('cetak_rapor')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
              title={`Cetak rapor untuk peserta didik di ${activeClassName}`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Cetak Rapor {activeClassName}</span>
            </button>
          )}

          {(currentUser.role === 'admin' || currentUser.role === 'kepala_sekolah') && (
            <button
              type="button"
              onClick={() => onNavigate('cetak_rapor')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-500/20 transition-all cursor-pointer"
              title="Buka Pusat Cetak Dokumen Rapor Berdasarkan Kelas"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Cetak Rapor Berdasarkan Kelas ({rombels.length} Kelas)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('data_siswa')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Data Siswa</span>
          </button>
        </div>
      </div>

      {/* Kemdikbud Welcome Card with Campus Background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md border border-blue-950/60">
        <div className="absolute inset-0 opacity-25 mix-blend-overlay">
          <img 
            src="/src/assets/images/school_campus_banner_1790936926321.jpg" 
            alt="Kampus SMPN 14 Tulang Bawang Barat" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/30 backdrop-blur-xs">
                Fase D (Kurikulum Merdeka)
              </span>
              {isLocked ? (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/30 text-amber-200 border border-amber-400/30 backdrop-blur-xs">
                  Status Penginputan Terkunci
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 backdrop-blur-xs">
                  Periode Penilaian Aktif
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Selamat Datang, {currentUser.name}
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed">
              Anda masuk pada Sistem Penilaian e-Rapor SP Kurikulum Merdeka sebagai <strong className="text-white font-semibold">
                {currentUser.role === 'guru_mapel' && 'Guru Mata Pelajaran'}
                {currentUser.role === 'wali_kelas' && 'Wali Kelas & Guru Mapel'}
                {currentUser.role === 'admin' && 'Administrator Sekolah'}
                {currentUser.role === 'kepala_sekolah' && 'Kepala Sekolah'}
              </strong>. Pastikan seluruh Tujuan Pembelajaran (TP) dan nilai sumatif terinput sebelum tanggal pencetakan rapor resmi ({school.tanggalRapor}).
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-blue-200/90 font-medium">
              <span className="flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-sky-400" />
                NPSN: {school.npsn}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-sky-400" />
                Tanggal Rapor: {school.tanggalRapor}
              </span>
              <span>·</span>
              <span className="text-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Cloud Real-Time Aktif
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <div>
            <p className="text-xs font-semibold text-slate-500">
              {currentUser.role === 'wali_kelas' ? `Peserta Didik (${activeClassName})` : `Total Peserta Didik (12 Kelas)`}
            </p>
            <p className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
              {currentUser.role === 'wali_kelas' ? classStudentCount : totalStudents} <span className="text-xs font-normal text-slate-500">Siswa</span>
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 font-medium">
              <span className="text-emerald-600 font-bold">100%</span>
              <span>Terdaftar di Dapodik</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
          <div>
            <p className="text-xs font-semibold text-slate-500">Mata Pelajaran Diampu</p>
            <p className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
              {totalSubjects} <span className="text-xs font-normal text-slate-500">Mapel</span>
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 font-medium">
              <span className="text-indigo-600 font-semibold truncate max-w-[150px]">Mulok Lampung & Tubaba</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div>
            <p className="text-xs font-semibold text-slate-500">Rerata Nilai Akhir</p>
            <p className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
              {averageGrade} <span className="text-xs font-normal text-slate-500">/ 100</span>
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Diatas KKTP Rata-rata</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex items-center justify-between group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div>
            <p className="text-xs font-semibold text-slate-500">Ketercapaian TP (KKTP)</p>
            <p className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums mt-1">
              {passingRate}%
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 font-medium">
              <span>{passingGrades.length} dari {validGrades.length} tuntas</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Progress Penilaian & Ringkasan Wali Kelas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Progress Penginputan Nilai per Mapel (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Progress Penginputan Nilai Guru Mata Pelajaran
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pemantauan kesiapan data rapor Semester {school.semester} {currentUser.role === 'wali_kelas' ? activeClassName : 'Semua Rombel (12 Kelas)'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                {completedSubjectsCount} / {totalSubjects} Mapel
              </span>
              <span className="block text-[11px] text-slate-500 font-medium">{overallClassProgress}% Siap Cetak</span>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${overallClassProgress}%` }}
            />
          </div>

          {/* Subject Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Mata Pelajaran</th>
                  <th className="py-2.5 px-3 font-semibold">Guru Pengampu</th>
                  <th className="py-2.5 px-3 font-semibold text-center">KKTP</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Rerata Nilai</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Status Data</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjectProgress.map((subj) => (
                  <tr key={subj.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span>{subj.nama}</span>
                        {subj.id === 'mulok_tubaba' && (
                          <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 shrink-0">
                            Mulok Karakter Tubaba
                          </span>
                        )}
                        {subj.id === 'mulok' && (
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shrink-0">
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
                          Belum Lengkap ({subj.completedCount}/{subj.totalStudents})
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

        {/* Right Column: Quick Role Guide & Official Information */}
        <div className="space-y-4">
          {/* Quick Role Workflow Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Alur Kerja e-Rapor SMP
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Panduan langkah pengisian nilai rapor Kurikulum Merdeka untuk guru & wali kelas:
            </p>

            <ol className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px] shadow-2xs">1</span>
                <div>
                  <strong className="font-semibold text-slate-900">Guru Mapel:</strong>
                  <p className="text-slate-500 text-[11px]">Input Tujuan Pembelajaran (TP) dan nilai Sumatif LM, STS, & SAS.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px] shadow-2xs">2</span>
                <div>
                  <strong className="font-semibold text-slate-900">Wali Kelas:</strong>
                  <p className="text-slate-500 text-[11px]">Cek kelengkapan nilai, isi presensi, ekstrakurikuler, dan catatan rapor.</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px] shadow-2xs">3</span>
                <div>
                  <strong className="font-semibold text-slate-900">Cetak & Distribusi:</strong>
                  <p className="text-slate-500 text-[11px]">Cetak Rapor Kurikulum Merdeka resmi dan Leger Nilai untuk arsip sekolah.</p>
                </div>
              </li>
            </ol>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigate('analisis')}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Lihat Analisis Perkembangan Siswa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* School Contact Card */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200/80 p-5 text-xs space-y-2 text-slate-600">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-blue-700" />
              <h4 className="font-bold text-slate-900">{school.namaSekolah}</h4>
            </div>
            <p className="text-[11px] leading-relaxed">
              {school.alamat}, {school.kecamatan}, Kab. {school.kabupaten}, Provinsi {school.provinsi}
            </p>
            <div className="pt-2 border-t border-slate-200/80 text-[11px] space-y-1">
              <p><span className="text-slate-500">NPSN:</span> <span className="font-mono font-semibold">{school.npsn}</span> · <span className="text-slate-500">NSS NIS:</span> <span className="font-mono font-semibold">{school.nss}</span></p>
              <p><span className="text-slate-500">Kepala Sekolah:</span> <strong className="text-slate-800">{school.kepalaSekolah}</strong></p>
              <p><span className="text-slate-500">NIP:</span> <span className="font-mono font-semibold">{school.nipKepalaSekolah}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
