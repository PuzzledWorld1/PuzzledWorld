import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';


const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};


export const app =
  getApps().length
    ? getApps()[0]
    : initializeApp(firebaseConfig);


// Web uses the SDK's default (browser local storage) persistence.
// Native needs to be told explicitly to persist through AsyncStorage, or
// a signed-in session won't survive an app restart. Fast Refresh can
// re-run this module without unmounting the app, and initializeAuth()
// throws if called twice for the same app - falling back to getAuth()
// keeps that from crashing the dev session.
function createAuth() {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
}


export const auth = createAuth();

export const db = getFirestore(app);

export const storage = getStorage(app);
