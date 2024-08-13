import { StyleSheet } from "react-native";
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
  export default styles