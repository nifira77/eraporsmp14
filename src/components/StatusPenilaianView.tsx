import React, { useState, useMemo } from 'react';
import { ERaporState, StudentGrade, Subject, Student } from '../types/erapor';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Send,
  RefreshCw,
  Edit3,
  Calendar,
  Award,
  Check,
  ShieldCheck,
  BookOpen
} from 'lucide-react';

interface StatusPenilaianViewProps {
  state: ERaporState;
  onUpdateGrades?: (updatedGrades: StudentGrade[]) => void;
  onOpenSubjectGrades?: (subjectId?: string) => void;
}

export const StatusPenilaianView: React.FC<StatusPenilaianViewProps> = ({
  state,
  onUpdateGrades,
  onOpenSubjectGrades
}) => {
  const { students, subjects, grades, rombels, currentUser } = state;
  const [selectedRombelId, setSelectedRombelId] = useState(
    currentUser?.rombelId && rombels.some(r => r.id === currentUser.rombelId)
      ? currentUser.rombelId
      : rombels[0]?.id || '7.1'
  );
  const [assessmentMode, setAssessmentMode] = useState<'akhir_semester' | 'tengah_semester'>('akhir_semester');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const rombelStudents = useMemo(() => {
    return students.filter(s => s.rombelId === selectedRombelId);
  }, [students, selectedRombelId]);

  const selectedRombel = rombels.find(r => r.id === selectedRombelId) || rombels[0] || { id: '7.1', nama: 'Kelas 7.1' };

  // Helper to determine if a subject matches student's faith
  const isSubjectApplicableForStudent = (subjectId: string, studentAgama: string): boolean => {
    const ag = (studentAgama || '').toLowerCase();
    const sId = subjectId.toLowerCase();

    if (sId === 'pai') return ag.includes('islam') || !ag;
    if (sId === 'pak_kristen') return ag.includes('kristen') || ag.includes('protestan');
    if (sId === 'pak_katolik') return ag.includes('katolik') || ag.includes('khatolik');
    if (sId === 'pah_hindu') return ag.includes('hindu');
    if (sId === 'pab_buddha') return ag.includes('buddha') || ag.includes('budha');
    return true; // Non-religious subjects apply to all students
  };

  // Helper to detect if a subject is a religious education subject
  const isReligiousSubject = (subjectId: string): boolean => {
    return ['pai', 'pak_kristen', 'pak_katolik', 'pah_hindu', 'pab_buddha'].includes(subjectId.toLowerCase());
  };

  // Subject completion & submission metrics
  const subjectMetrics = useMemo(() => {
    return subjects.map(subject => {
      // Students in this class who should take this subject
      const eligibleStudents = rombelStudents.filter(s => isSubjectApplicableForStudent(subject.id, s.agama));
      const targetCount = eligibleStudents.length;

      // Find grades belonging to eligible students in this class
      const eligibleStudentIds = new Set(eligibleStudents.map(s => s.id));
      const subjGrades = grades.filter(
        g => g.subjectId === subject.id && eligibleStudentIds.has(g.studentId)
      );

      // Check whether scores are filled
      const filledGrades = subjGrades.filter(g => {
        if (assessmentMode === 'tengah_semester') {
          return (g.nilaiAkhirSTS && g.nilaiAkhirSTS > 0) || (g.tesSTS && g.tesSTS > 0) || (g.nonTesSTS && g.nonTesSTS > 0);
        }
        return (g.nilaiAkhirRapor && g.nilaiAkhirRapor > 0) || (g.nilaiAkhirSAS && g.nilaiAkhirSAS > 0) || (g.nilaiAkhirLM && g.nilaiAkhirLM > 0);
      });

      const count = filledGrades.length;
      const isComplete = targetCount > 0 ? count >= targetCount : true;

      // Determine submission status
      let submissionStatus: 'draft' | 'terkirim' | 'perbaikan' = 'draft';
      if (subjGrades.some(g => g.statusKirim === 'perbaikan')) {
        submissionStatus = 'perbaikan';
      } else if (subjGrades.length > 0 && subjGrades.some(g => g.statusKirim === 'terkirim')) {
        submissionStatus = 'terkirim';
      }

      const submittedItem = subjGrades.find(g => g.tanggalKirim);
      const tanggalKirimFormatted = submittedItem?.tanggalKirim 
        ? new Date(submittedItem.tanggalKirim).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
        : null;

      // Calculate class average
      let avg = '-';
      if (count > 0) {
        const sum = filledGrades.reduce((acc, g) => {
          if (assessmentMode === 'tengah_semester') {
            return acc + (g.nilaiAkhirSTS || g.tesSTS || g.nonTesSTS || 0);
          }
          return acc + (g.nilaiAkhirRapor || g.nilaiAkhirSAS || 0);
        }, 0);
        avg = (sum / count).toFixed(1);
      }

      return {
        ...subject,
        targetCount,
        count,
        isComplete,
        submissionStatus,
        tanggalKirimFormatted,
        avg,
        subjGrades
      };
    });
  }, [subjects, rombelStudents, grades, assessmentMode]);

  const activeSubjects = subjectMetrics.filter(m => m.targetCount > 0);
  const completeCount = activeSubjects.filter(m => m.isComplete).length;
  const submittedCount = activeSubjects.filter(m => m.submissionStatus === 'terkirim').length;
  const progressPercent = activeSubjects.length > 0 
    ? Math.round((completeCount / activeSubjects.length) * 100) 
    : 0;

  // Handler: Kirim Nilai for a single subject in this rombel
  const handleKirimSingleSubject = (subjectId: string) => {
    if (!onUpdateGrades) return;
    const now = new Date().toISOString();
    const subject = subjects.find(s => s.id === subjectId);

    // Find all grades for this subject and rombel
    const eligibleStudents = rombelStudents.filter(s => isSubjectApplicableForStudent(subjectId, s.agama));
    const updatedGrades: StudentGrade[] = [];

    eligibleStudents.forEach(student => {
      const existing = grades.find(g => g.studentId === student.id && g.subjectId === subjectId);
      if (existing) {
        updatedGrades.push({
          ...existing,
          statusKirim: 'terkirim',
          tanggalKirim: now,
          updatedAt: now
        });
      } else {
        // Create baseline entry
        updatedGrades.push({
          id: `grade-${student.id}-${subjectId}`,
          studentId: student.id,
          subjectId,
          rombelId: selectedRombelId,
          sumatifLM: { 'tp-1': 0, 'tp-2': 0, 'tp-3': 0, 'tp-4': 0 },
          nilaiAkhirLM: 0,
          nilaiAkhirSTS: 0,
          nonTesSAS: 0,
          tesSAS: 0,
          nilaiAkhirSAS: 0,
          nilaiAkhirRapor: 0,
          deskripsiTertinggi: 'Menunjukkan pemahaman materi.',
          deskripsiTerendah: 'Perlu latihan lebih lanjut.',
          statusKetercapaian: 'Perlu Peningkatan',
          statusKirim: 'terkirim',
          tanggalKirim: now,
          updatedAt: now
        });
      }
    });

    onUpdateGrades(updatedGrades);
    setStatusMessage(`✓ Nilai mata pelajaran "${subject?.nama || subjectId}" resmi dikirim ke Rapor & Wali Kelas!`);
    setTimeout(() => setStatusMessage(null), 4500);
  };

  // Handler: Buka Status Perbaikan for a single subject
  const handleBukaPerbaikanSingle = (subjectId: string) => {
    if (!onUpdateGrades) return;
    const now = new Date().toISOString();
    const subject = subjects.find(s => s.id === subjectId);

    const eligibleStudents = rombelStudents.filter(s => isSubjectApplicableForStudent(subjectId, s.agama));
    const updatedGrades: StudentGrade[] = [];

    eligibleStudents.forEach(student => {
      const existing = grades.find(g => g.studentId === student.id && g.subjectId === subjectId);
      if (existing) {
        updatedGrades.push({
          ...existing,
          statusKirim: 'perbaikan',
          updatedAt: now
        });
      }
    });

    if (updatedGrades.length > 0) {
      onUpdateGrades(updatedGrades);
    }
    setStatusMessage(`⚠️ Status Perbaikan Nilai Aktif untuk "${subject?.nama || subjectId}". Guru dapat merevisi nilai.`);
    setTimeout(() => setStatusMessage(null), 4500);
  };

  // Handler: Kirim Semua Nilai Terisi di Rombel Ini
  const handleKirimSemuaNilai = () => {
    if (!onUpdateGrades) return;
    const now = new Date().toISOString();
    const updatedGrades: StudentGrade[] = [];

    activeSubjects.forEach(metric => {
      if (metric.count > 0) {
        const eligibleStudents = rombelStudents.filter(s => isSubjectApplicableForStudent(metric.id, s.agama));
        eligibleStudents.forEach(student => {
          const existing = grades.find(g => g.studentId === student.id && g.subjectId === metric.id);
          if (existing) {
            updatedGrades.push({
              ...existing,
              statusKirim: 'terkirim',
              tanggalKirim: now,
              updatedAt: now
            });
          }
        });
      }
    });

    if (updatedGrades.length > 0) {
      onUpdateGrades(updatedGrades);
      setStatusMessage(`✓ Berhasil mengirim seluruh nilai terisi (${updatedGrades.length} nilai) di ${selectedRombel.nama} ke Rapor!`);
      setTimeout(() => setStatusMessage(null), 5000);
    } else {
      setStatusMessage('Belum ada nilai yang terisi di rombel ini untuk dikirim.');
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  // Handler: Buka Status Perbaikan Semua Mapel
  const handleBukaPerbaikanSemua = () => {
    if (!onUpdateGrades) return;
    const now = new Date().toISOString();
    const updatedGrades: StudentGrade[] = [];

    activeSubjects.forEach(metric => {
      const eligibleStudents = rombelStudents.filter(s => isSubjectApplicableForStudent(metric.id, s.agama));
      eligibleStudents.forEach(student => {
        const existing = grades.find(g => g.studentId === student.id && g.subjectId === metric.id);
        if (existing && existing.statusKirim === 'terkirim') {
          updatedGrades.push({
            ...existing,
            statusKirim: 'perbaikan',
            updatedAt: now
          });
        }
      });
    });

    if (updatedGrades.length > 0) {
      onUpdateGrades(updatedGrades);
      setStatusMessage(`⚠️ Status perbaikan nilai berhasil dibuka untuk seluruh mata pelajaran di ${selectedRombel.nama}.`);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-5">
      {/* Title & Filter Bar */}
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Modul e-Rapor SP
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Status Penilaian & Kirim Nilai Rapor
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi pengisian, status pengiriman nilai akhir guru mata pelajaran, dan kontrol status perbaikan di {selectedRombel.nama}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Assessment Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setAssessmentMode('akhir_semester')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                assessmentMode === 'akhir_semester'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Akhir Semester (SAS)</span>
            </button>
            <button
              type="button"
              onClick={() => setAssessmentMode('tengah_semester')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                assessmentMode === 'tengah_semester'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Tengah Semester (STS)</span>
            </button>
          </div>

          {/* Rombel Selector */}
          <div>
            <select
              value={selectedRombelId}
              onChange={(e) => setSelectedRombelId(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
            >
              {rombels.map(r => (
                <option key={r.id} value={r.id}>{r.nama} ({students.filter(s => s.rombelId === r.id).length} Siswa)</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Status Message Notification */}
      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-200 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{statusMessage}</span>
        </div>
      )}

      {/* Progress & Quick Action Card */}
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                Kesiapan Rapor {selectedRombel.nama} ({assessmentMode === 'akhir_semester' ? 'Sumatif Akhir Semester' : 'Sumatif Tengah Semester'})
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {rombelStudents.length} Peserta Didik
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <strong>{completeCount}</strong> dari {activeSubjects.length} mata pelajaran telah tuntas diinput · <strong>{submittedCount}</strong> mata pelajaran resmi dikirim ke rapor
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleKirimSemuaNilai}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="Kirim nilai semua mata pelajaran yang sudah terisi di kelas ini sekaligus"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim Semua Nilai Terisi</span>
            </button>

            <button
              type="button"
              onClick={handleBukaPerbaikanSemua}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-300 transition-all cursor-pointer"
              title="Buka akses perbaikan untuk semua mata pelajaran di rombel ini"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Buka Status Perbaikan Semua</span>
            </button>

            <div className="text-right pl-3 border-l border-slate-200">
              <span className="text-2xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 tabular-nums">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Gradient Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 h-3 rounded-full transition-all duration-500 shadow-2xs" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* TABEL STATUS PENGIRIMAN & PERBAIKAN NILAI PER MATA PELAJARAN */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-blue-600" />
            Rekap Status Pengiriman & Perbaikan Nilai per Mata Pelajaran
          </h3>
          <span className="text-xs text-slate-500">
            Guru dapat langsung mengirim nilai atau membuka status perbaikan dari tabel ini
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="py-3 px-3 w-12 text-center font-bold">No</th>
                <th className="py-3 px-4 min-w-[200px] font-bold">Mata Pelajaran & Kode</th>
                <th className="py-3 px-3 min-w-[170px] font-bold">Guru Pengampu</th>
                <th className="py-3 px-3 text-center w-36 font-bold">Progres Pengisian</th>
                <th className="py-3 px-3 text-center w-24 font-bold">Rerata</th>
                <th className="py-3 px-4 text-center min-w-[190px] font-bold">Status Kirim Nilai</th>
                <th className="py-3 px-4 text-center min-w-[180px] font-bold">Aksi / Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {subjectMetrics.map((subj, idx) => {
                const isRel = isReligiousSubject(subj.id);
                const isComplete = subj.isComplete;
                const percentFilled = subj.targetCount > 0 
                  ? Math.round((subj.count / subj.targetCount) * 100) 
                  : 100;

                return (
                  <tr key={subj.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-center font-mono text-slate-500 font-medium">
                      {idx + 1}
                    </td>

                    {/* Subject info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-xs">
                          {subj.nama}
                        </span>
                        {subj.kategori === 'Muatan Lokal' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Mulok
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-slate-500 mt-0.5">
                        Kode: <span className="font-mono font-semibold text-slate-700">{subj.kode}</span> · KKTP: <span className="font-mono font-semibold text-slate-700">{subj.kktp}</span>
                        {isRel && <span className="ml-1 text-amber-600 font-medium">(Khusus Penganut Agama)</span>}
                      </p>
                    </td>

                    {/* Teacher name */}
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {subj.guruPengampuNama || '—'}
                    </td>

                    {/* Filled Progress */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-mono font-bold text-xs text-slate-900">
                          {subj.count} / {subj.targetCount} Siswa
                        </span>
                        <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full transition-all ${
                              percentFilled === 100 ? 'bg-emerald-500' : percentFilled > 0 ? 'bg-blue-500' : 'bg-slate-300'
                            }`}
                            style={{ width: `${percentFilled}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Class Average */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                      {subj.avg}
                    </td>

                    {/* Status Kirim Nilai */}
                    <td className="py-3 px-4 text-center">
                      {subj.submissionStatus === 'terkirim' ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            SUDAH DIKIRIM
                          </span>
                          {subj.tanggalKirimFormatted && (
                            <span className="text-[9.5px] text-slate-400 font-mono mt-0.5">
                              {subj.tanggalKirimFormatted}
                            </span>
                          )}
                        </div>
                      ) : subj.submissionStatus === 'perbaikan' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg font-bold text-[11px]">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          DALAM PERBAIKAN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg font-medium text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          BELUM DIKIRIM (DRAFT)
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {subj.submissionStatus === 'terkirim' ? (
                          <button
                            type="button"
                            onClick={() => handleBukaPerbaikanSingle(subj.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            title="Buka status perbaikan nilai untuk merevisi nilai yang telah dikirim"
                          >
                            <RefreshCw className="w-3 h-3 text-amber-600" />
                            <span>Buka Perbaikan</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleKirimSingleSubject(subj.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white transition-colors cursor-pointer ${
                              subj.count > 0 
                                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-2xs' 
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                            title="Kirim nilai resmi ke rapor"
                          >
                            <Send className="w-3 h-3" />
                            <span>{subj.submissionStatus === 'perbaikan' ? 'Kirim Perbaikan' : 'Kirim Nilai'}</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenSubjectGrades) {
                              onOpenSubjectGrades(subj.id);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                          title="Buka halaman input nilai mapel ini"
                        >
                          <Edit3 className="w-3 h-3 text-slate-500" />
                          <span>Input</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MATRIKS NILAI AKHIR PER PESERTA DIDIK */}
      {/* ============================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-600" />
              Matriks Nilai Akhir Per Peserta Didik ({assessmentMode === 'akhir_semester' ? 'Nilai Rapor SAS' : 'Nilai Jadi STS'})
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Nilai bertanda merah jika di bawah KKTP · Tanda "—" abu-abu untuk siswa yang tidak menempuh mapel agama tertentu
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Di bawah KKTP
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Tuntas
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
              <tr>
                <th className="py-2.5 px-3 font-semibold w-10 text-center">No</th>
                <th className="py-2.5 px-3 font-semibold min-w-[170px] sticky left-0 bg-slate-800 z-10">
                  Nama Siswa
                </th>
                {subjects.map(s => (
                  <th key={s.id} className="py-2.5 px-2 font-semibold text-center w-14" title={`${s.nama} (KKTP ${s.kktp})`}>
                    {s.kode}
                  </th>
                ))}
                <th className="py-2.5 px-3 font-semibold text-center bg-blue-900 w-16">
                  Rerata
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rombelStudents.length === 0 ? (
                <tr>
                  <td colSpan={subjects.length + 3} className="py-10 text-center text-slate-500">
                    <p className="font-semibold text-slate-700">Belum ada peserta didik di {selectedRombel.nama}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Silakan tambahkan data peserta didik asli melalui menu Data Siswa atau Impor File Excel.</p>
                  </td>
                </tr>
              ) : (
                rombelStudents.map((student, idx) => {
                  const studentGrades = subjects.map(subj => {
                    const isApplicable = isSubjectApplicableForStudent(subj.id, student.agama);
                    if (!isApplicable) {
                      return {
                        subject: subj,
                        grade: null,
                        isApplicable: false
                      };
                    }

                    const g = grades.find(item => item.studentId === student.id && item.subjectId === subj.id);
                    const val = assessmentMode === 'tengah_semester'
                      ? (g?.nilaiAkhirSTS || g?.tesSTS || g?.nonTesSTS || 0)
                      : (g?.nilaiAkhirRapor || g?.nilaiAkhirSAS || 0);

                    return {
                      subject: subj,
                      grade: val,
                      isApplicable: true
                    };
                  });

                  const validApplicable = studentGrades.filter(g => g.isApplicable && g.grade !== null && g.grade > 0);
                  const avg = validApplicable.length > 0 
                    ? (validApplicable.reduce((sum, g) => sum + (g.grade || 0), 0) / validApplicable.length).toFixed(1)
                    : '-';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2 px-3 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900 sticky left-0 bg-white z-10 shadow-xs">
                        <p className="text-xs leading-tight">{student.nama}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{student.agama || 'Islam'}</p>
                      </td>
                      {studentGrades.map(({ subject, grade, isApplicable }) => {
                        if (!isApplicable) {
                          return (
                            <td 
                              key={subject.id} 
                              className="py-2 px-1 text-center font-mono text-slate-300 bg-slate-50/40 select-none"
                              title={`Tidak menempuh ${subject.nama} (Beda Agama)`}
                            >
                              —
                            </td>
                          );
                        }

                        const score = grade || 0;
                        const isPassing = score >= subject.kktp;
                        return (
                          <td 
                            key={subject.id} 
                            className={`py-2 px-1 text-center font-mono font-medium ${
                              score === 0 
                                ? 'text-slate-300' 
                                : isPassing 
                                  ? 'text-slate-800' 
                                  : 'text-rose-600 bg-rose-50/60 font-bold'
                            }`}
                          >
                            {score > 0 ? score : '—'}
                          </td>
                        );
                      })}
                      <td className="py-2 px-2 text-center font-mono font-bold text-blue-900 bg-blue-50/60">
                        {avg}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Footer Summary Row: Rata-rata Mapel */}
            <tfoot className="bg-slate-100 font-semibold border-t-2 border-slate-300">
              <tr>
                <td colSpan={2} className="py-2 px-3 text-right font-bold text-slate-800">
                  Rata-rata Mapel:
                </td>
                {subjectMetrics.map(m => (
                  <td key={m.id} className="py-2 px-1 text-center font-mono text-slate-900 font-bold">
                    {m.avg}
                  </td>
                ))}
                <td className="py-2 px-2 text-center font-mono text-blue-900 font-bold bg-blue-100/60">
                  {(() => {
                    const validAvgs = subjectMetrics.filter(m => m.avg !== '-').map(m => parseFloat(m.avg));
                    if (validAvgs.length === 0) return '-';
                    return (validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length).toFixed(1);
                  })()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
