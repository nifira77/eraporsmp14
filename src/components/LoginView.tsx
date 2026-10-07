import React, { useState } from 'react';
import { ERaporState, UserProfile } from '../types/erapor';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap, 
  School, 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  Layers,
  ChevronRight,
  HelpCircle,
  Award
} from 'lucide-react';

interface LoginViewProps {
  state: ERaporState;
  onLogin: (user: UserProfile) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ state, onLogin }) => {
  const { school, users, rombels } = state;

  // Selected persona / custom input
  const defaultTeacher = users[1] || users[0];
  const [selectedUserId, setSelectedUserId] = useState<string>(defaultTeacher?.id || 'user-siti');
  const [usernameInput, setUsernameInput] = useState<string>(defaultTeacher?.name || 'Siti Rahmawati, S.Pd.');
  const [passwordInput, setPasswordInput] = useState<string>('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // When persona dropdown changes, update username directly to teacher name
  const handleSelectPersona = (userId: string) => {
    setSelectedUserId(userId);
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      setUsernameInput(targetUser.name);
      setErrorMessage(null);
    }
  };

  // Handle direct one-click quick login for testing
  const handleQuickLogin = (roleOrId: string) => {
    let target = users.find(u => u.id === roleOrId);
    if (!target) {
      if (roleOrId === 'admin') target = users.find(u => u.role === 'admin');
      else if (roleOrId === 'wali_7.1') target = users.find(u => u.rombelId === '7.1');
      else if (roleOrId === 'wali_7.2') target = users.find(u => u.rombelId === '7.2');
    }
    if (target) {
      setSelectedUserId(target.id);
      setUsernameInput(target.name);
      setPasswordInput('123456');
      performLogin(target);
    }
  };

  const performLogin = (userToLogin: UserProfile) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(userToLogin);
    }, 300);
  };

  // Helper to strip academic titles for flexible matching
  const stripTitles = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/^(drs\.|dra\.|ir\.|h\.|hj\.)\s*/gi, '')
      .replace(/,\s*(s\.pd|m\.pd|s\.kom|s\.th|s\.pd\.i|m\.si|m\.m)\.?/gi, '')
      .replace(/[^a-z0-9]/g, '');
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const inputTrim = usernameInput.trim();
    if (!inputTrim) {
      setErrorMessage('Silakan masukkan Username (Nama Guru).');
      return;
    }

    const passTrim = passwordInput.trim();
    if (!passTrim) {
      setErrorMessage('Silakan masukkan Kata Sandi (Password).');
      return;
    }

    // Password must be 123456 (or admin123 as alternative fallback)
    if (passTrim !== '123456' && passTrim !== 'admin123') {
      setErrorMessage('Kata sandi salah! Password yang berlaku adalah: 123456');
      return;
    }

    // Try finding teacher by name
    const inputClean = stripTitles(inputTrim);
    let matchedUser = users.find(u => u.name.toLowerCase() === inputTrim.toLowerCase());
    
    if (!matchedUser) {
      // Try matching by stripped title (e.g. "Siti Rahmawati" matches "Siti Rahmawati, S.Pd.")
      matchedUser = users.find(u => stripTitles(u.name) === inputClean);
    }

    if (!matchedUser) {
      // Try substring match
      matchedUser = users.find(u => u.name.toLowerCase().includes(inputTrim.toLowerCase()));
    }

    if (!matchedUser && (inputTrim.toLowerCase() === 'admin' || inputClean === 'admin')) {
      matchedUser = users.find(u => u.role === 'admin' || u.role === 'kepala_sekolah');
    }

    // If still not matched, check if user chose from dropdown
    if (!matchedUser && selectedUserId) {
      matchedUser = users.find(u => u.id === selectedUserId);
    }

    if (!matchedUser) {
      setErrorMessage(`Nama guru "${usernameInput}" tidak ditemukan di sistem. Silakan pilih nama dari daftar guru yang terdaftar.`);
      return;
    }

    performLogin(matchedUser);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 font-sans text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* ============================================================== */}
      {/* BAGIAN KIRI: WALLPAPER HEROIK MENARIK (58% LEBAR DESKTOP) */}
      {/* ============================================================== */}
      <div className="relative w-full lg:w-[58%] xl:w-[60%] min-h-[420px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-hidden text-white">
        {/* Background Wallpaper Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/erapor_login_wallpaper_1791292811927.jpg" 
            alt="Suasana Pendidikan SMPN 14 Tulang Bawang Barat" 
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000 ease-out"
          />
          {/* Multi-layered Gradients for readability & rich contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/60" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-slate-950/70 to-transparent" />
          {/* Fine subtle pattern grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        </div>

        {/* Top Bar: Official Emblems & Header */}
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Logo Pemda */}
            {school.logoPemda && (
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center shadow-lg">
                <img 
                  src={school.logoPemda} 
                  alt="Logo Pemda Tulang Bawang Barat" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            {/* Logo Sekolah */}
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center shadow-lg">
              <img 
                src={school.logoSekolah || "/src/assets/images/school_logo_emblem_1790936910635.jpg"} 
                alt="Lambang SMPN 14 Tulang Bawang Barat" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-widest text-blue-300 uppercase">
                DINAS PENDIDIKAN & KEBUDAYAAN
              </p>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white">
                {school.namaSekolah}
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Fase D · Kurikulum Merdeka</span>
          </div>
        </div>

        {/* Center Hero: Core App Information */}
        <div className="relative z-10 my-auto py-8 lg:py-12 max-w-xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Sistem Penilaian e-Rapor SP Resmi 2026/2027</span>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Aplikasi e-Rapor SP <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-emerald-300">
                SMPN 14 Tubaba
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-lg font-normal">
              Portal penginputan Tujuan Pembelajaran (TP), asesmen Sumatif Lingkup Materi (LM), Sumatif Tengah Semester (STS), Sumatif Akhir Semester (SAS), hingga pencetakan rapor cetak dan leger nilai kurikulum merdeka.
            </p>
          </div>

          {/* Quick Highlight Feature Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <div className="flex items-center gap-2 text-blue-300 text-xs font-bold">
                <Layers className="w-4 h-4" />
                <span>12 Rombel</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Kelas 7.1–7.4, 8.1–8.4, dan 9.1–9.4 definitif.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                <BookOpen className="w-4 h-4" />
                <span>11 Mapel SP</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Prakarya, Mulok Lampung, dan 5 Agama terpadu.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                <Award className="w-4 h-4" />
                <span>Format Standar</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Cover, Biodata, Leger Excel & Rapor Cetak A4.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Inspirational Quote & Location */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <p className="italic text-[11px] max-w-md text-slate-300">
            &ldquo;Ing ngarsa sung tuladha, ing madya mangun karsa, tut wuri handayani.&rdquo;
          </p>
          <div className="flex items-center gap-2 text-[11px] text-blue-200">
            <School className="w-3.5 h-3.5 text-blue-400" />
            <span>Tubaba Tengah, Lampung</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BAGIAN KANAN: FORM LOGIN BERSIH & MODERN (FIELD DI SEBELAH KANAN) */}
      {/* ============================================================== */}
      <div className="w-full lg:w-[42%] xl:w-[40%] bg-white min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 shadow-2xl relative z-20 overflow-y-auto">
        {/* Top Header inside Login Form */}
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                SP
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  e-Rapor SP Kurikulum Merdeka
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {school.namaSekolah}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              TP {school.tahunAjaran}
            </span>
          </div>

          <div className="mt-8 space-y-1.5">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Silakan pilih atau masukkan identitas akun Pendidik / Tenaga Kependidikan untuk masuk ke dashboard e-Rapor.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mt-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* FORM LOGIN */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4.5">
            {/* Field 1: Pilih Akun Guru / Persona (Dropdown) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Pilih Akun Guru / Tenaga Pendidik
              </label>
              <div className="relative">
                <select
                  value={selectedUserId}
                  onChange={(e) => handleSelectPersona(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors appearance-none pr-8 cursor-pointer shadow-2xs"
                >
                  <optgroup label="Administrator & Pimpinan Sekolah">
                    {users.filter(u => u.role === 'admin' || u.role === 'kepala_sekolah').map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} (Administrator / Kepala Sekolah)
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Wali Kelas & Guru Mapel (Tingkat 7)">
                    {users.filter(u => u.rombelId?.startsWith('7')).map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} (Wali Kelas {u.rombelId})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Wali Kelas & Guru Mapel (Tingkat 8)">
                    {users.filter(u => u.rombelId?.startsWith('8')).map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} (Wali Kelas {u.rombelId})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Wali Kelas & Guru Mapel (Tingkat 9)">
                    {users.filter(u => u.rombelId?.startsWith('9')).map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} (Wali Kelas {u.rombelId})
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Field 2: Username (Nama Guru) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Username (Nama Guru)
                </label>
                <span className="text-[10px] text-blue-600 font-medium">
                  Sesuai Nama Guru
                </span>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="Ketik atau pilih nama guru..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors shadow-2xs"
                />
              </div>
            </div>

            {/* Field 3: Kata Sandi (Password) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Kata Sandi (Password)
                </label>
                <span className="text-[10px] text-blue-600 font-medium">
                  Default: 123456
                </span>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox Ingat Saya & Info Bantuan */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span className="text-[11px] font-medium">Ingat saya di peramban ini</span>
              </label>

              <span className="text-[11px] text-slate-500">
                Semester Ganjil 2026
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-blue-700 hover:bg-blue-800 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Sistem e-Rapor</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Access / Instant Login Preset Chips */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Akses Cepat Pengujian (1-Klik):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-300 text-slate-800 text-left transition-colors cursor-pointer group"
              >
                <div className="font-bold text-[11px] text-blue-900 group-hover:text-blue-700 flex items-center justify-between">
                  <span>👔 Administrator</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">Drs. H. Ahmad Fauzi</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('wali_7.1')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-300 text-slate-800 text-left transition-colors cursor-pointer group"
              >
                <div className="font-bold text-[11px] text-emerald-900 group-hover:text-emerald-700 flex items-center justify-between">
                  <span>👩‍🏫 Wali Kelas 7.1</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">Siti Rahmawati, S.Pd.</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('wali_7.2')}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-purple-50 hover:border-purple-300 text-slate-800 text-left transition-colors cursor-pointer group"
              >
                <div className="font-bold text-[11px] text-purple-900 group-hover:text-purple-700 flex items-center justify-between">
                  <span>👨‍🏫 Wali Kelas 7.2</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-purple-600" />
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">Budi Santoso, M.Pd.</p>
              </button>
            </div>
          </div>
        </div>

        {/* Form Footer: Helpdesk & Security Badge */}
        <div className="pt-6 border-t border-slate-100 text-[11px] text-slate-500 space-y-2 mt-6">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Keamanan Data e-Rapor Terjamin
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              NPSN: {school.npsn}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Aplikasi resmi e-Rapor SP SMPN 14 Tulang Bawang Barat © 2026. Dikembangkan untuk implementasi Kurikulum Merdeka Fase D.
          </p>
        </div>
      </div>
    </div>
  );
};
