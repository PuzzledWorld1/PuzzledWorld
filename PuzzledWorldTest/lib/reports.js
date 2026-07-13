import { ref, uploadBytes } from 'firebase/storage';
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';

import { db, storage } from '../firebase/config';


// A write-only "mailbox" for flagged content - clients can create a
// report (image + metadata) but can never read reports back (enforced by
// firestore.rules/storage.rules), so this is purely for manual review via
// the Firebase console/Admin SDK, not an automated moderation path.
export async function reportImage({ uid, localImageUri, context }) {
  const reportRef = doc(collection(db, 'reports'));
  const reportId = reportRef.id;

  const response = await fetch(localImageUri);
  const blob = await response.blob();

  const imageRef = ref(storage, `reports/${reportId}.jpg`);

  await uploadBytes(imageRef, blob, { contentType: 'image/jpeg' });

  await setDoc(reportRef, {
    reportedBy: uid ?? null,
    imagePath: imageRef.fullPath,
    context: context ?? null,
    createdAt: serverTimestamp(),
  });

  return reportId;
}
