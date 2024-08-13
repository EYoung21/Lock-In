import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';
import CustomizationScreen from './CustomizationScreen';
import StatisticsScreen from './StatisticsScreen';
import { StatusBar } from 'react-native';
import { TotalElapsedProvider } from './TotalElapsedContext';

const Drawer = createDrawerNavigator();

export const CollapseContext = React.createContext({
  collapsed: false,
  setCollapsed: (collapsed:boolean) => { collapsed },
});

const FullApp = () => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <CollapseContext.Provider value={{ collapsed, setCollapsed }}>
      <TotalElapsedProvider>
        <StatusBar hidden={collapsed} />
        <NavigationContainer>
          <Drawer.Navigator initialRouteName="Home">
            <Drawer.Screen name="Home" component={HomeScreen} options={{ headerShown: !collapsed }} />
            <Drawer.Screen name="Customization" component={CustomizationScreen} />
            <Drawer.Screen name="Settings" component={SettingsScreen} />
            <Drawer.Screen name="Statistics" component={StatisticsScreen} />
          </Drawer.Navigator>
        </NavigationContainer>
      </TotalElapsedProvider>
    </CollapseContext.Provider>
  );
};

export default FullApp;