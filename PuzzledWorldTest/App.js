import { useEffect, useState } from 'react';
import { Linking, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import HomeScreen from './screens/homescreen';
import MenuScreen from './screens/menuscreen';
import GalleryScreen from './screens/galleryscreen';
import CompletedScreen from './screens/completedscreen';
import FavoritesScreen from './screens/favoritesscreen';
import CropScreen from './screens/cropscreen';
import PuzzleScreen from './screens/puzzlescreen';
import AuthScreen from './screens/authscreen';
import { subscribeToAuthChanges } from './lib/auth';
import { loadSharedPuzzle } from './lib/puzzleData';
import { loadThemeMode, saveThemeMode } from './lib/themePreference';
import { DEFAULT_THEME_MODE, THEMES } from './constants/theme';

function CurrentScreen({
  screen,
  setScreen,
  image,
  setImage,
  imageOrientation,
  setImageOrientation,
  difficulty,
  setDifficulty,
  difficultyLabel,
  setDifficultyLabel,
  artworkTitle,
  setArtworkTitle,
  artworkArtist,
  setArtworkArtist,
  artworkId,
  setArtworkId,
  user,
  authInitializing,
  resumeState,
  setResumeState,
  colors,
  themeMode,
  toggleThemeMode,
}) {
  if (screen === 'auth') {
    return (
      <AuthScreen
        setScreen={setScreen}
        colors={colors}
        themeMode={themeMode}
        toggleThemeMode={toggleThemeMode}
      />
    );
  }

  if (screen === 'menu') {
    return (
      <MenuScreen
        setScreen={setScreen}
        image={image}
        setImage={setImage}
        setImageOrientation={setImageOrientation}
        setDifficulty={setDifficulty}
        setDifficultyLabel={setDifficultyLabel}
        artworkTitle={artworkTitle}
        setArtworkTitle={setArtworkTitle}
        setArtworkArtist={setArtworkArtist}
        setArtworkId={setArtworkId}
        user={user}
        colors={colors}
        themeMode={themeMode}
        toggleThemeMode={toggleThemeMode}
      />
    );
  }

  if (screen === 'gallery') {
    return (
      <GalleryScreen
        setScreen={setScreen}
        setImage={setImage}
        setImageOrientation={setImageOrientation}
        setArtworkTitle={setArtworkTitle}
        setArtworkArtist={setArtworkArtist}
        setArtworkId={setArtworkId}
        user={user}
        colors={colors}
        themeMode={themeMode}
        toggleThemeMode={toggleThemeMode}
      />
    );
  }

  if (screen === 'completed') {
    return (
      <CompletedScreen
        setScreen={setScreen}
        setImage={setImage}
        setImageOrientation={setImageOrientation}
        setArtworkTitle={setArtworkTitle}
        setArtworkArtist={setArtworkArtist}
        setArtworkId={setArtworkId}
        user={user}
        colors={colors}
        themeMode={themeMode}
        toggleThemeMode={toggleThemeMode}
      />
    );
  }

  if (screen === 'favorites') {
    return (
      <FavoritesScreen
        setScreen={setScreen}
        setImage={setImage}
        setImageOrientation={setImageOrientation}
        setArtworkTitle={setArtworkTitle}
        setArtworkArtist={setArtworkArtist}
        setArtworkId={setArtworkId}
        user={user}
        colors={colors}
        themeMode={themeMode}
        toggleThemeMode={toggleThemeMode}
      />
    );
  }

  if (screen === 'crop') {
    return (
      <CropScreen
        image={image}
        imageOrientation={imageOrientation}
        setImage={setImage}
        setScreen={setScreen}
        colors={colors}
        themeMode={themeMode}
        toggleThemeMode={toggleThemeMode}
      />
    );
  }

  if (screen === 'puzzle') {
    return (
      <PuzzleScreen
        image={image}
        setScreen={setScreen}
        difficulty={difficulty}
        difficultyLabel={difficultyLabel}
        artworkTitle={artworkTitle}
        artworkArtist={artworkArtist}
        artworkId={artworkId}
        user={user}
        resumeState={resumeState}
        setResumeState={setResumeState}
        colors={colors}
        themeMode={themeMode}
        toggleThemeMode={toggleThemeMode}
      />
    );
  }

  return (
    <HomeScreen
      setScreen={setScreen}
      user={user}
      authInitializing={authInitializing}
      setImage={setImage}
      setDifficulty={setDifficulty}
      setDifficultyLabel={setDifficultyLabel}
      setArtworkTitle={setArtworkTitle}
      setArtworkArtist={setArtworkArtist}
      setArtworkId={setArtworkId}
      setResumeState={setResumeState}
      colors={colors}
      themeMode={themeMode}
      toggleThemeMode={toggleThemeMode}
    />
  );
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [image, setImage] = useState(null);
  const [imageOrientation, setImageOrientation] = useState(1);
  const [difficulty, setDifficulty] = useState(6);
  const [difficultyLabel, setDifficultyLabel] = useState(null);
  const [artworkTitle, setArtworkTitle] = useState(null);
  const [artworkArtist, setArtworkArtist] = useState(null);
  const [artworkId, setArtworkId] = useState(null);

  const [user, setUser] = useState(null);
  const [authInitializing, setAuthInitializing] = useState(true);

  // { trayPieces, loosePieces } in grid-unit form, loaded from a saved
  // in-progress puzzle - null for a fresh puzzle.
  const [resumeState, setResumeState] = useState(null);

  const [themeMode, setThemeMode] = useState(DEFAULT_THEME_MODE);

  const [fontsLoaded] = useFonts({
    Geomini: require('./assets/fonts/Geomini-Regular.ttf'),
    GeominiSemiBold: require('./assets/fonts/Geomini-SemiBold.ttf'),
  });

  useEffect(() => {
    loadThemeMode().then(setThemeMode);
  }, []);

  const toggleThemeMode = () => {
    setThemeMode((current) => {
      const next = current === 'night' ? 'day' : 'night';
      saveThemeMode(next);
      return next;
    });
  };

  const colors = THEMES[themeMode];

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      setUser(nextUser);
      setAuthInitializing(false);
    });

    return unsubscribe;
  }, []);

  // Opening a puzzledworld://share/<id> link (whether the app was cold
  // started from it or was already running) loads that shared puzzle's
  // image/difficulty and jumps straight into it, bypassing the resume
  // flow since this is always a fresh puzzle.
  useEffect(() => {
    const openSharedPuzzle = async (url) => {
      const match = url && url.match(/share\/([^/?#]+)/);

      if (!match) {
        return;
      }

      try {
        const shared = await loadSharedPuzzle(match[1]);

        if (!shared) {
          alert('This puzzle link is no longer available.');
          return;
        }

        setImage(shared.imageDownloadUrl);
        setImageOrientation(1);
        setDifficulty(shared.size);
        setDifficultyLabel(shared.difficultyLabel);
        setArtworkTitle(null);
        setArtworkArtist(null);
        setArtworkId(null);
        setScreen('puzzle');
      } catch (error) {
        console.log('Could not load shared puzzle:', error);
        alert('Could not open this puzzle link.');
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url) {
        openSharedPuzzle(url);
      }
    });

    const subscription = Linking.addEventListener('url', ({ url }) => {
      openSharedPuzzle(url);
    });

    return () => subscription.remove();
  }, []);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CurrentScreen
        screen={screen}
        setScreen={setScreen}
        image={image}
        setImage={setImage}
        imageOrientation={imageOrientation}
        setImageOrientation={setImageOrientation}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        difficultyLabel={difficultyLabel}
        setDifficultyLabel={setDifficultyLabel}
        artworkTitle={artworkTitle}
        setArtworkTitle={setArtworkTitle}
        artworkArtist={artworkArtist}
        setArtworkArtist={setArtworkArtist}
        artworkId={artworkId}
        setArtworkId={setArtworkId}
        user={user}
        authInitializing={authInitializing}
        resumeState={resumeState}
        setResumeState={setResumeState}
        colors={colors}
        themeMode={themeMode}
        toggleThemeMode={toggleThemeMode}
      />
    </GestureHandlerRootView>
  );
}
