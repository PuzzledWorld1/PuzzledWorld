import { useEffect } from 'react';

import Svg, { Circle, Ellipse, G } from 'react-native-svg';

import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';


const PETAL_COLORS = [
  '#f9a8d4',
  '#fde68a',
  '#ffffff',
  '#c4b5fd',
  '#fca5a5',
];

const PETAL_COUNT = 6;


// A single flower (six petals around a golden center) that blooms in
// with a slight overshoot, holds fully open for a beat, then wilts back
// down and fades - one shared value drives the whole lifecycle, and
// onDone (via runOnJS) lets the caller drop it once it's finished.
export default function FlowerBloom({ x, y, size = 34, onDone }) {
  const progress = useSharedValue(0);

  const petalColor =
    PETAL_COLORS[
      Math.floor(x + y) % PETAL_COLORS.length
    ];

  useEffect(() => {
    progress.value = withSequence(
      withTiming(1, {
        duration: 650,
        easing: Easing.out(Easing.back(1.6)),
      }),

      withDelay(
        1700,
        withTiming(
          0,
          {
            duration: 600,
            easing: Easing.in(Easing.cubic),
          },
          (finished) => {
            if (finished) {
              runOnJS(onDone)();
            }
          }
        )
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: progress.value },
    ],
  }));

  const petals = Array.from(
    { length: PETAL_COUNT },
    (_, i) => (
      <G
        key={i}
        rotation={(360 / PETAL_COUNT) * i}
        origin="20, 20"
      >
        <Ellipse
          cx={20}
          cy={10}
          rx={6}
          ry={9}
          fill={petalColor}
        />
      </G>
    )
  );

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
        },
        style,
      ]}
    >
      <Svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
      >
        {petals}

        <Circle
          cx={20}
          cy={20}
          r={5}
          fill="#fbbf24"
        />
      </Svg>
    </Animated.View>
  );
}
