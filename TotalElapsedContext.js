import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AccountSync from './services/AccountSync'; // Import AccountSync

export const TotalElapsedContext = createContext();

export const TotalElapsedProvider = ({ children }) => {
  // Existing states
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [totalCurrency, setTotalCurrency] = useState(0);
  const [dailyEntries, setDailyEntries] = useState({});
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [buttonColor, setButtonColor] = useState('#000000');
  const [buttonBorder, setButtonBorder] = useState('#333333');
  const [safe, setSafe] = useState('2DSafe');
  const [totalTimesLockedIn, setTotalTimesLockedIn] = useState(0);
  const [blacklistedApps, setBlacklistedApps] = useState(['com.lockin']);
  const [appMonitoringEnabled, setAppMonitoringEnabled] = useState(false);
  const [manageOverlayEnabled, setManageOverlayEnabled] = useState(false);
  const [appMonitoringOn, setAppMonitoringOn] = useState(false);
  const [manageOverlayOn, setManageOverlayOn] = useState(false);
  
  // New states for sync optimization
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [changedData, setChangedData] = useState({});

  // Modified state setters to track changes
  const setTotalElapsedTimeWithTracking = (value) => {
    setTotalElapsedTime(value);
    setChangedData(prev => ({...prev, totalElapsedTime: true}));
  };

  const setTotalCurrencyWithTracking = (value) => {
    setTotalCurrency(value);
    setChangedData(prev => ({...prev, totalCurrency: true}));
  };

  const setDailyEntriesWithTracking = (value) => {
    setDailyEntries(value);
    setChangedData(prev => ({...prev, dailyEntries: true}));
  };

  const setBackgroundColorWithTracking = (value) => {
    setBackgroundColor(value);
    setChangedData(prev => ({...prev, backgroundColor: true}));
  };

  const setButtonColorWithTracking = (value) => {
    setButtonColor(value);
    setChangedData(prev => ({...prev, buttonColor: true}));
  };

  const setButtonBorderWithTracking = (value) => {
    setButtonBorder(value);
    setChangedData(prev => ({...prev, buttonBorder: true}));
  };

  const setSafeWithTracking = (value) => {
    setSafe(value);
    setChangedData(prev => ({...prev, safe: true}));
  };

  const setTotalTimesLockedInWithTracking = (value) => {
    setTotalTimesLockedIn(value);
    setChangedData(prev => ({...prev, totalTimesLockedIn: true}));
  };

  const setBlacklistedAppsWithTracking = (value) => {
    setBlacklistedApps(value);
    setChangedData(prev => ({...prev, blacklistedApps: true}));
  };

  const setAppMonitoringEnabledWithTracking = (value) => {
    setAppMonitoringEnabled(value);
    setChangedData(prev => ({...prev, appMonitoringEnabled: true}));
  };

  const setManageOverlayEnabledWithTracking = (value) => {
    setManageOverlayEnabled(value);
    setChangedData(prev => ({...prev, manageOverlayEnabled: true}));
  };

  const setAppMonitoringOnWithTracking = (value) => {
    setAppMonitoringOn(value);
    setChangedData(prev => ({...prev, appMonitoringOn: true}));
  };

  const setManageOverlayOnWithTracking = (value) => {
    setManageOverlayOn(value);
    setChangedData(prev => ({...prev, manageOverlayOn: true}));
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const localData = await loadFromLocalStorage();
        const cloudData = await loadFromCloudStorage();
        const mergedData = mergeData(localData, cloudData);
        updateStateWithMergedData(mergedData);

        const storedLastSyncTime = await AsyncStorage.getItem('lastSyncTime');
        if (storedLastSyncTime) setLastSyncTime(new Date(storedLastSyncTime));
      } catch (error) {
        console.error('Failed to load data', error);
      }
    };

    loadData();
  }, []);

  const manualSync = async () => {
    try {
      setSyncStatus('Syncing...');
  
      // Step 1: Fetch the latest data from the cloud
      const cloudData = await fetchFromCloudStorage();
  
      // Step 2: Merge cloud data with local data
      const mergedData = mergeData(await loadFromLocalStorage(), cloudData);
  
      // Step 3: Update local state with merged data
      updateStateWithMergedData(mergedData);
  
      // Step 4: Save merged data to local storage
      await saveToLocalStorage();
  
      // Step 5: Push merged data to cloud
      await saveToCloudStorage();
  
      const now = new Date();
      setLastSyncTime(now);
      await AsyncStorage.setItem('lastSyncTime', now.toISOString());
      
      setSyncStatus('Sync completed successfully');
    } catch (error) {
      console.error('Manual sync failed:', error);
      setSyncStatus('Sync failed. Please try again.');
    }
  };

  const [syncStatus, setSyncStatus] = useState('');

  const loadFromLocalStorage = async () => {
    const data = {};
    try {
      data.totalElapsedTime = await AsyncStorage.getItem('totalElapsedTime');
      data.totalCurrency = await AsyncStorage.getItem('totalCurrency');
      data.dailyEntries = await AsyncStorage.getItem('dailyEntries');
      data.backgroundColor = await AsyncStorage.getItem('backgroundColor');
      data.buttonColor = await AsyncStorage.getItem('buttonColor');
      data.buttonBorder = await AsyncStorage.getItem('buttonBorder');
      data.safe = await AsyncStorage.getItem('safe');
      data.blacklistedApps = await AsyncStorage.getItem('blacklistedApps');
      data.appMonitoringEnabled = await AsyncStorage.getItem('appMonitoringEnabled');
      data.manageOverlayEnabled = await AsyncStorage.getItem('manageOverlayEnabled');
      data.appMonitoringOn = await AsyncStorage.getItem('appMonitoringOn');
      data.manageOverlayOn = await AsyncStorage.getItem('manageOverlayOn');
      data.totalTimesLockedIn = await AsyncStorage.getItem('totalTimesLockedIn');
    } catch (error) {
      console.error('Error loading from local storage:', error);
    }
    return data;
  };

  // Helper function to fetch data from cloud storage
  const fetchFromCloudStorage = async () => {
    const data = {};
    try {
      for (const key of Object.keys(changedData)) {
        const cloudItem = await AccountSync.getItem(key);
        if (cloudItem) {
          data[key] = cloudItem;
        }
      }
    } catch (error) {
      console.error('Error fetching from cloud storage:', error);
    }
    return data;
  };

  const loadFromCloudStorage = async () => {
    const data = {};
    try {
      for (const key of Object.keys(changedData)) {
        const cloudItem = await AccountSync.getItem(key);
        if (cloudItem) {
          data[key] = cloudItem;
        }
      }
    } catch (error) {
      console.error('Error loading from cloud storage:', error);
    }
    return data;
  };
  
  // Existing merge function (you might need to modify this based on your specific data structure)
  const mergeData = (localData, cloudData) => {
    const merged = { ...localData };
    for (const key in cloudData) {
      if (cloudData[key] !== null) {
        // You might want to add more sophisticated merging logic here
        // For example, comparing timestamps if available
        merged[key] = cloudData[key];
      }
    }
    return merged;
  };

  const updateStateWithMergedData = (data) => {
    if (data.totalElapsedTime) setTotalElapsedTime(parseFloat(data.totalElapsedTime));
    if (data.totalCurrency) setTotalCurrency(parseFloat(data.totalCurrency));
    if (data.dailyEntries) setDailyEntries(JSON.parse(data.dailyEntries));
    if (data.backgroundColor) setBackgroundColor(data.backgroundColor);
    if (data.buttonColor) setButtonColor(data.buttonColor);
    if (data.buttonBorder) setButtonBorder(data.buttonBorder);
    if (data.safe) setSafe(data.safe);
    if (data.blacklistedApps) {
      const parsedApps = JSON.parse(data.blacklistedApps);
      setBlacklistedApps(parsedApps.filter(app => app !== 'com.lockin'));
    }
    if (data.appMonitoringEnabled) setAppMonitoringEnabled(JSON.parse(data.appMonitoringEnabled));
    if (data.manageOverlayEnabled) setManageOverlayEnabled(JSON.parse(data.manageOverlayEnabled));
    if (data.appMonitoringOn) setAppMonitoringOn(JSON.parse(data.appMonitoringOn));
    if (data.manageOverlayOn) setManageOverlayOn(JSON.parse(data.manageOverlayOn));
    if (data.totalTimesLockedIn) setTotalTimesLockedIn(parseInt(data.totalTimesLockedIn));
  };

  useEffect(() => {
    const saveData = async () => {
      try {
        await saveToLocalStorage();
        await saveToCloudStorage();

        const now = new Date();
        setLastSyncTime(now);
        await AsyncStorage.setItem('lastSyncTime', now.toISOString());
      } catch (error) {
        console.error('Failed to save data', error);
      }
    };

    if (Object.keys(changedData).length > 0) {
      saveData();
    }
  }, [changedData]);

  const saveToLocalStorage = async () => {
    try {
      await AsyncStorage.setItem('totalElapsedTime', totalElapsedTime.toString());
      await AsyncStorage.setItem('totalCurrency', totalCurrency.toString());
      await AsyncStorage.setItem('dailyEntries', JSON.stringify(dailyEntries));
      await AsyncStorage.setItem('backgroundColor', backgroundColor);
      await AsyncStorage.setItem('buttonColor', buttonColor);
      await AsyncStorage.setItem('buttonBorder', buttonBorder);
      await AsyncStorage.setItem('safe', safe);
      await AsyncStorage.setItem('totalTimesLockedIn', totalTimesLockedIn.toString());
      await AsyncStorage.setItem('blacklistedApps', JSON.stringify(blacklistedApps));
      await AsyncStorage.setItem('appMonitoringEnabled', JSON.stringify(appMonitoringEnabled));
      await AsyncStorage.setItem('manageOverlayEnabled', JSON.stringify(manageOverlayEnabled));
      await AsyncStorage.setItem('appMonitoringOn', JSON.stringify(appMonitoringOn));
      await AsyncStorage.setItem('manageOverlayOn', JSON.stringify(manageOverlayOn));
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  };

  const saveToCloudStorage = async () => {
    try {
      for (const [key, hasChanged] of Object.entries(changedData)) {
        if (hasChanged) {
          let value;
          switch(key) {
            case 'totalElapsedTime':
              value = totalElapsedTime.toString();
              break;
            case 'totalCurrency':
              value = totalCurrency.toString();
              break;
            case 'dailyEntries':
              value = JSON.stringify(dailyEntries);
              break;
            case 'backgroundColor':
              value = backgroundColor;
              break;
            case 'buttonColor':
              value = buttonColor;
              break;
            case 'buttonBorder':
              value = buttonBorder;
              break;
            case 'safe':
              value = safe;
              break;
            case 'totalTimesLockedIn':
              value = totalTimesLockedIn.toString();
              break;
            case 'blacklistedApps':
              value = JSON.stringify(blacklistedApps);
              break;
            case 'appMonitoringEnabled':
              value = JSON.stringify(appMonitoringEnabled);
              break;
            case 'manageOverlayEnabled':
              value = JSON.stringify(manageOverlayEnabled);
              break;
            case 'appMonitoringOn':
              value = JSON.stringify(appMonitoringOn);
              break;
            case 'manageOverlayOn':
              value = JSON.stringify(manageOverlayOn);
              break;
            default:
              console.warn(`Unhandled key in saveToCloudStorage: ${key}`);
              continue; // Skip this iteration if the key is not recognized
          }
          await AccountSync.setItem(key, value);
        }
      }
      setChangedData({}); // Reset changed data after sync
    } catch (error) {
      console.error('Error saving to cloud storage:', error);
      // Optionally, you could re-throw the error here if you want to handle it in the caller function
      // throw error;
    }
  };

  return (
    <TotalElapsedContext.Provider value={{
      totalElapsedTime, setTotalElapsedTime: setTotalElapsedTimeWithTracking,
      totalCurrency, setTotalCurrency: setTotalCurrencyWithTracking,
      dailyEntries, setDailyEntries: setDailyEntriesWithTracking,
      backgroundColor, setBackgroundColor: setBackgroundColorWithTracking,
      buttonColor, setButtonColor: setButtonColorWithTracking,
      buttonBorder, setButtonBorder: setButtonBorderWithTracking,
      safe, setSafe: setSafeWithTracking,
      blacklistedApps, setBlacklistedApps: setBlacklistedAppsWithTracking,
      appMonitoringEnabled, setAppMonitoringEnabled: setAppMonitoringEnabledWithTracking,
      manageOverlayEnabled, setManageOverlayEnabled: setManageOverlayEnabledWithTracking,
      appMonitoringOn, setAppMonitoringOn: setAppMonitoringOnWithTracking,
      manageOverlayOn, setManageOverlayOn: setManageOverlayOnWithTracking,
      totalTimesLockedIn, setTotalTimesLockedIn: setTotalTimesLockedInWithTracking,
      lastSyncTime,
      manualSync,
      syncStatus,
    }}>
      {children}
    </TotalElapsedContext.Provider>
  );
};