import React from 'react';
import { SchoolInfo } from '../types/erapor';
import { 
  School, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  UserCheck, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles,
  Award
} from 'lucide-react';

interface FooterProps {
  school: SchoolInfo;
  onExportData?: () => void;
  onRestoreData?: () => void;
  cloudStatus?: 'connected' | 'syncing' | 'offline';
}

export const Footer: React.FC<FooterProps> = ({
  school,
  onExportData,
  onRestoreData,
  cloudStatus = 'connected'
}) => {
  const schoolLogoSrc = school.logoSekolah || "/src/assets/images/school_logo_emblem_1790936910635.jpg";

  return (
    <footer className="no-print mt-auto bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Radiant Gradient Top Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-500 via-sky-400 to-emerald-400" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8">
          
          {/* Kolom 1: Profil & Identitas Lembaga (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              {/* Logo Pemda */}
              {school.logoPemda && (
                <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/10 shadow-xs shrink-0" title="Kabupaten Tulang Bawang Barat">
                  <img 
                    src={school.logoPemda} 
                    alt="Logo Pemda" 
                    className="w-full h-full object-contain" 
                  />
                </div>
              )}

              {/* Logo Sekolah */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-800 to-indigo-950 p-1 flex items-center justify-center border border-blue-500/30 shadow-xs shrink-0" title={school.namaSekolah}>
                <img 
                  src={schoolLogoSrc} 
                  alt="Logo Sekolah" 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-widest text-sky-400 uppercase">
                  DINAS PENDIDIKAN & KEBUDAYAAN
                </p>
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-tight">
                  {school.namaSekolah}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Sistem Informasi Pengolahan Nilai Hasil Belajar (e-Rapor SP) Kurikulum Merdeka Jenjang Sekolah Menengah Pertama (Fase D). Membantu pelaporan capaian kompetensi peserta didik secara akuntabel, transparan, dan terintegrasi.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-sky-300">
                <span>NPSN:</span>
                <strong className="text-white">{school.npsn}</strong>
              </span>
              {school.nss && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">
                  <span>NSS:</span>
                  <strong className="text-white">{school.nss}</strong>
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
                <Sparkles className="w-3 h-3" />
                <span>Kurikulum Merdeka</span>
              </span>
            </div>
          </div>

          {/* Kolom 2: Kontak & Alamat Sekolah (4 Cols) */}
          <div className="lg:col-span-4 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Lokasi & Kontak Satuan Pendidikan</span>
            </h4>

            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {school.alamat}
                </span>
              </li>

              <li className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Telepon: <strong className="text-slate-200">{school.telepon || '(0726) 782104'}</strong></span>
              </li>

              <li className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Email: <strong className="text-slate-200">{school.email || 'smpn14tubaba@kemdikbud.go.id'}</strong></span>
              </li>

              {school.website && (
                <li className="flex items-center gap-2.5">
                  <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>Web: <span className="text-sky-400 hover:underline">{school.website}</span></span>
                </li>
              )}
            </ul>
          </div>

          {/* Kolom 3: Administrasi & Alat Cepat (3 Cols) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>Administrasi & Kalender</span>
            </h4>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Kepala Sekolah:</span>
                <span className="font-bold text-white text-right truncate max-w-[150px]">
                  {school.kepalaSekolah}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">T.A. / Semester:</span>
                <span className="font-medium text-slate-200">
                  {school.tahunAjaran} ({school.semester})
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10">
                <span className="text-slate-400">Tgl Pembagian Rapor:</span>
                <span className="font-bold text-sky-400">
                  {school.tanggalRapor}
                </span>
              </div>
            </div>

            {/* Quick Backup & Restore Buttons in Footer */}
            <div className="flex items-center gap-2 pt-1">
              {onExportData && (
                <button
                  type="button"
                  onClick={onExportData}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-[11px] font-semibold border border-white/10 transition-colors cursor-pointer"
                  title="Unduh Cadangan Seluruh Data e-Rapor (.json)"
                >
                  <Download className="w-3 h-3 text-slate-300" />
                  <span>Backup</span>
                </button>
              )}
              {onRestoreData && (
                <button
                  type="button"
                  onClick={onRestoreData}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                  title="Pulihkan Data dari File Backup (.json)"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Restore</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Motto */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 text-center sm:text-left">
            <span>
              &copy; {new Date().getFullYear()} {school.namaSekolah}.
            </span>
            <span className="hidden sm:inline">·</span>
            <span>Aplikasi Resmi e-Rapor SP Kurikulum Merdeka</span>
          </div>

          <div className="flex items-center gap-2 text-center text-[11px] italic text-slate-400 font-serif">
            <span>&ldquo;Ing ngarsa sung tuladha, ing madya mangun karsa, tut wuri handayani&rdquo;</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
