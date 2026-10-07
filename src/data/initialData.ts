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
    jumlahSiswa: 0
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
    jumlahSiswa: 0
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
    jumlahSiswa: 0
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
    jumlahSiswa: 0
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
    jumlahSiswa: 0
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
    jumlahSiswa: 0
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
    jumlahSiswa: 0
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
    jumlahSiswa: 0
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
    jumlahSiswa: 0
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
    jumlahSiswa: 0
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
    jumlahSiswa: 0
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
    jumlahSiswa: 0
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

export const initialStudents: Student[] = [];

export const initialExtracurriculars: Extracurricular[] = [
  { id: 'ek-osis', nama: 'OSIS', pembina: 'Siti Rahmawati, S.Pd.' },
  { id: 'ek-pramuka', nama: 'Pramuka', pembina: 'Eko Prasetyo, S.Pd.' },
  { id: 'ek-rohis', nama: 'Rohis', pembina: 'Nurul Hidayah, S.Pd.' },
  { id: 'ek-uks', nama: 'UKS', pembina: 'Wahyu Triyono, S.Pd.' },
  { id: 'ek-tari', nama: 'Seni Tari', pembina: 'Dewi Sartika, S.Pd.' },
  { id: 'ek-olahraga', nama: 'Olah Raga', pembina: 'Budi Santoso, M.Pd.' }
];

export const initialStudentExtracurriculars: StudentExtracurricular[] = [];
export const initialAttendances: StudentAttendance[] = [];
export const initialNotes: StudentNote[] = [];
export const initialAchievements: StudentAchievement[] = [];
export const initialGrades: StudentGrade[] = [];

export const getInitialState = (): ERaporState => {
  const savedState = localStorage.getItem('erapor_smpn14tubaba_state');
  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      if (parsed && parsed.school) {
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

        // Keep all saved students
        let currentStudents: Student[] = parsed.students || [];

        // Remap any leftover legacy class references if real students were previously added under 7A/7B
        currentStudents = currentStudents.map((s: any) => {
          if (s.rombelId === '7A') return { ...s, rombelId: '7.1' };
          if (s.rombelId === '7B') return { ...s, rombelId: '7.2' };
          return s;
        });

        const validStudentIds = new Set(currentStudents.map(s => s.id));

        const currentRombels: Rombel[] = (isOutdatedRombels ? initialRombels : savedRombels).map((r: any) => ({
          ...r,
          tahunAjaran: (!r.tahunAjaran || r.tahunAjaran === '2024/2025' || r.tahunAjaran === '2025/2026') ? '2026/2027' : r.tahunAjaran,
          jumlahSiswa: currentStudents.filter(s => s.rombelId === r.id).length
        }));

        if (activeUser.rombelId === '7A') {
          activeUser.rombelId = '7.1';
        }

        // Keep only grades, attendances, notes, extracurriculars, achievements belonging to genuine students
        currentGrades = currentGrades.filter((g: any) => validStudentIds.has(g.studentId));

        let currentAttendances: StudentAttendance[] = (parsed.attendances || [])
          .filter((a: any) => validStudentIds.has(a.studentId));

        let currentNotes: StudentNote[] = (parsed.notes || [])
          .filter((n: any) => validStudentIds.has(n.studentId));

        let currentStudentExtracurriculars: StudentExtracurricular[] = (parsed.studentExtracurriculars || [])
          .filter((se: any) => validStudentIds.has(se.studentId));

        let currentAchievements: StudentAchievement[] = (parsed.achievements || [])
          .filter((ach: any) => validStudentIds.has(ach.studentId));

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
          studentExtracurriculars: currentStudentExtracurriculars,
          achievements: currentAchievements
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
