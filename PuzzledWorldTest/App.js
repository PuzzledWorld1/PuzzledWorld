import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './screens/homescreen';
import MenuScreen from './screens/menuscreen';
import CropScreen from './screens/cropscreen';
import PuzzleScreen from './screens/puzzlescreen';
import AuthScreen from './screens/authscreen';
import { subscribeToAuthChanges } from './lib/auth';

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
  user,
  authInitializing,
  resumeState,
  setResumeState,
}) {
  if (screen === 'auth') {
    return <AuthScreen setScreen={setScreen} />;
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
        user={user}
        resumeState={resumeState}
        setResumeState={setResumeState}
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
      setResumeState={setResumeState}
    />
  );
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [image, setImage] = useState(null);
  const [imageOrientation, setImageOrientation] = useState(1);
  const [difficulty, setDifficulty] = useState(6);
  const [difficultyLabel, setDifficultyLabel] = useState(null);

  const [user, setUser] = useState(null);
  const [authInitializing, setAuthInitializing] = useState(true);

  // { trayPieces, loosePieces } in grid-unit form, loaded from a saved
  // in-progress puzzle - null for a fresh puzzle.
  const [resumeState, setResumeState] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      setUser(nextUser);
      setAuthInitializing(false);
    });

    return unsubscribe;
  }, []);

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
        user={user}
        authInitializing={authInitializing}
        resumeState={resumeState}
        setResumeState={setResumeState}
      />
    </GestureHandlerRootView>
  );
}
