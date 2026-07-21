import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

import { deleteAccount, signOutUser } from '../lib/auth';
import {
  hasInProgressPuzzle,
  loadInProgressPuzzle,
  listCompletedPuzzles,
} from '../lib/puzzleData';
import ThemeToggle from '../components/ThemeToggle';
import { withAppFont } from '../constants/typography';


// Real ads only serve outside dev, so testing never risks clicking a live
// ad and getting the AdMob account flagged for invalid traffic.
const BANNER_AD_UNIT_ID = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-7328298342514333/2603036622';


export default function HomeScreen({
  setScreen,
  user,
  authInitializing,
  setImage,
  setDifficulty,
  setDifficultyLabel,
  setArtworkTitle,
  setArtworkArtist,
  setArtworkId,
  setResumeState,
  colors,
  themeMode,
  toggleThemeMode,
}) {
  const styles = getStyles(colors);

  const [canResume, setCanResume] = useState(false);
  const [completedCount, setCompletedCount] = useState(null);
  const [resuming, setResuming] = useState(false);
  const [deleting, setDeleting] = useState(false);


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
      setArtworkId(null);

      setResumeState({
        trayPieces: data.trayPieces,
        loosePieces: data.loosePieces,
      });

      setScreen('puzzle');
    } finally {
      setResuming(false);
    }
  };


  const runDeleteAccount = async () => {
    setDeleting(true);

    try {
      await deleteAccount();
    } catch (error) {
      console.log('Could not delete account:', error);

      alert(
        'Could not delete your account: ' +
          (error?.message ?? error)
      );
    } finally {
      setDeleting(false);
    }
  };


  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete your account?',
      'This permanently deletes your account, saved puzzles, favorites, and completed-puzzle history. This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Delete',
          style: 'destructive',
          onPress: runDeleteAccount,
        },
      ]
    );
  };


  return (
    <View style={styles.container}>
      <View style={styles.logoBox}>
        <Image
          source={require('../assets/adaptive-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
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

      {user && (
        <Pressable
          style={styles.deleteAccountCorner}
          onPress={confirmDeleteAccount}
          disabled={deleting}
        >
          <Text style={styles.deleteText}>
            {deleting ? 'Deleting…' : 'Delete my account'}
          </Text>
        </Pressable>
      )}

      <View style={styles.bannerDock}>
        <BannerAd
          unitId={BANNER_AD_UNIT_ID}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />
      </View>

      <StatusBar style={colors.statusBarStyle} />
    </View>
  );
}

function getStyles(colors) {
  return StyleSheet.create(withAppFont({
    container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 25 },
    logoBox: {
      width: 112,
      height: 112,
      borderRadius: 26,
      backgroundColor: '#ffffff',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
      shadowColor: '#000000',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4,
    },
    logo: { width: '210%', height: '210%' },
    title: { fontSize: 40, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 12 },
    subtitle: { color: colors.textSecondary, textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 24 },
    account: { alignItems: 'center', marginTop: 20, marginBottom: 8 },
    accountText: { color: colors.textPrimary, fontSize: 15 },
    accountSubtext: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
    linkText: { color: colors.linkText, fontSize: 15, marginTop: 6, textDecorationLine: 'underline' },
    deleteText: { color: '#dc2626', fontSize: 12, textDecorationLine: 'underline', opacity: 0.8 },
    deleteAccountCorner: { position: 'absolute', left: 16, bottom: 90 },
    bannerDock: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
    button: { backgroundColor: colors.buttonPrimary, paddingVertical: 15, paddingHorizontal: 35, borderRadius: 18, marginTop: 14, width: '100%', alignItems: 'center' },
    resumeButton: { backgroundColor: colors.resumeButtonBackground, paddingVertical: 15, paddingHorizontal: 35, borderRadius: 18, marginTop: 6, width: '100%', alignItems: 'center' },
    buttonText: { color: colors.buttonText, fontSize: 18, fontWeight: 'bold' },
    spinner: { marginTop: 14 },
  }));
}
