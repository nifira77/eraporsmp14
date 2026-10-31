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
  npsn: '10809848',
  nss: '20.1.1812.05.044 / 200441',
  alamat: 'Jl. Poros Tiyuh Marga Jaya, Kec, Gunung Agung, Kab. Tulang Bawang Barat Kode Pos 34783',
  desaKelurahan: 'Marga Jaya',
  kecamatan: 'Gunung Agung',
  kabupaten: 'Tulang Bawang Barat',
  provinsi: 'Lampung',
  kodePos: '34783',
  telepon: '(0726) 782104',
  email: 'smpn14tubaba@kemdikbud.go.id',
  website: 'https://smpn14tulangbawangbarat.sch.id',
  kepalaSekolah: 'PEBRIANSYAH., M.Pd',
  nipKepalaSekolah: '197602182014071002',
  tahunAjaran: '2026/2027',
  semester: 'Ganjil',
  tempatRapor: 'Tulang Bawang Barat',
  tanggalRapor: '3 November 2026',
  logoSekolah: defaultLogoSekolah,
  logoPemda: defaultLogoPemda
};

export const initialUsers: UserProfile[] = [
  {
    id: 'user-admin',
    name: 'PEBRIANSYAH., M.Pd',
    nip: '197602182014071002',
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
  { id: 'mulok', kode: 'MULOK', nama: 'Bahasa & Aksara Lampung (Muatan Lokal)', kategori: 'Muatan Lokal', kktp: 75, guruPengampuId: 'g-mulok', guruPengampuNama: 'Nurhasanah, S.Pd.' },
  { id: 'mulok_tubaba', kode: 'PKT', nama: 'Pendidikan Karakter Tubaba', kategori: 'Muatan Lokal', kktp: 75, guruPengampuId: 'g-pkt', guruPengampuNama: 'PEBRIANSYAH., M.Pd' }
];

// Sample TP IDs for filtering out any legacy dummy data
export const SAMPLE_TP_IDS = new Set([
  'tp-mtk-1', 'tp-mtk-2', 'tp-mtk-3', 'tp-mtk-4',
  'tp-bindo-1', 'tp-bindo-2', 'tp-bindo-3', 'tp-bindo-4',
  'tp-ipa-1', 'tp-ipa-2', 'tp-ipa-3',
  'tp-pai-1', 'tp-pai-2',
  'tp-pak-1', 'tp-pak-2',
  'tp-pkat-1', 'tp-pkat-2',
  'tp-pah-1', 'tp-pah-2',
  'tp-pab-1', 'tp-pab-2',
  'tp-pkn-1', 'tp-pkn-2',
  'tp-ips-1', 'tp-ips-2',
  'tp-bing-1', 'tp-bing-2',
  'tp-pjok-1', 'tp-pjok-2',
  'tp-prk-1', 'tp-prk-2',
  'tp-inf-1', 'tp-inf-2',
  'tp-mulok-1', 'tp-mulok-2',
  'tp-pkt-1', 'tp-pkt-2'
]);

export const isSampleTP = (tp: { id?: string }): boolean => {
  if (!tp || !tp.id) return false;
  if (SAMPLE_TP_IDS.has(tp.id)) return true;
  return /^tp-[a-z_]+-[0-9]{1,2}$/.test(tp.id);
};

// Seluruh sample Tujuan Pembelajaran dikosongkan agar diinput manual oleh sekolah
export const initialLearningObjectives: TujuanPembelajaran[] = [];

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
        // Respect saved users faithfully: never re-inject deleted default users or overwrite custom SMPN 14 teachers
        let updatedUsers: UserProfile[];
        if (Array.isArray(parsed.users) && parsed.users.length > 0) {
          updatedUsers = parsed.users.map((u: any) => {
            if (u.id === 'user-admin' && (u.name === 'Drs. H. Ahmad Fauzi, M.Pd.' || !u.name)) {
              return {
                ...u,
                name: 'PEBRIANSYAH., M.Pd',
                nip: '197602182014071002'
              };
            }
            return u;
          });
        } else {
          updatedUsers = initialUsers;
        }

        const activeUser = updatedUsers.find((u: any) => u.id === parsed.currentUser?.id) || updatedUsers[0] || initialUsers[0];

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

        // Bersihkan seluruh sample TP dummy, pastikan TP benar-benar kosong kecuali yang diinput manual
        let currentObjectives: TujuanPembelajaran[] = [];
        if (Array.isArray(parsed.learningObjectives)) {
          currentObjectives = parsed.learningObjectives
            .filter((tp: any) => !isSampleTP(tp))
            .map((tp: any) => {
              if (tp.subjectId === 'seni') {
                return { ...tp, subjectId: 'prakarya', kodeTP: tp.kodeTP || 'TP 1' };
              }
              return tp;
            });
        }

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

        // Retrieve dedicated custom school profile if saved directly
        const customSchoolStr = typeof window !== 'undefined' ? localStorage.getItem('custom_school_profile') : null;
        let customSchoolData: Partial<SchoolInfo> | null = null;
        if (customSchoolStr) {
          try {
            customSchoolData = JSON.parse(customSchoolStr);
          } catch (_) {}
        }

        const currentSchool: SchoolInfo = {
          ...initialSchoolInfo,
          ...(parsed.school || {}),
          ...(customSchoolData || {}),
          logoSekolah: (customSchoolData?.logoSekolah) || savedLogoSekolah,
          logoPemda: (customSchoolData?.logoPemda) || savedLogoPemda
        };

        if (currentSchool.kabupaten === 'Tulag Bawang Barat' || !currentSchool.kabupaten) {
          currentSchool.kabupaten = 'Tulang Bawang Barat';
        }
        if (currentSchool.tanggalRapor === '19 Desember 2026' || currentSchool.tanggalRapor === '17 Oktober 2026' || !currentSchool.tanggalRapor) {
          currentSchool.tanggalRapor = '3 November 2026';
        }
        if (
          !currentSchool.alamat ||
          currentSchool.alamat.includes('Tulag Bawang Barat') ||
          currentSchool.alamat === 'Jl. Poros Tiyuh Marga Jaya, Kec. Gunung Agung, Kab. Tulag Bawang Barat, Kode Pos 34783'
        ) {
          currentSchool.alamat = 'Jl. Poros Tiyuh Marga Jaya, Kec, Gunung Agung, Kab. Tulang Bawang Barat Kode Pos 34783';
        }

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
