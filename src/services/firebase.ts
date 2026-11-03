import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import * as FirebaseAuth from '@firebase/auth';
import {
  getAuth,
  initializeAuth,
  type Auth,
  type Persistence,
} from '@firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  type Firestore,
} from 'firebase/firestore';
import { Platform } from 'react-native';

import { env, exigirFirebase } from '@/config/env';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function firebaseApp(): FirebaseApp {
  if (app) return app;
  exigirFirebase();
  app = getApps()[0] ?? initializeApp(env.firebase);
  return app;
}

function persistenciaNativa(): Persistence | null {
  const obtener = (
    FirebaseAuth as unknown as {
      getReactNativePersistence?: (storage: typeof AsyncStorage) => Persistence;
    }
  ).getReactNativePersistence;
  if (!obtener) return null;
  return obtener(AsyncStorage);
}

export function authFirebase(): Auth {
  if (auth) return auth;
  const firebase = firebaseApp();
  try {
    const persistence = Platform.OS === 'web' ? null : persistenciaNativa();
    auth = persistence
      ? initializeAuth(firebase, { persistence })
      : initializeAuth(firebase);
  } catch {
    auth = getAuth(firebase);
  }
  return auth;
}

export function dbFirebase(): Firestore {
  if (db) return db;
  const firebase = firebaseApp();
  try {
    db = initializeFirestore(firebase, { localCache: persistentLocalCache() });
  } catch {
    try {
      db = getFirestore(firebase);
    } catch {
      db = initializeFirestore(firebase, { localCache: memoryLocalCache() });
    }
  }
  return db;
}
