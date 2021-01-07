import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import RodneyBroadcast, {
  createServiceRodneyBroadcast,
} from 'react-native-rodney-broadcast';

const [
  RodneyBroadcastProvider,
  useRodneyBroadcast,
] = createServiceRodneyBroadcast(
  'app.dsic.barcodetray.BARCODE_BR_DECODING_DATA',
  ['EXTRA_BARCODE_DECODED_DATA'],
  'RODNEY'
);

function Home() {
  const { data, clear } = useRodneyBroadcast();
  const handleSimulation = async () => {
    await RodneyBroadcast.simulateEvent(
      'RODNEY',
      'EXTRA_BARCODE_DECODED_DATA',
      'SUCCESS EVENT'
    );
  };
  return (
    <View style={styles.container}>
      <Text>{data?.EXTRA_BARCODE_DECODED_DATA || 'Aguardando Leitura'}</Text>
      <TouchableOpacity onPress={clear}>
        <Text>CLear Data</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSimulation}>
        <Text>Simulator</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function App() {
  return (
    <RodneyBroadcastProvider>
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
