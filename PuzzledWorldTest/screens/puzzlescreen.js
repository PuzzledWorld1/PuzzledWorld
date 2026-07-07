import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function PuzzleScreen({ image, setScreen, difficulty }) {
  const size = difficulty;
  const boardSize = 330;
  const pieceSize = boardSize / size;
  const totalPieces = size * size;

  const [trayPieces, setTrayPieces] = useState([]);
  const [boardPieces, setBoardPieces] = useState(Array(totalPieces).fill(null));
  const [selectedPiece, setSelectedPiece] = useState(null);

  useEffect(() => {
    const ordered = Array.from({ length: totalPieces }, (_, index) => index);
    const shuffled = [...ordered].sort(() => Math.random() - 0.5);
    setTrayPieces(shuffled);
    setBoardPieces(Array(totalPieces).fill(null));
  }, [totalPieces]);

  const placePiece = (boardIndex) => {
    if (selectedPiece === null) return;
    if (boardPieces[boardIndex] !== null) return;

    const newBoard = [...boardPieces];
    newBoard[boardIndex] = selectedPiece;

    setBoardPieces(newBoard);
    setTrayPieces(trayPieces.filter((piece) => piece !== selectedPiece));
    setSelectedPiece(null);
  };

  const renderPieceImage = (piece) => {
    const row = Math.floor(piece / size);
    const col = piece % size;

    return (
      <View style={{ width: pieceSize, height: pieceSize, overflow: 'hidden' }}>
        <Image
          source={{ uri: image }}
          style={{
            width: boardSize,
            height: boardSize,
            position: 'absolute',
            left: -col * pieceSize,
            top: -row * pieceSize,
          }}
        />
      </View>
    );
  };

  const isSolved =
    boardPieces.every((piece, index) => piece === index) &&
    boardPieces.every((piece) => piece !== null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Puzzle Time</Text>
      <Text style={styles.subtitle}>{totalPieces} pieces</Text>

      <View style={[styles.board, { width: boardSize, height: boardSize }]}>
        {boardPieces.map((piece, index) => (
          <Pressable
            key={index}
            style={[
              styles.boardSlot,
              {
                width: pieceSize,
                height: pieceSize,
              },
            ]}
            onPress={() => placePiece(index)}
          >
            {piece !== null && renderPieceImage(piece)}
          </Pressable>
        ))}
      </View>

      {isSolved && <Text style={styles.solved}>Puzzle Complete! 🎉</Text>}

      <Text style={styles.trayLabel}>Tap a piece, then tap the board.</Text>

      <ScrollView
        horizontal
        style={styles.tray}
        contentContainerStyle={styles.trayContent}
      >
        {trayPieces.map((piece) => (
          <Pressable
            key={piece}
            style={[
              styles.trayPiece,
              {
                width: pieceSize,
                height: pieceSize,
              },
              selectedPiece === piece && styles.selectedPiece,
            ]}
            onPress={() => setSelectedPiece(piece)}
          >
            {renderPieceImage(piece)}
          </Pressable>
        ))}
      </ScrollView>

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
    padding: 16,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#cfc5dc',
    fontSize: 16,
    marginBottom: 14,
  },
 board: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  backgroundColor: '#251b33',
  borderWidth: 2,
  borderColor: '#8b5cf6',
  overflow: 'hidden',
},

boardSlot: {
  overflow: 'hidden',
  margin: 1,
  borderRadius: 6,
  backgroundColor: '#17111f',
},

  trayLabel: {
    color: '#cfc5dc',
    marginTop: 16,
    marginBottom: 8,
  },
  tray: {
    maxHeight: 80,
    width: '100%',
  },
  trayContent: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
 trayPiece: {
  marginRight: 8,
  borderWidth: 1,
  borderColor: '#4b3b63',
  borderRadius: 8,
  overflow: 'hidden',
  backgroundColor: '#251b33',
},

  selectedPiece: {
    borderColor: '#8b5cf6',
    borderWidth: 4,
  },
  solved: {
    color: 'white',
    fontSize: 22,
    marginTop: 16,
    fontWeight: 'bold',
  },
  backText: {
    color: '#cfc5dc',
    marginTop: 18,
    fontSize: 16,
  },
});