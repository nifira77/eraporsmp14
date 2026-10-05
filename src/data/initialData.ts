import {
  SchoolInfo,
  UserProfile,
  Rombel,
  Subject,
  TujuanPembelajaran,
  Student,
  StudentGrade,
  StudentAttendance,
  Extracurricular,
  StudentExtracurricular,
  StudentNote,
  StudentAchievement,
  ERaporState
} from '../types/erapor';

export const defaultLogoPemda = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 140" width="120" height="140"><defs><linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%230f172a"/></linearGradient><linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fbbf24"/><stop offset="100%" stop-color="%23d97706"/></linearGradient></defs><path d="M 60 5 C 95 5, 115 15, 115 45 C 115 90, 60 135, 60 135 C 60 135, 5 90, 5 45 C 5 15, 25 5, 60 5 Z" fill="url(%23shieldGrad)" stroke="%23fbbf24" stroke-width="4"/><path d="M 60 12 C 90 12, 107 20, 107 46 C 107 85, 60 125, 60 125 C 60 125, 13 85, 13 46 C 13 20, 30 12, 60 12 Z" fill="none" stroke="%23ffffff" stroke-width="1.5" stroke-opacity="0.6"/><polygon points="60,18 63,26 71,26 65,31 67,39 60,34 53,39 55,31 49,26 57,26" fill="%23fef08a" stroke="%23d97706" stroke-width="0.8"/><path d="M 40 50 Q 60 38 80 50 L 76 56 Q 60 48 44 56 Z" fill="url(%23goldGrad)"/><path d="M 28 72 L 34 58 L 42 66 L 50 54 L 60 46 L 70 54 L 78 66 L 86 58 L 92 72 Q 60 66 28 72 Z" fill="url(%23goldGrad)" stroke="%23b45309" stroke-width="1"/><circle cx="60" cy="80" r="14" fill="%23ffffff" stroke="%23d97706" stroke-width="2"/><circle cx="60" cy="80" r="8" fill="%23b91c1c"/><circle cx="60" cy="80" r="4" fill="%23fbbf24"/><path d="M 22 102 Q 60 94 98 102 L 94 112 Q 60 104 26 112 Z" fill="%23ffffff" stroke="%23b45309" stroke-width="1"/><text x="60" y="109" font-size="6.5" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="%230f172a">TUBABA</text></svg>`;

export const defaultLogoSekolah = '/src/assets/images/school_logo_emblem_1790936910635.jpg';

export const initialSchoolInfo: SchoolInfo = {
  namaSekolah: 'SMP Negeri 14 Tulang Bawang Barat',
  npsn: '69987823',
  nss: '201121204014',
  alamat: 'Jl. Pendidikan No. 14, Tirta Kencana, Kec. Tulang Bawang Tengah',
  desaKelurahan: 'Tirta Kencana',
  kecamatan: 'Tulang Bawang Tengah',
  kabupaten: 'Tulang Bawang Barat',
  provinsi: 'Lampung',
  kodePos: '34693',
  telepon: '(0726) 782104',
  email: 'smpn14tubaba@kemdikbud.go.id',
  website: 'https://smpn14tulangbawangbarat.sch.id',
  kepalaSekolah: 'Drs. H. Ahmad Fauzi, M.Pd.',
  nipKepalaSekolah: '19680514 199303 1 004',
  tahunAjaran: '2026/2027',
  semester: 'Ganjil',
  tempatRapor: 'Tulang Bawang Barat',
  tanggalRapor: '19 Desember 2026',
  logoSekolah: defaultLogoSekolah,
  logoPemda: defaultLogoPemda
};

export const initialUsers: UserProfile[] = [
  {
    id: 'user-admin',
    name: 'Drs. H. Ahmad Fauzi, M.Pd.',
    nip: '19680514 199303 1 004',
    role: 'admin',
    photoUrl: ''
  },
  {
    id: 'user-siti',
    name: 'Siti Rahmawati, S.Pd.',
    nip: '19850422 201001 2 021',
    role: 'wali_kelas',
    subjectId: 'bindo',
    rombelId: '7.1',
    photoUrl: '',
    tugasTambahan: 'Pembina OSIS',
    pembinaEkskul: 'OSIS'
  },
  {
    id: 'user-budi',
    name: 'Budi Santoso, M.Pd.',
    nip: '19820715 200801 1 012',
    role: 'wali_kelas',
    subjectId: 'mtk',
    rombelId: '7.2',
    photoUrl: '',
    tugasTambahan: 'Pembina Olah Raga',
    pembinaEkskul: 'Olah Raga'
  },
  {
    id: 'user-eko',
    name: 'Eko Prasetyo, S.Pd.',
    nip: '19881103 201201 1 007',
    role: 'wali_kelas',
    subjectId: 'ipa',
    rombelId: '7.3',
    photoUrl: '',
    tugasTambahan: 'Pembina Pramuka',
    pembinaEkskul: 'Pramuka'
  },
  {
    id: 'user-ratna',
    name: 'Ratna Dewi, S.Pd.',
    nip: '19900315 201402 2 003',
    role: 'wali_kelas',
    subjectId: 'bing',
    rombelId: '7.4',
    photoUrl: '',
    tugasTambahan: 'Wali Kelas 7.4'
  },
  {
    id: 'user-sukardi',
    name: 'Sukardi, S.Pd.',
    nip: '19810412 200604 1 009',
    role: 'wali_kelas',
    subjectId: 'ips',
    rombelId: '8.1',
    photoUrl: '',
    tugasTambahan: 'Wali Kelas 8.1'
  },
  {
    id: 'user-wahyu',
    name: 'Wahyu Triyono, S.Pd.',
    nip: '19860920 201101 1 015',
    role: 'wali_kelas',
    subjectId: 'pjok',
    rombelId: '8.2',
    photoUrl: '',
    tugasTambahan: 'Pembina UKS',
    pembinaEkskul: 'UKS'
  },
  {
    id: 'user-lestari',
    name: 'Lestari Handayani, S.Pd.',
    nip: '19890708 201503 2 008',
    role: 'wali_kelas',
    subjectId: 'prakarya',
    rombelId: '8.3',
    photoUrl: '',
    tugasTambahan: 'Wali Kelas 8.3'
  },
  {
    id: 'user-endang',
    name: 'Dra. Endang Purwanti',
    nip: '19690812 199412 2 001',
    role: 'wali_kelas',
    subjectId: 'pkn',
    rombelId: '8.4',
    photoUrl: '',
    tugasTambahan: 'Wali Kelas 8.4'
  },
  {
    id: 'user-subhan',
    name: 'Ahmad Subhan, S.Pd.I',
    nip: '19830510 200902 1 006',
    role: 'wali_kelas',
    subjectId: 'pai',
    rombelId: '9.1',
    photoUrl: '',
    tugasTambahan: 'Pembina Rohis',
    pembinaEkskul: 'Rohis'
  },
  {
    id: 'user-rian',
    name: 'Rian Hidayat, S.Kom.',
    nip: '19920104 201801 1 002',
    role: 'wali_kelas',
    subjectId: 'inf',
    rombelId: '9.2',
    photoUrl: '',
    tugasTambahan: 'Wali Kelas 9.2'
  },
  {
    id: 'user-nurhasanah',
    name: 'Nurhasanah, S.Pd.',
    nip: '19871025 201001 2 018',
    role: 'wali_kelas',
    subjectId: 'mulok',
    rombelId: '9.3',
    photoUrl: '',
    tugasTambahan: 'Pembina Seni Tari',
    pembinaEkskul: 'Seni Tari'
  },
  {
    id: 'user-daniel',
    name: 'Yohanes Daniel, S.Th.',
    nip: '19850618 201101 1 011',
    role: 'wali_kelas',
    subjectId: 'pak_kristen',
    rombelId: '9.4',
    photoUrl: '',
    tugasTambahan: 'Wali Kelas 9.4'
  }
];

export const initialRombels: Rombel[] = [
  // Kelas 7
  {
    id: '7.1',
    nama: 'Kelas 7.1',
    tingkat: 7,
    fase: 'Fase D',
    waliKelasId: 'user-siti',
    waliKelasNama: 'Siti Rahmawati, S.Pd.',
    waliKelasNip: '19850422 201001 2 021',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    jumlahSiswa: 10
  },
  {
    id: '7.2',
    nama: 'Kelas 7.2',
    tingkat: 7,
    fase: 'Fase D',
    waliKelasId: 'user-budi',
    waliKelasNama: 'Budi Santoso, M.Pd.',
    waliKelasNip: '19820715 200801 1 012',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    jumlahSiswa: 6
  },
  {
    id: '7.3',
    nama: 'Kelas 7.3',
    tingkat: 7,
    fase: 'Fase D',
    waliKelasId: 'user-eko',
    waliKelasNama: 'Eko Prasetyo, S.Pd.',
    waliKelasNip: '19881103 201201 1 007',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    jumlahSiswa: 6
  },
  {
    id: '7.4',
    nama: 'Kelas 7.4',
    tingkat: 7,
    fase: 'Fase D',
    waliKelasId: 'user-ratna',
    waliKelasNama: 'Ratna Dewi, S.Pd.',
    waliKelasNip: '19900315 201402 2 003',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    jumlahSiswa: 6
  },

  // Kelas 8
  {
    id: '8.1',
    nama: 'Kelas 8.1',
    tingkat: 8,
    fase: 'Fase D',
    waliKelasId: 'user-sukardi',
    waliKelasNama: 'Sukardi, S.Pd.',
    waliKelasNip: '19810412 200604 1 009',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    jumlahSiswa: 6
  },
  {
    id: '8.2',
    nama: 'Kelas 8.2',
    tingkat: 8,
    fase: 'Fase D',
    waliKelasId: 'user-wahyu',
    waliKelasNama: 'Wahyu Triyono, S.Pd.',
    waliKelasNip: '19860920 201101 1 015',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    jumlahSiswa: 6
  },
  {
    id: '8.3',
    nama: 'Kelas 8.3',
    tingkat: 8,
    fase: 'Fase D',
    waliKelasId: 'user-lestari',
    waliKelasNama: 'Lestari Handayani, S.Pd.',
    waliKelasNip: '19890708 201503 2 008',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    jumlahSiswa: 6
  },
  {
    id: '8.4',
    nama: 'Kelas 8.4',
    tingkat: 8,
    fase: 'Fase D',
    waliKelasId: 'user-endang',
    waliKelasNama: 'Dra. Endang Purwanti',
    waliKelasNip: '19690812 199412 2 001',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    jumlahSiswa: 6
  },

  // Kelas 9
  {
    id: '9.1',
    nama: 'Kelas 9.1',
    tingkat: 9,
    fase: 'Fase D',
    waliKelasId: 'user-subhan',
    waliKelasNama: 'Ahmad Subhan, S.Pd.I',
    waliKelasNip: '19830510 200902 1 006',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    jumlahSiswa: 6
  },
  {
    id: '9.2',
    nama: 'Kelas 9.2',
    tingkat: 9,
    fase: 'Fase D',
    waliKelasId: 'user-rian',
    waliKelasNama: 'Rian Hidayat, S.Kom.',
    waliKelasNip: '19920104 201801 1 002',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    jumlahSiswa: 6
  },
  {
    id: '9.3',
    nama: 'Kelas 9.3',
    tingkat: 9,
    fase: 'Fase D',
    waliKelasId: 'user-nurhasanah',
    waliKelasNama: 'Nurhasanah, S.Pd.',
    waliKelasNip: '19871025 201001 2 018',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    jumlahSiswa: 6
  },
  {
    id: '9.4',
    nama: 'Kelas 9.4',
    tingkat: 9,
    fase: 'Fase D',
    waliKelasId: 'user-daniel',
    waliKelasNama: 'Yohanes Daniel, S.Th.',
    waliKelasNip: '19850618 201101 1 011',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    jumlahSiswa: 6
  }
];

export const initialSubjects: Subject[] = [
  { id: 'pai', kode: 'PAI', nama: 'Pendidikan Agama Islam dan Budi Pekerti', kategori: 'Umum', kktp: 75, guruPengampuId: 'g-pai', guruPengampuNama: 'Ahmad Subhan, S.Pd.I' },
  { id: 'pak_kristen', kode: 'PAK', nama: 'Pendidikan Agama Kristen Protestan dan Budi Pekerti', kategori: 'Umum', kktp: 75, guruPengampuId: 'g-pak', guruPengampuNama: 'Yohanes Daniel, S.Th.' },
  { id: 'pak_katolik', kode: 'PAKat', nama: 'Pendidikan Agama Katolik dan Budi Pekerti', kategori: 'Umum', kktp: 75, guruPengampuId: 'g-pkat', guruPengampuNama: 'Theresia Maria, S.Ag.' },
  { id: 'pah_hindu', kode: 'PAH', nama: 'Pendidikan Agama Hindu dan Budi Pekerti', kategori: 'Umum', kktp: 75, guruPengampuId: 'g-pah', guruPengampuNama: 'I Wayan Sudarma, S.Pd.H.' },
  { id: 'pab_buddha', kode: 'PAB', nama: 'Pendidikan Agama Buddha dan Budi Pekerti', kategori: 'Umum', kktp: 75, guruPengampuId: 'g-pab', guruPengampuNama: 'Bhante Saddhaviro, S.Ag.' },
  { id: 'pkn', kode: 'PPKN', nama: 'Pendidikan Pancasila', kategori: 'Umum', kktp: 75, guruPengampuId: 'g-pkn', guruPengampuNama: 'Dra. Endang Purwanti' },
  { id: 'bindo', kode: 'BINDO', nama: 'Bahasa Indonesia', kategori: 'Umum', kktp: 75, guruPengampuId: 'user-siti', guruPengampuNama: 'Siti Rahmawati, S.Pd.' },
  { id: 'mtk', kode: 'MTK', nama: 'Matematika', kategori: 'Umum', kktp: 72, guruPengampuId: 'user-budi', guruPengampuNama: 'Budi Santoso, M.Pd.' },
  { id: 'ipa', kode: 'IPA', nama: 'Ilmu Pengetahuan Alam (IPA)', kategori: 'Umum', kktp: 75, guruPengampuId: 'user-eko', guruPengampuNama: 'Eko Prasetyo, S.Pd.' },
  { id: 'ips', kode: 'IPS', nama: 'Ilmu Pengetahuan Sosial (IPS)', kategori: 'Umum', kktp: 75, guruPengampuId: 'g-ips', guruPengampuNama: 'Sukardi, S.Pd.' },
  { id: 'bing', kode: 'BING', nama: 'Bahasa Inggris', kategori: 'Umum', kktp: 73, guruPengampuId: 'g-bing', guruPengampuNama: 'Ratna Dewi, S.Pd.' },
  { id: 'pjok', kode: 'PJOK', nama: 'Pendidikan Jasmani, Olahraga, dan Kesehatan', kategori: 'Umum', kktp: 75, guruPengampuId: 'g-pjok', guruPengampuNama: 'Wahyu Triyono, S.Pd.' },
  { id: 'prakarya', kode: 'PRK', nama: 'Prakarya', kategori: 'Umum', kktp: 75, guruPengampuId: 'g-prakarya', guruPengampuNama: 'Lestari Handayani, S.Pd.' },
  { id: 'informatika', kode: 'INF', nama: 'Informatika', kategori: 'Umum', kktp: 75, guruPengampuId: 'g-inf', guruPengampuNama: 'Rian Hidayat, S.Kom.' },
  { id: 'mulok', kode: 'MULOK', nama: 'Bahasa & Aksara Lampung (Muatan Lokal)', kategori: 'Muatan Lokal', kktp: 75, guruPengampuId: 'g-mulok', guruPengampuNama: 'Nurhasanah, S.Pd.' }
];

export const initialLearningObjectives: TujuanPembelajaran[] = [
  // Matematika (mtk)
  { id: 'tp-mtk-1', subjectId: 'mtk', rombelId: 'all', kodeTP: 'TP 1', lingkupMateri: 'Bilangan Bulat dan Rasional', deskripsi: 'memahami operasi hitung bilangan bulat dan pecahan serta penerapannya dalam kehidupan nyata', semester: 'Ganjil' },
  { id: 'tp-mtk-2', subjectId: 'mtk', rombelId: 'all', kodeTP: 'TP 2', lingkupMateri: 'Bentuk Aljabar', deskripsi: 'menyederhanakan bentuk aljabar dan menggunakannya untuk memodelkan situasi matematika', semester: 'Ganjil' },
  { id: 'tp-mtk-3', subjectId: 'mtk', rombelId: 'all', kodeTP: 'TP 3', lingkupMateri: 'Persamaan & Pertidaksamaan Linier', deskripsi: 'menyelesaikan persamaan dan pertidaksamaan linier satu variabel dengan metode yang tepat', semester: 'Ganjil' },
  { id: 'tp-mtk-4', subjectId: 'mtk', rombelId: 'all', kodeTP: 'TP 4', lingkupMateri: 'Perbandingan', deskripsi: 'menganalisis masalah perbandingan senilai dan berbalik nilai dalam konteks kontekstual', semester: 'Ganjil' },

  // Bahasa Indonesia (bindo)
  { id: 'tp-bindo-1', subjectId: 'bindo', rombelId: 'all', kodeTP: 'TP 1', lingkupMateri: 'Teks Deskripsi', deskripsi: 'mengidentifikasi ide pokok dan menyusun teks deskripsi keindahan alam sekitar dengan santun', semester: 'Ganjil' },
  { id: 'tp-bindo-2', subjectId: 'bindo', rombelId: 'all', kodeTP: 'TP 2', lingkupMateri: 'Puisi Rakyat & Cerita Fantasi', deskripsi: 'mengapresiasi nilai moral dalam puisi rakyat dan mengeksplorasi imajinasi dalam cerita fantasi', semester: 'Ganjil' },
  { id: 'tp-bindo-3', subjectId: 'bindo', rombelId: 'all', kodeTP: 'TP 3', lingkupMateri: 'Teks Prosedur', deskripsi: 'mengevaluasi struktur dan menyusun langkah-langkah dalam teks prosedur secara sistematis', semester: 'Ganjil' },
  { id: 'tp-bindo-4', subjectId: 'bindo', rombelId: 'all', kodeTP: 'TP 4', lingkupMateri: 'Teks Berita', deskripsi: 'menganalisis unsur adiksimba dalam teks berita dan membedakan fakta dengan opini', semester: 'Ganjil' },

  // IPA
  { id: 'tp-ipa-1', subjectId: 'ipa', rombelId: 'all', kodeTP: 'TP 1', lingkupMateri: 'Hakikat Sains dan Pengukuran', deskripsi: 'merancang penyelidikan ilmiah sederhana dan mengukur besaran fisika dengan alat ukur standar', semester: 'Ganjil' },
  { id: 'tp-ipa-2', subjectId: 'ipa', rombelId: 'all', kodeTP: 'TP 2', lingkupMateri: 'Zat dan Perubahannya', deskripsi: 'mengidentifikasi wujud zat, kerapatan massa jenis, dan perubahan wujud fisika kimia', semester: 'Ganjil' },
  { id: 'tp-ipa-3', subjectId: 'ipa', rombelId: 'all', kodeTP: 'TP 3', lingkupMateri: 'Suhu, Kalor, dan Pemuaian', deskripsi: 'menjelaskan perpindahan kalor dan dampaknya terhadap perubahan suhu serta pemuaian benda', semester: 'Ganjil' },

  // PAI (Pendidikan Agama Islam)
  { id: 'tp-pai-1', subjectId: 'pai', rombelId: 'all', kodeTP: 'TP 1', lingkupMateri: 'Al-Qur\'an dan Hadis', deskripsi: 'membaca dan memahami pesan mulia Q.S. an-Nisa/4: 59 dan an-Nahl/16: 64 tentang ketaatan', semester: 'Ganjil' },
  { id: 'tp-pai-2', subjectId: 'pai', rombelId: 'all', kodeTP: 'TP 2', lingkupMateri: 'Akidah Islam', deskripsi: 'meneladani asmaul husna al-Alim, al-Khabir, as-Sami, dan al-Bashir dalam pergaulan sehari-hari', semester: 'Ganjil' },

  // Pendidikan Agama Kristen Protestan dan Budi Pekerti
  { id: 'tp-pak-1', subjectId: 'pak_kristen', rombelId: 'all', kodeTP: 'TP 1', lingkupMateri: 'Keteladanan Yesus Kristus & Kasih', deskripsi: 'meneladani karya penyelamatan dan kasih Allah melalui Yesus Kristus dalam kehidupan sehari-hari dengan sesama', semester: 'Ganjil' },
  { id: 'tp-pak-2', subjectId: 'pak_kristen', rombelId: 'all', kodeTP: 'TP 2', lingkupMateri: 'Nilai-Nilai Kristiani dalam Masyarakat', deskripsi: 'menerapkan nilai kejujuran, keadilan, dan perdamaian di lingkungan keluarga, sekolah, dan masyarakat', semester: 'Ganjil' },

  // Pendidikan Agama Katolik dan Budi Pekerti
  { id: 'tp-pkat-1', subjectId: 'pak_katolik', rombelId: 'all', kodeTP: 'TP 1', lingkupMateri: 'Pribadi Yesus Kristus & Gereja', deskripsi: 'memahami pribadi Yesus Kristus sebagai teladan hidup beriman dan peran Roh Kudus dalam kehidupan Gereja', semester: 'Ganjil' },
  { id: 'tp-pkat-2', subjectId: 'pak_katolik', rombelId: 'all', kodeTP: 'TP 2', lingkupMateri: 'Moral Hidup Menggereja', deskripsi: 'mewujudkan nilai-nilai Kerajaan Allah melalui kepedulian sosial, keadilan, dan kelestarian ciptaan', semester: 'Ganjil' },

  // Pendidikan Agama Hindu dan Budi Pekerti
  { id: 'tp-pah-1', subjectId: 'pah_hindu', rombelId: 'all', kodeTP: 'TP 1', lingkupMateri: 'Tri Hita Karana & Kitab Suci Weda', deskripsi: 'memahami ajaran Tri Hita Karana untuk keharmonisan hidup serta nilai ketuhanan dalam Kitab Suci Weda', semester: 'Ganjil' },
  { id: 'tp-pah-2', subjectId: 'pah_hindu', rombelId: 'all', kodeTP: 'TP 2', lingkupMateri: 'Panca Sradha & Susila Hindu', deskripsi: 'menerapkan ajaran Panca Sradha dan perilaku susila dalam interaksi sosial dan keagamaan sehari-hari', semester: 'Ganjil' },

  // Pendidikan Agama Buddha dan Budi Pekerti
  { id: 'tp-pab-1', subjectId: 'pab_buddha', rombelId: 'all', kodeTP: 'TP 1', lingkupMateri: 'Riwayat Buddha Gotama & Tri Ratna', deskripsi: 'meneladani perjuangan dan welas asih Buddha Gotama serta berlindung kepada Tri Ratna (Tiratana)', semester: 'Ganjil' },
  { id: 'tp-pab-2', subjectId: 'pab_buddha', rombelId: 'all', kodeTP: 'TP 2', lingkupMateri: 'Empat Kebenaran Mulia & Moralitas Sila', deskripsi: 'menerapkan Pancasila Buddhis dan Jalan Mulia Berunsur Delapan untuk mengembangkan kebajikan batin', semester: 'Ganjil' },

  // PPKn
  { id: 'tp-pkn-1', subjectId: 'pkn', rombelId: 'all', kodeTP: 'TP 1', lingkupMateri: 'Perumusan Pancasila', deskripsi: 'menganalisis kronologi dan komitmen para pendiri bangsa dalam merumuskan dasar negara Pancasila', semester: 'Ganjil' },
  { id: 'tp-pkn-2', subjectId: 'pkn', rombelId: 'all', kodeTP: 'TP 2', lingkupMateri: 'Norma dan UUD NRI 1945', deskripsi: 'menerapkan perilaku patuh terhadap norma hukum dan sosial di lingkungan sekolah dan masyarakat', semester: 'Ganjil' },

  // IPS
  { id: 'tp-ips-1', subjectId: 'ips', rombelId: 'all', kodeTP: 'TP 1', lingkupMateri: 'Keluarga Awal Kehidupan', deskripsi: 'memahami keberadaan diri dan silsilah keluarga serta interaksi sosial di lingkungan terdekat', semester: 'Ganjil' },
  { id: 'tp-ips-2', subjectId: 'ips', rombelId: 'all', kodeTP: 'TP 2', lingkupMateri: 'Keragaman Hayati & Letak Geografis', deskripsi: 'menganalisis pengaruh letak geografis dan iklim terhadap keanekaragaman flora dan fauna Indonesia', semester: 'Ganjil' },

  // Bahasa Inggris
  { id: 'tp-bing-1', subjectId: 'bing', rombelId: 'all', kodeTP: 'TP 1', lingkupMateri: 'About Me & Greetings', deskripsi: 'introduce oneself and others with correct pronunciation and courteous interpersonal expressions', semester: 'Ganjil' },
  { id: 'tp-bing-2', subjectId: 'bing', rombelId: 'all', kodeTP: 'TP 2', lingkupMateri: 'Culinary & Daily Activities', deskripsi: 'describe favorite food and daily routines using simple present tense and sensory vocabulary', semester: 'Ganjil' },

  // PJOK
  { id: 'tp-pjok-1', subjectId: 'pjok', rombelId: 'all', kodeTP: 'TP 1', lingkupMateri: 'Permainan Bola Besar', deskripsi: 'mempraktikkan gerak spesifik passing dan dribbling dalam permainan bola voli dan sepak bola', semester: 'Ganjil' },
  { id: 'tp-pjok-2', subjectId: 'pjok', rombelId: 'all', kodeTP: 'TP 2', lingkupMateri: 'Kebugaran Jasmani', deskripsi: 'menjelaskan dan mempraktikkan latihan daya tahan jantung dan kekuatan otot dengan bugar', semester: 'Ganjil' },

  // Prakarya (menggantikan Seni dan Budaya)
  { id: 'tp-prk-1', subjectId: 'prakarya', rombelId: 'all', kodeTP: 'TP 1', lingkupMateri: 'Pengolahan Pangan Khas Daerah', deskripsi: 'merancang dan mengolah bahan pangan nabati dan hewani khas daerah Lampung menjadi produk bernilai ekonomis', semester: 'Ganjil' },
  { id: 'tp-prk-2', subjectId: 'prakarya', rombelId: 'all', kodeTP: 'TP 2', lingkupMateri: 'Kerajinan Bahan Alam Nusantara', deskripsi: 'membuat produk kerajinan fungsional berbasis bahan alam lokal dengan prinsip estetika dan ergonomis', semester: 'Ganjil' },

  // Informatika
  { id: 'tp-inf-1', subjectId: 'inf', rombelId: 'all', kodeTP: 'TP 1', lingkupMateri: 'Berpikir Komputasional', deskripsi: 'menerapkan konsep dekomposisi dan pengenalan pola untuk menyelesaikan persoalan logis', semester: 'Ganjil' },
  { id: 'tp-inf-2', subjectId: 'inf', rombelId: 'all', kodeTP: 'TP 2', lingkupMateri: 'Teknologi Informasi & Komunikasi', deskripsi: 'mengoperasikan aplikasi pengolah kata dan lembar kerja untuk membuat laporan sederhana', semester: 'Ganjil' },

  // Mulok (Bahasa Lampung)
  { id: 'tp-mulok-1', subjectId: 'mulok', rombelId: 'all', kodeTP: 'TP 1', lingkupMateri: 'Aksara & Sastra Lampung', deskripsi: 'menulis dan membaca Aksara Lampung Had Lampung serta melafalkan sastra lisan Segata/Padih', semester: 'Ganjil' },
  { id: 'tp-mulok-2', subjectId: 'mulok', rombelId: 'all', kodeTP: 'TP 2', lingkupMateri: 'Unggah-ungguh Bahasa Lampung', deskripsi: 'menerapkan tata krama berbahasa Lampung dialek Menggala/Tulang Bawang dalam percakapan sopan', semester: 'Ganjil' }
];

export const initialStudents: Student[] = [
  // Kelas 7.1
  {
    id: 'std-1',
    nis: '24001',
    nisn: '0112456781',
    nama: 'Ahmad Dwi Pratama',
    jenisKelamin: 'L',
    rombelId: '7.1',
    tempatLahir: 'Tulang Bawang Barat',
    tanggalLahir: '14 Mei 2011',
    agama: 'Islam',
    namaAyah: 'Bambang Irawan',
    namaIbu: 'Sri Wahyuni',
    pekerjaanOrangTua: 'Wiraswasta',
    alamat: 'Tirta Kencana RT 03 RW 01, Tulang Bawang Tengah'
  },
  {
    id: 'std-2',
    nis: '24002',
    nisn: '0112456782',
    nama: 'Anisa Zahra Putri',
    jenisKelamin: 'P',
    rombelId: '7.1',
    tempatLahir: 'Panaragan',
    tanggalLahir: '22 Agustus 2011',
    agama: 'Islam',
    namaAyah: 'Kurniawan',
    namaIbu: 'Lilis Suryani',
    pekerjaanOrangTua: 'PNS',
    alamat: 'Kel. Panaragan Jaya RT 02 RW 02, Tulang Bawang Tengah'
  },
  {
    id: 'std-3',
    nis: '24003',
    nisn: '0112456783',
    nama: 'Bagas Saputra',
    jenisKelamin: 'L',
    rombelId: '7.1',
    tempatLahir: 'Mulya Asri',
    tanggalLahir: '09 Januari 2011',
    agama: 'Islam',
    namaAyah: 'Slamet Riyadi',
    namaIbu: 'Siti Aminah',
    pekerjaanOrangTua: 'Petani',
    alamat: 'Diyuk Mulya Asri RT 05, Tulang Bawang Tengah'
  },
  {
    id: 'std-4',
    nis: '24004',
    nisn: '0112456784',
    nama: 'Citra Lestari',
    jenisKelamin: 'P',
    rombelId: '7.1',
    tempatLahir: 'Menggala',
    tanggalLahir: '18 Oktober 2011',
    agama: 'Islam',
    namaAyah: 'Herman Susanto',
    namaIbu: 'Dewi Sartika',
    pekerjaanOrangTua: 'Pedagang',
    alamat: 'Jl. Poros Tirta Makmur No. 24, Tulang Bawang Tengah'
  },
  {
    id: 'std-5',
    nis: '24005',
    nisn: '0112456785',
    nama: 'Daffa Ibnu Ramadhan',
    jenisKelamin: 'L',
    rombelId: '7.1',
    tempatLahir: 'Bandar Lampung',
    tanggalLahir: '05 September 2011',
    agama: 'Islam',
    namaAyah: 'Ridwan Kamil',
    namaIbu: 'Nurjanah',
    pekerjaanOrangTua: 'Karyawan Swasta',
    alamat: 'Kagungan Ratu RT 01 RW 01, Tulang Bawang Udik'
  },
  {
    id: 'std-6',
    nis: '24006',
    nisn: '0112456786',
    nama: 'Fajar Nugroho',
    jenisKelamin: 'L',
    rombelId: '7.1',
    tempatLahir: 'Tulang Bawang Barat',
    tanggalLahir: '11 Februari 2011',
    agama: 'Islam',
    namaAyah: 'Supriyanto',
    namaIbu: 'Tri Astuti',
    pekerjaanOrangTua: 'Petani',
    alamat: 'Penumangan Baru RT 04 RW 02, Tulang Bawang Tengah'
  },
  {
    id: 'std-7',
    nis: '24007',
    nisn: '0112456787',
    nama: 'Gita Ayu Wulandari',
    jenisKelamin: 'P',
    rombelId: '7.1',
    tempatLahir: 'Kotabumi',
    tanggalLahir: '29 Juli 2011',
    agama: 'Islam',
    namaAyah: 'Agus Setiawan',
    namaIbu: 'Rina Marlina',
    pekerjaanOrangTua: 'Wiraswasta',
    alamat: 'Tirta Kencana RT 01 RW 01, Tulang Bawang Tengah'
  },
  {
    id: 'std-8',
    nis: '24008',
    nisn: '0112456788',
    nama: 'Hendra Wijaya',
    jenisKelamin: 'L',
    rombelId: '7.1',
    tempatLahir: 'Tubaba',
    tanggalLahir: '03 Desember 2010',
    agama: 'Islam',
    namaAyah: 'Mulyadi',
    namaIbu: 'Hartati',
    pekerjaanOrangTua: 'Buruh Bangunan',
    alamat: 'Bandar Dewa RT 02 RW 01, Tulang Bawang Tengah'
  },
  {
    id: 'std-9',
    nis: '24009',
    nisn: '0112456789',
    nama: 'Intan Permata Sari',
    jenisKelamin: 'P',
    rombelId: '7.1',
    tempatLahir: 'Panaragan Jaya',
    tanggalLahir: '12 Maret 2011',
    agama: 'Islam',
    namaAyah: 'Dedi Saputra',
    namaIbu: 'Maya Anggraini',
    pekerjaanOrangTua: 'Guru Honorer',
    alamat: 'Panaragan Jaya Indah RT 03, Tulang Bawang Tengah'
  },
  {
    id: 'std-10',
    nis: '24010',
    nisn: '0112456790',
    nama: 'Joko Wahyudi',
    jenisKelamin: 'L',
    rombelId: '7.1',
    tempatLahir: 'Tulang Bawang Barat',
    tanggalLahir: '17 Juni 2011',
    agama: 'Islam',
    namaAyah: 'Wahyudi Siswanto',
    namaIbu: 'Endang Sulastri',
    pekerjaanOrangTua: 'Petani Karet',
    alamat: 'Marga Kencana RT 06 RW 03, Tulang Bawang Udik'
  },

  // Kelas 7.2
  { id: 'std-72-1', nis: '24011', nisn: '0112456801', nama: 'Aditya Pratama', jenisKelamin: 'L', rombelId: '7.2', tempatLahir: 'Tubaba', tanggalLahir: '10 Januari 2011', agama: 'Islam', namaAyah: 'Pratama', namaIbu: 'Siti Maryam', pekerjaanOrangTua: 'Wiraswasta', alamat: 'Tirta Kencana RT 02' },
  { id: 'std-72-2', nis: '24012', nisn: '0112456802', nama: 'Bella Safitri', jenisKelamin: 'P', rombelId: '7.2', tempatLahir: 'Panaragan', tanggalLahir: '15 Februari 2011', agama: 'Islam', namaAyah: 'Safri', namaIbu: 'Nursiah', pekerjaanOrangTua: 'Petani', alamat: 'Panaragan Jaya RT 01' },
  { id: 'std-72-3', nis: '24013', nisn: '0112456803', nama: 'Candra Wijaya', jenisKelamin: 'L', rombelId: '7.2', tempatLahir: 'Mulya Kencana', tanggalLahir: '20 Maret 2011', agama: 'Islam', namaAyah: 'Wijaya', namaIbu: 'Rahayu', pekerjaanOrangTua: 'PNS', alamat: 'Mulya Kencana RT 04' },
  { id: 'std-72-4', nis: '24014', nisn: '0112456804', nama: 'Dina Marlina', jenisKelamin: 'P', rombelId: '7.2', tempatLahir: 'Menggala', tanggalLahir: '25 April 2011', agama: 'Islam', namaAyah: 'Marwan', namaIbu: 'Lindawati', pekerjaanOrangTua: 'Pedagang', alamat: 'Tirta Makmur RT 03' },
  { id: 'std-72-5', nis: '24015', nisn: '0112456805', nama: 'Erick Setiawan', jenisKelamin: 'L', rombelId: '7.2', tempatLahir: 'Tubaba', tanggalLahir: '30 Mei 2011', agama: 'Islam', namaAyah: 'Setiawan', namaIbu: 'Wartini', pekerjaanOrangTua: 'Petani', alamat: 'Karta Sari RT 02' },
  { id: 'std-72-6', nis: '24016', nisn: '0112456806', nama: 'Farah Nabila', jenisKelamin: 'P', rombelId: '7.2', tempatLahir: 'Bandar Lampung', tanggalLahir: '05 Juli 2011', agama: 'Islam', namaAyah: 'Hasan', namaIbu: 'Kalsum', pekerjaanOrangTua: 'Wiraswasta', alamat: 'Panaragan Jaya RT 03' },

  // Kelas 7.3
  { id: 'std-73-1', nis: '24021', nisn: '0112456811', nama: 'Galang Ramadhan', jenisKelamin: 'L', rombelId: '7.3', tempatLahir: 'Tubaba', tanggalLahir: '12 Juni 2011', agama: 'Islam', namaAyah: 'Ramadhan', namaIbu: 'Sumarni', pekerjaanOrangTua: 'Petani', alamat: 'Tirta Kencana RT 04' },
  { id: 'std-73-2', nis: '24022', nisn: '0112456812', nama: 'Hafizah Nurul', jenisKelamin: 'P', rombelId: '7.3', tempatLahir: 'Panaragan', tanggalLahir: '18 Juli 2011', agama: 'Islam', namaAyah: 'Nurjaman', namaIbu: 'Fatmawati', pekerjaanOrangTua: 'PNS', alamat: 'Panaragan Jaya RT 04' },
  { id: 'std-73-3', nis: '24023', nisn: '0112456813', nama: 'Irfan Maulana', jenisKelamin: 'L', rombelId: '7.3', tempatLahir: 'Tubaba', tanggalLahir: '24 Agustus 2011', agama: 'Islam', namaAyah: 'Maulana', namaIbu: 'Rustini', pekerjaanOrangTua: 'Wiraswasta', alamat: 'Mulya Asri RT 01' },
  { id: 'std-73-4', nis: '24024', nisn: '0112456814', nama: 'Julia Rahma', jenisKelamin: 'P', rombelId: '7.3', tempatLahir: 'Menggala', tanggalLahir: '30 September 2011', agama: 'Islam', namaAyah: 'Rahman', namaIbu: 'Juwita', pekerjaanOrangTua: 'Pedagang', alamat: 'Tirta Makmur RT 01' },
  { id: 'std-73-5', nis: '24025', nisn: '0112456815', nama: 'Kevin Ardiansyah', jenisKelamin: 'L', rombelId: '7.3', tempatLahir: 'Tubaba', tanggalLahir: '06 Oktober 2011', agama: 'Islam', namaAyah: 'Ardi', namaIbu: 'Sunarti', pekerjaanOrangTua: 'Buruh', alamat: 'Karta RT 02' },
  { id: 'std-73-6', nis: '24026', nisn: '0112456816', nama: 'Laras Wati', jenisKelamin: 'P', rombelId: '7.3', tempatLahir: 'Kotabumi', tanggalLahir: '11 November 2011', agama: 'Islam', namaAyah: 'Waryono', namaIbu: 'Sumiati', pekerjaanOrangTua: 'Petani', alamat: 'Penumangan RT 03' },

  // Kelas 7.4
  { id: 'std-74-1', nis: '24031', nisn: '0112456821', nama: 'M. Rizky Pratama', jenisKelamin: 'L', rombelId: '7.4', tempatLahir: 'Tubaba', tanggalLahir: '08 Maret 2011', agama: 'Islam', namaAyah: 'Rizal', namaIbu: 'Nuraini', pekerjaanOrangTua: 'Wiraswasta', alamat: 'Tirta Kencana RT 05' },
  { id: 'std-74-2', nis: '24032', nisn: '0112456822', nama: 'Nadya Syahrini', jenisKelamin: 'P', rombelId: '7.4', tempatLahir: 'Panaragan', tanggalLahir: '14 April 2011', agama: 'Islam', namaAyah: 'Syahril', namaIbu: 'Nurhaliza', pekerjaanOrangTua: 'PNS', alamat: 'Panaragan Jaya RT 05' },
  { id: 'std-74-3', nis: '24033', nisn: '0112456823', nama: 'Oki Prasetya', jenisKelamin: 'L', rombelId: '7.4', tempatLahir: 'Tubaba', tanggalLahir: '21 Mei 2011', agama: 'Islam', namaAyah: 'Prasojo', namaIbu: 'Kartika', pekerjaanOrangTua: 'Petani', alamat: 'Mulya Asri RT 03' },
  { id: 'std-74-4', nis: '24034', nisn: '0112456824', nama: 'Putri Anggraini', jenisKelamin: 'P', rombelId: '7.4', tempatLahir: 'Kotabumi', tanggalLahir: '27 Juni 2011', agama: 'Islam', namaAyah: 'Anggoro', namaIbu: 'Lestari', pekerjaanOrangTua: 'Pedagang', alamat: 'Kagungan Ratu RT 02' },
  { id: 'std-74-5', nis: '24035', nisn: '0112456825', nama: 'Qori Aulia', jenisKelamin: 'P', rombelId: '7.4', tempatLahir: 'Bandar Lampung', tanggalLahir: '15 Agustus 2011', agama: 'Islam', namaAyah: 'Mansur', namaIbu: 'Qomariyah', pekerjaanOrangTua: 'Wiraswasta', alamat: 'Panaragan Jaya RT 06' },
  { id: 'std-74-6', nis: '24036', nisn: '0112456826', nama: 'Rendi Saputra', jenisKelamin: 'L', rombelId: '7.4', tempatLahir: 'Tubaba', tanggalLahir: '20 September 2011', agama: 'Islam', namaAyah: 'Saptono', namaIbu: 'Sri Rejeki', pekerjaanOrangTua: 'Petani', alamat: 'Penumangan RT 01' },

  // Kelas 8.1
  { id: 'std-81-1', nis: '23001', nisn: '0102456701', nama: 'Satria Danu', jenisKelamin: 'L', rombelId: '8.1', tempatLahir: 'Tubaba', tanggalLahir: '04 Februari 2010', agama: 'Islam', namaAyah: 'Danu', namaIbu: 'Sari', pekerjaanOrangTua: 'Petani', alamat: 'Tirta Kencana RT 01' },
  { id: 'std-81-2', nis: '23002', nisn: '0102456702', nama: 'Tia Lestari', jenisKelamin: 'P', rombelId: '8.1', tempatLahir: 'Panaragan', tanggalLahir: '19 Maret 2010', agama: 'Islam', namaAyah: 'Lestiyono', namaIbu: 'Warni', pekerjaanOrangTua: 'PNS', alamat: 'Panaragan RT 02' },
  { id: 'std-81-3', nis: '23003', nisn: '0102456703', nama: 'Umar Faruq', jenisKelamin: 'L', rombelId: '8.1', tempatLahir: 'Tubaba', tanggalLahir: '25 April 2010', agama: 'Islam', namaAyah: 'Faruq', namaIbu: 'Aisyah', pekerjaanOrangTua: 'Wiraswasta', alamat: 'Mulya Kencana RT 01' },
  { id: 'std-81-4', nis: '23004', nisn: '0102456704', nama: 'Vina Melati', jenisKelamin: 'P', rombelId: '8.1', tempatLahir: 'Menggala', tanggalLahir: '11 Mei 2010', agama: 'Islam', namaAyah: 'Melatno', namaIbu: 'Surati', pekerjaanOrangTua: 'Petani', alamat: 'Tirta Makmur RT 02' },
  { id: 'std-81-5', nis: '23005', nisn: '0102456705', nama: 'Wahyu Hidayat', jenisKelamin: 'L', rombelId: '8.1', tempatLahir: 'Kotabumi', tanggalLahir: '16 Juni 2010', agama: 'Islam', namaAyah: 'Hidayat', namaIbu: 'Ratnawati', pekerjaanOrangTua: 'Pedagang', alamat: 'Karta Sari RT 03' },
  { id: 'std-81-6', nis: '23006', nisn: '0102456706', nama: 'Yulia Safitri', jenisKelamin: 'P', rombelId: '8.1', tempatLahir: 'Tubaba', tanggalLahir: '22 Juli 2010', agama: 'Islam', namaAyah: 'Safri', namaIbu: 'Yuliana', pekerjaanOrangTua: 'Buruh', alamat: 'Bandar Dewa RT 01' },

  // Kelas 8.2
  { id: 'std-82-1', nis: '23011', nisn: '0102456711', nama: 'Aldi Kurniawan', jenisKelamin: 'L', rombelId: '8.2', tempatLahir: 'Tubaba', tanggalLahir: '09 Januari 2010', agama: 'Islam', namaAyah: 'Kurnia', namaIbu: 'Sumirah', pekerjaanOrangTua: 'Petani', alamat: 'Tirta Kencana RT 03' },
  { id: 'std-82-2', nis: '23012', nisn: '0102456712', nama: 'Bunga Citra', jenisKelamin: 'P', rombelId: '8.2', tempatLahir: 'Panaragan', tanggalLahir: '14 Februari 2010', agama: 'Islam', namaAyah: 'Citro', namaIbu: 'Endah', pekerjaanOrangTua: 'PNS', alamat: 'Panaragan Jaya RT 01' },
  { id: 'std-82-3', nis: '23013', nisn: '0102456713', nama: 'Dedi Hermawan', jenisKelamin: 'L', rombelId: '8.2', tempatLahir: 'Tubaba', tanggalLahir: '20 Maret 2010', agama: 'Islam', namaAyah: 'Hermawan', namaIbu: 'Rostina', pekerjaanOrangTua: 'Wiraswasta', alamat: 'Mulya Asri RT 04' },
  { id: 'std-82-4', nis: '23014', nisn: '0102456714', nama: 'Eva Susanti', jenisKelamin: 'P', rombelId: '8.2', tempatLahir: 'Kotabumi', tanggalLahir: '26 April 2010', agama: 'Islam', namaAyah: 'Susanto', namaIbu: 'Karyati', pekerjaanOrangTua: 'Pedagang', alamat: 'Kagungan Ratu RT 03' },
  { id: 'std-82-5', nis: '23015', nisn: '0102456715', nama: 'Fadlan Mubarok', jenisKelamin: 'L', rombelId: '8.2', tempatLahir: 'Tubaba', tanggalLahir: '02 Mei 2010', agama: 'Islam', namaAyah: 'Mubarok', namaIbu: 'Halimah', pekerjaanOrangTua: 'Petani', alamat: 'Penumangan RT 02' },
  { id: 'std-82-6', nis: '23016', nisn: '0102456716', nama: 'Ghea Amanda', jenisKelamin: 'P', rombelId: '8.2', tempatLahir: 'Bandar Lampung', tanggalLahir: '07 Juni 2010', agama: 'Islam', namaAyah: 'Amanda', namaIbu: 'Gartini', pekerjaanOrangTua: 'Wiraswasta', alamat: 'Tirta Makmur RT 04' },

  // Kelas 8.3
  { id: 'std-83-1', nis: '23021', nisn: '0102456721', nama: 'Haris Munandar', jenisKelamin: 'L', rombelId: '8.3', tempatLahir: 'Tubaba', tanggalLahir: '13 Juli 2010', agama: 'Islam', namaAyah: 'Munandar', namaIbu: 'Harmi', pekerjaanOrangTua: 'Petani', alamat: 'Tirta Kencana RT 06' },
  { id: 'std-83-2', nis: '23022', nisn: '0102456722', nama: 'Intan Cahyani', jenisKelamin: 'P', rombelId: '8.3', tempatLahir: 'Panaragan', tanggalLahir: '18 Agustus 2010', agama: 'Islam', namaAyah: 'Cahyono', namaIbu: 'Mursiti', pekerjaanOrangTua: 'PNS', alamat: 'Panaragan RT 03' },
  { id: 'std-83-3', nis: '23023', nisn: '0102456723', nama: 'Jihan Fahira', jenisKelamin: 'P', rombelId: '8.3', tempatLahir: 'Tubaba', tanggalLahir: '24 September 2010', agama: 'Islam', namaAyah: 'Fahri', namaIbu: 'Jamilah', pekerjaanOrangTua: 'Wiraswasta', alamat: 'Mulya Asri RT 02' },
  { id: 'std-83-4', nis: '23024', nisn: '0102456724', nama: 'Kiki Fatmala', jenisKelamin: 'P', rombelId: '8.3', tempatLahir: 'Menggala', tanggalLahir: '30 Oktober 2010', agama: 'Islam', namaAyah: 'Fathur', namaIbu: 'Kustini', pekerjaanOrangTua: 'Pedagang', alamat: 'Tirta Makmur RT 05' },
  { id: 'std-83-5', nis: '23025', nisn: '0102456725', nama: 'Lukman Hakim', jenisKelamin: 'L', rombelId: '8.3', tempatLahir: 'Tubaba', tanggalLahir: '05 November 2010', agama: 'Islam', namaAyah: 'Hakim', namaIbu: 'Lilis', pekerjaanOrangTua: 'Petani', alamat: 'Karta Sari RT 01' },
  { id: 'std-83-6', nis: '23026', nisn: '0102456726', nama: 'Mega Utami', jenisKelamin: 'P', rombelId: '8.3', tempatLahir: 'Kotabumi', tanggalLahir: '10 Desember 2010', agama: 'Islam', namaAyah: 'Utomo', namaIbu: 'Megawati', pekerjaanOrangTua: 'Buruh', alamat: 'Bandar Dewa RT 02' },

  // Kelas 8.4
  { id: 'std-84-1', nis: '23031', nisn: '0102456731', nama: 'Nabil Makarim', jenisKelamin: 'L', rombelId: '8.4', tempatLahir: 'Tubaba', tanggalLahir: '03 Januari 2010', agama: 'Islam', namaAyah: 'Makarim', namaIbu: 'Nabila', pekerjaanOrangTua: 'Petani', alamat: 'Tirta Kencana RT 02' },
  { id: 'std-84-2', nis: '23032', nisn: '0102456732', nama: 'Olivia Salsabila', jenisKelamin: 'P', rombelId: '8.4', tempatLahir: 'Panaragan', tanggalLahir: '08 Februari 2010', agama: 'Islam', namaAyah: 'Sobirin', namaIbu: 'Oktavia', pekerjaanOrangTua: 'PNS', alamat: 'Panaragan Jaya RT 04' },
  { id: 'std-84-3', nis: '23033', nisn: '0102456733', nama: 'Pandu Dewanata', jenisKelamin: 'L', rombelId: '8.4', tempatLahir: 'Tubaba', tanggalLahir: '14 Maret 2010', agama: 'Islam', namaAyah: 'Dewanata', namaIbu: 'Pariem', pekerjaanOrangTua: 'Wiraswasta', alamat: 'Mulya Kencana RT 03' },
  { id: 'std-84-4', nis: '23034', nisn: '0102456734', nama: 'Rani Maharani', jenisKelamin: 'P', rombelId: '8.4', tempatLahir: 'Menggala', tanggalLahir: '20 April 2010', agama: 'Islam', namaAyah: 'Mahardika', namaIbu: 'Ranita', pekerjaanOrangTua: 'Pedagang', alamat: 'Tirta Makmur RT 02' },
  { id: 'std-84-5', nis: '23035', nisn: '0102456735', nama: 'Surya Kencana', jenisKelamin: 'L', rombelId: '8.4', tempatLahir: 'Tubaba', tanggalLahir: '26 Mei 2010', agama: 'Islam', namaAyah: 'Suryanto', namaIbu: 'Kencanasari', pekerjaanOrangTua: 'Petani', alamat: 'Karta RT 01' },
  { id: 'std-84-6', nis: '23036', nisn: '0102456736', nama: 'Tari Anggun', jenisKelamin: 'P', rombelId: '8.4', tempatLahir: 'Bandar Lampung', tanggalLahir: '01 Juli 2010', agama: 'Islam', namaAyah: 'Anggoro', namaIbu: 'Tarmini', pekerjaanOrangTua: 'Wiraswasta', alamat: 'Panaragan RT 05' },

  // Kelas 9.1
  { id: 'std-91-1', nis: '22001', nisn: '0092456601', nama: 'Alif Bahtiar', jenisKelamin: 'L', rombelId: '9.1', tempatLahir: 'Tubaba', tanggalLahir: '12 Januari 2009', agama: 'Islam', namaAyah: 'Bahtiar', namaIbu: 'Alifah', pekerjaanOrangTua: 'Petani', alamat: 'Tirta Kencana RT 01' },
  { id: 'std-91-2', nis: '22002', nisn: '0092456602', nama: 'Berlian Ananda', jenisKelamin: 'P', rombelId: '9.1', tempatLahir: 'Panaragan', tanggalLahir: '17 Februari 2009', agama: 'Islam', namaAyah: 'Anandito', namaIbu: 'Berliana', pekerjaanOrangTua: 'PNS', alamat: 'Panaragan Jaya RT 02' },
  { id: 'std-91-3', nis: '22003', nisn: '0092456603', nama: 'Chandra Kirana', jenisKelamin: 'L', rombelId: '9.1', tempatLahir: 'Tubaba', tanggalLahir: '23 Maret 2009', agama: 'Islam', namaAyah: 'Kiran', namaIbu: 'Chandrawati', pekerjaanOrangTua: 'Wiraswasta', alamat: 'Mulya Asri RT 01' },
  { id: 'std-91-4', nis: '22004', nisn: '0092456604', nama: 'Dimas Prayoga', jenisKelamin: 'L', rombelId: '9.1', tempatLahir: 'Menggala', tanggalLahir: '29 April 2009', agama: 'Islam', namaAyah: 'Prayogo', namaIbu: 'Dimasti', pekerjaanOrangTua: 'Pedagang', alamat: 'Tirta Makmur RT 03' },
  { id: 'std-91-5', nis: '22005', nisn: '0092456605', nama: 'Elsa Novitasari', jenisKelamin: 'P', rombelId: '9.1', tempatLahir: 'Tubaba', tanggalLahir: '05 Mei 2009', agama: 'Islam', namaAyah: 'Novri', namaIbu: 'Elsiana', pekerjaanOrangTua: 'Petani', alamat: 'Karta Sari RT 02' },
  { id: 'std-91-6', nis: '22006', nisn: '0092456606', nama: 'Fahri Ramadhan', jenisKelamin: 'L', rombelId: '9.1', tempatLahir: 'Kotabumi', tanggalLahir: '10 Juni 2009', agama: 'Islam', namaAyah: 'Ramadhani', namaIbu: 'Fahrina', pekerjaanOrangTua: 'Buruh', alamat: 'Bandar Dewa RT 03' },

  // Kelas 9.2
  { id: 'std-92-1', nis: '22011', nisn: '0092456611', nama: 'Gilang Dirga', jenisKelamin: 'L', rombelId: '9.2', tempatLahir: 'Tubaba', tanggalLahir: '07 Juli 2009', agama: 'Islam', namaAyah: 'Dirgantara', namaIbu: 'Gilarwati', pekerjaanOrangTua: 'Petani', alamat: 'Tirta Kencana RT 04' },
  { id: 'std-92-2', nis: '22012', nisn: '0092456612', nama: 'Hany Puspita', jenisKelamin: 'P', rombelId: '9.2', tempatLahir: 'Panaragan', tanggalLahir: '13 Agustus 2009', agama: 'Islam', namaAyah: 'Puspowo', namaIbu: 'Hanyarti', pekerjaanOrangTua: 'PNS', alamat: 'Panaragan RT 04' },
  { id: 'std-92-3', nis: '22013', nisn: '0092456613', nama: 'Ilham Saputra', jenisKelamin: 'L', rombelId: '9.2', tempatLahir: 'Tubaba', tanggalLahir: '19 September 2009', agama: 'Islam', namaAyah: 'Saputro', namaIbu: 'Ilhamia', pekerjaanOrangTua: 'Wiraswasta', alamat: 'Mulya Kencana RT 02' },
  { id: 'std-92-4', nis: '22014', nisn: '0092456614', nama: 'Jasmine Azzahra', jenisKelamin: 'P', rombelId: '9.2', tempatLahir: 'Bandar Lampung', tanggalLahir: '25 Oktober 2009', agama: 'Islam', namaAyah: 'Zahrani', namaIbu: 'Jasmini', pekerjaanOrangTua: 'Pedagang', alamat: 'Tirta Makmur RT 01' },
  { id: 'std-92-5', nis: '22015', nisn: '0092456615', nama: 'Kemas Farhan', jenisKelamin: 'L', rombelId: '9.2', tempatLahir: 'Tubaba', tanggalLahir: '30 November 2009', agama: 'Islam', namaAyah: 'Farhani', namaIbu: 'Kemasari', pekerjaanOrangTua: 'Petani', alamat: 'Karta RT 03' },
  { id: 'std-92-6', nis: '22016', nisn: '0092456616', nama: 'Lina Marlina', jenisKelamin: 'P', rombelId: '9.2', tempatLahir: 'Kotabumi', tanggalLahir: '06 Desember 2009', agama: 'Islam', namaAyah: 'Marlino', namaIbu: 'Linawati', pekerjaanOrangTua: 'Wiraswasta', alamat: 'Panaragan Jaya RT 03' },

  // Kelas 9.3
  { id: 'std-93-1', nis: '22021', nisn: '0092456621', nama: 'Maulana Malik', jenisKelamin: 'L', rombelId: '9.3', tempatLahir: 'Tubaba', tanggalLahir: '15 Januari 2009', agama: 'Islam', namaAyah: 'Maliki', namaIbu: 'Maulani', pekerjaanOrangTua: 'Petani', alamat: 'Tirta Kencana RT 05' },
  { id: 'std-93-2', nis: '22022', nisn: '0092456622', nama: 'Nabila Syakieb', jenisKelamin: 'P', rombelId: '9.3', tempatLahir: 'Panaragan', tanggalLahir: '21 Februari 2009', agama: 'Islam', namaAyah: 'Syakib', namaIbu: 'Nabilawati', pekerjaanOrangTua: 'PNS', alamat: 'Panaragan RT 01' },
  { id: 'std-93-3', nis: '22023', nisn: '0092456623', nama: 'Oscar Zidan', jenisKelamin: 'L', rombelId: '9.3', tempatLahir: 'Tubaba', tanggalLahir: '27 Maret 2009', agama: 'Islam', namaAyah: 'Zidane', namaIbu: 'Oscaria', pekerjaanOrangTua: 'Wiraswasta', alamat: 'Mulya Asri RT 03' },
  { id: 'std-93-4', nis: '22024', nisn: '0092456624', nama: 'Pradipta Arya', jenisKelamin: 'L', rombelId: '9.3', tempatLahir: 'Menggala', tanggalLahir: '02 April 2009', agama: 'Islam', namaAyah: 'Aryanto', namaIbu: 'Pradipti', pekerjaanOrangTua: 'Pedagang', alamat: 'Tirta Makmur RT 04' },
  { id: 'std-93-5', nis: '22025', nisn: '0092456625', nama: 'Rifki Fauzan', jenisKelamin: 'L', rombelId: '9.3', tempatLahir: 'Tubaba', tanggalLahir: '08 Mei 2009', agama: 'Islam', namaAyah: 'Fauzani', namaIbu: 'Rifkiana', pekerjaanOrangTua: 'Petani', alamat: 'Karta Sari RT 01' },
  { id: 'std-93-6', nis: '22026', nisn: '0092456626', nama: 'Salsa Bila', jenisKelamin: 'P', rombelId: '9.3', tempatLahir: 'Bandar Lampung', tanggalLahir: '14 Juni 2009', agama: 'Islam', namaAyah: 'Bilah', namaIbu: 'Salsina', pekerjaanOrangTua: 'Buruh', alamat: 'Bandar Dewa RT 01' },

  // Kelas 9.4
  { id: 'std-94-1', nis: '22031', nisn: '0092456631', nama: 'Taufik Hidayat', jenisKelamin: 'L', rombelId: '9.4', tempatLahir: 'Tubaba', tanggalLahir: '11 Juli 2009', agama: 'Islam', namaAyah: 'Hidayanto', namaIbu: 'Taufiqah', pekerjaanOrangTua: 'Petani', alamat: 'Tirta Kencana RT 02' },
  { id: 'std-94-2', nis: '22032', nisn: '0092456632', nama: 'Ulfah Rahmawati', jenisKelamin: 'P', rombelId: '9.4', tempatLahir: 'Panaragan', tanggalLahir: '16 Agustus 2009', agama: 'Islam', namaAyah: 'Rahmanto', namaIbu: 'Ulfiani', pekerjaanOrangTua: 'PNS', alamat: 'Panaragan Jaya RT 05' },
  { id: 'std-94-3', nis: '22033', nisn: '0092456633', nama: 'Vicky Prasetyo', jenisKelamin: 'L', rombelId: '9.4', tempatLahir: 'Tubaba', tanggalLahir: '22 September 2009', agama: 'Islam', namaAyah: 'Prasetyono', namaIbu: 'Vickina', pekerjaanOrangTua: 'Wiraswasta', alamat: 'Mulya Kencana RT 04' },
  { id: 'std-94-4', nis: '22034', nisn: '0092456634', nama: 'Winda Amelia', jenisKelamin: 'P', rombelId: '9.4', tempatLahir: 'Menggala', tanggalLahir: '28 Oktober 2009', agama: 'Islam', namaAyah: 'Amelius', namaIbu: 'Windawati', pekerjaanOrangTua: 'Pedagang', alamat: 'Tirta Makmur RT 02' },
  { id: 'std-94-5', nis: '22035', nisn: '0092456635', nama: 'Yoga Pratama', jenisKelamin: 'L', rombelId: '9.4', tempatLahir: 'Tubaba', tanggalLahir: '03 November 2009', agama: 'Islam', namaAyah: 'Pratanto', namaIbu: 'Yogiani', pekerjaanOrangTua: 'Petani', alamat: 'Karta RT 02' },
  { id: 'std-94-6', nis: '22036', nisn: '0092456636', nama: 'Zahra Amelia', jenisKelamin: 'P', rombelId: '9.4', tempatLahir: 'Kotabumi', tanggalLahir: '09 Desember 2009', agama: 'Islam', namaAyah: 'Ameliano', namaIbu: 'Zahrina', pekerjaanOrangTua: 'Wiraswasta', alamat: 'Penumangan RT 04' }
];

export const initialExtracurriculars: Extracurricular[] = [
  { id: 'ek-osis', nama: 'OSIS', pembina: 'Siti Rahmawati, S.Pd.' },
  { id: 'ek-pramuka', nama: 'Pramuka', pembina: 'Eko Prasetyo, S.Pd.' },
  { id: 'ek-rohis', nama: 'Rohis', pembina: 'Nurul Hidayah, S.Pd.' },
  { id: 'ek-uks', nama: 'UKS', pembina: 'Wahyu Triyono, S.Pd.' },
  { id: 'ek-tari', nama: 'Seni Tari', pembina: 'Dewi Sartika, S.Pd.' },
  { id: 'ek-olahraga', nama: 'Olah Raga', pembina: 'Budi Santoso, M.Pd.' }
];

export const initialStudentExtracurriculars: StudentExtracurricular[] = [
  { id: 'se-1', studentId: 'std-1', rombelId: '7.1', ekskulId: 'ek-pramuka', predikat: 'Sangat Baik', keterangan: 'Aktif sebagai pemimpin regu dan terampil dalam pioneering serta semaphore.' },
  { id: 'se-2', studentId: 'std-1', rombelId: '7.1', ekskulId: 'ek-olahraga', predikat: 'Baik', keterangan: 'Menunjukkan stamina dan sportivitas yang baik dalam latihan futsal dan atletik.' },
  { id: 'se-3', studentId: 'std-2', rombelId: '7.1', ekskulId: 'ek-osis', predikat: 'Sangat Baik', keterangan: 'Sangat aktif, berinisiatif tinggi, dan bertanggung jawab dalam kepengurusan OSIS serta kegiatan kesiswaan.' },
  { id: 'se-4', studentId: 'std-2', rombelId: '7.1', ekskulId: 'ek-tari', predikat: 'Sangat Baik', keterangan: 'Menguasai gerak dasar tari Cangget dan Tari Sigeh Penguten dengan luwes dan elok.' },
  { id: 'se-5', studentId: 'std-3', rombelId: '7.1', ekskulId: 'ek-pramuka', predikat: 'Baik', keterangan: 'Disiplin hadir dalam setiap latihan kepramukaan dan perkemahan sabtu-minggu.' },
  { id: 'se-6', studentId: 'std-4', rombelId: '7.1', ekskulId: 'ek-uks', predikat: 'Sangat Baik', keterangan: 'Terampil melakukan pertolongan pertama (P3K) dan aktif dalam program kesehatan sekolah.' },
  { id: 'se-7', studentId: 'std-5', rombelId: '7.1', ekskulId: 'ek-rohis', predikat: 'Sangat Baik', keterangan: 'Sangat istiqomah dalam pembiasaan ibadah sholat berjamaah dan aktif dalam tadarus Al-Qur\'an.' },
  { id: 'se-8', studentId: 'std-7', rombelId: '7.1', ekskulId: 'ek-tari', predikat: 'Sangat Baik', keterangan: 'Hapal formasi dan ragam gerak tari kreasi Lampung serta mewakili sekolah dalam festival seni.' },
  { id: 'se-9', studentId: 'std-9', rombelId: '7.1', ekskulId: 'ek-uks', predikat: 'Baik', keterangan: 'Cekatan membantu teman yang sakit dan tertib menjaga kebersihan ruang UKS.' },
  { id: 'se-10', studentId: 'std-10', rombelId: '7.1', ekskulId: 'ek-olahraga', predikat: 'Baik', keterangan: 'Berperan baik sebagai penjaga gawang tim futsal dan disiplin mengikuti latihan fisik.' }
];

export const initialAttendances: StudentAttendance[] = initialStudents.map((s, idx) => ({
  studentId: s.id,
  rombelId: s.rombelId,
  sakit: idx % 4 === 0 ? 1 : (idx % 7 === 0 ? 2 : 0),
  izin: idx % 5 === 0 ? 1 : 0,
  alpa: idx % 9 === 0 ? 1 : 0
}));

export const initialNotes: StudentNote[] = initialStudents.map((s, idx) => ({
  studentId: s.id,
  rombelId: s.rombelId,
  catatan: idx % 3 === 0
    ? 'Pertahankan prestasi belajar dan kepemimpinan yang baik di kelas. Tingkatkan terus minat baca dan literasi teknologi.'
    : idx % 3 === 1
      ? 'Ananda memiliki bakat komunikasi dan sikap sosial yang sangat menonjol. Tetap santun dan rajin belajar.'
      : 'Semangat belajar sangat baik, aktif berpartisipasi dalam diskusi kelompok serta selalu menyelesaikan tugas dengan disiplin.',
  statusKenaikan: 'Memenuhi Kriteria Ketuntasan Belajar'
}));

export const initialAchievements: StudentAchievement[] = [
  {
    id: 'ach-1',
    studentId: 'std-2',
    rombelId: '7.1',
    bidang: 'Non-Akademik',
    prestasi: 'Juara 1 Lomba Tari Kreasi Daerah Tradisional Lampung Tingkat SMP',
    tingkat: 'Kabupaten',
    keterangan: 'Pekan Seni & Kebudayaan Kabupaten Tulang Bawang Barat Tahun 2024'
  },
  {
    id: 'ach-2',
    studentId: 'std-5',
    rombelId: '7.1',
    bidang: 'Akademik',
    prestasi: 'Juara 2 Olimpiade Sains Nasional (OSN) Bidang Matematika',
    tingkat: 'Kabupaten',
    keterangan: 'Seleksi OSN Tingkat Kabupaten Tulang Bawang Barat'
  },
  {
    id: 'ach-3',
    studentId: 'std-1',
    rombelId: '7.1',
    bidang: 'Non-Akademik',
    prestasi: 'Juara 2 Lomba Pionering Putra Jambore Ranting Pramuka',
    tingkat: 'Kecamatan',
    keterangan: 'Kwarran Tulang Bawang Tengah'
  }
];

// Helper to generate realistic grades across all 11 subjects for 10 students
export const generateInitialGrades = (): StudentGrade[] => {
  const baseStudentPerformances: Record<string, number> = {
    'std-1': 86, // Ahmad Dwi Pratama
    'std-2': 91, // Anisa Zahra Putri (Juara 1)
    'std-3': 76, // Bagas Saputra
    'std-4': 89, // Citra Lestari (Juara 2)
    'std-5': 92, // Daffa Ibnu Ramadhan (Juara umum matematika)
    'std-6': 73, // Fajar Nugroho (perlu bimbingan)
    'std-7': 87, // Gita Ayu Wulandari
    'std-8': 71, // Hendra Wijaya (butuh remedial)
    'std-9': 84, // Intan Permata Sari
    'std-10': 78 // Joko Wahyudi
  };

  const grades: StudentGrade[] = [];

  const subjectDescriptions: Record<string, { high: string; low: string }> = {
    pai: {
      high: 'Menunjukkan penguasaan yang sangat baik dalam memahami pesan mulia Q.S. an-Nisa: 59 serta meneladani asmaul husna dalam kehidupan sehari-hari.',
      low: 'Perlu peningkatan dan pendampingan dalam membaca ayat Al-Qur\'an dengan kaidah tajwid yang benar.'
    },
    pkn: {
      high: 'Menunjukkan penguasaan yang sangat baik dalam menganalisis kronologi perumusan Pancasila dan ketaatan terhadap norma sosial.',
      low: 'Perlu bimbingan dalam menyajikan contoh nyata pengamalan sila-sila Pancasila dalam pergaulan sekolah.'
    },
    bindo: {
      high: 'Menunjukkan penguasaan yang sangat baik dalam menulis teks deskripsi keindahan alam sekitar dan mengapresiasi nilai moral puisi rakyat.',
      low: 'Perlu bimbingan dalam membedakan fakta dan opini pada analisis teks berita serta penggunaan konjungsi yang tepat.'
    },
    mtk: {
      high: 'Menunjukkan penguasaan yang sangat baik dalam operasi hitung bilangan rasional dan menyederhanakan bentuk aljabar kompleks.',
      low: 'Perlu pendampingan dan bimbingan dalam menyelesaikan soal cerita persamaan dan pertidaksamaan linier satu variabel.'
    },
    ipa: {
      high: 'Menunjukkan penguasaan yang sangat baik dalam merancang penyelidikan ilmiah sederhana dan menganalisis perpindahan kalor.',
      low: 'Perlu bimbingan dalam membedakan kerapatan massa jenis benda dan konversi satuan suhu termometer.'
    },
    ips: {
      high: 'Menunjukkan penguasaan yang sangat baik dalam memahami silsilah keluarga serta pengaruh letak geografis Indonesia terhadap keragaman flora fauna.',
      low: 'Perlu bimbingan dalam menganalisis bentuk interaksi sosial disosiatif di lingkungan masyarakat.'
    },
    bing: {
      high: 'Demonstrates excellent capability in introducing oneself and others with polite expressions and describing daily routines clearly.',
      low: 'Needs guidance in utilizing simple present tense auxiliary verbs and enriching descriptive food vocabulary.'
    },
    pjok: {
      high: 'Menunjukkan penguasaan yang sangat baik dalam teknik gerak spesifik passing bola voli serta menjaga kebugaran jasmani.',
      low: 'Perlu latihan berulang dalam mengontrol bola saat melakukan dribbling sepak bola.'
    },
    pak_kristen: {
      high: 'Menunjukkan penguasaan yang sangat baik dalam meneladani kasih Kristus dan menerapkan nilai kejujuran serta perdamaian.',
      low: 'Perlu bimbingan dalam merefleksikan nilai-nilai Kristiani dalam kehidupan bermasyarakat.'
    },
    pak_katolik: {
      high: 'Menunjukkan penguasaan yang sangat baik dalam memahami pribadi Yesus Kristus dan mewujudkan kepedulian sosial menggereja.',
      low: 'Perlu bimbingan dalam mendalami sakramen dan keterlibatan aktif dalam hidup menggereja.'
    },
    pah_hindu: {
      high: 'Menunjukkan penguasaan yang sangat baik dalam ajaran Tri Hita Karana serta penerapan Panca Sradha dalam kehidupan bermasyarakat.',
      low: 'Perlu bimbingan dalam menghafal dan melafalkan sloka-sloka suci kitab suci Weda.'
    },
    pab_buddha: {
      high: 'Menunjukkan penguasaan yang sangat baik dalam meneladani welas asih Buddha Gotama dan pengamalan Pancasila Buddhis.',
      low: 'Perlu bimbingan dalam mempraktikkan meditasi kesadaran (bhavana) dan pemahaman Empat Kebenaran Mulia.'
    },
    prakarya: {
      high: 'Menunjukkan penguasaan yang sangat baik dalam merancang dan mengolah bahan pangan khas daerah Lampung serta menghasilkan kerajinan fungsional.',
      low: 'Perlu pendampingan dalam teknik pengemasan produk dan kerapian penyelesaian akhir (finishing) karya kerajinan.'
    },
    seni: {
      high: 'Menunjukkan penguasaan yang sangat baik dalam pembuatan karya inovatif dan bernilai fungsional.',
      low: 'Perlu bimbingan dalam teknik ketelitian dan kerapian finishing hasil karya.'
    },
    informatika: {
      high: 'Menunjukkan penguasaan yang sangat baik dalam menerapkan berpikir komputasional dekomposisi serta mengoperasikan lembar kerja.',
      low: 'Perlu bimbingan dalam menyusun formula aritmetika dasar pada aplikasi lembar kerja (spreadsheet).'
    },
    mulok: {
      high: 'Menunjukkan penguasaan yang sangat baik dalam membaca dan menulis Aksara Lampung Had Lampung serta melafalkan sastra lisan Segata.',
      low: 'Perlu pendampingan intensif dalam mengenali anak huruf (anak surat) aksara Lampung dan pelafalan intonasi dialek Tulang Bawang.'
    }
  };

  initialStudents.forEach((student) => {
    const baseScore = baseStudentPerformances[student.id] || 80;

    initialSubjects.forEach((subject) => {
      // Small variation per subject
      let modifier = 0;
      if (subject.id === 'mtk' && student.id === 'std-5') modifier = +6;
      if (subject.id === 'bindo' && student.id === 'std-2') modifier = +5;
      if ((subject.id === 'prakarya' || subject.id === 'seni') && (student.id === 'std-2' || student.id === 'std-7')) modifier = +6;
      if (subject.id === 'mulok' && student.id === 'std-7') modifier = +4;
      if (subject.id === 'pjok' && (student.id === 'std-1' || student.id === 'std-10')) modifier = +5;
      if (subject.id === 'mtk' && student.id === 'std-8') modifier = -4;

      const seedVariation = ((student.id.charCodeAt(4) || 3) * 7 + (subject.id.charCodeAt(0) || 5) * 3) % 9 - 4;
      const targetAvg = Math.min(98, Math.max(68, baseScore + modifier + seedVariation));

      const lm1 = Math.min(99, Math.max(65, targetAvg + 2));
      const lm2 = Math.min(99, Math.max(65, targetAvg - 1));
      const lm3 = Math.min(99, Math.max(65, targetAvg + 1));
      const lm4 = Math.min(99, Math.max(65, targetAvg - 2));

      const nilaiAkhirLM = Math.round((lm1 + lm2 + lm3 + lm4) / 4);
      
      // Sumatif Tengah Semester (STS) calculations (fokus TP 1 & TP 2)
      const nonTesSTS = Math.min(99, Math.max(65, targetAvg + 1));
      const tesSTS = Math.min(99, Math.max(65, targetAvg));
      const nilaiAkhirLM_STS = Math.round((lm1 + lm2) / 2);
      const nilaiAkhirSTS = Math.round((nilaiAkhirLM_STS * 0.6) + (((nonTesSTS + tesSTS) / 2) * 0.4));

      // Sumatif Akhir Semester (SAS) calculations
      const nonTesSAS = Math.min(99, Math.max(65, targetAvg + 1));
      const tesSAS = Math.min(99, Math.max(65, targetAvg - 1));
      const nilaiAkhirSAS = Math.round((nonTesSAS + tesSAS) / 2);

      // Kurikulum Merdeka Formula: 60% Sumatif LM + 40% SAS
      const nilaiAkhirRapor = Math.round((nilaiAkhirLM * 0.6) + (nilaiAkhirSAS * 0.4));

      const descInfo = subjectDescriptions[subject.id] || {
        high: 'Menunjukkan penguasaan materi yang memuaskan dan aktif selama pembelajaran.',
        low: 'Perlu bimbingan dan latihan mandiri lebih teratur.'
      };

      grades.push({
        id: `grade-${student.id}-${subject.id}`,
        studentId: student.id,
        subjectId: subject.id,
        rombelId: student.rombelId || '7.1',
        sumatifLM: {
          'tp-1': lm1,
          'tp-2': lm2,
          'tp-3': lm3,
          'tp-4': lm4
        },
        nilaiAkhirLM,
        nonTesSTS,
        tesSTS,
        nilaiAkhirSTS,
        deskripsiSTS: `Menunjukkan pemahaman yang baik pada lingkup materi tengah semester ${subject.nama}.`,
        nonTesSAS,
        tesSAS,
        nilaiAkhirSAS,
        nilaiAkhirRapor,
        deskripsiTertinggi: descInfo.high,
        deskripsiTerendah: nilaiAkhirRapor < subject.kktp ? descInfo.low : `Menunjukkan perkembangan yang baik dalam mencapai tujuan pembelajaran ${subject.nama}, pertahankan konsistensi belajar.`,
        statusKetercapaian: nilaiAkhirRapor >= subject.kktp ? 'Tercapai' : 'Perlu Peningkatan',
        updatedAt: '2024-12-18 10:30'
      });
    });
  });

  return grades;
};

export const initialGrades: StudentGrade[] = generateInitialGrades();

export const getInitialState = (): ERaporState => {
  const savedState = localStorage.getItem('erapor_smpn14tubaba_state');
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      if (parsed && parsed.students && parsed.grades) {
        // Ensure initial users have pembinaEkskul and tugasTambahan if they match initial users
        const updatedUsers = (parsed.users || initialUsers).map((u: any) => {
          const initU = initialUsers.find(iu => iu.id === u.id);
          if (initU && initU.pembinaEkskul && !u.pembinaEkskul) {
            return {
              ...u,
              pembinaEkskul: initU.pembinaEkskul,
              tugasTambahan: initU.tugasTambahan
            };
          }
          return u;
        });

        // Ensure all 12 wali kelas users are present
        const existingUserIds = new Set(updatedUsers.map((u: any) => u.id));
        initialUsers.forEach(iu => {
          if (!existingUserIds.has(iu.id)) {
            updatedUsers.push(iu);
          }
        });

        const activeUser = updatedUsers.find((u: any) => u.id === parsed.currentUser?.id) || updatedUsers[1];

        // Ensure standard 6 extracurriculars (OSIS, Pramuka, Rohis, UKS, Seni Tari, Olah Raga)
        const hasStandardEkskul = parsed.extracurriculars && parsed.extracurriculars.some((e: any) => e.id === 'ek-osis');
        const extracurriculars = hasStandardEkskul ? parsed.extracurriculars : initialExtracurriculars;
        const studentExtracurriculars = hasStandardEkskul ? (parsed.studentExtracurriculars || initialStudentExtracurriculars) : initialStudentExtracurriculars;

        // Migrate / sync subjects: update 'seni' -> 'prakarya' and include new religious subjects
        let currentSubjects: Subject[] = (parsed.subjects || initialSubjects).map((s: any) => {
          if (s.id === 'seni' || (s.nama && s.nama.toLowerCase().includes('seni dan budaya'))) {
            return {
              id: 'prakarya',
              kode: 'PRK',
              nama: 'Prakarya',
              kategori: 'Umum',
              kktp: s.kktp || 75,
              guruPengampuId: s.guruPengampuId || 'g-prakarya',
              guruPengampuNama: s.guruPengampuNama || 'Lestari Handayani, S.Pd.'
            };
          }
          return s;
        });

        // Add any missing religious subjects or prakarya
        const existingSubjectIds = new Set(currentSubjects.map(s => s.id));
        initialSubjects.forEach(is => {
          if (!existingSubjectIds.has(is.id)) {
            currentSubjects.push(is);
          }
        });

        // Sync learning objectives: rename seni -> prakarya, add missing
        let currentObjectives: TujuanPembelajaran[] = (parsed.learningObjectives || initialLearningObjectives).map((tp: any) => {
          if (tp.subjectId === 'seni') {
            return { ...tp, subjectId: 'prakarya', kodeTP: tp.kodeTP || 'TP 1' };
          }
          return tp;
        });

        const existingTpIds = new Set(currentObjectives.map(tp => tp.id));
        initialLearningObjectives.forEach(itp => {
          if (!existingTpIds.has(itp.id)) {
            currentObjectives.push(itp);
          }
        });

        // Sync student grades: rename 'seni' -> 'prakarya'
        let currentGrades: StudentGrade[] = (parsed.grades || initialGrades).map((g: any) => {
          if (g.subjectId === 'seni') {
            return {
              ...g,
              id: g.id ? g.id.replace('-seni', '-prakarya') : `grade-${g.studentId}-prakarya`,
              subjectId: 'prakarya'
            };
          }
          return g;
        });

        // Ensure newly added subjects have grades in memory if not present
        const existingGradeKeys = new Set(currentGrades.map(g => `${g.studentId}-${g.subjectId}`));
        initialGrades.forEach(ig => {
          const key = `${ig.studentId}-${ig.subjectId}`;
          if (!existingGradeKeys.has(key)) {
            currentGrades.push(ig);
          }
        });

        const savedLogoSekolah = parsed.school?.logoSekolah || (typeof window !== 'undefined' ? localStorage.getItem('custom_logo_sekolah') : null) || defaultLogoSekolah;
        const savedLogoPemda = parsed.school?.logoPemda || (typeof window !== 'undefined' ? localStorage.getItem('custom_logo_pemda') : null) || defaultLogoPemda;

        const currentSchool: SchoolInfo = {
          ...initialSchoolInfo,
          ...parsed.school,
          tahunAjaran: (!parsed.school?.tahunAjaran || parsed.school.tahunAjaran === '2024/2025' || parsed.school.tahunAjaran === '2025/2026') 
            ? '2026/2027' 
            : parsed.school.tahunAjaran,
          tanggalRapor: (!parsed.school?.tanggalRapor || parsed.school.tanggalRapor.includes('2024') || parsed.school.tanggalRapor.includes('2025'))
            ? '19 Desember 2026'
            : parsed.school.tanggalRapor,
          logoSekolah: savedLogoSekolah,
          logoPemda: savedLogoPemda
        };

        const savedRombels: Rombel[] = parsed.rombels || [];
        const requiredClassIds = ['7.1', '7.2', '7.3', '7.4', '8.1', '8.2', '8.3', '8.4', '9.1', '9.2', '9.3', '9.4'];
        const hasAllRequiredClasses = requiredClassIds.every(id => savedRombels.some((r: any) => r.id === id));
        const isOutdatedRombels = !hasAllRequiredClasses || savedRombels.length < 12 || savedRombels.some((r: any) => r.id === '7A' || r.id === '7B' || r.nama?.includes('VII-A'));

        const currentRombels: Rombel[] = isOutdatedRombels ? initialRombels : savedRombels.map((r: any) => ({
          ...r,
          tahunAjaran: (!r.tahunAjaran || r.tahunAjaran === '2024/2025' || r.tahunAjaran === '2025/2026') ? '2026/2027' : r.tahunAjaran
        }));

        let currentStudents: Student[] = (parsed.students || initialStudents).map((s: any) => {
          if (s.rombelId === '7A') return { ...s, rombelId: '7.1' };
          if (s.rombelId === '7B') return { ...s, rombelId: '7.2' };
          return s;
        });

        const existingClassRombelIds = new Set(currentStudents.map((s: any) => s.rombelId));
        initialStudents.forEach(is => {
          if (!existingClassRombelIds.has(is.rombelId)) {
            currentStudents.push(is);
          }
        });

        if (activeUser.rombelId === '7A') {
          activeUser.rombelId = '7.1';
        }

        // Remap 7A/7B in grades, attendances, and notes
        currentGrades = currentGrades.map((g: any) => {
          if (g.rombelId === '7A') return { ...g, rombelId: '7.1' };
          if (g.rombelId === '7B') return { ...g, rombelId: '7.2' };
          return g;
        });

        let currentAttendances: StudentAttendance[] = (parsed.attendances || initialAttendances).map((a: any) => {
          if (a.rombelId === '7A') return { ...a, rombelId: '7.1' };
          if (a.rombelId === '7B') return { ...a, rombelId: '7.2' };
          return a;
        });
        const existingAttStudentIds = new Set(currentAttendances.map((a: any) => a.studentId));
        initialAttendances.forEach(ia => {
          if (!existingAttStudentIds.has(ia.studentId)) {
            currentAttendances.push(ia);
          }
        });

        let currentNotes: StudentNote[] = (parsed.notes || initialNotes).map((n: any) => {
          if (n.rombelId === '7A') return { ...n, rombelId: '7.1' };
          if (n.rombelId === '7B') return { ...n, rombelId: '7.2' };
          return n;
        });
        const existingNoteStudentIds = new Set(currentNotes.map((n: any) => n.studentId));
        initialNotes.forEach(inote => {
          if (!existingNoteStudentIds.has(inote.studentId)) {
            currentNotes.push(inote);
          }
        });

        return {
          ...parsed,
          school: currentSchool,
          rombels: currentRombels,
          students: currentStudents,
          users: updatedUsers,
          currentUser: activeUser,
          subjects: currentSubjects,
          learningObjectives: currentObjectives,
          grades: currentGrades,
          attendances: currentAttendances,
          notes: currentNotes,
          extracurriculars,
          studentExtracurriculars
        };
      }
    } catch (e) {
      console.error('Failed to parse saved state:', e);
    }
  }

  const fallbackLogoSekolah = typeof window !== 'undefined' ? localStorage.getItem('custom_logo_sekolah') : null;
  const fallbackLogoPemda = typeof window !== 'undefined' ? localStorage.getItem('custom_logo_pemda') : null;

  return {
    school: {
      ...initialSchoolInfo,
      logoSekolah: fallbackLogoSekolah || initialSchoolInfo.logoSekolah,
      logoPemda: fallbackLogoPemda || initialSchoolInfo.logoPemda,
    },
    users: initialUsers,
    currentUser: initialUsers[1], // Default: Ibu Siti Rahmawati (Wali Kelas 7.1)
    rombels: initialRombels,
    subjects: initialSubjects,
    learningObjectives: initialLearningObjectives,
    students: initialStudents,
    grades: initialGrades,
    attendances: initialAttendances,
    extracurriculars: initialExtracurriculars,
    studentExtracurriculars: initialStudentExtracurriculars,
    notes: initialNotes,
    achievements: initialAchievements,
    isLocked: false
  };
};

export const saveStateToLocalStorage = (state: ERaporState): void => {
  try {
    localStorage.setItem('erapor_smpn14tubaba_state', JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};
