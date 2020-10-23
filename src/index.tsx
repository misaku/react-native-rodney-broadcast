import { NativeModules } from 'react-native';

type RodneyBroadcastType = {
  register(
    filterName: string,
    actionName: string,
    eventName: string
  ): Promise<boolean>;
};

const { RodneyBroadcast } = NativeModules;

export default RodneyBroadcast as RodneyBroadcastType;
