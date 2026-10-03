import React, { useState } from 'react';
import { 
  ERaporState, 
  StudentNote, 
  StudentAchievement 
} from '../types/erapor';
import { 
  MessageSquare, 
  Award, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle,
  Sparkles,
  Trophy
} from 'lucide-react';

interface CatatanWaliViewProps {
  state: ERaporState;
  onUpdateNotes: (notes: StudentNote[]) => void;
  onUpdateAchievements: (achievements: StudentAchievement[]) => void;
}

export const CatatanWaliView: React.FC<CatatanWaliViewProps> = ({
  state,
  onUpdateNotes,
  onUpdateAchievements
}) => {
  const { students, notes, achievements } = state;

  const [activeTab, setActiveTab] = useState<'catatan' | 'prestasi'>('catatan');
  const [localNotes, setLocalNotes] = useState<Record<string, StudentNote>>(() => {
    const map: Record<string, StudentNote> = {};
    students.forEach(s => {
      const n = notes.find(item => item.studentId === s.id);
      map[s.id] = n 
        ? { ...n } 
        : { studentId: s.id, rombelId: '7A', catatan: 'Pertahankan prestasi belajar dan keaktifan di kelas.', statusKenaikan: 'Memenuhi Kriteria Ketuntasan Belajar' };
    });
    return map;
  });

  const [localAchievements, setLocalAchievements] = useState<StudentAchievement[]>(achievements);
  const [message, setMessage] = useState<string | null>(null);

  // Modal new achievement
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [achStudentId, setAchStudentId] = useState(students[0]?.id || '');
  const [achBidang, setAchBidang] = useState('Non-Akademik');
  const [achTitle, setAchTitle] = useState('');
  const [achLevel, setAchLevel] = useState<'Kecamatan' | 'Kabupaten' | 'Provinsi' | 'Nasional'>('Kabupaten');
  const [achKet, setAchKet] = useState('');

  const quickTemplates = [
    'Pertahankan prestasi belajar dan sikap terpuji ananda di kelas. Tingkatkan terus literasi membaca.',
    'Ananda memiliki potensi kepemimpinan dan komunikasi yang sangat baik. Tingkatkan fokus belajar matematika.',
    'Semangat belajar cukup baik, perlu lebih rajin bertanya kepada guru dan mengumpulkan tugas tepat waktu.',
    'Bakat seni dan kreativitas ananda sangat membanggakan. Teruslah berkarya dan berprestasi.'
  ];

  const handleNoteChange = (studentId: string, val: string) => {
    setLocalNotes(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        catatan: val
      }
    }));
  };

  const handleApplyTemplate = (studentId: string, text: string) => {
    handleNoteChange(studentId, text);
  };

  const handleSaveNotes = () => {
    onUpdateNotes(Object.values(localNotes));
    setMessage('Catatan wali kelas berhasil disimpan ke dalam sistem e-Rapor.');
    setTimeout(() => setMessage(null), 3500);
  };

  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achTitle.trim()) return;

    const newAch: StudentAchievement = {
      id: `ach-${Date.now()}`,
      studentId: achStudentId,
      rombelId: '7A',
      bidang: achBidang,
      prestasi: achTitle,
      tingkat: achLevel,
      keterangan: achKet
    };

    const next = [...localAchievements, newAch];
    setLocalAchievements(next);
    onUpdateAchievements(next);
    setIsModalOpen(false);
    setAchTitle('');
    setAchKet('');
    setMessage('Prestasi siswa berhasil ditambahkan.');
    setTimeout(() => setMessage(null), 3500);
  };

  const handleDeleteAchievement = (id: string) => {
    const next = localAchievements.filter(a => a.id !== id);
    setLocalAchievements(next);
    onUpdateAchievements(next);
  };

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Catatan Wali Kelas & Prestasi Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemberian motivasi, catatan perkembangan kepribadian, dan riwayat prestasi kejuaraan
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('catatan')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'catatan' 
                ? 'bg-white text-blue-700 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Catatan Wali Kelas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('prestasi')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === 'prestasi' 
                ? 'bg-white text-blue-700 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Prestasi Siswa
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{message}</span>
        </div>
      )}

      {/* Tab 1: Catatan Wali Kelas */}
      {activeTab === 'catatan' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Formulir Catatan Wali Kelas Semester {state.school.semester} - Kelas VII-A
                </h3>
              </div>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Catatan Rapor</span>
              </button>
            </div>

            <div className="space-y-4">
              {students.map((student, idx) => (
                <div key={student.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center font-mono">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-bold text-slate-900">{student.nama}</p>
                      <span className="text-[11px] text-slate-500 font-mono">NISN: {student.nisn}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 text-[11px]">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Template:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApplyTemplate(student.id, quickTemplates[0])}
                        className="px-2 py-0.5 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700"
                      >
                        Prestasi Terpuji
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyTemplate(student.id, quickTemplates[2])}
                        className="px-2 py-0.5 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700"
                      >
                        Perlu Peningkatan
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyTemplate(student.id, quickTemplates[3])}
                        className="px-2 py-0.5 bg-white border border-slate-300 rounded hover:bg-slate-100 text-slate-700"
                      >
                        Bakat Seni
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={localNotes[student.id]?.catatan || ''}
                    onChange={(e) => handleNoteChange(student.id, e.target.value)}
                    className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Tuliskan catatan motivasi belajar, kedisiplinan, dan apresiasi perkembangan kepribadian siswa..."
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Prestasi Siswa */}
      {activeTab === 'prestasi' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                Daftar Prestasi & Penghargaan Siswa
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kejuaraan lomba akademik dan non-akademik yang dicantumkan pada rapor resmi
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Prestasi</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold w-10 text-center">No</th>
                  <th className="py-2.5 px-3 font-semibold w-48">Nama Peserta Didik</th>
                  <th className="py-2.5 px-3 font-semibold w-32">Bidang</th>
                  <th className="py-2.5 px-3 font-semibold">Prestasi / Kejuaraan</th>
                  <th className="py-2.5 px-3 font-semibold w-28 text-center">Tingkat</th>
                  <th className="py-2.5 px-3 font-semibold">Keterangan</th>
                  <th className="py-2.5 px-3 font-semibold w-16 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {localAchievements.map((item, idx) => {
                  const student = students.find(s => s.id === item.studentId);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">
                        {student?.nama}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {item.bidang}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-blue-900">
                        {item.prestasi}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          {item.tingkat}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {item.keterangan}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteAchievement(item.id)}
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
      )}

      {/* Modal Add Achievement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddAchievement} className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              Tambah Prestasi Peserta Didik
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Catatan penghargaan resmi untuk dicetak pada rapor SMPN 14 Tulang Bawang Barat
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Peserta Didik
                </label>
                <select
                  value={achStudentId}
                  onChange={(e) => setAchStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.nama} ({s.nisn})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bidang Prestasi
                  </label>
                  <select
                    value={achBidang}
                    onChange={(e) => setAchBidang(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Akademik">Akademik</option>
                    <option value="Non-Akademik">Non-Akademik (Seni/Olahraga)</option>
                    <option value="Karakter / Kepanduan">Karakter / Kepanduan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tingkat Kejuaraan
                  </label>
                  <select
                    value={achLevel}
                    onChange={(e) => setAchLevel(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Kecamatan">Kecamatan</option>
                    <option value="Kabupaten">Kabupaten</option>
                    <option value="Provinsi">Provinsi</option>
                    <option value="Nasional">Nasional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Prestasi / Juara
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Juara 1 Lomba Tari Kreasi Daerah Tradisional"
                  value={achTitle}
                  onChange={(e) => setAchTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keterangan Penyelenggara / Waktu
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dinas Pendidikan dan Kebudayaan Tubaba Tahun 2024"
                  value={achKet}
                  onChange={(e) => setAchKet(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Simpan Prestasi
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
