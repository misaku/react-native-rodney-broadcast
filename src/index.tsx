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
    actionNames: string[],
    eventName: string
  ): Promise<number>;
  unregister(index: number): Promise<boolean>;
};

const { RodneyBroadcast } = NativeModules;

interface RodneyBroadcastContextData {
  data: any;
  clear(): void;
}

export function createServiceRodneyBroadcast(
  filterName: string,
  actionNames: string[],
  eventName: string
): [React.FC, () => RodneyBroadcastContextData] {
  const RodneyBroadcastContext = createContext<RodneyBroadcastContextData>(
    {} as RodneyBroadcastContextData
  );
  /**
   * This provider start new reciver and list event
   * @param filterName Sring name used to filter
   * @param actionNames Sring[] names used to map data
   * @param eventName Sring names create event
   *
   * @returns Promise<number>
   */
  const RodneyBroadcastProvider: React.FC = ({ children }) => {
    const [data, setData] = useState<any>(null as any);
    const [reciverId, setReciverId] = useState<number | undefined>(undefined);
    useEffect(() => {
      if (reciverId === undefined) {
        const register = async () => {
          const idxRegister = await RodneyBroadcast.register(
            filterName,
            actionNames.join(';'),
            eventName
          );
          setReciverId(idxRegister);
        };
        register();
        DeviceEventEmitter.addListener(eventName, function (map) {
          setData(map);
        });
      }
      return () => {
        if (reciverId !== undefined) {
          RodneyBroadcast.unregister(reciverId);
          setReciverId(undefined);
        }
        // @ts-ignore
        DeviceEventEmitter.removeListener(eventName);
      };
    }, [reciverId]);

    const clear = useCallback(async () => {
      setData(null);
    }, []);

    return (
      <RodneyBroadcastContext.Provider value={{ data, clear }}>
        {children}
      </RodneyBroadcastContext.Provider>
    );
  };

  /**
   * This hooks return data and clear
   * @returns {data: any, clear:()=>void}
   */
  function useRodneyBroadcast(): RodneyBroadcastContextData {
    const context = useContext(RodneyBroadcastContext);
    if (!context) {
      throw new Error(
        'useRodneyBroadcast must be used within a RodneyBroadcastProvider'
      );
    }
    return context;
  }
  return [RodneyBroadcastProvider, useRodneyBroadcast];
}
export default RodneyBroadcast as RodneyBroadcastType;
