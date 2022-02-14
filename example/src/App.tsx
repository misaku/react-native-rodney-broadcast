import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { createServiceRodneyBroadcast } from 'react-native-rodney-broadcast';

const [RodneyBroadcastProvider, useRodneyBroadcast] =
  createServiceRodneyBroadcast(
    'app.dsic.barcodetray.BARCODE_BR_DECODING_DATA',
    ['EXTRA_BARCODE_DECODED_DATA'],
    'RODNEY'
  );

function Home() {
  const { data, timestamp, clear, sendBroadcast } = useRodneyBroadcast();
  const handleSimulation = async () => {
    await sendBroadcast('SUCCESS EVENT', 'EXTRA_BARCODE_DECODED_DATA');
  };
  const clearData = async () => {
    await clear(async (datax) => {
      console.log({ data, datax });
    });
    console.log({ data });
    Alert.alert('message cleared');
  };
  return (
    <View style={styles.container}>
      <Text>{data?.EXTRA_BARCODE_DECODED_DATA || 'Aguardando Leitura'}</Text>
      <Text>{timestamp}</Text>
      <TouchableOpacity onPress={clearData}>
        <Text>CLear Data</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSimulation}>
        <Text>Simulator</Text>
      </TouchableOpacity>
    </View>
  );
}

function Three() {
  return (
    <View style={styles.container}>
      <Text>Three---[{Date.now()}]</Text>
      <Home />
    </View>
  );
}

function Two() {
  return (
    <View style={styles.container}>
      <Text>Two---[{Date.now()}]</Text>
      <Three />
    </View>
  );
}
function One() {
  return (
    <View style={styles.container}>
      <Text>One---[{Date.now()}]</Text>
      <Two />
    </View>
  );
}
export default function App() {
  return (
    <RodneyBroadcastProvider>
      <One />
    </RodneyBroadcastProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
