import { NativeEventEmitter, NativeModules } from 'react-native';
import create from 'zustand';
import React, { useCallback, useEffect } from 'react';

type RodneyBroadcastType = {
  register(
    filterName: string,
    actionNames: string,
    eventName: string
  ): Promise<number>;
  unregister(index: number): Promise<boolean>;
  sendBroadcast(
    actionName: String,
    putExtra: String,
    value: String
  ): Promise<void>;
  addName(name: string): void;
};

const { RodneyBroadcast: RB } = NativeModules;
const RodneyBroadcast = RB as RodneyBroadcastType;

interface RodneyBroadcastContextData {
  data: any;
  timestamp: number;

  sendBroadcast(message: string, key: string): Promise<void>;

  clear(callback?: (data: any) => Promise<void>): Promise<void>;
}

interface RodneyBroadcastContextDataStore {
  data: any;
  setData: (
    value: any,
    callback?: (data: any) => Promise<void>
  ) => Promise<void>;
  timestamp: number;
  setTimestamp: (
    value: number,
    callback?: (data: number) => Promise<void>
  ) => Promise<void>;
  reciverId: number | undefined;
  setReciverId: (
    value: number | undefined,
    callback?: (data: number | undefined) => Promise<void>
  ) => Promise<void>;

  sendBroadcast(message: string, key: string): Promise<void>;

  clear(callback?: (data: any) => Promise<void>): Promise<void>;
}

async function forceAwait<T = any>(
  get: () => any,
  name: string,
  value: T,
  callback?: (data: T) => Promise<void>
): Promise<void> {
  return new Promise(async (resolve) => {
    let data: any;
    do {
      data = get()[name];
    } while (data !== value);
    if (data === value) {
      if (callback) await callback(data);
      resolve();
    }
  });
}

export function createServiceRodneyBroadcast(
  filterName: string,
  actionNames: string[],
  eventName: string
): [React.FC, () => RodneyBroadcastContextData] {
  const eventEmitter = new NativeEventEmitter(NativeModules.RodneyBroadcast);

  const useRodneyDataStore = create<RodneyBroadcastContextDataStore>(
    (set, get) => ({
      data: null,
      reciverId: undefined,
      timestamp: Date.now(),
      setTimestamp: async (value, callback) => {
        set({ timestamp: value });
        return forceAwait(get, 'timestamp', value, callback);
      },
      setData: async (value, callback) => {
        set({ data: value });
        await get().setTimestamp(Date.now());
        return forceAwait(get, 'data', value, callback);
      },
      setReciverId: async (value, callback) => {
        set({ reciverId: value });
        return forceAwait(get, 'reciverId', value, callback);
      },
      sendBroadcast: async (message: string, key: string) => {
        await RodneyBroadcast.sendBroadcast(filterName, key, message);
      },
      clear: async (callback) => {
        set({ data: null });
        return forceAwait(get, 'data', null, callback);
      },
    })
  );

  RodneyBroadcast.addName(eventName);
  /**
   * This provider start new reciver and list event
   * @param filterName Sring name used to filter
   * @param actionNames Sring[] names used to map data
   * @param eventName Sring names create event
   *
   * @returns Promise<number>
   */
  const RodneyBroadcastProvider: React.FC = ({ children }) => {
    const setData = useRodneyDataStore((state) => state.setData);
    const reciverId = useRodneyDataStore((state) => state.reciverId);
    const setReciverId = useRodneyDataStore((state) => state.setReciverId);

    const register = useCallback(async () => {
      if (reciverId === undefined) {
        const idxRegister = await RodneyBroadcast.register(
          filterName,
          actionNames.join(';'),
          eventName
        );
        await setReciverId(idxRegister);
        eventEmitter.addListener(eventName, (map) => {
          setData(map);
        });
      }
    }, [reciverId, setData, setReciverId]);

    const unregister = useCallback(async () => {
      if (reciverId !== undefined) {
        await RodneyBroadcast.unregister(reciverId);
        await setReciverId(undefined);
        eventEmitter.removeListener(eventName, function () {
          console.log('Remove event');
        });
      }
    }, [reciverId, setReciverId]);

    useEffect(() => {
      register();
      return () => {
        unregister();
      };
    }, [register, unregister]);

    return <>{children}</>;
  };

  /**
   * This hooks return data and clear
   * @returns {data: any, clear:()=>void}
   */
  function useRodneyBroadcast(): RodneyBroadcastContextData {
    return {
      data: useRodneyDataStore((state) => state.data),
      timestamp: useRodneyDataStore((state) => state.timestamp),
      clear: useRodneyDataStore((state) => state.clear),
      sendBroadcast: useRodneyDataStore((state) => state.sendBroadcast),
    };
  }

  return [RodneyBroadcastProvider, useRodneyBroadcast];
}

export default RodneyBroadcast;
