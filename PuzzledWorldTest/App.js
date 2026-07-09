import { useState } from 'react';
import HomeScreen from './screens/homescreen';
import MenuScreen from './screens/menuscreen';
import CropScreen from './screens/cropscreen';
import PuzzleScreen from './screens/puzzlescreen';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [image, setImage] = useState(null);
  const [difficulty, setDifficulty] = useState(6);

  if (screen === 'menu') {
    return (
      <MenuScreen
        setScreen={setScreen}
        image={image}
        setImage={setImage}
        setDifficulty={setDifficulty}
      />
    );
  }

  if (screen === 'crop') {
    return (
      <CropScreen
        image={image}
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