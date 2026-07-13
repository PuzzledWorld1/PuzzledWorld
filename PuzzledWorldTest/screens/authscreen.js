import { useState } from 'react';

import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';

import {
  signIn,
  signUp,
  signInWithGoogleWeb,
} from '../lib/auth';
import ThemeToggle from '../components/ThemeToggle';
import { withAppFont } from '../constants/typography';


export default function AuthScreen({ setScreen, colors, themeMode, toggleThemeMode }) {
  const styles = getStyles(colors);

  const [mode, setMode] = useState('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);


  const submit = async () => {
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'signIn') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }

      setScreen('home');
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };


  const continueWithGoogle = async () => {
    setError(null);
    setSubmitting(true);

    try {
      await signInWithGoogleWeb();
      setScreen('home');
    } catch (googleError) {
      setError(googleError.message);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <View style={styles.container}>
      <StatusBar style={colors.statusBarStyle} />

      <Text style={styles.logo}>🧩</Text>

      <Text style={styles.title}>
        {mode === 'signIn' ? 'Sign In' : 'Create Account'}
      </Text>

      <Text style={styles.subtitle}>
        Save your progress and pick up puzzles where you left off.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <Pressable
        style={styles.button}
        onPress={submit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting
            ? 'Please wait...'
            : mode === 'signIn'
              ? 'Sign In'
              : 'Create Account'}
        </Text>
      </Pressable>

      {Platform.OS === 'web' && (
        <Pressable
          style={styles.googleButton}
          onPress={continueWithGoogle}
          disabled={submitting}
        >
          <Text style={styles.buttonText}>
            Continue with Google
          </Text>
        </Pressable>
      )}

      <Pressable
        onPress={() =>
          setMode(mode === 'signIn' ? 'signUp' : 'signIn')
        }
      >
        <Text style={styles.switchText}>
          {mode === 'signIn'
            ? "Don't have an account? Create one"
            : 'Already have an account? Sign in'}
        </Text>
      </Pressable>

      <Pressable onPress={() => setScreen('menu')}>
        <Text style={styles.skipText}>
          Continue as Guest
        </Text>
      </Pressable>

      <Pressable onPress={() => setScreen('home')}>
        <Text style={styles.backText}>
          Back
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
      justifyContent: 'center',
      padding: 25,
    },

    logo: {
      fontSize: 50,
      marginBottom: 6,
    },

    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 8,
    },

    subtitle: {
      color: colors.textSecondary,
      textAlign: 'center',
      fontSize: 15,
      marginBottom: 24,
    },

    input: {
      width: '100%',
      backgroundColor: colors.boardTrayBackground,
      color: colors.textPrimary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      marginBottom: 12,
    },

    error: {
      color: '#f87171',
      fontSize: 14,
      marginBottom: 12,
      textAlign: 'center',
    },

    button: {
      backgroundColor: colors.buttonPrimary,
      paddingVertical: 15,
      borderRadius: 18,
      width: '100%',
      alignItems: 'center',
      marginTop: 6,
    },

    googleButton: {
      backgroundColor: colors.resumeButtonBackground,
      paddingVertical: 15,
      borderRadius: 18,
      width: '100%',
      alignItems: 'center',
      marginTop: 12,
    },

    buttonText: {
      color: colors.buttonText,
      fontSize: 18,
      fontWeight: 'bold',
    },

    switchText: {
      color: colors.textSecondary,
      marginTop: 22,
      fontSize: 15,
    },

    skipText: {
      color: colors.textSecondary,
      marginTop: 18,
      fontSize: 15,
      textDecorationLine: 'underline',
    },

    backText: {
      color: colors.textSecondary,
      marginTop: 24,
      fontSize: 15,
    },
  }));
}
