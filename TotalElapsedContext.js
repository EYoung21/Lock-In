import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TotalElapsedContext = createContext();

export const TotalElapsedProvider = ({ children }) => {
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [totalCurrency, setTotalCurrency] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [buttonColor, setButtonColor] = useState('0d0d0d');
  const [buttonBorder, setButtonBorder] = useState('2F4F4F');

  useEffect(() => {
    const loadData = async () => {
      try {
        const elapsedTime = await AsyncStorage.getItem('totalElapsedTime');
        const currency = await AsyncStorage.getItem('totalCurrency');
        const background = await AsyncStorage.getItem('backgroundColor');
        const buttonColor = await AsyncStorage.getItem('buttonColor');
        const buttonBorder = await AsyncStorage.getItem('buttonBorder');
        if (elapsedTime !== null) {
          setTotalElapsedTime(parseFloat(elapsedTime));
        }
        if (currency !== null) {
          setTotalCurrency(parseFloat(currency));
        }
        if (background !== null) {
          setBackgroundColor(background);
        }
        if (buttonColor !== null) {
          setButtonColor(buttonColor);
        }
        if (buttonBorder !== null) {
          setButtonBorder(buttonBorder);
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
        await AsyncStorage.setItem('backgroundColor', backgroundColor);
        await AsyncStorage.setItem('buttonColor', buttonColor);
        await AsyncStorage.setItem('buttonBorder', buttonBorder);
      } catch (error) {
        console.error('Failed to save data to storage', error);
      }
    };

    saveData();
  }, [totalElapsedTime, totalCurrency, backgroundColor, buttonColor, buttonBorder]);

  return (
    <TotalElapsedContext.Provider
      value={{ totalElapsedTime, setTotalElapsedTime, totalCurrency, setTotalCurrency, backgroundColor, setBackgroundColor, buttonColor, setButtonColor, buttonBorder, setButtonBorder }}
    >
      {children}
    </TotalElapsedContext.Provider>
  );
};