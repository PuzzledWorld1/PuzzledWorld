import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function MenuScreen({ setScreen, image, setImage }) {
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert('Permission to access photos is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🧩</Text>
      <Text style={styles.title}>Get Puzzled</Text>

      <Pressable style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>📷 Pick a Memory</Text>
      </Pressable>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>🎨 Artist Gallery</Text>
      </Pressable>

      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>❓ Mystery Puzzle</Text>
      </Pressable>

      {image && (
        <Image source={{ uri: image }} style={styles.previewImage} />
      )}
      {image && (
  <Pressable
    style={styles.button}
    onPress={() => setScreen('puzzle')}
  >
    <Text style={styles.buttonText}>🧩 Start Puzzle</Text>
  </Pressable>
)}

      <Pressable onPress={() => setScreen('home')}>
        <Text style={styles.backText}>Back Home</Text>
      </Pressable>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#17111f', alignItems: 'center', justifyContent: 'center', padding: 25 },
  logo: { fontSize: 70, marginBottom: 10 },
  title: { fontSize: 34, fontWeight: 'bold', color: 'white', marginBottom: 12 },
  button: { backgroundColor: '#8b5cf6', paddingVertical: 15, paddingHorizontal: 35, borderRadius: 18, marginTop: 14, width: '100%', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  previewImage: { width: 250, height: 250, borderRadius: 15, marginTop: 20 },
  backText: { color: '#cfc5dc', marginTop: 30, fontSize: 16 },
});