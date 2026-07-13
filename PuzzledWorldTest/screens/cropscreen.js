import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

import {
  ImageManipulator,
  SaveFormat,
} from 'expo-image-manipulator';

import { StatusBar } from 'expo-status-bar';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import ThemeToggle from '../components/ThemeToggle';
import { withAppFont } from '../constants/typography';


const MIN_CROP_SIZE = 80;
const HANDLE_DOT_SIZE = 22;
const HANDLE_HIT_SIZE = 38;


function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}


// Standard EXIF orientation tags -> the clockwise rotation (in degrees)
// needed to make the raw pixel buffer match what every viewer already
// displays for that tag. Only covers the plain-rotation tags (1/3/6/8);
// the mirrored tags (2/4/5/7) are rare for phone camera photos and are
// treated as "no rotation" here rather than left unhandled.
const EXIF_ROTATION = {
  1: 0,
  3: 180,
  6: 90,
  8: 270,
};


export default function CropScreen({
  image,
  imageOrientation,
  setImage,
  setScreen,
  colors,
  themeMode,
  toggleThemeMode,
}) {
  const styles = getStyles(colors);

  const {
    width: windowWidth,
    height: windowHeight,
  } = useWindowDimensions();


  const stageWidth = windowWidth - 24;

  const stageHeight = Math.min(
    windowHeight * 0.58,
    520
  );


  const [normalizedImage, setNormalizedImage] =
    useState(null);

  const [originalSize, setOriginalSize] =
    useState(null);

  const [imageDisplay, setImageDisplay] =
    useState(null);

  const [crop, setCrop] =
    useState(null);

  const [saving, setSaving] =
    useState(false);


  const cropRef = useRef(null);

  const imageDisplayRef = useRef(null);

  const gestureMode = useRef(null);

  const gestureStart = useRef(null);


  cropRef.current = crop;

  imageDisplayRef.current = imageDisplay;


  // expo-image-manipulator's crop() works in raw pixel space and does not
  // reliably agree with the EXIF rotation tag that RN's <Image> (and every
  // other normal viewer) uses to display the photo right-side up. Left as
  // -is, the box the user drags has nothing to do with the coordinates the
  // manipulator crops from, so the result can land in a completely
  // different part of the photo. Baking the actual EXIF-indicated rotation
  // into the pixels once, up front, removes that ambiguity for every
  // measurement taken after this point. processedForRef guards against
  // this firing twice for the same image (e.g. React's dev-mode double
  // effect invocation) kicking off two concurrent native manipulate calls.
  const processedForRef = useRef(null);

  useEffect(() => {
    if (!image) return;

    if (processedForRef.current === image) return;

    processedForRef.current = image;


    const rotation =
      EXIF_ROTATION[imageOrientation] ?? 0;


    if (rotation === 0) {
      setNormalizedImage(image);
      return;
    }


    let cancelled = false;


    ImageManipulator.manipulate(image)
      .rotate(rotation)
      .renderAsync()
      .then((rendered) =>
        rendered.saveAsync({
          format: SaveFormat.JPEG,
          compress: 1,
        })
      )
      .then((result) => {
        if (!cancelled) {
          setNormalizedImage(result.uri);
        }
      })
      .catch((error) => {
        console.log(
          'Could not normalize image orientation:',
          error
        );


        if (!cancelled) {
          setNormalizedImage(image);
        }
      });


    return () => {
      cancelled = true;
    };
  }, [
    image,
    imageOrientation,
  ]);


  // Measure the photo through ImageManipulator itself rather than RN's
  // Image.getSize - they're different native code paths and aren't
  // guaranteed to agree on the photo's true pixel resolution (e.g. one
  // reading a cached/thumbnail size while the other processes the full
  // file). Since crop() is issued through ImageManipulator too, measuring
  // through the same library guarantees the scale math and the actual
  // crop agree on what "the image" is.
  useEffect(() => {
    if (!normalizedImage) return;


    let cancelled = false;


    ImageManipulator.manipulate(normalizedImage)
      .renderAsync()
      .then((rendered) => {
        if (cancelled) return;


        const width = rendered.width;

        const height = rendered.height;


        setOriginalSize({
          width,
          height,
        });


        const imageRatio =
          width / height;

        const stageRatio =
          stageWidth / stageHeight;


        let displayWidth;
        let displayHeight;


        if (imageRatio > stageRatio) {
          displayWidth = stageWidth;

          displayHeight =
            stageWidth / imageRatio;
        } else {
          displayHeight = stageHeight;

          displayWidth =
            stageHeight * imageRatio;
        }


        const imageX =
          (stageWidth - displayWidth) / 2;

        const imageY =
          (stageHeight - displayHeight) / 2;


        const startingSize =
          Math.min(
            displayWidth,
            displayHeight
          ) * 0.75;


        const startingX =
          imageX +
          (displayWidth - startingSize) / 2;

        const startingY =
          imageY +
          (displayHeight - startingSize) / 2;


        setImageDisplay({
          x: imageX,
          y: imageY,
          width: displayWidth,
          height: displayHeight,
        });


        setCrop({
          x: startingX,
          y: startingY,
          size: startingSize,
        });
      })
      .catch((error) => {
        console.log(
          'Could not read image size:',
          error
        );
      });


    return () => {
      cancelled = true;
    };
  }, [
    normalizedImage,
    stageHeight,
    stageWidth,
  ]);


  const findGestureMode = (
    touchX,
    touchY,
    currentCrop
  ) => {
    const left = currentCrop.x;

    const top = currentCrop.y;

    const right =
      currentCrop.x + currentCrop.size;

    const bottom =
      currentCrop.y + currentCrop.size;

    const centerX =
      currentCrop.x +
      currentCrop.size / 2;

    const centerY =
      currentCrop.y +
      currentCrop.size / 2;


    const handles = [
      {
        type: 'nw',
        x: left,
        y: top,
      },

      {
        type: 'n',
        x: centerX,
        y: top,
      },

      {
        type: 'ne',
        x: right,
        y: top,
      },

      {
        type: 'e',
        x: right,
        y: centerY,
      },

      {
        type: 'se',
        x: right,
        y: bottom,
      },

      {
        type: 's',
        x: centerX,
        y: bottom,
      },

      {
        type: 'sw',
        x: left,
        y: bottom,
      },

      {
        type: 'w',
        x: left,
        y: centerY,
      },
    ];


    for (const handle of handles) {
      const distanceX =
        Math.abs(touchX - handle.x);

      const distanceY =
        Math.abs(touchY - handle.y);


      if (
        distanceX <= HANDLE_HIT_SIZE &&
        distanceY <= HANDLE_HIT_SIZE
      ) {
        return handle.type;
      }
    }


    const insideCrop =
      touchX >= left &&
      touchX <= right &&
      touchY >= top &&
      touchY <= bottom;


    if (insideCrop) {
      return 'move';
    }


    return null;
  };


  const resizeCrop = (
    mode,
    start,
    dx,
    dy
  ) => {
    const display =
      imageDisplayRef.current;

    if (!display) return;


    const imageLeft =
      display.x;

    const imageTop =
      display.y;

    const imageRight =
      display.x + display.width;

    const imageBottom =
      display.y + display.height;


    let newX = start.x;

    let newY = start.y;

    let newSize = start.size;


    if (mode === 'se') {
      const change =
        Math.max(dx, dy);

      newSize =
        start.size + change;
    }


    if (mode === 'sw') {
      const change =
        Math.max(-dx, dy);

      newSize =
        start.size + change;

      newX =
        start.x +
        start.size -
        newSize;
    }


    if (mode === 'ne') {
      const change =
        Math.max(dx, -dy);

      newSize =
        start.size + change;

      newY =
        start.y +
        start.size -
        newSize;
    }


    if (mode === 'nw') {
      const change =
        Math.max(-dx, -dy);

      newSize =
        start.size + change;

      newX =
        start.x +
        start.size -
        newSize;

      newY =
        start.y +
        start.size -
        newSize;
    }


    if (mode === 'e') {
      newSize =
        start.size + dx;
    }


    if (mode === 'w') {
      newSize =
        start.size - dx;

      newX =
        start.x +
        start.size -
        newSize;
    }


    if (mode === 's') {
      newSize =
        start.size + dy;
    }


    if (mode === 'n') {
      newSize =
        start.size - dy;

      newY =
        start.y +
        start.size -
        newSize;
    }


    newSize = Math.max(
      MIN_CROP_SIZE,
      newSize
    );


    if (mode === 'n') {
      newX =
        start.x +
        (start.size - newSize) / 2;
    }


    if (mode === 's') {
      newX =
        start.x +
        (start.size - newSize) / 2;
    }


    if (mode === 'e') {
      newY =
        start.y +
        (start.size - newSize) / 2;
    }


    if (mode === 'w') {
      newY =
        start.y +
        (start.size - newSize) / 2;
    }


    if (newX < imageLeft) {
      const difference =
        imageLeft - newX;

      newX = imageLeft;

      newSize -= difference;
    }


    if (newY < imageTop) {
      const difference =
        imageTop - newY;

      newY = imageTop;

      newSize -= difference;
    }


    if (
      newX + newSize >
      imageRight
    ) {
      newSize =
        imageRight - newX;
    }


    if (
      newY + newSize >
      imageBottom
    ) {
      newSize =
        imageBottom - newY;
    }


    newSize = Math.max(
      MIN_CROP_SIZE,
      newSize
    );


    setCrop({
      x: newX,
      y: newY,
      size: newSize,
    });
  };


  // Plain PanResponder gestures elsewhere in the app can misbehave once
  // react-native-gesture-handler's GestureHandlerRootView wraps the app
  // (added for the puzzle-piece drag), since RNGH takes over touch
  // dispatch at the root. Using a gesture-handler Pan here instead keeps
  // this screen's touch handling consistent with the rest of the app.
  // runOnJS(true) keeps every callback on the JS thread (like the old
  // PanResponder handlers), since they call React state setters directly.
  const stagePan =
    Gesture.Pan()
      .runOnJS(true)
      .minDistance(0)
      .onBegin((event) => {
        const currentCrop =
          cropRef.current;

        if (!currentCrop) return;


        gestureMode.current =
          findGestureMode(
            event.x,
            event.y,
            currentCrop
          );


        gestureStart.current = {
          ...currentCrop,
        };
      })
      .onUpdate((event) => {
        const mode =
          gestureMode.current;

        const start =
          gestureStart.current;

        const display =
          imageDisplayRef.current;


        if (
          !mode ||
          !start ||
          !display
        ) {
          return;
        }


        if (mode === 'move') {
          const minX =
            display.x;

          const maxX =
            display.x +
            display.width -
            start.size;

          const minY =
            display.y;

          const maxY =
            display.y +
            display.height -
            start.size;


          setCrop({
            ...start,

            x: clamp(
              start.x + event.translationX,
              minX,
              maxX
            ),

            y: clamp(
              start.y + event.translationY,
              minY,
              maxY
            ),
          });

          return;
        }


        resizeCrop(
          mode,
          start,
          event.translationX,
          event.translationY
        );
      })
      .onFinalize(() => {
        gestureMode.current = null;

        gestureStart.current = null;
      });


  const useCrop = async () => {
    if (
      !crop ||
      !imageDisplay ||
      !originalSize ||
      saving
    ) {
      return;
    }


    try {
      setSaving(true);


      const scaleX =
        originalSize.width /
        imageDisplay.width;

      const scaleY =
        originalSize.height /
        imageDisplay.height;


      const originX =
        Math.round(
          (crop.x - imageDisplay.x) *
            scaleX
        );


      const originY =
        Math.round(
          (crop.y - imageDisplay.y) *
            scaleY
        );


      const cropWidth =
        Math.round(
          crop.size * scaleX
        );


      const cropHeight =
        Math.round(
          crop.size * scaleY
        );


      const context =
        ImageManipulator.manipulate(normalizedImage);


      context.crop({
        originX,
        originY,
        width: cropWidth,
        height: cropHeight,
      });


      const renderedImage =
        await context.renderAsync();


      const result =
        await renderedImage.saveAsync({
          format: SaveFormat.JPEG,
          compress: 0.95,
        });


      setImage(result.uri);

      setScreen('menu');
    } catch (error) {
      console.log(
        'Crop error:',
        error
      );


      alert(
        'Something went wrong while cropping the image.'
      );
    } finally {
      setSaving(false);
    }
  };


  if (
    !normalizedImage ||
    !imageDisplay ||
    !crop
  ) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>
          Loading photo...
        </Text>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <StatusBar style={colors.statusBarStyle} />


      <Text style={styles.title}>
        Crop Your Memory
      </Text>


      <Text style={styles.instructions}>
        Drag inside the square to move it. Drag a white dot to resize.
      </Text>


      <GestureDetector gesture={stagePan}>
        <View
          style={[
            styles.stage,
            {
              width: stageWidth,
              height: stageHeight,
            },
          ]}
        >
          <Image
            pointerEvents="none"
            source={{ uri: normalizedImage }}
            resizeMode="contain"
            style={[
              styles.image,
              {
                left: imageDisplay.x,
                top: imageDisplay.y,
                width: imageDisplay.width,
                height: imageDisplay.height,
              },
            ]}
          />


          <View
            pointerEvents="none"
            style={[
              styles.cropBox,
              {
                left: crop.x,
                top: crop.y,
                width: crop.size,
                height: crop.size,
              },
            ]}
          >
            <View style={styles.gridVerticalOne} />

            <View style={styles.gridVerticalTwo} />

            <View style={styles.gridHorizontalOne} />

            <View style={styles.gridHorizontalTwo} />


            <View
              style={[
                styles.handle,
                styles.nw,
              ]}
            />

            <View
              style={[
                styles.handle,
                styles.n,
              ]}
            />

            <View
              style={[
                styles.handle,
                styles.ne,
              ]}
            />

            <View
              style={[
                styles.handle,
                styles.e,
              ]}
            />

            <View
              style={[
                styles.handle,
                styles.se,
              ]}
            />

            <View
              style={[
                styles.handle,
                styles.s,
              ]}
            />

            <View
              style={[
                styles.handle,
                styles.sw,
              ]}
            />

            <View
              style={[
                styles.handle,
                styles.w,
              ]}
            />
          </View>
        </View>
      </GestureDetector>


      <Pressable
        style={styles.useButton}
        onPress={useCrop}
      >
        <Text style={styles.useButtonText}>
          {saving
            ? 'Cropping...'
            : 'Use This Crop'}
        </Text>
      </Pressable>


      <Pressable
        style={styles.cancelButton}
        onPress={() =>
          setScreen('menu')
        }
      >
        <Text style={styles.cancelText}>
          Cancel
        </Text>
      </Pressable>

      <ThemeToggle
        themeMode={themeMode}
        toggleThemeMode={toggleThemeMode}
      />
    </View>
  );
}


function getStyles(colors) {
  return StyleSheet.create(withAppFont({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingTop: 55,
    paddingHorizontal: 12,
  },


  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },


  loadingText: {
    color: colors.textPrimary,
    fontSize: 18,
  },


  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
  },


  instructions: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },


  stage: {
    position: 'relative',
    backgroundColor: colors.boardTrayBackground,
    overflow: 'hidden',
  },


  image: {
    position: 'absolute',
  },


  cropBox: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: 'white',
  },


  gridVerticalOne: {
    position: 'absolute',
    left: '33.33%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor:
      'rgba(255,255,255,0.45)',
  },


  gridVerticalTwo: {
    position: 'absolute',
    left: '66.66%',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor:
      'rgba(255,255,255,0.45)',
  },


  gridHorizontalOne: {
    position: 'absolute',
    top: '33.33%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor:
      'rgba(255,255,255,0.45)',
  },


  gridHorizontalTwo: {
    position: 'absolute',
    top: '66.66%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor:
      'rgba(255,255,255,0.45)',
  },


  handle: {
    position: 'absolute',
    width: HANDLE_DOT_SIZE,
    height: HANDLE_DOT_SIZE,
    borderRadius:
      HANDLE_DOT_SIZE / 2,
    backgroundColor: 'white',
  },


  nw: {
    left: -HANDLE_DOT_SIZE / 2,
    top: -HANDLE_DOT_SIZE / 2,
  },


  n: {
    left: '50%',
    marginLeft:
      -HANDLE_DOT_SIZE / 2,
    top: -HANDLE_DOT_SIZE / 2,
  },


  ne: {
    right: -HANDLE_DOT_SIZE / 2,
    top: -HANDLE_DOT_SIZE / 2,
  },


  e: {
    right: -HANDLE_DOT_SIZE / 2,
    top: '50%',
    marginTop:
      -HANDLE_DOT_SIZE / 2,
  },


  se: {
    right: -HANDLE_DOT_SIZE / 2,
    bottom: -HANDLE_DOT_SIZE / 2,
  },


  s: {
    left: '50%',
    marginLeft:
      -HANDLE_DOT_SIZE / 2,
    bottom: -HANDLE_DOT_SIZE / 2,
  },


  sw: {
    left: -HANDLE_DOT_SIZE / 2,
    bottom: -HANDLE_DOT_SIZE / 2,
  },


  w: {
    left: -HANDLE_DOT_SIZE / 2,
    top: '50%',
    marginTop:
      -HANDLE_DOT_SIZE / 2,
  },


  useButton: {
    backgroundColor: colors.buttonPrimary,
    paddingVertical: 15,
    borderRadius: 18,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },


  useButtonText: {
    color: colors.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },


  cancelButton: {
    padding: 14,
  },


  cancelText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  }));
}