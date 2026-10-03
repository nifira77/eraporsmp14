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
    id: 'user-budi',
    name: 'Budi Santoso, M.Pd.',
    nip: '19820715 200801 1 012',
    role: 'guru_mapel',
    subjectId: 'mtk',
    rombelId: '7A',
    photoUrl: '',
    tugasTambahan: 'Pembina Olah Raga',
    pembinaEkskul: 'Olah Raga'
  },
  {
    id: 'user-siti',
    name: 'Siti Rahmawati, S.Pd.',
    nip: '19850422 201001 2 021',
    role: 'wali_kelas',
    subjectId: 'bindo',
    rombelId: '7A',
    photoUrl: '',
    tugasTambahan: 'Pembina OSIS',
    pembinaEkskul: 'OSIS'
  },
  {
    id: 'user-eko',
    name: 'Eko Prasetyo, S.Pd.',
    nip: '19881103 201201 1 007',
    role: 'guru_mapel',
    subjectId: 'ipa',
    rombelId: '7A',
    photoUrl: '',
    tugasTambahan: 'Pembina Pramuka',
    pembinaEkskul: 'Pramuka'
  },
  {
    id: 'user-admin',
    name: 'Drs. H. Ahmad Fauzi, M.Pd.',
    nip: '19680514 199303 1 004',
    role: 'admin',
    photoUrl: ''
  }
];

export const initialRombels: Rombel[] = [
  {
    id: '7A',
    nama: 'Kelas VII-A',
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
    id: '7B',
    nama: 'Kelas VII-B',
    tingkat: 7,
    fase: 'Fase D',
    waliKelasId: 'user-budi',
    waliKelasNama: 'Budi Santoso, M.Pd.',
    waliKelasNip: '19820715 200801 1 012',
    tahunAjaran: '2026/2027',
    semester: 'Ganjil',
    jumlahSiswa: 8
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
  { id: 'tp-mtk-1', subjectId: 'mtk', rombelId: '7A', kodeTP: 'TP 1', lingkupMateri: 'Bilangan Bulat dan Rasional', deskripsi: 'memahami operasi hitung bilangan bulat dan pecahan serta penerapannya dalam kehidupan nyata', semester: 'Ganjil' },
  { id: 'tp-mtk-2', subjectId: 'mtk', rombelId: '7A', kodeTP: 'TP 2', lingkupMateri: 'Bentuk Aljabar', deskripsi: 'menyederhanakan bentuk aljabar dan menggunakannya untuk memodelkan situasi matematika', semester: 'Ganjil' },
  { id: 'tp-mtk-3', subjectId: 'mtk', rombelId: '7A', kodeTP: 'TP 3', lingkupMateri: 'Persamaan & Pertidaksamaan Linier', deskripsi: 'menyelesaikan persamaan dan pertidaksamaan linier satu variabel dengan metode yang tepat', semester: 'Ganjil' },
  { id: 'tp-mtk-4', subjectId: 'mtk', rombelId: '7A', kodeTP: 'TP 4', lingkupMateri: 'Perbandingan', deskripsi: 'menganalisis masalah perbandingan senilai dan berbalik nilai dalam konteks kontekstual', semester: 'Ganjil' },

  // Bahasa Indonesia (bindo)
  { id: 'tp-bindo-1', subjectId: 'bindo', rombelId: '7A', kodeTP: 'TP 1', lingkupMateri: 'Teks Deskripsi', deskripsi: 'mengidentifikasi ide pokok dan menyusun teks deskripsi keindahan alam sekitar dengan santun', semester: 'Ganjil' },
  { id: 'tp-bindo-2', subjectId: 'bindo', rombelId: '7A', kodeTP: 'TP 2', lingkupMateri: 'Puisi Rakyat & Cerita Fantasi', deskripsi: 'mengapresiasi nilai moral dalam puisi rakyat dan mengeksplorasi imajinasi dalam cerita fantasi', semester: 'Ganjil' },
  { id: 'tp-bindo-3', subjectId: 'bindo', rombelId: '7A', kodeTP: 'TP 3', lingkupMateri: 'Teks Prosedur', deskripsi: 'mengevaluasi struktur dan menyusun langkah-langkah dalam teks prosedur secara sistematis', semester: 'Ganjil' },
  { id: 'tp-bindo-4', subjectId: 'bindo', rombelId: '7A', kodeTP: 'TP 4', lingkupMateri: 'Teks Berita', deskripsi: 'menganalisis unsur adiksimba dalam teks berita dan membedakan fakta dengan opini', semester: 'Ganjil' },

  // IPA
  { id: 'tp-ipa-1', subjectId: 'ipa', rombelId: '7A', kodeTP: 'TP 1', lingkupMateri: 'Hakikat Sains dan Pengukuran', deskripsi: 'merancang penyelidikan ilmiah sederhana dan mengukur besaran fisika dengan alat ukur standar', semester: 'Ganjil' },
  { id: 'tp-ipa-2', subjectId: 'ipa', rombelId: '7A', kodeTP: 'TP 2', lingkupMateri: 'Zat dan Perubahannya', deskripsi: 'mengidentifikasi wujud zat, kerapatan massa jenis, dan perubahan wujud fisika kimia', semester: 'Ganjil' },
  { id: 'tp-ipa-3', subjectId: 'ipa', rombelId: '7A', kodeTP: 'TP 3', lingkupMateri: 'Suhu, Kalor, dan Pemuaian', deskripsi: 'menjelaskan perpindahan kalor dan dampaknya terhadap perubahan suhu serta pemuaian benda', semester: 'Ganjil' },

  // PAI (Pendidikan Agama Islam)
  { id: 'tp-pai-1', subjectId: 'pai', rombelId: '7A', kodeTP: 'TP 1', lingkupMateri: 'Al-Qur\'an dan Hadis', deskripsi: 'membaca dan memahami pesan mulia Q.S. an-Nisa/4: 59 dan an-Nahl/16: 64 tentang ketaatan', semester: 'Ganjil' },
  { id: 'tp-pai-2', subjectId: 'pai', rombelId: '7A', kodeTP: 'TP 2', lingkupMateri: 'Akidah Islam', deskripsi: 'meneladani asmaul husna al-Alim, al-Khabir, as-Sami, dan al-Bashir dalam pergaulan sehari-hari', semester: 'Ganjil' },

  // Pendidikan Agama Kristen Protestan dan Budi Pekerti
  { id: 'tp-pak-1', subjectId: 'pak_kristen', rombelId: '7A', kodeTP: 'TP 1', lingkupMateri: 'Keteladanan Yesus Kristus & Kasih', deskripsi: 'meneladani karya penyelamatan dan kasih Allah melalui Yesus Kristus dalam kehidupan sehari-hari dengan sesama', semester: 'Ganjil' },
  { id: 'tp-pak-2', subjectId: 'pak_kristen', rombelId: '7A', kodeTP: 'TP 2', lingkupMateri: 'Nilai-Nilai Kristiani dalam Masyarakat', deskripsi: 'menerapkan nilai kejujuran, keadilan, dan perdamaian di lingkungan keluarga, sekolah, dan masyarakat', semester: 'Ganjil' },

  // Pendidikan Agama Katolik dan Budi Pekerti
  { id: 'tp-pkat-1', subjectId: 'pak_katolik', rombelId: '7A', kodeTP: 'TP 1', lingkupMateri: 'Pribadi Yesus Kristus & Gereja', deskripsi: 'memahami pribadi Yesus Kristus sebagai teladan hidup beriman dan peran Roh Kudus dalam kehidupan Gereja', semester: 'Ganjil' },
  { id: 'tp-pkat-2', subjectId: 'pak_katolik', rombelId: '7A', kodeTP: 'TP 2', lingkupMateri: 'Moral Hidup Menggereja', deskripsi: 'mewujudkan nilai-nilai Kerajaan Allah melalui kepedulian sosial, keadilan, dan kelestarian ciptaan', semester: 'Ganjil' },

  // Pendidikan Agama Hindu dan Budi Pekerti
  { id: 'tp-pah-1', subjectId: 'pah_hindu', rombelId: '7A', kodeTP: 'TP 1', lingkupMateri: 'Tri Hita Karana & Kitab Suci Weda', deskripsi: 'memahami ajaran Tri Hita Karana untuk keharmonisan hidup serta nilai ketuhanan dalam Kitab Suci Weda', semester: 'Ganjil' },
  { id: 'tp-pah-2', subjectId: 'pah_hindu', rombelId: '7A', kodeTP: 'TP 2', lingkupMateri: 'Panca Sradha & Susila Hindu', deskripsi: 'menerapkan ajaran Panca Sradha dan perilaku susila dalam interaksi sosial dan keagamaan sehari-hari', semester: 'Ganjil' },

  // Pendidikan Agama Buddha dan Budi Pekerti
  { id: 'tp-pab-1', subjectId: 'pab_buddha', rombelId: '7A', kodeTP: 'TP 1', lingkupMateri: 'Riwayat Buddha Gotama & Tri Ratna', deskripsi: 'meneladani perjuangan dan welas asih Buddha Gotama serta berlindung kepada Tri Ratna (Tiratana)', semester: 'Ganjil' },
  { id: 'tp-pab-2', subjectId: 'pab_buddha', rombelId: '7A', kodeTP: 'TP 2', lingkupMateri: 'Empat Kebenaran Mulia & Moralitas Sila', deskripsi: 'menerapkan Pancasila Buddhis dan Jalan Mulia Berunsur Delapan untuk mengembangkan kebajikan batin', semester: 'Ganjil' },

  // PPKn
  { id: 'tp-pkn-1', subjectId: 'pkn', rombelId: '7A', kodeTP: 'TP 1', lingkupMateri: 'Perumusan Pancasila', deskripsi: 'menganalisis kronologi dan komitmen para pendiri bangsa dalam merumuskan dasar negara Pancasila', semester: 'Ganjil' },
  { id: 'tp-pkn-2', subjectId: 'pkn', rombelId: '7A', kodeTP: 'TP 2', lingkupMateri: 'Norma dan UUD NRI 1945', deskripsi: 'menerapkan perilaku patuh terhadap norma hukum dan sosial di lingkungan sekolah dan masyarakat', semester: 'Ganjil' },

  // IPS
  { id: 'tp-ips-1', subjectId: 'ips', rombelId: '7A', kodeTP: 'TP 1', lingkupMateri: 'Keluarga Awal Kehidupan', deskripsi: 'memahami keberadaan diri dan silsilah keluarga serta interaksi sosial di lingkungan terdekat', semester: 'Ganjil' },
  { id: 'tp-ips-2', subjectId: 'ips', rombelId: '7A', kodeTP: 'TP 2', lingkupMateri: 'Keragaman Hayati & Letak Geografis', deskripsi: 'menganalisis pengaruh letak geografis dan iklim terhadap keanekaragaman flora dan fauna Indonesia', semester: 'Ganjil' },

  // Bahasa Inggris
  { id: 'tp-bing-1', subjectId: 'bing', rombelId: '7A', kodeTP: 'TP 1', lingkupMateri: 'About Me & Greetings', deskripsi: 'introduce oneself and others with correct pronunciation and courteous interpersonal expressions', semester: 'Ganjil' },
  { id: 'tp-bing-2', subjectId: 'bing', rombelId: '7A', kodeTP: 'TP 2', lingkupMateri: 'Culinary & Daily Activities', deskripsi: 'describe favorite food and daily routines using simple present tense and sensory vocabulary', semester: 'Ganjil' },

  // PJOK
  { id: 'tp-pjok-1', subjectId: 'pjok', rombelId: '7A', kodeTP: 'TP 1', lingkupMateri: 'Permainan Bola Besar', deskripsi: 'mempraktikkan gerak spesifik passing dan dribbling dalam permainan bola voli dan sepak bola', semester: 'Ganjil' },
  { id: 'tp-pjok-2', subjectId: 'pjok', rombelId: '7A', kodeTP: 'TP 2', lingkupMateri: 'Kebugaran Jasmani', deskripsi: 'menjelaskan dan mempraktikkan latihan daya tahan jantung dan kekuatan otot dengan bugar', semester: 'Ganjil' },

  // Prakarya (menggantikan Seni dan Budaya)
  { id: 'tp-prk-1', subjectId: 'prakarya', rombelId: '7A', kodeTP: 'TP 1', lingkupMateri: 'Pengolahan Pangan Khas Daerah', deskripsi: 'merancang dan mengolah bahan pangan nabati dan hewani khas daerah Lampung menjadi produk bernilai ekonomis', semester: 'Ganjil' },
  { id: 'tp-prk-2', subjectId: 'prakarya', rombelId: '7A', kodeTP: 'TP 2', lingkupMateri: 'Kerajinan Bahan Alam Nusantara', deskripsi: 'membuat produk kerajinan fungsional berbasis bahan alam lokal dengan prinsip estetika dan ergonomis', semester: 'Ganjil' },

  // Informatika
  { id: 'tp-inf-1', subjectId: 'inf', rombelId: '7A', kodeTP: 'TP 1', lingkupMateri: 'Berpikir Komputasional', deskripsi: 'menerapkan konsep dekomposisi dan pengenalan pola untuk menyelesaikan persoalan logis', semester: 'Ganjil' },
  { id: 'tp-inf-2', subjectId: 'inf', rombelId: '7A', kodeTP: 'TP 2', lingkupMateri: 'Teknologi Informasi & Komunikasi', deskripsi: 'mengoperasikan aplikasi pengolah kata dan lembar kerja untuk membuat laporan sederhana', semester: 'Ganjil' },

  // Mulok (Bahasa Lampung)
  { id: 'tp-mulok-1', subjectId: 'mulok', rombelId: '7A', kodeTP: 'TP 1', lingkupMateri: 'Aksara & Sastra Lampung', deskripsi: 'menulis dan membaca Aksara Lampung Had Lampung serta melafalkan sastra lisan Segata/Padih', semester: 'Ganjil' },
  { id: 'tp-mulok-2', subjectId: 'mulok', rombelId: '7A', kodeTP: 'TP 2', lingkupMateri: 'Unggah-ungguh Bahasa Lampung', deskripsi: 'menerapkan tata krama berbahasa Lampung dialek Menggala/Tulang Bawang dalam percakapan sopan', semester: 'Ganjil' }
];

export const initialStudents: Student[] = [
  {
    id: 'std-1',
    nis: '24001',
    nisn: '0112456781',
    nama: 'Ahmad Dwi Pratama',
    jenisKelamin: 'L',
    rombelId: '7A',
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
    rombelId: '7A',
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
    rombelId: '7A',
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
    rombelId: '7A',
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
    rombelId: '7A',
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
    rombelId: '7A',
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
    rombelId: '7A',
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
    rombelId: '7A',
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
    rombelId: '7A',
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
    rombelId: '7A',
    tempatLahir: 'Tulang Bawang Barat',
    tanggalLahir: '17 Juni 2011',
    agama: 'Islam',
    namaAyah: 'Wahyudi Siswanto',
    namaIbu: 'Endang Sulastri',
    pekerjaanOrangTua: 'Petani Karet',
    alamat: 'Marga Kencana RT 06 RW 03, Tulang Bawang Udik'
  }
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
  { id: 'se-1', studentId: 'std-1', rombelId: '7A', ekskulId: 'ek-pramuka', predikat: 'Sangat Baik', keterangan: 'Aktif sebagai pemimpin regu dan terampil dalam pioneering serta semaphore.' },
  { id: 'se-2', studentId: 'std-1', rombelId: '7A', ekskulId: 'ek-olahraga', predikat: 'Baik', keterangan: 'Menunjukkan stamina dan sportivitas yang baik dalam latihan futsal dan atletik.' },
  { id: 'se-3', studentId: 'std-2', rombelId: '7A', ekskulId: 'ek-osis', predikat: 'Sangat Baik', keterangan: 'Sangat aktif, berinisiatif tinggi, dan bertanggung jawab dalam kepengurusan OSIS serta kegiatan kesiswaan.' },
  { id: 'se-4', studentId: 'std-2', rombelId: '7A', ekskulId: 'ek-tari', predikat: 'Sangat Baik', keterangan: 'Menguasai gerak dasar tari Cangget dan Tari Sigeh Penguten dengan luwes dan elok.' },
  { id: 'se-5', studentId: 'std-3', rombelId: '7A', ekskulId: 'ek-pramuka', predikat: 'Baik', keterangan: 'Disiplin hadir dalam setiap latihan kepramukaan dan perkemahan sabtu-minggu.' },
  { id: 'se-6', studentId: 'std-4', rombelId: '7A', ekskulId: 'ek-uks', predikat: 'Sangat Baik', keterangan: 'Terampil melakukan pertolongan pertama (P3K) dan aktif dalam program kesehatan sekolah.' },
  { id: 'se-7', studentId: 'std-5', rombelId: '7A', ekskulId: 'ek-rohis', predikat: 'Sangat Baik', keterangan: 'Sangat istiqomah dalam pembiasaan ibadah sholat berjamaah dan aktif dalam tadarus Al-Qur\'an.' },
  { id: 'se-8', studentId: 'std-7', rombelId: '7A', ekskulId: 'ek-tari', predikat: 'Sangat Baik', keterangan: 'Hapal formasi dan ragam gerak tari kreasi Lampung serta mewakili sekolah dalam festival seni.' },
  { id: 'se-9', studentId: 'std-9', rombelId: '7A', ekskulId: 'ek-uks', predikat: 'Baik', keterangan: 'Cekatan membantu teman yang sakit dan tertib menjaga kebersihan ruang UKS.' },
  { id: 'se-10', studentId: 'std-10', rombelId: '7A', ekskulId: 'ek-olahraga', predikat: 'Baik', keterangan: 'Berperan baik sebagai penjaga gawang tim futsal dan disiplin mengikuti latihan fisik.' }
];

export const initialAttendances: StudentAttendance[] = [
  { studentId: 'std-1', rombelId: '7A', sakit: 1, izin: 0, alpa: 0 },
  { studentId: 'std-2', rombelId: '7A', sakit: 0, izin: 1, alpa: 0 },
  { studentId: 'std-3', rombelId: '7A', sakit: 2, izin: 1, alpa: 0 },
  { studentId: 'std-4', rombelId: '7A', sakit: 0, izin: 0, alpa: 0 },
  { studentId: 'std-5', rombelId: '7A', sakit: 0, izin: 2, alpa: 0 },
  { studentId: 'std-6', rombelId: '7A', sakit: 3, izin: 0, alpa: 1 },
  { studentId: 'std-7', rombelId: '7A', sakit: 0, izin: 0, alpa: 0 },
  { studentId: 'std-8', rombelId: '7A', sakit: 1, izin: 2, alpa: 1 },
  { studentId: 'std-9', rombelId: '7A', sakit: 0, izin: 1, alpa: 0 },
  { studentId: 'std-10', rombelId: '7A', sakit: 2, izin: 0, alpa: 0 }
];

export const initialNotes: StudentNote[] = [
  {
    studentId: 'std-1',
    rombelId: '7A',
    catatan: 'Pertahankan prestasi belajar dan kepemimpinan yang baik di kelas. Tingkatkan terus minat baca terutama literasi sains.',
    statusKenaikan: 'Memenuhi Kriteria Ketuntasan Belajar'
  },
  {
    studentId: 'std-2',
    rombelId: '7A',
    catatan: 'Ananda memiliki bakat seni dan komunikasi yang sangat menonjol. Tetap santun dan rajin belajar, ananda adalah teladan positif di kelas.',
    statusKenaikan: 'Memenuhi Kriteria Ketuntasan Belajar'
  },
  {
    studentId: 'std-3',
    rombelId: '7A',
    catatan: 'Semangat belajar cukup baik, perlu lebih aktif mengemukakan pendapat dalam diskusi kelompok dan menyelesaikan tugas tepat waktu.',
    statusKenaikan: 'Memenuhi Kriteria Ketuntasan Belajar'
  },
  {
    studentId: 'std-4',
    rombelId: '7A',
    catatan: 'Sangat tekun dan rapi dalam mengerjakan tugas. Prestasi akademiknya konsisten di papan atas. Teruslah berkarya!',
    statusKenaikan: 'Memenuhi Kriteria Ketuntasan Belajar'
  },
  {
    studentId: 'std-5',
    rombelId: '7A',
    catatan: 'Kemampuan logika numerik dan sains sangat istimewa. Latih juga kebiasaan bekerjasama dengan teman sebaya.',
    statusKenaikan: 'Memenuhi Kriteria Ketuntasan Belajar'
  },
  {
    studentId: 'std-6',
    rombelId: '7A',
    catatan: 'Kurangi ketidakhadiran tanpa keterangan. Tingkatkan konsentrasi dan mintalah bimbingan guru jika mendapati materi yang sulit.',
    statusKenaikan: 'Memenuhi Kriteria Ketuntasan Belajar dengan Bimbingan Khusus'
  },
  {
    studentId: 'std-7',
    rombelId: '7A',
    catatan: 'Sikap sopan santun dan kedisiplinan sangat membanggakan. Terus asah potensi di bidang tari daerah dan bahasa asing.',
    statusKenaikan: 'Memenuhi Kriteria Ketuntasan Belajar'
  },
  {
    studentId: 'std-8',
    rombelId: '7A',
    catatan: 'Perlu bimbingan lebih intensif dalam pelajaran matematika dan IPA. Belajarlah dengan tekun dan jangan segan bertanya kepada guru.',
    statusKenaikan: 'Memenuhi Kriteria Ketuntasan Belajar dengan Bimbingan Khusus'
  },
  {
    studentId: 'std-9',
    rombelId: '7A',
    catatan: 'Karakter peduli sesama sangat baik. Hasil belajar meningkat dengan memuaskan, pertahankan di semester mendatang.',
    statusKenaikan: 'Memenuhi Kriteria Ketuntasan Belajar'
  },
  {
    studentId: 'std-10',
    rombelId: '7A',
    catatan: 'Fisik dan kebugaran prima, dukung pula dengan ketekunan belajar di kelas agar semua mata pelajaran mencapai hasil optimal.',
    statusKenaikan: 'Memenuhi Kriteria Ketuntasan Belajar'
  }
];

export const initialAchievements: StudentAchievement[] = [
  {
    id: 'ach-1',
    studentId: 'std-2',
    rombelId: '7A',
    bidang: 'Non-Akademik',
    prestasi: 'Juara 1 Lomba Tari Kreasi Daerah Tradisional Lampung Tingkat SMP',
    tingkat: 'Kabupaten',
    keterangan: 'Pekan Seni & Kebudayaan Kabupaten Tulang Bawang Barat Tahun 2024'
  },
  {
    id: 'ach-2',
    studentId: 'std-5',
    rombelId: '7A',
    bidang: 'Akademik',
    prestasi: 'Juara 2 Olimpiade Sains Nasional (OSN) Bidang Matematika',
    tingkat: 'Kabupaten',
    keterangan: 'Seleksi OSN Tingkat Kabupaten Tulang Bawang Barat'
  },
  {
    id: 'ach-3',
    studentId: 'std-1',
    rombelId: '7A',
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
        rombelId: '7A',
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

        const currentSchool: SchoolInfo = {
          ...initialSchoolInfo,
          ...parsed.school,
          tahunAjaran: (!parsed.school?.tahunAjaran || parsed.school.tahunAjaran === '2024/2025' || parsed.school.tahunAjaran === '2025/2026') 
            ? '2026/2027' 
            : parsed.school.tahunAjaran,
          tanggalRapor: (!parsed.school?.tanggalRapor || parsed.school.tanggalRapor.includes('2024') || parsed.school.tanggalRapor.includes('2025'))
            ? '19 Desember 2026'
            : parsed.school.tanggalRapor,
          logoSekolah: parsed.school?.logoSekolah || defaultLogoSekolah,
          logoPemda: parsed.school?.logoPemda || defaultLogoPemda
        };

        const currentRombels: Rombel[] = (parsed.rombels || initialRombels).map((r: any) => ({
          ...r,
          tahunAjaran: (!r.tahunAjaran || r.tahunAjaran === '2024/2025' || r.tahunAjaran === '2025/2026') ? '2026/2027' : r.tahunAjaran
        }));

        return {
          ...parsed,
          school: currentSchool,
          rombels: currentRombels,
          users: updatedUsers,
          currentUser: activeUser,
          subjects: currentSubjects,
          learningObjectives: currentObjectives,
          grades: currentGrades,
          extracurriculars,
          studentExtracurriculars
        };
      }
    } catch (e) {
      console.error('Failed to parse saved state:', e);
    }
  }

  return {
    school: initialSchoolInfo,
    users: initialUsers,
    currentUser: initialUsers[1], // Default: Ibu Siti Rahmawati (Wali Kelas VII-A)
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
