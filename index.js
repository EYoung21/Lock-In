/**
 * @format
 */

// require('dotenv').config();
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import FullApp from './FullApp';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => FullApp);