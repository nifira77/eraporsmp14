import React, { useState, useMemo } from 'react';
import { 
  ERaporState, 
  StudentAttendance, 
  StudentExtracurricular, 
  Extracurricular 
} from '../types/erapor';
import { 
  UserCheck2, 
  Award, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle,
  CalendarCheck,
  ShieldCheck
} from 'lucide-react';

interface KehadiranEkskulViewProps {
  state: ERaporState;
  onUpdateAttendances: (attendances: StudentAttendance[]) => void;
  onUpdateStudentExtracurriculars: (studentEkskuls: StudentExtracurricular[]) => void;
}

export const KehadiranEkskulView: React.FC<KehadiranEkskulViewProps> = ({
  state,
  onUpdateAttendances,
  onUpdateStudentExtracurriculars
}) => {
  const { 
    students, 
    attendances, 
    extracurriculars, 
    studentExtracurriculars,
    rombels = [],
    isLocked,
    currentUser,
    users
  } = state;

  const [selectedRombelId, setSelectedRombelId] = useState<string>(() => {
    if (currentUser?.rombelId && rombels.some(r => r.id === currentUser.rombelId)) {
      return currentUser.rombelId;
    }
    return rombels[0]?.id || '7.1';
  });

  const selectedRombel = rombels.find(r => r.id === selectedRombelId) || rombels[0] || { id: '7.1', nama: 'Kelas 7.1' };
  const filteredStudents = students.filter(s => s.rombelId === selectedRombelId);

  const standardEkskulNames = ['OSIS', 'Pramuka', 'Rohis', 'UKS', 'Seni Tari', 'Olah Raga'];
  const standardEkskuls = useMemo(() => {
    return standardEkskulNames.map(nama => {
      const existing = extracurriculars.find(e => e.nama.toLowerCase() === nama.toLowerCase());
      if (existing) return existing;
      const slug = nama.toLowerCase().replace(/\s+/g, '-');
      const matchedUser = users?.find(u => u.pembinaEkskul === nama);
      return {
        id: `ek-${slug}`,
        nama,
        pembina: matchedUser?.name || undefined
      };
    });
  }, [extracurriculars, users]);

  const [activeTab, setActiveTab] = useState<'presensi' | 'ekskul'>('presensi');
  const [localAttendances, setLocalAttendances] = useState<Record<string, StudentAttendance>>(() => {
    const map: Record<string, StudentAttendance> = {};
    students.forEach(s => {
      const att = attendances.find(a => a.studentId === s.id);
      map[s.id] = att ? { ...att } : { studentId: s.id, rombelId: s.rombelId || '7.1', sakit: 0, izin: 0, alpa: 0 };
    });
    return map;
  });

  const [localEkskuls, setLocalEkskuls] = useState<StudentExtracurricular[]>(studentExtracurriculars);
  const [message, setMessage] = useState<string | null>(null);

  // New ekskul form modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(filteredStudents[0]?.id || students[0]?.id || '');
  const [selectedEkskulId, setSelectedEkskulId] = useState(extracurriculars[0]?.id || '');
  const [selectedPredikat, setSelectedPredikat] = useState<'Sangat Baik' | 'Baik' | 'Cukup'>('Baik');
  const [ekskulKeterangan, setEkskulKeterangan] = useState('');

  const isEditable = !isLocked || currentUser.role === 'admin';

  const handleAttendanceChange = (studentId: string, field: 'sakit' | 'izin' | 'alpa', val: string) => {
    if (!isEditable) return;
    const num = Math.max(0, parseInt(val, 10) || 0);
    setLocalAttendances(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: num
      }
    }));
  };

  const handleSaveAttendance = () => {
    const list = Object.values(localAttendances);
    onUpdateAttendances(list);
    setMessage('Data ketidakhadiran (presensi) siswa berhasil disimpan.');
    setTimeout(() => setMessage(null), 3500);
  };

  const handleSaveEkskuls = () => {
    onUpdateStudentExtracurriculars(localEkskuls);
    setMessage('Data kegiatan ekstrakurikuler siswa berhasil diperbarui.');
    setTimeout(() => setMessage(null), 3500);
  };

  const handleAddEkskul = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ekskulKeterangan.trim()) return;

    const newEntry: StudentExtracurricular = {
      id: `se-${Date.now()}`,
      studentId: selectedStudentId,
      rombelId: selectedRombelId,
      ekskulId: selectedEkskulId,
      predikat: selectedPredikat,
      keterangan: ekskulKeterangan
    };

    setLocalEkskuls(prev => [...prev, newEntry]);
    setIsAddModalOpen(false);
    setEkskulKeterangan('');
  };

  const handleDeleteEkskul = (id: string) => {
    setLocalEkskuls(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Presensi & Ekstrakurikuler (Wali Kelas)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengelolaan kehadiran dan capaian kegiatan ekstrakurikuler untuk dicetak pada rapor
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Class Selector */}
          <div className="flex items-center gap-1.5 bg-blue-50/90 px-3 py-1.5 rounded-lg border border-blue-200">
            <span className="text-xs font-bold text-blue-900">Kelas:</span>
            <select
              value={selectedRombelId}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedRombelId(newId);
                const first = students.find(s => s.rombelId === newId);
                if (first) setSelectedStudentId(first.id);
              }}
              className="bg-white border border-blue-300 text-blue-900 text-xs font-bold rounded px-2 py-0.5 focus:outline-none cursor-pointer"
            >
              {rombels.map(r => (
                <option key={r.id} value={r.id}>{r.nama}</option>
              ))}
            </select>
          </div>

          {/* Tab switch */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('presensi')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'presensi' 
                  ? 'bg-white text-blue-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ketidakhadiran (Presensi)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ekskul')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeTab === 'ekskul' 
                  ? 'bg-white text-blue-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ekstrakurikuler
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* Tab Content 1: Presensi */}
      {activeTab === 'presensi' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Rekapitulasi Ketidakhadiran Semester {state.school.semester} - {selectedRombel.nama}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleSaveAttendance}
                disabled={!isEditable}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Presensi</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold w-12 text-center">No</th>
                    <th className="py-2.5 px-4 font-semibold w-32">NISN</th>
                    <th className="py-2.5 px-4 font-semibold">Nama Peserta Didik</th>
                    <th className="py-2.5 px-4 font-semibold text-center w-28">Sakit (Hari)</th>
                    <th className="py-2.5 px-4 font-semibold text-center w-28">Izin (Hari)</th>
                    <th className="py-2.5 px-4 font-semibold text-center w-32">Tanpa Ket. (Hari)</th>
                    <th className="py-2.5 px-4 font-semibold text-center w-24">Total Absen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <CalendarCheck className="w-8 h-8 text-slate-300" />
                          <p className="font-semibold text-slate-700">Belum ada peserta didik di {selectedRombel.nama}</p>
                          <p className="text-xs text-slate-400">Silakan tambahkan data peserta didik asli melalui menu Data Siswa atau Impor File Excel.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => {
                    const att = localAttendances[student.id];
                    const s = att?.sakit || 0;
                    const i = att?.izin || 0;
                    const a = att?.alpa || 0;
                    const total = s + i + a;

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-4 text-center font-mono text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-600">
                          {student.nisn}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900">
                          {student.nama}
                        </td>
                        <td className="py-2 px-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max="60"
                            disabled={!isEditable}
                            value={s}
                            onChange={(e) => handleAttendanceChange(student.id, 'sakit', e.target.value)}
                            className="w-16 py-1 px-2 text-center font-mono text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max="60"
                            disabled={!isEditable}
                            value={i}
                            onChange={(e) => handleAttendanceChange(student.id, 'izin', e.target.value)}
                            className="w-16 py-1 px-2 text-center font-mono text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className="py-2 px-4 text-center">
                          <input
                            type="number"
                            min="0"
                            max="60"
                            disabled={!isEditable}
                            value={a}
                            onChange={(e) => handleAttendanceChange(student.id, 'alpa', e.target.value)}
                            className="w-16 py-1 px-2 text-center font-mono text-xs border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                        </td>
                        <td className={`py-2.5 px-4 text-center font-mono font-bold ${
                          total > 3 ? 'text-rose-600 bg-rose-50' : 'text-slate-700'
                        }`}>
                          {total} Hari
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

      {/* Tab Content 2: Ekstrakurikuler */}
      {activeTab === 'ekskul' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  Daftar Partisipasi Ekstrakurikuler Siswa
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilihan kegiatan: OSIS, Pramuka, Rohis, UKS, Seni Tari, dan Olah Raga
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Kegiatan Siswa</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveEkskuls}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>

            {/* Ekskul List */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold w-10 text-center">No</th>
                    <th className="py-2.5 px-3 font-semibold w-48">Nama Peserta Didik</th>
                    <th className="py-2.5 px-3 font-semibold w-48">Kegiatan Ekstrakurikuler</th>
                    <th className="py-2.5 px-3 font-semibold w-28 text-center">Predikat</th>
                    <th className="py-2.5 px-3 font-semibold">Keterangan / Capaian</th>
                    <th className="py-2.5 px-3 font-semibold w-16 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {localEkskuls.map((entry, idx) => {
                    const student = students.find(s => s.id === entry.studentId);
                    const ekskul = extracurriculars.find(e => e.id === entry.ekskulId);

                    return (
                      <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {student?.nama}
                        </td>
                        <td className="py-2.5 px-3 text-blue-900 font-medium">
                          {ekskul?.nama}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            entry.predikat === 'Sangat Baik'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}>
                            {entry.predikat}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 leading-relaxed">
                          {entry.keterangan}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteEkskul(entry.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modal Add Ekstrakurikuler */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddEkskul} className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Tambah Partisipasi Ekstrakurikuler
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Catatan kegiatan ekstrakurikuler yang akan dicantumkan pada buku rapor siswa
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Peserta Didik
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.nama} ({s.nisn})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Kegiatan Ekstrakurikuler
                </label>
                <select
                  value={selectedEkskulId}
                  onChange={(e) => setSelectedEkskulId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {extracurriculars.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.nama} {e.pembina ? `(Pembina: ${e.pembina})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Predikat Capaian
                </label>
                <select
                  value={selectedPredikat}
                  onChange={(e) => setSelectedPredikat(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Sangat Baik">Sangat Baik (A)</option>
                  <option value="Baik">Baik (B)</option>
                  <option value="Cukup">Cukup (C)</option>
                  <option value="Kurang">Kurang (D)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keterangan / Deskripsi Partisipasi
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Sangat aktif dalam kegiatan tali-temali dan memimpin regu saat jelajah alam perkemahan."
                  value={ekskulKeterangan}
                  onChange={(e) => setEkskulKeterangan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Tambahkan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
