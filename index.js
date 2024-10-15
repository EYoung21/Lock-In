import React, { useEffect } from 'react'; // Import React and useEffect
import 'react-native-reanimated'; // Ensure this is included for React Native Reanimated
import 'react-native-gesture-handler'; // Ensure this is included for gesture handling
import { AppRegistry, Platform } from 'react-native';
import FullApp from './FullApp';
import { name as appName } from './app.json';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import SplashScreen from 'react-native-splash-screen'; // Import SplashScreen
import { firebase } from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID_IOS,
  FIREBASE_APP_ID_ANDROID
} from '@env';

if (typeof globalThis.process === 'undefined') {
  globalThis.process = require('process');
}

if (typeof globalThis.process.cwd === 'undefined') {
  globalThis.process.cwd = () => '/';
}

if (typeof globalThis.process !== 'undefined' && typeof globalThis.process.cwd === 'function') {
  require('dotenv').config();
}

// Initialize Firebase
if (!firebase.apps.length) {
  const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: Platform.OS === 'ios' ? FIREBASE_APP_ID_IOS : FIREBASE_APP_ID_ANDROID
  };
  
  firebase.initializeApp(firebaseConfig);
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
    SplashScreen.hide();

    // You can add Firebase-related setup here if needed
    // For example, setting up auth state listener
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        console.log('User is signed in:', user.uid);
      } else {
        // User is signed out
        console.log('User is signed out');
      }
    });

    // Cleanup function
    return () => unsubscribe();
  }, []);

  return <FullApp />;
};

AppRegistry.registerComponent(appName, () => AppWrapper);