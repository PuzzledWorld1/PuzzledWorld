const { onCall, HttpsError } = require('firebase-functions/https');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');
const { checkSafeSearch } = require('./safeSearchCheck');
const { addDailyGalleryArtwork } = require('./dailyGalleryArtwork');

admin.initializeApp();

const DAILY_SHARE_LIMIT = 5;

exports.addDailyGalleryArtwork = addDailyGalleryArtwork;


// CSAI Match is Google's hash-matching service for known CSAM (child
// sexual abuse material) - it is NOT a public API. Access requires
// applying and being approved at https://www.google.com/csai-match/,
// after which Google provides the actual endpoint/credentials and
// integration details for your approved project.
//
// UNTIL THAT APPROVAL HAPPENS AND THIS FUNCTION IS REPLACED WITH A REAL
// CALL, THIS IS A NO-OP AND PROVIDES NO CSAM PROTECTION. The
// safeSearchDetection check below only catches general adult/racy/violent
// content - it is not a CSAM-detection mechanism.
async function runCsaiMatchCheck(gcsUri) {
  logger.warn(
    'CSAI Match is not yet configured - skipping CSAM hash-match check. ' +
      'Apply at https://www.google.com/csai-match/ and replace this stub ' +
      'before relying on it for CSAM protection.',
    { gcsUri }
  );

  return { matched: false };
}


// Runs an uploaded shared-puzzle image through moderation and only
// publishes it (creates the public sharedPuzzles doc + copies the file
// to the public storage path) if it passes. A rejected image never
// becomes reachable - nothing under sharedPuzzles/ or shared/ exists
// until this function explicitly creates it, and Firestore/Storage rules
// block clients from creating those directly.
exports.moderateAndPublishSharedPuzzle = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'You must be signed in to share a puzzle.'
    );
  }

  const { shareId, size, difficultyLabel } = request.data || {};

  if (!shareId || !size) {
    throw new HttpsError(
      'invalid-argument',
      'Missing shareId or size.'
    );
  }

  const bucket = admin.storage().bucket();
  const stagingPath = `sharedStaging/${shareId}.jpg`;
  const publicPath = `shared/${shareId}.jpg`;

  const stagingFile = bucket.file(stagingPath);

  const [exists] = await stagingFile.exists();

  if (!exists) {
    throw new HttpsError(
      'not-found',
      'Uploaded image not found.'
    );
  }

  const gcsUri = `gs://${bucket.name}/${stagingPath}`;

  const cleanupAndReject = async (message) => {
    await stagingFile.delete().catch((error) => {
      logger.error(
        'Could not delete rejected staging image',
        error
      );
    });

    throw new HttpsError('permission-denied', message);
  };

  // Rate limit BEFORE the paid Vision API call, not after - no point
  // spending money moderating an upload that's going to be rejected for
  // being over quota anyway.
  const oneDayAgo = admin.firestore.Timestamp.fromMillis(
    Date.now() - 24 * 60 * 60 * 1000
  );

  const recentShares = await admin
    .firestore()
    .collection('sharedPuzzles')
    .where('createdBy', '==', request.auth.uid)
    .where('createdAt', '>=', oneDayAgo)
    .get();

  if (recentShares.size >= DAILY_SHARE_LIMIT) {
    logger.warn('Daily share limit hit', {
      uid: request.auth.uid,
      count: recentShares.size,
    });

    await cleanupAndReject(
      `You can only share up to ${DAILY_SHARE_LIMIT} puzzles per day. Try again tomorrow.`
    );
  }

  const csaiResult = await runCsaiMatchCheck(gcsUri);

  if (csaiResult.matched) {
    logger.error('CSAI Match hit - blocked share', {
      shareId,
    });

    await cleanupAndReject(
      'This image cannot be shared.'
    );
  }

  const { flagged, safeSearch } =
    await checkSafeSearch(gcsUri);

  if (flagged) {
    logger.warn('SafeSearch flagged image - blocked share', {
      shareId,
      safeSearch,
    });

    await cleanupAndReject(
      'This image contains content that cannot be shared publicly.'
    );
  }

  await stagingFile.move(publicPath);

  const publicFile = bucket.file(publicPath);
  await publicFile.makePublic();

  const imageDownloadUrl =
    `https://storage.googleapis.com/${bucket.name}/${publicPath}`;

  await admin
    .firestore()
    .collection('sharedPuzzles')
    .doc(shareId)
    .set({
      size,
      difficultyLabel: difficultyLabel ?? null,
      imageDownloadUrl,
      createdBy: request.auth.uid,
      createdAt:
        admin.firestore.FieldValue.serverTimestamp(),
    });

  return { shareId };
});


// Permanently deletes a user's account and everything tied to it - their
// Firestore data (in-progress puzzle, completed-puzzle history, favorited
// and completed gallery artworks), any puzzles they've shared publicly
// (both the Firestore doc and the public image in Storage), their
// resume-slot photo in Storage, and finally the Firebase Auth account
// itself. Runs via the Admin SDK, which bypasses both the Firestore/
// Storage security rules (clients can't list or delete sharedPuzzles
// themselves) and Firebase Auth's "recent login required" restriction -
// so this works even if the user signed in a while ago.
exports.deleteAccount = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'You must be signed in to delete your account.'
    );
  }

  const uid = request.auth.uid;
  const bucket = admin.storage().bucket();

  await admin
    .firestore()
    .recursiveDelete(
      admin.firestore().collection('users').doc(uid)
    );

  const sharedSnapshot = await admin
    .firestore()
    .collection('sharedPuzzles')
    .where('createdBy', '==', uid)
    .get();

  await Promise.all(
    sharedSnapshot.docs.map(async (sharedDoc) => {
      await bucket
        .file(`shared/${sharedDoc.id}.jpg`)
        .delete()
        .catch((error) => {
          logger.error(
            'Could not delete shared puzzle image',
            { shareId: sharedDoc.id, error }
          );
        });

      await sharedDoc.ref.delete();
    })
  );

  await bucket
    .deleteFiles({ prefix: `users/${uid}/` })
    .catch((error) => {
      logger.error(
        'Could not delete storage files for user',
        { uid, error }
      );
    });

  await admin.auth().deleteUser(uid);

  return { success: true };
});
