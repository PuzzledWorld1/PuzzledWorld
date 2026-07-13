import { useEffect } from 'react';

import { StyleSheet } from 'react-native';

import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';


const PARTICLE_COUNT = 110;

const DEFAULT_COLORS = [
  '#fde68a',
  '#f9a8d4',
  '#a5f3fc',
  '#bef264',
  '#ffffff',
  '#fca5f1',
  '#fcd34d',
];


// Each sparkle drifts outward while twinkling - its opacity rides a sine
// wave (on top of the overall fade-out envelope) with a per-particle
// phase offset, so the burst glints in and out unevenly instead of just
// dimming smoothly. That flicker is what reads as "shimmer" rather than
// a plain dissolve.
function Particle({ progress, angle, distance, size, color, phase, twinkleSpeed }) {
  const style = useAnimatedStyle(() => {
    const p = progress.value;

    const envelope = 1 - p;

    const twinkle =
      0.5 +
      0.5 *
        Math.sin(
          p * twinkleSpeed * Math.PI * 2 +
            phase
        );

    return {
      opacity: envelope * (0.4 + 0.6 * twinkle),
      transform: [
        { translateX: Math.cos(angle) * distance * p },
        { translateY: Math.sin(angle) * distance * p },
        { scale: (0.6 + 0.4 * twinkle) * (1 - p * 0.3) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          left: -size / 2,
          top: -size / 2,
          backgroundColor: color,
          shadowColor: color,
        },
        style,
      ]}
    />
  );
}


// A quick bright pop at the origin, fading out well before the sparkles
// finish drifting outward.
function Flash({ progress, scale, color }) {
  const style = useAnimatedStyle(() => {
    const p =
      Math.min(progress.value / 0.25, 1);

    return {
      opacity: 1 - p,
      transform: [
        { scale: (0.4 + p * 1.8) * scale },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.flash,
        { backgroundColor: color },
        style,
      ]}
    />
  );
}


// A short-lived shimmer of sparkles centered on (x, y), used to celebrate
// a piece snapping into place (and, at a bigger `scale`, the fireworks
// finale when the whole puzzle is solved). Every particle rides the SAME
// shared value so the whole burst is driven by a single animation instead
// of one per particle - onDone (via runOnJS, since withTiming's callback
// runs on the UI thread) lets the caller drop this component from its
// list once the animation finishes.
export default function SparkleBurst({
  x,
  y,
  onDone,
  scale = 1,
  colors = DEFAULT_COLORS,
  flashColor = '#ffffff',
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(
      1,
      {
        duration: 1000,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(onDone)();
        }
      }
    );
  }, []);

  const particles = Array.from(
    { length: PARTICLE_COUNT },
    (_, i) => {
      // A small per-particle angle jitter keeps the burst from reading
      // as a perfectly even pinwheel - still evenly spread overall, but
      // organically sparkly rather than mechanical.
      const jitter =
        ((i * 37) % 17) / 17 - 0.5;

      const angle =
        (i / PARTICLE_COUNT) * Math.PI * 2 +
        jitter * 0.4;

      const distance =
        (24 + (i % 8) * 14) * scale;

      const size =
        (1.5 + (i % 3) * 1) * scale;

      const color =
        colors[i % colors.length];

      const phase =
        (i * 53) % 100 / 100 * Math.PI * 2;

      const twinkleSpeed =
        2 + (i % 4) * 0.7;

      return (
        <Particle
          key={i}
          progress={progress}
          angle={angle}
          distance={distance}
          size={size}
          color={color}
          phase={phase}
          twinkleSpeed={twinkleSpeed}
        />
      );
    }
  );

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.container,
        { left: x, top: y },
      ]}
    >
      <Flash
        progress={progress}
        scale={scale}
        color={flashColor}
      />

      {particles}
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 0,
    height: 0,
  },

  particle: {
    position: 'absolute',
    shadowOpacity: 0.9,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
  },

  flash: {
    position: 'absolute',
    width: 20,
    height: 20,
    marginLeft: -10,
    marginTop: -10,
    borderRadius: 10,
  },
});
