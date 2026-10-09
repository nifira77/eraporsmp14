export type UserRole = 'guru_mapel' | 'wali_kelas' | 'admin' | 'kepala_sekolah';

export type EkstrakurikulerPilihan = 'OSIS' | 'Pramuka' | 'Rohis' | 'UKS' | 'Seni Tari' | 'Olah Raga';

export interface UserProfile {
  id: string;
  name: string;
  nip: string;
  role: UserRole;
  subjectId?: string; // If guru_mapel, which default subject
  rombelId?: string;  // If wali_kelas, which rombel
  photoUrl?: string;
  tugasTambahan?: string; // e.g. "Pembina Ekstrakurikuler", "Tidak Ada"
  pembinaEkskul?: EkstrakurikulerPilihan | string;
}

export interface SchoolInfo {
  namaSekolah: string;
  npsn: string;
  nss: string;
  alamat: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  website: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  tempatRapor: string;
  tanggalRapor: string;
  logoSekolah?: string;
  logoPemda?: string;
}

export interface Rombel {
  id: string;
  nama: string; // e.g. "Kelas 7.1"
  tingkat: number; // 7, 8, 9
  fase: string; // "Fase D"
  waliKelasId?: string;
  waliKelasNama: string;
  waliKelasNip: string;
  tahunAjaran: string;
  semester: 'Ganjil' | 'Genap';
  jumlahSiswa: number;
}

export interface Subject {
  id: string;
  kode: string;
  nama: string;
  kategori: 'Umum' | 'Kejuruan' | 'Muatan Lokal';
  kktp: number; // Kriteria Ketercapaian Tujuan Pembelajaran (default: 75)
  guruPengampuId: string;
  guruPengampuNama: string;
}

export interface TujuanPembelajaran {
  id: string;
  subjectId: string;
  rombelId: string;
  kodeTP: string; // e.g. "TP 1"
  lingkupMateri: string;
  deskripsi: string;
  semester: 'Ganjil' | 'Genap';
}

export interface Student {
  id: string;
  nis: string;
  nisn: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  rombelId: string;
  tempatLahir: string;
  tanggalLahir: string;
  agama: string;
  namaAyah: string;
  namaIbu: string;
  pekerjaanOrangTua: string;
  alamat: string;
}

export type AssessmentMode = 'tengah_semester' | 'akhir_semester';

export interface StudentGrade {
  id: string;
  studentId: string;
  subjectId: string;
  rombelId: string;
  // Sumatif per TP (e.g., tp-1: 85, tp-2: 78)
  sumatifLM: Record<string, number>;
  nilaiAkhirLM: number;
  // Sumatif Tengah Semester (STS / PTS)
  nonTesSTS?: number; // Portofolio / Unjuk Kerja Tengah Semester
  tesSTS?: number;    // Tes Tertulis STS
  nilaiAkhirSTS?: number; // Nilai Rapor Tengah Semester
  deskripsiSTS?: string; // Capaian Kompetensi Tengah Semester
  // Sumatif Akhir Semester (SAS / SAT)
  nonTesSAS: number; // Penilaian Proyek / Unjuk Kerja Akhir Semester
  tesSAS: number;    // Tes Tertulis SAS
  nilaiAkhirSAS: number;
  nilaiAkhirRapor: number; // 60% LM + 40% SAS
  deskripsiTertinggi: string;
  deskripsiTerendah: string;
  statusKetercapaian: 'Tercapai' | 'Perlu Peningkatan';
  statusKirim?: 'draft' | 'terkirim' | 'perbaikan';
  tanggalKirim?: string;
  updatedAt: string;
}

export interface Extracurricular {
  id: string;
  nama: string;
  pembina: string;
}

export interface StudentExtracurricular {
  id: string;
  studentId: string;
  rombelId: string;
  ekskulId: string;
  predikat: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  keterangan: string;
}

export interface StudentAttendance {
  studentId: string;
  rombelId: string;
  sakit: number;
  izin: number;
  alpa: number;
}

export interface StudentNote {
  studentId: string;
  rombelId: string;
  catatan: string;
  statusKenaikan?: string; // e.g. "Naik ke Kelas VIII" atau "Lulus"
}

export interface StudentAchievement {
  id: string;
  studentId: string;
  rombelId: string;
  bidang: string; // Akademik / Non-Akademik
  prestasi: string;
  tingkat: 'Kecamatan' | 'Kabupaten' | 'Provinsi' | 'Nasional';
  keterangan: string;
}

export interface ERaporState {
  school: SchoolInfo;
  users: UserProfile[];
  currentUser: UserProfile;
  rombels: Rombel[];
  subjects: Subject[];
  learningObjectives: TujuanPembelajaran[];
  students: Student[];
  grades: StudentGrade[];
  attendances: StudentAttendance[];
  extracurriculars: Extracurricular[];
  studentExtracurriculars: StudentExtracurricular[];
  notes: StudentNote[];
  achievements: StudentAchievement[];
  isLocked: boolean;
}
