import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
// import AppList from 'react-native-installed-apps'; // For iOS
import { InstalledApps } from 'react-native-launcher-kit'; // For Android
import { TotalElapsedContext } from './TotalElapsedContext';

const SettingsScreen = () => {
  const { whitelistedApps, setWhitelistedApps } = useContext(TotalElapsedContext);
  const [apps, setApps] = useState<{ name: string, id: string }[]>([]);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        if (Platform.OS === 'android') {
          console.log('Running on Android');
          console.log('InstalledApps.getApps:', InstalledApps?.getApps);
          if (InstalledApps && typeof InstalledApps.getApps === 'function') {
            const apps = await InstalledApps.getApps();
            console.log('Fetched apps:', apps);
            setApps(apps.map(app => ({ name: app.label, id: app.packageName })));
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
        //       console.log('Fetched apps:', apps);
        //       setApps(apps.map(app => ({ name: app.app, id: app.appPath })));
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

  const toggleWhitelist = (appId: string) => {
    setWhitelistedApps(prevState =>
      prevState.includes(appId)
        ? prevState.filter(id => id !== appId)
        : [...prevState, appId]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings Screen</Text>
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
  },
  appItem: {
    padding: 10,
    margin: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  whitelisted: {
    backgroundColor: 'green',
  },
  appText: {
    fontSize: 16,
  },
});

export default SettingsScreen;
