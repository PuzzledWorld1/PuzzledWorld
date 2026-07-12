const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The Firebase JS SDK's package.json "exports" map resolves differently
// under Metro's package-exports support than under Node/webpack, which
// surfaces as a runtime "Component auth has not been registered yet"
// error instead of a build-time one. Disabling it is the standard fix
// until Firebase's exports map is Metro-compatible.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
