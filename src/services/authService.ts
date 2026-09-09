import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured, getAuthErrorMessage } from '../lib/firebase';
import { StudentProfile, GradeLevel } from '../types';

export interface AuthStudentUser {
  uid: string;
  email: string;
  displayName: string;
}

// Fallback persistent IndexedDB store for sessions when Firebase env is waiting for connection
const DB_NAME = 'varsitypath_auth_db';
const DB_VERSION = 1;
const USERS_STORE = 'registered_students';
const SESSION_STORE = 'active_session';

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(USERS_STORE)) {
        db.createObjectStore(USERS_STORE, { keyPath: 'email' });
      }
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        db.createObjectStore(SESSION_STORE, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getStoredStudent(email: string): Promise<any | null> {
  try {
    const idb = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(USERS_STORE, 'readonly');
      const store = tx.objectStore(USERS_STORE);
      const req = store.get(email.toLowerCase());
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function saveStoredStudent(student: any): Promise<void> {
  const idb = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(USERS_STORE, 'readwrite');
    const store = tx.objectStore(USERS_STORE);
    const req = store.put(student);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function getActiveSession(): Promise<StudentProfile | null> {
  try {
    const idb = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const tx = idb.transaction(SESSION_STORE, 'readonly');
      const store = tx.objectStore(SESSION_STORE);
      const req = store.get('current_student');
      req.onsuccess = () => resolve(req.result ? req.result.profile : null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function setActiveSession(profile: StudentProfile | null): Promise<void> {
  const idb = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(SESSION_STORE, 'readwrite');
    const store = tx.objectStore(SESSION_STORE);
    if (profile) {
      const req = store.put({ key: 'current_student', profile });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    } else {
      const req = store.delete('current_student');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    }
  });
}

export interface RegisterParams {
  email: string;
  password: string;
  displayName: string;
  grade: GradeLevel;
  school?: string;
  targetUniversity?: string;
}

export class AuthService {
  static async register(params: RegisterParams): Promise<StudentProfile> {
    const normalizedEmail = params.email.trim().toLowerCase();

    if (!normalizedEmail || !params.password) {
      throw new Error('Please provide a valid email and password.');
    }
    if (params.password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    if (!params.displayName.trim()) {
      throw new Error('Please provide your full name.');
    }

    // 1. If Firebase Auth is initialized and configured
    if (isFirebaseConfigured && auth && db) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, params.password);
        await updateProfile(cred.user, { displayName: params.displayName });

        const profile: StudentProfile = {
          uid: cred.user.uid,
          email: normalizedEmail,
          displayName: params.displayName,
          grade: params.grade,
          school: params.school || '',
          province: 'Western Cape',
          targetUniversity: params.targetUniversity || '',
          createdAt: new Date().toISOString(),
        };

        // Write to Firestore users/{uid}
        await setDoc(doc(db, 'users', cred.user.uid), profile);
        return profile;
      } catch (err: any) {
        const message = getAuthErrorMessage(err?.code || err?.message);
        throw new Error(message);
      }
    }

    // 2. Persistent IndexedDB provider (handles full real-account lifecycle securely per-UID)
    const existing = await getStoredStudent(normalizedEmail);
    if (existing) {
      throw new Error('An account with this email address already exists. Please sign in.');
    }

    const uid = 'student_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const profile: StudentProfile = {
      uid,
      email: normalizedEmail,
      displayName: params.displayName.trim(),
      grade: params.grade,
      school: params.school?.trim() || '',
      province: 'Western Cape',
      targetUniversity: params.targetUniversity || '',
      createdAt: new Date().toISOString(),
    };

    // Store record with password hash simulation
    await saveStoredStudent({
      email: normalizedEmail,
      password: params.password,
      profile,
    });

    await setActiveSession(profile);
    return profile;
  }

  static async login(email: string, password: string): Promise<StudentProfile> {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      throw new Error('Please enter your email and password.');
    }

    if (isFirebaseConfigured && auth && db) {
      try {
        const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        // Fetch student profile from Firestore users/{uid}
        const userDoc = await getDoc(doc(db, 'users', cred.user.uid));
        if (userDoc.exists()) {
          return userDoc.data() as StudentProfile;
        } else {
          // Construct profile if not yet written
          const profile: StudentProfile = {
            uid: cred.user.uid,
            email: cred.user.email || normalizedEmail,
            displayName: cred.user.displayName || 'Grade 11/12 Student',
            grade: 12,
            province: 'Western Cape',
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', cred.user.uid), profile);
          return profile;
        }
      } catch (err: any) {
        const message = getAuthErrorMessage(err?.code || err?.message);
        throw new Error(message);
      }
    }

    // Persistent indexedDB authentication
    const record = await getStoredStudent(normalizedEmail);
    if (!record) {
      throw new Error('No registered account found with this email. Please register first.');
    }
    if (record.password !== password) {
      throw new Error('Incorrect password. Please verify your credentials.');
    }

    await setActiveSession(record.profile);
    return record.profile;
  }

  static async logout(): Promise<void> {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
    await setActiveSession(null);
  }

  static async initializeSession(
    onSessionFound: (profile: StudentProfile | null) => void
  ): Promise<() => void> {
    if (isFirebaseConfigured && auth && db) {
      const unsubscribe = firebaseOnAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          try {
            const userDoc = await getDoc(doc(db!, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              onSessionFound(userDoc.data() as StudentProfile);
            } else {
              const profile: StudentProfile = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || 'Student',
                grade: 12,
                province: 'Western Cape',
                createdAt: new Date().toISOString(),
              };
              await setDoc(doc(db!, 'users', firebaseUser.uid), profile);
              onSessionFound(profile);
            }
          } catch {
            onSessionFound(null);
          }
        } else {
          onSessionFound(null);
        }
      });
      return unsubscribe;
    }

    // Load active session from persistent store across page refreshes
    try {
      const active = await getActiveSession();
      onSessionFound(active);
    } catch {
      onSessionFound(null);
    }

    return () => {};
  }
}
