import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen({ setScreen }) {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🧩</Text>
      <Text style={styles.title}>PuzzledWorld</Text>
      <Text style={styles.subtitle}>
        Turn photos, artwork, and memories into puzzles.
      </Text>

      <Pressable style={styles.button} onPress={() => setScreen('menu')}>
        <Text style={styles.buttonText}>Get Puzzled</Text>
      </Pressable>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#17111f', alignItems: 'center', justifyContent: 'center', padding: 25 },
  logo: { fontSize: 70, marginBottom: 10 },
  title: { fontSize: 34, fontWeight: 'bold', color: 'white', marginBottom: 12 },
  subtitle: { color: '#cfc5dc', textAlign: 'center', fontSize: 18, marginTop: 10, marginBottom: 40 },
  button: { backgroundColor: '#8b5cf6', paddingVertical: 15, paddingHorizontal: 35, borderRadius: 18, marginTop: 14, width: '100%', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});