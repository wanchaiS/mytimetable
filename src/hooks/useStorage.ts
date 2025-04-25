import {
  SetStateAction,
  useCallback,
  useEffect,
  useSyncExternalStore,
} from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const getSnapshot = () => getLocalStorageItem(key);

  const store = useSyncExternalStore(useLocalStorageSubscribe, getSnapshot);

  const setState = useCallback(
    (v: SetStateAction<T>) => {
      try {
        const nextState =
          typeof v === "function"
            ? (v as (prevState: T) => T)(JSON.parse(store ?? ""))
            : v;

        if (nextState === undefined || nextState === null) {
          removeLocalStorageItem(key);
        } else {
          setLocalStorageItem(key, nextState);
        }
      } catch (e) {
        console.warn(e);
      }
    },
    [key, store],
  );

  useEffect(() => {
    if (
      getLocalStorageItem(key) === null &&
      typeof initialValue !== "undefined"
    ) {
      setLocalStorageItem(key, initialValue);
    }
  }, [key, initialValue]);

  return [store ? JSON.parse(store) : initialValue, setState];
}

const setLocalStorageItem = <T>(key: string, value: T) => {
  const stringifiedValue = JSON.stringify(value);
  window.localStorage.setItem(key, stringifiedValue);
  dispatchStorageEvent(key, stringifiedValue);
};

const getLocalStorageItem = (key: string) => {
  return window.localStorage.getItem(key);
};

const removeLocalStorageItem = (key: string) => {
  window.localStorage.removeItem(key);
  dispatchStorageEvent(key, null);
};

function dispatchStorageEvent(key: string, newValue: string | null) {
  window.dispatchEvent(new StorageEvent("storage", { key, newValue }));
}

const useLocalStorageSubscribe = <T>(
  callback: (this: Window, ev: StorageEvent) => T,
) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

export default useLocalStorage;
