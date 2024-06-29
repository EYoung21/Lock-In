if (typeof process === 'undefined') {
  global.process = require('process');
}

if (typeof process.cwd === 'undefined') {
  process.cwd = () => '/';
}

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import FullApp from './FullApp';
import { name as appName } from './app.json';
import PushNotification from 'react-native-push-notification';

if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
  require('dotenv').config();
}

// Configure push notifications
PushNotification.configure({
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);
  },
  popInitialNotification: true,
  requestPermissions: Platform.OS === 'ios',
});

AppRegistry.registerComponent(appName, () => FullApp);
