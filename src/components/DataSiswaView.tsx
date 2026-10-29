import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  ERaporState, 
  Student, 
  Rombel 
} from '../types/erapor';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  UserCheck,
  Calendar,
  X,
  Camera,
  User
} from 'lucide-react';

interface DataSiswaViewProps {
  state: ERaporState;
  onUpdateStudents: (students: Student[]) => void;
  onAddStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
}

export const DataSiswaView: React.FC<DataSiswaViewProps> = ({
  state,
  onUpdateStudents,
  onAddStudent,
  onDeleteStudent
}) => {
  const { students, rombels, school } = state;

  const [selectedRombelFilter, setSelectedRombelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Clear all students handler
  const handleConfirmClearAll = () => {
    onUpdateStudents([]);
    setIsClearAllModalOpen(false);
    setSuccessMsg('Semua data peserta didik berhasil dikosongkan.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  // Modal Tambah Siswa Manual
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [formNis, setFormNis] = useState('');
  const [formNisn, setFormNisn] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formJk, setFormJk] = useState<'L' | 'P'>('L');
  const [formRombelId, setFormRombelId] = useState(rombels[0]?.id || '7.1');
  const [formTempatLahir, setFormTempatLahir] = useState('Tubaba');
  const [formTanggalLahir, setFormTanggalLahir] = useState('2011-05-15');
  const [formAgama, setFormAgama] = useState('Islam');
  const [formStatusKeluarga, setFormStatusKeluarga] = useState('Anak Kandung');
  const [formAnakKe, setFormAnakKe] = useState('1');
  const [formTahunMasuk, setFormTahunMasuk] = useState(() => school.tahunAjaran ? school.tahunAjaran.split('/')[0] : '2026');
  const [formSekolahAsal, setFormSekolahAsal] = useState('SD / MI Sederajat');
  const [formTerdaftarSebagai, setFormTerdaftarSebagai] = useState('Peserta Didik Baru');
  const [formTelepon, setFormTelepon] = useState('-');
  const [formNamaAyah, setFormNamaAyah] = useState('');
  const [formNamaIbu, setFormNamaIbu] = useState('');
  const [formPekerjaan, setFormPekerjaan] = useState('Petani');
  const [formAlamat, setFormAlamat] = useState('Tulang Bawang Tengah');
  const [formNamaWali, setFormNamaWali] = useState('-');
  const [formPekerjaanWali, setFormPekerjaanWali] = useState('-');
  const [formAlamatWali, setFormAlamatWali] = useState('-');
  const [formFoto, setFormFoto] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Modal Impor Excel
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTargetRombel, setImportTargetRombel] = useState<string>('auto');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [previewStudents, setPreviewStudents] = useState<Student[]>([]);
  const [importFileName, setImportFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistics
  const totalSiswa = students.length;
  const siswaLaki = students.filter(s => s.jenisKelamin === 'L').length;
  const siswaPerempuan = students.filter(s => s.jenisKelamin === 'P').length;

  // Filtered student list
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (selectedRombelFilter !== 'all' && s.rombelId !== selectedRombelFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.nama.toLowerCase().includes(q);
        const matchNis = s.nis.toLowerCase().includes(q);
        const matchNisn = s.nisn.toLowerCase().includes(q);
        return matchName || matchNis || matchNisn;
      }
      return true;
    });
  }, [students, selectedRombelFilter, searchQuery]);

  // Handle student photo file upload with automatic canvas compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Harap pilih file gambar (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Ukuran file foto maksimal 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 320;
        const MAX_HEIGHT = 420;
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
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setFormFoto(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle open add modal
  const handleOpenAdd = () => {
    const intakeYear = school.tahunAjaran ? school.tahunAjaran.split('/')[0] : '2026';
    setEditingStudentId(null);
    setFormNis(`260${(students.length + 1).toString().padStart(2, '0')}`);
    setFormNisn(`012${Math.floor(1000000 + Math.random() * 9000000)}`);
    setFormNama('');
    setFormJk('L');
    setFormRombelId(selectedRombelFilter === 'all' ? (rombels[0]?.id || '7.1') : selectedRombelFilter);
    setFormTempatLahir('Tulang Bawang Barat');
    setFormTanggalLahir('2013-05-15');
    setFormAgama('Islam');
    setFormStatusKeluarga('Anak Kandung');
    setFormAnakKe('1');
    setFormTahunMasuk(intakeYear);
    setFormSekolahAsal('SD / MI Sederajat');
    setFormTerdaftarSebagai('Peserta Didik Baru');
    setFormTelepon('-');
    setFormNamaAyah('');
    setFormNamaIbu('');
    setFormPekerjaan('Wiraswasta');
    setFormAlamat('Kec. Tulang Bawang Tengah, Kab. Tulang Bawang Barat');
    setFormNamaWali('-');
    setFormPekerjaanWali('-');
    setFormAlamatWali('-');
    setFormFoto(null);
    setIsAddModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (student: Student) => {
    const intakeYear = school.tahunAjaran ? school.tahunAjaran.split('/')[0] : '2026';
    setEditingStudentId(student.id);
    setFormNis(student.nis);
    setFormNisn(student.nisn);
    setFormNama(student.nama);
    setFormJk(student.jenisKelamin);
    setFormRombelId(student.rombelId);
    setFormTempatLahir(student.tempatLahir);
    setFormTanggalLahir(student.tanggalLahir);
    setFormAgama(student.agama || 'Islam');
    setFormStatusKeluarga(student.statusKeluarga || 'Anak Kandung');
    setFormAnakKe(student.anakKe?.toString() || '1');
    setFormTahunMasuk(student.tahunMasuk || intakeYear);
    setFormSekolahAsal(student.sekolahAsal || 'SD / MI Sederajat');
    setFormTerdaftarSebagai(student.terdaftarSebagai || 'Peserta Didik Baru');
    setFormTelepon(student.telepon || '-');
    setFormNamaAyah(student.namaAyah || '');
    setFormNamaIbu(student.namaIbu || '');
    setFormPekerjaan(student.pekerjaanOrangTua || 'Wiraswasta');
    setFormAlamat(student.alamat || '');
    setFormNamaWali(student.namaWali || '-');
    setFormPekerjaanWali(student.pekerjaanWali || '-');
    setFormAlamatWali(student.alamatWali || '-');
    setFormFoto(student.foto || null);
    setIsAddModalOpen(true);
  };

  // Save student (add or update)
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim() || !formNisn.trim()) {
      setErrorMsg('Nama siswa dan NISN wajib diisi.');
      return;
    }

    if (editingStudentId) {
      // Update existing student
      const updatedList = students.map(s => {
        if (s.id === editingStudentId) {
          return {
            ...s,
            nis: formNis.trim(),
            nisn: formNisn.trim(),
            nama: formNama.trim(),
            jenisKelamin: formJk,
            rombelId: formRombelId,
            tempatLahir: formTempatLahir.trim(),
            tanggalLahir: formTanggalLahir.trim(),
            agama: formAgama.trim(),
            statusKeluarga: formStatusKeluarga.trim(),
            anakKe: formAnakKe.trim(),
            tahunMasuk: formTahunMasuk.trim(),
            sekolahAsal: formSekolahAsal.trim(),
            terdaftarSebagai: formTerdaftarSebagai.trim(),
            telepon: formTelepon.trim(),
            namaAyah: formNamaAyah.trim(),
            namaIbu: formNamaIbu.trim(),
            pekerjaanOrangTua: formPekerjaan.trim(),
            alamat: formAlamat.trim(),
            namaWali: formNamaWali.trim(),
            pekerjaanWali: formPekerjaanWali.trim(),
            alamatWali: formAlamatWali.trim(),
            foto: formFoto || s.foto || undefined
          };
        }
        return s;
      });
      onUpdateStudents(updatedList);
      setSuccessMsg(`Data peserta didik "${formNama}" berhasil diperbarui.`);
    } else {
      // Add new student
      const newStudent: Student = {
        id: `siswa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        nis: formNis.trim(),
        nisn: formNisn.trim(),
        nama: formNama.trim(),
        jenisKelamin: formJk,
        rombelId: formRombelId,
        tempatLahir: formTempatLahir.trim(),
        tanggalLahir: formTanggalLahir.trim(),
        agama: formAgama.trim(),
        statusKeluarga: formStatusKeluarga.trim(),
        anakKe: formAnakKe.trim(),
        tahunMasuk: formTahunMasuk.trim(),
        sekolahAsal: formSekolahAsal.trim(),
        terdaftarSebagai: formTerdaftarSebagai.trim(),
        telepon: formTelepon.trim(),
        namaAyah: formNamaAyah.trim(),
        namaIbu: formNamaIbu.trim(),
        pekerjaanOrangTua: formPekerjaan.trim(),
        alamat: formAlamat.trim(),
        namaWali: formNamaWali.trim(),
        pekerjaanWali: formPekerjaanWali.trim(),
        alamatWali: formAlamatWali.trim(),
        foto: formFoto || undefined
      };
      onAddStudent(newStudent);
      setSuccessMsg(`Peserta didik baru "${formNama}" berhasil ditambahkan ke ${rombels.find(r => r.id === formRombelId)?.nama || formRombelId}.`);
    }

    setIsAddModalOpen(false);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Delete student
  const handleDelete = (student: Student) => {
    setStudentToDelete(student);
  };

  // Download Excel Template for Students
  const handleDownloadExcelTemplate = () => {
    const intakeDefaultYear = school.tahunAjaran ? school.tahunAjaran.split('/')[0] : '2026';
    const templateData = [
      {
        'NIS': '26001',
        'NISN': '0122456791',
        'Nama Lengkap': 'Ahmad Fauzan Pratama',
        'Jenis Kelamin': 'L',
        'Rombel / Kelas': 'Kelas 7.1',
        'Tempat Lahir': 'Panaragan',
        'Tanggal Lahir': '2013-04-12',
        'Agama': 'Islam',
        'Status dalam Keluarga': 'Anak Kandung',
        'Anak Ke': 1,
        'Tahun Masuk': intakeDefaultYear,
        'Sekolah Asal': 'SD Negeri 1 Panaragan',
        'Terdaftar Sebagai': 'Peserta Didik Baru',
        'Alamat': 'Jl. Diponegoro No. 12, Tirta Kencana, Tubaba',
        'Nomor Telepon / HP': '081234567890',
        'Nama Ayah': 'Bambang Irawan',
        'Nama Ibu': 'Siti Maryam',
        'Pekerjaan Orang Tua': 'PNS',
        'Nama Wali': '-',
        'Pekerjaan Wali': '-',
        'Alamat Wali': '-'
      },
      {
        'NIS': '26002',
        'NISN': '0122456792',
        'Nama Lengkap': 'Bella Safitri Putri',
        'Jenis Kelamin': 'P',
        'Rombel / Kelas': 'Kelas 7.1',
        'Tempat Lahir': 'Mulya Asri',
        'Tanggal Lahir': '2013-08-25',
        'Agama': 'Islam',
        'Status dalam Keluarga': 'Anak Kandung',
        'Anak Ke': 2,
        'Tahun Masuk': intakeDefaultYear,
        'Sekolah Asal': 'SD Negeri 2 Mulya Asri',
        'Terdaftar Sebagai': 'Peserta Didik Baru',
        'Alamat': 'Mulya Asri RT 03 RW 01, Tulang Bawang Tengah',
        'Nomor Telepon / HP': '081398765432',
        'Nama Ayah': 'Suryanto',
        'Nama Ibu': 'Sri Wahyuni',
        'Pekerjaan Orang Tua': 'Wiraswasta',
        'Nama Wali': '-',
        'Pekerjaan Wali': '-',
        'Alamat Wali': '-'
      },
      {
        'NIS': '26003',
        'NISN': '0122456793',
        'Nama Lengkap': 'Christian Alexander',
        'Jenis Kelamin': 'L',
        'Rombel / Kelas': 'Kelas 7.2',
        'Tempat Lahir': 'Bandar Lampung',
        'Tanggal Lahir': '2013-06-18',
        'Agama': 'Kristen Protestan',
        'Status dalam Keluarga': 'Anak Kandung',
        'Anak Ke': 1,
        'Tahun Masuk': intakeDefaultYear,
        'Sekolah Asal': 'SD Xaverius Bandar Lampung',
        'Terdaftar Sebagai': 'Peserta Didik Baru',
        'Alamat': 'Tirta Kencana RT 01, Tulang Bawang Tengah',
        'Nomor Telepon / HP': '082155667788',
        'Nama Ayah': 'Yohanes Daniel',
        'Nama Ibu': 'Maria Magdalena',
        'Pekerjaan Orang Tua': 'Karyawan Swasta',
        'Nama Wali': '-',
        'Pekerjaan Wali': '-',
        'Alamat Wali': '-'
      },
      {
        'NIS': '26004',
        'NISN': '0122456794',
        'Nama Lengkap': 'I Wayan Darmawan',
        'Jenis Kelamin': 'L',
        'Rombel / Kelas': 'Kelas 7.2',
        'Tempat Lahir': 'Tubaba',
        'Tanggal Lahir': '2013-11-09',
        'Agama': 'Hindu',
        'Status dalam Keluarga': 'Anak Kandung',
        'Anak Ke': 3,
        'Tahun Masuk': intakeDefaultYear,
        'Sekolah Asal': 'SD Negeri 3 Dayamurni',
        'Terdaftar Sebagai': 'Peserta Didik Baru',
        'Alamat': 'Diyuk Kencana RT 04, Tulang Bawang Tengah',
        'Nomor Telepon / HP': '085277889900',
        'Nama Ayah': 'I Made Sudarma',
        'Nama Ibu': 'Ni Ketut Wardani',
        'Pekerjaan Orang Tua': 'Petani',
        'Nama Wali': '-',
        'Pekerjaan Wali': '-',
        'Alamat Wali': '-'
      }
    ];

    const petunjukData = [
      { 'No': 1, 'Kolom': 'NIS & NISN', 'Ketentuan': 'Wajib diisi angka unik untuk setiap peserta didik (NISN 10 digit)' },
      { 'No': 2, 'Kolom': 'Nama Lengkap', 'Ketentuan': 'Wajib diisi sesuai dokumen resmi Akta Kelahiran / Kartu Keluarga' },
      { 'No': 3, 'Kolom': 'Jenis Kelamin', 'Ketentuan': 'Diisi "L" untuk Laki-laki atau "P" untuk Perempuan' },
      { 'No': 4, 'Kolom': 'Rombel / Kelas', 'Ketentuan': 'Diisi rombel sasaran terdaftar (contoh: Kelas 7.1, 7.2, 8.1, dst.)' },
      { 'No': 5, 'Kolom': 'Tanggal Lahir', 'Ketentuan': 'Gunakan format standar YYYY-MM-DD (contoh: 2013-05-15)' },
      { 'No': 6, 'Kolom': 'Agama', 'Ketentuan': 'Diisi: Islam, Kristen Protestan, Katolik, Hindu, Buddha, Khonghucu' },
      { 'No': 7, 'Kolom': 'Status dalam Keluarga', 'Ketentuan': 'Diisi: Anak Kandung, Anak Angkat, atau Anak Tiri' },
      { 'No': 8, 'Kolom': 'Anak Ke', 'Ketentuan': 'Urutan kelahiran anak dalam keluarga (contoh: 1, 2, 3)' },
      { 'No': 9, 'Kolom': 'Tahun Masuk', 'Ketentuan': 'Tahun pertama kali diterima di sekolah ini (contoh: 2024 atau 2026)' },
      { 'No': 10, 'Kolom': 'Sekolah Asal', 'Ketentuan': 'Nama SD/MI atau sekolah sebelumnya (contoh: SD Negeri 1 Panaragan)' },
      { 'No': 11, 'Kolom': 'Terdaftar Sebagai', 'Ketentuan': 'Status masuk siswa: "Peserta Didik Baru" atau "Pindahan"' },
      { 'No': 12, 'Kolom': 'Alamat & Telepon', 'Ketentuan': 'Alamat lengkap tempat tinggal siswa dan nomor kontak aktif' },
      { 'No': 13, 'Kolom': 'Orang Tua & Wali', 'Ketentuan': 'Nama dan pekerjaan ayah, ibu kandung, serta wali jika ada' },
      { 'No': 14, 'Kolom': 'Tahun Pelajaran', 'Ketentuan': 'Tahun Ajaran Aktif e-Rapor: 2026/2027 (SMPN 14 Tulang Bawang Barat)' }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    ws['!cols'] = [
      { wch: 10 }, // NIS
      { wch: 14 }, // NISN
      { wch: 28 }, // Nama
      { wch: 14 }, // JK
      { wch: 16 }, // Rombel
      { wch: 16 }, // Tempat Lahir
      { wch: 14 }, // Tanggal Lahir
      { wch: 18 }, // Agama
      { wch: 20 }, // Status Keluarga
      { wch: 10 }, // Anak Ke
      { wch: 14 }, // Tahun Masuk
      { wch: 24 }, // Sekolah Asal
      { wch: 20 }, // Terdaftar Sebagai
      { wch: 35 }, // Alamat
      { wch: 18 }, // Telepon
      { wch: 18 }, // Ayah
      { wch: 18 }, // Ibu
      { wch: 20 }, // Pekerjaan Ortu
      { wch: 18 }, // Nama Wali
      { wch: 18 }, // Pekerjaan Wali
      { wch: 25 }, // Alamat Wali
    ];

    const wsPetunjuk = XLSX.utils.json_to_sheet(petunjukData);
    wsPetunjuk['!cols'] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 70 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Format_Data_Siswa');
    XLSX.utils.book_append_sheet(wb, wsPetunjuk, 'Petunjuk_Pengisian');
    XLSX.writeFile(wb, 'Template_Impor_Data_Siswa_2026-2027.xlsx');
  };

  // Export current students to Excel
  const handleExportAllStudentsToExcel = () => {
    const exportData = filteredStudents.map((s, idx) => {
      const rombel = rombels.find(r => r.id === s.rombelId);
      return {
        'No': idx + 1,
        'NIS': s.nis,
        'NISN': s.nisn,
        'Nama Lengkap': s.nama,
        'Jenis Kelamin': s.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)',
        'Rombel / Kelas': rombel?.nama || s.rombelId,
        'Tempat Lahir': s.tempatLahir,
        'Tanggal Lahir': s.tanggalLahir,
        'Agama': s.agama,
        'Status dalam Keluarga': s.statusKeluarga || 'Anak Kandung',
        'Anak Ke': s.anakKe || '1',
        'Tahun Masuk': s.tahunMasuk || (school.tahunAjaran ? school.tahunAjaran.split('/')[0] : '2026'),
        'Sekolah Asal': s.sekolahAsal || 'SD / MI Sederajat',
        'Terdaftar Sebagai': s.terdaftarSebagai || 'Peserta Didik Baru',
        'Alamat': s.alamat,
        'Nomor Telepon / HP': s.telepon || '-',
        'Nama Ayah': s.namaAyah,
        'Nama Ibu': s.namaIbu,
        'Pekerjaan Orang Tua': s.pekerjaanOrangTua,
        'Nama Wali': s.namaWali || '-',
        'Pekerjaan Wali': s.pekerjaanWali || '-',
        'Alamat Wali': s.alamatWali || '-'
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, 'Data_Siswa');
    XLSX.writeFile(wb, `Data_Siswa_${school.namaSekolah.replace(/\s+/g, '_')}.xlsx`);
  };

  // Helper function to extract cell value from formatted & raw excel rows
  const getFlexibleRowVal = (
    rowFmt: Record<string, any>,
    rowRaw: Record<string, any>,
    candidateKeys: string[]
  ): { str: string; raw: any } => {
    // 1. Direct exact match in rowFmt or rowRaw
    for (const k of candidateKeys) {
      if (rowFmt[k] !== undefined && rowFmt[k] !== null && String(rowFmt[k]).trim() !== '') {
        return { str: String(rowFmt[k]).trim(), raw: rowRaw[k] };
      }
      if (rowRaw[k] !== undefined && rowRaw[k] !== null && String(rowRaw[k]).trim() !== '') {
        return { str: String(rowRaw[k]).trim(), raw: rowRaw[k] };
      }
    }

    // 2. Normalized match (remove spaces, symbols, lowercase)
    const normCandidates = candidateKeys.map(k => k.toLowerCase().replace(/[^a-z0-9]/g, ''));

    for (const [colName, colVal] of Object.entries(rowFmt)) {
      if (colVal === undefined || colVal === null || String(colVal).trim() === '') continue;
      const cleanCol = colName.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Exact normalized match
      if (normCandidates.includes(cleanCol)) {
        return { str: String(colVal).trim(), raw: rowRaw[colName] };
      }

      // Partial containment for descriptive candidates
      for (const cand of normCandidates) {
        if (cand.length >= 4 && (cleanCol.includes(cand) || cand.includes(cleanCol))) {
          return { str: String(colVal).trim(), raw: rowRaw[colName] };
        }
      }
    }

    return { str: '', raw: undefined };
  };

  // Helper to parse dates from Excel (handles JS Date, serial number, YYYY-MM-DD, DD/MM/YYYY)
  const parseExcelDate = (raw: any): string => {
    if (!raw) return '2013-05-15';
    if (raw instanceof Date) {
      const y = raw.getFullYear();
      const m = String(raw.getMonth() + 1).padStart(2, '0');
      const d = String(raw.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    if (typeof raw === 'number' && raw > 25000 && raw < 70000) {
      const d = new Date(Math.round((raw - 25569) * 86400 * 1000));
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    const s = String(raw).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmy) {
      return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
    }
    return s || '2013-05-15';
  };

  // Helper to parse Tahun Masuk from Excel
  const parseTahunMasukVal = (valStr: string, rawVal: any, fallbackYear: string): string => {
    if (valStr && valStr.trim() !== '') {
      const s = valStr.trim();
      // If pure 4 digits year or e.g. 2026/2027
      if (/^\d{4}$/.test(s) || /^\d{4}\/\d{4}$/.test(s)) {
        return s;
      }
      // If it contains a 4-digit year e.g. "Tahun 2026" or "15 Juli 2026"
      const m = s.match(/\b(20\d{2})\b/);
      if (m && s.length <= 10) {
        return m[1];
      }
      return s;
    }

    if (rawVal instanceof Date) {
      return String(rawVal.getFullYear());
    }

    if (typeof rawVal === 'number') {
      if (rawVal >= 1990 && rawVal <= 2050) {
        return String(Math.round(rawVal));
      }
      if (rawVal > 25000 && rawVal < 70000) {
        const d = new Date(Math.round((rawVal - 25569) * 86400 * 1000));
        return String(d.getUTCFullYear());
      }
    }

    return fallbackYear;
  };

  // Parse Excel file on file input change
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        
        // Intelligent sheet detection: select sheet containing student data
        let targetWsName = wb.SheetNames[0];
        for (const name of wb.SheetNames) {
          const lower = name.toLowerCase();
          if (lower.includes('siswa') || lower.includes('peserta') || lower.includes('format') || lower.includes('data')) {
            targetWsName = name;
            break;
          }
        }
        const ws = wb.Sheets[targetWsName];

        // Read formatted strings and raw cell objects
        const dataFormatted = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false }) as Record<string, any>[];
        const dataRaw = XLSX.utils.sheet_to_json(ws, { defval: '', raw: true }) as Record<string, any>[];

        if (!dataFormatted || dataFormatted.length === 0) {
          setErrorMsg('File Excel tidak berisi data yang dapat dibaca. Pastikan sheet berisi baris data siswa.');
          return;
        }

        const intakeDefaultYear = school.tahunAjaran ? school.tahunAjaran.split('/')[0] : '2026';

        // Map excel columns to Student objects
        const parsed: Student[] = dataFormatted.map((rowFmt, idx) => {
          const rowRaw = dataRaw[idx] || {};

          // 1. NIS
          const rawNis = getFlexibleRowVal(rowFmt, rowRaw, [
            'NIS', 'NIS / No Induk', 'No Induk', 'Nomor Induk', 'No. Induk', 'nis', 'noinduk'
          ]);
          const nis = rawNis.str || `260${(students.length + idx + 1).toString().padStart(2, '0')}`;

          // 2. NISN
          const rawNisn = getFlexibleRowVal(rowFmt, rowRaw, [
            'NISN', 'Nomor Induk Siswa Nasional', 'No. Induk Siswa Nasional', 'No Induk Siswa Nasional', 'nisn'
          ]);
          const nisn = rawNisn.str || `012${Math.floor(1000000 + Math.random() * 9000000)}`;

          // 3. Nama Lengkap
          const rawNama = getFlexibleRowVal(rowFmt, rowRaw, [
            'Nama Lengkap', 'Nama Siswa', 'Nama Peserta Didik', 'Nama', 'namalengkap', 'namasiswa'
          ]);
          const nama = rawNama.str || `Peserta Didik ${idx + 1}`;

          // 4. Jenis Kelamin
          const rawJk = getFlexibleRowVal(rowFmt, rowRaw, [
            'Jenis Kelamin', 'JK', 'Gender', 'Kelamin', 'L/P', 'jeniskelamin'
          ]);
          let jk: 'L' | 'P' = 'L';
          if (rawJk.str) {
            const up = rawJk.str.toUpperCase();
            if (up.includes('P') || up.includes('PEREMPUAN') || up === 'WANITA' || up === 'F') {
              jk = 'P';
            }
          }

          // 5. Rombel / Kelas
          let resolvedRombelId = rombels[0]?.id || '7.1';
          if (importTargetRombel !== 'auto') {
            resolvedRombelId = importTargetRombel;
          } else {
            const rawRombel = getFlexibleRowVal(rowFmt, rowRaw, [
              'Rombel / Kelas', 'Rombel', 'Kelas', 'Kelas / Rombel', 'Rombel/Kelas', 'rombel', 'kelas'
            ]);
            if (rawRombel.str) {
              const valLower = rawRombel.str.toLowerCase();
              const matched = rombels.find(r => 
                r.nama.toLowerCase().includes(valLower) ||
                valLower.includes(r.nama.toLowerCase()) ||
                r.id.toLowerCase() === valLower ||
                valLower.includes(r.id.toLowerCase())
              );
              if (matched) {
                resolvedRombelId = matched.id;
              }
            }
          }

          // 6. Tempat Lahir
          const rawTempat = getFlexibleRowVal(rowFmt, rowRaw, [
            'Tempat Lahir', 'Tempat', 'Kota Lahir', 'tempatlahir'
          ]);
          const tempatLahir = rawTempat.str || 'Tulang Bawang Barat';

          // 7. Tanggal Lahir
          const rawTanggal = getFlexibleRowVal(rowFmt, rowRaw, [
            'Tanggal Lahir', 'Tgl Lahir', 'Tanggal', 'Tgl', 'tanggallahir'
          ]);
          const tanggalLahir = parseExcelDate(rawTanggal.raw || rawTanggal.str);

          // 8. Agama
          const rawAgama = getFlexibleRowVal(rowFmt, rowRaw, [
            'Agama', 'Agama & Kepercayaan', 'Kepercayaan', 'agama'
          ]);
          const agama = rawAgama.str || 'Islam';

          // 9. Status dalam Keluarga
          const rawStatus = getFlexibleRowVal(rowFmt, rowRaw, [
            'Status dalam Keluarga', 'Status Keluarga', 'Status Anak', 'Hubungan Keluarga', 'statusdalamkeluarga'
          ]);
          const statusKeluarga = rawStatus.str || 'Anak Kandung';

          // 10. Anak Ke
          const rawAnak = getFlexibleRowVal(rowFmt, rowRaw, [
            'Anak Ke', 'Anak ke', 'anak ke', 'Anak Ke-', 'Anak', 'Urutan Anak', 'Anak Ke (1, 2, 3...)', 'anak_ke', 'anakke'
          ]);
          let anakKe = '1';
          if (rawAnak.str) {
            const s = rawAnak.str.trim();
            const numMatch = s.match(/\d+/);
            anakKe = numMatch ? numMatch[0] : s;
          }

          // 11. Tahun Masuk (Dioptimalkan agar terbaca sempurna dari variasi format user)
          const rawTahun = getFlexibleRowVal(rowFmt, rowRaw, [
            'Tahun Masuk', 'TAHUN MASUK', 'tahun masuk', 'Thn Masuk', 'Tahun Masuk Sekolah',
            'Tahun Diterima', 'Tahun Diterima di Sekolah Ini', 'Tahun Ajaran Masuk',
            'Tanggal Masuk', 'Tgl Masuk', 'Tahun Masuk (Thn)', 'Tahun Masuk Siswa',
            'Tahun Masuk / Terdaftar', 'Masuk', 'Tahun', 'tahunmasuk', 'thnmasuk', 'tahunditerima'
          ]);
          const tahunMasuk = parseTahunMasukVal(rawTahun.str, rawTahun.raw, intakeDefaultYear);

          // 12. Sekolah Asal
          const rawSekolah = getFlexibleRowVal(rowFmt, rowRaw, [
            'Sekolah Asal', 'SEKOLAH ASAL', 'sekolah asal', 'Sekolah Asal (SD / MI)',
            'Asal Sekolah', 'Pendidikan Sebelumnya', 'SD Asal', 'Asal SD',
            'Sekolah Dasar / Asal', 'Sekolah Sebelumnya', 'Nama SD', 'sekolahasal'
          ]);
          const sekolahAsal = rawSekolah.str || 'SD / MI Sederajat';

          // 13. Terdaftar Sebagai
          const rawTerdaftar = getFlexibleRowVal(rowFmt, rowRaw, [
            'Terdaftar Sebagai', 'TERDAFTAR SEBAGAI', 'terdaftar sebagai',
            'Status Terdaftar', 'Status Masuk', 'Status Siswa', 'Pendaftaran',
            'Jenis Pendaftaran', 'Status Penerimaan', 'Status Pendaftaran',
            'terdaftarsebagai', 'statusmasuk'
          ]);
          let terdaftarSebagai = 'Peserta Didik Baru';
          if (rawTerdaftar.str) {
            const s = rawTerdaftar.str.trim();
            if (s.toLowerCase().includes('pindah')) {
              terdaftarSebagai = 'Pindahan';
            } else if (s.toLowerCase().includes('baru')) {
              terdaftarSebagai = 'Peserta Didik Baru';
            } else {
              terdaftarSebagai = s;
            }
          }

          // 14. Alamat
          const rawAlamat = getFlexibleRowVal(rowFmt, rowRaw, [
            'Alamat', 'Alamat Peserta Didik', 'Alamat Siswa', 'Alamat Rumah',
            'Tempat Tinggal', 'Domisili', 'alamat'
          ]);
          const alamat = rawAlamat.str || 'Kab. Tulang Bawang Barat';

          // 15. Telepon
          const rawTelepon = getFlexibleRowVal(rowFmt, rowRaw, [
            'Nomor Telepon / HP', 'Telepon / HP', 'Nomor Telepon', 'Telepon',
            'No HP', 'No. HP', 'HP', 'Nomor HP', 'Kontak', 'WhatsApp', 'WA', 'telepon'
          ]);
          const telepon = rawTelepon.str || '-';

          // 16. Nama Ayah & Ibu
          const rawAyah = getFlexibleRowVal(rowFmt, rowRaw, [
            'Nama Ayah', 'Nama Ayah Kandung', 'Ayah', 'Ayah Kandung', 'namaayah'
          ]);
          const namaAyah = rawAyah.str || '-';

          const rawIbu = getFlexibleRowVal(rowFmt, rowRaw, [
            'Nama Ibu', 'Nama Ibu Kandung', 'Ibu', 'Ibu Kandung', 'namaibu'
          ]);
          const namaIbu = rawIbu.str || '-';

          // 17. Pekerjaan Orang Tua
          const rawPekerjaan = getFlexibleRowVal(rowFmt, rowRaw, [
            'Pekerjaan Orang Tua', 'Pekerjaan Ortu', 'Pekerjaan', 'Pekerjaan Ayah', 'Pekerjaan Ibu', 'pekerjaanorangtua'
          ]);
          const pekerjaanOrangTua = rawPekerjaan.str || '-';

          // 18. Wali Siswa
          const rawNamaWali = getFlexibleRowVal(rowFmt, rowRaw, [
            'Nama Wali', 'Wali', 'Wali Murid', 'Nama Wali Siswa', 'namawali'
          ]);
          const namaWali = rawNamaWali.str || '-';

          const rawPekerjaanWali = getFlexibleRowVal(rowFmt, rowRaw, [
            'Pekerjaan Wali', 'Profesi Wali', 'pekerjaanwali'
          ]);
          const pekerjaanWali = rawPekerjaanWali.str || '-';

          const rawAlamatWali = getFlexibleRowVal(rowFmt, rowRaw, [
            'Alamat Wali', 'Domisili Wali', 'alamatwali'
          ]);
          const alamatWali = rawAlamatWali.str || '-';

          return {
            id: `siswa-imp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
            nis,
            nisn,
            nama,
            jenisKelamin: jk,
            rombelId: resolvedRombelId,
            tempatLahir,
            tanggalLahir,
            agama,
            statusKeluarga,
            anakKe,
            tahunMasuk,
            sekolahAsal,
            terdaftarSebagai,
            alamat,
            telepon,
            namaAyah,
            namaIbu,
            pekerjaanOrangTua,
            namaWali,
            pekerjaanWali,
            alamatWali
          };
        });

        setPreviewStudents(parsed);
      } catch (err: any) {
        console.error('Error parsing Excel:', err);
        setErrorMsg('Gagal membaca file Excel. Pastikan file dalam format .xlsx atau .xls yang valid.');
      }
    };

    reader.readAsBinaryString(file);
  };

  // Commit imported students to application state
  const handleCommitImport = () => {
    if (previewStudents.length === 0) {
      setErrorMsg('Belum ada data siswa yang siap diimpor.');
      return;
    }

    if (importMode === 'replace') {
      onUpdateStudents(previewStudents);
      setSuccessMsg(`Berhasil mengimpor dan mengganti seluruh data dengan ${previewStudents.length} peserta didik.`);
    } else {
      // Smart Merge mode: if student with same NISN exists, update their identity (including tahunMasuk, sekolahAsal, etc.)
      // while preserving their student ID, existing grades, attendances, and photos!
      const studentMap = new Map(students.map(s => [s.nisn, s]));
      let updatedCount = 0;
      let newCount = 0;

      previewStudents.forEach(imported => {
        if (studentMap.has(imported.nisn)) {
          const existing = studentMap.get(imported.nisn)!;
          studentMap.set(imported.nisn, {
            ...existing,
            ...imported,
            id: existing.id, // preserve ID so grades & attendances stay linked
            foto: imported.foto || existing.foto // keep photo if existing has photo
          });
          updatedCount++;
        } else {
          studentMap.set(imported.nisn, imported);
          newCount++;
        }
      });

      const mergedList = Array.from(studentMap.values());
      onUpdateStudents(mergedList);
      setSuccessMsg(`Sinkronisasi Excel selesai: ${updatedCount} data siswa diperbarui dan ${newCount} siswa baru ditambahkan.`);
    }

    setIsImportModalOpen(false);
    setPreviewStudents([]);
    setImportFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Manajemen Data Peserta Didik (Siswa)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {totalSiswa} Siswa
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pengelolaan biodata siswa, rombongan belajar, dan impor massal dari file Microsoft Excel (.xlsx / .csv).
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadExcelTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            title="Download Template Excel Resmi Impor Data Siswa 2026/2027"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Unduh Template Excel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPreviewStudents([]);
              setImportFileName(null);
              setIsImportModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Impor Excel Siswa</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Siswa</span>
          </button>

          <button
            type="button"
            onClick={handleExportAllStudentsToExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            title="Ekspor Seluruh Siswa ke File Excel"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Excel</span>
          </button>

          {totalSiswa > 0 && (
            <button
              type="button"
              onClick={() => setIsClearAllModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Hapus / Kosongkan semua data sample peserta didik"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Kosongkan Siswa</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 flex items-center justify-between text-xs text-rose-800 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">Total Peserta Didik</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{totalSiswa} Siswa</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">Siswa Laki-laki (L)</p>
          <p className="text-xl font-bold text-blue-600 mt-1">{siswaLaki} Siswa</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">Siswa Perempuan (P)</p>
          <p className="text-xl font-bold text-rose-600 mt-1">{siswaPerempuan} Siswa</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">Rombongan Belajar</p>
          <p className="text-xl font-bold text-purple-600 mt-1">{rombels.length} Kelas</p>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
            Filter Rombel:
          </label>
          <select
            value={selectedRombelFilter}
            onChange={(e) => setSelectedRombelFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">Semua Rombel ({totalSiswa} Siswa)</option>
            {rombels.map(r => {
              const countInRombel = students.filter(s => s.rombelId === r.id).length;
              return (
                <option key={r.id} value={r.id}>
                  {r.nama} ({countInRombel} Siswa)
                </option>
              );
            })}
          </select>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, NIS, atau NISN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Main Student Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 font-semibold w-12 text-center">No</th>
                <th className="py-3 px-3.5 font-semibold w-24">NIS</th>
                <th className="py-3 px-3.5 font-semibold w-32">NISN</th>
                <th className="py-3 px-4 font-semibold">Nama Peserta Didik</th>
                <th className="py-3 px-3 font-semibold w-16 text-center">L/P</th>
                <th className="py-3 px-3.5 font-semibold w-32">Rombel / Kelas</th>
                <th className="py-3 px-4 font-semibold">Tempat, Tanggal Lahir</th>
                <th className="py-3 px-4 font-semibold">Orang Tua & Alamat</th>
                <th className="py-3 px-3 font-semibold w-20 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    {totalSiswa === 0 ? (
                      <div className="flex flex-col items-center justify-center gap-3 max-w-lg mx-auto py-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
                          <Users className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            Data Sample Peserta Didik Telah Dikosongkan
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Aplikasi siap menerima data peserta didik asli dari <strong>SMPN 14 Tulang Bawang Barat</strong>. Silakan unggah file Excel (format Dapodik/template) atau masukkan data siswa secara manual per kelas (7.1 s.d 9.4).
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewStudents([]);
                              setImportFileName(null);
                              setIsImportModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                          >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Impor Excel Siswa</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleOpenAdd}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Siswa Manual</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleDownloadExcelTemplate}
                            className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh Template Excel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 text-slate-400 text-xs">
                        Tidak ada data peserta didik yang cocok dengan pencarian atau filter kelas ini.
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, idx) => {
                  const rombel = rombels.find(r => r.id === s.rombelId);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3.5 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-slate-600">
                        {s.nis}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono font-medium text-slate-900">
                        {s.nisn}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {s.nama}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.jenisKelamin === 'L' 
                            ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {s.jenisKelamin}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px] font-medium text-slate-700">
                          {rombel?.nama || s.rombelId}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        <p className="font-medium text-slate-800">{s.tempatLahir}, {s.tanggalLahir}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {s.agama || 'Islam'}
                          </span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            Masuk: {s.tahunMasuk || (school.tahunAjaran ? school.tahunAjaran.split('/')[0] : '2026')}
                          </span>
                          {s.sekolahAsal && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] text-slate-600 bg-slate-100 max-w-[150px] truncate" title={s.sekolahAsal}>
                              {s.sekolahAsal}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        <p className="truncate max-w-xs">Ayah: {s.namaAyah} · Ibu: {s.namaIbu}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-xs">{s.alamat}</p>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Edit Data Siswa"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(s)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Hapus Siswa"
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

      {/* ========================================================= */}
      {/* MODAL 1: TAMBAH / EDIT SISWA MANUAL */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveStudent} className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>{editingStudentId ? 'Edit Biodata Siswa' : 'Tambah Peserta Didik Baru'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Informasi peserta didik untuk dicantumkan pada halaman identitas rapor SMPN 14 Tubaba
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Induk Siswa (NIS)
                  </label>
                  <input
                    type="text"
                    required
                    value={formNis}
                    onChange={(e) => setFormNis(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  placeholder="Contoh: Muhammad Rizky Pratama"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formJk}
                    onChange={(e) => setFormJk(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rombongan Belajar (Kelas)
                  </label>
                  <select
                    value={formRombelId}
                    onChange={(e) => setFormRombelId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {rombels.map(r => (
                      <option key={r.id} value={r.id}>{r.nama} ({r.fase})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tempat Lahir
                  </label>
                  <input
                    type="text"
                    value={formTempatLahir}
                    onChange={(e) => setFormTempatLahir(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Field Agama & Pekerjaan Orang Tua */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Agama & Kepercayaan
                  </label>
                  <select
                    value={formAgama}
                    onChange={(e) => setFormAgama(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
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
                    Pekerjaan Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Wiraswasta / Petani / PNS"
                    value={formPekerjaan}
                    onChange={(e) => setFormPekerjaan(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Status dalam Keluarga
                  </label>
                  <select
                    value={formStatusKeluarga}
                    onChange={(e) => setFormStatusKeluarga(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Anak Kandung">Anak Kandung</option>
                    <option value="Anak Angkat">Anak Angkat</option>
                    <option value="Anak Tiri">Anak Tiri</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Anak Ke (Urutan Lahir)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 1, 2, atau 3"
                    value={formAnakKe}
                    onChange={(e) => setFormAnakKe(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tahun Masuk / Diterima
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 2024 atau 2026"
                    value={formTahunMasuk}
                    onChange={(e) => setFormTahunMasuk(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Terdaftar Sebagai
                  </label>
                  <select
                    value={formTerdaftarSebagai}
                    onChange={(e) => setFormTerdaftarSebagai(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Peserta Didik Baru">Peserta Didik Baru</option>
                    <option value="Pindahan">Pindahan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sekolah Asal (SD / MI)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: SD Negeri 1 Panaragan"
                    value={formSekolahAsal}
                    onChange={(e) => setFormSekolahAsal(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Telepon / HP
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 081234567890"
                    value={formTelepon}
                    onChange={(e) => setFormTelepon(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Ayah Kandung
                  </label>
                  <input
                    type="text"
                    value={formNamaAyah}
                    onChange={(e) => setFormNamaAyah(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Tempat Tinggal
                </label>
                <textarea
                  rows={2}
                  value={formAlamat}
                  onChange={(e) => setFormAlamat(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Data Wali (Opsional) */}
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50 space-y-2.5">
                <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wide">
                  Data Wali Peserta Didik (Opsional / Jika Ada)
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Nama Wali</label>
                    <input
                      type="text"
                      placeholder="-"
                      value={formNamaWali}
                      onChange={(e) => setFormNamaWali(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Pekerjaan Wali</label>
                    <input
                      type="text"
                      placeholder="-"
                      value={formPekerjaanWali}
                      onChange={(e) => setFormPekerjaanWali(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Unggah Pasfoto Siswa */}
              <div className="border border-slate-200 rounded-lg p-3 bg-blue-50/40">
                <label className="block font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>Pasfoto Resmi Siswa (3 x 4)</span>
                  {formFoto && (
                    <button
                      type="button"
                      onClick={() => setFormFoto(null)}
                      className="text-red-600 hover:text-red-700 text-[11px] font-semibold"
                    >
                      Hapus Foto
                    </button>
                  )}
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-20 border-2 border-dashed border-slate-300 rounded-md bg-white overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                    {formFoto ? (
                      <img src={formFoto} alt="Foto Siswa" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[9px] text-slate-400 text-center font-medium">3 x 4 cm</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>{formFoto ? 'Ganti Foto' : 'Pilih Foto (Maks. 2MB)'}</span>
                    </button>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Foto akan tampil otomatis pada lembar Biodata Rapor & Buku Induk Siswa.
                    </p>
                  </div>
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
                {editingStudentId ? 'Simpan Perubahan' : 'Simpan Siswa'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: IMPOR DATA EXCEL SISWA */}
      {/* ========================================================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Impor Data Peserta Didik dari Microsoft Excel (.xlsx / .csv)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Unggah file Excel daftar siswa untuk dimasukkan secara massal ke e-Rapor
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 flex-1 overflow-y-auto pr-1 text-xs">
              {/* Step 1: Download format template */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Download className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-bold text-blue-900">Belum punya format Excel?</p>
                    <p className="text-[11px] text-blue-700">
                      Unduh template resmi dengan susunan kolom: NIS, NISN, Nama Lengkap, JK, Kelas, Tempat & Tanggal Lahir, Orang Tua.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadExcelTemplate}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs shrink-0 shadow-2xs"
                >
                  Unduh Format Excel
                </button>
              </div>

              {/* Step 2: Upload file & configurations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pilih File Excel / CSV
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-slate-300 rounded-lg p-1"
                  />
                  {importFileName && (
                    <p className="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      File terpilih: {importFileName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Rombel Tujuan
                    </label>
                    <select
                      value={importTargetRombel}
                      onChange={(e) => setImportTargetRombel(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="auto">Deteksi Otomatis dari Kolom Excel</option>
                      {rombels.map(r => (
                        <option key={r.id} value={r.id}>Tetapkan Semua ke {r.nama}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Metode Impor
                    </label>
                    <div className="flex items-center gap-3 mt-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'append'}
                          onChange={() => setImportMode('append')}
                          className="text-blue-600"
                        />
                        <span>Tambahkan ke data yang ada</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="text-blue-600"
                        />
                        <span>Timpa data siswa lama</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Preview Table */}
              {previewStudents.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden mt-3">
                  <div className="bg-slate-50 p-3 border-b border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Pratinjau Data Siap Diimpor ({previewStudents.length} Siswa Terdeteksi)
                    </span>
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Validasi Kolom Berhasil
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 sticky top-0">
                        <tr>
                          <th className="py-2 px-2.5 w-8 text-center">No</th>
                          <th className="py-2 px-2.5 w-18">NIS</th>
                          <th className="py-2 px-2.5 w-24">NISN</th>
                          <th className="py-2 px-3">Nama Siswa</th>
                          <th className="py-2 px-2 w-10 text-center">JK</th>
                          <th className="py-2 px-2.5 w-24">Rombel</th>
                          <th className="py-2 px-2.5">Agama</th>
                          <th className="py-2 px-2 text-center">Anak Ke</th>
                          <th className="py-2 px-2 text-center">Thn Masuk</th>
                          <th className="py-2 px-3">Sekolah Asal</th>
                          <th className="py-2 px-2.5">Terdaftar Sbg</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {previewStudents.map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-2.5 text-center font-mono text-slate-500">{idx + 1}</td>
                            <td className="py-2 px-2.5 font-mono text-slate-600">{s.nis}</td>
                            <td className="py-2 px-2.5 font-mono font-medium text-slate-900">{s.nisn}</td>
                            <td className="py-2 px-3 font-semibold text-slate-900">{s.nama}</td>
                            <td className="py-2 px-2 text-center font-bold">{s.jenisKelamin}</td>
                            <td className="py-2 px-2.5">{rombels.find(r => r.id === s.rombelId)?.nama || s.rombelId}</td>
                            <td className="py-2 px-2.5">{s.agama}</td>
                            <td className="py-2 px-2 text-center font-semibold text-slate-800">{s.anakKe || '1'}</td>
                            <td className="py-2 px-2 text-center font-mono font-bold text-blue-700 bg-blue-50/50">{s.tahunMasuk || (school.tahunAjaran ? school.tahunAjaran.split('/')[0] : '2026')}</td>
                            <td className="py-2 px-3 text-slate-600 truncate max-w-[140px]">{s.sekolahAsal || '-'}</td>
                            <td className="py-2 px-2.5">
                              <span className="px-1.5 py-0.5 rounded text-[10.5px] font-medium bg-blue-50 text-blue-700">
                                {s.terdaftarSebagai || 'Siswa Baru'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={previewStudents.length === 0}
                onClick={handleCommitImport}
                className="px-5 py-2 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg shadow-xs flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4" />
                <span>Impor {previewStudents.length > 0 ? `${previewStudents.length} Siswa` : 'Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: KONFIRMASI KOSONGKAN SELURUH SISWA */}
      {/* ========================================================= */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Kosongkan Seluruh Peserta Didik?
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tindakan ini akan menghapus seluruh data sample/siswa ({totalSiswa} siswa).
                </p>
              </div>
            </div>

            <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 leading-relaxed">
              Semua peserta didik akan dikosongkan dari seluruh 12 rombel (7.1 s.d 9.4) agar Anda dapat mengisi data peserta didik asli dari <strong>SMPN 14 Tulang Bawang Barat</strong> melalui input form atau impor file Excel.
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAll}
                className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Kosongkan Semua Siswa</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Satu Siswa (In-App Dialog) */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hapus Peserta Didik?</h3>
                <p className="text-xs text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1.5 my-3">
              <p>
                Nama Lengkap: <strong className="text-slate-900">{studentToDelete.nama}</strong>
              </p>
              <p>
                NIS / NISN: <span className="font-mono">{studentToDelete.nis} / {studentToDelete.nisn}</span>
              </p>
              <p>
                Kelas: <span className="font-semibold">{rombels.find(r => r.id === studentToDelete.rombelId)?.nama || studentToDelete.rombelId}</span>
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const deletedName = studentToDelete.nama;
                  onDeleteStudent(studentToDelete.id);
                  setStudentToDelete(null);
                  setSuccessMsg(`Peserta didik "${deletedName}" berhasil dihapus.`);
                  setTimeout(() => setSuccessMsg(null), 3000);
                }}
                className="px-4 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Siswa</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
