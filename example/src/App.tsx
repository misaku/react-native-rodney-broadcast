import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, DeviceEventEmitter } from 'react-native';
import RodneyBroadcast from 'react-native-rodney-broadcast';

export default function App() {
  const [resultStatus, setResultStatus] = useState('Aguardando Leitura');
  useEffect(() => {
    RodneyBroadcast.register(
      'app.dsic.barcodetray.BARCODE_BR_DECODING_DATA',
      'EXTRA_BARCODE_DECODED_DATA',
      'RODNEY'
    );

    DeviceEventEmitter.addListener('RODNEY', function (map) {
      setResultStatus(map.data);
    });

    return () => {
      // @ts-ignore
      DeviceEventEmitter.removeListener('RODNEY');
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>{resultStatus}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
