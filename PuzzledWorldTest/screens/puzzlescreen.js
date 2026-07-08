import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';


function PieceImage({
  piece,
  image,
  size,
  boardSize,
  displaySize,
}) {
  const row = Math.floor(piece / size);
  const col = piece % size;

  const realPieceSize = boardSize / size;
  const scale = displaySize / realPieceSize;

  return (
    <View
      style={{
        width: displaySize,
        height: displaySize,
        overflow: 'hidden',
      }}
    >
      <Image
        source={{ uri: image }}
        style={{
          position: 'absolute',
          width: boardSize * scale,
          height: boardSize * scale,
          left: -col * displaySize,
          top: -row * displaySize,
        }}
      />
    </View>
  );
}


function TrayPiece({
  piece,
  image,
  size,
  boardSize,
  trayPieceSize,
  pieceSize,
  onDragStart,
  onDragMove,
  onDragEnd,
}) {
  const lastPosition = useRef({
    x: 0,
    y: 0,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,

      onMoveShouldSetPanResponder: (_, gesture) => {
        const vertical = Math.abs(gesture.dy);
        const horizontal = Math.abs(gesture.dx);

        return vertical > 8 && vertical > horizontal;
      },

      onPanResponderGrant: (_, gesture) => {
        const x = gesture.moveX - pieceSize / 2;
        const y = gesture.moveY - pieceSize / 2;

        lastPosition.current = { x, y };

        onDragStart(piece, x, y);
      },

      onPanResponderMove: (_, gesture) => {
        const x = gesture.moveX - pieceSize / 2;
        const y = gesture.moveY - pieceSize / 2;

        lastPosition.current = { x, y };

        onDragMove(x, y);
      },

      onPanResponderRelease: () => {
        onDragEnd(
          lastPosition.current.x,
          lastPosition.current.y
        );
      },

      onPanResponderTerminate: () => {
        onDragEnd(
          lastPosition.current.x,
          lastPosition.current.y
        );
      },
    })
  ).current;

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.trayPiece,
        {
          width: trayPieceSize,
          height: trayPieceSize,
        },
      ]}
    >
      <PieceImage
        piece={piece}
        image={image}
        size={size}
        boardSize={boardSize}
        displaySize={trayPieceSize}
      />
    </View>
  );
}


function LoosePiece({
  item,
  image,
  size,
  boardSize,
  pieceSize,
  onMove,
  onDrop,
}) {
  const itemRef = useRef(item);

  const startPosition = useRef({
    x: item.x,
    y: item.y,
  });

  const lastPosition = useRef({
    x: item.x,
    y: item.y,
  });

  // Keep the drag logic synced with the piece's newest position.
  itemRef.current = item;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () =>
        !itemRef.current.locked,

      onMoveShouldSetPanResponder: () =>
        !itemRef.current.locked,

      onPanResponderGrant: () => {
        const currentItem = itemRef.current;

        startPosition.current = {
          x: currentItem.x,
          y: currentItem.y,
        };

        lastPosition.current = {
          x: currentItem.x,
          y: currentItem.y,
        };
      },

      onPanResponderMove: (_, gesture) => {
        if (itemRef.current.locked) return;

        const x =
          startPosition.current.x + gesture.dx;

        const y =
          startPosition.current.y + gesture.dy;

        lastPosition.current = { x, y };

        onMove(itemRef.current.piece, x, y);
      },

      onPanResponderRelease: () => {
        if (itemRef.current.locked) return;

        onDrop(
          itemRef.current.piece,
          lastPosition.current.x,
          lastPosition.current.y
        );
      },

      onPanResponderTerminate: () => {
        if (itemRef.current.locked) return;

        onDrop(
          itemRef.current.piece,
          lastPosition.current.x,
          lastPosition.current.y
        );
      },
    })
  ).current;

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.loosePiece,
        {
          left: item.x,
          top: item.y,
          width: pieceSize,
          height: pieceSize,
          zIndex: item.locked ? 10 : 100,
        },
      ]}
    >
      <PieceImage
        piece={item.piece}
        image={image}
        size={size}
        boardSize={boardSize}
        displaySize={pieceSize}
      />
    </View>
  );
}


export default function PuzzleScreen({
  image,
  setScreen,
  difficulty,
}) {
  const { width: windowWidth } = useWindowDimensions();

  const size = difficulty;
  const boardSize = Math.min(windowWidth - 32, 350);
  const pieceSize = boardSize / size;
  const trayPieceSize = 70;
  const totalPieces = size * size;

  const [boardLayout, setBoardLayout] = useState(null);
  const [trayLayout, setTrayLayout] = useState(null);

  const [trayPieces, setTrayPieces] = useState([]);
  const [loosePieces, setLoosePieces] = useState([]);

  const [trayDrag, setTrayDrag] = useState(null);

  const [trayScrollEnabled, setTrayScrollEnabled] =
    useState(true);


  useEffect(() => {
    const pieces = Array.from(
      { length: totalPieces },
      (_, index) => index
    );

    const shuffled = [...pieces].sort(
      () => Math.random() - 0.5
    );

    setTrayPieces(shuffled);
    setLoosePieces([]);
    setTrayDrag(null);
  }, [totalPieces]);


  const isOverTray = useCallback(
    (x, y) => {
      if (!trayLayout) return false;

      const centerY = y + pieceSize / 2;

      return (
        centerY >= trayLayout.y - 20 &&
        centerY <=
          trayLayout.y + trayLayout.height + 40
      );
    },
    [pieceSize, trayLayout]
  );


  const getTarget = useCallback(
    (piece) => {
      if (!boardLayout) return null;

      const row = Math.floor(piece / size);
      const col = piece % size;

      return {
        x: boardLayout.x + col * pieceSize,
        y: boardLayout.y + row * pieceSize,
      };
    },
    [boardLayout, pieceSize, size]
  );


  const finishPiecePosition = useCallback(
    (piece, x, y) => {
      const target = getTarget(piece);

      if (target) {
        const distanceX = Math.abs(x - target.x);
        const distanceY = Math.abs(y - target.y);

        const snapDistance = Math.max(
          pieceSize * 0.65,
          18
        );

        if (
          distanceX < snapDistance &&
          distanceY < snapDistance
        ) {
          return {
            piece,
            x: target.x,
            y: target.y,
            locked: true,
          };
        }
      }

      return {
        piece,
        x,
        y,
        locked: false,
      };
    },
    [getTarget, pieceSize]
  );


  const startTrayDrag = useCallback(
    (piece, x, y) => {
      setTrayScrollEnabled(false);

      setTrayDrag({
        piece,
        x,
        y,
      });
    },
    []
  );


  const moveTrayDrag = useCallback((x, y) => {
    setTrayDrag((current) => {
      if (!current) return null;

      return {
        ...current,
        x,
        y,
      };
    });
  }, []);


  const endTrayDrag = useCallback(
    (x, y) => {
      setTrayScrollEnabled(true);

      setTrayDrag((current) => {
        if (!current) return null;

        if (isOverTray(x, y)) {
          return null;
        }

        const newPiece = finishPiecePosition(
          current.piece,
          x,
          y
        );

        setTrayPieces((pieces) =>
          pieces.filter(
            (piece) => piece !== current.piece
          )
        );

        setLoosePieces((pieces) => [
          ...pieces,
          newPiece,
        ]);

        return null;
      });
    },
    [finishPiecePosition, isOverTray]
  );


  const moveLoosePiece = useCallback(
    (piece, x, y) => {
      setLoosePieces((pieces) =>
        pieces.map((item) =>
          item.piece === piece
            ? {
                ...item,
                x,
                y,
              }
            : item
        )
      );
    },
    []
  );


  const dropLoosePiece = useCallback(
    (piece, x, y) => {
      if (isOverTray(x, y)) {
        setLoosePieces((pieces) =>
          pieces.filter(
            (item) => item.piece !== piece
          )
        );

        setTrayPieces((pieces) =>
          pieces.includes(piece)
            ? pieces
            : [...pieces, piece]
        );

        return;
      }

      const finished = finishPiecePosition(
        piece,
        x,
        y
      );

      setLoosePieces((pieces) =>
        pieces.map((item) =>
          item.piece === piece ? finished : item
        )
      );
    },
    [finishPiecePosition, isOverTray]
  );


  const solvedCount = loosePieces.filter(
    (piece) => piece.locked
  ).length;

  const isSolved = solvedCount === totalPieces;


  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.title}>
        Get Puzzled!
      </Text>

      <Text style={styles.subtitle}>
        {totalPieces} pieces
      </Text>

      <View
        style={[
          styles.board,
          {
            width: boardSize,
            height: boardSize,
          },
        ]}
        onLayout={(event) =>
          setBoardLayout(event.nativeEvent.layout)
        }
      />

      {isSolved && (
        <Text style={styles.solved}>
          Puzzle Complete! 🎉
        </Text>
      )}

      <Text style={styles.trayLabel}>
        Drag a piece onto the puzzle area.
      </Text>

      <View
        style={styles.trayWrapper}
        onLayout={(event) =>
          setTrayLayout(event.nativeEvent.layout)
        }
      >
        <ScrollView
          horizontal
          scrollEnabled={trayScrollEnabled}
          showsHorizontalScrollIndicator
          persistentScrollbar
          contentContainerStyle={styles.trayContent}
        >
          {trayPieces.map((piece) => (
            <TrayPiece
              key={piece}
              piece={piece}
              image={image}
              size={size}
              boardSize={boardSize}
              trayPieceSize={trayPieceSize}
              pieceSize={pieceSize}
              onDragStart={startTrayDrag}
              onDragMove={moveTrayDrag}
              onDragEnd={endTrayDrag}
            />
          ))}
        </ScrollView>
      </View>

      <Pressable
        style={styles.backButton}
        onPress={() => setScreen('menu')}
      >
        <Text style={styles.backText}>
          Back
        </Text>
      </Pressable>

      <View
        pointerEvents="box-none"
        style={StyleSheet.absoluteFill}
      >
        {loosePieces.map((item) => (
          <LoosePiece
            key={item.piece}
            item={item}
            image={image}
            size={size}
            boardSize={boardSize}
            pieceSize={pieceSize}
            onMove={moveLoosePiece}
            onDrop={dropLoosePiece}
          />
        ))}

        {trayDrag && (
          <View
            pointerEvents="none"
            style={[
              styles.floatingPiece,
              {
                left: trayDrag.x,
                top: trayDrag.y,
                width: pieceSize,
                height: pieceSize,
              },
            ]}
          >
            <PieceImage
              piece={trayDrag.piece}
              image={image}
              size={size}
              boardSize={boardSize}
              displaySize={pieceSize}
            />
          </View>
        )}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#17111f',
    alignItems: 'center',
    paddingTop: 55,
    paddingHorizontal: 16,
  },

  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },

  subtitle: {
    color: '#cfc5dc',
    fontSize: 16,
    marginTop: 4,
    marginBottom: 18,
  },

  board: {
    backgroundColor: '#1d1626',
  },

  solved: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 12,
  },

  trayLabel: {
    color: '#cfc5dc',
    fontSize: 15,
    marginTop: 18,
    marginBottom: 8,
  },

  trayWrapper: {
    width: '100%',
    height: 92,
  },

  trayContent: {
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingBottom: 12,
  },

  trayPiece: {
    marginRight: 8,
    overflow: 'hidden',
    borderRadius: 6,
  },

  loosePiece: {
    position: 'absolute',
    overflow: 'hidden',
  },

  floatingPiece: {
    position: 'absolute',
    overflow: 'hidden',
    zIndex: 1000,
  },

  backButton: {
    marginTop: 14,
    padding: 10,
  },

  backText: {
    color: '#cfc5dc',
    fontSize: 17,
  },
});