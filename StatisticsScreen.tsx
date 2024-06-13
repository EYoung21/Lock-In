import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TotalElapsedContext } from './TotalElapsedContext';

const StatisticsScreen = () => {
  const { totalElapsedTime } = useContext(TotalElapsedContext);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Total time locked in: {totalElapsedTime} minutes</Text>
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
    color: '#000000',
    fontWeight: 'bold',
  },
});

export default StatisticsScreen;
