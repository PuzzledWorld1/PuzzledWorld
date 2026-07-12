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


export async function deleteInProgressImage(uid) {
  try {
    await deleteObject(inProgressImageRef(uid));
  } catch (error) {
    if (error.code !== 'storage/object-not-found') {
      throw error;
    }
  }
}
