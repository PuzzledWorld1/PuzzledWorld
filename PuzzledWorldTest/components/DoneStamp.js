import { StyleSheet, Text, View } from 'react-native';


// A diagonal "DONE" ribbon across the top-left corner of a tile, used
// on Gallery/Completed/Favorites thumbnails for artworks the user has
// already solved. Pure CSS rotation - no image asset needed.
export default function DoneStamp() {
  return (
    <View
      pointerEvents="none"
      style={styles.clip}
    >
      <View style={styles.ribbon}>
        <Text style={styles.text}>
          DONE
        </Text>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  clip: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },

  ribbon: {
    position: 'absolute',
    top: 14,
    left: -34,
    width: 130,
    backgroundColor: '#dc2626',
    paddingVertical: 3,
    transform: [{ rotate: '-45deg' }],
    alignItems: 'center',
  },

  text: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'GeominiSemiBold',
    letterSpacing: 1,
  },
});
