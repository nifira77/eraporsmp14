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
  School
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
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  isLocked
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
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800 no-print">
      {/* Current Active Persona Banner */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {currentUser.name}
            </p>
            <p className="text-[11px] text-blue-400 font-medium">
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
          <div className="mt-3 px-2.5 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center gap-2 text-[11px] text-amber-300">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <span>Penginputan nilai dikunci</span>
          </div>
        )}
      </div>

      {/* Navigation Links organized in authentic groups */}
      <div className="flex-1 py-3 px-3 space-y-3 overflow-y-auto">
        {menuSections.map((section, sIdx) => {
          const visibleSectionItems = section.items.filter(item => 
            item.roles.includes(currentUser.role)
          );

          if (visibleSectionItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1">
              <div className="px-2 pt-1 pb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>{section.title}</span>
                {section.tag && (
                  <span className="text-[9px] font-normal lowercase tracking-normal text-slate-400 bg-slate-800/80 px-1.5 py-0.2 rounded border border-slate-700/60">
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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-semibold shrink-0 ${
                          isActive 
                            ? 'bg-blue-700 text-blue-100' 
                            : item.badge === 'Terkunci' 
                              ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50' 
                              : 'bg-slate-800 text-slate-400'
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
      </div>

      {/* School Signature Info Footer */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1 bg-slate-950/20">
        <p className="font-semibold text-slate-300">SMPN 14 Tulang Bawang Barat</p>
        <p className="text-[10px] text-slate-400">Kurikulum Merdeka · Fase D</p>
        <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
          <span>Versi e-Rapor 2024.1</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Aktif
          </span>
        </div>
      </div>
    </aside>
  );
};
