import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🧩</Text>

      <Text style={styles.title}>PuzzledWorld</Text>

      <Text style={styles.subtitle}>
        Turn photos, artwork, and memories into puzzles.
      </Text>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Get Puzzled</Text>
      </Pressable>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#082614',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },

  logo: {
    fontSize: 70,
    marginBottom: 10,
  },

  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: 'white',
  },

  subtitle: {
    color: '#cfc5dc',
    textAlign: 'center',
    fontSize: 18,
    marginTop: 10,
    marginBottom: 40,
  },

  button: {
    backgroundColor: '#147139',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 18,
  },

  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
