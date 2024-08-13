import React, { useRef, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image, 
  TouchableWithoutFeedback, 
  Animated,
} from 'react-native';
import moment from 'moment';

function Timer({ interval }) {
  const duration = moment.duration(interval);
  const centiseconds = Math.floor(duration.milliseconds() / 10).toString().padStart(2, '0');
  const seconds = duration.seconds().toString().padStart(2, '0');
  const minutes = duration.minutes().toString().padStart(2, '0');
  const hours = Math.floor(duration.asHours()).toString().padStart(2, '0');
  
  return (
    <Text style={styles.timer}>
      {hours}:{minutes}:{seconds},{centiseconds}
    </Text>
  );
}

const App = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const [imageSource, setImageSource] = useState(require('./assets/safe2.png'));
  const [buttonText, setButtonText] = useState('Lock In');
  const [isLockedIn, setIsLockedIn] = useState(false);
  const [timerInterval, setTimerInterval] = useState(0);
  const [lockInTime, setLockInTime] = useState(0); // Variable to store lock in time
  const [elapsedTime, setElapsedTime] = useState(0); // Variable to store elapsed time
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [totalCurrency, setTotalCurrency] = useState(0);
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  useEffect(() => {
    // Set totalCurrency to 0 on app load
    setTotalCurrency(0);
  }, []);

  useEffect(() => {
    let timer;
    if (isLockedIn) {
      timer = setInterval(() => {
        setTimerInterval(prevInterval => prevInterval + 10); // Increment the timer interval every 10 milliseconds
      }, 10);
    } else {
      clearInterval(timer); // Clear the timer when unlocking
      setTimerInterval(0); // Reset timer interval to initial value
    }
    return () => clearInterval(timer);
  }, [isLockedIn]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (isActionInProgress) return;
    setIsActionInProgress(true);
    Animated.spring(scaleAnim, {
      toValue: 1.75,
      useNativeDriver: true,
    }).start();

    if (isLockedIn) { 
      // Change the image source to safe2 for 0.5 seconds, then to safe1
      setImageSource(require('./assets/safe1.png'));
      setButtonText('Lock In');
      setElapsedTime(Date.now() - lockInTime); // Calculate and store elapsed time
      setLockInTime(0); // Reset lock in time
      setTimeout(() => {
        setImageSource(require('./assets/safe2.png'));
        setIsLockedIn(false);
      }, 500);

      const elapsedTimeInMinutes = elapsedTime / (1000 * 60);

      setTotalElapsedTime(totalElapsedTime + elapsedTimeInMinutes); // Accumulates elapsed time into total elapsed time
      
      const factor = 100; // Adjust the factor based on the desired precision
      const updatedTotalCurrency = Math.round((totalCurrency + eval(elapsedTimeInMinutes.toFixed(2))) * factor) / factor; //handles rounding
      setTotalCurrency(updatedTotalCurrency);

    } else {
      // Change the image source to safe3 and text to "Lock Out"
      setImageSource(require('./assets/safe3.png'));
      setButtonText('Lock Out');
      setIsLockedIn(true);
      setLockInTime(Date.now()); // Store lock in time
    }
    setTimeout(() => {
      setIsActionInProgress(false);
    }, 1000); // Adjust the timeout as needed to match the duration of the animation or action
  };
  
  return (
    <View style={styles.container}>
      <Text style={[styles.heading, styles.totalCurrency]}>Minutes: {totalCurrency}</Text>
      <Timer interval={timerInterval}/>
      <Image source={imageSource} style={styles.image} />
      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.button, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d0d0d',
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00008B',
    padding: 10,
    borderRadius: 5,
    borderWidth: 2,  // Adjust the width of the border as needed
    borderColor: '#006EE6',  // Specify the color of the border
    zIndex: 1,
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  circle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 5,
    borderColor: '#FFD700',
    zIndex: 0,
    top: '50%',       // Center vertically
    left: '50%',      // Center horizontally
    marginTop: -80,   // Adjust for half the height of the circle
    marginLeft: -50,  // Adjust for half the width of the circle
  },
  timer: {
    color: '#FFFFFF',
    fontSize: 60,
    fontWeight: '200',
  },
  totalCurrency: {
    position: 'absolute',
    top: 20,  // Adjust as needed for vertical positioning
    right: 20,  // Adjust as needed for horizontal positioning
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
