import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { signOutUser } from '../lib/auth';
import {
  hasInProgressPuzzle,
  loadInProgressPuzzle,
  listCompletedPuzzles,
} from '../lib/puzzleData';
import ThemeToggle from '../components/ThemeToggle';
import { withAppFont } from '../constants/typography';


export default function HomeScreen({
  setScreen,
  user,
  authInitializing,
  setImage,
  setDifficulty,
  setDifficultyLabel,
  setArtworkTitle,
  setArtworkArtist,
  setResumeState,
  colors,
  themeMode,
  toggleThemeMode,
}) {
  const styles = getStyles(colors);

  const [canResume, setCanResume] = useState(false);
  const [completedCount, setCompletedCount] = useState(null);
  const [resuming, setResuming] = useState(false);


  useEffect(() => {
    if (!user) {
      setCanResume(false);
      setCompletedCount(null);
      return;
    }

    hasInProgressPuzzle(user.uid).then(setCanResume);

    listCompletedPuzzles(user.uid).then((puzzles) =>
      setCompletedCount(puzzles.length)
    );
  }, [user]);


  const resumePuzzle = async () => {
    setResuming(true);

    try {
      const data = await loadInProgressPuzzle(user.uid);

      if (!data) {
        setCanResume(false);
        return;
      }

      setImage(data.imageDownloadUrl);
      setDifficulty(data.size);
      setDifficultyLabel(data.difficultyLabel);
      setArtworkTitle(null);
      setArtworkArtist(null);

      setResumeState({
        trayPieces: data.trayPieces,
        loosePieces: data.loosePieces,
      });

      setScreen('puzzle');
    } finally {
      setResuming(false);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🧩</Text>
      <Text style={styles.title}>Puzzled World</Text>
      <Text style={styles.subtitle}>
        Turn photos and artwork into puzzles!
      </Text>

      {canResume && (
        <Pressable
          style={styles.resumeButton}
          onPress={resumePuzzle}
          disabled={resuming}
        >
          <Text style={styles.buttonText}>
            {resuming ? 'Loading...' : '↻ Resume Puzzle'}
          </Text>
        </Pressable>
      )}

      <Pressable style={styles.button} onPress={() => setScreen('menu')}>
        <Text style={styles.buttonText}>Get Puzzled</Text>
      </Pressable>

      {!authInitializing && (
        <View style={styles.account}>
          {user ? (
            <>
              <Text style={styles.accountText}>
                Signed in as {user.email || 'Google user'}
              </Text>

              {completedCount !== null && (
                <Text style={styles.accountSubtext}>
                  🏆 {completedCount} puzzle{completedCount === 1 ? '' : 's'} completed
                </Text>
              )}

              <Pressable onPress={signOutUser}>
                <Text style={styles.linkText}>Sign Out</Text>
              </Pressable>
            </>
          ) : (
            <Pressable onPress={() => setScreen('auth')}>
              <Text style={styles.linkText}>Sign In to save your progress</Text>
            </Pressable>
          )}
        </View>
      )}

      {resuming && (
        <ActivityIndicator
          style={styles.spinner}
          color={colors.textSecondary}
        />
      )}

      <ThemeToggle
        themeMode={themeMode}
        toggleThemeMode={toggleThemeMode}
      />

      <Text style={styles.disclaimer}>
        Some artwork (e.g. classical/fine art) or user-submitted images may contain nudity.
      </Text>

      <StatusBar style={colors.statusBarStyle} />
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create(withAppFont({
    container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 25 },
    logo: { fontSize: 70, marginBottom: 10 },
    title: { fontSize: 40, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 12 },
    subtitle: { color: colors.textSecondary, textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 24 },
    account: { alignItems: 'center', marginTop: 20, marginBottom: 8 },
    accountText: { color: colors.textPrimary, fontSize: 15 },
    accountSubtext: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
    linkText: { color: colors.linkText, fontSize: 15, marginTop: 6, textDecorationLine: 'underline' },
    button: { backgroundColor: colors.buttonPrimary, paddingVertical: 15, paddingHorizontal: 35, borderRadius: 18, marginTop: 14, width: '100%', alignItems: 'center' },
    resumeButton: { backgroundColor: colors.resumeButtonBackground, paddingVertical: 15, paddingHorizontal: 35, borderRadius: 18, marginTop: 6, width: '100%', alignItems: 'center' },
    buttonText: { color: colors.buttonText, fontSize: 18, fontWeight: 'bold' },
    spinner: { marginTop: 14 },
    disclaimer: {
      color: colors.textSecondary,
      fontSize: 11,
      textAlign: 'center',
      marginTop: 16,
      paddingHorizontal: 20,
      opacity: 0.8,
    },
  }));
}
