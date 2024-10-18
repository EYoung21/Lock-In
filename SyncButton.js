import React, { useContext } from 'react';
import { Button, Text, View } from 'react-native';
import { TotalElapsedContext } from './TotalElapsedContext';

const SyncButton = () => {
  const { manualSync, syncStatus } = useContext(TotalElapsedContext);

  return (
    <View>
      <Button title="Sync Data" onPress={manualSync} />
      {syncStatus ? <Text>{syncStatus}</Text> : null}
    </View>
  );
};

export default SyncButton;