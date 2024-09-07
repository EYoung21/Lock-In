import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Switch, Platform, Image, PermissionsAndroid, AppState, AppStateStatus } from 'react-native';
import { InstalledApps } from 'react-native-launcher-kit';
import { TotalElapsedContext } from './TotalElapsedContext';
import { Linking, Alert } from 'react-native';
import { NativeModules } from 'react-native';

const { AppServiceModule } = NativeModules;

const LOCK_IN_APP_ID = 'com.lockin'; // Change this to your actual app ID


const checkUsageStatsPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const hasPermission = await AppServiceModule.hasUsageStatsPermission();
      return hasPermission;
    } catch (error) {
      console.error('Error checking usage stats permission:', error);
      return false;
    }
  }
  return false; // For iOS or other platforms, return false
};

const requestUsageStatsPermission = () => {
  return new Promise((resolve) => {
    Alert.alert(
      'Permission Required',
      'To monitor running apps, you need to enable usage access for this app. The app will now open your device settings. Please grant the permission and return to the app.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { 
          text: 'Open Settings', 
          onPress: () => {
            Linking.openSettings();
            resolve(true);
          }
        },
      ],
      { cancelable: false }
    );
  });
};

const SettingsScreen = () => {
  const { whitelistedApps, setWhitelistedApps, appMonitoringEnabled, setAppMonitoringEnabled, isLockedIn } = useContext(TotalElapsedContext);
  const [apps, setApps] = useState<{ name: string, id: string, icon: any }[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);

  useEffect(() => {
    
    const checkPermission = async () => {
      setIsCheckingPermission(true);
      const permission = await checkUsageStatsPermission();
      setHasPermission(permission)
      setIsCheckingPermission(false);
    };
    checkPermission()
    
    const fetchApps = async () => {
      try {
        if (Platform.OS === 'android') {
          console.log('Running on Android');
          if (InstalledApps && typeof InstalledApps.getApps === 'function') {
            const apps = await InstalledApps.getApps();
            const filteredApps = apps
              .filter(app => app.packageName !== LOCK_IN_APP_ID)
              .map(app => ({ 
                name: app.label, 
                id: app.packageName,
                icon: `data:image/png;base64,${app.icon}` // Convert icon data to a base64 string
              }));
            console.log('Fetched apps:', filteredApps);
            setApps(filteredApps);
          } else {
            console.error('InstalledApps is not correctly initialized or does not have getApps method.');
          }
        }
        // Uncomment and use this block for iOS when needed
        // else if (Platform.OS === 'ios') {
        //   console.log('Running on iOS');
        //   console.log('AppList.getAll:', AppList?.getAll);
        //   if (AppList && typeof AppList.getAll === 'function') {
        //     AppList.getAll((apps) => {
        //       const filteredApps = apps
        //         .filter(app => app.appPath !== LOCK_IN_APP_ID)
        //         .map(app => ({ 
        //           name: app.app, 
        //           id: app.appPath,
        //           icon: `data:image/png;base64,${app.icon}` // If AppList supports icons
        //         }));
        //       console.log('Fetched apps:', filteredApps);
        //       setApps(filteredApps);
        //     });
        //   } else {
        //     console.error('AppList is not correctly initialized or does not have getAll method.');
        //   }
        // }
      } catch (error) {
        console.error('Failed to fetch apps:', error);
      }
    };

    fetchApps();
  }, []);

  useEffect(() => {
    // Ensure "Lock In" is always whitelisted
    if (!whitelistedApps.includes(LOCK_IN_APP_ID)) {
      setWhitelistedApps(prevState => [...prevState, LOCK_IN_APP_ID]);
    }

    // Update the native module with the current whitelisted apps
    updateNativeWhitelistedApps(whitelistedApps);
  }, [whitelistedApps]);

  const updateNativeWhitelistedApps = async (apps: string[]) => {
    try {
      await AppServiceModule.updateWhitelistedApps(apps);
    } catch (error) {
      console.error('Failed to update whitelisted apps in native module:', error);
    }
  };

  const toggleWhitelist = (appId: string) => {
    setWhitelistedApps(prevState =>
      prevState.includes(appId)
        ? prevState.filter(id => id !== appId)
        : [...prevState, appId]
    );
  };

  const handleToggle = async (value) => {
    if (value) {
      if (!hasPermission) {
        const userResponded = await requestUsageStatsPermission();
        if (userResponded) {
          // Wait a bit for the user to grant the permission
          setTimeout(async () => {
            const permission = await checkUsageStatsPermission();
            setHasPermission(permission);
            if (permission) {
              setAppMonitoringEnabled(true);
              if (isLockedIn) {
                AppServiceModule.startService();
              }
            } else {
              Alert.alert('Permission not granted', 'App monitoring cannot be enabled without the required permission.');
            }
          }, 1000); // Wait for 1 second
        }
      } else {
        setAppMonitoringEnabled(true);
        if (isLockedIn) {
          AppServiceModule.startService();
        }
      }
    } else {
      setAppMonitoringEnabled(false);
      AppServiceModule.stopService();
    }
  };
  
  if (isCheckingPermission) {
    return (
      <View style={styles.container}>
        <Text>Checking permissions...</Text>
      </View>
    );
  }
  
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Whitelist Productive Apps!</Text>
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Enable App Monitoring:</Text>
        <Switch
          value={appMonitoringEnabled}
          onValueChange={handleToggle}
          //add way to make it so that appMonitoringEnabled can only be true if useage permission is true
        />
      </View>
      <FlatList
        data={apps}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.appItem,
              whitelistedApps.includes(item.id) && styles.whitelisted
            ]}
            onPress={() => toggleWhitelist(item.id)}
          >
            <Image
              source={{ uri: item.icon }} // Display the app icon
              style={styles.icon}
            />
            <Text style={styles.appText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    color: '#000',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  toggleLabel: {
    fontSize: 18,
    color: '#000',
    marginRight: 10,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    margin: 5,
    backgroundColor: '#FF0000',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  whitelisted: {
    backgroundColor: 'green',
  },
  appText: {
    fontSize: 16,
    color: '#000', // Set the app name text color to black
    marginLeft: 10,
  },
  icon: {
    width: 40,
    height: 40,
  },
});

export default SettingsScreen;