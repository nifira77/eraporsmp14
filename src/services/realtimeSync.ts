import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { 
  db, 
  handleFirestoreError, 
  isFirestoreQuotaError, 
  OperationType,
  isQuotaExhaustedToday,
  markQuotaExhaustedToday,
  clearQuotaExhaustedToday
} from './firebase';
import { ERaporState } from '../types/erapor';

const COLLECTION_NAME = 'erapor_data';
const DOC_ID = 'main_state';

export interface CloudSyncMetadata {
  updatedAt: string;
  lastUpdatedBy?: string;
  deviceOrigin?: string;
}

// Generate a unique session identifier for this device/tab
export const CURRENT_DEVICE_ID = `dev-${Math.random().toString(36).substring(2, 9)}`;

// Circuit breaker for Firestore daily write quota limit (application-level, without calling disableNetwork)
let isNetworkPausedDueToQuota = false;
let quotaExhaustedUntil = 0;
let lastSyncedHash = '';

export function isQuotaExhausted(): boolean {
  if (isQuotaExhaustedToday()) return true;
  if (isNetworkPausedDueToQuota) return true;
  if (quotaExhaustedUntil > Date.now()) return true;
  return false;
}

export function pauseNetworkDueToQuota() {
  markQuotaExhaustedToday();
  isNetworkPausedDueToQuota = true;
  quotaExhaustedUntil = Date.now() + 60 * 60 * 1000; // 1 hour pause
}

export async function resumeNetworkFromQuota(): Promise<boolean> {
  clearQuotaExhaustedToday();
  isNetworkPausedDueToQuota = false;
  quotaExhaustedUntil = 0;
  return true;
}

function calculateStateFingerprint(state: ERaporState): string {
  try {
    const studentCount = state.students?.length || 0;
    const gradeCount = state.grades?.length || 0;
    const gradeSum = state.grades?.reduce((acc, g) => acc + (g.nilaiAkhirRapor || 0) + (g.nilaiAkhirSTS || 0) + (g.nilaiAkhirLM || 0), 0) || 0;
    const attendanceSum = state.attendances?.reduce((acc, a) => acc + (a.sakit || 0) + (a.izin || 0) + (a.alpa || 0), 0) || 0;
    const noteCount = state.notes?.length || 0;
    const noteTextLength = state.notes?.reduce((acc, n) => acc + (n.catatan?.length || 0), 0) || 0;
    const tpCount = state.learningObjectives?.length || 0;
    const userNames = state.users?.map(u => `${u.id}:${u.name}:${u.role}:${u.rombelId || ''}`).join(';') || '';
    const schoolStamp = `${state.school?.namaSekolah || ''}_${state.school?.semester || ''}_${state.school?.tahunAjaran || ''}_${state.school?.tanggalRapor || ''}`;

    return `${studentCount}_${gradeCount}_${gradeSum}_${attendanceSum}_${noteCount}_${noteTextLength}_${tpCount}_${state.isLocked}_${schoolStamp}_${userNames}`;
  } catch {
    return String(Date.now());
  }
}

/**
 * Subscribes to real-time updates from Firestore.
 * Safely guards against unmounted callback race conditions and SDK internal assertion states.
 */
export function subscribeToCloudSync(
  onCloudUpdate: (cloudState: Partial<ERaporState>, metadata: CloudSyncMetadata) => void,
  onStatusChange?: (status: 'connected' | 'syncing' | 'offline' | 'error') => void,
  onCloudEmpty?: () => void
): () => void {
  if (isQuotaExhausted()) {
    onStatusChange?.('offline');
    return () => {};
  }

  let isUnsubscribed = false;
  let activeUnsubscribe: (() => void) | null = null;

  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);

    activeUnsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (isUnsubscribed) return;

        try {
          if (snapshot.exists()) {
            const payload = snapshot.data();
            const { _metadata, ...stateData } = payload;
            
            onCloudUpdate(stateData as Partial<ERaporState>, (_metadata || {}) as CloudSyncMetadata);
            onStatusChange?.('connected');
          } else {
            // Cloud document does not exist yet (first-time deployment)
            onCloudEmpty?.();
            onStatusChange?.('connected');
          }
        } catch (innerErr) {
          console.warn('[RealtimeSync] Error processing snapshot data:', innerErr);
        }
      },
      (error) => {
        if (isUnsubscribed) return;

        if (isFirestoreQuotaError(error)) {
          pauseNetworkDueToQuota();
          onStatusChange?.('offline');
          return;
        }

        const msg = String(error?.message || error || '');
        if (msg.includes('INTERNAL ASSERTION FAILED') || msg.includes('WatchChangeAggregator')) {
          console.warn('[RealtimeSync] Internal watch stream assertion intercepted cleanly:', msg);
          onStatusChange?.('connected');
          return;
        }

        console.warn('Realtime sync snapshot status:', msg);
        onStatusChange?.('offline');
      }
    );
  } catch (err) {
    console.warn('[RealtimeSync] Could not initialize onSnapshot listener:', err);
    onStatusChange?.('offline');
  }

  return () => {
    isUnsubscribed = true;
    if (activeUnsubscribe) {
      try {
        activeUnsubscribe();
      } catch (e) {
        // Suppress any teardown assertion errors from SDK internal queue
        console.warn('[RealtimeSync] Cleaned up snapshot listener with notice:', e);
      }
      activeUnsubscribe = null;
    }
  };
}

let syncTimeout: any = null;

export interface SyncOptions {
  immediate?: boolean;
  isExplicitClearAll?: boolean;
  force?: boolean;
}

/**
 * Saves state to Firestore cloud database so all devices stay in sync.
 * Includes debouncing for rapid changes and protection against accidental wipeouts and quota exhaustion.
 */
export async function syncStateToCloud(
  state: ERaporState,
  updatedBy: string = 'Pengguna e-Rapor',
  options?: SyncOptions
): Promise<boolean> {
  // If Firestore quota is exhausted, seamlessly operate in localStorage mode
  if (isQuotaExhausted()) {
    return false;
  }

  const currentFingerprint = calculateStateFingerprint(state);
  if (!options?.force && !options?.immediate && currentFingerprint === lastSyncedHash) {
    return true; // No material change in state
  }

  const executeSync = async (): Promise<boolean> => {
    if (isQuotaExhausted()) {
      return false;
    }

    try {
      const docRef = doc(db, COLLECTION_NAME, DOC_ID);

      const studentsToSave = state.students || [];
      const gradesToSave = state.grades || [];
      const rombelsToSave = state.rombels || [];

      // Sanitize students photo sizes to prevent exceeding Firestore document limit
      const sanitizedStudents = studentsToSave.map(s => {
        if (s.foto && s.foto.length > 60000) {
          return { ...s, foto: undefined };
        }
        return s;
      });

      // Clean state to ensure only valid JSON-serializable properties are saved
      const cleanPayload = {
        school: state.school,
        students: sanitizedStudents,
        grades: gradesToSave,
        rombels: rombelsToSave,
        subjects: state.subjects,
        learningObjectives: state.learningObjectives,
        attendances: state.attendances,
        extracurriculars: state.extracurriculars,
        studentExtracurriculars: state.studentExtracurriculars,
        notes: state.notes,
        achievements: state.achievements,
        users: state.users,
        isLocked: state.isLocked,
        _metadata: {
          updatedAt: new Date().toISOString(),
          lastUpdatedBy: updatedBy,
          deviceOrigin: CURRENT_DEVICE_ID,
          isExplicitClearAll: Boolean(options?.isExplicitClearAll),
          studentsCount: sanitizedStudents.length
        }
      };

      await setDoc(docRef, cleanPayload, { merge: true });
      lastSyncedHash = currentFingerprint;
      return true;
    } catch (error) {
      if (isFirestoreQuotaError(error)) {
        console.warn('[RealtimeSync] Kuota harian Firestore gratis tercapai. Beralih ke mode offline lokal.');
        pauseNetworkDueToQuota();
        return false;
      }
      console.warn('Failed to sync state to cloud, stored locally:', error);
      return false;
    }
  };

  if (options?.immediate) {
    if (syncTimeout) {
      clearTimeout(syncTimeout);
      syncTimeout = null;
    }
    return executeSync();
  }

  return new Promise((resolve) => {
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }

    syncTimeout = setTimeout(async () => {
      const res = await executeSync();
      resolve(res);
    }, 1500); // 1.5s debounce to conserve quota
  });
}

/**
 * Fetch the latest cloud state once at application boot
 */
export async function fetchCloudStateOnce(): Promise<Partial<ERaporState> | null> {
  if (isQuotaExhausted()) {
    return null;
  }
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const { _metadata, ...stateData } = data;
      return stateData as Partial<ERaporState>;
    }
    return null;
  } catch (error) {
    if (isFirestoreQuotaError(error)) {
      pauseNetworkDueToQuota();
      return null;
    }
    console.warn('Initial cloud fetch failed, falling back to local storage:', error);
    return null;
  }
}
