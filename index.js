/**
 * @format
 */

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
  
  if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
    require('dotenv').config();
  }
  
  AppRegistry.registerComponent(appName, () => FullApp);
  