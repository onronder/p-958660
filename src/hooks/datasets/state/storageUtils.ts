/**
 * Utility functions for dataset state storage management
 */

/**
 * Get a stored state value from session storage
 */
export const getStoredState = <T>(key: string, defaultValue: T): T => {
  try {
    // First check the backup value directly
    const backupKey = `dataset_${key}_backup`;
    const backupValue = sessionStorage.getItem(backupKey);
    
    if (backupValue) {
      // If we have a backup value, use it and also save it to the regular key
      const parsedValue = JSON.parse(backupValue);
      sessionStorage.setItem(`dataset_${key}`, JSON.stringify(parsedValue));
      console.log(`Retrieved ${key} from backup:`, parsedValue);
      return parsedValue;
    }
    
    // Otherwise use the regular stored value
    const stored = sessionStorage.getItem(`dataset_${key}`);
    if (stored) {
      const parsedValue = JSON.parse(stored);
      console.log(`Retrieved ${key} from session storage:`, parsedValue);
      return parsedValue;
    }
    
    return defaultValue;
  } catch (error) {
    console.error(`Error retrieving stored state for ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Store a state value in session storage with backup
 */
export const setStoredState = <T>(key: string, value: T): T => {
  try {
    const valueStr = JSON.stringify(value);
    
    // Store in both regular and backup locations
    sessionStorage.setItem(`dataset_${key}`, valueStr);
    sessionStorage.setItem(`dataset_${key}_backup`, valueStr);
    
    console.log(`Stored ${key} in session storage:`, value);
  } catch (error) {
    console.error(`Error storing state for ${key}:`, error);
  }
  return value;
};

/**
 * Clear all dataset-related values from session storage
 */
export const clearStoredState = (): void => {
  // Clear all stored dataset state
  Object.keys(sessionStorage).forEach(key => {
    if (key.startsWith('dataset_')) {
      sessionStorage.removeItem(key);
    }
  });
};
