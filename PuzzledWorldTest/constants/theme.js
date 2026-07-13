// Night is today's existing dark navy/green/brown look, kept as the
// default. Day is a lighter sage-green/sky-blue variant. Every screen
// pulls its colors from here rather than hardcoding hex values, so the
// whole app can switch together via one toggle.
export const THEMES = {
  night: {
    statusBarStyle: 'light',

    background: '#0b0f1e',
    boardTrayBackground: '#161e33',
    border: '#8b5e3c',

    textPrimary: '#ffffff',
    textSecondary: '#cfc5dc',
    linkText: '#a78bfa',

    buttonPrimary: '#15803d',
    buttonSecondary: '#0d4d25',
    buttonText: '#ffffff',

    resumeButtonBackground: '#3b3145',

    captionBarBackground: 'rgba(0,0,0,0.55)',
    highlightBorder: '#fbbf24',
    highlightBackground: 'rgba(251, 191, 36, 0.25)',
  },

  day: {
    statusBarStyle: 'dark',

    background: '#a3b98d',
    boardTrayBackground: '#bccca6',
    border: '#4a98c9',

    textPrimary: '#1c2b18',
    textSecondary: '#3f5236',
    linkText: '#2e6f94',

    buttonPrimary: '#4fa3d1',
    buttonSecondary: '#2e6f94',
    buttonText: '#ffffff',

    resumeButtonBackground: '#a9c6da',

    captionBarBackground: 'rgba(28, 43, 24, 0.55)',
    highlightBorder: '#ff9f43',
    highlightBackground: 'rgba(255, 159, 67, 0.3)',
  },
};


export const DEFAULT_THEME_MODE = 'night';
