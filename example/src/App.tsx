import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  useRodneyBroadcast,
  RodneyBroadcastHookProps,
} from 'react-native-rodney-broadcast';
type EventProps = {
  EXTRA_BARCODE_DECODED_DATA?: string;
};

function Home() {
  const [barcode, setBarcode] = React.useState<string | undefined>();
  const [timestamp, setTime] = React.useState<string>(Date.now().toString());

  const config: RodneyBroadcastHookProps<EventProps> = useMemo(
    () => ({
      filterName: 'com.rodney.action',
      actionNames: ['EXTRA_BARCODE_DECODED_DATA'],
      eventName: 'RODNEY',
      category: 'com.rodney.category',
      fn: async (data) => {
        setBarcode(data?.EXTRA_BARCODE_DECODED_DATA);
        setTime(Date.now().toString());
      },
    }),
    []
  );

  const { sendBroadcast } = useRodneyBroadcast<EventProps>(config);
  const handleSimulation = async () => {
    await sendBroadcast(
      `SUCCESS EVENT ${Date.now()}`,
      'EXTRA_BARCODE_DECODED_DATA'
    );
  };

  const clearData = () => {
    setBarcode(undefined);
  };

  return (
    <View style={styles.container}>
      <Text>{barcode || 'Aguardando Leitura'}</Text>
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
  const [mount, setMount] = useState(false);
  const changeMount = () => setMount((prev) => !prev);
  return (
    <View style={styles.container}>
      <Text>Three---[{Date.now()}]</Text>
      {mount && <Home />}
      <TouchableOpacity onPress={changeMount}>
        <Text>{mount ? 'Unmount' : 'Mount'}</Text>
      </TouchableOpacity>
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

export default function App() {
  return (
    <View style={styles.container}>
      <Text>One---[{Date.now()}]</Text>
      <Two />
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
