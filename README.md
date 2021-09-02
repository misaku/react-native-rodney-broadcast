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
```jsx

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { createServiceRodneyBroadcast } from 'react-native-rodney-broadcast';

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
    <RodneyBroadcastProvider>
      <Home />
    </RodneyBroadcastProvider>
  );
}
```
## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
