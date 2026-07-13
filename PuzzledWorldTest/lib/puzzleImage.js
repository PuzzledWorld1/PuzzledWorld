import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

import { storage } from '../firebase/config';


function inProgressImageRef(uid) {
  return ref(storage, `users/${uid}/inProgress.jpg`);
}


// Every user gets exactly one "resume slot" image, overwritten each time
// a new puzzle is started - this is what makes saving an in-progress
// puzzle possible without turning into a general photo library.
export async function uploadInProgressImage(uid, localFileUri) {
  const response = await fetch(localFileUri);
  const blob = await response.blob();

  const imageRef = inProgressImageRef(uid);

  await uploadBytes(imageRef, blob, { contentType: 'image/jpeg' });

  const downloadUrl = await getDownloadURL(imageRef);

  return {
    path: imageRef.fullPath,
    downloadUrl,
  };
}


function sharedStagingImageRef(shareId) {
  return ref(storage, `sharedStaging/${shareId}.jpg`);
}


// A shared puzzle's image is uploaded here FIRST, to a path only the
// uploader can write to and nobody (not even the uploader) can read
// back - the moderateAndPublishSharedPuzzle Cloud Function is the only
// thing that ever reads it, to run SafeSearch/CSAI Match before the
// image is copied to the actual public `shared/` path. Storage rules
// enforce that clients can never write directly to `shared/`, so a
// rejected image can never become publicly reachable.
export async function uploadSharedStagingImage(shareId, localFileUri) {
  const response = await fetch(localFileUri);
  const blob = await response.blob();

  const imageRef = sharedStagingImageRef(shareId);

  await uploadBytes(imageRef, blob, { contentType: 'image/jpeg' });

  return imageRef.fullPath;
}


export async function deleteInProgressImage(uid) {
  try {
    await deleteObject(inProgressImageRef(uid));
  } catch (error) {
    if (error.code !== 'storage/object-not-found') {
      throw error;
    }
  }
}
