import { useCallback, useEffect, useRef, useState } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    setIsInitialized(true);
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [isInitialized ? storedValue : initialValue, setValue];
}

export function useDebouncedLocalStorage<T>(
  key: string,
  initialValue: T,
  debounceMs: number = 1000
): [T, (value: T) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);
  const pendingValue = useRef<T | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    setIsInitialized(true);
  }, [key]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        if (pendingValue.current !== null) {
          try {
            window.localStorage.setItem(key, JSON.stringify(pendingValue.current));
          } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
          }
        }
      }
    };
  }, [key]);

  const setValue = useCallback(
    (value: T) => {
      setStoredValue(value);
      pendingValue.current = value;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        requestIdleCallback(
          () => {
            try {
              window.localStorage.setItem(key, JSON.stringify(value));
              pendingValue.current = null;
            } catch (error) {
              console.warn(`Error setting localStorage key "${key}":`, error);
            }
          },
          { timeout: 2000 }
        );
      }, debounceMs);
    },
    [key, debounceMs]
  );

  const flushNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (pendingValue.current !== null) {
      try {
        window.localStorage.setItem(key, JSON.stringify(pendingValue.current));
        pendingValue.current = null;
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key]);

  return [isInitialized ? storedValue : initialValue, setValue, flushNow];
}
