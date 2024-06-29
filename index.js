if (typeof process === 'undefined') {
  global.process = require('process');
}

if (typeof process.cwd === 'undefined') {
  process.cwd = () => '/';
}

import 'react-native-gesture-handler';
import { AppRegistry, Platform } from 'react-native';
import FullApp from './FullApp';
import { name as appName } from './app.json';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
  require('dotenv').config();
}

// Configure push notifications
PushNotification.configure({
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);
    notification.finish(PushNotificationIOS.FetchResult.NoData); // Add this line to handle iOS notifications
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

AppRegistry.registerComponent(appName, () => FullApp);
