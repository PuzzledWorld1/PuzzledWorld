import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';

import { StatusBar } from 'expo-status-bar';

import { useState } from 'react';

import * as ImagePicker from 'expo-image-picker';

import { DIFFICULTIES } from '../constants/difficulties';
import ThemeToggle from '../components/ThemeToggle';
import { withAppFont } from '../constants/typography';
import { reportImage } from '../lib/reports';


export default function MenuScreen({
  setScreen,
  image,
  setImage,
  setImageOrientation,
  setDifficulty,
  setDifficultyLabel,
  artworkTitle,
  setArtworkTitle,
  setArtworkArtist,
  user,
  colors,
  themeMode,
  toggleThemeMode,
}) {
  const styles = getStyles(colors);

  const [reporting, setReporting] =
    useState(false);

  // Gallery art is already vetted museum content and always has a
  // title/artist set - a report button only makes sense for a photo the
  // person just brought in themselves.
  const isOwnUpload =
    Boolean(image) && !artworkTitle;

  const submitReport = async () => {
    setReporting(true);

    try {
      await reportImage({
        uid: user?.uid,
        localImageUri: image,
        context: 'byoa-preview',
      });

      alert(
        'Thanks - this has been sent for review.'
      );
    } catch (error) {
      console.log(
        'Could not submit report:',
        error
      );

      alert(
        'Could not submit the report. Please try again.'
      );
    } finally {
      setReporting(false);
    }
  };

  const confirmReport = () => {
    Alert.alert(
      'Report this image?',
      'This sends the image to the developer for review as potentially inappropriate content.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Report',
          style: 'destructive',
          onPress: submitReport,
        },
      ]
    );
  };

  const pickImage = async () => {
    const permission =
      await ImagePicker
        .requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert(
        'Permission to access photos is required.'
      );

      return;
    }


    const result =
      await ImagePicker
        .launchImageLibraryAsync({
          mediaTypes: ['images'],

          // Our crop screen handles editing now.
          allowsEditing: false,

          quality: 1,

          // Camera photos often carry an EXIF rotation tag rather than
          // physically-rotated pixels - the crop screen needs the real
          // tag value (not just a "looks right" preview) to bake the
          // correct orientation into the file before doing any crop math.
          exif: true,
        });


    if (!result.canceled) {
      const asset =
        result.assets[0];

      const orientation =
        asset.exif?.Orientation ??
        asset.exif?.orientation ??
        1;

      setImage(
        asset.uri
      );

      setImageOrientation(
        orientation
      );

      setArtworkTitle(null);
      setArtworkArtist(null);

      setScreen('crop');
    }
  };


  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.logo}>
        🧩
      </Text>

      <Text style={styles.title}>
        Get Puzzled
      </Text>


      <Pressable
        style={styles.button}
        onPress={pickImage}
      >
        <View style={styles.buttonRow}>
          <Text style={styles.buttonEmoji}>
            📷
          </Text>

          <Text style={styles.buttonText}>
            Bring Your Own Art
          </Text>
        </View>
      </Pressable>


      <Pressable
        style={styles.button}
        onPress={() => setScreen('gallery')}
      >
        <View style={styles.buttonRow}>
          <Text style={styles.buttonEmoji}>
            🎨
          </Text>

          <Text style={styles.buttonText}>
            Gallery
          </Text>
        </View>
      </Pressable>


      {image && (
        <Image
          source={{ uri: image }}
          style={styles.previewImage}
        />
      )}

      {isOwnUpload && (
        <Pressable
          style={styles.reportButton}
          disabled={reporting}
          onPress={confirmReport}
        >
          <Text style={styles.reportText}>
            {reporting
              ? '🚩 Reporting…'
              : '🚩 Report this image'}
          </Text>
        </Pressable>
      )}


      {image && (
        <Text style={styles.chooseText}>
          Choose difficulty:
        </Text>
      )}


      {image &&
        DIFFICULTIES.map((level) => (
          <Pressable
            key={level.label}
            style={styles.smallButton}
            onPress={() => {
              setDifficulty(level.size);

              setDifficultyLabel(level.label);

              setScreen('puzzle');
            }}
          >
            <Text style={styles.buttonText}>
              {level.label}
              {' - '}
              {level.pieces}
              {' pieces'}
            </Text>
          </Pressable>
        ))}


      <Pressable
        onPress={() =>
          setScreen('home')
        }
      >
        <Text style={styles.backText}>
          Back Home
        </Text>
      </Pressable>

      <ThemeToggle
        themeMode={themeMode}
        toggleThemeMode={toggleThemeMode}
      />


      <StatusBar style={colors.statusBarStyle} />
    </ScrollView>
  );
}


function getStyles(colors) {
  return StyleSheet.create(withAppFont({
    scroll: {
      flex: 1,
      backgroundColor: colors.background,
    },

    container: {
      flexGrow: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      paddingVertical: 30,
    },

    logo: {
      fontSize: 44,
      marginBottom: 4,
    },

    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.textPrimary,
      marginBottom: 8,
    },

    button: {
      backgroundColor: colors.buttonSecondary,
      paddingVertical: 9,
      paddingHorizontal: 35,
      borderRadius: 14,
      marginTop: 8,
      width: '65%',
      alignItems: 'center',
    },

    smallButton: {
      backgroundColor: colors.buttonPrimary,
      paddingVertical: 6,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginTop: 6,
      width: '70%',
      alignItems: 'center',
    },

    buttonRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    buttonEmoji: {
      fontSize: 14,
      marginRight: 6,
    },

    buttonText: {
      color: colors.buttonText,
      fontSize: 14,
      fontWeight: 'bold',
    },

    previewImage: {
      width: 130,
      height: 130,
      borderRadius: 12,
      marginTop: 10,
    },

    reportButton: {
      marginTop: 8,
      padding: 6,
    },

    reportText: {
      color: '#f87171',
      fontSize: 12,
    },

    chooseText: {
      color: colors.textSecondary,
      fontSize: 13,
      marginTop: 10,
    },

    backText: {
      color: colors.textSecondary,
      marginTop: 14,
      fontSize: 14,
    },
  }));
}
