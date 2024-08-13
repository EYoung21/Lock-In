module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',  // Ensure this is included for React Native Reanimated
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }],
    ['@babel/plugin-transform-private-methods', { loose: true }]  // Added line for private methods
  ],
};
