import React, { useState, useEffect } from 'react';
import { 
  ERaporState, 
  SchoolInfo, 
  Rombel, 
  UserProfile, 
  UserRole,
  Subject 
} from '../types/erapor';
import { 
  Settings, 
  School, 
  Users, 
  Lock, 
  Unlock, 
  Save, 
  CheckCircle, 
  RotateCcw, 
  Download, 
  Upload,
  Calendar,
  Shield,
  Plus,
  Trash2,
  GraduationCap,
  Layers,
  BookOpen,
  UserPlus,
  Award,
  Image as ImageIcon,
  Loader2,
  Edit3,
  X
} from 'lucide-react';
import { defaultLogoPemda, defaultLogoSekolah } from '../data/initialData';
import { compressLogoImage } from '../utils/imageCompressor';

interface DataSekolahViewProps {
  state: ERaporState;
  onUpdateSchool: (school: SchoolInfo) => void;
  onToggleLock: () => void;
  onResetData: () => void;
  onAddRombel: (rombel: Rombel) => void;
  onDeleteRombel: (rombelId: string) => void;
  onAddUser: (user: UserProfile) => void;
  onUpdateUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
}

export const DataSekolahView: React.FC<DataSekolahViewProps> = ({
  state,
  onUpdateSchool,
  onToggleLock,
  onResetData,
  onAddRombel,
  onDeleteRombel,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const { school, isLocked, rombels, users, subjects } = state;

  const [activeTab, setActiveTab] = useState<'sekolah' | 'rombel' | 'guru' | 'mapel'>('sekolah');
  const [formData, setFormData] = useState<SchoolInfo>({ ...school });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  // Sync formData whenever school state updates (e.g. from cloud or parent)
  useEffect(() => {
    setFormData({ ...school });
  }, [school]);

  // Modal Tambah Rombel
  const [isAddRombelOpen, setIsAddRombelOpen] = useState(false);
  const [rombelNama, setRombelNama] = useState('');
  const [rombelTingkat, setRombelTingkat] = useState<number>(7);
  const [rombelFase, setRombelFase] = useState('Fase D');
  const [rombelWaliId, setRombelWaliId] = useState(users[0]?.id || '');
  const [rombelJumlahSiswa, setRombelJumlahSiswa] = useState<number>(30);

  // Modal Tambah Guru
  const [isAddGuruOpen, setIsAddGuruOpen] = useState(false);
  const [guruNama, setGuruNama] = useState('');
  const [guruNip, setGuruNip] = useState('');
  const [guruRole, setGuruRole] = useState<UserRole>('guru_mapel');
  const [guruSubjectId, setGuruSubjectId] = useState(subjects[0]?.id || 'mtk');
  const [guruRombelId, setGuruRombelId] = useState(rombels[0]?.id || '7A');
  const [guruPembinaEkskul, setGuruPembinaEkskul] = useState<string>('');

  // Modal Edit Guru
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editGuruNama, setEditGuruNama] = useState('');
  const [editGuruNip, setEditGuruNip] = useState('');
  const [editGuruRole, setEditGuruRole] = useState<UserRole>('guru_mapel');
  const [editGuruSubjectId, setEditGuruSubjectId] = useState('');
  const [editGuruRombelId, setEditGuruRombelId] = useState('');
  const [editGuruPembinaEkskul, setEditGuruPembinaEkskul] = useState('');

  const handleOpenEditGuru = (user: UserProfile) => {
    setEditingUser(user);
    setEditGuruNama(user.name);
    setEditGuruNip(user.nip === '-' ? '' : user.nip || '');
    setEditGuruRole(user.role);
    setEditGuruSubjectId(user.subjectId || subjects[0]?.id || 'mtk');
    setEditGuruRombelId(user.rombelId || rombels[0]?.id || '7A');
    setEditGuruPembinaEkskul(user.pembinaEkskul || '');
  };

  const handleSubmitEditGuru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editGuruNama.trim()) return;

    const updatedTeacher: UserProfile = {
      ...editingUser,
      name: editGuruNama.trim(),
      nip: editGuruNip.trim() || '-',
      role: editGuruRole,
      subjectId: editGuruRole === 'guru_mapel' ? editGuruSubjectId : (subjects[0]?.id || 'mtk'),
      rombelId: editGuruRole === 'wali_kelas' ? editGuruRombelId : undefined,
      tugasTambahan: editGuruPembinaEkskul ? `Pembina ${editGuruPembinaEkskul}` : undefined,
      pembinaEkskul: editGuruPembinaEkskul || undefined
    };

    onUpdateUser(updatedTeacher);
    setEditingUser(null);
    setSuccessMsg(`Data pendidik "${updatedTeacher.name}" berhasil diperbarui.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleChange = (field: keyof SchoolInfo, val: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleLogoUpload = async (type: 'logoSekolah' | 'logoPemda', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(type);
      // Auto compress and resize image to fit comfortably under Firestore and localStorage limits (~25KB)
      const compressedDataUrl = await compressLogoImage(file, 280, 280, 0.85);

      // Save directly to dedicated localStorage key so it's immune to cache resets
      const storageKey = type === 'logoSekolah' ? 'custom_logo_sekolah' : 'custom_logo_pemda';
      try {
        localStorage.setItem(storageKey, compressedDataUrl);
      } catch (storageErr) {
        console.warn('LocalStorage error:', storageErr);
      }

      // Update form state AND instantly commit to global state & Firestore Cloud
      const updatedSchool: SchoolInfo = {
        ...formData,
        [type]: compressedDataUrl
      };

      setFormData(updatedSchool);
      onUpdateSchool(updatedSchool);

      setSuccessMsg(`✓ ${type === 'logoPemda' ? 'Logo Pemda' : 'Logo Sekolah'} berhasil diunggah dan disimpan permanen.`);
      setTimeout(() => setSuccessMsg(null), 4500);
    } catch (err: any) {
      console.error('Logo upload error:', err);
      alert(err.message || 'Gagal memproses file logo.');
    } finally {
      setIsUploading(null);
      e.target.value = '';
    }
  };

  const handleResetLogo = (type: 'logoSekolah' | 'logoPemda') => {
    const storageKey = type === 'logoSekolah' ? 'custom_logo_sekolah' : 'custom_logo_pemda';
    try {
      localStorage.removeItem(storageKey);
    } catch (_) {}

    const defaultLogo = type === 'logoPemda' ? defaultLogoPemda : defaultLogoSekolah;
    const updatedSchool: SchoolInfo = {
      ...formData,
      [type]: defaultLogo
    };

    setFormData(updatedSchool);
    onUpdateSchool(updatedSchool);

    setSuccessMsg(`Logo ${type === 'logoPemda' ? 'Pemda' : 'Sekolah'} dikembalikan ke logo bawaan sistem.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleSaveSchool = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchool(formData);
    setSuccessMsg('Data profil sekolah dan tahun ajaran e-Rapor berhasil diperbarui.');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Submit Tambah Rombel
  const handleSubmitAddRombel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rombelNama.trim()) return;

    const selectedWali = users.find(u => u.id === rombelWaliId) || users[0];
    const generatedId = `rombel-${Date.now().toString(36)}`;

    const newRombel: Rombel = {
      id: generatedId,
      nama: rombelNama.trim(),
      tingkat: Number(rombelTingkat),
      fase: rombelFase.trim() || 'Fase D',
      waliKelasId: selectedWali.id,
      waliKelasNama: selectedWali.name,
      waliKelasNip: selectedWali.nip || '-',
      tahunAjaran: school.tahunAjaran,
      semester: school.semester,
      jumlahSiswa: Number(rombelJumlahSiswa) || 0
    };

    onAddRombel(newRombel);
    setIsAddRombelOpen(false);
    setRombelNama('');
    setRombelJumlahSiswa(30);
    setSuccessMsg(`Rombongan belajar "${newRombel.nama}" berhasil ditambahkan.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Submit Tambah Guru
  const handleSubmitAddGuru = (e: React.FormEvent) => {
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
    setIsAddGuruOpen(false);
    setGuruNama('');
    setGuruNip('');
    setGuruPembinaEkskul('');
    setSuccessMsg(`Data pendidik "${newTeacher.name}" berhasil ditambahkan.`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Data Sekolah, Rombel & Tenaga Pendidik
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen identitas sekolah, penambahan rombel, data guru pengampu, dan status kunci e-Rapor
          </p>
        </div>

        {/* Lock Switch Button */}
        <button
          type="button"
          onClick={onToggleLock}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${
            isLocked 
              ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200' 
              : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
          }`}
        >
          {isLocked ? <Lock className="w-4 h-4 text-amber-700" /> : <Unlock className="w-4 h-4 text-emerald-600" />}
          <span>{isLocked ? 'Penginputan Terkunci (Buka Kunci)' : 'Penginputan Dibuka (Kunci Nilai)'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 max-w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('sekolah')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'sekolah' 
              ? 'bg-white text-blue-700 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Profil Sekolah</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rombel')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'rombel' 
              ? 'bg-white text-blue-700 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Rombongan Belajar ({rombels.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('guru')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'guru' 
              ? 'bg-white text-blue-700 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Daftar Guru & PTK ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mapel')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'mapel' 
              ? 'bg-white text-blue-700 shadow-xs' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Mata Pelajaran ({subjects.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PROFIL IDENTITAS SEKOLAH & TAHUN AJARAN */}
      {/* ========================================================= */}
      {activeTab === 'sekolah' && (
        <form onSubmit={handleSaveSchool} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <School className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Formulir Identitas Satuan Pendidikan & Logo Resmi
            </h3>
          </div>

          {/* SECTION UPLOAD LOGO PEMDA & LOGO SEKOLAH */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Upload Logo Pemerintah Daerah & Logo Resmi Sekolah
                </h4>
              </div>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline-block">
                Otomatis tampil pada Kop Surat Rapor, Sampul (Cover), dan Dokumen Leger
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Card 1: Logo Pemerintah Daerah (Pemda) */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between space-y-3 shadow-2xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-20 h-20 rounded-lg border-2 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                    {formData.logoPemda ? (
                      <img 
                        src={formData.logoPemda} 
                        alt="Logo Pemda" 
                        className="w-full h-full object-contain p-1" 
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">Logo Pemda (Kabupaten)</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        Kop Kiri Rapor
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Lambang Pemda Kabupaten Tulang Bawang Barat pada kop surat rapor nilai dan leger.
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Format: PNG, JPG, SVG, WebP (Maks. 3 MB)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 ${isUploading === 'logoPemda' ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors`}>
                    {isUploading === 'logoPemda' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo Pemda</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={isUploading !== null}
                      className="hidden" 
                      onChange={(e) => handleLogoUpload('logoPemda', e)} 
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleResetLogo('logoPemda')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    title="Kembalikan ke Lambang Bawaan Tubaba"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Default</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Logo Resmi Sekolah */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between space-y-3 shadow-2xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-20 h-20 rounded-lg border-2 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                    {formData.logoSekolah ? (
                      <img 
                        src={formData.logoSekolah} 
                        alt="Logo Sekolah" 
                        className="w-full h-full object-contain p-1" 
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">Logo Resmi Sekolah</span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                        Cover & Kop Kanan
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Logo emblem SMPN 14 Tubaba untuk sampul (cover) rapor, kop surat, dan bar aplikasi.
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Format: PNG, JPG, SVG, WebP (Otomatis dikompres & disimpan permanen)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 ${isUploading === 'logoSekolah' ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors`}>
                    {isUploading === 'logoSekolah' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Logo Sekolah</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      disabled={isUploading !== null}
                      className="hidden" 
                      onChange={(e) => handleLogoUpload('logoSekolah', e)} 
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleResetLogo('logoSekolah')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                    title="Kembalikan ke Logo Bawaan Sekolah"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Default</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Resmi Sekolah
              </label>
              <input
                type="text"
                required
                value={formData.namaSekolah}
                onChange={(e) => handleChange('namaSekolah', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NPSN
              </label>
              <input
                type="text"
                required
                value={formData.npsn}
                onChange={(e) => handleChange('npsn', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NSS
              </label>
              <input
                type="text"
                value={formData.nss}
                onChange={(e) => handleChange('nss', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Alamat Sekolah
              </label>
              <input
                type="text"
                required
                value={formData.alamat}
                onChange={(e) => handleChange('alamat', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kecamatan
              </label>
              <input
                type="text"
                value={formData.kecamatan}
                onChange={(e) => handleChange('kecamatan', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kabupaten
              </label>
              <input
                type="text"
                value={formData.kabupaten}
                onChange={(e) => handleChange('kabupaten', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Kepala Sekolah
              </label>
              <input
                type="text"
                required
                value={formData.kepalaSekolah}
                onChange={(e) => handleChange('kepalaSekolah', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                type="text"
                required
                value={formData.nipKepalaSekolah}
                onChange={(e) => handleChange('nipKepalaSekolah', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tahun Ajaran
              </label>
              <input
                type="text"
                required
                value={formData.tahunAjaran}
                onChange={(e) => handleChange('tahunAjaran', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Pembagian Rapor
              </label>
              <input
                type="text"
                required
                value={formData.tanggalRapor}
                onChange={(e) => handleChange('tanggalRapor', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan Sekolah</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MANAJEMEN ROMBONGAN BELAJAR (ROMBEL) */}
      {/* ========================================================= */}
      {activeTab === 'rombel' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Daftar Rombongan Belajar (Rombel) SMPN 14 Tulang Bawang Barat
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola rombel/kelas, wali kelas pendamping, dan jumlah peserta didik
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddRombelOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Rombel Baru</span>
            </button>
          </div>

          {/* Rombel Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rombels.map((r, idx) => (
              <div 
                key={r.id} 
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-xs transition-all space-y-3 relative group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                      {r.tingkat}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{r.nama}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{r.fase} · T.A. {r.tahunAjaran}</p>
                    </div>
                  </div>

                  {rombels.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Hapus rombel "${r.nama}"?`)) {
                          onDeleteRombel(r.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-1"
                      title="Hapus Rombel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200/80 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Wali Kelas:</span>
                    <strong className="text-slate-800 font-semibold">{r.waliKelasNama}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">NIP Wali:</span>
                    <span className="font-mono text-slate-600 text-[11px]">{r.waliKelasNip}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Kapasitas:</span>
                    <span className="font-mono font-bold text-blue-700">{r.jumlahSiswa} Siswa</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: MANAJEMEN DATA GURU & WALI KELAS */}
      {/* ========================================================= */}
      {activeTab === 'guru' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Daftar Pendidik dan Tenaga Kependidikan (Guru & Wali Kelas)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola data akun guru pengampu mata pelajaran dan wali kelas SMPN 14 Tulang Bawang Barat
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddGuruOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Guru Baru</span>
            </button>
          </div>

          {/* Table of Teachers */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold w-12 text-center">No</th>
                  <th className="py-2.5 px-4 font-semibold">Nama Lengkap Guru & Gelar</th>
                  <th className="py-2.5 px-4 font-semibold w-44">NIP</th>
                  <th className="py-2.5 px-4 font-semibold w-32">Peran Akses</th>
                  <th className="py-2.5 px-4 font-semibold">Penugasan Mapel / Rombel</th>
                  <th className="py-2.5 px-4 font-semibold">Tugas Tambahan (Pembina)</th>
                  <th className="py-2.5 px-4 font-semibold w-16 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u, idx) => {
                  const subjectAssigned = subjects.find(s => s.id === u.subjectId);
                  const rombelAssigned = rombels.find(r => r.id === u.rombelId);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{u.name}</p>
                        <p className="text-[10px] text-slate-400">ID: {u.id}</p>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {u.nip || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
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
                          <span>Mengampu: <strong>{subjectAssigned?.nama || 'Matematika'}</strong></span>
                        )}
                        {u.role === 'wali_kelas' && (
                          <span>Wali Kelas: <strong>{rombelAssigned?.nama || 'Kelas VII-A'}</strong></span>
                        )}
                        {(u.role === 'admin' || u.role === 'kepala_sekolah') && (
                          <span className="text-slate-500">Penanggung Jawab Lembaga</span>
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
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditGuru(u)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="Edit Data Guru"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {users.length > 1 && u.role !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Hapus guru "${u.name}" dari sistem e-Rapor?`)) {
                                  onDeleteUser(u.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
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
      )}

      {/* ========================================================= */}
      {/* TAB 4: MATA PELAJARAN (KURIKULUM MERDEKA) */}
      {/* ========================================================= */}
      {activeTab === 'mapel' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Daftar Mata Pelajaran Kurikulum Merdeka ({subjects.length} Mapel)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Struktur kurikulum nasional fase D SMPN 14 Tulang Bawang Barat
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {subjects.length} Mata Pelajaran Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 font-semibold w-12 text-center">No</th>
                  <th className="py-3 px-3.5 font-semibold w-24">Kode</th>
                  <th className="py-3 px-4 font-semibold">Nama Mata Pelajaran</th>
                  <th className="py-3 px-3.5 font-semibold w-28">Kategori</th>
                  <th className="py-3 px-3 font-semibold w-20 text-center">KKTP</th>
                  <th className="py-3 px-4 font-semibold">Guru Pengampu Terdaftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subjects.map((s, idx) => {
                  const isReligious = ['pai', 'pak_kristen', 'pak_katolik', 'pah_hindu', 'pab_buddha'].includes(s.id);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3.5 font-mono font-bold text-blue-900">
                        {s.kode}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{s.nama}</p>
                        {isReligious && (
                          <span className="inline-block mt-0.5 text-[10px] font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                            Pendidikan Agama & Budi Pekerti
                          </span>
                        )}
                        {s.id === 'prakarya' && (
                          <span className="inline-block mt-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Prakarya (Pengolahan & Kerajinan)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10.5px] font-semibold ${
                          s.kategori === 'Muatan Lokal'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {s.kategori}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-blue-700">
                        {s.kktp}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {s.guruPengampuNama || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TAMBAH ROMBEL */}
      {/* ========================================================= */}
      {isAddRombelOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmitAddRombel} className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Tambah Rombongan Belajar (Rombel) Baru
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Tambahkan kelas baru ke dalam sistem e-Rapor {school.namaSekolah}
            </p>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Rombel / Kelas
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kelas VII-C, Kelas VIII-A, Kelas IX-B"
                  value={rombelNama}
                  onChange={(e) => setRombelNama(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tingkat Kelas
                  </label>
                  <select
                    value={rombelTingkat}
                    onChange={(e) => setRombelTingkat(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value={7}>Kelas 7 (Fase D)</option>
                    <option value={8}>Kelas 8 (Fase D)</option>
                    <option value={9}>Kelas 9 (Fase D)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kapasitas Siswa
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={rombelJumlahSiswa}
                    onChange={(e) => setRombelJumlahSiswa(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fase Kurikulum
                </label>
                <input
                  type="text"
                  required
                  value={rombelFase}
                  onChange={(e) => setRombelFase(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Guru Sebagai Wali Kelas
                </label>
                <select
                  value={rombelWaliId}
                  onChange={(e) => setRombelWaliId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} (NIP. {u.nip || '-'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddRombelOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Simpan Rombel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TAMBAH GURU */}
      {/* ========================================================= */}
      {isAddGuruOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmitAddGuru} className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-600" />
              Tambah Pendidik / Guru Baru
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Tambahkan data guru pengampu atau wali kelas ke dalam sistem e-Rapor
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
                  placeholder="Contoh: 19890520 201503 1 004 (atau kosongkan / '-' jika non-NIP)"
                  value={guruNip}
                  onChange={(e) => setGuruNip(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Peran / Tugas Utama
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

              {/* Field Tugas Tambahan: Pembina Ekstrakurikuler */}
              <div className="pt-1 border-t border-slate-100">
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
                  <span className="text-[10px] text-slate-500 font-medium">Pilihan Ekskul:</span>
                  {(['OSIS', 'Pramuka', 'Rohis', 'UKS', 'Seni Tari', 'Olah Raga'] as const).map((ekskul) => (
                    <button
                      key={ekskul}
                      type="button"
                      onClick={() => setGuruPembinaEkskul(guruPembinaEkskul === ekskul ? '' : ekskul)}
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-all ${
                        guruPembinaEkskul === ekskul
                          ? 'bg-amber-500 text-white font-semibold shadow-2xs'
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
                onClick={() => setIsAddGuruOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
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
          <form onSubmit={handleSubmitEditGuru} className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
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
                  value={editGuruNama}
                  onChange={(e) => setEditGuruNama(e.target.value)}
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
                  value={editGuruNip}
                  onChange={(e) => setEditGuruNip(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Peran Akses Utama di e-Rapor
                </label>
                <select
                  value={editGuruRole}
                  onChange={(e) => setEditGuruRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="guru_mapel">Guru Mata Pelajaran</option>
                  <option value="wali_kelas">Wali Kelas & Guru Mapel</option>
                  <option value="admin">Administrator Sekolah</option>
                  <option value="kepala_sekolah">Kepala Sekolah</option>
                </select>
              </div>

              {/* Pilihan Mapel jika guru mapel */}
              {editGuruRole === 'guru_mapel' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mata Pelajaran yang Diampu
                  </label>
                  <select
                    value={editGuruSubjectId}
                    onChange={(e) => setEditGuruSubjectId(e.target.value)}
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
              {editGuruRole === 'wali_kelas' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rombel Binaan Sebagai Wali Kelas
                  </label>
                  <select
                    value={editGuruRombelId}
                    onChange={(e) => setEditGuruRombelId(e.target.value)}
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
                  value={editGuruPembinaEkskul}
                  onChange={(e) => setEditGuruPembinaEkskul(e.target.value)}
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
