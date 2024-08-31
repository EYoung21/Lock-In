import React, { useEffect } from 'react'; // Import React and useEffect
import 'react-native-reanimated'; // Ensure this is included for React Native Reanimated
import 'react-native-gesture-handler'; // Ensure this is included for gesture handling
import { AppRegistry, Platform } from 'react-native';
import FullApp from './FullApp';
import { name as appName } from './app.json';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import SplashScreen from 'react-native-splash-screen'; // Import SplashScreen

if (typeof globalThis.process === 'undefined') {
  globalThis.process = require('process');
}

if (typeof globalThis.process.cwd === 'undefined') {
  globalThis.process.cwd = () => '/';
}

if (typeof globalThis.process !== 'undefined' && typeof globalThis.process.cwd === 'function') {
  require('dotenv').config();
}

// Configure push notifications
PushNotification.configure({
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);
    notification.finish(PushNotificationIOS.FetchResult.NoData); // Handle iOS notifications
  },
  popInitialNotification: true,
  requestPermissions: Platform.OS === 'ios',
});

// Create a channel (required for Android)
PushNotification.createChannel(
  {
    channelId: 'your-channel-id',
    channelName: 'My channel',
    channelDescription: 'A channel to categorize your notifications',
    playSound: true,
    soundName: 'default',
    importance: 4, // Importance.HIGH (4)
    vibrate: true,
  },
  (created) => console.log(`createChannel returned '${created}'`)
);

// Register the main component
const AppWrapper = () => {
  useEffect(() => {
    SplashScreen.hide(); // Hide splash screen when your app is ready
  }, []);

  return <FullApp />;
};

AppRegistry.registerComponent(appName, () => AppWrapper);
