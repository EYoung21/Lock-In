import React, { useState, useEffect, useContext, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import SettingsScreen from './SettingsScreen';
import CustomizationScreen from './CustomizationScreen';
import StatisticsScreen from './StatisticsScreen';
import LoginScreen from './LoginScreen';
import SignUpScreen from './SignupScreen';
import { StatusBar, View, ActivityIndicator, Text } from 'react-native';
import { TotalElapsedProvider, TotalElapsedContext } from './TotalElapsedContext';
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

const FullAppContent = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const { manualSync } = useContext(TotalElapsedContext);

  const onAuthStateChanged = useCallback((user) => {
    setUser(user);
    setInitializing(false);
  }, []);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return () => subscriber(); // unsubscribe on unmount
  }, [onAuthStateChanged]);

  useEffect(() => {
    if (!initializing && user) {
      console.log('User logged in, preparing to sync');
      // Delay the sync to ensure components are fully mounted
      const timer = setTimeout(() => {
        console.log('Starting manual sync after user login');
        manualSync()
          .then(() => {
            console.log('Manual sync completed after user login');
            setIsReady(true);
          })
          .catch((error) => {
            console.error('Error during manual sync after login:', error);
            setIsReady(true); // Set ready even if sync fails to avoid app getting stuck
          });
      }, 1000); // Increased delay to 1 second

      return () => clearTimeout(timer);
    } else if (!initializing && !user) {
      // If not initializing and no user, we're ready to show login screen
      setIsReady(true);
    }
  }, [initializing, user, manualSync]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Initializing App...</Text>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>{user ? 'Syncing Data...' : 'Preparing App...'}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppDrawer /> : <AuthStack />}
    </NavigationContainer>
  );
};

const FullApp = () => {
  return (
    <TotalElapsedProvider>
      <FullAppContent />
    </TotalElapsedProvider>
  );
};

export default FullApp;