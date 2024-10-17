import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Switch, Platform, Image, Alert } from 'react-native';
import { InstalledApps } from 'react-native-launcher-kit';
import { TotalElapsedContext } from './TotalElapsedContext';
import { NativeModules } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { AppServiceModule } = NativeModules;

const LOCK_IN_APP_ID = 'com.lockin';

// Define the type for an app item
interface AppItem {
  name: string;
  id: string;
  icon: string;
}

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
            AppServiceModule.openUsageAccessSettings()
              .then(() => resolve(true))
              .catch((error) => {
                console.error('Failed to open usage access settings:', error);
                resolve(false);
              });
          }
        },
      ],
      { cancelable: false }
    );
  });
};

const checkManageOverlayPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const hasPermission2 = await AppServiceModule.hasManageOverlayPermission();
      return hasPermission2;
    } catch (error) {
      console.error('Error checking ManageOverlay permission:', error);
      return false;
    }
  }
  return false; // For iOS or other platforms, return false
};

const requestManageOverlayPermission = () => {
  return new Promise((resolve) => {
    Alert.alert(
      'Permission Required',
      'To block running apps, you need to enable Manage Overlay access for this app. The app will now open your device settings. Please grant the permission and return to the app.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { 
          text: 'Open Settings', 
          onPress: () => {
            AppServiceModule.openManageOverlayPermission()
              .then(() => resolve(true))
              .catch((error) => {
                console.error('Failed to open ManageOverlay settings:', error);
                resolve(false);
              });
          }
        },
      ],
      { cancelable: false }
    );
  });
};

const SettingsScreen = () => {
  const { blacklistedApps, setBlacklistedApps, appMonitoringEnabled, setAppMonitoringEnabled, isLockedIn, manageOverlayEnabled, setManageOverlayEnabled, appMonitoringOn, setAppMonitoringOn, manageOverlayOn, setManageOverlayOn } = useContext(TotalElapsedContext);
  const [apps, setApps] = useState<AppItem[]>([]); // Explicitly type the state
  const [hasPermission, setHasPermission] = useState(false);
  const [hasPermission2, setHasPermission2] = useState(false);

  const checkPermission = async () => {
    const permission = await checkUsageStatsPermission();
    setHasPermission(permission);
    return permission;
  };

  const checkPermission2 = async () => {
    const permission2 = await checkManageOverlayPermission();
    setHasPermission2(permission2);
    return permission2;
  };


  useEffect(() => {
    const syncAppMonitoringWithPermission = async () => {
      const permission = await checkPermission();
      if (permission) {
        setAppMonitoringEnabled(true);
        if (isLockedIn && manageOverlayEnabled && appMonitoringOn && manageOverlayOn) {
          AppServiceModule.startService();
        }
      } else {
        setAppMonitoringEnabled(false);
        setAppMonitoringOn(false);
        AppServiceModule.stopService();
      }
    };
    
    const syncManageOverlayWithPermission = async () => {
      const permission2 = await checkPermission2();
      if (permission2) {
        setManageOverlayEnabled(true);
        if (isLockedIn && appMonitoringEnabled && appMonitoringOn && manageOverlayOn) {
          AppServiceModule.startService();
        }
      } else {
        setManageOverlayEnabled(false);
        setManageOverlayOn(false); //becuse if permission goes off, then manageoverlay and appmonitoring has to go off
        AppServiceModule.stopService();
      }
    };

    // Initial sync
    syncAppMonitoringWithPermission();
    syncManageOverlayWithPermission();

    // Set up an interval to continuously check permission status
    const intervalId = setInterval(() => {
      syncAppMonitoringWithPermission();
      syncManageOverlayWithPermission();
    }, 1000); // Check every second

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        if (Platform.OS === 'android') {
          console.log('Running on Android');
          if (InstalledApps && typeof InstalledApps.getApps === 'function') {
            const fetchedApps = await InstalledApps.getApps();
            const filteredApps: AppItem[] = fetchedApps
              .filter(app => app.packageName !== LOCK_IN_APP_ID)
              .map(app => ({ 
                name: app.label, 
                id: app.packageName,
                icon: `data:image/png;base64,${app.icon}`
              }));
            console.log('Fetched apps:');
            setApps(filteredApps);
          } else {
            console.error('InstalledApps is not correctly initialized or does not have getApps method.');
          }
        }
      } catch (error) {
        console.error('Failed to fetch apps:', error);
      }
    };

    fetchApps();
  }, []);

  //dont think below func is needed because lock in is never on the list of installed apps...

  // useEffect(() => {
  //   // Ensure "Lock In" is never blacklisted
  //   if (blacklistedApps.includes(LOCK_IN_APP_ID)) {
  //     setBlacklistedApps(prevState => prevState.filter(app => app !== LOCK_IN_APP_ID));
  //   }

  //   // Update the native module with the current blacklisted apps
  //   updateNativeBlacklistedApps(blacklistedApps);
  // }, [blacklistedApps]);
  
  const updateNativeBlacklistedApps = async (apps: string[]) => {
    try {
      await AppServiceModule.updateBlacklistedApps(apps);
      console.log('Updated blacklisted apps');
    } catch (error) {
      console.error('Failed to update blacklisted apps in native module:', error);
    }
  };

  useEffect(() => {
    // Ensure "Lock In" is never blacklisted
    //dont think below lines are needed because lock in is never on the list of installed apps...
    // if (blacklistedApps.includes(LOCK_IN_APP_ID)) {
    //   setBlacklistedApps(prevState => prevState.filter(app => app !== LOCK_IN_APP_ID));
    // }

    // Update the native module with the current blacklisted apps
    updateNativeBlacklistedApps(blacklistedApps);
  }, [blacklistedApps]);

  const toggleBlacklist = (appId: string) => {
    setBlacklistedApps(prevState =>
      prevState.includes(appId)
        ? prevState.filter(id => id !== appId)
        : [...prevState, appId]
    );
  };

  const handleToggle = async (value: boolean, permissionType: 'appMonitoring' | 'overlay') => {
    if (permissionType === 'appMonitoring') {
      if (value) {
        if (!hasPermission) {
          const userResponded = await requestUsageStatsPermission();
          if (userResponded) {
            const permission = await checkUsageStatsPermission();
            setHasPermission(permission);
            if (permission) {
              setAppMonitoringOn(true);
            } else {
              Alert.alert('Permission not granted', 'App monitoring cannot be enabled without the required permission.');
            }
          }
        } else {
          setAppMonitoringOn(true);
        }
      } else {
        setAppMonitoringOn(false);
        AppServiceModule.stopService();
      }
    } else if (permissionType === 'overlay') {
      if (value) {
        if (!hasPermission) {
          const userResponded = await requestManageOverlayPermission();
          if (userResponded) {
            const permission = await checkManageOverlayPermission();
            setHasPermission(permission);
            if (permission) {
              setManageOverlayOn(true);
            } else {
              Alert.alert('Permission not granted', 'App monitoring cannot be enabled without the required permission.');
            }
          }
        } else {
          setManageOverlayOn(true);
        }
      } else {
        setManageOverlayOn(false);
        AppServiceModule.stopService();
      }
    }
  };
  
  const renderItem = useCallback(({ item }: { item: AppItem }) => (
    <TouchableOpacity
      style={[
        styles.appItem,
        blacklistedApps.includes(item.id) && styles.blacklisted
      ]}
      onPress={() => toggleBlacklist(item.id)}
    >
      <Image
        source={{ uri: item.icon }}
        style={styles.icon}
      />
      <Text style={styles.appText}>{item.name}</Text>
    </TouchableOpacity>
  ), [blacklistedApps, toggleBlacklist]);

  const keyExtractor = useCallback((item: AppItem, index: number) => `${item.id}-${index}`, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Blacklist Unproductive Apps!</Text>
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>App Monitoring Permission:</Text>
        <Ionicons 
          name={appMonitoringEnabled ? "checkmark-circle" : "close-circle"} 
          size={24} 
          color={appMonitoringEnabled ? "green" : "red"} 
        />
      </View>
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>App Monitoring Toggle:</Text>
        <Switch
          value={appMonitoringOn}
          onValueChange={(value) => handleToggle(value, 'appMonitoring')}
        />
      </View>
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Android Overlay Permission:</Text>
        <Ionicons 
          name={manageOverlayEnabled ? "checkmark-circle" : "close-circle"} 
          size={24} 
          color={manageOverlayEnabled ? "green" : "red"} 
        />
      </View>
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Android Overlay Toggle:</Text>
        <Switch
          value={manageOverlayOn}
          onValueChange={(value) => handleToggle(value, 'overlay')}
        />
      </View>

      <View>
        <Text>appMonitoringEnabled: {appMonitoringEnabled ? 'true' : 'false'}</Text>
        <Text>appMonitoringOn: {appMonitoringOn ? 'true' : 'false'}</Text>
        <Text>manageOverlayEnabled: {manageOverlayEnabled ? 'true' : 'false'}</Text>
        <Text>manageOverlayOn: {manageOverlayOn ? 'true' : 'false'}</Text>
      </View>
      <FlatList
        data={apps}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
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
    backgroundColor: 'green',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  blacklisted: {
    backgroundColor: 'red',
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
