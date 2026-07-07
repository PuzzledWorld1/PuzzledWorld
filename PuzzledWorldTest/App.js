import { useState } from 'react';
import HomeScreen from './screens/homescreen';
import MenuScreen from './screens/menuscreen';
import PuzzleScreen from './screens/puzzlescreen';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [image, setImage] = useState(null);

  if (screen === 'menu') {
    return (
      <MenuScreen
        setScreen={setScreen}
        image={image}
        setImage={setImage}
      />
    );
  }

  if (screen === 'puzzle') {
    return <PuzzleScreen image={image} setScreen={setScreen} />;
  }

  return <HomeScreen setScreen={setScreen} />;
}