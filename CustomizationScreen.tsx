import React, { useContext, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { TotalElapsedContext } from './TotalElapsedContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CustomizationItem {
  color: string;
  cost: number;
  name: string;
}

interface CustomizationButton {
  color: string;
  border: string;
  cost: number;
  name: string;
}

interface CustomizationSafe {
  id: string;
  image1: object;
  image2: object;
  image3: object;
  cost: number;
}

const customizations = {
  backgrounds: [
    { color: '#FFFFFF', cost: 0, name: 'White' },
    { color: '#808080', cost: 80, name: 'Gray' },
    { color: '#A52A2A', cost: 160, name: 'Brown' },
    { color: '#000000', cost: 240, name: 'Black' },
    { color: '#FFFF00', cost: 320, name: 'Yellow' },
    { color: '#0000FF', cost: 400, name: 'Blue' },
    { color: '#FF0000', cost: 480, name: 'Red' },
    { color: '#FFA500', cost: 560, name: 'Orange' },
    { color: '#800080', cost: 640, name: 'Purple' },
    { color: '#008000', cost: 720, name: 'Green' },
    { color: '#FFBF00', cost: 800, name: 'Amber' },
    { color: '#E34234', cost: 880, name: 'Vermilion' },
    { color: '#7FFF00', cost: 960, name: 'Chartreuse' },
    { color: '#FF00FF', cost: 1040, name: 'Magenta' },
    { color: '#8F00FF', cost: 1120, name: 'Violet' },
    { color: '#008080', cost: 1200, name: 'Teal' },
    { color: '#FFC0CB', cost: 1280, name: 'Pink' },
    { color: '#00FFFF', cost: 1360, name: 'Cyan' },
    { color: '#00FF00', cost: 1440, name: 'Lime' },
    { color: '#C0C0C0', cost: 1520, name: 'Silver' },
    { color: '#FFD700', cost: 1600, name: 'Gold' },
  ],

  buttonColors: [
    { color: '#808080', border: '#696969', cost: 0, name: 'Gray' },
    { color: '#A52A2A', border: '#8B4513', cost: 60, name: 'Brown' },
    { color: '#000000', border: '#333333', cost: 120, name: 'Black' },
    { color: '#FFFF00', border: '#FFD700', cost: 180, name: 'Yellow' },
    { color: '#0000FF', border: '#0000CD', cost: 240, name: 'Blue' },
    { color: '#FF0000', border: '#B22222', cost: 300, name: 'Red' },
    { color: '#FFA500', border: '#FF8C00', cost: 360, name: 'Orange' },
    { color: '#800080', border: '#4B0082', cost: 420, name: 'Purple' },
    { color: '#008000', border: '#006400', cost: 480, name: 'Green' },
    { color: '#FFBF00', border: '#FFBF00', cost: 540, name: 'Amber' },
    { color: '#E34234', border: '#CD3700', cost: 600, name: 'Vermilion' },
    { color: '#7FFF00', border: '#76EE00', cost: 660, name: 'Chartreuse' },
    { color: '#FF00FF', border: '#EE82EE', cost: 720, name: 'Magenta' },
    { color: '#8F00FF', border: '#7B68EE', cost: 780, name: 'Violet' },
    { color: '#008080', border: '#006666', cost: 840, name: 'Teal' },
    { color: '#FFC0CB', border: '#FF69B4', cost: 900, name: 'Pink' },
    { color: '#00FFFF', border: '#00CED1', cost: 960, name: 'Cyan' },
    { color: '#00FF00', border: '#32CD32', cost: 1020, name: 'Lime' },
    { color: '#C0C0C0', border: '#A9A9A9', cost: 1080, name: 'Silver' },
    { color: '#FFD700', border: '#FFA500', cost: 1140, name: 'Gold' },
  ],
  safes: [
    { id: '2DSafe', image1: require('./assets/safe1.png'), image2: require('./assets/safe2.png'), image3: require('./assets/safe3.png'), cost: 400 },
    { id: '3DSafe', image1: require('./assets/safe21.png'), image2: require('./assets/safe22.png'), image3: require('./assets/safe23.png'), cost: 800 },
    { id: 'DigitalSafe', image1: require('./assets/safe31.png'), image2: require('./assets/safe32.png'), image3: require('./assets/safe33.png'), cost: 1200 },
    { id: 'LargeSafe', image1: require('./assets/safe41.png'), image2: require('./assets/safe42.png'), image3: require('./assets/safe43.png'), cost: 1600 },
    { id: 'TreasureChest', image1: require('./assets/safe51.png'), image2: require('./assets/safe52.png'), image3: require('./assets/safe53.png'), cost: 2000 },
    { id: 'GoldenBars', image1: require('./assets/safe61.png'), image2: require('./assets/safe62.png'), image3: require('./assets/safe63.png'), cost: 2400 },
  ],
};

const CustomizationScreen = () => {
  const { totalCurrency, setTotalCurrency, backgroundColor, setBackgroundColor, buttonColor, setButtonColor, buttonBorder, setButtonBorder, safe, setSafe } = useContext(TotalElapsedContext);
  const [purchasedColors, setPurchasedColors] = useState<string[]>(['#FFFFFF']); //sets default background
  const [purchasedButtons, setPurchasedButtons] = useState<string[]>(['#808080']); //sets default button
  const [purchasedSafes, setPurchasedSafes] = useState<string[]>(['2DSafe']);

  useEffect(() => {
    const loadPurchasedColors = async () => {
      try {
        const colors = await AsyncStorage.getItem('purchasedColors');
        if (colors) {
          const parsedColors = JSON.parse(colors);
          setPurchasedColors([...parsedColors, '#FFFFFF']);
        } else {
          await AsyncStorage.setItem('purchasedColors', JSON.stringify(['#FFFFFF']));
        }
      } catch (error) {
        console.error('Failed to load purchased colors from storage', error);
      }
    };

    loadPurchasedColors();
  }, []);

  useEffect(() => {
    const loadPurchasedButtons = async () => {
      try {
        const buttons = await AsyncStorage.getItem('purchasedButtons');
        if (buttons) {
          const parsedButtons = JSON.parse(buttons);
          setPurchasedButtons([...parsedButtons, '#808080']);
        } else {
          await AsyncStorage.setItem('purchasedButtons', JSON.stringify(['#808080']));
        }
      } catch (error) {
        console.error('Failed to load purchased buttons from storage', error);
      }
    };

    loadPurchasedButtons();
  }, []);


  useEffect(() => {
    const loadPurchasedSafes = async () => {
      try {
        const safes = await AsyncStorage.getItem('purchasedSafes');
        if (safes) {
          const parsedSafes = JSON.parse(safes);
          setPurchasedSafes([...parsedSafes, '2DSafe']);
        } else {
          await AsyncStorage.setItem('purchasedSafes', JSON.stringify(['2DSafe']));
        }
      } catch (error) {
        console.error('Failed to load purchased safes from storage', error);
      }
    };

    loadPurchasedSafes();
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

  const handlePurchaseButton = async (item: CustomizationButton) => {
    if (totalCurrency >= item.cost || purchasedButtons.includes(item.color)) {
      if (!purchasedButtons.includes(item.color)) {
        setTotalCurrency(totalCurrency - item.cost);
        const newPurchasedButtons = [...purchasedButtons, item.color];
        setPurchasedButtons(newPurchasedButtons);
        await AsyncStorage.setItem('purchasedButtons', JSON.stringify(newPurchasedButtons));
      }
      setButtonColor(item.color);
      setButtonBorder(item.border);
      await AsyncStorage.setItem('buttonColor', item.color);
      await AsyncStorage.setItem('buttonBorder', item.border);
    }
  };

  const handlePurchaseSafe = async (item: CustomizationSafe) => {
    if (totalCurrency >= item.cost || purchasedSafes.includes(item.id)) {
      if (!purchasedSafes.includes(item.id)) {
        setTotalCurrency(totalCurrency - item.cost);
        const newPurchasedSafes = [...purchasedSafes, item.id];
        setPurchasedSafes(newPurchasedSafes);
        await AsyncStorage.setItem('purchasedSafes', JSON.stringify(newPurchasedSafes));
      }
      setSafe(item.id);
      await AsyncStorage.setItem('safe', item.id);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.currency}>Total Currency: {totalCurrency.toFixed(2)}</Text>
      
      <Text style={styles.subtitle}>Button</Text>
      <FlatList
        data={customizations.buttonColors}
        keyExtractor={(item) => item.color}
        horizontal
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: item.color }, { borderColor: item.border }]}
              onPress={() => handlePurchaseButton(item)}
            />
            {!purchasedButtons.includes(item.color) && (
              <Text style={styles.cost}>Cost: {item.cost} min</Text>
            )}
          </View>
        )}
      />
  
      <Text style={styles.subtitle}>Background</Text>
      <FlatList
        data={customizations.backgrounds}
        keyExtractor={(item) => item.color}
        horizontal
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <TouchableOpacity
              style={[styles.item, { backgroundColor: item.color }]}
              onPress={() => handlePurchase(item)}
            />
            {!purchasedColors.includes(item.color) && (
              <Text style={styles.cost}>Cost: {item.cost} min</Text>
            )}
          </View>
        )}
      />
  
      <Text style={styles.subtitle}>Safe</Text>
      <FlatList
        data={customizations.safes}
        keyExtractor={(item) => item.id}
        horizontal
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <TouchableOpacity style={styles.item} onPress={() => handlePurchaseSafe(item)}>
              <Image source={item.image3} style={styles.safeImage} />
            </TouchableOpacity>
            {!purchasedSafes.includes(item.id) && (
              <Text style={[styles.cost, { color: '#000000' }]}>Cost: {item.cost} min</Text>
            )}
          </View>
        )}
      />
    </View>
  );  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',  // Center content horizontally
  },
  currency: {
    fontSize: 18,
    marginBottom: 16,
    color: '#85bb65',  // Set text color to green
    textAlign: 'center',  // Center the text
  },
  subtitle: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
    color: '#000000',  // Set text color to black
    textAlign: 'center',  // Center the text
  },
  itemContainer: {
    alignItems: 'center',  // Center content horizontally
    marginHorizontal: 10,  // Add some horizontal margin
  },
  item: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 7,
    borderRadius: 10,
  },
  cost: {
    color: '#0d0d0d',
    fontWeight: 'bold',
    marginTop: 5,  // Add some margin to separate the text from the button/item
  },
  safeImage: {
    width: 80,
    height: 80,
  },
  button: {
    backgroundColor: '#0d0d0d',
    padding: 10,
    borderRadius: 45,  // Adjust this value to make the button circular
    borderWidth: 3,  // Adjust the width of the border as needed
    borderColor: '#2F4F4F',  // Specify the color of the border
    zIndex: 1,
    marginTop: 50,
    width: 90,  // Set the width of the button
    height: 90,  // Set the height of the button
    justifyContent: 'center',  // Center the text within the button
    alignItems: 'center',  // Center the text within the button
    margin: 12,
  },
});



export default CustomizationScreen;
