import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

class AccountSync {
  constructor() {
    this.user = null;
    this.syncEnabled = false;
  }

  async initialize() {
    auth().onAuthStateChanged(this.handleAuthStateChange);
  }

  handleAuthStateChange = (user) => {
    this.user = user;
    if (user) {
      this.startSync();
    } else {
      this.stopSync();
    }
  }

  startSync() {
    this.syncEnabled = true;
    this.setupRemoteListener();
  }

  stopSync() {
    this.syncEnabled = false;
    if (this.remoteListener) {
      this.remoteListener();
      this.remoteListener = null;
    }
  }

  setupRemoteListener() {
    if (!this.user) return;

    this.remoteListener = database()
      .ref(`users/${this.user.uid}/data`)
      .on('child_changed', (snapshot) => {
        const key = snapshot.key;
        const value = snapshot.val();
        this.updateLocalData(key, value);
      });
  }

  async updateLocalData(key, value) {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  async setItem(key, value) {
    if (!this.syncEnabled) return;

    try {
      // Update local storage
      await AsyncStorage.setItem(key, JSON.stringify(value));

      // Update remote database
      await database().ref(`users/${this.user.uid}/data/${key}`).set(value);
    } catch (error) {
      console.error('Error syncing data:', error);
      // Implement proper error handling here
    }
  }

  async getItem(key) {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  async removeItem(key) {
    if (!this.syncEnabled) return;

    try {
      // Remove from local storage
      await AsyncStorage.removeItem(key);

      // Remove from remote database
      await database().ref(`users/${this.user.uid}/data/${key}`).remove();
    } catch (error) {
      console.error('Error removing data:', error);
      // Implement proper error handling here
    }
  }
}

export default new AccountSync();