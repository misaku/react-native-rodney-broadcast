# react-native-rodney-broadcast

module config broadcast receiver

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
const registerId = await RodneyBroadcast.register('NAME OF INTENTE FILTER','NAME OF PUT EXTRA','NAME OF SERVICE');

 DeviceEventEmitter.addListener('NAME OF SERVICE', function (map) {
      setResult(map.data)
 });

// ...
await RodneyBroadcast.unregister(registerId);
```

## Hooks Usage
```jsx

import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {
  RodneyBroadcastProvider,
  useRodneyBroadcast,
} from 'react-native-rodney-broadcast';

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
```
## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
