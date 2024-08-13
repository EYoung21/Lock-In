import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TotalElapsedContext = createContext();

export const TotalElapsedProvider = ({ children }) => {
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);

  useEffect(() => {
    // Load the totalElapsedTime from AsyncStorage when the component mounts
    const loadTotalElapsedTime = async () => {
      try {
        const value = await AsyncStorage.getItem('totalElapsedTime');
        if (value !== null) {
          setTotalElapsedTime(parseFloat(value));
        }
      } catch (error) {
        console.error('Failed to load total elapsed time from storage', error);
      }
    };

    loadTotalElapsedTime();
  }, []);

  useEffect(() => {
    // Save the totalElapsedTime to AsyncStorage whenever it changes
    const saveTotalElapsedTime = async () => {
      try {
        await AsyncStorage.setItem('totalElapsedTime', totalElapsedTime.toString());
      } catch (error) {
        console.error('Failed to save total elapsed time to storage', error);
      }
    };

    saveTotalElapsedTime();
  }, [totalElapsedTime]);

  return (
    <TotalElapsedContext.Provider value={{ totalElapsedTime, setTotalElapsedTime }}>
      {children}
    </TotalElapsedContext.Provider>
  );
};
