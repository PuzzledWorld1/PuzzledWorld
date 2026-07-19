import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs } from 'firebase/firestore';

import { db } from '../firebase/config';


const CACHE_KEY = 'puzzledworld:remoteGalleryArtworks';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;


// Artwork added by the addDailyGalleryArtwork Cloud Function - server-
// hosted only, no bundled localImage, so the app never needs an update
// to pick up new pieces. Shaped to match constants/galleryArtworks.js
// entries (id/title/artist/year/localImage/remoteUrl) so screens can
// merge the two lists and treat every artwork the same way.
function toArtwork(docSnapshot) {
  const data = docSnapshot.data();

  return {
    id: docSnapshot.id,
    title: data.title,
    artist: data.artist,
    year: data.year,
    localImage: null,
    remoteUrl: data.imageUrl,

    // Millis, not a Firestore Timestamp - has to survive a JSON
    // round-trip through the AsyncStorage cache below.
    addedAt: data.addedAt?.toMillis?.() ?? null,
  };
}


// True only on the same calendar day (local time) the piece was added,
// so the "NEW" badge disappears on its own the next day - never a
// stored flag to clear, just re-evaluated each time the tile renders.
export function isArtworkNew(artwork) {
  if (!artwork?.addedAt) {
    return false;
  }

  const addedDate = new Date(artwork.addedAt);
  const now = new Date();

  return (
    addedDate.getFullYear() === now.getFullYear() &&
    addedDate.getMonth() === now.getMonth() &&
    addedDate.getDate() === now.getDate()
  );
}


async function fetchRemoteGalleryArtworks() {
  const snapshot = await getDocs(
    collection(db, 'galleryArtworks')
  );

  // Newest first, so the most recently automated piece is the one
  // shown at the very top of the gallery.
  return snapshot.docs
    .map(toArtwork)
    .sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0));
}


// Cached in AsyncStorage so repeat gallery visits (and offline launches)
// don't need a fresh Firestore query every time - the collection only
// grows by one entry a day, so a half-day-stale cache is a non-issue.
export async function getRemoteGalleryArtworks() {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);

    if (cached) {
      const { artworks, cachedAt } = JSON.parse(cached);

      if (Date.now() - cachedAt < CACHE_TTL_MS) {
        return artworks;
      }
    }
  } catch (error) {
    console.log(
      'Could not read cached gallery catalog:',
      error
    );
  }

  try {
    const artworks = await fetchRemoteGalleryArtworks();

    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ artworks, cachedAt: Date.now() })
    );

    return artworks;
  } catch (error) {
    console.log(
      'Could not fetch remote gallery catalog:',
      error
    );

    // Stale cache (if any) beats nothing - fall back to it even past
    // its TTL rather than showing zero remote artwork on a network blip.
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);

      if (cached) {
        return JSON.parse(cached).artworks;
      }
    } catch (fallbackError) {
      console.log(
        'Could not read fallback cached gallery catalog:',
        fallbackError
      );
    }

    return [];
  }
}
