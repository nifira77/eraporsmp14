import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  disableNetwork, 
  enableNetwork, 
  setLogLevel 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Suppress excessive Firestore console logging when offline or during retry backoffs
try {
  setLogLevel('silent');
} catch {}

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

// Automatically disconnect network if marked exhausted for today
if (isQuotaExhaustedToday()) {
  try {
    disableNetwork(db).catch(() => {});
  } catch {}
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
    try {
      disableNetwork(db).catch(() => {});
    } catch {}
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot as required by Firebase skill
export async function testConnection(): Promise<boolean> {
  if (isQuotaExhaustedToday()) {
    return false;
  }

  try {
    await getDocFromServer(doc(db, 'erapor_data', 'test_connection'));
    return true;
  } catch (error) {
    if (isFirestoreQuotaError(error)) {
      markQuotaExhaustedToday();
      try {
        disableNetwork(db).catch(() => {});
      } catch {}
      return false;
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
