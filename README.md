# react-native-rodney-broadcast

module config broadcast notification for android and NSNotification for IOS

## Installation

```sh
npm install react-native-rodney-broadcast
```
or
```sh
yarn add react-native-rodney-broadcast
```

## Manual Usage

```js
import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import RodneyBroadcast from 'react-native-rodney-broadcast';

// ...
const [result, setResult] = useState()
const eventEmitter = new NativeEventEmitter(NativeModules.RodneyBroadcast);

RodneyBroadcast.addName(eventName);

const registerId = await RodneyBroadcast.register('NAME OF INTENTE FILTER','NAME OF PUT EXTRA','NAME OF SERVICE');

eventEmitter.addListener('NAME OF SERVICE', function (map) {
      setResult(map.data)
 });

// ...
await eventEmitter.unregister(registerId);
```

## Hooks Usage
```tsx

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  useBroadcast,
  useBroadcastSender,
  BroadcastHookProps,
} from 'react-native-rodney-broadcast';
type EventProps = {
  EXTRA_BARCODE_DECODED_DATA?: string;
};


export default function App() {
  const [barcode, setBarcode] = React.useState<string | undefined>();

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
  const { sendBroadcast } = useBroadcastSender(config);
  useBroadcast(config);

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
      <Text>{barcode?.EXTRA_BARCODE_DECODED_DATA || 'Aguardando Leitura'}</Text>
    </View>
  );
}

```
## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
