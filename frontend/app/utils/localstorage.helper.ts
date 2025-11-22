/**
 * @param key - string key
 * @param value - any value to store
 * @returns void
 */
export const setLocalStorageItem = (key: string, value: any): void => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Error setting localStorage item for key "${key}":`, error);
  }
};

/**
 * @param key - string key
 * @returns T | null
 */
export const getLocalStorageItem = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error getting localStorage item for key "${key}":`, error);
    return null;
  }
};

/**
 * @param key - string key
 * @returns void
 */
export const removeLocalStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage item for key "${key}":`, error);
  }
};

/**
 * @returns void
 */
export const clearLocalStorage = (): void => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};