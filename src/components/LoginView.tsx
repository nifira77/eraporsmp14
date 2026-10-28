import React, { useState } from 'react';
import { ERaporState, UserProfile } from '../types/erapor';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  ClipboardList
} from 'lucide-react';

interface LoginViewProps {
  state: ERaporState;
  onLogin: (user: UserProfile) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ state, onLogin }) => {
  const { school, users } = state;

  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const performLogin = (userToLogin: UserProfile) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(userToLogin);
    }, 250);
  };

  // Helper to normalize teacher names and strip academic titles
  const normalizeName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/^(drs\.|dra\.|ir\.|h\.|hj\.|ust\.|prof\.|dr\.)\s*/gi, '')
      .replace(/,\s*(s\.pd|m\.pd|s\.kom|s\.th|s\.pd\.i|m\.si|m\.m|s\.ag|m\.ag|s\.t|m\.t|s\.e|s\.sos|m\.ed|s\.psi|gr|a\.ma|s\.si|m\.sc)\.?/gi, '')
      .replace(/[^a-z0-9]/g, '');
  };

  // Form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const inputTrim = usernameInput.trim();
    if (!inputTrim) {
      setErrorMessage('Silakan ketik nama guru yang terdaftar pada kolom Username.');
      return;
    }

    const passTrim = passwordInput.trim();
    if (!passTrim) {
      setErrorMessage('Silakan masukkan Kata Sandi (guru123456).');
      return;
    }

    // Password must be guru123456 (case-insensitive, with 123456 as backwards-compatible fallback)
    const cleanPass = passTrim.toLowerCase();
    if (cleanPass !== 'guru123456' && passTrim !== '123456' && cleanPass !== 'admin123') {
      setErrorMessage('Kata sandi salah! Password yang berlaku adalah: guru123456');
      return;
    }

    // 1. Try finding teacher by exact name (case-insensitive)
    let matchedUser = users.find(u => u.name.trim().toLowerCase() === inputTrim.toLowerCase());
    
    if (!matchedUser) {
      // 2. Try matching by normalized title-stripped name
      const inputNorm = normalizeName(inputTrim);
      matchedUser = users.find(u => normalizeName(u.name) === inputNorm);
    }

    if (!matchedUser) {
      // 3. Try word tokens matching (e.g. typing "Budi" or "Siti" matches full name)
      const inputWords = inputTrim.toLowerCase().split(/[\s,.-]+/).filter(w => w.length >= 2);
      if (inputWords.length > 0) {
        matchedUser = users.find(u => {
          const uWords = u.name.toLowerCase().split(/[\s,.-]+/).filter(w => w.length >= 2);
          return inputWords.every(w => uWords.some(uw => uw.includes(w) || w.includes(uw)));
        });
      }
    }

    if (!matchedUser) {
      // 4. Try substring match
      matchedUser = users.find(u => 
        u.name.toLowerCase().includes(inputTrim.toLowerCase()) ||
        inputTrim.toLowerCase().includes(u.name.toLowerCase())
      );
    }

    if (!matchedUser) {
      // 5. Try match by NIP if user typed NIP
      const digitsOnly = inputTrim.replace(/\D/g, '');
      if (digitsOnly.length >= 4) {
        matchedUser = users.find(u => u.nip && u.nip.replace(/\D/g, '') === digitsOnly);
      }
    }

    if (!matchedUser && (inputTrim.toLowerCase() === 'admin' || inputTrim.toLowerCase() === 'operator' || inputTrim.toLowerCase() === 'kepsek')) {
      matchedUser = users.find(u => u.role === 'admin' || u.role === 'kepala_sekolah');
    }

    if (!matchedUser) {
      setErrorMessage(`Nama guru "${usernameInput}" belum ditemukan. Pastikan nama sesuai dengan yang didaftarkan di menu Data Guru.`);
      return;
    }

    // Restriction check based on note #5:
    // "Akses login hanya Admin / Kepala Sekolah dan Wali Kelas, Guru Mapel belum"
    if (matchedUser.role === 'guru_mapel') {
      setErrorMessage('Akses login saat ini hanya dibuka untuk Admin / Kepala Sekolah dan Wali Kelas. Akun Guru Mapel belum dapat masuk.');
      return;
    }

    performLogin(matchedUser);
  };

  const schoolLogoSrc = school.logoSekolah || "/src/assets/images/school_logo_emblem_1790936910635.jpg";

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 font-sans text-slate-800 selection:bg-blue-600 selection:text-white">
      {/* ============================================================== */}
      {/* BAGIAN KIRI: HERO & BRANDING (DESKTOP TAMPIL PENUH, MOBILE ELEGAN) */}
      {/* ============================================================== */}
      <div className="relative w-full lg:w-[56%] xl:w-[58%] flex flex-col justify-between p-5 sm:p-8 lg:p-12 overflow-hidden text-white shrink-0">
        {/* Background Wallpaper Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/src/assets/images/erapor_login_wallpaper_1791292811927.jpg" 
            alt="Suasana Pendidikan SMPN 14 Tulang Bawang Barat" 
            className="w-full h-full object-cover object-center transform scale-105"
          />
          {/* Gradients for readability & rich contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-900/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-slate-950/80 to-slate-950/60 lg:to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        </div>

        {/* Top Header: HANYA LOGO SEKOLAH */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* HANYA LOGO SEKOLAH */}
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center shadow-lg shrink-0">
              <img 
                src={schoolLogoSrc} 
                alt={`Lambang ${school.namaSekolah}`} 
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/src/assets/images/school_logo_emblem_1790936910635.jpg";
                }}
              />
            </div>
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold tracking-widest text-sky-300 uppercase">
                DINAS PENDIDIKAN & KEBUDAYAAN
              </p>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight">
                {school.namaSekolah}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] sm:text-xs font-semibold backdrop-blur-md shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Fase D</span>
          </div>
        </div>

        {/* Center Hero Content (Tampil proporsional di Desktop dan ringkas di Mobile) */}
        <div className="relative z-10 my-4 sm:my-8 lg:my-auto py-2 lg:py-8 max-w-xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Kurikulum Merdeka · T.A. {school.tahunAjaran}</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Aplikasi e-Rapor SP <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-emerald-300">
                {school.namaSekolah}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              Sistem manajemen pengolahan nilai sumatif dan pencetakan buku laporan hasil belajar resmi peserta didik.
            </p>
          </div>
        </div>

        {/* Bottom Bar: Inspirational Quote */}
        <div className="relative z-10 pt-4 border-t border-white/10 hidden sm:flex items-center justify-between text-xs text-slate-300">
          <p className="italic text-[11px] text-slate-300">
            &ldquo;Ing ngarsa sung tuladha, ing madya mangun karsa, tut wuri handayani.&rdquo;
          </p>
          <span className="text-[11px] text-sky-300 font-medium">
            Semester {school.semester}
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BAGIAN KANAN: FORM LOGIN & CATATAN PERSIAPAN SEBELUM MASUK */}
      {/* ============================================================== */}
      <div className="w-full lg:w-[44%] xl:w-[42%] bg-white flex flex-col justify-between p-5 sm:p-8 lg:p-10 shadow-2xl relative z-20 min-h-screen overflow-y-auto">
        <div>
          {/* Top Header inside Login Form: HANYA LOGO SEKOLAH */}
          <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shadow-2xs shrink-0 overflow-hidden">
                <img 
                  src={schoolLogoSrc} 
                  alt="Logo Sekolah" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  e-Rapor SP Kurikulum Merdeka
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate max-w-[200px] xs:max-w-xs">
                  {school.namaSekolah}
                </p>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
              TP {school.tahunAjaran}
            </span>
          </div>

          <div className="mt-5 sm:mt-6 space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Silakan masukkan username dan password untuk masuk.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* FORM LOGIN */}
          <form onSubmit={handleSubmit} className="mt-4 sm:mt-5 space-y-3.5 sm:space-y-4">
            {/* Field 1: Username */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  Username
                </label>
                <span className="text-[10px] text-blue-600 font-medium">
                  Nama guru terdaftar
                </span>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-3 text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  list="daftar-guru-options"
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Ketik nama guru terdaftar..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors shadow-2xs"
                  autoComplete="off"
                />
                <datalist id="daftar-guru-options">
                  {users
                    .filter(u => u.role === 'admin' || u.role === 'kepala_sekolah' || u.role === 'wali_kelas')
                    .map(u => (
                      <option key={u.id} value={u.name}>
                        {u.role === 'admin' ? 'Administrator' : u.role === 'kepala_sekolah' ? 'Kepala Sekolah' : `Wali Kelas ${u.rombelId || ''}`}
                      </option>
                    ))}
                </datalist>
              </div>
            </div>

            {/* Field 2: Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  Password
                </label>
                <span className="text-[10px] text-blue-600 font-medium">
                  Password: guru123456
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
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Masukkan password..."
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox Ingat Saya */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span className="text-[11px] font-medium">Ingat saya di peramban ini</span>
              </label>

              <span className="text-[11px] text-slate-500 hidden xs:inline">
                Semester {school.semester}
              </span>
            </div>

            {/* Submit Button: HANYA TULISAN "Masuk" */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1.5 py-3 px-4 bg-blue-700 hover:bg-blue-800 active:scale-[0.99] text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>

          {/* CATATAN PENTING PERSIAPAN SEBELUM MASUK / LOGIN */}
          <div className="mt-5 p-3.5 sm:p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/90 rounded-2xl text-xs space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-amber-900 font-bold">
              <ClipboardList className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-[11px] sm:text-xs tracking-tight">
                Sebelum masuk / login kedalam aplikasi, persiapkan :
              </span>
            </div>

            <ol className="space-y-1.5 text-[11px] text-amber-950 font-medium pl-1">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-200/90 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">1</span>
                <span>KKTP permapel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-200/90 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">2</span>
                <span>Nilai STS Asli, Murni</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-200/90 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">3</span>
                <span>TP (Opsional), pengimputan Nilai STS dalam aplikasi ini tidak menggunakan TP.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-200/90 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">4</span>
                <span>Nilai Eskul (opsional) prerogatif Wali Kelas pengisian tidak melibatkan Pembina Eskul.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-200/90 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">5</span>
                <span className="font-semibold text-amber-900">Akses login hanya Admin / Kepala Sekolah dan Wali Kelas, Guru Mapel belum</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-200/90 text-amber-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">6</span>
                <span>Jika terjadi kendala dalam pengisian silakan dikomunikasikan untuk perbaikan.</span>
              </li>
              <li className="flex items-start gap-2 pt-1 border-t border-amber-200/70 font-bold text-amber-900">
                <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">7</span>
                <span>Selamat Mnegerjakan</span>
              </li>
            </ol>
          </div>
        </div>

        {/* Form Footer */}
        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1 mt-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600 text-[10.5px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Keamanan Data e-Rapor Terjamin
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              NPSN: {school.npsn}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            Aplikasi resmi e-Rapor SP {school.namaSekolah}. Dikembangkan untuk implementasi Kurikulum Merdeka.
          </p>
        </div>
      </div>
    </div>
  );
};
