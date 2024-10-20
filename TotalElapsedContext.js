import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AccountSync from './services/AccountSync';

export const TotalElapsedContext = createContext();

export const TotalElapsedProvider = ({ children }) => {
  // State declarations
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
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [purchasedColors, setPurchasedColors] = useState(['#FFFFFF']);
  const [purchasedButtons, setPurchasedButtons] = useState(['#000000']);
  const [purchasedSafes, setPurchasedSafes] = useState(['2DSafe']);
  const [syncStatus, setSyncStatus] = useState('');

  const [isInitialized, setIsInitialized] = useState(false);

  const updateStateWithData = useCallback((data) => {
    console.log('Updating state with data:', data);

    if (data.totalElapsedTime !== undefined) {
      const parsedTime = parseFloat(data.totalElapsedTime);
      console.log('Setting totalElapsedTime:', parsedTime);
      setTotalElapsedTimeWithTracking(parsedTime);
    }

    if (data.totalCurrency !== undefined) {
      const parsedCurrency = parseFloat(data.totalCurrency);
      console.log('Setting totalCurrency:', parsedCurrency);
      setTotalCurrencyWithTracking(parsedCurrency);
    }

    if (data.dailyEntries) {
      const parsedEntries = typeof data.dailyEntries === 'string' ? JSON.parse(data.dailyEntries) : data.dailyEntries;
      console.log('Setting dailyEntries:', parsedEntries);
      setDailyEntriesWithTracking(parsedEntries);
    }

    if (data.backgroundColor) {
      const parsedColor = typeof data.backgroundColor === 'string' ? JSON.parse(data.backgroundColor) : data.backgroundColor;
      console.log('Setting backgroundColor:', parsedColor);
      setBackgroundColorWithTracking(parsedColor);
    }

    if (data.buttonColor) {
      const parsedColor = typeof data.buttonColor === 'string' ? JSON.parse(data.buttonColor) : data.buttonColor;
      console.log('Setting buttonColor:', parsedColor);
      setButtonColorWithTracking(parsedColor);
    }

    if (data.buttonBorder) {
      const parsedBorder = typeof data.buttonBorder === 'string' ? JSON.parse(data.buttonBorder) : data.buttonBorder;
      console.log('Setting buttonBorder:', parsedBorder);
      setButtonBorderWithTracking(parsedBorder);
    }

    if (data.safe) {
      const parsedSafe = typeof data.safe === 'string' ? JSON.parse(data.safe) : data.safe;
      console.log('Setting safe:', parsedSafe);
      setSafeWithTracking(parsedSafe);
    }

    if (data.blacklistedApps) {
      const parsedApps = typeof data.blacklistedApps === 'string' ? JSON.parse(data.blacklistedApps) : data.blacklistedApps;
      console.log('Setting blacklistedApps:', parsedApps);
      setBlacklistedAppsWithTracking(parsedApps);
    }

    if (data.totalTimesLockedIn !== undefined) {
      const parsedLockedIn = parseInt(data.totalTimesLockedIn, 10);
      console.log('Setting totalTimesLockedIn:', parsedLockedIn);
      setTotalTimesLockedInWithTracking(parsedLockedIn);
    }

    if (data.purchasedColors) {
      const parsedColors = typeof data.purchasedColors === 'string' ? JSON.parse(data.purchasedColors) : data.purchasedColors;
      console.log('Setting purchasedColors:', parsedColors);
      setPurchasedColorsWithTracking(parsedColors);
    }

    if (data.purchasedButtons) {
      const parsedButtons = typeof data.purchasedButtons === 'string' ? JSON.parse(data.purchasedButtons) : data.purchasedButtons;
      console.log('Setting purchasedButtons:', parsedButtons);
      setPurchasedButtonsWithTracking(parsedButtons);
    }

    if (data.purchasedSafes) {
      const parsedSafes = typeof data.purchasedSafes === 'string' ? JSON.parse(data.purchasedSafes) : data.purchasedSafes;
      console.log('Setting purchasedSafes:', parsedSafes);
      setPurchasedSafesWithTracking(parsedSafes);
    }

    if (data.appMonitoringOn !== undefined) {
      const parsedMonitoring = data.appMonitoringOn === true || data.appMonitoringOn === 'true';
      console.log('Setting appMonitoringOn:', parsedMonitoring);
      setAppMonitoringOnWithTracking(parsedMonitoring);
    }

    if (data.manageOverlayOn !== undefined) {
      const parsedOverlay = data.manageOverlayOn === true || data.manageOverlayOn === 'true';
      console.log('Setting manageOverlayOn:', parsedOverlay);
      setManageOverlayOnWithTracking(parsedOverlay);
    }
  }, []);

  const loadAllData = useCallback(async () => {
    const keys = [
      'totalElapsedTime', 'totalCurrency', 'dailyEntries', 'backgroundColor',
      'buttonColor', 'buttonBorder', 'safe', 'blacklistedApps',
      'totalTimesLockedIn', 'purchasedColors', 'purchasedButtons', 'purchasedSafes',
      'appMonitoringOn', 'manageOverlayOn'
    ];

    const data = {};
    for (const key of keys) {
      try {
        const value = await AccountSync.getItem(key);
        if (value !== null) {
          data[key] = value;
          console.log(`Loaded ${key}:`, value);
        }
      } catch (error) {
        console.error(`Error loading ${key}:`, error);
      }
    }
    return data;
  }, []);

  const manualSync = useCallback(async () => {
    try {
      setSyncStatus('Syncing...');
      console.log('Starting manual sync');
      const data = await loadAllData();
      updateStateWithData(data);
      const now = new Date();
      setLastSyncTime(now);
      await AsyncStorage.setItem('lastSyncTime', now.toISOString());
      setSyncStatus('Sync completed successfully');
      console.log('Manual sync completed');
    } catch (error) {
      console.error('Manual sync failed:', error);
      setSyncStatus('Sync failed. Please try again.');
    }
  }, [loadAllData, updateStateWithData]);

  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('Initializing AccountSync');
        await AccountSync.initialize();
        console.log('AccountSync initialized');
        await manualSync();
        setIsInitialized(true);
      } catch (error) {
        console.error('Error during initialization:', error);
      }
    };
  
    initializeData();
  }, [manualSync]);

  // Helper function to create state setters with tracking
  const createTrackedSetter = (setState, key) => (value) => {
    setState(value);
    if (value !== null && value !== undefined) {
      AccountSync.setItem(key, JSON.stringify(value)).catch(error => {
        console.error(`Error syncing ${key}:`, error);
      });
    } else {
      console.warn(`Attempted to sync null/undefined value for ${key}`);
      // Optionally, you can remove the item if it's null/undefined
      AccountSync.removeItem(key).catch(error => {
        console.error(`Error removing ${key}:`, error);
      });
    }
  };

  // Create tracked setters for all relevant states
  const setTotalElapsedTimeWithTracking = createTrackedSetter(setTotalElapsedTime, 'totalElapsedTime');
  const setTotalCurrencyWithTracking = createTrackedSetter(setTotalCurrency, 'totalCurrency');
  const setDailyEntriesWithTracking = createTrackedSetter(setDailyEntries, 'dailyEntries');
  const setBackgroundColorWithTracking = createTrackedSetter(setBackgroundColor, 'backgroundColor');
  const setButtonColorWithTracking = createTrackedSetter(setButtonColor, 'buttonColor');
  const setButtonBorderWithTracking = createTrackedSetter(setButtonBorder, 'buttonBorder');
  const setSafeWithTracking = createTrackedSetter(setSafe, 'safe');
  const setTotalTimesLockedInWithTracking = createTrackedSetter(setTotalTimesLockedIn, 'totalTimesLockedIn');
  const setBlacklistedAppsWithTracking = createTrackedSetter(setBlacklistedApps, 'blacklistedApps');
  const setAppMonitoringOnWithTracking = createTrackedSetter(setAppMonitoringOn, 'appMonitoringOn');
  const setManageOverlayOnWithTracking = createTrackedSetter(setManageOverlayOn, 'manageOverlayOn');
  const setPurchasedColorsWithTracking = createTrackedSetter(setPurchasedColors, 'purchasedColors');
  const setPurchasedButtonsWithTracking = createTrackedSetter(setPurchasedButtons, 'purchasedButtons');
  const setPurchasedSafesWithTracking = createTrackedSetter(setPurchasedSafes, 'purchasedSafes');

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
      appMonitoringEnabled, setAppMonitoringEnabled,
      manageOverlayEnabled, setManageOverlayEnabled,
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