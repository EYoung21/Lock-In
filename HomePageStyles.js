import { StyleSheet } from "react-native";
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
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
    image2: {
      width: 200,
      height: 200,
      resizeMode: 'contain',
      marginBottom: 20,
      marginLeft: 30,
    },
    button: {
      backgroundColor: '#0d0d0d',
      padding: 10,
      borderRadius: 45,  // Adjust this value to make the button circular
      borderWidth: 2,  // Adjust the width of the border as needed
      borderColor: '#2F4F4F',  // Specify the color of the border
      zIndex: 1,
      marginTop: 50,
      width: 90,  // Set the width of the button
      height: 90,  // Set the height of the button
      justifyContent: 'center',  // Center the text within the button
      alignItems: 'center',  // Center the text within the button
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    timer: {
      color: '#0d0d0d',
      fontSize: 60,
      fontWeight: '200',
      marginBottom: 15,
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