import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  setLogLevel 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Suppress excessive Firestore console logging
try {
  setLogLevel('silent');
} catch {}

// Global guard for internal Firestore SDK assertion crashes (e.g., ca9, b815 WatchChangeAggregator)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason?.message || event.reason || '');
    if (
      reasonStr.includes('INTERNAL ASSERTION FAILED') ||
      reasonStr.includes('WatchChangeAggregator') ||
      reasonStr.includes('TargetState') ||
      reasonStr.includes('(ID: ca9)') ||
      reasonStr.includes('(ID: b815)')
    ) {
      console.warn('[Firestore] Handled internal watch stream assertion gracefully:', reasonStr);
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = String(event.message || '');
    if (
      msg.includes('INTERNAL ASSERTION FAILED') ||
      msg.includes('WatchChangeAggregator') ||
      msg.includes('TargetState') ||
      msg.includes('(ID: ca9)') ||
      msg.includes('(ID: b815)')
    ) {
      console.warn('[Firestore] Suppressed internal assertion crash:', msg);
      event.preventDefault();
      event.stopPropagation();
    }
  });
}

// Initialize or reuse Firebase App instance
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Always provide firestoreDatabaseId from configuration
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Firebase Authentication and Google Auth Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Date tracking for quota handling
const getTodayKey = () => new Date().toISOString().slice(0, 10);
const QUOTA_KEY = 'erapor_firestore_quota_exhausted_date';

export function isQuotaExhaustedToday(): boolean {
  try {
    return localStorage.getItem(QUOTA_KEY) === getTodayKey();
  } catch {
    return false;
  }
}

export function markQuotaExhaustedToday(): void {
  try {
    localStorage.setItem(QUOTA_KEY, getTodayKey());
  } catch {}
}

export function clearQuotaExhaustedToday(): void {
  try {
    localStorage.removeItem(QUOTA_KEY);
  } catch {}
}

export async function reconnectFirebase(): Promise<boolean> {
  clearQuotaExhaustedToday();
  return true;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function isFirestoreQuotaError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  const code = (error as any)?.code || '';
  return (
    code === 'resource-exhausted' ||
    msg.includes('resource-exhausted') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('Quota limit exceeded') ||
    msg.includes('Free daily write units')
  );
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  if (isFirestoreQuotaError(error)) {
    markQuotaExhaustedToday();
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Info: ', JSON.stringify(errInfo));
}

// Connection test on initial boot as required by Firebase skill
let connectionTested = false;
export async function testConnection(): Promise<boolean> {
  if (connectionTested) return true;
  connectionTested = true;
  try {
    await getDocFromServer(doc(db, 'erapor_data', 'test_connection'));
    clearQuotaExhaustedToday();
    return true;
  } catch (error) {
    if (isFirestoreQuotaError(error)) {
      markQuotaExhaustedToday();
      return false;
    }
    // If error is just doc doesn't exist or client is online, connection works
    const msg = error instanceof Error ? error.message : String(error);
    if (!msg.includes('offline') && !msg.includes('network-request-failed')) {
      clearQuotaExhaustedToday();
      return true;
    }
    return false;
  }
}

export default {
  app,
  db,
  auth,
  googleProvider,
  testConnection,
  handleFirestoreError
};
