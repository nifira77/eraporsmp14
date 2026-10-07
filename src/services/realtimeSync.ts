import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
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

/**
 * Subscribes to real-time updates from Firestore.
 * Whenever any device modifies the state in the cloud, all other devices receive the changes instantly.
 */
export function subscribeToCloudSync(
  onCloudUpdate: (cloudState: Partial<ERaporState>, metadata: CloudSyncMetadata) => void,
  onStatusChange?: (status: 'connected' | 'syncing' | 'offline' | 'error') => void
): () => void {
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
    (error) => {
      console.warn('Realtime sync snapshot warning:', error);
      onStatusChange?.('offline');
      // Wrap with handleFirestoreError if critical
      try {
        handleFirestoreError(error, OperationType.GET, `${COLLECTION_NAME}/${DOC_ID}`);
      } catch (e) {
        // Logged error
      }
    }
  );

  return unsubscribe;
}

let syncTimeout: any = null;

export interface SyncOptions {
  immediate?: boolean;
  isExplicitClearAll?: boolean;
}

/**
 * Saves state to Firestore cloud database so all devices stay in sync.
 * Includes debouncing for rapid changes and protection against accidental wipeouts.
 */
export async function syncStateToCloud(
  state: ERaporState,
  updatedBy: string = 'Pengguna e-Rapor',
  options?: SyncOptions
): Promise<boolean> {
  const executeSync = async (): Promise<boolean> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, DOC_ID);

      let studentsToSave = state.students || [];
      let gradesToSave = state.grades || [];
      let rombelsToSave = state.rombels || [];

      // SAFETY PROTECTION: If incoming state has 0 students and this is NOT an explicit clear-all action,
      // verify if Firestore already holds student records, and preserve them.
      if (studentsToSave.length === 0 && !options?.isExplicitClearAll) {
        try {
          const currentSnap = await getDoc(docRef);
          if (currentSnap.exists()) {
            const currentData = currentSnap.data();
            const existingStudents = currentData?.students || [];
            if (existingStudents.length > 0) {
              studentsToSave = existingStudents;
              gradesToSave = currentData?.grades || gradesToSave;
              rombelsToSave = currentData?.rombels || rombelsToSave;
            }
          }
        } catch (checkErr) {
          console.warn('Safety check before sync failed, proceeding cautiously:', checkErr);
        }
      }
      
      // Clean state to ensure only valid JSON-serializable properties are saved
      const cleanPayload = {
        school: state.school,
        students: studentsToSave,
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
          studentsCount: studentsToSave.length
        }
      };

      await setDoc(docRef, cleanPayload, { merge: true });

      // If students exist, also preserve a backup registry in Firestore
      if (studentsToSave.length > 0) {
        const registryRef = doc(db, COLLECTION_NAME, 'students_registry');
        await setDoc(registryRef, {
          students: studentsToSave,
          count: studentsToSave.length,
          lastUpdatedBy: updatedBy,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(() => {});
      }

      return true;
    } catch (error) {
      console.error('Failed to sync state to cloud:', error);
      try {
        handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${DOC_ID}`);
      } catch (e) {
        // Handled
      }
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
    }, 400); // 400ms debounce
  });
}

/**
 * Fetch the latest cloud state once at application boot
 */
export async function fetchCloudStateOnce(): Promise<Partial<ERaporState> | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const { _metadata, ...stateData } = data;
      // If main_state students is empty, check backup registry
      if (!stateData.students || stateData.students.length === 0) {
        try {
          const registrySnap = await getDoc(doc(db, COLLECTION_NAME, 'students_registry'));
          if (registrySnap.exists() && registrySnap.data()?.students?.length > 0) {
            stateData.students = registrySnap.data().students;
          }
        } catch (e) {}
      }
      return stateData as Partial<ERaporState>;
    }
    return null;
  } catch (error) {
    console.warn('Initial cloud fetch failed, falling back to local storage:', error);
    return null;
  }
}
