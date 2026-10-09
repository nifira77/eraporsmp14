import React, { useState, useMemo } from 'react';
import { 
  ERaporState, 
  StudentExtracurricular, 
  Extracurricular 
} from '../types/erapor';
import { 
  Award, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  Filter, 
  UserCheck, 
  Info,
  Layers,
  ChevronDown
} from 'lucide-react';

interface PenilaianEkskulViewProps {
  state: ERaporState;
  onUpdateStudentExtracurriculars: (studentEkskuls: StudentExtracurricular[]) => void;
}

export const PenilaianEkskulView: React.FC<PenilaianEkskulViewProps> = ({
  state,
  onUpdateStudentExtracurriculars
}) => {
  const { 
    students, 
    rombels, 
    extracurriculars, 
    studentExtracurriculars, 
    currentUser, 
    isLocked 
  } = state;

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'kepala_sekolah';

  // Determine current active ekskul based on teacher's tugasTambahan or default
  const defaultEkskul = useMemo(() => {
    if (currentUser.pembinaEkskul) {
      const match = extracurriculars.find(e => 
        e.nama.toLowerCase().includes(currentUser.pembinaEkskul!.toLowerCase()) ||
        currentUser.pembinaEkskul!.toLowerCase().includes(e.nama.toLowerCase())
      );
      if (match) return match;
    }
    return extracurriculars[0] || { id: 'ek-pramuka', nama: 'Pramuka', pembina: currentUser.name };
  }, [currentUser, extracurriculars]);

  const [selectedEkskulId, setSelectedEkskulId] = useState<string>(defaultEkskul.id);
  const [selectedRombelFilter, setSelectedRombelFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Local state for editing grades
  const [localEkskuls, setLocalEkskuls] = useState<StudentExtracurricular[]>(studentExtracurriculars);

  // Modal Tambah Siswa Aktif
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalRombelId, setModalRombelId] = useState<string>(rombels[0]?.id || '7.1');
  const [newStudentId, setNewStudentId] = useState(students[0]?.id || '');
  const [newPredikat, setNewPredikat] = useState<'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang'>('Sangat Baik');
  const [newKeterangan, setNewKeterangan] = useState('');

  const currentEkskul = extracurriculars.find(e => e.id === selectedEkskulId) || defaultEkskul;

  // Filter students who are active in this specific extracurricular
  const activeEntries = useMemo(() => {
    return localEkskuls.filter(entry => {
      if (entry.ekskulId !== selectedEkskulId) return false;
      if (selectedRombelFilter !== 'all') {
        const student = students.find(s => s.id === entry.studentId);
        if (student && student.rombelId !== selectedRombelFilter) return false;
      }
      if (searchQuery.trim()) {
        const student = students.find(s => s.id === entry.studentId);
        const query = searchQuery.toLowerCase();
        const matchName = student?.nama.toLowerCase().includes(query);
        const matchNisn = student?.nisn.includes(query);
        if (!matchName && !matchNisn) return false;
      }
      return true;
    });
  }, [localEkskuls, selectedEkskulId, selectedRombelFilter, searchQuery, students]);

  // Students not yet enrolled in this extracurricular, filtered by modal selected class
  const availableStudentsToAdd = useMemo(() => {
    const existingStudentIds = new Set(
      localEkskuls.filter(entry => entry.ekskulId === selectedEkskulId).map(e => e.studentId)
    );
    let pool = students.filter(s => !existingStudentIds.has(s.id));
    if (modalRombelId && modalRombelId !== 'all') {
      pool = pool.filter(s => s.rombelId === modalRombelId);
    }
    return pool;
  }, [students, localEkskuls, selectedEkskulId, modalRombelId]);

  // Handle predikat change
  const handlePredikatChange = (entryId: string, predikat: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang') => {
    setLocalEkskuls(prev => prev.map(item => {
      if (item.id === entryId) {
        return { ...item, predikat };
      }
      return item;
    }));
  };

  // Handle keterangan change
  const handleKeteranganChange = (entryId: string, keterangan: string) => {
    setLocalEkskuls(prev => prev.map(item => {
      if (item.id === entryId) {
        return { ...item, keterangan };
      }
      return item;
    }));
  };

  // Auto generate standard descriptions based on ekskul type & predicate
  const getAutoDescription = (ekskulName: string, predikat: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang') => {
    const name = ekskulName.toLowerCase();

    if (name.includes('pramuka')) {
      if (predikat === 'Sangat Baik') return 'Sangat aktif, disiplin, berdedikasi tinggi dalam kepramukaan, serta terampil dalam pioneering dan kepemimpinan regu.';
      if (predikat === 'Baik') return 'Aktif mengikuti kegiatan latihan mingguan kepramukaan dan menunjukkan sikap disiplin yang baik.';
      if (predikat === 'Cukup') return 'Cukup berpartisipasi dalam kegiatan kepramukaan, perlu ditingkatkan keaktifan latihan lapangan.';
      return 'Perlu bimbingan dan peningkatan kedisiplinan dalam mengikuti latihan kepramukaan.';
    }

    if (name.includes('osis')) {
      if (predikat === 'Sangat Baik') return 'Sangat aktif, berinisiatif tinggi, dan bertanggung jawab penuh dalam kepengurusan OSIS serta koordinasi program kesiswaan.';
      if (predikat === 'Baik') return 'Berperan aktif dalam kepengurusan OSIS dan mampu menyelesaikan tugas program kerja dengan baik.';
      if (predikat === 'Cukup') return 'Cukup aktif membantu pelaksanaan kegiatan OSIS di lingkungan sekolah.';
      return 'Perlu meningkatkan tanggung jawab dan kehadiran dalam rapat kepengurusan OSIS.';
    }

    if (name.includes('rohis')) {
      if (predikat === 'Sangat Baik') return 'Sangat istiqomah dalam pembiasaan ibadah, aktif membaca Al-Qur\'an, serta menjadi teladan dalam kegiatan keagamaan Islam.';
      if (predikat === 'Baik') return 'Rajin mengikuti kajian rohani Islam dan berpartisipasi aktif dalam kegiatan keagamaan sekolah.';
      if (predikat === 'Cukup') return 'Cukup baik dalam mengikuti pembiasaan sholat berjamaah dan tadarus Al-Qur\'an.';
      return 'Perlu meningkatkan ketertiban dan konsistensi dalam kegiatan rohis.';
    }

    if (name.includes('uks')) {
      if (predikat === 'Sangat Baik') return 'Sangat sigap dan terampil dalam pertolongan pertama (P3K) serta aktif mempelopori perilaku hidup bersih dan sehat di sekolah.';
      if (predikat === 'Baik') return 'Cekatan membantu penanganan siswa sakit saat upacara dan aktif dalam piket pelayanan ruang UKS.';
      if (predikat === 'Cukup') return 'Cukup memahami prinsip dasar kesehatan remaja dan pertolongan pertama pada kecelakaan ringan.';
      return 'Perlu lebih aktif dan tanggap saat menjalankan tugas piket di ruang UKS.';
    }

    if (name.includes('tari')) {
      if (predikat === 'Sangat Baik') return 'Menguasai gerak dasar tari tradisional Cangget dan Sigeh Penguten dengan sangat luwes, ritmis, dan penuh penjiwaan estetis.';
      if (predikat === 'Baik') return 'Hapal pola lantai dan rangkaian ragam gerak tari daerah Lampung dengan baik.';
      if (predikat === 'Cukup') return 'Cukup mampu mengikuti koreografi gerak tari daerah, perlu latihan keluwesan gerak tangan.';
      return 'Perlu latihan lebih intensif dalam penguasaan irama dan wiraga tari.';
    }

    if (name.includes('olah raga') || name.includes('olahraga')) {
      if (predikat === 'Sangat Baik') return 'Menunjukkan stamina prima, sportivitas tinggi, serta menguasai teknik dasar olahraga dan kerja sama tim dengan sangat baik.';
      if (predikat === 'Baik') return 'Disiplin mengikuti latihan fisik dan memiliki pemahaman taktik permainan olahraga yang baik.';
      if (predikat === 'Cukup') return 'Cukup aktif dalam latihan fisik, perlu meningkatkan daya tahan dan sportivitas bertanding.';
      return 'Perlu meningkatkan kehadiran dan kedisiplinan fisik saat jadwal latihan olahraga.';
    }

    // Default template
    if (predikat === 'Sangat Baik') return `Sangat aktif, berprestasi, dan menunjukkan komitmen tinggi dalam seluruh rangkaian kegiatan ${ekskulName}.`;
    if (predikat === 'Baik') return `Aktif dan berpartisipasi dengan baik dalam kegiatan ekstrakurikuler ${ekskulName}.`;
    if (predikat === 'Cukup') return `Cukup berpartisipasi dalam kegiatan ${ekskulName}, perlu ditingkatkan keaktifannya.`;
    return `Perlu meningkatkan kehadiran dan peran aktif dalam kegiatan ${ekskulName}.`;
  };

  // Bulk auto generate descriptions
  const handleAutoGenerateAllDescriptions = () => {
    setLocalEkskuls(prev => prev.map(entry => {
      if (entry.ekskulId === selectedEkskulId) {
        const desc = getAutoDescription(currentEkskul.nama, entry.predikat);
        return { ...entry, keterangan: desc };
      }
      return entry;
    }));

    setSuccessMessage(`Deskripsi capaian seluruh siswa aktif ${currentEkskul.nama} berhasil digenerate otomatis.`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Add new student to this ekskul
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentId) return;

    const student = students.find(s => s.id === newStudentId);
    if (!student) return;

    const defaultDesc = newKeterangan.trim() || getAutoDescription(currentEkskul.nama, newPredikat);

    const newEntry: StudentExtracurricular = {
      id: `se-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      studentId: newStudentId,
      rombelId: student.rombelId,
      ekskulId: selectedEkskulId,
      predikat: newPredikat,
      keterangan: defaultDesc
    };

    setLocalEkskuls(prev => [...prev, newEntry]);
    setIsAddModalOpen(false);
    setNewKeterangan('');
    setSuccessMessage(`Peserta didik "${student.nama}" berhasil ditambahkan ke ekstrakurikuler ${currentEkskul.nama}.`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Delete student from this ekskul
  const handleDeleteEntry = (entryId: string, studentName: string) => {
    if (confirm(`Hapus ${studentName} dari daftar kegiatan ${currentEkskul.nama}?`)) {
      setLocalEkskuls(prev => prev.filter(item => item.id !== entryId));
      setSuccessMessage(`Peserta didik "${studentName}" dihapus dari kegiatan ${currentEkskul.nama}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Save changes to application state
  const handleSaveChanges = () => {
    onUpdateStudentExtracurriculars(localEkskuls);
    setSuccessMessage(`Seluruh penilaian capaian siswa aktif ${currentEkskul.nama} berhasil disimpan ke e-Rapor.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Penilaian Kegiatan Ekstrakurikuler
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {currentEkskul.nama}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Penilaian capaian kompetensi dan predikat siswa aktif ekstrakurikuler oleh Pembina untuk dicetak pada buku rapor peserta didik.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Pembina:</span>
            <span className="bg-slate-100 px-2.5 py-0.5 rounded-md font-medium text-slate-800 border border-slate-200">
              {currentEkskul.pembina || currentUser.name}
            </span>
            <span className="text-slate-300">|</span>
            <span>Tahun Ajaran {state.school.tahunAjaran} Semester {state.school.semester}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAutoGenerateAllDescriptions}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold shadow-xs transition-colors"
            title="Generate deskripsi capaian otomatis sesuai predikat"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Generate Deskripsi</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const initRombel = selectedRombelFilter !== 'all' ? selectedRombelFilter : (rombels[0]?.id || '7.1');
              setModalRombelId(initRombel);
              const existingStudentIds = new Set(
                localEkskuls.filter(entry => entry.ekskulId === selectedEkskulId).map(e => e.studentId)
              );
              let pool = students.filter(s => !existingStudentIds.has(s.id));
              if (initRombel !== 'all') {
                pool = pool.filter(s => s.rombelId === initRombel);
              }
              setNewStudentId(pool[0]?.id || '');
              setNewPredikat('Sangat Baik');
              setNewKeterangan('');
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Siswa Aktif</span>
          </button>

          <button
            type="button"
            onClick={handleSaveChanges}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Simpan Nilai</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Selector & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Switch Ekskul (especially for Admin or teachers managing multiple clubs) */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
            Ekstrakurikuler:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {extracurriculars.map(e => (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelectedEkskulId(e.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedEkskulId === e.id
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {e.nama}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Rombel & Search */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Kelas:</span>
            <select
              value={selectedRombelFilter}
              onChange={(e) => setSelectedRombelFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">Semua Rombel</option>
              {rombels.map(r => (
                <option key={r.id} value={r.id}>{r.nama}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama / NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs w-44 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Table of Active Students */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Daftar Siswa Aktif Kegiatan ({activeEntries.length} Siswa Terdaftar)</span>
          </h3>
          <span className="text-[11px] text-slate-500">
            Predikat & catatan capaian langsung tersimpan ke lembar rapor e-Rapor
          </span>
        </div>

        {activeEntries.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              Belum Ada Siswa Terdaftar di {currentEkskul.nama}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Tambahkan siswa yang aktif mengikuti kegiatan ekstrakurikuler ini untuk memberikan penilaian capaian rapor semester.
            </p>
            <button
              type="button"
              onClick={() => {
                if (availableStudentsToAdd.length > 0) {
                  setNewStudentId(availableStudentsToAdd[0].id);
                  setNewPredikat('Sangat Baik');
                  setNewKeterangan('');
                  setIsAddModalOpen(true);
                }
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Siswa Aktif Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3.5 font-semibold w-10 text-center">No</th>
                  <th className="py-3 px-3.5 font-semibold w-52">Nama Siswa & NISN</th>
                  <th className="py-3 px-3 font-semibold w-28">Kelas</th>
                  <th className="py-3 px-3 font-semibold w-36 text-center">Predikat Capaian</th>
                  <th className="py-3 px-4 font-semibold">Deskripsi Capaian Pembelajaran Ekstrakurikuler</th>
                  <th className="py-3 px-3 font-semibold w-14 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeEntries.map((entry, idx) => {
                  const student = students.find(s => s.id === entry.studentId);
                  const rombel = rombels.find(r => r.id === student?.rombelId);

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 text-center font-mono text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-3.5">
                        <p className="font-semibold text-slate-900">{student?.nama}</p>
                        <p className="text-[10px] text-slate-400 font-mono">NISN: {student?.nisn}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                          {rombel?.nama || student?.rombelId}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <select
                          value={entry.predikat}
                          onChange={(e) => handlePredikatChange(entry.id, e.target.value as any)}
                          className={`w-full px-2 py-1 rounded-md text-xs font-semibold border ${
                            entry.predikat === 'Sangat Baik'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : entry.predikat === 'Baik'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : entry.predikat === 'Cukup'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          <option value="Sangat Baik">Sangat Baik (A)</option>
                          <option value="Baik">Baik (B)</option>
                          <option value="Cukup">Cukup (C)</option>
                          <option value="Kurang">Kurang (D)</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <textarea
                          rows={2}
                          value={entry.keterangan}
                          onChange={(e) => handleKeteranganChange(entry.id, e.target.value)}
                          placeholder="Masukkan catatan capaian keaktifan peserta didik..."
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry.id, student?.nama || 'Siswa')}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Hapus dari kegiatan ekskul"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah Siswa Aktif */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddStudent} className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Award className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Tambah Siswa Aktif {currentEkskul.nama}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daftarkan peserta didik yang aktif mengikuti ekstrakurikuler ini
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              {/* Field Pilih Kelas / Rombel */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Kelas / Rombel
                </label>
                <select
                  value={modalRombelId}
                  onChange={(e) => {
                    const rId = e.target.value;
                    setModalRombelId(rId);
                    const existingStudentIds = new Set(
                      localEkskuls.filter(entry => entry.ekskulId === selectedEkskulId).map(entry => entry.studentId)
                    );
                    let pool = students.filter(s => !existingStudentIds.has(s.id));
                    if (rId !== 'all') {
                      pool = pool.filter(s => s.rombelId === rId);
                    }
                    if (pool.length > 0) {
                      setNewStudentId(pool[0].id);
                    } else {
                      setNewStudentId('');
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 cursor-pointer"
                >
                  <option value="all">Semua Kelas ({students.length} Siswa)</option>
                  {rombels.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.nama} ({students.filter(s => s.rombelId === r.id).length} Siswa)
                    </option>
                  ))}
                </select>
              </div>

              {/* Field Pilih Peserta Didik */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Pilih Peserta Didik di Kelas Terpilih
                  </label>
                  <span className="text-[11px] font-medium text-slate-500">
                    {availableStudentsToAdd.length} siswa belum terdaftar
                  </span>
                </div>
                {availableStudentsToAdd.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                    Semua siswa di kelas ini telah terdaftar di ekskul {currentEkskul.nama} atau belum ada data siswa pada rombel ini.
                  </div>
                ) : (
                  <select
                    required
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white cursor-pointer"
                  >
                    {availableStudentsToAdd.map(s => {
                      const r = rombels.find(item => item.id === s.rombelId);
                      return (
                        <option key={s.id} value={s.id}>
                          {s.nama} ({r?.nama || s.rombelId} · NISN {s.nisn})
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Predikat Capaian Awal
                </label>
                <select
                  value={newPredikat}
                  onChange={(e) => {
                    const pred = e.target.value as any;
                    setNewPredikat(pred);
                    setNewKeterangan(getAutoDescription(currentEkskul.nama, pred));
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Sangat Baik">Sangat Baik (A)</option>
                  <option value="Baik">Baik (B)</option>
                  <option value="Cukup">Cukup (C)</option>
                  <option value="Kurang">Kurang (D)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Catatan Capaian / Deskripsi Kegiatan
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewKeterangan(getAutoDescription(currentEkskul.nama, newPredikat))}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Gunakan Template</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  placeholder="Contoh: Sangat aktif, disiplin, dan terampil dalam seluruh latihan dan penugasan..."
                  value={newKeterangan}
                  onChange={(e) => setNewKeterangan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
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
                Simpan & Tambahkan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
