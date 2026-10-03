import React, { useState } from 'react';
import { ERaporState } from '../types/erapor';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Download,
  Filter,
  Eye
} from 'lucide-react';

interface StatusPenilaianViewProps {
  state: ERaporState;
  onOpenSubjectGrades?: (subjectId: string) => void;
}

export const StatusPenilaianView: React.FC<StatusPenilaianViewProps> = ({
  state,
  onOpenSubjectGrades
}) => {
  const { students, subjects, grades, rombels } = state;
  const [selectedRombelId, setSelectedRombelId] = useState('7A');

  const rombelStudents = students.filter(s => s.rombelId === selectedRombelId);
  const selectedRombel = rombels.find(r => r.id === selectedRombelId) || rombels[0];

  // Subject completion metrics
  const subjectMetrics = subjects.map(subject => {
    const subjGrades = grades.filter(
      g => g.subjectId === subject.id && g.rombelId === selectedRombelId && g.nilaiAkhirRapor > 0
    );
    const count = subjGrades.length;
    const isComplete = count >= rombelStudents.length;
    const avg = count > 0 
      ? (subjGrades.reduce((sum, g) => sum + g.nilaiAkhirRapor, 0) / count).toFixed(1)
      : '-';

    return {
      ...subject,
      count,
      isComplete,
      avg
    };
  });

  const completeCount = subjectMetrics.filter(m => m.isComplete).length;
  const progressPercent = Math.round((completeCount / subjects.length) * 100);

  return (
    <div className="space-y-5">
      {/* Title & Filter */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Status Kelengkapan Penilaian Rapor
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekapitulasi pengisian nilai seluruh guru mata pelajaran di {selectedRombel.nama}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Rombel / Kelas
            </label>
            <select
              value={selectedRombelId}
              onChange={(e) => setSelectedRombelId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {rombels.map(r => (
                <option key={r.id} value={r.id}>{r.nama}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <span className="text-xs font-bold text-slate-900">
              Kesiapan Cetak Rapor Kelas
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              {completeCount} dari {subjects.length} mata pelajaran telah tuntas diinput oleh guru pengampu
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-blue-600 tabular-nums">
              {progressPercent}%
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Matrix Table: Students x Subjects */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-blue-600" />
            Matriks Nilai Akhir Per Peserta Didik
          </h3>
          <span className="text-xs text-slate-500">
            Nilai bertanda merah jika di bawah KKTP
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="py-2.5 px-3 font-semibold w-10 text-center">No</th>
                <th className="py-2.5 px-3 font-semibold min-w-[160px] sticky left-0 bg-slate-800 z-10">
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
              {rombelStudents.map((student, idx) => {
                const studentGrades = subjects.map(subj => {
                  const g = grades.find(item => item.studentId === student.id && item.subjectId === subj.id);
                  return {
                    subject: subj,
                    grade: g?.nilaiAkhirRapor || 0
                  };
                });

                const valid = studentGrades.filter(g => g.grade > 0);
                const avg = valid.length > 0 
                  ? (valid.reduce((sum, g) => sum + g.grade, 0) / valid.length).toFixed(1)
                  : '-';

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 text-center font-mono text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 font-semibold text-slate-900 sticky left-0 bg-white z-10 shadow-xs">
                      {student.nama}
                    </td>
                    {studentGrades.map(({ subject, grade }) => {
                      const isPassing = grade >= subject.kktp;
                      return (
                        <td 
                          key={subject.id} 
                          className={`py-2 px-1 text-center font-mono font-medium ${
                            grade === 0 
                              ? 'text-slate-300' 
                              : isPassing 
                                ? 'text-slate-800' 
                                : 'text-rose-600 bg-rose-50/60 font-bold'
                          }`}
                        >
                          {grade > 0 ? grade : '—'}
                        </td>
                      );
                    })}
                    <td className="py-2 px-2 text-center font-mono font-bold text-blue-900 bg-blue-50/60">
                      {avg}
                    </td>
                  </tr>
                );
              })}
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
                  {((subjectMetrics.reduce((a, b) => a + (parseFloat(b.avg) || 0), 0)) / subjects.length).toFixed(1)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
