import { DeviceEventEmitter, NativeModules } from 'react-native';
import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  useContext,
} from 'react';

type RodneyBroadcastType = {
  register(
    filterName: string,
    actionName: string,
    eventName: string
  ): Promise<number>;
  unregister(index: number): Promise<boolean>;
};

const { RodneyBroadcast } = NativeModules;

interface RodneyBroadcastContextData {
  data: object;
  clear(): void;
}

const RodneyBroadcastContext = createContext<RodneyBroadcastContextData>(
  {} as RodneyBroadcastContextData
);

interface RodneyInterface {
  filterName: string;
  actionName: string;
  eventName: string;
}

export const RodneyBroadcastProvider: React.FC<RodneyInterface> = ({
  children,
  filterName,
  actionName,
  eventName,
}) => {
  const [data, setData] = useState<any>('' as any);
  const [reciverId, setReciverId] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (reciverId === undefined) {
      const register = async () => {
        const idxRegister = await RodneyBroadcast.register(
          filterName,
          actionName,
          eventName
        );
        setReciverId(idxRegister);
      };
      register();
      DeviceEventEmitter.addListener('RODNEY', function (map) {
        setData(map.data);
      });
    }
    return () => {
      if (reciverId !== undefined) {
        RodneyBroadcast.unregister(reciverId);
        setReciverId(undefined);
      }
      // @ts-ignore
      DeviceEventEmitter.removeListener('RODNEY');
    };
  }, [reciverId, filterName, actionName, eventName]);

  const clear = useCallback(async () => {
    setData('');
  }, []);

  return (
    <RodneyBroadcastContext.Provider value={{ data, clear }}>
      {children}
    </RodneyBroadcastContext.Provider>
  );
};

export function useRodneyBroadcast(): RodneyBroadcastContextData {
  const context = useContext(RodneyBroadcastContext);
  if (!context) {
    throw new Error(
      'useRodneyBroadcast must be used within a RodneyBroadcastProvider'
    );
  }
  return context;
}

export default RodneyBroadcast as RodneyBroadcastType;
