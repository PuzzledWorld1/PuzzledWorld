import { useEffect, useRef, useState } from 'react';

import { StyleSheet, View } from 'react-native';

import SparkleBurst from './SparkleBurst';
import FlowerBloom from './FlowerBloom';


const ITEM_COUNT = 24;

// Spread spawns out over ~3.2s so the celebration reads as a sequence
// (a garden blooming / a fireworks show) rather than everything popping
// at once.
const SPAWN_WINDOW_MS = 3200;


// Full-screen, tap-through celebration shown once the puzzle is fully
// solved - blooming flowers in day mode, a fireworks finale (reusing the
// same SparkleBurst used for piece-snaps, just bigger) in night mode.
// Spawns a fixed batch of items at staggered random positions/times and
// lets each one clean itself up via onDone, so nothing lingers forever.
export default function CelebrationOverlay({ themeMode, width, height }) {
  const [items, setItems] = useState([]);

  const idRef = useRef(0);

  useEffect(() => {
    if (!width || !height) {
      return;
    }

    const timers = Array.from(
      { length: ITEM_COUNT },
      (_, i) => {
        const delay =
          (i / ITEM_COUNT) * SPAWN_WINDOW_MS +
          Math.random() * 200;

        return setTimeout(() => {
          idRef.current += 1;

          const id = idRef.current;

          const x =
            width * 0.12 +
            Math.random() * width * 0.76;

          const y =
            height * 0.15 +
            Math.random() * height * 0.6;

          setItems((current) => [
            ...current,
            { id, x, y },
          ]);
        }, delay);
      }
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [width, height]);

  const removeItem = (id) => {
    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        styles.overlay,
      ]}
    >
      {items.map((item) =>
        themeMode === 'night' ? (
          <SparkleBurst
            key={item.id}
            x={item.x}
            y={item.y}
            scale={1.8}
            onDone={() => removeItem(item.id)}
          />
        ) : (
          <FlowerBloom
            key={item.id}
            x={item.x}
            y={item.y}
            onDone={() => removeItem(item.id)}
          />
        )
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  // Explicit, deliberately-huge zIndex/elevation so this sits above the
  // board pieces (which use their own zIndex up to ~1000 while dragging)
  // and the tray/footer regardless of render order - Android in
  // particular needs `elevation` (not just zIndex) to actually respect
  // stacking between sibling Views reliably.
  overlay: {
    zIndex: 9999,
    elevation: 9999,
  },
});
