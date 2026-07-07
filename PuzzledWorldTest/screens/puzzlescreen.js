import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function PuzzleScreen({ image, setScreen }) {
  const size = 3;
  const totalPieces = size * size;
  const [pieces, setPieces] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const ordered = Array.from({ length: totalPieces }, (_, index) => index);
    const shuffled = [...ordered].sort(() => Math.random() - 0.5);
    setPieces(shuffled);
  }, []);

  const tapPiece = (index) => {
    if (selected === null) {
      setSelected(index);
      return;
    }

    const newPieces = [...pieces];
    const temp = newPieces[selected];
    newPieces[selected] = newPieces[index];
    newPieces[index] = temp;

    setPieces(newPieces);
    setSelected(null);
  };

  const isSolved = pieces.every((piece, index) => piece === index);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Puzzle Time</Text>

      <View style={styles.board}>
        {pieces.map((piece, index) => {
          const row = Math.floor(piece / size);
          const col = piece % size;

          return (
            <Pressable
              key={index}
              style={[
                styles.piece,
                selected === index && styles.selectedPiece,
              ]}
              onPress={() => tapPiece(index)}
            >
              <View style={styles.imageWrapper}>
                <Image
                  source={{ uri: image }}
                  style={{
                    width: 300,
                    height: 300,
                    position: 'absolute',
                    left: -col * 100,
                    top: -row * 100,
                  }}
                />
              </View>
            </Pressable>
          );
        })}
      </View>

      {isSolved && <Text style={styles.solved}>Puzzle Complete! 🎉</Text>}

      <Pressable onPress={() => setScreen('menu')}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#17111f',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  board: {
    width: 300,
    height: 300,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  piece: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#17111f',
    overflow: 'hidden',
  },
  selectedPiece: {
    borderColor: '#8b5cf6',
    borderWidth: 4,
  },
  imageWrapper: {
    width: 100,
    height: 100,
    overflow: 'hidden',
  },
  solved: {
    color: 'white',
    fontSize: 22,
    marginTop: 25,
    fontWeight: 'bold',
  },
  backText: {
    color: '#cfc5dc',
    marginTop: 30,
    fontSize: 16,
  },
});