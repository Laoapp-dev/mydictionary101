import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleAuthProvider.addScope('https://www.googleapis.com/auth/gmail.readonly');

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuthListener = (
  onSuccess: (user: User, token: string | null) => void,
  onFailure: () => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const idToken = await user.getIdToken();
      onSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      onFailure();
    }
  });
};

export const signInWithGoogle = async () => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    const idToken = await result.user.getIdToken();
    return { user: result.user, idToken, accessToken: cachedAccessToken };
  } catch (err) {
    console.error('Google Sign-In Error:', err);
    throw err;
  } finally {
    isSigningIn = false;
  }
};

export const logoutUser = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const getCachedAccessToken = () => cachedAccessToken;

// Connection test
export const testFirestoreConnection = async () => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    if (error?.message?.includes('client is offline')) {
      console.warn('Firestore offline connection check warning:', error);
    }
  }
};
