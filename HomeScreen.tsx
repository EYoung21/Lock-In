import React, { useRef, useState, useEffect, useContext } from 'react';
import {
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import moment from 'moment';
import styles from './HomePageStyles';
import { CollapseContext } from './FullApp';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { TotalElapsedContext } from './TotalElapsedContext';

function Timer({ interval } : {interval:number}) {
  const duration = moment.duration(interval);
  const centiseconds = Math.floor(duration.milliseconds() / 10).toString().padStart(2, '0');
  const seconds = duration.seconds().toString().padStart(2, '0');
  const minutes = duration.minutes().toString().padStart(2, '0');
  const hours = Math.floor(duration.asHours()).toString().padStart(2, '0');

  return (
    <Text style={styles.timer}>
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

  const [timerInterval, setTimerInterval] = useState(0);
  const [lockInTime, setLockInTime] = useState(0); // Variable to store lock in time
  const [elapsedTime, setElapsedTime] = useState(0); // Variable to store elapsed time
  const { totalElapsedTime, setTotalElapsedTime, totalCurrency, setTotalCurrency } = useContext(TotalElapsedContext);
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  // useEffect(() => {
  //   setTotalCurrency(0);
  // }, []);

  // useEffect(() => {
  //   setTotalElapsedTime(0);
  // }, []);


  useEffect(() => {
    let timer:any;
    if (isLockedIn) {
      timer = setInterval(() => {
        setTimerInterval(prevInterval => prevInterval + 10);
      }, 10);
    } else {
      clearInterval(timer);
      setTimerInterval(0);
    }
    return () => clearInterval(timer);
  }, [isLockedIn]);

  const handlePressIn = () => {
    if (isActionInProgress) return;
    setIsActionInProgress(true);
    Animated.spring(scaleAnim, {
      toValue: 1.5,
      useNativeDriver: true,
    }).start();
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
      setImageSource(require('./assets/safe1.png'));
      setButtonText('Lock In');
      setElapsedTime(Date.now() - lockInTime);
      setLockInTime(0);
      setTimeout(() => {
        setImageSource(require('./assets/safe2.png'));
      }, 500);

      const elapsedTimeInMinutes = elapsedTime / (1000 * 60);
      setTotalElapsedTime(totalElapsedTime + elapsedTimeInMinutes);

      // const factor = 100;
      // const updatedTotalCurrency = Math.round((totalCurrency + elapsedTimeInMinutes) * factor) / factor;
      setTotalCurrency(totalCurrency + elapsedTimeInMinutes);
    } else {
      setIsLockedIn(true);
      setCollapsed(true);
      SystemNavigationBar.navigationHide();
      setImageSource(require('./assets/safe3.png'));
      setButtonText('Lock Out');
      setLockInTime(Date.now());
    }
    setTimeout(() => {
      setIsActionInProgress(false);
    }, 1000);
  };

  const getImageStyle = (source:any) => {
    if (source === require('./assets/safe1.png') || source === require('./assets/safe2.png')) {
      return styles.image2;
    }
    return styles.image;
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, styles.totalCurrency]}>$ in minutes: {totalCurrency.toFixed(2)}</Text>
      <Timer interval={timerInterval} />
      <Image source={imageSource} style={getImageStyle(imageSource)} />
      <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[styles.button, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default HomeScreen;