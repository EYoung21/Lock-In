import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TotalElapsedContext = createContext();

export const TotalElapsedProvider = ({ children }) => {
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [totalCurrency, setTotalCurrency] = useState(0);

  useEffect(() => {
    const loadTotalElapsedTime = async () => {
      try {
        const elapsedTime = await AsyncStorage.getItem('totalElapsedTime');
        const currency = await AsyncStorage.getItem('totalCurrency');
        if (elapsedTime !== null) {
          setTotalElapsedTime(parseFloat(elapsedTime));
        }
        if (currency !== null) {
          setTotalCurrency(parseFloat(currency));
        }
      } catch (error) {
        console.error('Failed to load data from storage', error);
      }
    };

    loadTotalElapsedTime();
  }, []);

  useEffect(() => {
    const saveTotalElapsedTime = async () => {
      try {
        await AsyncStorage.setItem('totalElapsedTime', totalElapsedTime.toString());
        await AsyncStorage.setItem('totalCurrency', totalCurrency.toString());
      } catch (error) {
        console.error('Failed to save data to storage', error);
      }
    };

    saveTotalElapsedTime();
  }, [totalElapsedTime, totalCurrency]);

  return (
    <TotalElapsedContext.Provider value={{ totalElapsedTime, setTotalElapsedTime, totalCurrency, setTotalCurrency }}>
      {children}
    </TotalElapsedContext.Provider>
  );
};
