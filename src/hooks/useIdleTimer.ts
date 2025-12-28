import { useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface UseIdleTimerOptions {
  timeout: number; // в миллисекундах
  onIdle: () => void;
  onActive?: () => void;
}

export const useIdleTimer = ({ timeout, onIdle, onActive }: UseIdleTimerOptions) => {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const resetTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setIsIdle(true);
      onIdle();
    }, timeout);

    if (isIdle) {
      setIsIdle(false);
      onActive?.();
    }
  };

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        // Приложение вернулось в активное состояние
        resetTimer();
      } else if (nextAppState.match(/inactive|background/)) {
        // Приложение ушло в фон - останавливаем таймер
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Запускаем таймер при инициализации
    resetTimer();

    return () => {
      subscription?.remove();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeout, onIdle, onActive]);

  return { isIdle, resetTimer };
};
