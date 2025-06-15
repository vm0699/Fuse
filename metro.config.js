const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure `.cjs` files and reanimated plugin are supported
config.resolver.sourceExts.push('cjs');

module.exports = config;
