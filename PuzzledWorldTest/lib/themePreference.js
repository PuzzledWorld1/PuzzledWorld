import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_THEME_MODE, THEMES } from '../constants/theme';


const STORAGE_KEY = 'puzzledworld:themeMode';


export async function loadThemeMode() {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    return stored && THEMES[stored]
      ? stored
      : DEFAULT_THEME_MODE;
  } catch (error) {
    console.log(
      'Could not load theme preference:',
      error
    );

    return DEFAULT_THEME_MODE;
  }
}


export async function saveThemeMode(mode) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, mode);
  } catch (error) {
    console.log(
      'Could not save theme preference:',
      error
    );
  }
}
