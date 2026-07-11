import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  StatusBar,
} from 'expo-status-bar';

import JigsawPiece, {
  PIECE_BOX_SCALE,
  PIECE_PADDING_RATIO,
} from '../components/JigsawPiece';


function PieceImage({
  piece,
  image,
  size,
  displaySize,
}) {
  return (
    <JigsawPiece
      piece={piece}
      image={image}
      size={size}
      displaySize={displaySize}
    />
  );
}


function TrayPiece({
  piece,
  image,
  size,
  trayPieceSize,
  pieceSize,
  floatX,
  floatY,
  onDragStart,
  onDragEnd,
}) {
  const trayVisualSize =
    trayPieceSize *
    PIECE_BOX_SCALE;


  // activeOffsetY/failOffsetX let the tray's horizontal ScrollView keep
  // handling horizontal swipes - this gesture only takes over once the
  // finger has moved vertically past the threshold, mirroring the old
  // PanResponder's "vertical > horizontal" check.
  const pan =
    Gesture.Pan()
      .activeOffsetY([-8, 8])
      .failOffsetX([-10, 10])
      .onStart((event) => {
        floatX.value =
          event.absoluteX -
          pieceSize / 2;

        floatY.value =
          event.absoluteY -
          pieceSize / 2;

        runOnJS(onDragStart)(
          piece
        );
      })
      .onUpdate((event) => {
        floatX.value =
          event.absoluteX -
          pieceSize / 2;

        floatY.value =
          event.absoluteY -
          pieceSize / 2;
      })
      .onEnd((event) => {
        runOnJS(onDragEnd)(
          piece,
          event.absoluteX -
            pieceSize / 2,
          event.absoluteY -
            pieceSize / 2
        );
      });


  return (
    <GestureDetector gesture={pan}>
      <View
        style={[
          styles.trayPiece,
          {
            width:
              trayVisualSize,

            height:
              trayVisualSize,
          },
        ]}
      >
        <PieceImage
          piece={piece}
          image={image}
          size={size}
          displaySize={
            trayPieceSize
          }
        />
      </View>
    </GestureDetector>
  );
}


function FloatingPiece({
  piece,
  image,
  size,
  pieceSize,
  visualPieceSize,
  piecePadding,
  floatX,
  floatY,
}) {
  const animatedStyle =
    useAnimatedStyle(
      () => ({
        left:
          floatX.value -
          piecePadding,

        top:
          floatY.value -
          piecePadding,
      })
    );


  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.floatingPiece,
        animatedStyle,
        {
          width:
            visualPieceSize,

          height:
            visualPieceSize,
        },
      ]}
    >
      <PieceImage
        piece={piece}
        image={image}
        size={size}
        displaySize={
          pieceSize
        }
      />
    </Animated.View>
  );
}


function LoosePiece({
  item,
  image,
  size,
  pieceSize,
  onDrop,
}) {
  const piecePadding =
    pieceSize *
    PIECE_PADDING_RATIO;


  const visualSize =
    pieceSize *
    PIECE_BOX_SCALE;


  // Position lives in shared values so dragging updates the UI thread
  // directly, without a React re-render (and re-render of every other
  // piece) on every touch-move frame. React state (`item`) stays the
  // source of truth between drags and for game logic (locked/snap).
  const translateX =
    useSharedValue(item.x);

  const translateY =
    useSharedValue(item.y);

  const startX =
    useSharedValue(item.x);

  const startY =
    useSharedValue(item.y);


  useEffect(() => {
    if (item.locked) {
      translateX.value =
        withTiming(item.x, {
          duration: 150,
        });

      translateY.value =
        withTiming(item.y, {
          duration: 150,
        });
    } else {
      translateX.value =
        item.x;

      translateY.value =
        item.y;
    }
  }, [
    item.x,
    item.y,
    item.locked,
  ]);


  const pan =
    Gesture.Pan()
      .enabled(!item.locked)
      .onStart(() => {
        startX.value =
          translateX.value;

        startY.value =
          translateY.value;
      })
      .onUpdate((event) => {
        translateX.value =
          startX.value +
          event.translationX;

        translateY.value =
          startY.value +
          event.translationY;
      })
      .onEnd(() => {
        runOnJS(onDrop)(
          item.piece,
          translateX.value,
          translateY.value
        );
      });


  const animatedStyle =
    useAnimatedStyle(
      () => ({
        left:
          translateX.value -
          piecePadding,

        top:
          translateY.value -
          piecePadding,
      })
    );


  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.loosePiece,
          animatedStyle,
          {
            width:
              visualSize,

            height:
              visualSize,

            zIndex:
              item.locked
                ? 10
                : 100,
          },
        ]}
      >
        <PieceImage
          piece={item.piece}
          image={image}
          size={size}
          displaySize={pieceSize}
        />
      </Animated.View>
    </GestureDetector>
  );
}


export default function PuzzleScreen({
  image,
  setScreen,
  difficulty,
}) {
  const {
    width: windowWidth,
  } =
    useWindowDimensions();


  const size =
    difficulty;


  const boardSize =
    Math.min(
      windowWidth - 32,
      350
    );


  const pieceSize =
    boardSize / size;


  const piecePadding =
    pieceSize *
    PIECE_PADDING_RATIO;


  const visualPieceSize =
    pieceSize *
    PIECE_BOX_SCALE;


  const trayPieceSize =
    70;


  const totalPieces =
    size * size;


  const [
    boardLayout,
    setBoardLayout,
  ] =
    useState(null);


  const [
    trayLayout,
    setTrayLayout,
  ] =
    useState(null);


  const [
    trayPieces,
    setTrayPieces,
  ] =
    useState([]);


  const [
    loosePieces,
    setLoosePieces,
  ] =
    useState([]);


  const [
    trayDragPiece,
    setTrayDragPiece,
  ] =
    useState(null);


  const floatX =
    useSharedValue(0);

  const floatY =
    useSharedValue(0);


  const [
    trayScrollEnabled,
    setTrayScrollEnabled,
  ] =
    useState(true);


  useEffect(() => {
    const pieces =
      Array.from(
        {
          length:
            totalPieces,
        },

        (_, index) =>
          index
      );


    const shuffled =
      [...pieces].sort(
        () =>
          Math.random() -
          0.5
      );


    setTrayPieces(
      shuffled
    );


    setLoosePieces(
      []
    );


    setTrayDragPiece(
      null
    );
  }, [
    totalPieces,
  ]);


  const isOverTray =
    useCallback(
      (x, y) => {
        if (
          !trayLayout
        ) {
          return false;
        }


        const centerY =
          y +
          pieceSize / 2;


        return (
          centerY >=
            trayLayout.y -
              20 &&

          centerY <=
            trayLayout.y +
              trayLayout.height +
              40
        );
      },

      [
        pieceSize,
        trayLayout,
      ]
    );


  const getTarget =
    useCallback(
      (piece) => {
        if (
          !boardLayout
        ) {
          return null;
        }


        const row =
          Math.floor(
            piece / size
          );


        const col =
          piece % size;


        return {
          x:
            boardLayout.x +
            col *
              pieceSize,

          y:
            boardLayout.y +
            row *
              pieceSize,
        };
      },

      [
        boardLayout,
        pieceSize,
        size,
      ]
    );


  const finishPiecePosition =
    useCallback(
      (
        piece,
        x,
        y
      ) => {
        const target =
          getTarget(
            piece
          );


        if (target) {
          const distanceX =
            Math.abs(
              x -
                target.x
            );


          const distanceY =
            Math.abs(
              y -
                target.y
            );


          const snapDistance =
            Math.max(
              pieceSize *
                0.65,

              18
            );


          if (
            distanceX <
              snapDistance &&

            distanceY <
              snapDistance
          ) {
            return {
              piece,

              x:
                target.x,

              y:
                target.y,

              locked:
                true,
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

      [
        getTarget,
        pieceSize,
      ]
    );


  const startTrayDrag =
    useCallback(
      (piece) => {
        setTrayScrollEnabled(
          false
        );

        setTrayDragPiece(
          piece
        );
      },

      []
    );


  const endTrayDrag =
    useCallback(
      (
        piece,
        x,
        y
      ) => {
        setTrayScrollEnabled(
          true
        );

        setTrayDragPiece(
          null
        );


        if (
          isOverTray(
            x,
            y
          )
        ) {
          return;
        }


        const newPiece =
          finishPiecePosition(
            piece,
            x,
            y
          );


        setTrayPieces(
          (pieces) =>
            pieces.filter(
              (item) =>
                item !==
                piece
            )
        );


        setLoosePieces(
          (pieces) => [
            ...pieces,
            newPiece,
          ]
        );
      },

      [
        finishPiecePosition,
        isOverTray,
      ]
    );


  const dropLoosePiece =
    useCallback(
      (
        piece,
        x,
        y
      ) => {
        if (
          isOverTray(
            x,
            y
          )
        ) {
          setLoosePieces(
            (pieces) =>
              pieces.filter(
                (item) =>
                  item.piece !==
                  piece
              )
          );


          setTrayPieces(
            (pieces) =>
              pieces.includes(
                piece
              )
                ? pieces
                : [
                    ...pieces,
                    piece,
                  ]
          );


          return;
        }


        const finished =
          finishPiecePosition(
            piece,
            x,
            y
          );


        setLoosePieces(
          (pieces) =>
            pieces.map(
              (item) =>
                item.piece ===
                piece
                  ? finished
                  : item
            )
        );
      },

      [
        finishPiecePosition,
        isOverTray,
      ]
    );


  const solvedCount =
    loosePieces.filter(
      (piece) =>
        piece.locked
    ).length;


  const isSolved =
    solvedCount ===
    totalPieces;


  return (
    <View
      style={
        styles.container
      }
    >
      <StatusBar
        style="light"
      />


      <Text
        style={
          styles.title
        }
      >
        Get Puzzled!
      </Text>


      <Text
        style={
          styles.subtitle
        }
      >
        {totalPieces}
        {' pieces'}
      </Text>


      <View
        style={[
          styles.board,

          {
            width:
              boardSize,

            height:
              boardSize,
          },
        ]}
        onLayout={
          (event) =>
            setBoardLayout(
              event
                .nativeEvent
                .layout
            )
        }
      />


      {isSolved && (
        <Text
          style={
            styles.solved
          }
        >
          Puzzle Complete! 🎉
        </Text>
      )}


      <Text
        style={
          styles.trayLabel
        }
      >
        Drag a piece onto the puzzle area.
      </Text>


      <View
        style={
          styles.trayWrapper
        }
        onLayout={
          (event) =>
            setTrayLayout(
              event
                .nativeEvent
                .layout
            )
        }
      >
        <ScrollView
          horizontal
          scrollEnabled={
            trayScrollEnabled
          }
          showsHorizontalScrollIndicator
          persistentScrollbar
          contentContainerStyle={
            styles.trayContent
          }
        >
          {trayPieces.map(
            (piece) => (
              <TrayPiece
                key={
                  piece
                }

                piece={
                  piece
                }

                image={
                  image
                }

                size={
                  size
                }

                trayPieceSize={
                  trayPieceSize
                }

                pieceSize={
                  pieceSize
                }

                floatX={
                  floatX
                }

                floatY={
                  floatY
                }

                onDragStart={
                  startTrayDrag
                }

                onDragEnd={
                  endTrayDrag
                }
              />
            )
          )}
        </ScrollView>
      </View>


      <Pressable
        style={
          styles.backButton
        }
        onPress={
          () =>
            setScreen(
              'menu'
            )
        }
      >
        <Text
          style={
            styles.backText
          }
        >
          Back
        </Text>
      </Pressable>


      <View
        pointerEvents="box-none"
        style={
          StyleSheet.absoluteFill
        }
      >
        {loosePieces.map(
          (item) => (
            <LoosePiece
              key={
                item.piece
              }

              item={
                item
              }

              image={
                image
              }

              size={
                size
              }

              pieceSize={
                pieceSize
              }

              onDrop={
                dropLoosePiece
              }
            />
          )
        )}


        {trayDragPiece !== null && (
          <FloatingPiece
            piece={
              trayDragPiece
            }

            image={
              image
            }

            size={
              size
            }

            pieceSize={
              pieceSize
            }

            visualPieceSize={
              visualPieceSize
            }

            piecePadding={
              piecePadding
            }

            floatX={
              floatX
            }

            floatY={
              floatY
            }
          />
        )}
      </View>
    </View>
  );
}


const styles =
  StyleSheet.create({
    container: {
      flex: 1,

      position:
        'relative',

      backgroundColor:
        '#17111f',

      alignItems:
        'center',

      paddingTop: 55,

      paddingHorizontal:
        16,
    },


    title: {
      color:
        'white',

      fontSize:
        30,

      fontWeight:
        'bold',
    },


    subtitle: {
      color:
        '#cfc5dc',

      fontSize:
        16,

      marginTop:
        4,

      marginBottom:
        18,
    },


    board: {
      backgroundColor:
        '#1d1626',
    },


    solved: {
      color:
        'white',

      fontSize:
        22,

      fontWeight:
        'bold',

      marginTop:
        12,
    },


    trayLabel: {
      color:
        '#cfc5dc',

      fontSize:
        15,

      marginTop:
        18,

      marginBottom:
        8,
    },


    trayWrapper: {
      width:
        '100%',

      height:
        112,
    },


    trayContent: {
      alignItems:
        'center',

      paddingHorizontal:
        6,

      paddingBottom:
        12,
    },


    trayPiece: {
      marginRight:
        4,
    },


    loosePiece: {
      position:
        'absolute',
    },


    floatingPiece: {
      position:
        'absolute',

      zIndex:
        1000,
    },


    backButton: {
      marginTop:
        14,

      padding:
        10,
    },


    backText: {
      color:
        '#cfc5dc',

      fontSize:
        17,
    },
  });