import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  ERaporState, 
  Student, 
  Rombel 
} from '../types/erapor';
import { ActiveTab } from './Sidebar';
import { 
  BookOpen, 
  Users, 
  Search, 
  Download, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  School, 
  Calendar, 
  MapPin, 
  User, 
  CheckCircle2, 
  Camera, 
  Edit3, 
  Upload, 
  Trash2, 
  X,
  Phone,
  Layers,
  Sparkles
} from 'lucide-react';

interface BukuIndukViewProps {
  state: ERaporState;
  onNavigate?: (tab: ActiveTab) => void;
  onUpdateStudents?: (students: Student[]) => void;
}

export const BukuIndukView: React.FC<BukuIndukViewProps> = ({
  state,
  onNavigate,
  onUpdateStudents
}) => {
  const { students, rombels, school, currentUser } = state;

  // View mode: 'lembar' (Format Biodata Buku Induk seperti Cetak Rapor) or 'daftar' (Tabel Ringkasan Buku Induk)
  const [viewMode, setViewMode] = useState<'lembar' | 'daftar'>('lembar');

  // Filter rombel / kelas
  const [selectedRombelFilter, setSelectedRombelFilter] = useState<string>(() => {
    if (currentUser?.rombelId && rombels.some(r => r.id === currentUser.rombelId)) {
      return currentUser.rombelId;
    }
    return rombels[0]?.id || '7.1';
  });

  const [selectedAgamaFilter, setSelectedAgamaFilter] = useState<string>('all');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Target cetak di mode lembar: 'single' (1 siswa terpilih) atau 'all' (semua siswa di kelas)
  const [printTarget, setPrintTarget] = useState<'single' | 'all'>('single');

  // Watermark density / thickness for printing: 'tebal' (default), 'sangat_tebal', 'sedang'
  const [watermarkDensity, setWatermarkDensity] = useState<'tebal' | 'sangat_tebal' | 'sedang'>('tebal');
  // Watermark size: 'proporsional' (default, fit diagonal without clipping), 'kecil', 'sedang'
  const [watermarkSize, setWatermarkSize] = useState<'proporsional' | 'kecil' | 'sedang'>('proporsional');

  // Selected student id
  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    const inClass = students.filter(s => s.rombelId === (currentUser?.rombelId || rombels[0]?.id || '7.1'));
    return inClass[0]?.id || students[0]?.id || '';
  });

  // Notifications
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit & Upload Photo Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formFotoPreview, setFormFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields for Edit
  const [formNama, setFormNama] = useState('');
  const [formNis, setFormNis] = useState('');
  const [formNisn, setFormNisn] = useState('');
  const [formTempatLahir, setFormTempatLahir] = useState('');
  const [formTanggalLahir, setFormTanggalLahir] = useState('');
  const [formJk, setFormJk] = useState<'L' | 'P'>('L');
  const [formAgama, setFormAgama] = useState('Islam');
  const [formRombelId, setFormRombelId] = useState('');
  const [formStatusKeluarga, setFormStatusKeluarga] = useState('Anak Kandung');
  const [formAnakKe, setFormAnakKe] = useState('1');
  const [formTahunMasuk, setFormTahunMasuk] = useState(() => school.tahunAjaran ? school.tahunAjaran.split('/')[0] : '2026');
  const [formSekolahAsal, setFormSekolahAsal] = useState('SD / MI Sederajat');
  const [formTerdaftarSebagai, setFormTerdaftarSebagai] = useState('Peserta Didik Baru');
  const [formAlamat, setFormAlamat] = useState('');
  const [formTelepon, setFormTelepon] = useState('-');
  const [formNamaAyah, setFormNamaAyah] = useState('');
  const [formNamaIbu, setFormNamaIbu] = useState('');
  const [formPekerjaanOrtu, setFormPekerjaanOrtu] = useState('Wiraswasta');
  const [formAlamatOrtu, setFormAlamatOrtu] = useState('');
  const [formNamaWali, setFormNamaWali] = useState('-');
  const [formPekerjaanWali, setFormPekerjaanWali] = useState('-');
  const [formAlamatWali, setFormAlamatWali] = useState('-');

  // Filtered students for selected class & criteria
  const classStudents = useMemo(() => {
    return students.filter(s => {
      if (selectedRombelFilter !== 'all' && s.rombelId !== selectedRombelFilter) {
        return false;
      }
      if (selectedAgamaFilter !== 'all') {
        const ag = (s.agama || '').toLowerCase();
        if (!ag.includes(selectedAgamaFilter.toLowerCase())) return false;
      }
      if (selectedGenderFilter !== 'all' && s.jenisKelamin !== selectedGenderFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.nama.toLowerCase().includes(q);
        const matchNis = s.nis.toLowerCase().includes(q);
        const matchNisn = s.nisn.toLowerCase().includes(q);
        const matchAlamat = (s.alamat || '').toLowerCase().includes(q);
        return matchName || matchNis || matchNisn || matchAlamat;
      }
      return true;
    });
  }, [students, selectedRombelFilter, selectedAgamaFilter, selectedGenderFilter, searchQuery]);

  // Current active student for single view
  const currentStudent = useMemo(() => {
    return classStudents.find(s => s.id === selectedStudentId) || classStudents[0] || students[0] || null;
  }, [classStudents, selectedStudentId, students]);

  // Target students to render in Lembar mode
  const targetStudents = useMemo(() => {
    if (printTarget === 'all') {
      return classStudents;
    }
    return currentStudent ? [currentStudent] : [];
  }, [printTarget, classStudents, currentStudent]);

  const selectedRombel = rombels.find(r => r.id === selectedRombelFilter) || rombels[0];

  // Open Edit Modal for a specific student
  const handleOpenEdit = (student: Student) => {
    const defaultSchoolYear = school.tahunAjaran ? school.tahunAjaran.split('/')[0] : '2026';
    setEditingStudent(student);
    setFormNama(student.nama || '');
    setFormNis(student.nis || '');
    setFormNisn(student.nisn || '');
    setFormTempatLahir(student.tempatLahir || '');
    setFormTanggalLahir(student.tanggalLahir || '');
    setFormJk(student.jenisKelamin || 'L');
    setFormAgama(student.agama || 'Islam');
    setFormRombelId(student.rombelId || rombels[0]?.id || '7.1');
    setFormStatusKeluarga(student.statusKeluarga || 'Anak Kandung');
    setFormAnakKe(student.anakKe ? String(student.anakKe) : '1');
    setFormTahunMasuk(student.tahunMasuk || defaultSchoolYear);
    setFormSekolahAsal(student.sekolahAsal || 'Sekolah Dasar (SD / MI)');
    setFormTerdaftarSebagai(student.terdaftarSebagai || 'Peserta Didik Baru');
    setFormAlamat(student.alamat || '');
    setFormTelepon(student.telepon || '-');
    setFormNamaAyah(student.namaAyah || '');
    setFormNamaIbu(student.namaIbu || '');
    setFormPekerjaanOrtu(student.pekerjaanOrangTua || 'Wiraswasta / Petani');
    setFormAlamatOrtu(student.alamat || '');
    setFormNamaWali(student.namaWali || '-');
    setFormPekerjaanWali(student.pekerjaanWali || '-');
    setFormAlamatWali(student.alamatWali || '-');
    setFormFotoPreview(student.foto || null);
    setIsEditModalOpen(true);
  };

  // Handle Photo File Selection & Resize
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotificationMsg({ type: 'error', text: 'Format file tidak didukung. Harap pilih file gambar (JPG, PNG, atau WebP).' });
      setTimeout(() => setNotificationMsg(null), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Optimize and resize image for 3x4 portrait aspect ratio (max 450x600 px)
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 450;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Export as compressed WebP/JPEG base64
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setFormFotoPreview(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Remove Photo
  const handleRemovePhoto = () => {
    setFormFotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Save Student Biodata & Photo
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !onUpdateStudents) return;

    const updatedStudent: Student = {
      ...editingStudent,
      nama: formNama.trim(),
      nis: formNis.trim(),
      nisn: formNisn.trim(),
      tempatLahir: formTempatLahir.trim(),
      tanggalLahir: formTanggalLahir.trim(),
      jenisKelamin: formJk,
      agama: formAgama.trim(),
      rombelId: formRombelId,
      statusKeluarga: formStatusKeluarga.trim(),
      anakKe: formAnakKe.trim(),
      tahunMasuk: formTahunMasuk.trim(),
      sekolahAsal: formSekolahAsal.trim(),
      terdaftarSebagai: formTerdaftarSebagai.trim(),
      alamat: formAlamat.trim(),
      telepon: formTelepon.trim(),
      namaAyah: formNamaAyah.trim(),
      namaIbu: formNamaIbu.trim(),
      pekerjaanOrangTua: formPekerjaanOrtu.trim(),
      namaWali: formNamaWali.trim(),
      pekerjaanWali: formPekerjaanWali.trim(),
      alamatWali: formAlamatWali.trim(),
      foto: formFotoPreview || undefined
    };

    const updatedList = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    onUpdateStudents(updatedList);

    setIsEditModalOpen(false);
    setNotificationMsg({ 
      type: 'success', 
      text: `✓ Identitas & Pasfoto Buku Induk untuk "${formNama}" berhasil disimpan.` 
    });
    setTimeout(() => setNotificationMsg(null), 4500);
  };

  // Navigation handlers
  const handlePrevStudent = () => {
    if (!currentStudent) return;
    const currentIndex = classStudents.findIndex(s => s.id === currentStudent.id);
    if (currentIndex > 0) {
      setSelectedStudentId(classStudents[currentIndex - 1].id);
    } else if (classStudents.length > 0) {
      setSelectedStudentId(classStudents[classStudents.length - 1].id);
    }
  };

  const handleNextStudent = () => {
    if (!currentStudent) return;
    const currentIndex = classStudents.findIndex(s => s.id === currentStudent.id);
    if (currentIndex >= 0 && currentIndex < classStudents.length - 1) {
      setSelectedStudentId(classStudents[currentIndex + 1].id);
    } else if (classStudents.length > 0) {
      setSelectedStudentId(classStudents[0].id);
    }
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = classStudents.map((s, idx) => {
      const rombel = rombels.find(r => r.id === s.rombelId);
      return {
        'No.': idx + 1,
        'Nomor Induk Siswa (NIS)': s.nis,
        'NISN': s.nisn,
        'Nama Lengkap Peserta Didik': s.nama,
        'Jenis Kelamin': s.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan',
        'Rombongan Belajar / Kelas': rombel?.nama || s.rombelId,
        'Tempat Lahir': s.tempatLahir,
        'Tanggal Lahir': s.tanggalLahir,
        'Agama': s.agama || 'Islam',
        'Status dalam Keluarga': s.statusKeluarga || 'Anak Kandung',
        'Anak Ke': s.anakKe || '1',
        'Alamat Lengkap': s.alamat,
        'Nomor Telepon / HP': s.telepon || '-',
        'Sekolah Asal': s.sekolahAsal || 'SD / MI',
        'Nama Ayah Kandung': s.namaAyah,
        'Nama Ibu Kandung': s.namaIbu,
        'Pekerjaan Orang Tua': s.pekerjaanOrangTua,
        'Nama Wali': s.namaWali || '-',
        'Pekerjaan Wali': s.pekerjaanWali || '-',
        'Status Foto': s.foto ? 'Sudah Ada Foto' : 'Belum Ada Foto'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Buku Induk Siswa');
    XLSX.writeFile(
      workbook, 
      `Buku_Induk_Biodata_Siswa_SMPN14Tubaba_${selectedRombelFilter !== 'all' ? selectedRombelFilter : 'SemuaKelas'}.xlsx`
    );
  };

  return (
    <div className="space-y-5">
      {/* ========================================================================= */}
      {/* HEADER & VIEW NAVIGATION (HIDDEN ON PRINT) */}
      {/* ========================================================================= */}
      <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              Registrasi Induk Peserta Didik
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Buku Induk Siswa — Biodata Lengkap</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Format resmi identitas Buku Induk peserta didik {school.namaSekolah} sesuai standar Dapodik & Cetak Rapor
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode switch */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('lembar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'lembar'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Lembar Biodata Buku Induk</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('daftar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'daftar'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Daftar Register</span>
            </button>
          </div>

          {/* Edit current student photo & biodata button */}
          {currentStudent && (
            <button
              type="button"
              onClick={() => handleOpenEdit(currentStudent)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              title="Edit identitas dan unggah pasfoto untuk siswa ini"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Edit Biodata & Foto</span>
            </button>
          )}

          {/* Print button */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Cetak Dokumen Biodata Buku Induk"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Dokumen</span>
          </button>

          {/* Export to Excel */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Ekspor Biodata Buku Induk ke Format Microsoft Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Excel</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notificationMsg && (
        <div className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs animate-in fade-in duration-200 no-print ${
          notificationMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
            : 'bg-rose-50 border-rose-300 text-rose-800'
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{notificationMsg.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FILTER & TOOLBAR (NO-PRINT) */}
      {/* ========================================================================= */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class / Rombel selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <label className="font-bold text-slate-700">Rombel / Kelas:</label>
            <select
              value={selectedRombelFilter}
              onChange={(e) => setSelectedRombelFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 cursor-pointer"
            >
              <option value="all">Semua Rombel ({students.length} Siswa)</option>
              {rombels.map(r => (
                <option key={r.id} value={r.id}>
                  {r.nama} ({students.filter(s => s.rombelId === r.id).length} Siswa)
                </option>
              ))}
            </select>
          </div>

          {/* Print Target (Single or All) */}
          {viewMode === 'lembar' && (
            <div className="flex items-center gap-1.5 text-xs">
              <label className="font-bold text-slate-700">Cetak:</label>
              <select
                value={printTarget}
                onChange={(e) => setPrintTarget(e.target.value as any)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
              >
                <option value="single">Siswa Terpilih Saja (1 Siswa)</option>
                <option value="all">Semua Siswa di Kelas Ini ({classStudents.length} Lembar)</option>
              </select>
            </div>
          )}

          {/* Quick Student Selector in Lembar Mode */}
          {viewMode === 'lembar' && printTarget === 'single' && (
            <div className="flex items-center gap-1.5 text-xs">
              <label className="font-bold text-slate-700">Pilih Siswa:</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-blue-50/50 cursor-pointer max-w-xs truncate"
              >
                {classStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nama} ({s.nisn}) {s.foto ? '📷' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Watermark Density & Size Selectors in Lembar Mode */}
          {viewMode === 'lembar' && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <label className="font-bold text-slate-700">Tebal Watermark:</label>
                <select
                  value={watermarkDensity}
                  onChange={(e) => setWatermarkDensity(e.target.value as any)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 bg-white cursor-pointer shadow-2xs"
                  title="Pilih tingkat kepekatan / ketebalan watermark saat dicetak ke kertas atau PDF"
                >
                  <option value="tebal">Tebal (Jelas di Kertas)</option>
                  <option value="sangat_tebal">Sangat Tebal (Kontras Maksimal)</option>
                  <option value="sedang">Sedang (Halus)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <label className="font-bold text-slate-700">Ukuran Watermark:</label>
                <select
                  value={watermarkSize}
                  onChange={(e) => setWatermarkSize(e.target.value as any)}
                  className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 bg-white cursor-pointer shadow-2xs"
                  title="Ukuran watermark teks diagonal agar pas di bidang kertas tanpa terpotong"
                >
                  <option value="proporsional">Proporsional (Pas Diagonal)</option>
                  <option value="kecil">Kecil (Kompak)</option>
                  <option value="sedang">Sedang</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Nama, NIS, NISN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-60 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: LEMBAR BUKU INDUK SISWA (PERSIS TEMPLATE BIODATA CETAK RAPOR) */}
      {/* Menampilkan semua identitas siswa, tanpa rekapitulasi nilai akademik */}
      {/* ========================================================================= */}
      {viewMode === 'lembar' && (
        <div className="w-full flex flex-col items-center gap-6 print:gap-0">
          {/* Quick Prev / Next Bar for Single Student Mode (No-Print) */}
          {printTarget === 'single' && currentStudent && (
            <div className="w-full max-w-[210mm] bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between no-print text-xs">
              <button
                type="button"
                onClick={handlePrevStudent}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Siswa Sebelumnya</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{currentStudent.nama}</span>
                <span className="font-mono text-slate-500 font-semibold">(NISN: {currentStudent.nisn})</span>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(currentStudent)}
                  className="ml-2 inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg font-bold text-[11px] cursor-pointer"
                >
                  <Edit3 className="w-3 h-3 text-amber-700" />
                  <span>Ubah Foto & Data</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleNextStudent}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
              >
                <span>Siswa Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {targetStudents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md w-full shadow-xs my-6 flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Tidak Ada Peserta Didik di {selectedRombel?.nama || 'Kelas Ini'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed text-center">
                Silakan tambahkan data peserta didik melalui menu Data Siswa atau pilih kelas lainnya.
              </p>
            </div>
          ) : (
            targetStudents.map((student) => {
              const studentRombel = rombels.find(r => r.id === student.rombelId) || selectedRombel;

              return (
                <div 
                  key={student.id}
                  className="relative bg-white text-black p-10 sm:p-14 w-full max-w-[210mm] min-h-[297mm] shadow-xl border border-slate-300 rounded-sm font-sans text-xs print:m-0 print:p-0 print:border-none print:shadow-none print-page-break space-y-5 overflow-hidden"
                >
                  {/* Watermark Buku INDUK siswa di belakang teks - Diperkecil presisi SVG agar muat diagonal tanpa pernah terpotong */}
                  <div 
                    className={`pointer-events-none select-none absolute inset-0 z-0 flex items-center justify-center transition-opacity ${
                      watermarkDensity === 'sangat_tebal'
                        ? 'opacity-35 print:opacity-45'
                        : watermarkDensity === 'sedang'
                        ? 'opacity-15 print:opacity-20'
                        : 'opacity-24 print:opacity-30'
                    }`}
                    style={{
                      WebkitPrintColorAdjust: 'exact',
                      printColorAdjust: 'exact'
                    }}
                    aria-hidden="true"
                  >
                    <svg 
                      viewBox="0 0 794 1123" 
                      className="w-full h-full"
                      preserveAspectRatio="xMidYMid meet"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <text
                        x="397"
                        y="561.5"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform="rotate(-45 397 561.5)"
                        className="fill-slate-900 font-black uppercase"
                        style={{
                          fontSize: watermarkSize === 'kecil' ? '24px' : watermarkSize === 'sedang' ? '36px' : '29px',
                          fontWeight: 900,
                          letterSpacing: '0.22em',
                          WebkitPrintColorAdjust: 'exact',
                          printColorAdjust: 'exact'
                        }}
                      >
                        BUKU INDUK SISWA
                      </text>
                    </svg>
                  </div>

                  <div className="relative z-10 space-y-5">
                    {/* Header Buku Induk Siswa: Hanya tulisan BUKU INDUK SISWA sesuai permintaan user */}
                    <div className="text-center pb-3 border-b-2 border-black">
                      <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-black">
                        BUKU INDUK SISWA
                      </h2>
                    </div>

                    {/* List Identitas Lengkap Siswa (Persis Format Resmi Kemdikbud / Cetak Rapor) */}
                    <div className="space-y-2.5 leading-relaxed text-xs">
                      <div className="flex">
                        <span className="w-8 font-mono">1.</span>
                        <span className="w-64 font-semibold text-slate-900">Nama Lengkap Siswa</span>
                        <span className="w-4">:</span>
                        <span className="font-bold uppercase text-slate-900 flex-1">{student.nama}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">2.</span>
                        <span className="w-64 font-semibold text-slate-900">Nomor Induk Siswa (NIS)</span>
                        <span className="w-4">:</span>
                        <span className="font-mono font-medium flex-1">{student.nis}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">3.</span>
                        <span className="w-64 font-semibold text-slate-900">Nomor Induk Siswa Nasional (NISN)</span>
                        <span className="w-4">:</span>
                        <span className="font-mono font-bold flex-1">{student.nisn}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">4.</span>
                        <span className="w-64 font-semibold text-slate-900">Tempat, Tanggal Lahir</span>
                        <span className="w-4">:</span>
                        <span className="flex-1">{student.tempatLahir}, {student.tanggalLahir}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">5.</span>
                        <span className="w-64 font-semibold text-slate-900">Jenis Kelamin</span>
                        <span className="w-4">:</span>
                        <span className="flex-1">{student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">6.</span>
                        <span className="w-64 font-semibold text-slate-900">Agama & Kepercayaan</span>
                        <span className="w-4">:</span>
                        <span className="flex-1">{student.agama || 'Islam'}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">7.</span>
                        <span className="w-64 font-semibold text-slate-900">Status dalam Keluarga</span>
                        <span className="w-4">:</span>
                        <span className="flex-1">{student.statusKeluarga || 'Anak Kandung'}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">8.</span>
                        <span className="w-64 font-semibold text-slate-900">Anak Ke</span>
                        <span className="w-4">:</span>
                        <span className="flex-1">{student.anakKe || '1'}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">9.</span>
                        <span className="w-64 font-semibold text-slate-900">Sekolah Asal (Pendidikan Sebelumnya)</span>
                        <span className="w-4">:</span>
                        <span className="flex-1">{student.sekolahAsal || 'Sekolah Dasar (SD / MI)'}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">10.</span>
                        <span className="w-64 font-semibold text-slate-900">Diterima di Sekolah Ini</span>
                        <span className="w-4">:</span>
                        <div className="space-y-1 flex-1">
                          <p>a. Di Kelas / Rombel : <span className="font-semibold">{studentRombel?.nama || student.rombelId} ({studentRombel?.fase || 'Fase D'})</span></p>
                          <p>b. Pada Tanggal / Tahun Masuk : <span className="font-semibold">{student.tahunMasuk || (school.tahunAjaran ? school.tahunAjaran.split('/')[0] : '2026')}</span></p>
                          <p>c. Terdaftar Sebagai : <span className="font-semibold">{student.terdaftarSebagai || 'Peserta Didik Baru'}</span></p>
                        </div>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">11.</span>
                        <span className="w-64 font-semibold text-slate-900">Alamat Peserta Didik</span>
                        <span className="w-4">:</span>
                        <span className="flex-1 leading-normal">{student.alamat}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">12.</span>
                        <span className="w-64 font-semibold text-slate-900">Nomor Telepon / HP</span>
                        <span className="w-4">:</span>
                        <span className="flex-1">{student.telepon || '-'}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">13.</span>
                        <span className="w-64 font-semibold text-slate-900">Nama Orang Tua Kandung</span>
                        <span className="w-4">:</span>
                        <div className="space-y-1 flex-1">
                          <p>a. Ayah : <span className="font-semibold">{student.namaAyah || '-'}</span></p>
                          <p>b. Ibu  : <span className="font-semibold">{student.namaIbu || '-'}</span></p>
                        </div>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">14.</span>
                        <span className="w-64 font-semibold text-slate-900">Pekerjaan Orang Tua</span>
                        <span className="w-4">:</span>
                        <span className="flex-1">{student.pekerjaanOrangTua || 'Wiraswasta / Petani'}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">15.</span>
                        <span className="w-64 font-semibold text-slate-900">Alamat Orang Tua</span>
                        <span className="w-4">:</span>
                        <span className="flex-1 leading-normal">{student.alamat}</span>
                      </div>

                      <div className="flex">
                        <span className="w-8 font-mono">16.</span>
                        <span className="w-64 font-semibold text-slate-900">Wali Peserta Didik (jika ada)</span>
                        <span className="w-4">:</span>
                        <div className="space-y-1 flex-1">
                          <p>a. Nama Wali : <span className="font-semibold">{student.namaWali || '-'}</span></p>
                          <p>b. Pekerjaan Wali : <span className="font-semibold">{student.pekerjaanWali || '-'}</span></p>
                          <p>c. Alamat Wali : <span className="font-semibold">{student.alamatWali || '-'}</span></p>
                        </div>
                      </div>
                    </div>

                    {/* Pasfoto 3x4 & Tanda Tangan Resmi Kepala Sekolah */}
                    <div className="pt-6 flex justify-between items-end">
                      {/* Pasfoto 3 x 4 dengan opsi ubah foto langsung */}
                      <div className="relative group">
                        <div className="w-28 h-36 border-2 border-black flex flex-col items-center justify-center text-[10px] text-slate-400 font-mono bg-slate-50 overflow-hidden shadow-2xs">
                          {student.foto ? (
                            <img 
                              src={student.foto} 
                              alt={student.nama} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center p-2">
                              <User className="w-8 h-8 text-slate-300 mb-1" />
                              <span className="font-bold text-slate-600">Pasfoto</span>
                              <span className="text-[9px]">3 x 4 cm</span>
                            </div>
                          )}
                        </div>

                        {/* Hover action to edit / upload photo on screen */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(student)}
                          className="no-print absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-[11px] font-semibold cursor-pointer rounded-xs"
                          title="Klik untuk mengunggah atau mengganti foto siswa ini"
                        >
                          <Camera className="w-5 h-5 text-amber-300" />
                          <span>{student.foto ? 'Ganti Foto' : 'Unggah Foto'}</span>
                        </button>
                      </div>

                      {/* Tanda Tangan Resmi Kepala SMPN 14 Tulang Bawang Barat */}
                      <div className="text-center space-y-16">
                        <div>
                          <p>{school.tempatRapor || 'Tulang Bawang Barat'}, {school.tanggalRapor || '15 Juli 2024'}</p>
                          <p className="font-semibold">Kepala {school.namaSekolah},</p>
                        </div>
                        <div>
                          <p className="font-bold underline uppercase text-[12px]">{school.kepalaSekolah}</p>
                          <p className="font-mono text-[10.5px]">NIP. {school.nipKepalaSekolah}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: TABEL DAFTAR REGISTER BUKU INDUK SISWA */}
      {/* ========================================================================= */}
      {viewMode === 'daftar' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Register Seluruh Data Buku Induk Peserta Didik
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                {classStudents.length} Siswa
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Menampilkan seluruh identitas peserta didik dan status pasfoto
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="py-3 px-3 w-12 text-center font-bold">No</th>
                  <th className="py-3 px-3 w-16 text-center font-bold">Foto</th>
                  <th className="py-3 px-3.5 w-24 font-bold">NIS</th>
                  <th className="py-3 px-3.5 w-28 font-bold">NISN</th>
                  <th className="py-3 px-4 font-bold min-w-[180px]">Nama Peserta Didik</th>
                  <th className="py-3 px-2 text-center w-14 font-bold">L/P</th>
                  <th className="py-3 px-3 w-28 font-bold">Kelas</th>
                  <th className="py-3 px-3.5 min-w-[160px] font-bold">Tempat, Tgl Lahir</th>
                  <th className="py-3 px-3 font-bold w-24 text-center">Agama</th>
                  <th className="py-3 px-3.5 min-w-[160px] font-bold">Orang Tua & Alamat</th>
                  <th className="py-3 px-3 text-center w-36 font-bold no-print">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classStudents.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      Tidak ada peserta didik yang memenuhi kriteria filter.
                    </td>
                  </tr>
                ) : (
                  classStudents.map((student, idx) => {
                    const rombel = rombels.find(r => r.id === student.rombelId);

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500 font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {student.foto ? (
                            <img 
                              src={student.foto} 
                              alt={student.nama} 
                              className="w-8 h-10 object-cover rounded border border-slate-300 mx-auto" 
                            />
                          ) : (
                            <div className="w-8 h-10 bg-slate-100 rounded border border-dashed border-slate-300 flex items-center justify-center text-slate-400 mx-auto">
                              <User className="w-4 h-4 text-slate-300" />
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-700 font-semibold">
                          {student.nis}
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-900 font-bold">
                          {student.nisn}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">
                          {student.nama}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            student.jenisKelamin === 'L'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {student.jenisKelamin}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-semibold">
                            {rombel?.nama || student.rombelId}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-600">
                          <p className="font-medium text-slate-800">{student.tempatLahir}</p>
                          <p className="text-[10.5px] text-slate-400">{student.tanggalLahir}</p>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {student.agama || 'Islam'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-600">
                          <p className="font-medium text-slate-800 truncate max-w-[150px]">
                            {student.namaAyah} / {student.namaIbu}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            {student.alamat}
                          </p>
                        </td>
                        <td className="py-2.5 px-3 text-center no-print">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedStudentId(student.id);
                                setViewMode('lembar');
                                setPrintTarget('single');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                              title="Lihat Lembar Buku Induk"
                            >
                              <FileText className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Lihat</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEdit(student)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                              title="Edit Data & Foto Siswa"
                            >
                              <Camera className="w-3.5 h-3.5 text-amber-700" />
                              <span>Foto</span>
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
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT BIODATA & UNGGAH FOTO SISWA BUKU INDUK */}
      {/* ========================================================================= */}
      {isEditModalOpen && editingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form 
            onSubmit={handleSaveStudent}
            className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Edit Biodata & Unggah Foto Siswa
                  </h3>
                  <p className="text-xs text-slate-500">
                    Perbarui identitas lengkap dan pasfoto resmi untuk Buku Induk SMPN 14 Tubaba
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              {/* BAGIAN FOTO SISWA */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
                <div className="w-24 h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-center p-1 bg-white shrink-0 overflow-hidden shadow-xs relative group">
                  {formFotoPreview ? (
                    <img 
                      src={formFotoPreview} 
                      alt="Preview Foto" 
                      className="w-full h-full object-cover rounded" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <User className="w-8 h-8 text-slate-300 mb-1" />
                      <span className="text-[10px] font-bold">Pasfoto</span>
                      <span className="text-[9px]">3 x 4 cm</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <p className="font-bold text-slate-800 text-xs">
                    Pasfoto Resmi Peserta Didik (3 x 4)
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Unggah pasfoto siswa berseragam sekolah dengan latar belakang merah / biru (format JPG, PNG, atau WebP). Foto otomatis dioptimalkan agar ringan dan jernih.
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                      id="upload-student-photo"
                    />
                    <label
                      htmlFor="upload-student-photo"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{formFotoPreview ? 'Ganti Pasfoto' : 'Pilih Foto dari Perangkat'}</span>
                    </label>

                    {formFotoPreview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Foto</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* FORM IDENTITAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Induk Siswa (NIS)
                  </label>
                  <input
                    type="text"
                    required
                    value={formNis}
                    onChange={(e) => setFormNis(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NISN (10 Digit)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={formNisn}
                    onChange={(e) => setFormNisn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Peserta Didik
                </label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formJk}
                    onChange={(e) => setFormJk(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Agama & Kepercayaan
                  </label>
                  <select
                    value={formAgama}
                    onChange={(e) => setFormAgama(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen Protestan</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Khonghucu">Khonghucu</option>
                    <option value="Kepercayaan">Penghayat Kepercayaan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rombongan Belajar (Kelas)
                  </label>
                  <select
                    value={formRombelId}
                    onChange={(e) => setFormRombelId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
                  >
                    {rombels.map(r => (
                      <option key={r.id} value={r.id}>{r.nama} ({r.fase})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    value={formTempatLahir}
                    onChange={(e) => setFormTempatLahir(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Lahir
                  </label>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD atau DD Bulan YYYY"
                    value={formTanggalLahir}
                    onChange={(e) => setFormTanggalLahir(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status dalam Keluarga
                  </label>
                  <input
                    type="text"
                    placeholder="Anak Kandung"
                    value={formStatusKeluarga}
                    onChange={(e) => setFormStatusKeluarga(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Anak Ke-
                  </label>
                  <input
                    type="text"
                    placeholder="1"
                    value={formAnakKe}
                    onChange={(e) => setFormAnakKe(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Telepon / HP
                  </label>
                  <input
                    type="text"
                    placeholder="08xxxxxxxxxx"
                    value={formTelepon}
                    onChange={(e) => setFormTelepon(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sekolah Dasar / Asal (SD / MI)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: SD Negeri 1 Tulang Bawang Tengah"
                    value={formSekolahAsal}
                    onChange={(e) => setFormSekolahAsal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tahun Masuk / Diterima
                  </label>
                  <input
                    type="text"
                    placeholder="2024"
                    value={formTahunMasuk}
                    onChange={(e) => setFormTahunMasuk(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Status Masuk / Terdaftar Sebagai
                </label>
                <select
                  value={formTerdaftarSebagai}
                  onChange={(e) => setFormTerdaftarSebagai(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
                >
                  <option value="Peserta Didik Baru">Peserta Didik Baru</option>
                  <option value="Pindahan">Pindahan</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Tempat Tinggal Peserta Didik
                </label>
                <textarea
                  rows={2}
                  value={formAlamat}
                  onChange={(e) => setFormAlamat(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* DATA ORANG TUA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Ayah Kandung
                  </label>
                  <input
                    type="text"
                    value={formNamaAyah}
                    onChange={(e) => setFormNamaAyah(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Ibu Kandung
                  </label>
                  <input
                    type="text"
                    value={formNamaIbu}
                    onChange={(e) => setFormNamaIbu(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pekerjaan Orang Tua
                  </label>
                  <input
                    type="text"
                    placeholder="Wiraswasta / Petani / PNS"
                    value={formPekerjaanOrtu}
                    onChange={(e) => setFormPekerjaanOrtu(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Wali Peserta Didik (Bila Ada)
                  </label>
                  <input
                    type="text"
                    placeholder="-"
                    value={formNamaWali}
                    onChange={(e) => setFormNamaWali(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Simpan Biodata & Pasfoto Siswa
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
