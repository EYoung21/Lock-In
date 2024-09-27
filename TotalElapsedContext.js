import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  // New state blacklisted apps and monitoring toggle
  const [blacklistedApps, setBlacklistedApps] = useState(['com.lockin']); // Add "Lock In" to the blacklisted apps by default
  const [appMonitoringEnabled, setAppMonitoringEnabled] = useState(false); // Default value for app monitoring toggle

  const [manageOverlayEnabled, setManageOverlayEnabled] = useState(false);

  const [appMonitoringOn, setAppMonitoringOn] = useState(false);
  const [manageOverlayOn, setManageOverlayOn] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Existing data loading
        const elapsedTime = await AsyncStorage.getItem('totalElapsedTime');
        const currency = await AsyncStorage.getItem('totalCurrency');
        const entries = await AsyncStorage.getItem('dailyEntries');
        const background = await AsyncStorage.getItem('backgroundColor');
        const storedbuttonColor = await AsyncStorage.getItem('buttonColor');
        const storedbuttonBorder = await AsyncStorage.getItem('buttonBorder');
        const storedSafe = await AsyncStorage.getItem('safe');

        // Load blacklisted apps and app monitoring toggle state
        const storedBlacklistedApps = await AsyncStorage.getItem('blacklistedApps');
        const storedAppMonitoringEnabled = await AsyncStorage.getItem('appMonitoringEnabled');
        const storedManageOverlayEnabled = await AsyncStorage.getItem('manageOverlayEnabled');
        const storedAppMonitoringOn = await AsyncStorage.getItem('appMonitoringOn');
        const storedManageOverlayOn = await AsyncStorage.getItem('manageOverlayOn');

        if (elapsedTime !== null) setTotalElapsedTime(parseFloat(elapsedTime));
        if (currency !== null) setTotalCurrency(parseFloat(currency));
        if (entries !== null) setDailyEntries(JSON.parse(entries));
        if (background !== null) setBackgroundColor(background);
        if (storedbuttonColor !== null) setButtonColor(storedbuttonColor);
        if (storedbuttonBorder !== null) setButtonBorder(storedbuttonBorder);
        if (storedSafe !== null) setSafe(storedSafe);
        if (storedBlacklistedApps !== null) {
          const parsedBlacklistedApps = JSON.parse(storedBlacklistedApps);
          if (parsedBlacklistedApps.includes('com.lockin')) {
            parsedBlacklistedApps = parsedBlacklistedApps.filter(app => app !== 'com.lockin');
          }
          setBlacklistedApps(parsedBlacklistedApps);
        } else {
          setBlacklistedApps([]);
        }
        if (storedAppMonitoringEnabled !== null) {
          setAppMonitoringEnabled(JSON.parse(storedAppMonitoringEnabled));
        }
        if (storedManageOverlayEnabled !== null) {
          setManageOverlayEnabled(JSON.parse(storedManageOverlayEnabled));
        }
        if (storedManageOverlayOn !== null) {
          setManageOverlayOn(JSON.parse(storedManageOverlayOn));
        }
        if (storedAppMonitoringOn !== null) {
          setAppMonitoringOn(JSON.parse(storedAppMonitoringOn));
        }
      } catch (error) {
        console.error('Failed to load data from storage', error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const saveData = async () => {
      try {
        // Existing data saving
        await AsyncStorage.setItem('totalElapsedTime', totalElapsedTime.toString());
        await AsyncStorage.setItem('totalCurrency', totalCurrency.toString());
        await AsyncStorage.setItem('dailyEntries', JSON.stringify(dailyEntries));
        await AsyncStorage.setItem('backgroundColor', backgroundColor);
        await AsyncStorage.setItem('buttonColor', buttonColor);
        await AsyncStorage.setItem('buttonBorder', buttonBorder);
        await AsyncStorage.setItem('safe', safe);

        // Save blacklisted apps and app monitoring toggle state
        await AsyncStorage.setItem('blacklistedApps', JSON.stringify(blacklistedApps));
        await AsyncStorage.setItem('appMonitoringEnabled', JSON.stringify(appMonitoringEnabled));
        await AsyncStorage.setItem('manageOverlayEnabled', JSON.stringify(manageOverlayEnabled));

        await AsyncStorage.setItem('appMonitoringOn', JSON.stringify(appMonitoringOn));
        await AsyncStorage.setItem('manageOverlayOn', JSON.stringify(manageOverlayOn));
      } catch (error) {
        console.error('Failed to save data to storage', error);
      }
    };

    saveData();
  }, [totalElapsedTime, totalCurrency, dailyEntries, backgroundColor, buttonColor, buttonBorder, safe, blacklistedApps, appMonitoringEnabled, manageOverlayEnabled, appMonitoringOn, manageOverlayOn]);

  return (
    <TotalElapsedContext.Provider value={{
      totalElapsedTime, setTotalElapsedTime,
      totalCurrency, setTotalCurrency,
      dailyEntries, setDailyEntries,
      backgroundColor, setBackgroundColor,
      buttonColor, setButtonColor,
      buttonBorder, setButtonBorder,
      safe, setSafe,
      blacklistedApps, setBlacklistedApps,
      appMonitoringEnabled, setAppMonitoringEnabled,
      manageOverlayEnabled, setManageOverlayEnabled,
      appMonitoringOn, setAppMonitoringOn,
      manageOverlayOn, setManageOverlayOn,
    }}>
      {children}
    </TotalElapsedContext.Provider>
  );
};
