import { Pressable, StyleSheet, Text } from 'react-native';


// A tappable heart badge for the corner of a gallery tile. Favoriting
// requires an account (see artworkStatus.js - it's per-user Firestore
// data), so onPress is expected to handle the signed-out case itself
// (e.g. prompting sign-in) rather than this component knowing about it.
export default function HeartToggle({ favorited, onPress }) {
  return (
    <Pressable
      style={styles.badge}
      hitSlop={8}
      onPress={onPress}
    >
      <Text style={styles.icon}>
        {favorited ? '❤️' : '🤍'}
      </Text>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    fontSize: 14,
  },
});
