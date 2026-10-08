import React from 'react';
import { UserProfile, UserRole } from '../types/erapor';
import {
  LayoutDashboard,
  Target,
  Edit3,
  ClipboardList,
  UserCheck2,
  MessageSquare,
  Printer,
  BarChart3,
  Settings,
  Sparkles,
  ShieldAlert,
  GraduationCap,
  Award,
  Users,
  School,
  LogOut
} from 'lucide-react';

export type ActiveTab = 
  | 'dashboard'
  | 'tp'
  | 'input_nilai'
  | 'rekap_status'
  | 'kehadiran_ekskul'
  | 'catatan_wali'
  | 'cetak_rapor'
  | 'analisis'
  | 'data_sekolah'
  | 'data_pendidik'
  | 'data_siswa'
  | 'penilaian_ekskul';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  currentUser: UserProfile;
  isLocked: boolean;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  isLocked,
  onLogout
}) => {
  const isGuruMapel = currentUser.role === 'guru_mapel';
  const isWaliKelas = currentUser.role === 'wali_kelas';
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'kepala_sekolah';

  const menuSections = [
    {
      title: 'NAVIGASI UTAMA',
      items: [
        {
          id: 'dashboard' as ActiveTab,
          label: 'Dashboard e-Rapor SP',
          icon: LayoutDashboard,
          roles: ['guru_mapel', 'wali_kelas', 'admin', 'kepala_sekolah'],
          badge: null
        }
      ]
    },
    {
      title: 'REFERENSI DATA POKOK',
      tag: 'Dapodik',
      items: [
        {
          id: 'data_sekolah' as ActiveTab,
          label: 'Profil Satuan Pendidikan',
          icon: School,
          roles: ['admin', 'kepala_sekolah', 'wali_kelas'],
          badge: null
        },
        {
          id: 'data_pendidik' as ActiveTab,
          label: 'Data Pendidik & PTK',
          icon: GraduationCap,
          roles: ['admin', 'kepala_sekolah'],
          badge: 'PTK'
        },
        {
          id: 'data_siswa' as ActiveTab,
          label: 'Data Peserta Didik',
          icon: Users,
          roles: ['admin', 'kepala_sekolah', 'wali_kelas'],
          badge: 'Siswa'
        }
      ]
    },
    {
      title: 'PENILAIAN KURIKULUM MERDEKA',
      tag: isWaliKelas ? 'Mapel' : null,
      items: [
        {
          id: 'tp' as ActiveTab,
          label: 'Tujuan Pembelajaran (TP)',
          icon: Target,
          roles: ['guru_mapel', 'wali_kelas', 'admin'],
          badge: 'TP'
        },
        {
          id: 'input_nilai' as ActiveTab,
          label: 'Input Nilai Sumatif',
          icon: Edit3,
          roles: ['guru_mapel', 'wali_kelas', 'admin'],
          badge: isLocked ? 'Terkunci' : 'STS/SAS',
          locked: isLocked && (isGuruMapel || isWaliKelas)
        },
        {
          id: 'penilaian_ekskul' as ActiveTab,
          label: currentUser.pembinaEkskul 
            ? `Nilai Ekskul (${currentUser.pembinaEkskul})` 
            : 'Nilai Ekstrakurikuler',
          icon: Award,
          roles: ['guru_mapel', 'wali_kelas', 'admin', 'kepala_sekolah'],
          badge: 'Ekskul'
        },
        {
          id: 'rekap_status' as ActiveTab,
          label: 'Status Penilaian & Kirim Nilai',
          icon: ClipboardList,
          roles: ['guru_mapel', 'wali_kelas', 'admin', 'kepala_sekolah'],
          badge: null
        }
      ]
    },
    {
      title: 'WALI KELAS',
      tag: 'Wali',
      items: [
        {
          id: 'kehadiran_ekskul' as ActiveTab,
          label: 'Kehadiran & Ekskul Siswa',
          icon: UserCheck2,
          roles: ['wali_kelas', 'admin'],
          badge: isWaliKelas ? 'Wali' : null
        },
        {
          id: 'catatan_wali' as ActiveTab,
          label: 'Catatan Perkembangan & Prestasi',
          icon: MessageSquare,
          roles: ['wali_kelas', 'admin'],
          badge: isWaliKelas ? 'Wali' : null
        },
        {
          id: 'cetak_rapor' as ActiveTab,
          label: 'Cetak Rapor & Leger Nilai',
          icon: Printer,
          roles: ['wali_kelas', 'admin', 'kepala_sekolah'],
          badge: 'Cetak'
        }
      ]
    },
    {
      title: 'ANALISIS & LAPORAN',
      items: [
        {
          id: 'analisis' as ActiveTab,
          label: 'Analisis Belajar & Mutu',
          icon: BarChart3,
          roles: ['guru_mapel', 'wali_kelas', 'admin', 'kepala_sekolah'],
          badge: 'Grafik'
        }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 via-[#0d1629] to-[#090f1d] text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4.25rem)] border-r border-slate-800/90 shadow-xl no-print select-none">
      {/* Current Active Persona Banner */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/50 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 border border-blue-400/30 flex items-center justify-center text-white font-bold shrink-0 shadow-sm shadow-blue-500/25">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate leading-snug">
              {currentUser.name}
            </p>
            <p className="text-[11px] text-sky-400 font-medium truncate mt-0.5">
              {currentUser.role === 'guru_mapel' && 'Guru Mata Pelajaran'}
              {currentUser.role === 'wali_kelas' && 'Wali Kelas & Guru Mapel'}
              {currentUser.role === 'admin' && 'Administrator e-Rapor'}
              {currentUser.role === 'kepala_sekolah' && 'Kepala Sekolah'}
            </p>
          </div>
        </div>

        {/* Pembina Ekskul Badge if assigned */}
        {currentUser.pembinaEkskul && (
          <div className="mt-2.5 px-2.5 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 flex items-center gap-1.5 text-[10px] text-amber-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="truncate">Pembina Ekstrakurikuler: {currentUser.pembinaEkskul}</span>
          </div>
        )}

        {isLocked && (
          <div className="mt-3 px-2.5 py-1.5 rounded-md bg-amber-500/15 border border-amber-500/30 flex items-center gap-2 text-[11px] text-amber-200">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>Penginputan nilai dikunci</span>
          </div>
        )}
      </div>

      {/* Navigation Links organized in authentic groups */}
      <div className="flex-1 py-3 px-3 space-y-3.5 overflow-y-auto">
        {menuSections.map((section, sIdx) => {
          const visibleSectionItems = section.items.filter(item => 
            item.roles.includes(currentUser.role)
          );

          if (visibleSectionItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1">
              <div className="px-2 pt-1 pb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400/90">
                <span className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-sky-500/80" />
                  {section.title}
                </span>
                {section.tag && (
                  <span className="text-[9px] font-normal lowercase tracking-normal text-sky-300 bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-800/60">
                    {section.tag}
                  </span>
                )}
              </div>

              {visibleSectionItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onTabChange(item.id)}
                    className={`w-full group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white font-semibold shadow-md shadow-indigo-950/40 ring-1 ring-white/20'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-300'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md font-semibold shrink-0 transition-colors ${
                          isActive 
                            ? 'bg-white/20 text-white backdrop-blur-xs' 
                            : item.badge === 'Terkunci' 
                              ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50' 
                              : 'bg-slate-800/80 text-slate-400 group-hover:text-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}

        {/* Logout Action in Sidebar */}
        {onLogout && (
          <div className="pt-2 px-1">
            <button
              type="button"
              onClick={onLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-950/40 border border-rose-900/40 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Keluar / Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* School Signature Info Footer */}
      <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1 bg-slate-950/50">
        <p className="font-semibold text-slate-200">SMPN 14 Tulang Bawang Barat</p>
        <p className="text-[10px] text-slate-400">Kurikulum Merdeka · Fase D</p>
        <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
          <span>Versi e-Rapor 2024.1</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Aktif
          </span>
        </div>
      </div>
    </aside>
  );
};
