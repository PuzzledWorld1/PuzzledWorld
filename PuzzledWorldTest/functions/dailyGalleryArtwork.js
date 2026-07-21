const { onSchedule } = require('firebase-functions/scheduler');
const { logger } = require('firebase-functions');
const admin = require('firebase-admin');

const { checkSafeSearch } = require('./safeSearchCheck');
const pool = require('./dailyArtworkPool.json');

// How many random candidates to try in one run before giving up for the
// day - a single SafeSearch-flagged pick shouldn't silently skip a whole
// day if the pool has plenty of other unused options left.
const MAX_ATTEMPTS = 5;

// Gallery art is auto-published with no human review, so it holds to a
// tighter bar than the shared checkSafeSearch threshold (LIKELY/
// VERY_LIKELY) used for user-submitted photos - even a "POSSIBLE" rating
// on adult/racy content is enough to skip a candidate here, so the
// gallery stays nudity-free rather than merely low-risk.
const NUDITY_RISK_LIKELIHOODS = new Set([
  'POSSIBLE',
  'LIKELY',
  'VERY_LIKELY',
]);


function commonsFilePathUrl(filename, width) {
  return (
    'https://commons.wikimedia.org/wiki/Special:FilePath/' +
    encodeURIComponent(filename) +
    `?width=${width}`
  );
}


function shuffle(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}


// Downloads one candidate from Wikimedia Commons, stages it in Storage,
// runs it through the same SafeSearch check used for user-submitted
// photos, and either publishes it (moves to the public path, writes the
// Firestore doc) or cleans up and reports failure so the caller can try
// the next candidate.
async function tryPublishCandidate(candidate, db, bucket) {
  const stagingPath = `dailyArtworkStaging/${candidate.id}.jpg`;
  const publicPath = `galleryArtworks/${candidate.id}.jpg`;
  const stagingFile = bucket.file(stagingPath);

  try {
    const sourceUrl = commonsFilePathUrl(candidate.filename, 1400);
    const response = await fetch(sourceUrl);

    if (!response.ok) {
      logger.warn('Could not download daily artwork candidate', {
        id: candidate.id,
        status: response.status,
      });

      return false;
    }

    const contentType =
      response.headers.get('content-type') || 'image/jpeg';

    const buffer = Buffer.from(await response.arrayBuffer());

    await stagingFile.save(buffer, { contentType });

    const gcsUri = `gs://${bucket.name}/${stagingPath}`;
    const { flagged, safeSearch } = await checkSafeSearch(gcsUri);

    const nudityRisk =
      NUDITY_RISK_LIKELIHOODS.has(safeSearch.adult) ||
      NUDITY_RISK_LIKELIHOODS.has(safeSearch.racy);

    if (flagged || nudityRisk) {
      logger.warn('SafeSearch flagged daily artwork candidate - skipping', {
        id: candidate.id,
        safeSearch,
      });

      await stagingFile.delete().catch((error) => {
        logger.error('Could not delete flagged staging image', {
          id: candidate.id,
          error,
        });
      });

      return false;
    }

    await stagingFile.move(publicPath);

    const publicFile = bucket.file(publicPath);
    await publicFile.makePublic();

    const imageUrl =
      `https://storage.googleapis.com/${bucket.name}/${publicPath}`;

    await db
      .collection('galleryArtworks')
      .doc(candidate.id)
      .set({
        title: candidate.title,
        artist: candidate.artist,
        year: candidate.year,
        imageUrl,
        sourceFilename: candidate.filename,
        addedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return true;
  } catch (error) {
    logger.error('Error publishing daily artwork candidate', {
      id: candidate.id,
      error: error.message,
    });

    await stagingFile.delete().catch(() => {});

    return false;
  }
}


// Once a day, adds one new public-domain artwork to the gallery without
// requiring an app update: picks a random unused candidate from
// dailyArtworkPool.json, moderates it with SafeSearch (plus the extra
// NUDITY_RISK_LIKELIHOODS check above), and publishes it if it passes.
// See functions/dailyArtworkPool.json for how to top up the candidate
// list once it runs low - the pool is a curated list of low-nudity-risk
// NGA works, but SafeSearch (not manual pre-viewing) is the real gate
// that keeps the published gallery nudity-free.
exports.addDailyGalleryArtwork = onSchedule(
  {
    schedule: 'every day 06:00',
    timeZone: 'America/New_York',
  },

  async () => {
    const db = admin.firestore();
    const bucket = admin.storage().bucket();

    const existingSnapshot =
      await db.collection('galleryArtworks').get();

    const usedIds = new Set(
      existingSnapshot.docs.map((doc) => doc.id)
    );

    const unused = pool.filter(
      (candidate) => !usedIds.has(candidate.id)
    );

    if (unused.length === 0) {
      logger.warn(
        'Daily artwork pool exhausted - no unused candidates left. ' +
          'Top up functions/dailyArtworkPool.json.'
      );

      return;
    }

    const attempts = shuffle(unused).slice(0, MAX_ATTEMPTS);

    for (const candidate of attempts) {
      const published = await tryPublishCandidate(
        candidate,
        db,
        bucket
      );

      if (published) {
        logger.log('Published daily gallery artwork', {
          id: candidate.id,
        });

        return;
      }
    }

    logger.error(
      'All daily artwork candidates were flagged or failed - ' +
        'nothing published today',
      { attempted: attempts.map((c) => c.id) }
    );
  }
);
