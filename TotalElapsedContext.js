import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TotalElapsedContext = createContext();

export const TotalElapsedProvider = ({ children }) => {
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [totalCurrency, setTotalCurrency] = useState(0);
  const [dailyEntries, setDailyEntries] = useState({});
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [buttonColor, setButtonColor] = useState('0d0d0d');
  const [buttonBorder, setButtonBorder] = useState('2F4F4F');
  const [safe, setSafe] = useState('2DSafe');

  useEffect(() => {
    const loadData = async () => {
      try {
        const elapsedTime = await AsyncStorage.getItem('totalElapsedTime');
        const currency = await AsyncStorage.getItem('totalCurrency');
        const entries = await AsyncStorage.getItem('dailyEntries');
        const background = await AsyncStorage.getItem('backgroundColor');
        const storedbuttonColor = await AsyncStorage.getItem('buttonColor');
        const storedbuttonBorder = await AsyncStorage.getItem('buttonBorder');
        const storedSafe = await AsyncStorage.getItem('safe');

        if (elapsedTime !== null) {
          setTotalElapsedTime(parseFloat(elapsedTime));
        }
        if (currency !== null) {
          setTotalCurrency(parseFloat(currency));
        }
        if (entries !== null) {
          setDailyEntries(JSON.parse(entries));
        }
        if (background !== null) {
          setBackgroundColor(background);
        }
        if (storedbuttonColor !== null) {
          setButtonColor(storedbuttonColor);
        }
        if (storedbuttonBorder !== null) {
          setButtonBorder(storedbuttonBorder);
        }
        if (storedSafe !== null) {
          setSafe(storedSafe);
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
        await AsyncStorage.setItem('totalElapsedTime', totalElapsedTime.toString());
        await AsyncStorage.setItem('totalCurrency', totalCurrency.toString());
        await AsyncStorage.setItem('dailyEntries', JSON.stringify(dailyEntries));
        await AsyncStorage.setItem('backgroundColor', backgroundColor);
        await AsyncStorage.setItem('buttonColor', buttonColor);
        await AsyncStorage.setItem('buttonBorder', buttonBorder);
        await AsyncStorage.setItem('safe', safe);
      } catch (error) {
        console.error('Failed to save data to storage', error);
      }
    };

    saveData();
  }, [totalElapsedTime, totalCurrency, dailyEntries, backgroundColor, buttonColor, buttonBorder, safe]);

  return (
    <TotalElapsedContext.Provider
      value={{
        totalElapsedTime,
        setTotalElapsedTime,
        totalCurrency,
        setTotalCurrency,
        dailyEntries,
        setDailyEntries,
        backgroundColor,
        setBackgroundColor,
        buttonColor,
        setButtonColor,
        buttonBorder,
        setButtonBorder,
        safe,
        setSafe,
      }}
    >
      {children}
    </TotalElapsedContext.Provider>
  );
};
