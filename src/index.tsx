import { NativeEventEmitter, NativeModules } from 'react-native';
import { useCallback, useEffect, useRef } from 'react';

type RodneyBroadcastType = {
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

interface RegisteredListener {
  registrationId: number;
  count: number;
}

const globalListeners = new Map<string, RegisteredListener>();

export interface BroadcastHookProps<T extends Record<string, any>> {
  filterName: string;
  actionNames: (keyof T)[];
  eventName: string;
  category?: string;
  fn: (props: Partial<T>) => Promise<void>;
}

interface BroadcastSenderProps {
  filterName: string;
  category?: string;
}

interface BroadcastHook {
  isRegistered: boolean;
}

interface BroadcastSender {
  sendBroadcast: (message: string, key: string) => Promise<void>;
}

const logDev = (message: string, ...args: any[]) => {
  if (__DEV__) {
    console.log(`[Broadcast] ${message}`, ...args);
  }
};

const logError = (message: string, error: any) => {
  if (__DEV__) {
    console.error(`[Broadcast] ${message}:`, error);
  }
};

export function useBroadcastSender({
  filterName,
  category,
}: BroadcastSenderProps): BroadcastSender {
  return {
    sendBroadcast: useCallback(
      async (message: string, key: string) => {
        try {
          await RodneyBroadcast.sendBroadcast(
            filterName,
            key,
            message,
            category
          );
        } catch (err) {
          logError('Erro ao enviar:', err);
        }
      },
      [filterName, category]
    ),
  };
}

export function useBroadcast<T extends Record<string, any>>({
  eventName,
  actionNames,
  fn,
  filterName,
  category,
}: BroadcastHookProps<T>): BroadcastHook {
  const subscription = useRef<any>(null);
  const isRegisteredRef = useRef(false);
  const listenerKey = useRef(`${filterName}:${eventName}:${category ?? ''}`);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const registerListener = async () => {
      try {
        const key = listenerKey.current;
        let registeredListener = globalListeners.get(key);

        if (!registeredListener) {
          logDev('Registrando listener:', key);
          const registrationId = await RodneyBroadcast.register(
            filterName,
            actionNames.join(';'),
            eventName,
            category
          );

          if (!isMounted || abortController.signal.aborted) return undefined;

          registeredListener = { registrationId, count: 0 };
          globalListeners.set(key, registeredListener);
        }

        registeredListener.count++;
        subscription.current = eventEmitter.addListener(eventName, fn);
        isRegisteredRef.current = true;

        return () => {
          if (subscription.current) {
            subscription.current.remove();
            subscription.current = null;
          }

          const listener = globalListeners.get(key);
          if (listener) {
            listener.count--;

            if (listener.count === 0) {
              logDev('Removendo listener:', key);
              RodneyBroadcast.unregister(listener.registrationId);
              globalListeners.delete(key);
            }
          }
          isRegisteredRef.current = false;
        };
      } catch (error) {
        logError('Erro ao registrar:', error);
        isRegisteredRef.current = false;
        return undefined;
      }
    };

    let cleanup: (() => void) | undefined;
    registerListener().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      isMounted = false;
      abortController.abort();
      cleanup?.();
    };
  }, [filterName, actionNames, eventName, category, fn]);

  return { isRegistered: isRegisteredRef.current };
}
