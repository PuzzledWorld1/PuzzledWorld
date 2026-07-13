import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import DoneStamp from './DoneStamp';
import HeartToggle from './HeartToggle';
import { withAppFont } from '../constants/typography';


// The single tile UI (thumbnail, DONE stamp, favorite heart, loading
// overlay, title/artist caption) shared by the Gallery, Completed, and
// Favorites screens, so the three grids stay visually identical without
// copy-pasting the same markup and styles three times.
export default function ArtworkTile({
  artwork,
  picking,
  completed,
  favorited,
  onPress,
  onToggleFavorite,
  colors,
}) {
  const styles = getStyles(colors);

  return (
    <Pressable
      style={styles.tile}
      disabled={picking}
      onPress={onPress}
    >
      <Image
        source={artwork.localImage}
        style={styles.thumbnail}
        resizeMode="contain"
      />

      {completed && <DoneStamp />}

      <HeartToggle
        favorited={favorited}
        onPress={onToggleFavorite}
      />

      {picking && (
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
          {artwork.title}
        </Text>

        <Text
          style={styles.artworkArtist}
          numberOfLines={1}
        >
          {artwork.artist}
        </Text>
      </View>
    </Pressable>
  );
}


function getStyles(colors) {
  return StyleSheet.create(withAppFont({
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
  }));
}
