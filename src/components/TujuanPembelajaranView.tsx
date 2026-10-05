import React, { useState } from 'react';
import { TujuanPembelajaran, Subject, Rombel, UserProfile } from '../types/erapor';
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  AlertCircle, 
  BookOpen, 
  Layers,
  School
} from 'lucide-react';

interface TujuanPembelajaranViewProps {
  learningObjectives: TujuanPembelajaran[];
  subjects: Subject[];
  rombels: Rombel[];
  currentUser: UserProfile;
  onUpdateObjectives: (tps: TujuanPembelajaran[]) => void;
}

export const TujuanPembelajaranView: React.FC<TujuanPembelajaranViewProps> = ({
  learningObjectives,
  subjects,
  rombels,
  currentUser,
  onUpdateObjectives
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    currentUser.subjectId || 'mtk'
  );
  // Options: 'all' | 'all-7' | 'all-8' | 'all-9' | specific rombel id (e.g. '7.1', '7.2')
  const [selectedRombelId, setSelectedRombelId] = useState<string>('all');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formKode, setFormKode] = useState('TP 5');
  const [formRombelId, setFormRombelId] = useState<string>('all');
  const [formLingkupMateri, setFormLingkupMateri] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');

  // Filter TPs based on subject and selected class category
  const filteredTPs = learningObjectives.filter(tp => {
    const matchSubject = tp.subjectId === selectedSubjectId;
    if (!matchSubject) return false;

    // Filter by Class / Level
    if (selectedRombelId === 'all') {
      return true;
    }
    if (selectedRombelId === 'all-7') {
      return tp.rombelId === 'all' || tp.rombelId === 'all-7' || tp.rombelId?.startsWith('7');
    }
    if (selectedRombelId === 'all-8') {
      return tp.rombelId === 'all' || tp.rombelId === 'all-8' || tp.rombelId?.startsWith('8');
    }
    if (selectedRombelId === 'all-9') {
      return tp.rombelId === 'all' || tp.rombelId === 'all-9' || tp.rombelId?.startsWith('9');
    }

    // Specific rombel selected (e.g. '7A')
    const specificRombel = rombels.find(r => r.id === selectedRombelId);
    const tingkat = specificRombel?.tingkat;
    return (
      tp.rombelId === 'all' ||
      tp.rombelId === selectedRombelId ||
      (tingkat && tp.rombelId === `all-${tingkat}`)
    );
  });

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];

  const getRombelBadge = (rombelId?: string) => {
    if (!rombelId || rombelId === 'all') return 'Semua Kelas (Fase D)';
    if (rombelId === 'all-7') return 'Semua Kelas VII';
    if (rombelId === 'all-8') return 'Semua Kelas VIII';
    if (rombelId === 'all-9') return 'Semua Kelas IX';
    const target = rombels.find(r => r.id === rombelId);
    return target?.nama || rombelId;
  };

  const getSelectedRombelLabel = () => {
    if (selectedRombelId === 'all') return 'Semua Kelas';
    if (selectedRombelId === 'all-7') return 'Semua Kelas VII';
    if (selectedRombelId === 'all-8') return 'Semua Kelas VIII';
    if (selectedRombelId === 'all-9') return 'Semua Kelas IX';
    const r = rombels.find(item => item.id === selectedRombelId);
    return r?.nama || selectedRombelId;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormKode(`TP ${filteredTPs.length + 1}`);
    setFormRombelId(selectedRombelId === 'all' ? 'all' : selectedRombelId);
    setFormLingkupMateri('');
    setFormDeskripsi('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tp: TujuanPembelajaran) => {
    setEditingId(tp.id);
    setFormKode(tp.kodeTP);
    setFormRombelId(tp.rombelId || 'all');
    setFormLingkupMateri(tp.lingkupMateri);
    setFormDeskripsi(tp.deskripsi);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDeskripsi.trim() || !formLingkupMateri.trim()) return;

    if (editingId) {
      const updated = learningObjectives.map(item => {
        if (item.id === editingId) {
          return {
            ...item,
            kodeTP: formKode,
            rombelId: formRombelId,
            lingkupMateri: formLingkupMateri,
            deskripsi: formDeskripsi
          };
        }
        return item;
      });
      onUpdateObjectives(updated);
    } else {
      const newTP: TujuanPembelajaran = {
        id: `tp-${selectedSubjectId}-${Date.now()}`,
        subjectId: selectedSubjectId,
        rombelId: formRombelId,
        kodeTP: formKode,
        lingkupMateri: formLingkupMateri,
        deskripsi: formDeskripsi,
        semester: 'Ganjil'
      };
      onUpdateObjectives([...learningObjectives, newTP]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus Tujuan Pembelajaran ini? Deskripsi penilaian yang terhubung mungkin perlu disesuaikan.')) {
      onUpdateObjectives(learningObjectives.filter(tp => tp.id !== id));
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Filter Toolbar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Tujuan Pembelajaran (TP) & Lingkup Materi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola rumusan kompetensi Kurikulum Merdeka per rombel/tingkat kelas sebagai dasar deskripsi rapor
          </p>
        </div>

        {/* Filter Toolbar: Rombel + Mapel + Action Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Fitur Pilih Kelas / Rombel dengan Opsi Semua Kelas VII, VIII, IX */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Pilih Kelas / Rombel
            </label>
            <select
              value={selectedRombelId}
              onChange={(e) => setSelectedRombelId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[170px]"
            >
              <option value="all">Semua Kelas / Rombel (Fase D)</option>
              <option value="all-7">Semua Kelas VII (Kelas 7)</option>
              <option value="all-8">Semua Kelas VIII (Kelas 8)</option>
              <option value="all-9">Semua Kelas IX (Kelas 9)</option>
              {rombels.length > 0 && (
                <optgroup label="Kelas / Rombel Spesifik">
                  {rombels.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.nama} ({r.fase})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Mata Pelajaran */}
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
                <option key={s.id} value={s.id}>{s.nama}</option>
              ))}
            </select>
          </div>

          <div className="self-end">
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah TP Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-900">
        <Target className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Pedoman Penulisan Deskripsi Kurikulum Merdeka Kemdikbudristek:</p>
          <p className="text-blue-800 text-[11px] mt-0.5 leading-relaxed">
            Tujuan Pembelajaran dapat diatur umum (*Semua Kelas VII, VIII, IX*) atau spesifik untuk rombel tertentu. Deskripsi rapor disusun dengan kalimat operasional yang diawali kata kerja kompetensi (misalnya: <em>"memahami operasi bilangan bulat..."</em>) dan akan disematkan ke capaian rapor siswa.
          </p>
        </div>
      </div>

      {/* TP List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Daftar TP: {selectedSubject.nama} · Sasaran: {getSelectedRombelLabel()}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono font-medium">
            Total {filteredTPs.length} TP Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold w-16 text-center">Kode</th>
                <th className="py-2.5 px-4 font-semibold w-44">Sasaran Tingkat / Kelas</th>
                <th className="py-2.5 px-4 font-semibold w-56">Lingkup Materi</th>
                <th className="py-2.5 px-4 font-semibold">Rumusan Tujuan Pembelajaran</th>
                <th className="py-2.5 px-4 font-semibold w-24 text-center">Semester</th>
                <th className="py-2.5 px-4 font-semibold w-24 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTPs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada Tujuan Pembelajaran yang diinput untuk kriteria filter ini.
                  </td>
                </tr>
              ) : (
                filteredTPs.map((tp) => {
                  const rombelBadge = getRombelBadge(tp.rombelId);
                  const isSpecific = tp.rombelId && tp.rombelId !== 'all';

                  return (
                    <tr key={tp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-bold text-blue-700 text-center font-mono">
                        {tp.kodeTP}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                          isSpecific 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {rombelBadge}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {tp.lingkupMateri}
                      </td>
                      <td className="py-3 px-4 text-slate-700 leading-relaxed">
                        {tp.deskripsi}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-600">
                        {tp.semester}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(tp)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Edit TP"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(tp.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Hapus TP"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit TP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">
              {editingId ? 'Edit Tujuan Pembelajaran' : 'Tambah Tujuan Pembelajaran Baru'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Mata Pelajaran: <strong>{selectedSubject.nama}</strong>
            </p>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kode TP (e.g. TP 1, TP 2)
                  </label>
                  <input
                    type="text"
                    required
                    value={formKode}
                    onChange={(e) => setFormKode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sasaran Tingkat / Kelas
                  </label>
                  <select
                    value={formRombelId}
                    onChange={(e) => setFormRombelId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="all">Semua Kelas (Umum Fase D)</option>
                    <option value="all-7">Semua Kelas VII (Kelas 7)</option>
                    <option value="all-8">Semua Kelas VIII (Kelas 8)</option>
                    <option value="all-9">Semua Kelas IX (Kelas 9)</option>
                    {rombels.length > 0 && (
                      <optgroup label="Kelas / Rombel Spesifik">
                        {rombels.map(r => (
                          <option key={r.id} value={r.id}>{r.nama} ({r.fase})</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lingkup Materi / Topik Bahasan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Operasi Bilangan Bulat dan Pecahan"
                  value={formLingkupMateri}
                  onChange={(e) => setFormLingkupMateri(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rumusan Kalimat Kompetensi (Deskripsi TP)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Gunakan huruf kecil berawalan kata kerja, contoh: memahami konsep persamaan linier satu variabel dan menerapkannya dalam pemecahan masalah kontekstual."
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Deskripsi ini akan disisipkan ke dalam rapor siswa secara otomatis.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
              >
                Simpan TP
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
