import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { TotalElapsedContext } from './TotalElapsedContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CustomizationItem {
  color: string;
  cost: number;
  name: string;
}

const customizations = {
  backgrounds: [
    { color: '#808080', cost: 120, name: 'Gray' },
    { color: '#A52A2A', cost: 240, name: 'Brown' },
    { color: '#000000', cost: 360, name: 'Black' },
    { color: '#FFFF00', cost: 480, name: 'Yellow' },
    { color: '#0000FF', cost: 600, name: 'Blue' },
    { color: '#FF0000', cost: 720, name: 'Red' },
    { color: '#FFA500', cost: 840, name: 'Orange' },
    { color: '#800080', cost: 960, name: 'Purple' },
    { color: '#008000', cost: 1080, name: 'Green' },
    { color: '#FFBF00', cost: 1200, name: 'Amber' },
    { color: '#E34234', cost: 1320, name: 'Vermilion' },
    { color: '#7FFF00', cost: 1440, name: 'Chartreuse' },
    { color: '#FF00FF', cost: 1560, name: 'Magenta' },
    { color: '#8F00FF', cost: 1680, name: 'Violet' },
    { color: '#008080', cost: 1800, name: 'Teal' },
    { color: '#FFC0CB', cost: 1920, name: 'Pink' },
    { color: '#00FFFF', cost: 2040, name: 'Cyan' },
    { color: '#00FF00', cost: 2160, name: 'Lime' },
    { color: '#C0C0C0', cost: 2280, name: 'Silver' },
    { color: '#FFD700', cost: 2400, name: 'Gold' },
  ],
  // safes: [
  //   { id: 'safe1', image: require('./assets/safe1.png'), cost: 100 },
  //   { id: 'safe2', image: require('./assets/safe2.png'), cost: 200 },
  //   { id: 'safe3', image: require('./assets/safe3.png'), cost: 300 },
  // ],
};

const CustomizationScreen = () => {
  const { totalCurrency, setTotalCurrency, backgroundColor, setBackgroundColor } = useContext(TotalElapsedContext);
  const [purchasedColors, setPurchasedColors] = useState<string[]>([]);

  useEffect(() => {
    const loadPurchasedColors = async () => {
      try {
        const colors = await AsyncStorage.getItem('purchasedColors');
        if (colors) {
          setPurchasedColors(JSON.parse(colors));
        }
      } catch (error) {
        console.error('Failed to load purchased colors from storage', error);
      }
    };

    loadPurchasedColors();
  }, []);

  const handlePurchase = async (item: CustomizationItem) => {
    if (totalCurrency >= item.cost || purchasedColors.includes(item.color)) {
      if (!purchasedColors.includes(item.color)) {
        setTotalCurrency(totalCurrency - item.cost);
        const newPurchasedColors = [...purchasedColors, item.color];
        setPurchasedColors(newPurchasedColors);
        await AsyncStorage.setItem('purchasedColors', JSON.stringify(newPurchasedColors));
      }
      setBackgroundColor(item.color);
      await AsyncStorage.setItem('backgroundColor', item.color);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customize Your App</Text>
      <Text style={styles.currency}>Total Currency: {totalCurrency.toFixed(2)}</Text>
      
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
            {!purchasedColors.includes(item.color) && <Text style={styles.cost}>Cost: {item.cost} min</Text>}
          </TouchableOpacity>
        )}
      />
      
      {/* <Text style={styles.subtitle}>Safes</Text>
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
      /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',  // Center content horizontally
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000000',  // Set text color to black
    textAlign: 'center',  // Center the text
  },
  currency: {
    fontSize: 18,
    marginBottom: 16,
    color: '#85bb65',  // Set text color to black
    textAlign: 'center',  // Center the text
  },
  subtitle: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
    color: '#000000',  // Set text color to black
    textAlign: 'center',  // Center the text
  },
  item: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
    borderRadius: 10,
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
