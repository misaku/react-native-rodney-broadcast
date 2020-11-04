import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { createServiceRodneyBroadcast } from 'react-native-rodney-broadcast';

const [
  RodneyBroadcastProvider,
  useRodneyBroadcast,
] = createServiceRodneyBroadcast();

function Home() {
  const { data, clear } = useRodneyBroadcast();
  return (
    <View style={styles.container}>
      <Text>{data?.EXTRA_BARCODE_DECODED_DATA || 'Aguardando Leitura'}</Text>
      <TouchableOpacity onPress={clear}>
        <Text>CLear Data</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <RodneyBroadcastProvider
      actionNames={['EXTRA_BARCODE_DECODED_DATA']}
      eventName={'RODNEY'}
      filterName={'app.dsic.barcodetray.BARCODE_BR_DECODING_DATA'}
    >
      <Home />
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
