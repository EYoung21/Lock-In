import React, { useContext, useState, useEffect, useCallback, memo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Switch, Platform, Image, Alert } from 'react-native';
import { InstalledApps } from 'react-native-launcher-kit';
import { TotalElapsedContext } from './TotalElapsedContext';
import { NativeModules } from 'react-native';

const { AppServiceModule } = NativeModules;

const LOCK_IN_APP_ID = 'com.lockin';

// const checkUsageStatsPermission = async () => {
//   if (Platform.OS === 'android') {
//     try {
//       const hasPermission = await AppServiceModule.hasUsageStatsPermission();
//       return hasPermission;
//     } catch (error) {
//       console.error('Error checking usage stats permission:', error);
//       return false;
//     }
//   }
//   return false; // For iOS or other platforms, return false
// };

interface App {
  name: string;
  id: string;
  icon: string;
}

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

// const checkManageOverlayPermission = async () => {
//   if (Platform.OS === 'android') {
//     try {
//       const hasPermission2 = await AppServiceModule.hasManageOverlayPermission();
//       return hasPermission2;
//     } catch (error) {
//       console.error('Error checking ManageOverlay permission:', error);
//       return false;
//     }
//   }
//   return false; // For iOS or other platforms, return false
// };

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

interface AppItemProps {
  item: {
    name: string;
    id: string;
    icon: string;
  };
  isBlacklisted: boolean;
  onPress: () => void;
}

const AppItem: React.FC<AppItemProps> = memo(({ item, isBlacklisted, onPress }) => (  <TouchableOpacity
    style={[styles.appItem, isBlacklisted && styles.blacklisted]}
    onPress={onPress}
  >
    <Image source={{ uri: item.icon }} style={styles.icon} />
    <Text style={styles.appText}>{item.name}</Text>
  </TouchableOpacity>
));

const SettingsScreen = () => {
  const { blacklistedApps, setBlacklistedApps, appMonitoringEnabled, setAppMonitoringEnabled, isLockedIn, manageOverlayEnabled, setManageOverlayEnabled, appMonitoringOn, setAppMonitoringOn, manageOverlayOn, setManageOverlayOn } = useContext(TotalElapsedContext);
  // const [apps, setApps] = useState<{ name: string, id: string, icon: any }[]>([]);

  const [apps, setApps] = useState<App[]>([]);

  // const checkPermission = async () => {
  //   const permission = await checkUsageStatsPermission();
  //   setHasPermission(permission);
  //   return permission;
  // };

  // const checkPermission2 = async () => {
  //   const permission2 = await checkManageOverlayPermission();
  //   setHasPermission2(permission2);
  //   return permission2;
  // };


  // useEffect(() => {
  //   const syncAppMonitoringWithPermission = async () => {
  //     const permission = await checkPermission();
  //     if (permission) {
  //       setAppMonitoringEnabled(true);
  //       if (isLockedIn && manageOverlayEnabled) {
  //         AppServiceModule.startService();
  //       }
  //     } else {
  //       setAppMonitoringEnabled(false);
  //       AppServiceModule.stopService();
  //     }
  //   };
    
  //   const syncManageOverlayWithPermission = async () => {
  //     const permission2 = await checkPermission2();
  //     if (permission2) {
  //       setManageOverlayEnabled(true);
  //       if (isLockedIn && appMonitoringEnabled) {
  //         AppServiceModule.startService();
  //       }
  //     } else {
  //       setManageOverlayEnabled(false);
  //       AppServiceModule.stopService();
  //     }
  //   };

  //   // Initial sync
  //   syncAppMonitoringWithPermission();
  //   syncManageOverlayWithPermission();

  //   // Set up an interval to continuously check permission status
  //   const intervalId = setInterval(() => {
  //     syncAppMonitoringWithPermission();
  //     syncManageOverlayWithPermission();
  //   }, 5000); // Check every second

  //   return () => clearInterval(intervalId); // Cleanup on unmount
  // }, []);

  useEffect(() => {
    const fetchApps = async () => {
      if (Platform.OS === 'android' && InstalledApps?.getApps) {
        try {
          const fetchedApps = await InstalledApps.getApps();
          const filteredApps: App[] = fetchedApps
            .filter(app => app.packageName !== LOCK_IN_APP_ID)
            .map(app => ({
              name: app.label,
              id: app.packageName,
              icon: `data:image/png;base64,${app.icon}`
            }));
          setApps(filteredApps);
        } catch (error) {
          console.error('Failed to fetch apps:', error);
        }
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
  
  useEffect(() => {
    updateNativeBlacklistedApps(blacklistedApps);
  }, [blacklistedApps]);

  const updateNativeBlacklistedApps = useCallback(async (apps: string[]) => {
    try {
      await AppServiceModule.updateBlacklistedApps(apps);
      console.log('Updated blacklisted apps');
    } catch (error) {
      console.error('Failed to update blacklisted apps in native module:', error);
    }
  }, []);

  const toggleBlacklist = useCallback((appId: string) => {
    setBlacklistedApps(prevState =>
      prevState.includes(appId)
        ? prevState.filter(id => id !== appId)
        : [...prevState, appId]
    );
  }, [setBlacklistedApps]);

  // const handleToggle = async (value) => {
  //   if (value) {
  //     if (!hasPermission) {
  //       const userResponded = await requestUsageStatsPermission();
  //       if (userResponded) {
  //         setTimeout(async () => {
  //           const permission = await checkUsageStatsPermission();
  //           setHasPermission(permission);
  //           if (permission) {
  //             setAppMonitoringEnabled(true);
  //             setAppMonitoringOn(true);
  //             //set the local permission to true when permission toggled, maybe make permission a checkmark box instead of toggle
  //             if (isLockedIn && manageOverlayEnabled && manageOverlayOn && appMonitoringOn) {
  //               AppServiceModule.startService();
  //             }
  //           } else {
  //             Alert.alert('Permission not granted', 'App monitoring cannot be enabled without the required permission.');
  //           }
  //         }, 1000); // Wait for 1 second
  //       }
  //     } else {
  //       setAppMonitoringEnabled(true);
  //       if (isLockedIn && manageOverlayEnabled) {
  //         AppServiceModule.startService();
  //       }
  //     }
  //   } else {
  //     setAppMonitoringEnabled(false);
  //     AppServiceModule.stopService();
  //   }
  // };

  // const handleToggle2 = async (value) => {
  //   if (value) {
  //     if (!hasPermission2) {
  //       const userResponded2 = await requestManageOverlayPermission();
  //       if (userResponded2) {
  //         setTimeout(async () => {
  //           const permission2 = await checkManageOverlayPermission();
  //           setHasPermission2(permission2);
  //           if (permission2) {
  //             setManageOverlayEnabled(true);
  //             setManageOverlayOn(true);
  //             //set the local permission to true when permission toggled, maybe make permission a checkmark box instead of toggle
  //             if (isLockedIn && appMonitoringEnabled && appMonitoringOn && manageOverlayOn) {
  //               AppServiceModule.startService();
  //             }
  //           } else {
  //             Alert.alert('Permission not granted', 'Android overlays cannot be enabled without the required permission.');
  //           }
  //         }, 1000); // Wait for 1 second
  //       }
  //     } else {
  //       setManageOverlayEnabled(true);
  //       if (isLockedIn && appMonitoringEnabled) {
  //         AppServiceModule.startService();
  //       }
  //     }
  //   } else {
  //     setManageOverlayEnabled(false);
  //     AppServiceModule.stopService();
  //   }
  // };

  const handleToggle = async (value) => {
    if (value) {
      if (!appMonitoringEnabled) {
        const userResponded = await requestUsageStatsPermission();
        if (userResponded) {
            if (AppServiceModule.hasUsageStatsPermission()) {
              setAppMonitoringOn(true);
              setAppMonitoringEnabled(true);
              //set the local permission to true when permission toggled, maybe make permission a checkmark box instead of toggle
              if (isLockedIn && manageOverlayEnabled && manageOverlayOn && appMonitoringOn) {
                AppServiceModule.startService();
              }
            } else {
              Alert.alert('Permission not granted', 'App monitoring cannot be enabled without the required permission.');
            }
        }
      }
    } else {
      Alert.alert('Alert', 'You have to turn this permission off from your settings.');
    }
  };

  const handleToggle2 = async (value) => {
    if (value) {
      if (!manageOverlayEnabled) {
        const userResponded = await requestManageOverlayPermission();
        if (userResponded) {
            if (AppServiceModule.hasManageOverlayPermission()) {
              setManageOverlayEnabled(true);
              setManageOverlayOn(true);
              //set the local permission to true when permission toggled, maybe make permission a checkmark box instead of toggle
              if (isLockedIn && manageOverlayEnabled && manageOverlayOn && appMonitoringOn) {
                AppServiceModule.startService();
              }
            } else {
              Alert.alert('Permission not granted', 'Android overlay cannot be enabled without the required permission.');
            }
        }
      }
    } else {
      Alert.alert('Alert', 'You have to turn this permission off from your settings.');
    }
  };

  const handleToggleOn1 = async (value) => {
    if (value) {
      if (!appMonitoringEnabled) {
        const userResponded = await requestUsageStatsPermission();
        if (userResponded) {
            if (AppServiceModule.hasUsageStatsPermission()) {
              setAppMonitoringEnabled(true);
              setAppMonitoringOn(true);
              if (isLockedIn && manageOverlayEnabled && manageOverlayOn && appMonitoringEnabled) {
                AppServiceModule.startService();
              }
            } else {
              Alert.alert('Permission not granted', 'App monitoring cannot be enabled without the required permission.');
            }
        }
      } else {
        setAppMonitoringOn(true);
        if (isLockedIn && manageOverlayEnabled && manageOverlayOn && appMonitoringEnabled) {
          AppServiceModule.startService();
        }
      }
    } else {
      setAppMonitoringOn(false);
      AppServiceModule.stopService();
    }
  };

  const handleToggleOn2 = async (value) => {
    if (value) {
      if (!manageOverlayEnabled) {
        const userResponded = await requestManageOverlayPermission();
        if (userResponded) {
            if (AppServiceModule.hasManageOverlayPermission()) {
              setManageOverlayEnabled(true);
              setManageOverlayOn(true);
              if (isLockedIn && appMonitoringEnabled && appMonitoringOn && manageOverlayEnabled) {
                AppServiceModule.startService();
              }
            } else {
              Alert.alert('Permission not granted', 'Android overlays cannot be enabled without the required permission.');
            }
        }
      } else {
        setManageOverlayOn(true);
        if (isLockedIn && appMonitoringEnabled && appMonitoringOn && manageOverlayEnabled) {
          AppServiceModule.startService();
        }
      }
    } else {
      setManageOverlayOn(false);
      AppServiceModule.stopService();
    }
  };
  
  const renderItem = useCallback(({ item }) => (
    <AppItem
      item={item}
      isBlacklisted={blacklistedApps.includes(item.id)}
      onPress={() => toggleBlacklist(item.id)}
    />
  ), [blacklistedApps, toggleBlacklist]);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Blacklist Unproductive Apps!</Text>
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>App Monitoring Permission:</Text>
        <Switch
          value={appMonitoringEnabled} //permission
          onValueChange={handleToggle}
        />
      </View>
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>App Monitoring Toggle:</Text>
        <Switch
          value={appMonitoringOn} //status
          onValueChange={handleToggleOn1}
        />
      </View>
      <View style={styles.toggleContainer}>
      <Text style={styles.toggleLabel}>Android Overlay Permission:</Text>
        <Switch
          value={manageOverlayEnabled} //permission
          onValueChange={handleToggle2}
        />
      </View>
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Android Overlay Toggle:</Text>
        <Switch
          value={manageOverlayOn} //status
          onValueChange={handleToggleOn2}
        />
      </View>
      <FlatList
        data={apps}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
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