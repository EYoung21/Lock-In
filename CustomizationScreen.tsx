import React, { useContext, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { TotalElapsedContext } from './TotalElapsedContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const customizations = {
  backgrounds: [
    { color: '#FF0000', cost: 100 },
    { color: '#00FF00', cost: 200 },
    { color: '#0000FF', cost: 300 },
  ],
  safes: [
    { id: 'safe1', image: require('./assets/safe1.png'), cost: 100 },
    { id: 'safe2', image: require('./assets/safe2.png'), cost: 200 },
    { id: 'safe3', image: require('./assets/safe3.png'), cost: 300 },
  ],
};

const CustomizationScreen = () => {
  const { totalCurrency, setTotalCurrency } = useContext(TotalElapsedContext);
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [selectedSafe, setSelectedSafe] = useState(null);

  const handlePurchase = (item:any) => {
    if (totalCurrency >= item.cost) {
      setTotalCurrency(totalCurrency - item.cost);
      if (item.color) {
        setSelectedBackground(item.color);
        AsyncStorage.setItem('backgroundColor', item.color);
      } else if (item.id) {
        setSelectedSafe(item.id);
        AsyncStorage.setItem('selectedSafe', item.id);
      }
    } else {
      alert('Not enough currency to buy this item.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customize Your App</Text>
      <Text style={styles.currency}>Total Currency: {totalCurrency}</Text>
      
      <Text style={styles.subtitle}>Backgrounds</Text>
      <FlatList
        data={customizations.backgrounds}
        keyExtractor={(item) => item.color}
        horizontal
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, { backgroundColor: item.color }]}
            onPress={() => handlePurchase(item)}
          >
            <Text style={styles.cost}>Cost: {item.cost}</Text>
          </TouchableOpacity>
        )}
      />
      
      <Text style={styles.subtitle}>Safes</Text>
      <FlatList
        data={customizations.safes}
        keyExtractor={(item) => item.id}
        horizontal
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => handlePurchase(item)}>
            <Image source={item.image} style={styles.safeImage} />
            <Text style={styles.cost}>Cost: {item.cost}</Text>
          </TouchableOpacity>
        )}
      />
      
      <Button title="Save Customizations" onPress={() => {
        // Customizations are already saved in handlePurchase
      }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  currency: {
    fontSize: 18,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  item: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  cost: {
    color: '#fff',
    fontWeight: 'bold',
  },
  safeImage: {
    width: 80,
    height: 80,
  },
});

export default CustomizationScreen;
function alert(arg0: string) {
  throw new Error('Function not implemented.');
}

