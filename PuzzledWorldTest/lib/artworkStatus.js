import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';

import { db } from '../firebase/config';


// Per-user, per-Gallery-artwork completion/favorite tracking, keyed by
// the artwork's own id from constants/galleryArtworks.js (not an
// auto-generated id) - existence of a doc IS the status, so marking/
// unmarking is just a set/delete on a known path rather than a query.
// Lives under users/{uid}/, already covered by that collection's
// existing "owner only" Firestore rule - no new rules needed.
function completedArtworkDocRef(uid, artworkId) {
  return doc(db, 'users', uid, 'completedArtworks', artworkId);
}


function favoriteArtworkDocRef(uid, artworkId) {
  return doc(db, 'users', uid, 'favoriteArtworks', artworkId);
}


export async function markArtworkCompleted(uid, artworkId) {
  await setDoc(
    completedArtworkDocRef(uid, artworkId),
    { completedAt: serverTimestamp() },
    { merge: true }
  );
}


export async function listCompletedArtworkIds(uid) {
  const snapshot = await getDocs(
    collection(db, 'users', uid, 'completedArtworks')
  );

  return snapshot.docs.map((docSnapshot) => docSnapshot.id);
}


export async function setArtworkFavorited(uid, artworkId, favorited) {
  if (favorited) {
    await setDoc(
      favoriteArtworkDocRef(uid, artworkId),
      { favoritedAt: serverTimestamp() },
      { merge: true }
    );
  } else {
    await deleteDoc(favoriteArtworkDocRef(uid, artworkId));
  }
}


export async function listFavoriteArtworkIds(uid) {
  const snapshot = await getDocs(
    collection(db, 'users', uid, 'favoriteArtworks')
  );

  return snapshot.docs.map((docSnapshot) => docSnapshot.id);
}
