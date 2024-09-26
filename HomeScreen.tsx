import React, { useRef, useState, useEffect, useContext } from 'react';
import {
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  Animated,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { Stopwatch } from 'react-native-stopwatch-timer';
import styles from './HomePageStyles';
import { CollapseContext } from './FullApp';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { TotalElapsedContext } from './TotalElapsedContext';
import moment from 'moment';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

import { NativeModules } from 'react-native';

const { AppServiceModule } = NativeModules;

// const { CurrentAppModule } = NativeModules;

// Set up push notification configuration
PushNotification.configure({
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);
  },
  popInitialNotification: true,
  requestPermissions: Platform.OS === 'ios',
});

const showNotification = (title, message) => {
  PushNotification.localNotification({
    channelId: 'your-channel-id',
    autoCancel: true,
    largeIcon: 'ic_launcher',
    smallIcon: 'ic_notification',
    bigText: message,
    subText: 'Local Notification Demo',
    color: 'blue',
    vibrate: true,
    vibration: 300,
    title: title,
    message: message,
    playSound: true,
    soundName: 'default',
    importance: 'high',
    priority: 'high',
  });
};

const getTimerColor = (backgroundPalette) => {
  return backgroundPalette === '#000000' ? '#FFFFFF' : '#0d0d0d';
};

const HomeScreen = () => {
  const scaleAnim = useRef(new Animated.Value(1.75)).current;
  const [imageSource, setImageSource] = useState(require('./assets/safe2.png'));
  const [buttonText, setButtonText] = useState('Lock In');
  const [isLockedIn, setIsLockedIn] = useState(false);

  const { collapsed, setCollapsed } = useContext(CollapseContext);
  const {
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
    whitelistedApps,
    appMonitoringEnabled,
    manageOverlayEnabled,
    appMonitoringOn,
    manageOverlayOn,
  } = useContext(TotalElapsedContext);

  const [stopwatchStart, setStopwatchStart] = useState(false);
  const [stopwatchReset, setStopwatchReset] = useState(false);
  const [lockInTime, setLockInTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isActionInProgress, setIsActionInProgress] = useState(false);


  // When your whitelisted apps change, update the native module
  useEffect(() => {
    if (appMonitoringEnabled) {
      AppServiceModule.updateWhitelistedApps(whitelistedApps)
        .then(() => {
          console.log("Whitelisted apps updated successfully");
        })
        .catch((error) => {
          console.error("Failed to update whitelisted apps:", error);
        });
    }
  }, [whitelistedApps, appMonitoringEnabled]);

  // Start the service when monitoring is enabled
  useEffect(() => {
    if (isLockedIn && appMonitoringEnabled && manageOverlayEnabled && appMonitoringOn && manageOverlayOn) {
      AppServiceModule.startService()
        .then(() => console.log("Service started successfully"))
        .catch(error => console.error("Failed to start service:", error));
    } else {
      AppServiceModule.stopService()
        .then(() => console.log("Service stopped successfully"))
        .catch(error => console.error("Failed to stop service:", error));
    }
  }, [isLockedIn, appMonitoringEnabled]);

  useEffect(() => {
    setImageSource(getSafeImage(safe, 'image2'));
  }, [safe]);

  useEffect(() => {
    if (!isLockedIn) {
      const elapsedTimeInMinutes = elapsedTime / (1000 * 60);
      setTotalElapsedTime((prevTime) => prevTime + elapsedTimeInMinutes);
      setTotalCurrency((prevCurrency) => prevCurrency + elapsedTimeInMinutes);
      updateDailyEntries(elapsedTimeInMinutes);
    }
  }, [elapsedTime]);

  useEffect(() => {
    if (!isLockedIn) {
      const elapsedTimeInMinutes = elapsedTime / (1000 * 60);
      setTotalElapsedTime((prevTime) => prevTime + elapsedTimeInMinutes);
      setTotalCurrency((prevCurrency) => prevCurrency + elapsedTimeInMinutes);
      updateDailyEntries(elapsedTimeInMinutes);
    }
  }, [elapsedTime]);

  // const getCurrentRunningApp = async () => {
  //   try {
  //     const currentApp = await CurrentAppModule.getCurrentRunningApp();
  //     console.log("Current app:", currentApp);
  //     return currentApp;
  //   } catch (error) {
  //     console.error("Error getting current app:", error);
  //   }
  // };

  // useEffect(() => {
  //   const checkRunningApp = async () => {
  //     if (!isLockedIn || !appMonitoringEnabled) return;

  //     try {
  //       const currentApp = await getCurrentRunningApp();
  //       if (!whitelistedApps.includes(currentApp)) {
  //         showNotification('Lock In', 'You have been locked out for using a non-whitelisted app.');
  //         handlePressOut();
  //       }
  //     } catch (error) {
  //       console.error('Error retrieving current running app:', error);
  //     }
  //   };

  //   const intervalId = setInterval(checkRunningApp, 1000);
  //   return () => clearInterval(intervalId);
  // }, [isLockedIn, appMonitoringEnabled, whitelistedApps]);

  //above is code to monitor current app, still need to code that functionality.

  const updateDailyEntries = (minutes) => {
    const today = moment().format('YYYY-MM-DD');
    setDailyEntries((prevEntries) => {
      const newEntries = { ...prevEntries };
      if (newEntries[today]) {
        newEntries[today] += minutes;
      } else {
        newEntries[today] = minutes;
      }
      return newEntries;
    });
  };

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
    { id: 'GoldenBars', image1: require('./assets/safe61.png'), image2: require('./assets/safe62.png'), image3: require('./assets/safe63.png'), cost: 2400 },
  ];

  const getSafeImage = (id, imageKey) => {
    const safe = safes.find((safe) => safe.id === id);
    return safe ? safe[imageKey] : null;
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.75,
      useNativeDriver: true,
    }).start();

    if (isLockedIn) {
      const currentTime = Date.now();

      AppServiceModule.stopService();

      setIsLockedIn(false);
      setCollapsed(false);
      SystemNavigationBar.navigationShow();
      setImageSource(getSafeImage(safe, 'image1'));
      setButtonText('Lock In');
      setElapsedTime(currentTime - lockInTime);
      setLockInTime(0);
      setStopwatchStart(false);
      setStopwatchReset(true);
      setTimeout(() => {
        setImageSource(getSafeImage(safe, 'image2'));
      }, 700);
    } else {
      setIsLockedIn(true);
      setCollapsed(true);
      SystemNavigationBar.navigationHide();
      setImageSource(getSafeImage(safe, 'image3'));
      setButtonText('Lock Out');
      setLockInTime(Date.now());
      setStopwatchStart(true);
      setStopwatchReset(false);
      if (appMonitoringEnabled && manageOverlayEnabled && appMonitoringOn && manageOverlayOn) {
        AppServiceModule.startService()
        .then(() => console.log("Service started successfully"))
        .catch(error => console.error("Failed to start service:", error));
      } else {
        Alert.alert("Permission Required", "Please grant all necessary permissions to use this feature.");
      }
    }
    setTimeout(() => {
      setIsActionInProgress(false);
    }, 1000);
  };

  const getImageStyle = (source) => {
    if (source === require('./assets/safe1.png')) {
      return styles.image2;
    } else if (source === require('./assets/safe2.png')) {
      return styles.image5;
    } else if (source === require('./assets/safe3.png')) {
      return styles.image1;
    } else if (source === require('./assets/safe21.png')) {
      return styles.image3;
    } else if (source === require('./assets/safe22.png')) {
      return styles.image4;
    } else if (source === require('./assets/safe23.png')) {
      return styles.image14;
    } else if (source === require('./assets/safe33.png')) {
      return styles.image6;
    } else if (source === require('./assets/safe31.png') || source === require('./assets/safe32.png')) {
      return styles.image7;
    } else if (source === require('./assets/safe43.png')) {
      return styles.image8;
    } else if (source === require('./assets/safe41.png')) {
      return styles.image9;
    } else if (source === require('./assets/safe42.png')) {
      return styles.image10;
    } else if (source === require('./assets/safe53.png')) {
      return styles.image11;
    } else if (source === require('./assets/safe51.png')) {
      return styles.image12;
    } else if (source === require('./assets/safe52.png')) {
      return styles.image13;
    } else if (source === require('./assets/safe61.png')) {
      return styles.image15;
    } else if (source === require('./assets/safe62.png')) {
      return styles.image16;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.heading, styles.totalCurrency]}>$ in minutes: {totalCurrency.toFixed(2)}</Text>
      <Stopwatch
        laps
        msecs
        start={stopwatchStart}
        reset={stopwatchReset}
        options={options}
        getTime={(time) => setElapsedTime(moment.duration(time).asMilliseconds())}
      />
      <Image source={imageSource} style={getImageStyle(imageSource)} />
      <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View
          style={[
            styles.button,
            {
              transform: [{ scale: scaleAnim }],
              backgroundColor: buttonColor,
              borderColor: buttonBorder,
            },
          ]}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const options = {
  container: {
    backgroundColor: '#000',
    padding: 5,
    borderRadius: 5,
    width: 220,
  },
  text: {
    fontSize: 30,
    color: '#FFF',
    marginLeft: 7,
  },
};

export default HomeScreen;
