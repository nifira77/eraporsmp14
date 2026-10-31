import React, { useState, useRef } from 'react';
import { ERaporState, SchoolInfo } from '../types/erapor';
import { 
  UploadCloud, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  RotateCcw, 
  Download, 
  School, 
  Users, 
  GraduationCap, 
  FileSpreadsheet, 
  Calendar,
  Layers
} from 'lucide-react';

interface RestoreBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (restoredState: ERaporState) => void;
  currentState: ERaporState;
  onExportCurrent?: () => void;
}

interface BackupSummary {
  fileName: string;
  fileSize: string;
  schoolName: string;
  npsn: string;
  tahunAjaran: string;
  semester: string;
  tanggalRapor: string;
  studentCount: number;
  gradeCount: number;
  rombelCount: number;
  userCount: number;
  tpCount: number;
  noteCount: number;
  attendanceCount: number;
  ekskulCount: number;
}

export const RestoreBackupModal: React.FC<RestoreBackupModalProps> = ({
  isOpen,
  onClose,
  onRestore,
  currentState,
  onExportCurrent
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ERaporState | null>(null);
  const [summary, setSummary] = useState<BackupSummary | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const processJsonText = (text: string, file: File) => {
    setErrorMsg(null);
    try {
      const raw = JSON.parse(text);
      
      // Support raw state or wrapped state ({ state: ... } or { data: ... })
      const data: any = raw.state || raw.data || raw;

      // Basic validation
      if (!data || typeof data !== 'object') {
        throw new Error('File tidak berisi format objek JSON yang valid.');
      }

      // Check for at least some core fields
      const hasSchool = data.school && typeof data.school === 'object';
      const hasStudents = Array.isArray(data.students);
      const hasGrades = Array.isArray(data.grades);
      const hasRombels = Array.isArray(data.rombels);

      if (!hasSchool && !hasStudents && !hasGrades && !hasRombels) {
        throw new Error('File bukan merupakan cadangan e-Rapor SP yang valid. Tidak ditemukan data sekolah, siswa, nilai, atau rombel.');
      }

      // Normalization and fallback construction with currentState
      const school: SchoolInfo = {
        ...currentState.school,
        ...(data.school || {})
      };

      // Ensure proper school address and date if older backup
      if (school.kabupaten === 'Tulag Bawang Barat' || !school.kabupaten) {
        school.kabupaten = 'Tulang Bawang Barat';
      }
      if (school.tanggalRapor === '19 Desember 2026' || school.tanggalRapor === '17 Oktober 2026' || !school.tanggalRapor) {
        school.tanggalRapor = '3 November 2026';
      }

      const validatedState: ERaporState = {
        school,
        users: Array.isArray(data.users) && data.users.length > 0 ? data.users : currentState.users,
        currentUser: data.currentUser && data.currentUser.id ? data.currentUser : currentState.currentUser,
        rombels: Array.isArray(data.rombels) ? data.rombels : currentState.rombels,
        subjects: Array.isArray(data.subjects) ? data.subjects : currentState.subjects,
        learningObjectives: Array.isArray(data.learningObjectives) ? data.learningObjectives : currentState.learningObjectives,
        students: Array.isArray(data.students) ? data.students : currentState.students,
        grades: Array.isArray(data.grades) ? data.grades : currentState.grades,
        attendances: Array.isArray(data.attendances) ? data.attendances : currentState.attendances,
        extracurriculars: Array.isArray(data.extracurriculars) ? data.extracurriculars : currentState.extracurriculars,
        studentExtracurriculars: Array.isArray(data.studentExtracurriculars) ? data.studentExtracurriculars : currentState.studentExtracurriculars,
        notes: Array.isArray(data.notes) ? data.notes : currentState.notes,
        achievements: Array.isArray(data.achievements) ? data.achievements : currentState.achievements,
        isLocked: typeof data.isLocked === 'boolean' ? data.isLocked : currentState.isLocked
      };

      setParsedData(validatedState);
      setSelectedFile(file);

      // Create summary
      setSummary({
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        schoolName: validatedState.school?.namaSekolah || 'SMP Negeri 14 Tulang Bawang Barat',
        npsn: validatedState.school?.npsn || '-',
        tahunAjaran: validatedState.school?.tahunAjaran || '2026/2027',
        semester: validatedState.school?.semester || 'Ganjil',
        tanggalRapor: validatedState.school?.tanggalRapor || '3 November 2026',
        studentCount: validatedState.students?.length || 0,
        gradeCount: validatedState.grades?.length || 0,
        rombelCount: validatedState.rombels?.length || 0,
        userCount: validatedState.users?.length || 0,
        tpCount: validatedState.learningObjectives?.length || 0,
        noteCount: validatedState.notes?.length || 0,
        attendanceCount: validatedState.attendances?.length || 0,
        ekskulCount: validatedState.studentExtracurriculars?.length || 0
      });
    } catch (err: any) {
      console.error('Failed to parse backup JSON:', err);
      setErrorMsg(err.message || 'Gagal membaca file backup. Pastikan file berformat JSON yang valid.');
      setSelectedFile(null);
      setParsedData(null);
      setSummary(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json') && file.type !== 'application/json' && file.type !== '') {
      setErrorMsg('Harap pilih file dengan ekstensi .json');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processJsonText(text, file);
    };
    reader.onerror = () => {
      setErrorMsg('Terjadi kesalahan saat membaca file dari penyimpanan lokal Anda.');
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.name.endsWith('.json')) {
        setErrorMsg('Harap unggah file dengan format .json');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processJsonText(text, file);
      };
      reader.onerror = () => {
        setErrorMsg('Terjadi kesalahan saat membaca file yang di-drop.');
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmRestore = () => {
    if (!parsedData) return;

    setIsProcessing(true);
    setTimeout(() => {
      onRestore(parsedData);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 1600);
    }, 400);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedData(null);
    setSummary(null);
    setErrorMsg(null);
    setIsSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Restore / Pulihkan Backup e-Rapor</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Unggah file cadangan JSON untuk memulihkan seluruh data aplikasi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
            title="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Success Notification */}
          {isSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Data Berhasil Dipulihkan!
              </h4>
              <p className="text-xs text-slate-600 max-w-sm">
                Seluruh data sekolah, rombel, siswa, nilai sumatif, dan catatan wali kelas telah berhasil diperbarui dan disinkronkan.
              </p>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-[11.5px]">Gagal Membaca File Backup</p>
                    <p className="text-[11px] leading-relaxed text-rose-700">{errorMsg}</p>
                  </div>
                </div>
              )}

              {/* Upload Dropzone (When no file is selected yet) */}
              {!summary && (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50/60 scale-[1.01]' 
                      : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/80 bg-slate-50/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        Pilih File Backup (.json) atau Seret ke Sini
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Gunakan file backup e-Rapor yang telah Anda unduh sebelumnya
                      </p>
                    </div>
                    <div className="pt-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-blue-600 font-semibold text-xs shadow-2xs hover:bg-blue-50">
                        <FileCheck className="w-3.5 h-3.5" />
                        Jelajahi File
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* File Preview & Summary (When valid file is parsed) */}
              {summary && (
                <div className="space-y-3.5 animate-in fade-in duration-150">
                  {/* File Tag */}
                  <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate text-xs">{summary.fileName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Ukuran: {summary.fileSize}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg border border-slate-200 transition-colors shrink-0"
                    >
                      Ganti File
                    </button>
                  </div>

                  {/* Inspection Grid */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <div className="flex items-center gap-2">
                        <School className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-slate-800 text-xs">{summary.schoolName}</span>
                      </div>
                      <span className="text-[10.5px] font-mono text-slate-500">NPSN: {summary.npsn}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-center text-blue-600 mb-1">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div className="text-base font-extrabold text-slate-900">{summary.studentCount}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Peserta Didik</div>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-center text-emerald-600 mb-1">
                          <FileSpreadsheet className="w-4 h-4" />
                        </div>
                        <div className="text-base font-extrabold text-slate-900">{summary.gradeCount}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Data Nilai</div>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-center text-indigo-600 mb-1">
                          <Layers className="w-4 h-4" />
                        </div>
                        <div className="text-base font-extrabold text-slate-900">{summary.rombelCount}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Rombongan Belajar</div>
                      </div>

                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                        <div className="flex items-center justify-center text-purple-600 mb-1">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="text-base font-extrabold text-slate-900">{summary.userCount}</div>
                        <div className="text-[10px] text-slate-500 font-medium">Guru / PTK</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 pt-1 border-t border-slate-200/80 px-1 gap-1">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Semester {summary.semester} {summary.tahunAjaran}</span>
                      </div>
                      <div>
                        <span>Tgl Rapor: <strong>{summary.tanggalRapor}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Warning Box */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div className="text-[11px] space-y-1">
                      <p className="font-bold">Konfirmasi Penimpaan Data</p>
                      <p className="text-amber-800 leading-relaxed">
                        Data saat ini pada perangkat dan cloud akan digantikan dengan isi file backup ini. Jika diperlukan, unduh cadangan data saat ini terlebih dahulu.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Optional: Backup current data before restore */}
              {onExportCurrent && !summary && (
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-700 text-[11px]">Ingin mengamankan data saat ini dulu?</span>
                  </div>
                  <button
                    type="button"
                    onClick={onExportCurrent}
                    className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors shadow-2xs"
                  >
                    Unduh Backup Saat Ini
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!isSuccess && (
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={!summary || isProcessing}
              onClick={handleConfirmRestore}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memulihkan Data...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Pulihkan Sekarang (Restore)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
