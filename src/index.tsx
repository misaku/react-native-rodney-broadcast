import { DeviceEventEmitter, NativeModules } from 'react-native';
import React, {
  createContext,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

type Callback<T> = (value?: T) => void;
type DispatchWithCallback<T> = (value: T, callback?: Callback<T>) => void;

function useStateCallback<T>(
  initialState: T | (() => T)
): [T, DispatchWithCallback<SetStateAction<T>>] {
  const [state, _setState] = useState(initialState);

  const callbackRef = useRef<Callback<T>>();
  const isFirstCallbackCall = useRef<boolean>(true);

  const setState = useCallback(
    (setStateAction: SetStateAction<T>, callback?: Callback<T>): void => {
      callbackRef.current = callback;
      _setState(setStateAction);
    },
    []
  );

  useEffect(() => {
    if (isFirstCallbackCall.current) {
      isFirstCallbackCall.current = false;
      return;
    }
    callbackRef.current?.(state);
  }, [state]);

  return [state, setState];
}

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
};

const { RodneyBroadcast: RB } = NativeModules;
const RodneyBroadcast = RB as RodneyBroadcastType;
interface RodneyBroadcastContextData {
  data: any;
  sendBroadcast(message: string, key: string): Promise<void>;
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
    const [data, setData] = useStateCallback<any>(null as any);
    const [reciverId, setReciverId] = useState<number | undefined>(undefined);
    const register = useCallback(async () => {
      if (reciverId === undefined) {
        const idxRegister = await RodneyBroadcast.register(
          filterName,
          actionNames.join(';'),
          eventName
        );
        setReciverId(idxRegister);
        DeviceEventEmitter.addListener(eventName, function (map) {
          setData(map);
        });
      }
    }, [reciverId, setData]);
    const unregister = useCallback(async () => {
      if (reciverId !== undefined) {
        await RodneyBroadcast.unregister(reciverId);
        setReciverId(undefined);
        DeviceEventEmitter.removeListener(eventName, function () {
          console.log('Remove event');
        });
      }
    }, [reciverId]);
    useEffect(() => {
      register();
      return () => {
        unregister();
      };
    }, [register, unregister]);
    const sendBroadcast = useCallback(async (message: string, key: string) => {
      await RodneyBroadcast.sendBroadcast(filterName, key, message);
    }, []);
    const clear = useCallback(
      async (callback?: Callback<any>): Promise<void> => {
        return new Promise((resolve) => {
          if (data) {
            setData(null, () => {
              if (callback) callback();
              resolve();
            });
          } else {
            if (callback) callback();
            resolve();
          }
        });
      },
      [data, setData]
    );

    return (
      <RodneyBroadcastContext.Provider value={{ data, clear, sendBroadcast }}>
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

export default RodneyBroadcast;
