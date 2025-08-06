// Simple Firebase connection test
import { db } from '../config/firebase';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';

export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Try to read from a test collection (this will fail if rules block access)
    const testRef = collection(db, 'test');
    const testQuery = query(testRef, limit(1));
    await getDocs(testQuery);
    console.log('✅ Firebase connection test: OK');
    return true;
  } catch (error: any) {
    console.log('❌ Firebase connection test: Failed', error.code, error.message);
    return false;
  }
};

export const testFirebaseWrite = async (): Promise<boolean> => {
  try {
    // Try to write a test document
    const testRef = collection(db, 'test');
    await addDoc(testRef, {
      message: 'Firebase test write',
      timestamp: new Date(),
    });
    console.log('✅ Firebase write test: OK');
    return true;
  } catch (error: any) {
    console.log('❌ Firebase write test: Failed', error.code, error.message);
    if (error.code === 'permission-denied') {
      console.log('🔧 Fix: Update your Firestore security rules (see FIRESTORE_RULES.md)');
    }
    return false;
  }
};

export const isFirebaseConfigured = (): boolean => {
  // Check if Firebase config has been replaced from defaults
  const config = db.app.options;
  return config.apiKey !== 'your-api-key' && config.projectId !== 'your-project-id';
};

export const getFirebaseStatus = async (): Promise<{
  configured: boolean;
  canRead: boolean;
  canWrite: boolean;
  projectId: string;
}> => {
  const configured = isFirebaseConfigured();
  let canRead = false;
  let canWrite = false;

  if (configured) {
    canRead = await testFirebaseConnection();
    canWrite = await testFirebaseWrite();
  }

  return {
    configured,
    canRead,
    canWrite,
    projectId: db.app.options.projectId || 'not-configured',
  };
};