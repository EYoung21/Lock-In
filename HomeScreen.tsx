import React, { useRef, useState, useEffect, useContext } from 'react';
import {
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  Animated,
  SafeAreaView,
} from 'react-native';
import moment from 'moment';
import styles from './HomePageStyles';
import { CollapseContext } from './FullApp';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { TotalElapsedContext } from './TotalElapsedContext';


const getTimerColor = (backgroundPalette: string) => {
  if (backgroundPalette === '#000000') {
    return '#FFFFFF';
  }
  return '#0d0d0d';
};

function Timer({ interval, color }: { interval: number, color: string }) {
  const duration = moment.duration(interval);
  const centiseconds = Math.floor(duration.milliseconds() / 10).toString().padStart(2, '0');
  const seconds = duration.seconds().toString().padStart(2, '0');
  const minutes = duration.minutes().toString().padStart(2, '0');
  const hours = Math.floor(duration.asHours()).toString().padStart(2, '0');

  return (
    <Text style={[styles.timer, { color }]}>
      {hours}:{minutes}:{seconds}.{centiseconds}
    </Text>
  );
}

const HomeScreen = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [imageSource, setImageSource] = useState(require('./assets/safe2.png'));
  const [buttonText, setButtonText] = useState('Lock In');
  const [isLockedIn, setIsLockedIn] = useState(false);

  const { collapsed, setCollapsed } = useContext(CollapseContext);
  const { totalElapsedTime, setTotalElapsedTime, totalCurrency, setTotalCurrency, backgroundColor, setBackgroundColor, buttonColor, setButtonColor, buttonBorder, setButtonBorder, safe, setSafe } = useContext(TotalElapsedContext);
  const [timerInterval, setTimerInterval] = useState(0);
  const [lockInTime, setLockInTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isLockedIn) {
      timer = setInterval(() => {
        setTimerInterval((prevInterval) => prevInterval + 10);
      }, 10);
    } else {
      clearInterval(timer);
      setTimerInterval(0);
    }
    return () => clearInterval(timer);
  }, [isLockedIn]);

  useEffect(() => {
    setImageSource(getSafeImage(safe, 'image2'));
  }, [safe]);

  const handlePressIn = () => {
    if (isActionInProgress) return;
    setIsActionInProgress(true);
    Animated.spring(scaleAnim, {
      toValue: 1.5,
      useNativeDriver: true,
    }).start();
  };

  const safes = [
    { id: '2DSafe', image1: require('./assets/safe1.png'), image2: require('./assets/safe2.png'), image3: require('./assets/safe3.png'), cost: 480 },
    { id: '3DSafe', image1: require('./assets/safe21.png'), image2: require('./assets/safe22.png'), image3: require('./assets/safe23.png'), cost: 960 },
    { id: 'DigitalSafe', image1: require('./assets/safe31.png'), image2: require('./assets/safe32.png'), image3: require('./assets/safe33.png'), cost: 1440 },
    { id: 'LargeSafe', image1: require('./assets/safe41.png'), image2: require('./assets/safe42.png'), image3: require('./assets/safe43.png'), cost: 1920 },
    { id: 'TreasureChest', image1: require('./assets/safe51.png'), image2: require('./assets/safe52.png'), image3: require('./assets/safe53.png'), cost: 2400 },
  ];

  const getSafeImage = (id:string, imageKey:string) => {
    const safe = safes.find(safe => safe.id === id);
    return safe ? safe[imageKey] : null;
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.75,
      useNativeDriver: true,
    }).start();

    if (isLockedIn) {
      setIsLockedIn(false);
      setCollapsed(false);
      SystemNavigationBar.navigationShow();
      setImageSource(getSafeImage(safe, 'image1'));
      setButtonText('Lock In');
      setElapsedTime(Date.now() - lockInTime);
      setLockInTime(0);
      setTimeout(() => {
        setImageSource(getSafeImage(safe, 'image2'));
      }, 625);

      const elapsedTimeInMinutes = elapsedTime / (1000 * 60);
      setTotalElapsedTime(totalElapsedTime + elapsedTimeInMinutes);
      setTotalCurrency(totalCurrency + elapsedTimeInMinutes);
    } else {
      setIsLockedIn(true);
      setCollapsed(true);
      SystemNavigationBar.navigationHide();
      setImageSource(getSafeImage(safe, 'image3'));
      setButtonText('Lock Out');
      setLockInTime(Date.now());
    }
    setTimeout(() => {
      setIsActionInProgress(false);
    }, 1000);
  };

  const getImageStyle = (source: any) => {
    if (source === require('./assets/safe1.png')) {
      return styles.image2;
    }
    else if (source === require('./assets/safe2.png')) {
      return styles.image5;
    }
    else if (source === require('./assets/safe3.png')) {
      return styles.image;
    }
    else if (source === require('./assets/safe21.png')) {
      return styles.image3;
    } 
    else if (source === require('./assets/safe22.png')) {
      return styles.image4;
    }
    else if (source === require('./assets/safe23.png')) {
      return styles.image14;
    }
    else if (source === require('./assets/safe33.png')) {
      return styles.image6;
    }
    else if (source === require('./assets/safe31.png') || source === require('./assets/safe32.png')) {
      return styles.image7;
    }
    else if (source === require('./assets/safe43.png')) {
      return styles.image8;
    }
    else if (source === require('./assets/safe41.png')) {
      return styles.image9;
    }
    else if (source === require('./assets/safe42.png')) {
      return styles.image10;
    }
    else if (source === require('./assets/safe53.png')) {
      return styles.image11;
    }
    else if (source === require('./assets/safe51.png')) {
      return styles.image12;
    }
    else if (source === require('./assets/safe52.png')) {
      return styles.image13;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.heading, styles.totalCurrency]}>$ in minutes: {totalCurrency.toFixed(2)}</Text>
      <Timer interval={timerInterval} color={getTimerColor(backgroundColor)} />
      <Image source={imageSource} style={getImageStyle(imageSource)} />
      <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[
          styles.button, 
          { 
            transform: [{ scale: scaleAnim }], 
            backgroundColor: buttonColor, 
            borderColor: buttonBorder,
          }
        ]}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default HomeScreen;
