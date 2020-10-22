import { NativeModules } from 'react-native';

type RodneyBroadcastType = {
  multiply(a: number, b: number): Promise<number>;
};

const { RodneyBroadcast } = NativeModules;

export default RodneyBroadcast as RodneyBroadcastType;
