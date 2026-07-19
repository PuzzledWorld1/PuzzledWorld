const vision = require('@google-cloud/vision');

const visionClient = new vision.ImageAnnotatorClient();

const REJECTED_LIKELIHOODS = new Set([
  'LIKELY',
  'VERY_LIKELY',
]);


// Shared by moderateAndPublishSharedPuzzle (user-submitted photos) and
// addDailyGalleryArtwork (auto-added gallery pieces) so both moderation
// paths use one Vision client and one flagging threshold.
async function checkSafeSearch(gcsUri) {
  const [visionResult] =
    await visionClient.safeSearchDetection(gcsUri);

  const safeSearch =
    visionResult.safeSearchAnnotation || {};

  const flagged =
    REJECTED_LIKELIHOODS.has(safeSearch.adult) ||
    REJECTED_LIKELIHOODS.has(safeSearch.racy) ||
    REJECTED_LIKELIHOODS.has(safeSearch.violence);

  return { flagged, safeSearch };
}

module.exports = {
  visionClient,
  REJECTED_LIKELIHOODS,
  checkSafeSearch,
};
