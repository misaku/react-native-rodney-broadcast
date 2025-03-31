import { NativeEventEmitter, NativeModules } from 'react-native';
import { useEffect, useRef, useCallback } from 'react';

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

const eventEmitter = new NativeEventEmitter(NativeModules.RodneyBroadcast);

export interface RodneyBroadcastHookProps<T extends Record<string, any>> {
  filterName: string;
  actionNames: (keyof T)[];
  eventName: string;
  category?: string;
  fn: (props: Partial<T>) => Promise<void>;
}

interface RodneyBroadcastHook {
  addName: (name: string) => void;
  sendBroadcast: (message: string, key: string) => Promise<void>;
}

export function useRodneyBroadcast<T extends Record<string, any>>({
  eventName,
  actionNames,
  fn,
  filterName,
  category,
}: RodneyBroadcastHookProps<T>): RodneyBroadcastHook {
  const listenerRef = useRef<(() => Promise<void>) | null>(null); // Ref para armazenar o unregister

  const sendBroadcast = useCallback(
    async (message: string, key: string) => {
      await RodneyBroadcast.sendBroadcast(filterName, key, message, category);
    },
    [filterName, category]
  );

  const addName = useCallback((name: string) => {
    RodneyBroadcast.addName(name);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const registerListener = async () => {
      try {
        const idxRegister = await RodneyBroadcast.register(
          filterName,
          actionNames.join(';'),
          eventName,
          category
        );

        if (!isMounted) return;

        eventEmitter.addListener(eventName, fn);

        listenerRef.current = async () => {
          await RodneyBroadcast.unregister(idxRegister);
          eventEmitter.removeListener(eventName, fn);
        };
      } catch (error) {
        console.error('Erro ao registrar Listener no módulo nativo:', error);
      }
    };

    registerListener();

    return () => {
      isMounted = false;
      if (listenerRef.current) {
        listenerRef
          .current()
          .catch((error) =>
            console.error('Erro no Cleanup do listener:', error)
          );
      }
    };
  }, [filterName, actionNames, eventName, category, fn]);

  return { addName, sendBroadcast };
}
