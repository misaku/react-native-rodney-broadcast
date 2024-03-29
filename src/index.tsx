import { NativeEventEmitter, NativeModules } from 'react-native';
import create from 'zustand';
import React, { useCallback, useEffect } from 'react';

export type RodneyBroadcastType = {
  register(
    filterName: string,
    actionNames: string,
    eventName: string,
    category?: string
  ): Promise<number>;
  unregister(index: number): Promise<boolean>;
  sendBroadcast(
    actionName: string,
    putExtra: string,
    value: string,
    category?: string
  ): Promise<void>;
  addName(name: string): void;
};

const { RodneyBroadcast: RB } = NativeModules;
const RodneyBroadcast = RB as RodneyBroadcastType;

interface RodneyBroadcastContextData {
  data: any;
  timestamp: number;
  sendBroadcast(message: string, key: string): Promise<void>;
  clear(): void;
}

interface RodneyBroadcastContextDataStore {
  data: any;
  setData: (value: any) => void;
  timestamp: number;
  setTimestamp: (value: number) => void;
  reciverId: number | undefined;
  setReciverId: (value: number | undefined) => void;
  sendBroadcast(message: string, key: string): Promise<void>;
  clear(): void;
}
/**
 * This provider start new reciver and list event
 * @param filterName Sring name used to filter
 * @param actionNames Sring[] names used to map data
 * @param eventName Sring names create event
 * @param category Sring category create event
 *
 * @returns Promise<number>
 */
export function createServiceRodneyBroadcast(
  filterName: string,
  actionNames: string[],
  eventName: string,
  category: string = ''
): [React.FC, () => RodneyBroadcastContextData] {
  const eventEmitter = new NativeEventEmitter(NativeModules.RodneyBroadcast);

  const useRodneyDataStore = create<RodneyBroadcastContextDataStore>(
    (set, get) => ({
      data: null,
      reciverId: undefined,
      timestamp: Date.now(),
      setTimestamp: (value) => {
        set({ timestamp: value });
      },
      setData: (value) => {
        if (get().data !== value) {
          set({ data: value });
        }
        get().setTimestamp(Date.now());
      },
      setReciverId: (value) => {
        set({ reciverId: value });
      },
      sendBroadcast: async (message: string, key: string) => {
        await RodneyBroadcast.sendBroadcast(filterName, key, message, category);
      },
      clear: () => {
        get().setData(null);
      },
    })
  );

  const RodneyBroadcastProvider: React.FC = ({ children }) => {
    const setData = useRodneyDataStore((state) => state.setData);
    const reciverId = useRodneyDataStore((state) => state.reciverId);
    const setReciverId = useRodneyDataStore((state) => state.setReciverId);

    const register = useCallback(async () => {
      if (reciverId === undefined) {
        const idxRegister = await RodneyBroadcast.register(
          filterName,
          actionNames.join(';'),
          eventName,
          category
        );
        setReciverId(idxRegister);
        eventEmitter.addListener(eventName, (map) => {
          setData(map);
        });
      }
    }, [reciverId, setData, setReciverId]);

    const unregister = useCallback(async () => {
      if (reciverId !== undefined) {
        await RodneyBroadcast.unregister(reciverId);
        setReciverId(undefined);
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
