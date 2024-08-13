module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }],
    ['@babel/plugin-transform-private-methods', { loose: true }],  // Add this line
  ],
};
