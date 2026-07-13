import { useState } from 'react';

import {
  FlatList,
  Image,
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
import { withAppFont } from '../constants/typography';


function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), ms)
    ),
  ]);
}


// Tries the full-resolution copy on Wikimedia Commons first (better quality
// puzzle pieces); if that's unreachable or too slow, falls back to the
// lower-res copy already bundled with the app, which works with zero
// connectivity since it's part of the app binary.
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


export default function GalleryScreen({
  setScreen,
  setImage,
  setImageOrientation,
  setArtworkTitle,
  setArtworkArtist,
  colors,
  themeMode,
  toggleThemeMode,
}) {
  const styles = getStyles(colors);

  const [pickingId, setPickingId] =
    useState(null);


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


  return (
    <View style={styles.container}>
      <StatusBar style={colors.statusBarStyle} />

      <Text style={styles.title}>
        Gallery
      </Text>

      <FlatList
        style={styles.list}
        data={GALLERY_ARTWORKS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <Pressable
            style={styles.tile}
            disabled={Boolean(pickingId)}
            onPress={() => pickArtwork(item)}
          >
            <Image
              source={item.localImage}
              style={styles.thumbnail}
              resizeMode="contain"
            />

            {pickingId === item.id && (
              <View style={styles.loadingOverlay}>
                <Text style={styles.loadingText}>
                  ...
                </Text>
              </View>
            )}

            <View style={styles.captionBar}>
              <Text
                style={styles.artworkTitle}
                numberOfLines={1}
              >
                {item.title}
              </Text>

              <Text
                style={styles.artworkArtist}
                numberOfLines={1}
              >
                {item.artist}
              </Text>
            </View>
          </Pressable>
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

    tile: {
      width: 155,
      height: 155,
      marginBottom: 16,
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: colors.boardTrayBackground,
    },

    thumbnail: {
      width: '100%',
      height: '100%',
    },

    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.captionBarBackground,
    },

    loadingText: {
      color: colors.textPrimary,
      fontWeight: 'bold',
    },

    captionBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingVertical: 3,
      paddingHorizontal: 6,
      backgroundColor: colors.captionBarBackground,
    },

    artworkTitle: {
      color: '#ffffff',
      fontSize: 11,
      fontWeight: 'bold',
      textAlign: 'center',
    },

    artworkArtist: {
      color: '#e5e5e5',
      fontSize: 9,
      textAlign: 'center',
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
