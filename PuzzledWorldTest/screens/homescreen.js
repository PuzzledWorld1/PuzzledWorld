import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { signOutUser } from '../lib/auth';
import {
  hasInProgressPuzzle,
  loadInProgressPuzzle,
  listCompletedPuzzles,
} from '../lib/puzzleData';


export default function HomeScreen({
  setScreen,
  user,
  authInitializing,
  setImage,
  setDifficulty,
  setDifficultyLabel,
  setResumeState,
}) {
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
      <Text style={styles.title}>PuzzledWorld</Text>
      <Text style={styles.subtitle}>
        Turn photos, artwork, and memories into puzzles.
      </Text>

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

      {resuming && (
        <ActivityIndicator
          style={styles.spinner}
          color="#cfc5dc"
        />
      )}

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#17111f', alignItems: 'center', justifyContent: 'center', padding: 25 },
  logo: { fontSize: 70, marginBottom: 10 },
  title: { fontSize: 34, fontWeight: 'bold', color: 'white', marginBottom: 12 },
  subtitle: { color: '#cfc5dc', textAlign: 'center', fontSize: 18, marginTop: 10, marginBottom: 24 },
  account: { alignItems: 'center', marginBottom: 20 },
  accountText: { color: 'white', fontSize: 15 },
  accountSubtext: { color: '#cfc5dc', fontSize: 14, marginTop: 4 },
  linkText: { color: '#a78bfa', fontSize: 15, marginTop: 6, textDecorationLine: 'underline' },
  button: { backgroundColor: '#8b5cf6', paddingVertical: 15, paddingHorizontal: 35, borderRadius: 18, marginTop: 14, width: '100%', alignItems: 'center' },
  resumeButton: { backgroundColor: '#3b3145', paddingVertical: 15, paddingHorizontal: 35, borderRadius: 18, marginTop: 6, width: '100%', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  spinner: { marginTop: 14 },
});
