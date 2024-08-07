import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TotalElapsedContext = createContext();

export const TotalElapsedProvider = ({ children }) => {
  // Existing states
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [totalCurrency, setTotalCurrency] = useState(0);
  const [dailyEntries, setDailyEntries] = useState({});
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [buttonColor, setButtonColor] = useState('#808080');
  const [buttonBorder, setButtonBorder] = useState('#696969');
  const [safe, setSafe] = useState('2DSafe');

  // New state for whitelisted apps and monitoring toggle
  const [whitelistedApps, setWhitelistedApps] = useState(['com.lockin']); // Add "Lock In" to the whitelisted apps by default
  const [appMonitoringEnabled, setAppMonitoringEnabled] = useState(false); // Default value for app monitoring toggle

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

        // Load whitelisted apps and app monitoring toggle state
        const storedWhitelistedApps = await AsyncStorage.getItem('whitelistedApps');
        const storedAppMonitoringEnabled = await AsyncStorage.getItem('appMonitoringEnabled');

        if (elapsedTime !== null) setTotalElapsedTime(parseFloat(elapsedTime));
        if (currency !== null) setTotalCurrency(parseFloat(currency));
        if (entries !== null) setDailyEntries(JSON.parse(entries));
        if (background !== null) setBackgroundColor(background);
        if (storedbuttonColor !== null) setButtonColor(storedbuttonColor);
        if (storedbuttonBorder !== null) setButtonBorder(storedbuttonBorder);
        if (storedSafe !== null) setSafe(storedSafe);
        if (storedWhitelistedApps !== null) {
          const parsedWhitelistedApps = JSON.parse(storedWhitelistedApps);
          if (!parsedWhitelistedApps.includes('com.lockin')) {
            parsedWhitelistedApps.push('com.lockin');
          }
          setWhitelistedApps(parsedWhitelistedApps);
        } else {
          setWhitelistedApps(['com.lockin']);
        }
        if (storedAppMonitoringEnabled !== null) {
          setAppMonitoringEnabled(JSON.parse(storedAppMonitoringEnabled));
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

        // Save whitelisted apps and app monitoring toggle state
        await AsyncStorage.setItem('whitelistedApps', JSON.stringify(whitelistedApps));
        await AsyncStorage.setItem('appMonitoringEnabled', JSON.stringify(appMonitoringEnabled));
      } catch (error) {
        console.error('Failed to save data to storage', error);
      }
    };

    saveData();
  }, [totalElapsedTime, totalCurrency, dailyEntries, backgroundColor, buttonColor, buttonBorder, safe, whitelistedApps, appMonitoringEnabled]);

  return (
    <TotalElapsedContext.Provider value={{
      totalElapsedTime, setTotalElapsedTime,
      totalCurrency, setTotalCurrency,
      dailyEntries, setDailyEntries,
      backgroundColor, setBackgroundColor,
      buttonColor, setButtonColor,
      buttonBorder, setButtonBorder,
      safe, setSafe,
      whitelistedApps, setWhitelistedApps,
      appMonitoringEnabled, setAppMonitoringEnabled,
    }}>
      {children}
    </TotalElapsedContext.Provider>
  );
};
