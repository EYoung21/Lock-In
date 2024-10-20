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
  const [blacklistedApps, setBlacklistedApps] = useState([]);
  const [appMonitoringEnabled, setAppMonitoringEnabled] = useState(false);
  const [manageOverlayEnabled, setManageOverlayEnabled] = useState(false);
  const [appMonitoringOn, setAppMonitoringOn] = useState(false);
  const [manageOverlayOn, setManageOverlayOn] = useState(false);
  
  // New states for sync optimization
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [changedData, setChangedData] = useState({});

  // New states for purchased items
  const [purchasedColors, setPurchasedColors] = useState(['#FFFFFF']);
  const [purchasedButtons, setPurchasedButtons] = useState(['#000000']);
  const [purchasedSafes, setPurchasedSafes] = useState(['2DSafe']);

  const setPurchasedColorsWithTracking = (value) => {
    setPurchasedColors(value);
    setChangedData(prev => ({...prev, purchasedColors: true}));
  };

  const setPurchasedButtonsWithTracking = (value) => {
    setPurchasedButtons(value);
    setChangedData(prev => ({...prev, purchasedButtons: true}));
  };

  const setPurchasedSafesWithTracking = (value) => {
    setPurchasedSafes(value);
    setChangedData(prev => ({...prev, purchasedSafes: true}));
  };

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

   // Modified loadFromLocalStorage function
   const loadFromLocalStorage = async () => {
    const data = {};
    try {
      const keys = [
        // ... (keep existing keys)
        'purchasedColors', 'purchasedButtons', 'purchasedSafes'
      ];

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
          data[key] = value;
        }
      }
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
      const keys = [
        'totalElapsedTime', 'totalCurrency', 'dailyEntries', 'backgroundColor',
        'buttonColor', 'buttonBorder', 'safe', 'blacklistedApps',
        'appMonitoringEnabled', 'manageOverlayEnabled', 'appMonitoringOn',
        'manageOverlayOn', 'totalTimesLockedIn', 'purchasedColors', 
        'purchasedButtons', 'purchasedSafes'
      ];
  
      for (const key of keys) {
        const cloudItem = await AccountSync.getItem(key);
        if (cloudItem !== null) {
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
    if (data.totalElapsedTime) setTotalElapsedTime(parseFloat(data.totalElapsedTime) || 0);
    if (data.totalCurrency) setTotalCurrency(parseFloat(data.totalCurrency) || 0);
    if (data.dailyEntries) {
      try {
        const parsedEntries = JSON.parse(data.dailyEntries);
        // Convert all values to numbers, replace null with 0
        const processedEntries = Object.entries(parsedEntries).reduce((acc, [date, value]) => {
          acc[date] = value === null ? 0 : Number(value);
          return acc;
        }, {});
        
        setDailyEntries(processedEntries);
        // console.log("Processed daily entries:", processedEntries);
      } catch (error) {
        console.error('Error parsing dailyEntries:', error);
        setDailyEntries({});
      }
    }
    if (data.backgroundColor) setBackgroundColor(data.backgroundColor);
    if (data.buttonColor) setButtonColor(data.buttonColor);
    if (data.buttonBorder) setButtonBorder(data.buttonBorder);
    if (data.safe) {
      const safeValue = typeof data.safe === 'string' ? data.safe.replace(/^"|"$/g, '') : data.safe;
      console.log("Updating safe to:", safeValue);
      setSafe(safeValue);
    }
    if (data.blacklistedApps) {
      try {
        let parsedApps = data.blacklistedApps;
        console.log("Original blacklistedApps:", parsedApps);
        
        // If it's a string, try to parse it
        if (typeof parsedApps === 'string') {
          parsedApps = JSON.parse(parsedApps);
        }
        
        console.log("Parsed blacklistedApps:", parsedApps);
        
        if (Array.isArray(parsedApps)) {
          setBlacklistedApps(parsedApps);
          console.log("Updated blacklistedApps:", parsedApps);
        } else if (typeof parsedApps === 'object' && parsedApps !== null) {
          // If it's an object, extract the values
          const appsArray = Object.values(parsedApps);
          setBlacklistedApps(appsArray);
          console.log("Updated blacklistedApps from object:", appsArray);
        } else {
          console.log("parsedApps is not an array or object, setting to empty array");
          setBlacklistedApps([]);
        }
      } catch (error) {
        console.error('Error handling blacklistedApps:', error);
        setBlacklistedApps([]);
      }
    } else {
      console.log("No blacklistedApps data provided, keeping existing blacklistedApps");
    }
    if (data.appMonitoringEnabled) setAppMonitoringEnabled(parseBooleanString(data.appMonitoringEnabled));
    if (data.manageOverlayEnabled) setManageOverlayEnabled(parseBooleanString(data.manageOverlayEnabled));
    if (data.appMonitoringOn) setAppMonitoringOn(parseBooleanString(data.appMonitoringOn));
    if (data.manageOverlayOn) setManageOverlayOn(parseBooleanString(data.manageOverlayOn));
    if (data.totalTimesLockedIn) setTotalTimesLockedIn(parseInt(data.totalTimesLockedIn) || 0);
    if (data.purchasedColors) {
      try {
        const parsedColors = JSON.parse(data.purchasedColors);
        setPurchasedColors(Array.isArray(parsedColors) ? parsedColors : ['#FFFFFF']);
      } catch (error) {
        console.error('Error parsing purchasedColors:', error);
        setPurchasedColors(['#FFFFFF']);
      }
    }

    if (data.purchasedButtons) {
      try {
        const parsedButtons = JSON.parse(data.purchasedButtons);
        setPurchasedButtons(Array.isArray(parsedButtons) ? parsedButtons : ['#000000']);
      } catch (error) {
        console.error('Error parsing purchasedButtons:', error);
        setPurchasedButtons(['#000000']);
      }
    }

    if (data.purchasedSafes) {
      try {
        const parsedSafes = JSON.parse(data.purchasedSafes);
        setPurchasedSafes(Array.isArray(parsedSafes) ? parsedSafes : ['2DSafe']);
      } catch (error) {
        console.error('Error parsing purchasedSafes:', error);
        setPurchasedSafes(['2DSafe']);
      }
    }
  };

  // Helper function to parse boolean strings
  const parseBooleanString = (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return false;
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
      await AsyncStorage.setItem('purchasedColors', JSON.stringify(purchasedColors));
      await AsyncStorage.setItem('purchasedButtons', JSON.stringify(purchasedButtons));
      await AsyncStorage.setItem('purchasedSafes', JSON.stringify(purchasedSafes));
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
              case 'purchasedColors':
                value = JSON.stringify(purchasedColors);
                break;
              case 'purchasedButtons':
                value = JSON.stringify(purchasedButtons);
                break;
              case 'purchasedSafes':
                value = JSON.stringify(purchasedSafes);
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
      purchasedColors, setPurchasedColors: setPurchasedColorsWithTracking,
      purchasedButtons, setPurchasedButtons: setPurchasedButtonsWithTracking,
      purchasedSafes, setPurchasedSafes: setPurchasedSafesWithTracking,
      lastSyncTime,
      manualSync,
      syncStatus,
    }}>
      {children}
    </TotalElapsedContext.Provider>
  );
};