import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, StyleSheet, Text, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function MenuScreen({ setScreen, image, setImage, setDifficulty }) {
  const difficulties = [
    { label: 'Beginner', pieces: 36, size: 6 },
    { label: 'Casual', pieces: 64, size: 8 },
    { label: 'Intermediate', pieces: 100, size: 10 },
    { label: 'Advanced', pieces: 144, size: 12 },
    { label: 'Master', pieces: 225, size: 15 },
    { label: 'Expert', pieces: 400, size: 20 },
  ];

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
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
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

      {image && <Image source={{ uri: image }} style={styles.previewImage} />}

      {image && <Text style={styles.chooseText}>Choose difficulty:</Text>}

      {image &&
        difficulties.map((level) => (
          <Pressable
            key={level.label}
            style={styles.smallButton}
            onPress={() => {
              setDifficulty(level.size);
              setScreen('puzzle');
            }}
          >
            <Text style={styles.buttonText}>
              {level.label} - {level.pieces} pieces
            </Text>
          </Pressable>
        ))}

      <Pressable onPress={() => setScreen('home')}>
        <Text style={styles.backText}>Back Home</Text>
      </Pressable>

      <StatusBar style="light" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#17111f',
  },
  container: {
    backgroundColor: '#17111f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
    paddingTop: 60,
    paddingBottom: 80,
  },
  logo: {
    fontSize: 70,
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 18,
    marginTop: 14,
    width: '100%',
    alignItems: 'center',
  },
  smallButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewImage: {
    width: 250,
    height: 250,
    borderRadius: 15,
    marginTop: 20,
  },
  chooseText: {
    color: '#cfc5dc',
    fontSize: 16,
    marginTop: 18,
  },
  backText: {
    color: '#cfc5dc',
    marginTop: 30,
    fontSize: 16,
  },
});