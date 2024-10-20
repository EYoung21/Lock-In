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
  StyleSheet,
} from 'react-native';
import BackgroundTimer from 'react-native-background-timer';
import styles from './HomePageStyles';
import { CollapseContext } from './FullApp';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import { TotalElapsedContext } from './TotalElapsedContext';
import moment from 'moment';
// import {PushNotification} from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import usePermissionListener from './usePermissionListener'; // Import the hook

import { NativeModules } from 'react-native';

const { AppServiceModule } = NativeModules;

// const showNotification = (title, message) => {
//   PushNotification.localNotification({
//     channelId: 'your-channel-id',
//     autoCancel: true,
//     largeIcon: 'ic_launcher',
//     smallIcon: 'ic_notification',
//     bigText: message,
//     subText: 'Local Notification Demo',
//     color: 'blue',
//     vibrate: true,
//     vibration: 300,
//     title: title,
//     message: message,
//     playSound: true,
//     soundName: 'default',
//     importance: 'high',
//     priority: 'high',
//   });
// };

const getTimerColor = (backgroundPalette) => {
  return backgroundPalette === '#000000' ? '#FFFFFF' : '#0d0d0d';
};

const HomeScreen = () => {
  const scaleAnim = useRef(new Animated.Value(1.75)).current;
  const { collapsed, setCollapsed } = useContext(CollapseContext);

  const {
    totalElapsedTime,
    setTotalElapsedTime,
    totalCurrency,
    setTotalCurrency,
    dailyEntries,
    setDailyEntries,
    backgroundColor,
    buttonColor,
    buttonBorder,
    safe,
    blacklistedApps,
    appMonitoringEnabled,
    manageOverlayEnabled,
    appMonitoringOn,
    manageOverlayOn,
    totalTimesLockedIn, 
    setTotalTimesLockedIn,
    setAppMonitoringEnabled,
    setManageOverlayEnabled,
    setAppMonitoringOn,
    setManageOverlayOn,
  } = useContext(TotalElapsedContext);

  const [imageSource, setImageSource] = useState(null);
  const [buttonText, setButtonText] = useState('Lock In');
  const [isLockedIn, setIsLockedIn] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState(Date.now());

  // When your blacklisted apps change, update the native module
  // useEffect(() => {
  //   if (appMonitoringEnabled) {
  //     AppServiceModule.updateBlacklistedApps(blacklistedApps)
  //       .then(() => {
  //         console.log("Blacklisted apps updated successfully");
  //       })
  //       .catch((error) => {
  //         console.error("Failed to update blacklisted apps:", error);
  //       });
  //   }
  // }, [blacklistedApps]);

  //uses hook
  usePermissionListener(
    setAppMonitoringEnabled,
    setManageOverlayEnabled,
    setAppMonitoringOn,
    setManageOverlayOn,
    isLockedIn,
  );

  // usePermissionListener(setAppMonitoringEnabled, setManageOverlayEnabled, setAppMonitoringOn, setManageOverlayOn, isLockedIn);

  // useEffect(() => {
  //   setTotalCurrency(500000);
  // }, []);

  // // Start the service when monitoring is enabled
  // useEffect(() => {
  //   if (isLockedIn && appMonitoringEnabled && manageOverlayEnabled && appMonitoringOn && manageOverlayOn) {
  //     AppServiceModule.startService()
  //       .then(() => console.log("Service started successfully"))
  //       .catch(error => console.error("Failed to start service:", error));
  //   } else {
  //     AppServiceModule.stopService()
  //       .then(() => console.log("Service stopped successfully"))
  //       .catch(error => console.error("Failed to stop service:", error));
  //   }
  // }, [isLockedIn, appMonitoringEnabled]);

  useEffect(() => {
    if (safe) {
      const newImageSource = getSafeImage(safe, 'image2');
      if (newImageSource) {
        setImageSource(newImageSource);
      } else {
        console.error(`No image found for safe: ${safe}`);
      }
    }
  }, [safe]);

  useEffect(() => {
    if (!isLockedIn && elapsedTime > 0) {
      const elapsedTimeInMinutes = elapsedTime / (60 * 1000);
      setTotalElapsedTime((prevTime) => prevTime + elapsedTimeInMinutes);
      setTotalCurrency((prevCurrency) => prevCurrency + elapsedTimeInMinutes);
      updateDailyEntries(elapsedTimeInMinutes);
    }
  }, [isLockedIn, elapsedTime]);

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
    const safeId = typeof id === 'string' ? id.replace(/^"|"$/g, '') : id;
    const safe = safes.find((s) => s.id === safeId);
    if (!safe) {
      console.error(`Safe not found for id: ${safeId}`);
      return null;
    }
    return safe[imageKey];
  };

  // const updateNativeBlacklistedApps = async (apps) => {
  //   try {
  //     await AppServiceModule.updateBlacklistedApps(apps);
  //   } catch (error) {
  //     console.error('Failed to update blacklisted apps in native module:', error);
  //   }
  // };

  const startTimer = () => {
    const startTime = Date.now();
    setTimerStartTime(startTime);
  
    BackgroundTimer.runBackgroundTimer(() => {
      const currentTime = Date.now();
      const totalElapsed = currentTime - startTime;
      setElapsedTime(totalElapsed); // Calculate the elapsed time relative to start
    }, 1000);
  };
  
  const stopTimer = () => {
    BackgroundTimer.stopBackgroundTimer();
    const currentTime = Date.now();
    const totalElapsed = currentTime - timerStartTime;
    setElapsedTime(totalElapsed); // Set the final elapsed time
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
      stopTimer();
      setTimeout(() => {
        setImageSource(getSafeImage(safe, 'image2'));
      }, 700);
      setTotalTimesLockedIn((parseInt(totalTimesLockedIn) + 1).toString());
      AppServiceModule.stopService()
        .then(() => console.log("Service stopped successfully"))
        .catch(error => console.error("Failed to stop service:", error));
    } else {
      if (appMonitoringEnabled && manageOverlayEnabled && appMonitoringOn && manageOverlayOn) {
        AppServiceModule.startService()
          .then(() => console.log("Service started successfully"))
          .catch(error => console.error("Failed to start service:", error));
      } else {
        Alert.alert("App Blocking Off", "Grant necessary permissions to block apps while locked in.");
      }
      setIsLockedIn(true);
      setCollapsed(true);
      SystemNavigationBar.navigationHide();
      setImageSource(getSafeImage(safe, 'image3'));
      setButtonText('Lock Out');
      setElapsedTime(0);
      startTimer();
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

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.heading, styles.totalCurrency]}>$ in minutes: {totalCurrency.toFixed(2)}</Text>
      <View style={localStyles.timerContainer}>
        <Text style={[localStyles.timerText, { color: getTimerColor(backgroundColor) }]}>
          {formatTime(elapsedTime)}
        </Text>
      </View>
      {imageSource && <Image source={imageSource} style={getImageStyle(imageSource)} />}
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

const localStyles = StyleSheet.create({
  timerContainer: {
    marginVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  //testing
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;











// import React, { useContext } from 'react';
// import { View, Text, StyleSheet } from 'react-native';
// import { TotalElapsedContext } from './TotalElapsedContext';
// import usePermissionListener from './usePermissionListener';

// const HomeScreen: React.FC = () => {
//   const { 
//     appMonitoringEnabled, 
//     setAppMonitoringEnabled, 
//     manageOverlayEnabled, 
//     setManageOverlayEnabled,
//     isLockedIn,
//     // ... other context values
//   } = useContext(TotalElapsedContext);

//   usePermissionListener(setAppMonitoringEnabled, setManageOverlayEnabled, isLockedIn);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.text}>
//         App Monitoring Enabled: {appMonitoringEnabled ? 'Yes' : 'No'}
//       </Text>
//       <Text style={styles.text}>
//         Manage Overlay Enabled: {manageOverlayEnabled ? 'Yes' : 'No'}
//       </Text>
//       <Text style={styles.text}>
//         Is Locked In: {isLockedIn ? 'Yes' : 'No'}
//       </Text>
//     </View>
//   );
// };ter',
//   },
//   text: {
//     fontSize: 18,
//     marginBottom: 10,
//   },
// });

// export default HomeScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'cen