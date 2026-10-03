import React, { useState } from 'react';
import { UserProfile, SchoolInfo, UserRole } from '../types/erapor';
import { 
  School, 
  UserCheck, 
  ChevronDown, 
  Lock, 
  Unlock, 
  Calendar, 
  Download, 
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
  Cloud
} from 'lucide-react';

interface HeaderProps {
  school: SchoolInfo;
  users: UserProfile[];
  currentUser: UserProfile;
  isLocked: boolean;
  cloudStatus?: 'connected' | 'syncing' | 'offline';
  lastSyncedTime?: string | null;
  onSelectUser: (user: UserProfile) => void;
  onToggleLock: () => void;
  onResetData: () => void;
  onExportData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  school,
  users,
  currentUser,
  isLocked,
  cloudStatus = 'connected',
  lastSyncedTime = null,
  onSelectUser,
  onToggleLock,
  onResetData,
  onExportData
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'guru_mapel':
        return 'Guru Mata Pelajaran';
      case 'wali_kelas':
        return 'Wali Kelas VII-A';
      case 'admin':
        return 'Admin / Kepala Sekolah';
      case 'kepala_sekolah':
        return 'Kepala Sekolah';
      default:
        return 'Pengguna';
    }
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'guru_mapel':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'wali_kelas':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'admin':
      case 'kepala_sekolah':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 border-t-3 border-blue-700 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand & School Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Logo Pemda */}
              {school.logoPemda && (
                <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs p-0.5" title="Pemerintah Kabupaten Tulang Bawang Barat">
                  <img 
                    src={school.logoPemda} 
                    alt="Logo Pemda" 
                    className="w-full h-full object-contain" 
                  />
                </div>
              )}

              {/* Logo Sekolah */}
              <div className="w-10 h-10 rounded-lg bg-blue-900 border border-blue-950 flex items-center justify-center overflow-hidden shrink-0 shadow-xs p-0.5" title={school.namaSekolah}>
                <img 
                  src={school.logoSekolah || "/src/assets/images/school_logo_emblem_1790936910635.jpg"} 
                  alt="Logo Sekolah" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-blue-900 tracking-tight leading-tight flex items-center gap-1.5">
                  <span>e-Rapor SP</span>
                  <span className="text-slate-800 font-bold">Kurikulum Merdeka</span>
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">
                  Kemendikbudristek
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-xs sm:max-w-md">
                {school.namaSekolah} · NPSN: {school.npsn}
              </p>
            </div>
          </div>

          {/* Academic Info & Quick Actions */}
          <div className="flex items-center gap-2.5">
            {/* Real-time Cloud Sync Badge */}
            <div 
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all ${
                cloudStatus === 'connected' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : cloudStatus === 'syncing'
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
              title="Koneksi Cloud Real-time: Data otomatis tersinkronisasi antar seluruh perangkat secara langsung."
            >
              <Cloud className={`w-3.5 h-3.5 shrink-0 ${cloudStatus === 'syncing' ? 'animate-pulse text-blue-600' : cloudStatus === 'connected' ? 'text-emerald-600' : 'text-amber-600'}`} />
              <span className="hidden sm:inline">
                {cloudStatus === 'connected' ? 'Cloud Aktif' : cloudStatus === 'syncing' ? 'Menyinkronkan...' : 'Mode Offline'}
              </span>
              {lastSyncedTime && cloudStatus === 'connected' && (
                <span className="text-[10px] text-emerald-600 hidden md:inline font-mono">
                  · {lastSyncedTime}
                </span>
              )}
            </div>

            {/* Semester & Year Info */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Semester {school.semester}</span>
              <span className="text-slate-300">|</span>
              <span>T.A. {school.tahunAjaran}</span>
            </div>

            {/* Lock Status Button for Admin */}
            {currentUser.role === 'admin' && (
              <button
                type="button"
                onClick={onToggleLock}
                title={isLocked ? 'Nilai terkunci untuk guru' : 'Kunci nilai agar tidak bisa diedit'}
                className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  isLocked 
                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100' 
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5 text-slate-500" />}
                <span>{isLocked ? 'Status: Terkunci' : 'Status: Terbuka'}</span>
              </button>
            )}

            {/* Export & Reset Tools */}
            <button
              type="button"
              onClick={onExportData}
              title="Unduh Cadangan Data Rapor (JSON)"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Backup</span>
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 leading-none">
                    {currentUser.name.split(',')[0]}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-slate-500 font-medium">
                      {getRoleLabel(currentUser.role)}
                    </span>
                    {currentUser.pembinaEkskul && (
                      <span className="text-[9px] font-semibold text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                        {currentUser.pembinaEkskul}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserDropdown(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3.5 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">Ganti Akses Multi-User</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Pilih profil pengguna untuk mencoba hak akses guru atau wali kelas:
                      </p>
                    </div>

                    <div className="py-1">
                      {users.map((user) => {
                        const isCurrent = user.id === currentUser.id;
                        return (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => {
                              onSelectUser(user);
                              setShowUserDropdown(false);
                            }}
                            className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors ${
                              isCurrent ? 'bg-blue-50 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div>
                              <p className="font-semibold text-slate-900">{user.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(user.role)}`}>
                                  {getRoleLabel(user.role)}
                                </span>
                                {user.pembinaEkskul && (
                                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                                    Pembina {user.pembinaEkskul}
                                  </span>
                                )}
                                {user.nip && (
                                  <span className="text-[10px] text-slate-500">
                                    NIP. {user.nip.slice(0, 10)}...
                                  </span>
                                )}
                              </div>
                            </div>
                            {isCurrent && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 mt-1 pt-1 px-3 py-1.5 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserDropdown(false);
                          setShowConfirmReset(true);
                        }}
                        className="w-full flex items-center gap-1.5 text-[11px] text-rose-600 hover:text-rose-800 font-medium py-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Data Awal SMPN 14</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Reset Data e-Rapor?</h3>
            <p className="text-xs text-slate-600 mt-2">
              Tindakan ini akan mengembalikan data nilai, siswa, catatan, dan TP ke contoh realistis awal untuk SMPN 14 Tulang Bawang Barat.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetData();
                  setShowConfirmReset(false);
                }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
