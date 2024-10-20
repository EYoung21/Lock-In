import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import NetInfo from '@react-native-community/netinfo';

const QUEUE_KEY = '@offline_queue';

class AccountSync {
  constructor() {
    this.user = null;
    this.syncEnabled = false;
    this.isOnline = true;
    this.queue = [];
    this.listeners = new Set();
  }

  async initialize() {
    auth().onAuthStateChanged(this.handleAuthStateChange);
    this.setupNetworkListener();
    await this.loadQueue();
  }

  handleAuthStateChange = async (user) => {
    this.user = user;
    if (user) {
      await this.fullSync(); // Perform full sync when user logs in
      this.startSync();
    } else {
      await this.stopSync();
    }
  }

  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected;
      if (wasOffline && this.isOnline) {
        this.processQueue();
      }
    });
  }

  async fullSync() {
    if (!this.user) {
      console.log('No user logged in, skipping full sync');
      return;
    }
  
    try {
      console.log('Starting full sync');
      const snapshot = await database().ref(`users/${this.user.uid}/data`).once('value');
      const remoteData = snapshot.val() || {};
      console.log('Remote data fetched:', remoteData);
  
      for (const [key, value] of Object.entries(remoteData)) {
        console.log(`Updating local data: ${key}`);
        await this.updateLocalData(key, value);
      }
  
      this.notifyListeners('fullSyncCompleted', remoteData);
      console.log('Full sync completed');
    } catch (error) {
      console.error('Error during full sync:', error);
    }
  }

  startSync() {
    this.syncEnabled = true;
    this.setupRemoteListener();
    this.processQueue();
  }

  async stopSync() {
    this.syncEnabled = false;
    if (this.remoteListener) {
      this.remoteListener();
      this.remoteListener = null;
    }
    await this.clearLocalData();
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
    this.notifyListeners('dataChanged', { [key]: value });
  }

  async setItem(key, value) {
    if (!this.syncEnabled) return;

    await this.updateLocalData(key, value);

    if (this.isOnline) {
      try {
        await database().ref(`users/${this.user.uid}/data/${key}`).set(value);
      } catch (error) {
        console.error('Error syncing data:', error);
        await this.addToQueue(key, value);
        throw new Error('Failed to sync data. It will be synced when connection is restored.');
      }
    } else {
      await this.addToQueue(key, value);
      throw new Error('Offline. Data will be synced when connection is restored.');
    }
  }

  async getItem(key) {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  async removeItem(key) {
    if (!this.syncEnabled) return;

    await AsyncStorage.removeItem(key);
    this.notifyListeners('dataChanged', { [key]: null });

    if (this.isOnline) {
      try {
        await database().ref(`users/${this.user.uid}/data/${key}`).remove();
      } catch (error) {
        console.error('Error removing data:', error);
        await this.addToQueue(key, null); // null indicates removal
      }
    } else {
      await this.addToQueue(key, null);
    }
  }

  async addToQueue(key, value) {
    this.queue.push({ key, value, timestamp: Date.now() });
    await this.saveQueue();
  }

  async loadQueue() {
    const queueData = await AsyncStorage.getItem(QUEUE_KEY);
    this.queue = queueData ? JSON.parse(queueData) : [];
  }

  async saveQueue() {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
  }

  async processQueue() {
    if (!this.isOnline || !this.user) return;

    const processedItems = [];

    for (const item of this.queue) {
      try {
        if (item.value === null) {
          await database().ref(`users/${this.user.uid}/data/${item.key}`).remove();
        } else {
          await database().ref(`users/${this.user.uid}/data/${item.key}`).set(item.value);
        }
        processedItems.push(item);
      } catch (error) {
        console.error('Error processing queued item:', error);
      }
    }

    this.queue = this.queue.filter(item => !processedItems.includes(item));
    await this.saveQueue();
  }

  async clearLocalData() {
    const allKeys = await AsyncStorage.getAllKeys();
    const userDataKeys = allKeys.filter(key => !key.startsWith('@')); // Exclude system keys
    await AsyncStorage.multiRemove(userDataKeys);
    this.notifyListeners('dataCleared');
    console.log('Local data cleared, notified listeners');
  }

  addListener(listener) {
    this.listeners.add(listener);
  }

  removeListener(listener) {
    this.listeners.delete(listener);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(listener => listener(event, data));
  }
}

export default new AccountSync();