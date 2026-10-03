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

/**
 * Saves state to Firestore cloud database so all devices stay in sync.
 * Includes debouncing for rapid changes.
 */
export async function syncStateToCloud(
  state: ERaporState,
  updatedBy: string = 'Pengguna e-Rapor'
): Promise<boolean> {
  return new Promise((resolve) => {
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }

    syncTimeout = setTimeout(async () => {
      try {
        const docRef = doc(db, COLLECTION_NAME, DOC_ID);
        
        // Clean state to ensure only valid JSON-serializable properties are saved
        const cleanPayload = {
          school: state.school,
          students: state.students,
          grades: state.grades,
          rombels: state.rombels,
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
            deviceOrigin: CURRENT_DEVICE_ID
          }
        };

        await setDoc(docRef, cleanPayload, { merge: true });
        resolve(true);
      } catch (error) {
        console.error('Failed to sync state to cloud:', error);
        try {
          handleFirestoreError(error, OperationType.WRITE, `${COLLECTION_NAME}/${DOC_ID}`);
        } catch (e) {
          // Handled
        }
        resolve(false);
      }
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
      return stateData as Partial<ERaporState>;
    }
    return null;
  } catch (error) {
    console.warn('Initial cloud fetch failed, falling back to local storage:', error);
    return null;
  }
}
