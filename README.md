# react-native-rodney-broadcast

module config broadcast receiver

## Installation

```sh
npm install react-native-rodney-broadcast
```

## Usage

```js
import React, { useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import RodneyBroadcast from 'react-native-rodney-broadcast';

// ...
const [result, setResult] = useState()
const result = await RodneyBroadcast.register('NAME OF INTENTE FILTER','NAME OF PUT EXTRA','NAME OF SERVICE');

 DeviceEventEmitter.addListener('NAME OF SERVICE', function (map) {
      setResult(map.data)
 });
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
