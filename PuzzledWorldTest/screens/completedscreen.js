import { useEffect, useState } from 'react';

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';

import { Asset } from 'expo-asset';
import { File, Paths } from 'expo-file-system';

import { GALLERY_ARTWORKS } from '../constants/galleryArtworks';
import ThemeToggle from '../components/ThemeToggle';
import ArtworkTile from '../components/ArtworkTile';
import { withAppFont } from '../constants/typography';
import {
  listCompletedArtworkIds,
  listFavoriteArtworkIds,
  setArtworkFavorited,
} from '../lib/artworkStatus';


function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ]);
}


async function resolveArtworkImage(artwork) {
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


// The "Completed" folder - every Gallery artwork this account has
// finished a puzzle of at least once. Picking one starts a fresh puzzle
// with it again, same as the main Gallery screen.
export default function CompletedScreen({
  setScreen,
  setImage,
  setImageOrientation,
  setArtworkTitle,
  setArtworkArtist,
  setArtworkId,
  user,
  colors,
  themeMode,
  toggleThemeMode,
}) {
  const styles = getStyles(colors);

  const [pickingId, setPickingId] =
    useState(null);

  const [completedIds, setCompletedIds] =
    useState([]);

  const [favoriteIds, setFavoriteIds] =
    useState([]);

  const [loaded, setLoaded] =
    useState(false);

  useEffect(() => {
    if (!user) {
      setCompletedIds([]);
      setFavoriteIds([]);
      setLoaded(true);
      return;
    }

    Promise.all([
      listCompletedArtworkIds(user.uid),
      listFavoriteArtworkIds(user.uid),
    ]).then(([completed, favorites]) => {
      setCompletedIds(completed);
      setFavoriteIds(favorites);
      setLoaded(true);
    });
  }, [user]);


  const completedArtworks =
    GALLERY_ARTWORKS.filter((artwork) =>
      completedIds.includes(artwork.id)
    );


  const pickArtwork = async (artwork) => {
    if (pickingId) {
      return;
    }

    setPickingId(artwork.id);

    try {
      const uri = await resolveArtworkImage(artwork);

      setImage(uri);
      setImageOrientation(1);
      setArtworkTitle(artwork.title);
      setArtworkArtist(artwork.artist);
      setArtworkId(artwork.id);
      setScreen('menu');
    } catch (error) {
      console.log(
        'Could not load gallery artwork:',
        error
      );

      alert(
        'Could not load that artwork. Please try again.'
      );
    } finally {
      setPickingId(null);
    }
  };


  const toggleFavorite = async (artwork) => {
    if (!user) {
      alert('Sign in to save favorites.');
      return;
    }

    const isFavorited =
      favoriteIds.includes(artwork.id);

    setFavoriteIds((current) =>
      isFavorited
        ? current.filter((id) => id !== artwork.id)
        : [...current, artwork.id]
    );

    try {
      await setArtworkFavorited(
        user.uid,
        artwork.id,
        !isFavorited
      );
    } catch (error) {
      console.log(
        'Could not update favorite:',
        error
      );

      setFavoriteIds((current) =>
        isFavorited
          ? [...current, artwork.id]
          : current.filter(
              (id) => id !== artwork.id
            )
      );
    }
  };


  return (
    <View style={styles.container}>
      <StatusBar style={colors.statusBarStyle} />

      <Text style={styles.title}>
        ✅ Completed
      </Text>

      {!user && (
        <Text style={styles.emptyText}>
          Sign in to track completed puzzles.
        </Text>
      )}

      {user && loaded && completedArtworks.length === 0 && (
        <Text style={styles.emptyText}>
          Finish a Gallery puzzle to see it here.
        </Text>
      )}

      <FlatList
        style={styles.list}
        data={completedArtworks}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <ArtworkTile
            artwork={item}
            picking={pickingId === item.id}
            completed
            favorited={favoriteIds.includes(item.id)}
            onPress={() => pickArtwork(item)}
            onToggleFavorite={() =>
              toggleFavorite(item)
            }
            colors={colors}
          />
        )}
      />

      <View style={styles.footer}>
        <Pressable
          style={styles.backButton}
          onPress={() => setScreen('gallery')}
        >
          <Text style={styles.backText}>
            Back
          </Text>
        </Pressable>

        <ThemeToggle
          themeMode={themeMode}
          toggleThemeMode={toggleThemeMode}
        />
      </View>
    </View>
  );
}


function getStyles(colors) {
  return StyleSheet.create(withAppFont({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      paddingTop: 55,
      paddingHorizontal: 16,
    },

    title: {
      color: colors.textPrimary,
      fontSize: 28,
      fontWeight: 'bold',
    },

    emptyText: {
      color: colors.textSecondary,
      fontSize: 13,
      textAlign: 'center',
      marginTop: 16,
      paddingHorizontal: 20,
    },

    list: {
      flex: 1,
      width: '100%',
    },

    grid: {
      paddingTop: 16,
      paddingBottom: 12,
    },

    row: {
      justifyContent: 'space-evenly',
    },

    footer: {
      alignItems: 'center',
      marginBottom: 36,
    },

    backButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
    },

    backText: {
      color: colors.textSecondary,
      fontSize: 16,
    },
  }));
}
