import { useEffect, useMemo, useState } from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { withAppFont } from '../constants/typography';


// Three acts: the board catches fire (rising flames + an orange wash +
// a screen tremble), the fire swallows the screen whole (wash to black),
// then the punchline. Timed as plain setTimeout phase transitions (like
// the border-complete sparkle timers elsewhere in this app) rather than
// one giant Reanimated sequence, since the punchline needs actual React
// state (to mount the "Try again!" button) once the burn finishes.
const BURN_MS = 2800;
const ASH_MS = 850;

// Scattered across the whole screen (not just marching up from the
// bottom edge) so the burn reads as the ENTIRE screen catching, not
// just a fire at the bottom of it. New flames keep spawning across most
// of the burn phase so coverage stays full right up until it cuts to
// black, rather than thinning out partway through.
const FLAME_COUNT = 90;


function Flame({ x, y, delay, duration, size }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.quad),
      })
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const p = progress.value;

    // Fades in quickly, then back out over the rest of the rise - never
    // fully opaque, so overlapping flames don't read as flat cutouts.
    const opacity =
      p < 0.15
        ? (p / 0.15) * 0.9
        : 0.9 * (1 - (p - 0.15) / 0.85);

    return {
      opacity,
      transform: [
        { translateY: -p * 90 },
        {
          translateX:
            Math.sin(p * Math.PI * 2.4) * 14,
        },
        { scale: 0.7 + p * 0.5 },
      ],
    };
  });

  return (
    <Animated.Text
      style={[
        styles.flame,
        { left: x, top: y, fontSize: size },
        style,
      ]}
    >
      🔥
    </Animated.Text>
  );
}


// Full-screen "the puzzle screen catches fire and incinerates" gag,
// shown when Timer Mode runs out before the puzzle is solved. Blocks
// touches to everything underneath (a plain absolutely-filled View sits
// on top in paint order, so it naturally intercepts the puzzle board's
// gestures without needing to separately disable them) until the player
// taps "Try again!".
export default function FireOverlay({
  width,
  height,
  colors,
  onRetry,
}) {
  const styles2 = getStyles(colors);

  const [phase, setPhase] = useState('burn');

  useEffect(() => {
    const toAsh = setTimeout(
      () => setPhase('ash'),
      BURN_MS
    );

    const toReveal = setTimeout(
      () => setPhase('reveal'),
      BURN_MS + ASH_MS
    );

    return () => {
      clearTimeout(toAsh);
      clearTimeout(toReveal);
    };
  }, []);

  const flames = useMemo(() => {
    if (!width || !height) {
      return [];
    }

    return Array.from(
      { length: FLAME_COUNT },
      (_, i) => ({
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        delay: Math.random() * BURN_MS * 0.85,
        duration: 700 + Math.random() * 600,
        size: 20 + Math.random() * 34,
      })
    );
  }, [width, height]);

  const shakeX = useSharedValue(0);

  useEffect(() => {
    shakeX.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 55 }),
        withTiming(7, { duration: 55 }),
        withTiming(-5, { duration: 55 }),
        withTiming(5, { duration: 55 }),
        withTiming(0, { duration: 55 })
      ),
      Math.ceil(BURN_MS / 275),
      false
    );
  }, []);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const glow = useSharedValue(0);

  useEffect(() => {
    glow.value = withTiming(1, {
      duration: BURN_MS,
      easing: Easing.in(Easing.cubic),
    });
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.8,
  }));

  const blackness = useSharedValue(0);

  useEffect(() => {
    if (phase === 'ash' || phase === 'reveal') {
      blackness.value = withTiming(1, {
        duration: ASH_MS,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [phase]);

  const blackStyle = useAnimatedStyle(() => ({
    opacity: blackness.value,
  }));

  const reveal = useSharedValue(0);

  useEffect(() => {
    if (phase === 'reveal') {
      reveal.value = withSequence(
        withTiming(1.15, {
          duration: 220,
          easing: Easing.out(Easing.quad),
        }),
        withTiming(1, { duration: 140 })
      );
    }
  }, [phase]);

  const revealStyle = useAnimatedStyle(() => ({
    opacity: reveal.value > 0 ? 1 : 0,
    transform: [{ scale: reveal.value || 0.01 }],
  }));

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        styles.root,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          shakeStyle,
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.glow,
            glowStyle,
          ]}
        />

        {phase === 'burn' &&
          flames.map((flame) => (
            <Flame
              key={flame.id}
              x={flame.x}
              y={flame.y}
              delay={flame.delay}
              duration={flame.duration}
              size={flame.size}
            />
          ))}
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          styles.black,
          blackStyle,
        ]}
      />

      {phase === 'reveal' && (
        <Animated.View
          style={[
            styles.revealBox,
            revealStyle,
          ]}
        >
          <Text style={styles2.bannerText}>
            JUST KIDDING!
          </Text>

          <Pressable
            style={styles2.retryButton}
            onPress={onRetry}
          >
            <Text style={styles2.retryText}>
              Try again!
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  root: {
    zIndex: 9999,
    elevation: 9999,
  },

  glow: {
    backgroundColor: '#ff5500',
  },

  black: {
    backgroundColor: '#0a0503',
  },

  flame: {
    position: 'absolute',
  },

  revealBox: {
    position: 'absolute',
    top: '38%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});


function getStyles(colors) {
  return StyleSheet.create(withAppFont({
    bannerText: {
      color: '#ffb347',
      fontSize: 40,
      fontWeight: 'bold',
      textAlign: 'center',
      textShadowColor: '#7a1f00',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 18,
    },

    retryButton: {
      marginTop: 24,
      backgroundColor: colors.buttonPrimary,
      paddingVertical: 14,
      paddingHorizontal: 32,
      borderRadius: 16,
    },

    retryText: {
      color: colors.buttonText,
      fontSize: 18,
      fontWeight: 'bold',
    },
  }));
}
