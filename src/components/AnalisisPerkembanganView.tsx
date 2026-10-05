import React, { useState, useMemo } from 'react';
import { 
  ERaporState, 
  Subject, 
  Student 
} from '../types/erapor';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Search, 
  Download, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  BrainCircuit,
  GraduationCap
} from 'lucide-react';

interface AnalisisPerkembanganViewProps {
  state: ERaporState;
}

export const AnalisisPerkembanganView: React.FC<AnalisisPerkembanganViewProps> = ({ state }) => {
  const { students, subjects, grades, attendances, learningObjectives, school, rombels = [], currentUser } = state;

  const [selectedRombelId, setSelectedRombelId] = useState<string>(() => {
    if (currentUser?.rombelId && rombels.some(r => r.id === currentUser.rombelId)) {
      return currentUser.rombelId;
    }
    return rombels[0]?.id || '7.1';
  });

  const selectedRombel = rombels.find(r => r.id === selectedRombelId) || rombels[0] || { id: '7.1', nama: 'Kelas 7.1' };
  const classStudents = useMemo(() => students.filter(s => s.rombelId === selectedRombelId), [students, selectedRombelId]);

  const [activeTab, setActiveTab] = useState<'ringkasan' | 'radar_siswa' | 'remedial' | 'ranking'>('ringkasan');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    const list = students.filter(s => s.rombelId === (currentUser?.rombelId || rombels[0]?.id || '7.1'));
    return list[0]?.id || students[0]?.id || '';
  });
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('mtk');

  // Selected student
  const activeStudents = classStudents.length > 0 ? classStudents : students;
  const selectedStudent = activeStudents.find(s => s.id === selectedStudentId) || activeStudents[0] || students[0];
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  // Subject statistics
  const subjectStats = useMemo(() => {
    return subjects.map(subject => {
      const subjGrades = grades.filter(g => g.subjectId === subject.id && g.nilaiAkhirRapor > 0);
      const scores = subjGrades.map(g => g.nilaiAkhirRapor);
      const count = scores.length;
      const avg = count > 0 ? (scores.reduce((a, b) => a + b, 0) / count) : 0;
      const highest = count > 0 ? Math.max(...scores) : 0;
      const lowest = count > 0 ? Math.min(...scores) : 0;
      const passedCount = scores.filter(s => s >= subject.kktp).length;
      const passRate = count > 0 ? Math.round((passedCount / count) * 100) : 0;

      return {
        ...subject,
        avg: parseFloat(avg.toFixed(1)),
        highest,
        lowest,
        passRate,
        passedCount,
        count
      };
    });
  }, [subjects, grades]);

  // Overall class ranking data
  const studentRankings = useMemo(() => {
    const list = activeStudents.map(student => {
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

      const sGrades = effectiveSubjs.map(s => {
        const g = grades.find(item => item.studentId === student.id && item.subjectId === s.id);
        return {
          subject: s,
          score: g?.nilaiAkhirRapor || 0
        };
      });

      const total = sGrades.reduce((sum, item) => sum + item.score, 0);
      const avg = effectiveSubjs.length > 0 ? parseFloat((total / effectiveSubjs.length).toFixed(1)) : 0;
      const belowKKTP = sGrades.filter(item => item.score < item.subject.kktp).length;
      const att = attendances.find(a => a.studentId === student.id) || { sakit: 0, izin: 0, alpa: 0 };

      let predicate = 'Baik';
      if (avg >= 88) predicate = 'Sangat Memuaskan';
      else if (avg >= 78) predicate = 'Memuaskan';
      else if (avg >= 73) predicate = 'Cukup';
      else predicate = 'Perlu Intervensi Khusus';

      return {
        student,
        total,
        avg,
        belowKKTP,
        att,
        predicate
      };
    });

    return list.sort((a, b) => b.total - a.total);
  }, [students, subjects, grades, attendances]);

  // Remedial alerts (students with scores below KKTP in any subject)
  const remedialList = useMemo(() => {
    const items: Array<{
      student: Student;
      subject: Subject;
      score: number;
      delta: number;
    }> = [];

    students.forEach(student => {
      subjects.forEach(subject => {
        const g = grades.find(item => item.studentId === student.id && item.subjectId === subject.id);
        if (g && g.nilaiAkhirRapor > 0 && g.nilaiAkhirRapor < subject.kktp) {
          items.push({
            student,
            subject,
            score: g.nilaiAkhirRapor,
            delta: subject.kktp - g.nilaiAkhirRapor
          });
        }
      });
    });

    return items;
  }, [students, subjects, grades]);

  // Helper for Radar Chart SVG Coordinates (11 axes)
  const radarDimensions = useMemo(() => {
    const radius = 110;
    const center = 150;
    const totalAxes = subjects.length;

    // Student scores and class average scores
    const studentPoints: Array<{ x: number; y: number; val: number }> = [];
    const classAvgPoints: Array<{ x: number; y: number; val: number }> = [];
    const axisLines: Array<{ x2: number; y2: number; labelX: number; labelY: number; label: string }> = [];

    subjects.forEach((subj, idx) => {
      const angle = (Math.PI * 2 / totalAxes) * idx - Math.PI / 2;
      const stat = subjectStats.find(s => s.id === subj.id);
      const studentGrade = grades.find(g => g.studentId === selectedStudent.id && g.subjectId === subj.id);

      const studentVal = studentGrade?.nilaiAkhirRapor || 70;
      const classAvgVal = stat?.avg || 75;

      // Scale: 50 to 100
      const studentNormalized = Math.max(0.1, (studentVal - 45) / 55);
      const avgNormalized = Math.max(0.1, (classAvgVal - 45) / 55);

      const sx = center + radius * studentNormalized * Math.cos(angle);
      const sy = center + radius * studentNormalized * Math.sin(angle);
      studentPoints.push({ x: sx, y: sy, val: studentVal });

      const ax = center + radius * avgNormalized * Math.cos(angle);
      const ay = center + radius * avgNormalized * Math.sin(angle);
      classAvgPoints.push({ x: ax, y: ay, val: classAvgVal });

      // Axis label position
      const lx = center + (radius + 24) * Math.cos(angle);
      const ly = center + (radius + 24) * Math.sin(angle);
      axisLines.push({
        x2: center + radius * Math.cos(angle),
        y2: center + radius * Math.sin(angle),
        labelX: lx,
        labelY: ly,
        label: subj.kode
      });
    });

    const studentPolygon = studentPoints.map(p => `${p.x},${p.y}`).join(' ');
    const classAvgPolygon = classAvgPoints.map(p => `${p.x},${p.y}`).join(' ');

    return {
      center,
      radius,
      studentPolygon,
      classAvgPolygon,
      axisLines,
      studentPoints,
      classAvgPoints
    };
  }, [subjects, selectedStudent, grades, subjectStats]);

  // Export Summary CSV
  const handleExportAnalysisCSV = () => {
    const headers = ['Peringkat', 'NISN', 'Nama Siswa', 'Jumlah Nilai', 'Rata-rata', 'Predikat', 'Mapel Belum Tuntas'];
    const rows = studentRankings.map((item, idx) => [
      idx + 1,
      `"${item.student.nisn}"`,
      `"${item.student.nama}"`,
      item.total,
      item.avg,
      `"${item.predicate}"`,
      item.belowKKTP
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `Analisis_Perkembangan_${selectedRombel.nama.replace(/\s+/g, '_')}_SMPN14Tubaba.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Navigation Tabs */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Analisis Perkembangan Belajar Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnostik daya serap materi, profil radar performa, dan evaluasi ketercapaian KKTP {school.namaSekolah}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Class Selector */}
          <div className="flex items-center gap-1.5 bg-blue-50/90 px-3 py-1.5 rounded-lg border border-blue-200 text-xs">
            <span className="font-bold text-blue-900">Kelas:</span>
            <select
              value={selectedRombelId}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedRombelId(newId);
                const first = students.find(s => s.rombelId === newId);
                if (first) setSelectedStudentId(first.id);
              }}
              className="bg-white border border-blue-300 text-blue-900 font-bold rounded px-2 py-0.5 focus:outline-none cursor-pointer"
            >
              {rombels.map(r => (
                <option key={r.id} value={r.id}>{r.nama}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('ringkasan')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeTab === 'ringkasan' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Komparasi Mapel
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('radar_siswa')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeTab === 'radar_siswa' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Radar Siswa
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ranking')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeTab === 'ranking' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Peringkat & Mutu
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('remedial')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors relative ${
                activeTab === 'remedial' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Intervensi / Remedial
              {remedialList.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold font-mono">
                  {remedialList.length}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportAnalysisCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor Hasil</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: RINGKASAN & GRAFIK KOMPARASI RATA-RATA MAPEL */}
      {/* ============================================================== */}
      {activeTab === 'ringkasan' && (
        <div className="space-y-6">
          {/* Visual Bar Chart: Rerata Mapel vs KKTP */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  Grafik Rata-rata Nilai Akhir Per Mata Pelajaran vs Batas KKTP
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Diagram batang vertikal membandingkan capaian kelas dengan target Kriteria Ketercapaian
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-blue-600 rounded-xs" />
                  <span className="text-slate-600">Rerata Kelas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-amber-500 rounded-xs" />
                  <span className="text-slate-600">Garis KKTP</span>
                </div>
              </div>
            </div>

            {/* Responsive Chart Container */}
            <div className="pt-4 pb-2">
              <div className="grid grid-cols-11 gap-2 sm:gap-4 items-end h-56 pt-6 border-b border-slate-200">
                {subjectStats.map((stat) => {
                  // Normalize height: 0 to 100 scale
                  const barHeightPercent = Math.min(100, Math.max(10, stat.avg));
                  const isAboveKKTP = stat.avg >= stat.kktp;

                  return (
                    <div key={stat.id} className="flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-slate-900 text-white text-[10px] p-2 rounded-lg pointer-events-none shadow-lg whitespace-nowrap">
                        <p className="font-bold">{stat.nama}</p>
                        <p>Rerata: <strong className="text-blue-300">{stat.avg}</strong> (KKTP: {stat.kktp})</p>
                        <p>Tertinggi: {stat.highest} · Terendah: {stat.lowest}</p>
                      </div>

                      {/* Score Value on top of bar */}
                      <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-700 mb-1">
                        {stat.avg}
                      </span>

                      {/* Bar Pillar */}
                      <div className="w-full max-w-[36px] bg-slate-100 rounded-t-md relative flex items-end overflow-hidden" style={{ height: '100%' }}>
                        <div
                          className={`w-full transition-all duration-500 rounded-t-md ${
                            isAboveKKTP ? 'bg-blue-600 hover:bg-blue-700' : 'bg-rose-500 hover:bg-rose-600'
                          }`}
                          style={{ height: `${barHeightPercent}%` }}
                        />
                        {/* KKTP Indicator line */}
                        <div 
                          className="absolute w-full border-t-2 border-dashed border-amber-400 z-10"
                          style={{ bottom: `${stat.kktp}%` }}
                          title={`Batas KKTP: ${stat.kktp}`}
                        />
                      </div>

                      {/* Code label */}
                      <span className="text-[10px] sm:text-xs font-semibold text-slate-700 mt-2 text-center truncate w-full" title={stat.nama}>
                        {stat.kode}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Table of Subject Daya Serap */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Tabel Daya Serap & Distribusi Mutu Per Mata Pelajaran
              </h3>
              <span className="text-xs text-slate-500">
                Semester {school.semester} {school.tahunAjaran} · {selectedRombel.nama}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Mata Pelajaran</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-20">KKTP</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-24">Rerata Nilai</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-24">Tertinggi</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-24">Terendah</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-28">Ketuntasan (%)</th>
                    <th className="py-2.5 px-4 font-semibold text-center w-36">Kategori Daya Serap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjectStats.map((stat) => {
                    const isHigh = stat.passRate >= 90;
                    const isMedium = stat.passRate >= 75 && stat.passRate < 90;

                    return (
                      <tr key={stat.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {stat.nama}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-600 font-medium">
                          {stat.kktp}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                          {stat.avg}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-emerald-700 font-semibold">
                          {stat.highest}
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-rose-700 font-semibold">
                          {stat.lowest}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold">
                          {stat.passRate}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isHigh ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Sangat Baik (Tinggi)
                            </span>
                          ) : isMedium ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                              Memuaskan (Sedang)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              Perlu Perhatian Khusus
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: RADAR CHART INDIVIDUAL SISWA */}
      {/* ============================================================== */}
      {activeTab === 'radar_siswa' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Selector & Student Profile Info */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Pilih Peserta Didik
            </h3>

            <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
              {students.map((student, idx) => {
                const isSelected = student.id === selectedStudentId;
                const studentGradeList = grades.filter(g => g.studentId === student.id && g.nilaiAkhirRapor > 0);
                const avg = studentGradeList.length > 0 
                  ? (studentGradeList.reduce((a, b) => a + b.nilaiAkhirRapor, 0) / studentGradeList.length).toFixed(1)
                  : '-';

                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`w-full text-left p-3 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      isSelected 
                        ? 'bg-blue-600 text-white font-semibold shadow-xs' 
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{idx + 1}. {student.nama}</p>
                      <p className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-400'} font-mono`}>
                        NISN: {student.nisn}
                      </p>
                    </div>
                    <span className={`font-mono font-bold text-xs ${isSelected ? 'text-white' : 'text-blue-600'}`}>
                      {avg}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Diagnostic takeaway box */}
            <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <BrainCircuit className="w-4 h-4 text-blue-600" />
                <span>Analisis Profil Belajar:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-800">
                Grafik radar membandingkan kekuatan relatif siswa pada 11 mapel. Garis biru tebal mewakili nilai siswa, sedangkan garis putus-putus abu-abu adalah rata-rata {selectedRombel.nama}.
              </p>
            </div>
          </div>

          {/* Right: SVG Radar Visualizer (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col items-center justify-center space-y-4">
            <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Radar Performa Kompetensi: {selectedStudent.nama}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  NISN: {selectedStudent.nisn} · {selectedRombel.nama}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-blue-600 rounded-full" />
                  <span className="font-semibold text-slate-800">{selectedStudent.nama.split(' ')[0]}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 border-2 border-dashed border-slate-400 rounded-full" />
                  <span className="text-slate-500">Rerata Kelas</span>
                </div>
              </div>
            </div>

            {/* RADAR SVG GRAPHIC */}
            <div className="relative py-4">
              <svg width="340" height="340" viewBox="0 0 300 300" className="overflow-visible">
                {/* Concentric Background Grid Rings */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, i) => (
                  <circle
                    key={i}
                    cx={radarDimensions.center}
                    cy={radarDimensions.center}
                    r={radarDimensions.radius * level}
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                ))}

                {/* Axis Radial Lines */}
                {radarDimensions.axisLines.map((axis, i) => (
                  <g key={i}>
                    <line
                      x1={radarDimensions.center}
                      y1={radarDimensions.center}
                      x2={axis.x2}
                      y2={axis.y2}
                      stroke="#cbd5e1"
                      strokeWidth="1"
                    />
                    <text
                      x={axis.labelX}
                      y={axis.labelY}
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#475569"
                    >
                      {axis.label}
                    </text>
                  </g>
                ))}

                {/* Class Average Polygon */}
                <polygon
                  points={radarDimensions.classAvgPolygon}
                  fill="rgba(148, 163, 184, 0.15)"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />

                {/* Student Score Polygon */}
                <polygon
                  points={radarDimensions.studentPolygon}
                  fill="rgba(37, 99, 235, 0.25)"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                />

                {/* Student Point Dots */}
                {radarDimensions.studentPoints.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#1d4ed8"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
            </div>

            {/* Individual Breakdown Pills */}
            <div className="w-full pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {subjects.slice(0, 4).map(s => {
                const g = grades.find(item => item.studentId === selectedStudent.id && item.subjectId === s.id);
                return (
                  <div key={s.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-500 font-medium truncate">{s.nama}</p>
                    <p className="text-base font-bold font-mono text-slate-900 mt-0.5">
                      {g?.nilaiAkhirRapor || 0} <span className="text-[10px] font-normal text-slate-400">/ 100</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: PERINGKAT & KLASIFIKASI HASIL BELAJAR */}
      {/* ============================================================== */}
      {activeTab === 'ranking' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Daftar Peringkat & Rekapitulasi Prestasi Akademik {selectedRombel.nama}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Urutan berdasarkan akumulasi nilai akhir 11 mata pelajaran Kurikulum Merdeka
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-800 rounded-md border border-amber-200">
              Total {activeStudents.length} Peserta Didik
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="py-3 px-3 font-semibold text-center w-14">Rank</th>
                  <th className="py-3 px-3 font-semibold w-24">NISN</th>
                  <th className="py-3 px-3 font-semibold">Nama Peserta Didik</th>
                  <th className="py-3 px-3 font-semibold text-center w-24">Jumlah Nilai</th>
                  <th className="py-3 px-3 font-semibold text-center w-24">Rata-rata</th>
                  <th className="py-3 px-3 font-semibold text-center w-36">Predikat Capaian</th>
                  <th className="py-3 px-3 font-semibold text-center w-28">Presensi (S/I/A)</th>
                  <th className="py-3 px-3 font-semibold">Rekomendasi Tindak Lanjut Guru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {studentRankings.map((item, idx) => {
                  const isTop3 = idx < 3;

                  return (
                    <tr key={item.student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold font-mono text-xs ${
                          idx === 0 
                            ? 'bg-amber-400 text-amber-950 shadow-xs' 
                            : idx === 1 
                              ? 'bg-slate-300 text-slate-900' 
                              : idx === 2 
                                ? 'bg-amber-700 text-white' 
                                : 'bg-slate-100 text-slate-600'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {item.student.nisn}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{item.student.nama}</p>
                        <p className="text-[10px] text-slate-400">NIS: {item.student.nis}</p>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900 text-sm">
                        {item.total}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-blue-700 text-sm">
                        {item.avg}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.predicate === 'Sangat Memuaskan' 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : item.predicate === 'Memuaskan' 
                              ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {item.predicate}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-600">
                        {item.att.sakit} / {item.att.izin} / {item.att.alpa}
                      </td>
                      <td className="py-3 px-3 text-slate-600 text-[11px] leading-relaxed">
                        {isTop3 
                          ? 'Diberikan program pengayaan olimpiade sains / seni dan apresiasi piagam.' 
                          : item.belowKKTP > 0 
                            ? 'Membutuhkan pendampingan belajar tambahan (remedial teaching).' 
                            : 'Mempertahankan ritme belajar reguler dan penguatan literasi.'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: INTERVENSI / DETEKSI DINI SISWA BUTUH REMEDIAL */}
      {/* ============================================================== */}
      {activeTab === 'remedial' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 text-rose-700">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Daftar Peserta Didik Yang Memerlukan Pembelajaran Remedial
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nilai akhir berada di bawah batas Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-rose-50 text-rose-800 rounded-md border border-rose-200">
              {remedialList.length} Kasus Perlu Intervensi
            </span>
          </div>

          {remedialList.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold text-slate-800">Luar Biasa! Semua Siswa Mencapai KKTP</p>
              <p className="text-xs text-slate-500">Tidak ada nilai yang berada di bawah kriteria ketuntasan saat ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold w-10 text-center">No</th>
                    <th className="py-2.5 px-3 font-semibold w-48">Nama Peserta Didik</th>
                    <th className="py-2.5 px-3 font-semibold w-48">Mata Pelajaran</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-24">Batas KKTP</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-24">Nilai Siswa</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-24">Selisih</th>
                    <th className="py-2.5 px-3 font-semibold">Tindakan Remedial yang Direkomendasikan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {remedialList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-rose-50/40 transition-colors">
                      <td className="py-3 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{item.student.nama}</td>
                      <td className="py-3 px-3 text-blue-900 font-medium">{item.subject.nama}</td>
                      <td className="py-3 px-3 text-center font-mono text-slate-700">{item.subject.kktp}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-rose-700 bg-rose-50/60">{item.score}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-rose-600">-{item.delta}</td>
                      <td className="py-3 px-3 text-slate-600 leading-relaxed text-[11px]">
                        Tutor sebaya dan penugasan ulang soal konsep dasar materi secara bertahap sebelum cetak rapor final.
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
