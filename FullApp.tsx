import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';
import CustomizationScreen from './CustomizationScreen';
import StatisticsScreen from './StatisticsScreen';

const Drawer = createDrawerNavigator();

const FullApp = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
        <Drawer.Screen name="Customization" component={CustomizationScreen} />
        <Drawer.Screen name="Statistics" component={StatisticsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default FullApp;
