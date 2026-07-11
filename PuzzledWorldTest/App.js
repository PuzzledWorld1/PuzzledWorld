import { useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import HomeScreen from './screens/homescreen';
import MenuScreen from './screens/menuscreen';
import CropScreen from './screens/cropscreen';
import PuzzleScreen from './screens/puzzlescreen';

function CurrentScreen({
  screen,
  setScreen,
  image,
  setImage,
  imageOrientation,
  setImageOrientation,
  difficulty,
  setDifficulty,
}) {
  if (screen === 'menu') {
    return (
      <MenuScreen
        setScreen={setScreen}
        image={image}
        setImage={setImage}
        setImageOrientation={setImageOrientation}
        setDifficulty={setDifficulty}
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
      />
    );
  }

  return <HomeScreen setScreen={setScreen} />;
}

export default function App() {
  const [screen, setScreen] = useState('home');
  const [image, setImage] = useState(null);
  const [imageOrientation, setImageOrientation] = useState(1);
  const [difficulty, setDifficulty] = useState(6);

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
      />
    </GestureHandlerRootView>
  );
}