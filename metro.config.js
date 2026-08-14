const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable cjs and package exports resolution for Firebase SDK in Expo
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
