import { useState } from 'react';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { withAppFont } from '../constants/typography';


const MINUTE_OPTIONS = [1, 2, 3, 4, 5];


function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}


// Timer Mode toggle + minutes dropdown shown at the top of the puzzle
// screen. The dropdown lives in its own relatively-positioned wrapper so
// its open/closed options list can be absolutely positioned - that keeps
// it from ever affecting the header's measured height (see puzzlescreen's
// boardMaxHeight), which would otherwise make the board jump size every
// time the dropdown opens.
export default function TimerToggle({
  enabled,
  minutes,
  secondsLeft,
  onToggle,
  onChangeMinutes,
  colors,
}) {
  const styles = getStyles(colors);

  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <View style={styles.row}>
      <Pressable
        style={[
          styles.toggle,
          enabled && styles.toggleActive,
        ]}
        onPress={onToggle}
      >
        <Text style={styles.toggleText}>
          {enabled
            ? `⏱ ${formatTime(secondsLeft)}`
            : '⏱ Timer: Off'}
        </Text>
      </Pressable>

      <View style={styles.pickerWrapper}>
        <Pressable
          style={styles.pickerTrigger}
          onPress={() =>
            setPickerOpen((current) => !current)
          }
        >
          <Text style={styles.pickerTriggerText}>
            {minutes} min {pickerOpen ? '▲' : '▼'}
          </Text>
        </Pressable>

        {pickerOpen && (
          <View style={styles.pickerOptions}>
            {MINUTE_OPTIONS.map((option) => (
              <Pressable
                key={option}
                style={styles.pickerOption}
                onPress={() => {
                  onChangeMinutes(option);
                  setPickerOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    option === minutes &&
                      styles.pickerOptionTextActive,
                  ]}
                >
                  {option} min
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}


function getStyles(colors) {
  return StyleSheet.create(withAppFont({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },

    toggle: {
      backgroundColor: colors.buttonSecondary,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 10,
      marginRight: 8,
    },

    toggleActive: {
      backgroundColor: colors.buttonPrimary,
    },

    toggleText: {
      color: colors.buttonText,
      fontSize: 13,
      fontWeight: 'bold',
    },

    pickerWrapper: {
      position: 'relative',
      zIndex: 50,
      elevation: 50,
    },

    pickerTrigger: {
      backgroundColor: colors.buttonSecondary,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 10,
    },

    pickerTriggerText: {
      color: colors.buttonText,
      fontSize: 13,
      fontWeight: 'bold',
    },

    pickerOptions: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: 4,
      backgroundColor: colors.boardTrayBackground,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 10,
      overflow: 'hidden',
      minWidth: 90,
    },

    pickerOption: {
      paddingVertical: 8,
      paddingHorizontal: 14,
    },

    pickerOptionText: {
      color: colors.textPrimary,
      fontSize: 13,
    },

    pickerOptionTextActive: {
      color: colors.highlightBorder,
      fontWeight: 'bold',
    },
  }));
}
