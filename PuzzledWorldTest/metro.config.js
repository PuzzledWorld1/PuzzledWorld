const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// @firebase/auth's package.json "exports" map has a dedicated
// "react-native" condition (dist/rn/index.js) that's the only build
// containing getReactNativePersistence and working native networking -
// package-exports resolution needs to be ON for Metro to ever reach it,
// or native falls back to the generic Node/browser build and auth
// breaks silently on-device.
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
