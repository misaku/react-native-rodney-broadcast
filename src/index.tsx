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
  const listenerRef = useRef<(() => Promise<void>) | null>(null); // Ref para armazenar cleanup
  const controllerRef = useRef<AbortController | null>(null); // AbortController para gerenciamento

  // Função para enviar broadcast
  const sendBroadcast = useCallback(
    async (message: string, key: string) => {
      try {
        await RodneyBroadcast.sendBroadcast(filterName, key, message, category);
      } catch (err) {
        console.error(`[RodneyBroadcast] Erro ao enviar broadcast`, err);
      }
    },
    [filterName, category]
  );

  // Função para adicionar nome
  const addName = useCallback(
    (name: string) => RodneyBroadcast.addName(name),
    [] // Não depende de nada
  );

  useEffect(() => {
    controllerRef.current = new AbortController(); // Abortar ações pendentes
    const { signal } = controllerRef.current;

    const registerListener = async () => {
      try {
        const idxRegister = await RodneyBroadcast.register(
          filterName,
          actionNames.join(';'),
          eventName,
          category
        );

        // Verifica se foi desmontado
        if (signal.aborted) return;

        // Adiciona listener do EventEmitter
        const existingListeners = eventEmitter.listeners(eventName);
        if (!existingListeners.includes(fn)) {
          eventEmitter.addListener(eventName, fn);
        }

        // Define função de cleanup
        listenerRef.current = async () => {
          await RodneyBroadcast.unregister(idxRegister);
          eventEmitter.removeListener(eventName, fn);
        };
      } catch (error) {
        if (!signal.aborted) {
          console.error('[RodneyBroadcast] Erro ao registrar Listener:', error);
        }
      }
    };

    // Registrar Listener
    registerListener();

    return () => {
      // Realizar limpeza
      controllerRef.current?.abort();
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
