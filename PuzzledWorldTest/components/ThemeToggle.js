import { Pressable, StyleSheet, Text } from 'react-native';


// A ☀️/🌙 tap target shown at the bottom of every screen, just below
// whatever "Back"/"Cancel" link that screen already has. Shows the icon
// for the mode you'd switch TO, not the current one. `style` lets a
// screen match this to its own button look (e.g. puzzlescreen's small
// buttons) instead of the plain bare-icon default.
export default function ThemeToggle({ themeMode, toggleThemeMode, style }) {
  return (
    <Pressable
      style={[styles.toggle, style]}
      onPress={toggleThemeMode}
    >
      <Text style={styles.icon}>
        {themeMode === 'night' ? '☀️' : '🌙'}
      </Text>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  toggle: {
    alignSelf: 'center',
    marginTop: 10,
    padding: 8,
  },

  icon: {
    fontSize: 22,
  },
});
