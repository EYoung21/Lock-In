import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';
import CustomizationScreen from './CustomizationScreen';
import StatisticsScreen from './StatisticsScreen';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignupScreen';
import { StatusBar } from 'react-native';
import { TotalElapsedProvider } from './TotalElapsedContext';
import auth from '@react-native-firebase/auth';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

export const CollapseContext = React.createContext({
  collapsed: false,
  setCollapsed: (collapsed: boolean) => { collapsed },
});

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

const AppDrawer = () => {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <CollapseContext.Provider value={{ collapsed, setCollapsed }}>
      <StatusBar hidden={collapsed} />
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} options={{ headerShown: !collapsed }} />
        <Drawer.Screen name="Customization" component={CustomizationScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
        <Drawer.Screen name="Statistics" component={StatisticsScreen} />
      </Drawer.Navigator>
    </CollapseContext.Provider>
  );
};

const FullApp = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  return (
    <TotalElapsedProvider>
      <NavigationContainer>
        {user ? <AppDrawer /> : <AuthStack />}
      </NavigationContainer>
    </TotalElapsedProvider>
  );
};

export default FullApp;