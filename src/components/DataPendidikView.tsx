import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  ERaporState, 
  UserProfile, 
  UserRole, 
  Subject, 
  Rombel 
} from '../types/erapor';
import { 
  GraduationCap, 
  UserPlus, 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  Award,
  BookOpen,
  Layers,
  X,
  Edit3,
  Save
} from 'lucide-react';

interface DataPendidikViewProps {
  state: ERaporState;
  onAddUser: (user: UserProfile) => void;
  onUpdateUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
}

export const DataPendidikView: React.FC<DataPendidikViewProps> = ({
  state,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const { users, subjects, rombels, school } = state;

  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal Tambah Guru
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [guruNama, setGuruNama] = useState('');
  const [guruNip, setGuruNip] = useState('');
  const [guruRole, setGuruRole] = useState<UserRole>('guru_mapel');
  const [guruSubjectId, setGuruSubjectId] = useState(subjects[0]?.id || 'mtk');
  const [guruRombelId, setGuruRombelId] = useState(rombels[0]?.id || '7.1');
  const [guruPembinaEkskul, setGuruPembinaEkskul] = useState<string>('');

  // Modal Edit Guru
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editNama, setEditNama] = useState('');
  const [editNip, setEditNip] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('guru_mapel');
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editRombelId, setEditRombelId] = useState('');
  const [editPembinaEkskul, setEditPembinaEkskul] = useState('');

  // Open Edit Modal
  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditNama(user.name);
    setEditNip(user.nip === '-' ? '' : user.nip || '');
    setEditRole(user.role);
    setEditSubjectId(user.subjectId || subjects[0]?.id || 'mtk');
    setEditRombelId(user.rombelId || rombels[0]?.id || '7.1');
    setEditPembinaEkskul(user.pembinaEkskul || '');
  };

  // Submit Edit Guru
  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editNama.trim()) return;

    const updatedUser: UserProfile = {
      ...editingUser,
      name: editNama.trim(),
      nip: editNip.trim() || '-',
      role: editRole,
      subjectId: editRole === 'guru_mapel' ? editSubjectId : (subjects[0]?.id || 'mtk'),
      rombelId: editRole === 'wali_kelas' ? editRombelId : undefined,
      tugasTambahan: editPembinaEkskul ? `Pembina ${editPembinaEkskul}` : undefined,
      pembinaEkskul: editPembinaEkskul || undefined
    };

    onUpdateUser(updatedUser);
    setEditingUser(null);
    setSuccessMsg(`Data pendidik "${updatedUser.name}" berhasil diperbarui.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Statistics
  const totalGuru = users.length;
  const countGuruMapel = users.filter(u => u.role === 'guru_mapel').length;
  const countWaliKelas = users.filter(u => u.role === 'wali_kelas').length;
  const countPembina = users.filter(u => !!u.pembinaEkskul).length;

  // Filtered teachers list
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchNip = u.nip.toLowerCase().includes(q);
        const matchEkskul = (u.pembinaEkskul || '').toLowerCase().includes(q);
        return matchName || matchNip || matchEkskul;
      }
      return true;
    });
  }, [users, roleFilter, searchQuery]);

  // Handle submit add teacher
  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guruNama.trim()) return;

    const generatedId = `user-${Date.now().toString(36)}`;
    const newTeacher: UserProfile = {
      id: generatedId,
      name: guruNama.trim(),
      nip: guruNip.trim() || '-',
      role: guruRole,
      subjectId: guruRole === 'guru_mapel' ? guruSubjectId : (subjects[0]?.id || 'mtk'),
      rombelId: guruRole === 'wali_kelas' ? guruRombelId : undefined,
      tugasTambahan: guruPembinaEkskul ? `Pembina ${guruPembinaEkskul}` : undefined,
      pembinaEkskul: guruPembinaEkskul || undefined
    };

    onAddUser(newTeacher);
    setIsAddModalOpen(false);
    setGuruNama('');
    setGuruNip('');
    setGuruPembinaEkskul('');
    setSuccessMsg(`Pendidik "${newTeacher.name}" berhasil ditambahkan ke database e-Rapor.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Export teachers list to Excel
  const handleExportExcel = () => {
    const data = filteredUsers.map((u, idx) => {
      const subject = subjects.find(s => s.id === u.subjectId);
      const rombel = rombels.find(r => r.id === u.rombelId);
      return {
        'No': idx + 1,
        'Nama Lengkap & Gelar': u.name,
        'NIP': u.nip,
        'Peran Akses': u.role === 'guru_mapel' ? 'Guru Mapel' : u.role === 'wali_kelas' ? 'Wali Kelas' : 'Admin / Kepsek',
        'Mata Pelajaran': subject?.nama || '-',
        'Rombel Binaan': rombel?.nama || '-',
        'Tugas Tambahan': u.pembinaEkskul ? `Pembina ${u.pembinaEkskul}` : '-'
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Data_Pendidik');
    XLSX.writeFile(wb, `Data_Guru_PTK_${school.namaSekolah.replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Manajemen Data Pendidik & Tenaga Kependidikan (PTK)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {totalGuru} Pendidik
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan akun guru pengampu mata pelajaran, wali kelas, serta penugasan pembina ekstrakurikuler.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Tambah Guru Baru</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">Total Tenaga Pendidik</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{totalGuru} Pendidik</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">Guru Mata Pelajaran</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{countGuruMapel} Orang</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">Wali Kelas</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{countWaliKelas} Kelas</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">Pembina Ekstrakurikuler</p>
          <p className="text-xl font-bold text-amber-600 mt-1">{countPembina} Guru</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
            Filter Peran:
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">Semua Peran ({totalGuru})</option>
            <option value="guru_mapel">Guru Mata Pelajaran</option>
            <option value="wali_kelas">Wali Kelas</option>
            <option value="admin">Administrator / Kepala Sekolah</option>
          </select>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama guru, NIP, atau ekskul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Table of Teachers */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 font-semibold w-12 text-center">No</th>
                <th className="py-3 px-4 font-semibold">Nama Lengkap Pendidik & Gelar</th>
                <th className="py-3 px-4 font-semibold w-48">NIP</th>
                <th className="py-3 px-3.5 font-semibold w-32">Peran Akses</th>
                <th className="py-3 px-4 font-semibold">Penugasan Mengajar / Wali</th>
                <th className="py-3 px-4 font-semibold">Tugas Tambahan (Pembina)</th>
                <th className="py-3 px-3 font-semibold w-16 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u, idx) => {
                const subject = subjects.find(s => s.id === u.subjectId);
                const rombel = rombels.find(r => r.id === u.rombelId);

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 text-center font-mono text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{u.name}</p>
                      <p className="text-[10px] text-slate-400">ID: {u.id}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {u.nip || '-'}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${
                        u.role === 'guru_mapel'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : u.role === 'wali_kelas'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-purple-50 text-purple-800 border border-purple-200'
                      }`}>
                        {u.role === 'guru_mapel' && 'Guru Mapel'}
                        {u.role === 'wali_kelas' && 'Wali Kelas'}
                        {(u.role === 'admin' || u.role === 'kepala_sekolah') && 'Admin / Kepsek'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {u.role === 'guru_mapel' && (
                        <span>Mengampu: <strong>{subject?.nama || 'Matematika'}</strong></span>
                      )}
                      {u.role === 'wali_kelas' && (
                        <span>Wali Kelas: <strong>{rombel?.nama || 'Kelas 7.1'}</strong></span>
                      )}
                      {(u.role === 'admin' || u.role === 'kepala_sekolah') && (
                        <span className="text-slate-500 italic">Pimpinan Satuan Pendidikan</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {u.pembinaEkskul ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
                          <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Pembina {u.pembinaEkskul}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs italic">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Data Pendidik"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {users.length > 1 && u.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus guru "${u.name}" dari sistem e-Rapor?`)) {
                                onDeleteUser(u.id);
                                setSuccessMsg(`Pendidik "${u.name}" berhasil dihapus.`);
                                setTimeout(() => setSuccessMsg(null), 3000);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Hapus Guru"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Guru Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmitAdd} className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>Tambah Pendidik / Guru Baru</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Tambahkan data guru pengampu, wali kelas, atau pembina ekstrakurikuler ke e-Rapor
            </p>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar Pendidik
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Hendra Gunawan, S.Pd."
                  value={guruNama}
                  onChange={(e) => setGuruNama(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Induk Pegawai (NIP)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 19890520 201503 1 004 (atau kosongkan jika non-NIP)"
                  value={guruNip}
                  onChange={(e) => setGuruNip(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Peran Akses Utama
                </label>
                <select
                  value={guruRole}
                  onChange={(e) => setGuruRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="guru_mapel">Guru Mata Pelajaran</option>
                  <option value="wali_kelas">Wali Kelas</option>
                  <option value="admin">Administrator / Kepala Sekolah</option>
                </select>
              </div>

              {guruRole === 'guru_mapel' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mata Pelajaran yang Diampu
                  </label>
                  <select
                    value={guruSubjectId}
                    onChange={(e) => setGuruSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.kode})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {guruRole === 'wali_kelas' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rombel Binaan Sebagai Wali Kelas
                  </label>
                  <select
                    value={guruRombelId}
                    onChange={(e) => setGuruRombelId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {rombels.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.nama} ({r.fase})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tugas Tambahan Pembina Ekskul */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Tugas Tambahan (Pembina Ekstrakurikuler)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Opsional</span>
                </label>
                <select
                  value={guruPembinaEkskul}
                  onChange={(e) => setGuruPembinaEkskul(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">- Tidak Ada Tugas Tambahan -</option>
                  <option value="OSIS">Pembina OSIS</option>
                  <option value="Pramuka">Pembina Pramuka</option>
                  <option value="Rohis">Pembina Rohis</option>
                  <option value="UKS">Pembina UKS</option>
                  <option value="Seni Tari">Pembina Seni Tari</option>
                  <option value="Olah Raga">Pembina Olah Raga</option>
                </select>

                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-slate-500 font-medium">Pilihan Cepat:</span>
                  {['OSIS', 'Pramuka', 'Rohis', 'UKS', 'Seni Tari', 'Olah Raga'].map((ekskul) => (
                    <button
                      key={ekskul}
                      type="button"
                      onClick={() => setGuruPembinaEkskul(guruPembinaEkskul === ekskul ? '' : ekskul)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-all ${
                        guruPembinaEkskul === ekskul
                          ? 'bg-amber-500 text-white font-semibold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {ekskul}
                    </button>
                  ))}
                </div>
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
                Simpan Guru
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Edit Guru */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmitEdit} className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>Edit Profil & Data Pendidik</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar Pendidik
                </label>
                <input
                  type="text"
                  required
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Induk Pegawai (NIP)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 19890520 201503 1 004 (atau - jika non-NIP)"
                  value={editNip}
                  onChange={(e) => setEditNip(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Peran Akses Utama di e-Rapor
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="guru_mapel">Guru Mata Pelajaran</option>
                  <option value="wali_kelas">Wali Kelas & Guru Mapel</option>
                  <option value="admin">Administrator Sekolah</option>
                  <option value="kepala_sekolah">Kepala Sekolah</option>
                </select>
              </div>

              {/* Pilihan Mapel jika guru mapel */}
              {editRole === 'guru_mapel' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mata Pelajaran yang Diampu
                  </label>
                  <select
                    value={editSubjectId}
                    onChange={(e) => setEditSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.kode})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pilihan Rombel jika wali kelas */}
              {editRole === 'wali_kelas' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rombel Binaan Sebagai Wali Kelas
                  </label>
                  <select
                    value={editRombelId}
                    onChange={(e) => setEditRombelId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {rombels.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.nama} ({r.fase})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tugas Tambahan Pembina Ekskul */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Tugas Tambahan (Pembina Ekstrakurikuler)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Opsional</span>
                </label>
                <select
                  value={editPembinaEkskul}
                  onChange={(e) => setEditPembinaEkskul(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">- Tidak Ada Tugas Tambahan -</option>
                  <option value="OSIS">Pembina OSIS</option>
                  <option value="Pramuka">Pembina Pramuka</option>
                  <option value="Rohis">Pembina Rohis</option>
                  <option value="UKS">Pembina UKS</option>
                  <option value="Seni Tari">Pembina Seni Tari</option>
                  <option value="Olah Raga">Pembina Olah Raga</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
