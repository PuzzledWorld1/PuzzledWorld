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

import { httpsCallable } from 'firebase/functions';

import { db, functions } from '../firebase/config';
import { deleteInProgressImage, uploadSharedStagingImage } from './puzzleImage';


function inProgressDocRef(uid) {
  return doc(db, 'users', uid, 'inProgress', 'current');
}


function sharedPuzzleDocRef(shareId) {
  return doc(db, 'sharedPuzzles', shareId);
}


// Creates a standalone, persistent copy of the puzzle (its own image and
// difficulty) under a fresh share ID, so the sender's local/in-progress
// image can keep changing without affecting a link already handed out.
//
// The image is uploaded to a private staging path first, then the
// moderateAndPublishSharedPuzzle Cloud Function runs it through content
// moderation (Cloud Vision SafeSearch, plus CSAI Match once that's
// configured - see functions/index.js) and only creates the public
// sharedPuzzles doc / copies the file to a public path if it passes.
// This function throws (with a user-facing message) if the image is
// rejected - no public artifact is ever created for rejected content.
export async function createSharedPuzzle({ size, difficultyLabel, image }) {
  const shareRef = doc(collection(db, 'sharedPuzzles'));
  const shareId = shareRef.id;

  await uploadSharedStagingImage(shareId, image);

  const moderateAndPublish = httpsCallable(
    functions,
    'moderateAndPublishSharedPuzzle'
  );

  const result = await moderateAndPublish({
    shareId,
    size,
    difficultyLabel,
  });

  return result.data.shareId;
}


export async function loadSharedPuzzle(shareId) {
  const snapshot = await getDoc(sharedPuzzleDocRef(shareId));

  return snapshot.exists() ? snapshot.data() : null;
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
