import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../firebase/config';
import { deleteInProgressImage } from './puzzleImage';


function inProgressDocRef(uid) {
  return doc(db, 'users', uid, 'inProgress', 'current');
}


export async function saveInProgressPuzzle(uid, {
  size,
  difficultyLabel,
  totalPieces,
  trayPieces,
  loosePieces,
  imagePath,
  imageDownloadUrl,
}) {
  await setDoc(
    inProgressDocRef(uid),
    {
      size,
      difficultyLabel,
      totalPieces,
      trayPieces,
      loosePieces,
      imagePath,
      imageDownloadUrl,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}


export async function loadInProgressPuzzle(uid) {
  const snapshot = await getDoc(inProgressDocRef(uid));

  return snapshot.exists() ? snapshot.data() : null;
}


export async function hasInProgressPuzzle(uid) {
  const snapshot = await getDoc(inProgressDocRef(uid));

  return snapshot.exists();
}


export async function clearInProgressPuzzle(uid) {
  await deleteDoc(inProgressDocRef(uid));
  await deleteInProgressImage(uid);
}


export async function saveCompletedPuzzle(uid, {
  size,
  difficultyLabel,
  totalPieces,
  elapsedSeconds,
}) {
  await addDoc(
    collection(db, 'users', uid, 'completedPuzzles'),
    {
      size,
      difficultyLabel,
      totalPieces,
      elapsedSeconds,
      completedAt: serverTimestamp(),
    }
  );
}


export async function listCompletedPuzzles(uid, max = 20) {
  const completedQuery = query(
    collection(db, 'users', uid, 'completedPuzzles'),
    orderBy('completedAt', 'desc'),
    limit(max)
  );

  const snapshot = await getDocs(completedQuery);

  return snapshot.docs.map((docSnapshot) => ({
    id: docSnapshot.id,
    ...docSnapshot.data(),
  }));
}
