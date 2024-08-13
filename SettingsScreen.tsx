import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import AppList from 'react-native-installed-apps';  // For iOS
import { InstalledApps } from 'react-native-launcher-kit';  // For Android
import { TotalElapsedContext } from './TotalElapsedContext';

console.log(AppList); // Check what is being exported
console.log(InstalledApps); // Check what is being exported

const SettingsScreen = () => {
  const { whitelistedApps, setWhitelistedApps } = useContext(TotalElapsedContext);
  const [apps, setApps] = useState<{ name: string, id: string }[]>([]);

  useEffect(() => {
    const fetchApps = async () => {
      if (Platform.OS === 'ios') {
        const apps = await AppList.getAll();
        setApps(apps.map(app => ({ name: app.app, id: app.appPath })));
      } else {
        const apps = await InstalledApps.getApps();
        setApps(apps.map(app => ({ name: app.label, id: app.packageName }))); // Changed to packageName
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
