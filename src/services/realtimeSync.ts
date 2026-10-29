import { doc, onSnapshot, setDoc, getDoc, disableNetwork, enableNetwork } from 'firebase/firestore';
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

// Circuit breaker for Firestore daily write quota limit
let isNetworkDisabledDueToQuota = false;
let quotaExhaustedUntil = 0;
let lastSyncedHash = '';

export function isQuotaExhausted(): boolean {
  if (isQuotaExhaustedToday()) return true;
  if (isNetworkDisabledDueToQuota) return true;
  if (quotaExhaustedUntil > Date.now()) return true;
  return false;
}

export async function pauseNetworkDueToQuota() {
  markQuotaExhaustedToday();
  if (isNetworkDisabledDueToQuota) return;
  isNetworkDisabledDueToQuota = true;
  quotaExhaustedUntil = Date.now() + 60 * 60 * 1000; // 1 hour pause
  try {
    await disableNetwork(db);
  } catch (e) {
    // Handled
  }
}

export async function resumeNetworkFromQuota(): Promise<boolean> {
  try {
    clearQuotaExhaustedToday();
    isNetworkDisabledDueToQuota = false;
    quotaExhaustedUntil = 0;
    await enableNetwork(db);
    return true;
  } catch (e) {
    return false;
  }
}

function calculateStateFingerprint(state: ERaporState): string {
  try {
    return `${state.students?.length || 0}_${state.grades?.length || 0}_${state.users?.length || 0}_${state.rombels?.length || 0}_${state.learningObjectives?.length || 0}_${state.attendances?.length || 0}_${state.notes?.length || 0}_${state.school?.semester || ''}_${state.isLocked}`;
  } catch {
    return String(Date.now());
  }
}

/**
 * Subscribes to real-time updates from Firestore.
 * Whenever any device modifies the state in the cloud, all other devices receive the changes instantly.
 */
export function subscribeToCloudSync(
  onCloudUpdate: (cloudState: Partial<ERaporState>, metadata: CloudSyncMetadata) => void,
  onStatusChange?: (status: 'connected' | 'syncing' | 'offline' | 'error') => void
): () => void {
  if (isQuotaExhausted()) {
    onStatusChange?.('offline');
    return () => {};
  }

  const docRef = doc(db, COLLECTION_NAME, DOC_ID);

  const unsubscribe = onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const payload = snapshot.data();
        const { _metadata, ...stateData } = payload;
        
        // If the update came from another device or was just committed
        onCloudUpdate(stateData as Partial<ERaporState>, (_metadata || {}) as CloudSyncMetadata);
        onStatusChange?.('connected');
      } else {
        onStatusChange?.('connected');
      }
    },
    async (error) => {
      if (isFirestoreQuotaError(error)) {
        await pauseNetworkDueToQuota();
        onStatusChange?.('offline');
        return;
      }
      console.warn('Realtime sync snapshot status:', error);
      onStatusChange?.('offline');
    }
  );

  return unsubscribe;
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
        await pauseNetworkDueToQuota();
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
