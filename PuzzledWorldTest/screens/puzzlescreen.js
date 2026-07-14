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
  Share,
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

import {
  AdEventType,
  InterstitialAd,
  TestIds,
} from 'react-native-google-mobile-ads';

import JigsawPiece, {
  PIECE_BOX_SCALE,
  PIECE_PADDING_RATIO,
} from '../components/JigsawPiece';

import SparkleBurst from '../components/SparkleBurst';

import CelebrationOverlay from '../components/CelebrationOverlay';

import ThemeToggle from '../components/ThemeToggle';
import { withAppFont } from '../constants/typography';

import ShareIcon from '../components/ShareIcon';

import BackIcon from '../components/BackIcon';

import {
  saveInProgressPuzzle,
  saveCompletedPuzzle,
  clearInProgressPuzzle,
  createSharedPuzzle,
} from '../lib/puzzleData';

import { uploadInProgressImage } from '../lib/puzzleImage';
import { markArtworkCompleted } from '../lib/artworkStatus';


// Must match boardFrame's padding + borderWidth below - the frame (not
// the inner board) is what's laid out directly inside the screen's main
// container, so this is how far in from the frame's measured position
// the actual board sits.
const BOARD_FRAME_INSET = 10;


// The default sparkle palette (bright pastels + white) reads fine on
// night mode's dark background but washes out against day mode's light
// sage - these darker, more saturated tones stay visible there instead.
const DAY_SPARKLE_COLORS = [
  '#b45309',
  '#be185d',
  '#0e7490',
  '#4d7c0f',
  '#3f5236',
  '#a21caf',
  '#a16207',
];

const DAY_SPARKLE_FLASH_COLOR = '#92400e';


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

      // Landing on this piece's OWN slot still locks it in place, but if
      // grid-neighbors are already locked onto THEIR correct slots too,
      // adopt ALL of those groups (not just the first one found) instead
      // of starting a brand new one. A single drop can bridge more than
      // one already-solved cluster at once (e.g. filling the last gap in
      // a corner, adjacent to two separately-built clusters) - merging
      // with only one of them would leave the other permanently
      // separate, since locked pieces can't be dragged again later to
      // fix it. That's exactly the kind of bug that lets the board look
      // completely filled in while isSolved (which requires everything
      // in ONE group) never actually fires.
      const neighborGroupIds = new Set();

      memberIds.forEach((memberId) => {
        neighborsOf(memberId, size).forEach(
          ({ id: neighborId }) => {
            const neighbor = others.find(
              (o) =>
                o.piece === neighborId &&
                o.locked
            );

            if (neighbor) {
              neighborGroupIds.add(
                neighbor.groupId
              );
            }
          }
        );
      });

      return {
        positions: finalPositions,
        locked: true,
        mergeWithGroupIds: Array.from(
          neighborGroupIds
        ),
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

        // Collect every OTHER neighbor group this placement also lines
        // up with, not just the one that triggered the snap - same
        // bridging concern as the own-slot branch above.
        const neighborGroupIds = new Set([
          neighbor.groupId,
        ]);

        memberIds.forEach((memberId) => {
          neighborsOf(memberId, size).forEach(
            ({
              id: otherNeighborId,
              dRow: otherDRow,
              dCol: otherDCol,
            }) => {
              const otherNeighbor = others.find(
                (o) =>
                  o.piece ===
                  otherNeighborId
              );

              if (!otherNeighbor) {
                return;
              }

              const otherExpectedX =
                finalPositions[memberId].x +
                otherDCol * pieceSize;

              const otherExpectedY =
                finalPositions[memberId].y +
                otherDRow * pieceSize;

              if (
                Math.abs(
                  otherNeighbor.x -
                    otherExpectedX
                ) < snapDistance &&
                Math.abs(
                  otherNeighbor.y -
                    otherExpectedY
                ) < snapDistance
              ) {
                neighborGroupIds.add(
                  otherNeighbor.groupId
                );
              }
            }
          );
        });

        return {
          positions: finalPositions,
          locked: neighbor.locked,
          mergeWithGroupIds: Array.from(
            neighborGroupIds
          ),
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
    mergeWithGroupIds: [],
  };
}


// Keeps a dropped piece/cluster from ending up somewhere the player can
// never reach again. Shifts the WHOLE group by one uniform delta (rather
// than clamping each member independently) so a connected cluster can't
// get visually torn apart by the clamp - only kicks in once the group's
// bounding box actually crosses the allowed margin, so normal in-bounds
// drops (including anything already snapped to the board) are untouched.
function clampGroupToScreen({
  positions,
  memberIds,
  pieceSize,
  windowWidth,
  windowHeight,
}) {
  const margin = pieceSize * 0.5;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  memberIds.forEach((id) => {
    const pos = positions[id];

    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + pieceSize);
    maxY = Math.max(maxY, pos.y + pieceSize);
  });

  const lowerBoundX = -margin;
  const upperBoundX = windowWidth + margin;
  const lowerBoundY = -margin;
  const upperBoundY = windowHeight + margin;

  let shiftX = 0;
  let shiftY = 0;

  if (minX < lowerBoundX) {
    shiftX = lowerBoundX - minX;
  } else if (maxX > upperBoundX) {
    shiftX = upperBoundX - maxX;
  }

  if (minY < lowerBoundY) {
    shiftY = lowerBoundY - minY;
  } else if (maxY > upperBoundY) {
    shiftY = upperBoundY - maxY;
  }

  if (shiftX === 0 && shiftY === 0) {
    return positions;
  }

  const shifted = {};

  memberIds.forEach((id) => {
    shifted[id] = {
      x: positions[id].x + shiftX,
      y: positions[id].y + shiftY,
    };
  });

  return shifted;
}


function PieceImage({
  piece,
  image,
  size,
  displaySize,
  letterboxColor,
}) {
  return (
    <JigsawPiece
      piece={piece}
      image={image}
      size={size}
      displaySize={displaySize}
      letterboxColor={letterboxColor}
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
  highlighted,
  letterboxColor,
  styles,
}) {
  const trayVisualSize =
    trayPieceSize *
    PIECE_BOX_SCALE;


  // activeOffsetY/failOffsetX let the tray's horizontal ScrollView keep
  // handling horizontal swipes - this gesture only takes over once the
  // finger has moved vertically past the threshold, mirroring the old
  // PanResponder's "vertical > horizontal" check. The gap between the two
  // thresholds needs to be wide: a diagonal drag grows X and Y together,
  // so a tight gap (e.g. 8 vs 10) turns activation into a coin-flip race
  // between "pick up the piece" and "cancel into a scroll", which reads
  // as stutter/dropped drags. Picking up a piece is the overwhelmingly
  // common intent for a touch that starts ON a piece, so this leans hard
  // toward that: activation needs almost no vertical movement, and it
  // takes a heavily horizontal-dominant gesture to fail into a scroll.
  const pan =
    Gesture.Pan()
      .activeOffsetY([-3, 3])
      .failOffsetX([-45, 45])
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

          highlighted &&
            styles.trayPieceHighlighted,
        ]}
      >
        <PieceImage
          piece={piece}
          image={image}
          size={size}
          displaySize={
            trayPieceSize
          }
          letterboxColor={
            letterboxColor
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
  letterboxColor,
  styles,
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
        letterboxColor={
          letterboxColor
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
  letterboxColor,
  styles,
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
          letterboxColor={letterboxColor}
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
  letterboxColor,
  styles,
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
        letterboxColor={letterboxColor}
        styles={styles}
      />
    )
  );
}


// Real ads only serve outside dev, so testing never risks clicking a live
// ad and getting the AdMob account flagged for invalid traffic.
const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-7328298342514333/9488577395';


export default function PuzzleScreen({
  image,
  setScreen,
  difficulty,
  difficultyLabel,
  artworkTitle,
  artworkArtist,
  artworkId,
  user,
  resumeState,
  setResumeState,
  colors,
  themeMode,
  toggleThemeMode,
}) {
  const styles = getStyles(colors);

  const {
    width: windowWidth,
    height: windowHeight,
  } =
    useWindowDimensions();


  const size =
    difficulty;


  const boardSize =
    Math.min(
      windowWidth - 32,
      400
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
    46;


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

  const interstitialRef = useRef(
    InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID)
  );

  const [interstitialLoaded, setInterstitialLoaded] = useState(false);

  useEffect(() => {
    const interstitial = interstitialRef.current;

    const unsubscribe = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => setInterstitialLoaded(true)
    );

    interstitial.load();

    return unsubscribe;
  }, []);


  const floatX =
    useSharedValue(0);

  const floatY =
    useSharedValue(0);


  const [
    trayScrollEnabled,
    setTrayScrollEnabled,
  ] =
    useState(true);


  const [
    sharing,
    setSharing,
  ] =
    useState(false);


  const [
    showLeftover,
    setShowLeftover,
  ] =
    useState(false);

  // Holding down anywhere on the screen (background, board, or tray -
  // wherever there isn't already a piece to grab) highlights the pieces
  // still sitting in the tray, for when one is hard to spot among the
  // rest. A long enough minDuration keeps this from firing on an
  // ordinary tap, and it coexists with piece dragging because a touch
  // that lands directly on a piece is claimed by that piece's own Pan
  // gesture first.
  const backgroundLongPress =
    Gesture.LongPress()
      .minDuration(350)
      .onStart(() => {
        runOnJS(setShowLeftover)(
          true
        );
      })
      .onEnd(() => {
        runOnJS(setShowLeftover)(
          false
        );
      })
      .onFinalize(() => {
        runOnJS(setShowLeftover)(
          false
        );
      });


  const [
    sparkles,
    setSparkles,
  ] =
    useState([]);

  const sparkleIdRef =
    useRef(0);

  // Fires a short particle burst centered on (x, y) - called whenever a
  // piece snaps into its board slot or onto a matching neighbor, never
  // for a piece that's just dropped loosely with no snap.
  const addSparkle =
    useCallback((x, y) => {
      sparkleIdRef.current += 1;

      const id =
        sparkleIdRef.current;

      setSparkles(
        (current) => [
          ...current,
          { id, x, y },
        ]
      );
    }, []);

  const removeSparkle =
    useCallback((id) => {
      setSparkles(
        (current) =>
          current.filter(
            (item) =>
              item.id !== id
          )
      );
    }, []);


  const handleShare =
    useCallback(async () => {
      setSharing(true);

      try {
        const shareId =
          await createSharedPuzzle({
            size,
            difficultyLabel,
            image,
          });

        const link =
          `puzzledworld://share/${shareId}`;

        await Share.share({
          message:
            `Try this puzzle I made! ${link}`,
        });
      } catch (error) {
        console.log(
          'Could not share puzzle:',
          error
        );

        // Cloud Function moderation rejections (SafeSearch/CSAI Match)
        // arrive with a specific, user-facing HttpsError message - show
        // that instead of a generic failure when we have one.
        alert(
          error?.message ??
            'Could not share this puzzle. Please try again.'
        );
      } finally {
        setSharing(false);
      }
    }, [
      size,
      difficultyLabel,
      image,
    ]);


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


        result.positions =
          clampGroupToScreen({
            positions:
              result.positions,

            memberIds: [
              piece,
            ],

            pieceSize,
            windowWidth,
            windowHeight,
          });


        if (
          result.locked ||
          result.mergeWithGroupIds.length > 0
        ) {
          addSparkle(
            result.positions[piece].x +
              pieceSize / 2,

            result.positions[piece].y +
              pieceSize / 2
          );
        }


        const newGroupId =
          result.mergeWithGroupIds[0] ??
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
              result.mergeWithGroupIds.length > 0
                ? pieces.map(
                    (item) =>
                      result.mergeWithGroupIds.includes(
                        item.groupId
                      )
                        ? {
                            ...item,

                            groupId:
                              newGroupId,

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
        addSparkle,
        windowWidth,
        windowHeight,
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


        result.positions =
          clampGroupToScreen({
            positions:
              result.positions,

            memberIds:
              groupMembers.map(
                (item) =>
                  item.piece
              ),

            pieceSize,
            windowWidth,
            windowHeight,
          });


        if (
          result.locked ||
          result.mergeWithGroupIds.length > 0
        ) {
          addSparkle(
            result.positions[anchor.piece].x +
              pieceSize / 2,

            result.positions[anchor.piece].y +
              pieceSize / 2
          );
        }


        const newGroupId =
          result.mergeWithGroupIds[0] ??
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
                  result.mergeWithGroupIds.includes(
                    item.groupId
                  )
                ) {
                  return {
                    ...item,

                    groupId:
                      newGroupId,

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
        addSparkle,
        windowWidth,
        windowHeight,
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

        alert(
          'Could not record this completed puzzle: ' +
            (error?.message ?? error)
        );
      });

    if (artworkId) {
      markArtworkCompleted(user.uid, artworkId).catch(
        (error) => {
          console.log(
            'Could not mark artwork completed:',
            error
          );
        }
      );
    }
  }, [isSolved]);

  useEffect(() => {
    if (isSolved && interstitialLoaded) {
      interstitialRef.current.show();
    }
  }, [isSolved, interstitialLoaded]);


  return (
    <GestureDetector
      gesture={
        backgroundLongPress
      }
    >
    <View
      style={
        styles.container
      }
    >
      <StatusBar
        style={colors.statusBarStyle}
      />


      <Text
        style={
          styles.title
        }
      >
        Get Puzzled!
      </Text>


      {artworkTitle ? (
        <Text
          style={
            styles.subtitle
          }
        >
          {artworkTitle}
          {artworkArtist
            ? ` — ${artworkArtist}`
            : ''}
        </Text>
      ) : (
        <Text
          style={
            styles.subtitle
          }
        >
          {totalPieces}
          {' pieces'}
        </Text>
      )}


      <View
        style={
          styles.boardFrame
        }
        onLayout={
          (event) => {
            const frameLayout =
              event.nativeEvent
                .layout;

            // onLayout reports coordinates relative to the immediate
            // parent - since this frame (not the inner board) is what's
            // directly inside the main container, boardLayout needs to
            // be nudged in by the frame's padding + border so it still
            // lines up with the inner board's true position, which is
            // the coordinate space every piece-snapping calculation
            // below assumes.
            setBoardLayout({
              x:
                frameLayout.x +
                BOARD_FRAME_INSET,

              y:
                frameLayout.y +
                BOARD_FRAME_INSET,
            });
          }
        }
      >
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
        />
      </View>


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

                highlighted={
                  showLeftover
                }

                letterboxColor={
                  colors.buttonSecondary
                }

                styles={
                  styles
                }
              />
            )
          )}
        </ScrollView>
      </View>


      <View
        style={
          styles.footerRow
        }
      >
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
          <View
            style={
              styles.shareButtonRow
            }
          >
            <BackIcon
              size={16}
              color={
                colors.buttonText
              }
            />

            <Text
              style={
                styles.backText
              }
            >
              {' Back'}
            </Text>
          </View>
        </Pressable>


        <Pressable
          style={
            styles.backButton
          }
          disabled={
            sharing
          }
          onPress={
            handleShare
          }
        >
          <View
            style={
              styles.shareButtonRow
            }
          >
            <ShareIcon
              size={16}
              color={
                colors.buttonText
              }
            />

            <Text
              style={
                styles.backText
              }
            >
              {sharing
                ? ' Sharing…'
                : ' Share'}
            </Text>
          </View>
        </Pressable>

        <ThemeToggle
          themeMode={
            themeMode
          }

          toggleThemeMode={
            toggleThemeMode
          }

          style={
            styles.backButton
          }
        />
      </View>


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

              letterboxColor={
                colors.buttonSecondary
              }

              styles={
                styles
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

            letterboxColor={
              colors.buttonSecondary
            }

            styles={
              styles
            }
          />
        )}


        {sparkles.map(
          (sparkle) => (
            <SparkleBurst
              key={
                sparkle.id
              }

              x={
                sparkle.x
              }

              y={
                sparkle.y
              }

              onDone={() =>
                removeSparkle(
                  sparkle.id
                )
              }

              colors={
                themeMode === 'day'
                  ? DAY_SPARKLE_COLORS
                  : undefined
              }

              flashColor={
                themeMode === 'day'
                  ? DAY_SPARKLE_FLASH_COLOR
                  : undefined
              }
            />
          )
        )}
      </View>


      {isSolved && (
        <CelebrationOverlay
          themeMode={
            themeMode
          }

          width={
            windowWidth
          }

          height={
            windowHeight
          }
        />
      )}
    </View>
    </GestureDetector>
  );
}


function getStyles(colors) {
  return StyleSheet.create(withAppFont({
    container: {
      flex: 1,

      position:
        'relative',

      backgroundColor:
        colors.background,

      alignItems:
        'center',

      paddingTop: 28,

      paddingHorizontal:
        16,
    },


    loadingText: {
      color:
        colors.textSecondary,

      fontSize:
        15,

      marginTop:
        12,
    },


    title: {
      color:
        colors.textPrimary,

      fontSize:
        30,

      fontWeight:
        'bold',
    },


    subtitle: {
      color:
        colors.textSecondary,

      fontSize:
        16,

      textAlign:
        'center',

      paddingHorizontal:
        24,

      marginTop:
        4,

      marginBottom:
        56,
    },


    boardFrame: {
      padding:
        8,

      borderWidth:
        2,

      borderColor:
        colors.border,
    },


    board: {
      backgroundColor:
        colors.boardTrayBackground,

      borderWidth:
        2,

      borderColor:
        colors.border,
    },


    solved: {
      position:
        'absolute',

      top:
        '40%',

      left:
        0,

      right:
        0,

      zIndex:
        9999,

      elevation:
        9999,

      textAlign:
        'center',

      color:
        '#000000',

      fontSize:
        38,

      fontWeight:
        'bold',

      textShadowColor:
        'rgba(255, 255, 255, 0.85)',

      textShadowOffset: {
        width: 0,
        height: 0,
      },

      textShadowRadius:
        8,
    },


    trayLabel: {
      color:
        colors.textSecondary,

      fontSize:
        15,

      marginTop:
        65,

      marginBottom:
        8,
    },


    trayWrapper: {
      width:
        '100%',

      height:
        92,

      backgroundColor:
        colors.boardTrayBackground,

      borderWidth:
        2,

      borderColor:
        colors.border,
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


    trayPieceHighlighted: {
      borderWidth:
        2,

      borderColor:
        colors.highlightBorder,

      borderRadius:
        6,

      backgroundColor:
        colors.highlightBackground,
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


    footerRow: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      width:
        '100%',
    },


    backButton: {
      backgroundColor:
        colors.buttonSecondary,

      marginTop:
        6,

      marginHorizontal:
        6,

      paddingVertical:
        8,

      paddingHorizontal:
        14,

      borderRadius:
        10,
    },


    shareButtonRow: {
      flexDirection:
        'row',

      alignItems:
        'center',
    },


    backText: {
      color:
        colors.buttonText,

      fontSize:
        14,

      fontWeight:
        'bold',
    },
  }));
}