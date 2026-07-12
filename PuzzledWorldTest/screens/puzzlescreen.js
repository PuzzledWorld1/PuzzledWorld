import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
} from 'react-native-reanimated';

import {
  StatusBar,
} from 'expo-status-bar';

import JigsawPiece, {
  PIECE_BOX_SCALE,
  PIECE_PADDING_RATIO,
} from '../components/JigsawPiece';

import {
  saveInProgressPuzzle,
  saveCompletedPuzzle,
  clearInProgressPuzzle,
} from '../lib/puzzleData';

import { uploadInProgressImage } from '../lib/puzzleImage';


// The four grid neighbors of a piece, each tagged with the row/col step
// (dRow, dCol) that separates them - used to compute where a matching
// neighbor's top-left corner MUST sit relative to this piece.
function neighborsOf(piece, size) {
  const row = Math.floor(piece / size);
  const col = piece % size;
  const list = [];

  if (row > 0) {
    list.push({ id: piece - size, dRow: -1, dCol: 0 });
  }

  if (row < size - 1) {
    list.push({ id: piece + size, dRow: 1, dCol: 0 });
  }

  if (col > 0) {
    list.push({ id: piece - 1, dRow: 0, dCol: -1 });
  }

  if (col < size - 1) {
    list.push({ id: piece + 1, dRow: 0, dCol: 1 });
  }

  return list;
}


// Decides where a piece (or a rigid group of already-connected pieces)
// ends up after being dragged: snapped onto its correct board slot,
// snapped onto a matching neighbor piece/group (wherever that neighbor
// currently sits), or left wherever it was dropped.
//
// `others` is every OTHER loose piece currently on screen (their group
// may be locked to the board or just another free-floating cluster) -
// matching against them is what lets two clusters merge into one without
// either being anywhere near its final board position.
function resolvePlacement({
  memberIds,
  positions,
  others,
  size,
  pieceSize,
  getTarget,
}) {
  const snapDistance = Math.max(pieceSize * 0.65, 18);

  for (const id of memberIds) {
    const target = getTarget(id);
    const pos = positions[id];

    if (
      target &&
      Math.abs(pos.x - target.x) < snapDistance &&
      Math.abs(pos.y - target.y) < snapDistance
    ) {
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;

      const finalPositions = {};
      memberIds.forEach((memberId) => {
        finalPositions[memberId] = {
          x: positions[memberId].x + dx,
          y: positions[memberId].y + dy,
        };
      });

      return {
        positions: finalPositions,
        locked: true,
        mergeWithGroupId: null,
      };
    }
  }

  for (const id of memberIds) {
    for (const { id: neighborId, dRow, dCol } of neighborsOf(id, size)) {
      const neighbor = others.find((o) => o.piece === neighborId);

      if (!neighbor) {
        continue;
      }

      const pos = positions[id];
      const expectedX = pos.x + dCol * pieceSize;
      const expectedY = pos.y + dRow * pieceSize;

      if (
        Math.abs(neighbor.x - expectedX) < snapDistance &&
        Math.abs(neighbor.y - expectedY) < snapDistance
      ) {
        const dx = neighbor.x - expectedX;
        const dy = neighbor.y - expectedY;

        const finalPositions = {};
        memberIds.forEach((memberId) => {
          finalPositions[memberId] = {
            x: positions[memberId].x + dx,
            y: positions[memberId].y + dy,
          };
        });

        return {
          positions: finalPositions,
          locked: neighbor.locked,
          mergeWithGroupId: neighbor.groupId,
        };
      }
    }
  }

  const finalPositions = {};
  memberIds.forEach((memberId) => {
    finalPositions[memberId] = positions[memberId];
  });

  return {
    positions: finalPositions,
    locked: false,
    mergeWithGroupId: null,
  };
}


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


// One piece within a connected cluster. All members of a cluster share
// the SAME groupX/groupY drag deltas (passed down from PieceGroup), so
// dragging any single piece drags the whole cluster together - each
// member still gets its own GestureDetector (sized to just that piece)
// so touch hit-testing works normally, but the drag they all perform is
// identical.
function GroupMemberPiece({
  member,
  image,
  size,
  pieceSize,
  piecePadding,
  visualPieceSize,
  groupX,
  groupY,
  enabled,
  groupId,
  onDrop,
}) {
  const startX =
    useSharedValue(0);

  const startY =
    useSharedValue(0);


  const pan =
    Gesture.Pan()
      .enabled(enabled)
      .onStart(() => {
        startX.value =
          groupX.value;

        startY.value =
          groupY.value;
      })
      .onUpdate((event) => {
        groupX.value =
          startX.value +
          event.translationX;

        groupY.value =
          startY.value +
          event.translationY;
      })
      .onEnd(() => {
        runOnJS(onDrop)(
          groupId,
          groupX.value,
          groupY.value
        );
      });


  const animatedStyle =
    useAnimatedStyle(
      () => ({
        left:
          member.x +
          groupX.value -
          piecePadding,

        top:
          member.y +
          groupY.value -
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
              visualPieceSize,

            height:
              visualPieceSize,

            zIndex:
              enabled
                ? 100
                : 10,
          },
        ]}
      >
        <PieceImage
          piece={member.piece}
          image={image}
          size={size}
          displaySize={pieceSize}
        />
      </Animated.View>
    </GestureDetector>
  );
}


// A cluster of one or more pieces connected via matching edges (or
// already locked onto the board). `members` always carry positions
// that are grid-consistent with each other, so the whole cluster can be
// dragged as a single rigid shape via one shared (groupX, groupY) delta.
function PieceGroup({
  groupId,
  members,
  image,
  size,
  pieceSize,
  piecePadding,
  visualPieceSize,
  onDrop,
}) {
  const groupX =
    useSharedValue(0);

  const groupY =
    useSharedValue(0);


  // Positions are committed into `members` (React state) as soon as a
  // drag ends, so the running drag delta resets back to zero.
  useEffect(() => {
    groupX.value = 0;
    groupY.value = 0;
  }, [members]);


  const locked =
    members[0].locked;


  return members.map(
    (member) => (
      <GroupMemberPiece
        key={member.piece}
        member={member}
        image={image}
        size={size}
        pieceSize={pieceSize}
        piecePadding={piecePadding}
        visualPieceSize={visualPieceSize}
        groupX={groupX}
        groupY={groupY}
        enabled={!locked}
        groupId={groupId}
        onDrop={onDrop}
      />
    )
  );
}


export default function PuzzleScreen({
  image,
  setScreen,
  difficulty,
  difficultyLabel,
  user,
  resumeState,
  setResumeState,
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


  // True from mount until a resumed puzzle's saved piece positions have
  // been converted back from grid units into this session's pixels (see
  // the boardLayout effect below) - the board's onLayout only fires
  // after mount, so that conversion can't happen synchronously.
  const [
    resumePending,
    setResumePending,
  ] =
    useState(
      Boolean(resumeState)
    );

  const pendingResumeLoosePiecesRef =
    useRef(null);

  const resumeConsumedRef =
    useRef(false);

  // Caches the Storage upload result for this puzzle session so autosave
  // only uploads the photo once - resumed puzzles already have a remote
  // download URL and skip the upload entirely.
  const imageInfoRef =
    useRef(null);

  const saveTimeoutRef =
    useRef(null);

  // Guards against a slow save (e.g. one that has to upload the photo)
  // finishing AFTER a newer, faster save and clobbering it with stale
  // data - only the invocation that's still the latest by the time its
  // write is about to happen is allowed to actually write.
  const saveSequenceRef =
    useRef(0);

  const startTimeRef =
    useRef(Date.now());


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
    // Only ever consider resumeState at this initial seed - it's read
    // deliberately without being a dependency below, so a later prop
    // change (e.g. App.js clearing it once consumed) can't re-trigger
    // this branch for the same puzzle session.
    const resumablePieceCount =
      resumeState
        ? resumeState.trayPieces.length +
          resumeState.loosePieces.length
        : 0;

    if (
      resumeState &&
      resumablePieceCount === totalPieces &&
      !resumeConsumedRef.current
    ) {
      resumeConsumedRef.current = true;

      setTrayPieces(
        resumeState.trayPieces
      );

      pendingResumeLoosePiecesRef.current =
        resumeState.loosePieces;

      setLoosePieces([]);

      setTrayDragPiece(null);

      setResumePending(true);

      setResumeState(null);

      return;
    }


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

    setResumePending(false);
  }, [
    totalPieces,
  ]);


  // Board position is only known once the board View's onLayout fires,
  // which happens after mount - so a resumed puzzle's grid-unit
  // positions (relative to the board origin, portable across screen
  // sizes) can only be converted back to pixels here, not in the
  // seeding effect above.
  useEffect(() => {
    if (
      !boardLayout ||
      !pendingResumeLoosePiecesRef.current
    ) {
      return;
    }

    const converted =
      pendingResumeLoosePiecesRef.current.map(
        (item) => ({
          piece: item.piece,
          x: boardLayout.x + item.gx * pieceSize,
          y: boardLayout.y + item.gy * pieceSize,
          locked: item.locked,
          groupId: item.groupId,
        })
      );

    setLoosePieces(converted);

    pendingResumeLoosePiecesRef.current = null;

    setResumePending(false);
  }, [
    boardLayout,
    pieceSize,
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


  // A fresh piece leaving the tray is its own cluster of one. It can
  // land straight on its correct board slot, OR right up against an
  // already-placed matching neighbor (locked or not) - either way it
  // joins that neighbor's cluster.
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


        const result =
          resolvePlacement({
            memberIds: [
              piece,
            ],

            positions: {
              [piece]: {
                x,
                y,
              },
            },

            others:
              loosePieces,

            size,
            pieceSize,
            getTarget,
          });


        const newGroupId =
          result.mergeWithGroupId ??
          piece;


        setTrayPieces(
          (pieces) =>
            pieces.filter(
              (item) =>
                item !==
                piece
            )
        );


        setLoosePieces(
          (pieces) => {
            const updatedOthers =
              result.mergeWithGroupId
                ? pieces.map(
                    (item) =>
                      item.groupId ===
                      result.mergeWithGroupId
                        ? {
                            ...item,
                            locked:
                              result.locked ||
                              item.locked,
                          }
                        : item
                  )
                : pieces;


            return [
              ...updatedOthers,
              {
                piece,

                x:
                  result
                    .positions[
                    piece
                  ].x,

                y:
                  result
                    .positions[
                    piece
                  ].y,

                locked:
                  result.locked,

                groupId:
                  newGroupId,
              },
            ];
          }
        );
      },

      [
        loosePieces,
        isOverTray,
        size,
        pieceSize,
        getTarget,
      ]
    );


  // Dragging any piece drags its whole connected cluster (see
  // PieceGroup). On drop, every member's candidate position is checked
  // for a board-slot or neighbor-piece snap, and merged into whichever
  // cluster it touched.
  const dropGroup =
    useCallback(
      (
        groupId,
        deltaX,
        deltaY
      ) => {
        const groupMembers =
          loosePieces.filter(
            (item) =>
              item.groupId ===
              groupId
          );


        if (
          groupMembers.length ===
          0
        ) {
          return;
        }


        const anchor =
          groupMembers[0];

        const anchorX =
          anchor.x +
          deltaX;

        const anchorY =
          anchor.y +
          deltaY;


        if (
          isOverTray(
            anchorX,
            anchorY
          )
        ) {
          const ids =
            groupMembers.map(
              (item) =>
                item.piece
            );


          setLoosePieces(
            (pieces) =>
              pieces.filter(
                (item) =>
                  item.groupId !==
                  groupId
              )
          );


          setTrayPieces(
            (pieces) => [
              ...pieces,
              ...ids.filter(
                (id) =>
                  !pieces.includes(
                    id
                  )
              ),
            ]
          );


          return;
        }


        const positions =
          {};

        groupMembers.forEach(
          (item) => {
            positions[
              item.piece
            ] = {
              x:
                item.x +
                deltaX,

              y:
                item.y +
                deltaY,
            };
          }
        );


        const others =
          loosePieces.filter(
            (item) =>
              item.groupId !==
              groupId
          );


        const result =
          resolvePlacement({
            memberIds:
              groupMembers.map(
                (item) =>
                  item.piece
              ),

            positions,
            others,
            size,
            pieceSize,
            getTarget,
          });


        const newGroupId =
          result.mergeWithGroupId ??
          groupId;


        setLoosePieces(
          (pieces) =>
            pieces.map(
              (item) => {
                if (
                  item.groupId ===
                  groupId
                ) {
                  return {
                    ...item,

                    x:
                      result
                        .positions[
                        item
                          .piece
                      ].x,

                    y:
                      result
                        .positions[
                        item
                          .piece
                      ].y,

                    locked:
                      result.locked ||
                      item.locked,

                    groupId:
                      newGroupId,
                  };
                }


                if (
                  result.mergeWithGroupId &&
                  item.groupId ===
                    result.mergeWithGroupId
                ) {
                  return {
                    ...item,

                    locked:
                      result.locked ||
                      item.locked,
                  };
                }


                return item;
              }
            )
        );
      },

      [
        loosePieces,
        isOverTray,
        size,
        pieceSize,
        getTarget,
      ]
    );


  const pieceGroups =
    useMemo(() => {
      const map =
        new Map();

      loosePieces.forEach(
        (item) => {
          if (
            !map.has(
              item.groupId
            )
          ) {
            map.set(
              item.groupId,
              []
            );
          }

          map
            .get(
              item.groupId
            )
            .push(item);
        }
      );

      return Array.from(
        map.entries()
      ).map(
        ([
          groupId,
          members,
        ]) => ({
          groupId,
          members,
        })
      );
    }, [
      loosePieces,
    ]);


  // Solved once every piece is out of the tray and connected into a
  // single cluster - it no longer needs to be sitting on the board.
  const isSolved =
    loosePieces.length ===
      totalPieces &&
    pieceGroups.length ===
      1;


  // Writes the current arrangement to Firestore. loosePieces are
  // converted to grid units (relative to the board origin, in piece
  // widths) so a resume on a different screen size still lines up - see
  // the boardLayout conversion effect above for the inverse.
  const flushSave =
    useCallback(async () => {
      if (
        !user ||
        !boardLayout ||
        resumePending ||
        isSolved
      ) {
        return;
      }

      const mySequence =
        ++saveSequenceRef.current;

      try {
        let imageInfo =
          imageInfoRef.current;

        if (!imageInfo) {
          imageInfo =
            image.startsWith('http')
              ? { path: null, downloadUrl: image }
              : await uploadInProgressImage(
                  user.uid,
                  image
                );

          imageInfoRef.current =
            imageInfo;
        }

        // A newer call started (and captured more current piece
        // positions) while this one was uploading - let IT write
        // instead, so a slow upload can't clobber fresher data.
        if (
          mySequence !==
          saveSequenceRef.current
        ) {
          return;
        }

        const gridLoosePieces =
          loosePieces.map(
            (item) => ({
              piece: item.piece,
              gx: (item.x - boardLayout.x) / pieceSize,
              gy: (item.y - boardLayout.y) / pieceSize,
              locked: item.locked,
              groupId: item.groupId,
            })
          );

        await saveInProgressPuzzle(
          user.uid,
          {
            size,
            difficultyLabel,
            totalPieces,
            trayPieces,
            loosePieces: gridLoosePieces,
            imagePath: imageInfo.path,
            imageDownloadUrl: imageInfo.downloadUrl,
          }
        );
      } catch (error) {
        console.log(
          'Could not save puzzle progress:',
          error
        );
      }
    }, [
      user,
      boardLayout,
      resumePending,
      isSolved,
      image,
      loosePieces,
      trayPieces,
      size,
      difficultyLabel,
      totalPieces,
      pieceSize,
    ]);


  // Debounced autosave: coalesces rapid successive piece drops into one
  // write instead of saving on every single change.
  useEffect(() => {
    if (
      !user ||
      !boardLayout ||
      resumePending ||
      isSolved
    ) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current =
      setTimeout(() => {
        flushSave();
      }, 1500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    trayPieces,
    loosePieces,
    flushSave,
  ]);


  // Always points at the latest flushSave (which itself closes over the
  // latest piece positions) - used by the unmount cleanup below, whose
  // own closure would otherwise be stuck with whatever flushSave looked
  // like on the render it was created.
  const flushSaveRef =
    useRef(flushSave);

  useEffect(() => {
    flushSaveRef.current = flushSave;
  }, [flushSave]);

  useEffect(() => {
    return () => {
      flushSaveRef.current();
    };
  }, []);


  useEffect(() => {
    if (!isSolved || !user) {
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    const elapsedSeconds =
      Math.round(
        (Date.now() - startTimeRef.current) / 1000
      );

    saveCompletedPuzzle(
      user.uid,
      {
        size,
        difficultyLabel,
        totalPieces,
        elapsedSeconds,
      }
    )
      .then(() =>
        clearInProgressPuzzle(user.uid)
      )
      .catch((error) => {
        console.log(
          'Could not save completed puzzle:',
          error
        );
      });
  }, [isSolved]);


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


      {resumePending && (
        <Text
          style={
            styles.loadingText
          }
        >
          Loading your puzzle...
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
          () => {
            flushSave();

            setScreen(
              'menu'
            );
          }
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
        {pieceGroups.map(
          ({
            groupId,
            members,
          }) => (
            <PieceGroup
              key={
                groupId
              }

              groupId={
                groupId
              }

              members={
                members
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

              piecePadding={
                piecePadding
              }

              visualPieceSize={
                visualPieceSize
              }

              onDrop={
                dropGroup
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


    loadingText: {
      color:
        '#cfc5dc',

      fontSize:
        15,

      marginTop:
        12,
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