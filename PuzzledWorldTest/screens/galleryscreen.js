import { useEffect, useState } from 'react';

import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';

import { GALLERY_ARTWORKS } from '../constants/galleryArtworks';
import ThemeToggle from '../components/ThemeToggle';
import ArtworkTile from '../components/ArtworkTile';
import { withAppFont } from '../constants/typography';
import { resolveArtworkImage } from '../lib/artworkImage';
import {
  getRemoteGalleryArtworks,
  isArtworkNew,
} from '../lib/galleryCatalog';
import {
  listCompletedArtworkIds,
  listFavoriteArtworkIds,
  setArtworkFavorited,
} from '../lib/artworkStatus';


export default function GalleryScreen({
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

  const [allArtworks, setAllArtworks] =
    useState(GALLERY_ARTWORKS);

  useEffect(() => {
    if (!user) {
      setCompletedIds([]);
      setFavoriteIds([]);
      return;
    }

    listCompletedArtworkIds(user.uid).then(
      setCompletedIds
    );

    listFavoriteArtworkIds(user.uid).then(
      setFavoriteIds
    );
  }, [user]);

  // The bundled artworks render immediately; daily additions from the
  // addDailyGalleryArtwork Cloud Function merge in once fetched, ahead
  // of the bundled set, so the newest automated pieces are the first
  // thing browsers see.
  useEffect(() => {
    getRemoteGalleryArtworks().then((remoteArtworks) => {
      setAllArtworks([
        ...remoteArtworks,
        ...GALLERY_ARTWORKS,
      ]);
    });
  }, []);


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
      alert(
        'Sign in to save favorites.'
      );

      return;
    }

    const isFavorited =
      favoriteIds.includes(artwork.id);

    setFavoriteIds((current) =>
      isFavorited
        ? current.filter(
            (id) => id !== artwork.id
          )
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

      // Roll back the optimistic update on failure.
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
        Gallery
      </Text>

      <View style={styles.folderRow}>
        <Pressable
          style={styles.folderButton}
          onPress={() => setScreen('completed')}
        >
          <Text style={styles.folderButtonText}>
            ✅ Completed
          </Text>
        </Pressable>

        <Pressable
          style={styles.folderButton}
          onPress={() => setScreen('favorites')}
        >
          <Text style={styles.folderButtonText}>
            ❤️ Favorites
          </Text>
        </Pressable>
      </View>

      <FlatList
        style={styles.list}
        data={allArtworks}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <ArtworkTile
            artwork={item}
            picking={pickingId === item.id}
            completed={completedIds.includes(item.id)}
            favorited={favoriteIds.includes(item.id)}
            isNew={isArtworkNew(item)}
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
          onPress={() => setScreen('menu')}
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

    folderRow: {
      flexDirection: 'row',
      marginTop: 12,
    },

    folderButton: {
      backgroundColor: colors.buttonSecondary,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginHorizontal: 6,
    },

    folderButtonText: {
      color: colors.buttonText,
      fontSize: 13,
      fontWeight: 'bold',
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
