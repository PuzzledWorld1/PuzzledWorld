import { Platform } from 'react-native';

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from 'firebase/auth';

import { httpsCallable } from 'firebase/functions';

import { auth, functions } from '../firebase/config';


const ERROR_MESSAGES = {
  'auth/email-already-in-use': 'That email already has an account - try signing in instead.',
  'auth/invalid-email': 'That email address doesn’t look right.',
  'auth/weak-password': 'Password should be at least 6 characters.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts - please wait a moment and try again.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
};


function friendlyError(error) {
  return ERROR_MESSAGES[error.code] || 'Something went wrong - please try again.';
}


export function subscribeToAuthChanges(callback) {
  return onAuthStateChanged(auth, callback);
}


export async function signUp(email, password) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error) {
    throw new Error(friendlyError(error));
  }
}


export async function signIn(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  } catch (error) {
    throw new Error(friendlyError(error));
  }
}


export async function signOutUser() {
  await signOut(auth);
}


// Deletes the signed-in user's account and all their data (see the
// deleteAccount Cloud Function in functions/index.js), then signs out
// locally so the app reflects the signed-out state immediately.
export async function deleteAccount() {
  const deleteAccountCall = httpsCallable(functions, 'deleteAccount');

  try {
    await deleteAccountCall();
  } catch (error) {
    throw new Error(friendlyError(error));
  }

  await signOut(auth);
}


// Native Google sign-in needs a dev-client build (expo-auth-session +
// real Google Cloud OAuth client IDs) that this app doesn't have set up
// yet - signInWithPopup only works on web.
export async function signInWithGoogleWeb() {
  if (Platform.OS !== 'web') {
    throw new Error('Google sign-in is only available on web right now.');
  }

  try {
    const credential = await signInWithPopup(auth, new GoogleAuthProvider());
    return credential.user;
  } catch (error) {
    throw new Error(friendlyError(error));
  }
}
