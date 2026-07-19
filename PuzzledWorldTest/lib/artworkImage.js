import { Asset } from 'expo-asset';
import { File, Paths } from 'expo-file-system';


function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ]);
}


// Tries the full-resolution remote copy first (better quality puzzle
// pieces); if that's unreachable or too slow, falls back to the
// lower-res copy bundled with the app, which works with zero
// connectivity since it's part of the app binary. Artwork added by the
// daily Cloud Function has no bundled copy (localImage is null) - it's
// remote-only, so there's nothing to fall back to and a failed/slow
// download just surfaces as an error to the caller.
export async function resolveArtworkImage(artwork) {
  try {
    const destination = new File(
      Paths.cache,
      `${artwork.id}.jpg`
    );

    const downloaded = await withTimeout(
      File.downloadFileAsync(
        artwork.remoteUrl,
        destination,
        { idempotent: true }
      ),
      8000
    );

    return downloaded.uri;
  } catch (error) {
    if (!artwork.localImage) {
      throw error;
    }

    console.log(
      'Falling back to bundled artwork copy:',
      error
    );

    const asset = await Asset.fromModule(
      artwork.localImage
    ).downloadAsync();

    return asset.localUri ?? asset.uri;
  }
}
