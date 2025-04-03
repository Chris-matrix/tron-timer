/**
 * StorageManager - A robust utility for handling local storage operations
 * Provides error handling, versioning, storage limit detection, and cross-tab synchronization
 */

// Current data schema version
let CURRENT_VERSION = 1;

// Migration strategies for different versions
let MIGRATION_STRATEGIES = {};

// Maximum localStorage size (conservative estimate in bytes)
const MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Safely access browser APIs
const isBrowser = typeof window !== 'undefined';
const hasCustomEvent = isBrowser && typeof window.CustomEvent === 'function';

// Create a safe version of CustomEvent for use in the module
const createCustomEvent = (name, detail) => {
  if (!isBrowser) return null;
  
  if (hasCustomEvent) {
    return new window.CustomEvent(name, { detail });
  } else if (typeof document !== 'undefined') {
    // Fallback for older browsers
    const event = document.createEvent('CustomEvent');
    event.initCustomEvent(name, true, true, detail);
    return event;
  }
  
  return null;
};

/**
 * Check if localStorage is available
 * @returns {boolean} - Whether localStorage is available
 */
const isStorageAvailable = () => {
  if (!isBrowser) return false;
  
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (_) {
    // Ignore error and return false
    return false;
  }
};

/**
 * Estimate the size of a string in bytes
 * @param {string} str - String to measure
 * @returns {number} - Approximate size in bytes
 */
const getStringSize = (str) => {
  // Quick estimate: 2 bytes per character (UTF-16)
  return str ? str.length * 2 : 0;
};

/**
 * Check if there's enough space in localStorage
 * @param {string} key - Key to store
 * @param {string} value - Value to store
 * @returns {boolean} - Whether there's enough space
 */
const hasEnoughSpace = (key, value) => {
  try {
    // Get current usage
    let currentUsage = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k);
      currentUsage += getStringSize(k) + getStringSize(v);
    }
    
    // Calculate new size (if key already exists, subtract its current size)
    const newItemSize = getStringSize(key) + getStringSize(value);
    const existingItemSize = localStorage.getItem(key) 
      ? getStringSize(key) + getStringSize(localStorage.getItem(key)) 
      : 0;
    
    const totalSize = currentUsage - existingItemSize + newItemSize;
    
    return totalSize < MAX_STORAGE_SIZE;
  } catch (e) {
    console.error('Error checking storage space:', e);
    return false;
  }
};

/**
 * Get the version of stored data
 * @param {string} key - Storage key
 * @returns {number} - Data version or 0 if not found
 */
const getDataVersion = (key) => {
  try {
    const versionKey = `${key}_version`;
    const version = localStorage.getItem(versionKey);
    return version ? parseInt(version, 10) : 0;
  } catch (e) {
    console.error('Error getting data version:', e);
    return 0;
  }
};

/**
 * Set the version of stored data
 * @param {string} key - Storage key
 * @param {number} version - Version number
 */
const setDataVersion = (key, version) => {
  try {
    const versionKey = `${key}_version`;
    localStorage.setItem(versionKey, version.toString());
  } catch (e) {
    console.error('Error setting data version:', e);
  }
};

/**
 * Migrate data from an older version to the current version
 * @param {string} key - Storage key
 * @param {any} data - Data to migrate
 * @param {number} fromVersion - Source version
 * @returns {any} - Migrated data
 */
const migrateData = (key, data, fromVersion) => {
  // Implement migration logic for different versions
  // This is a placeholder for future migrations
  switch (fromVersion) {
    case 0:
      // Migration from unversioned data to version 1
      console.log(`Migrating ${key} data from unversioned to version 1`);
      // Add any necessary transformations here
      return data;
    default:
      return data;
  }
};

/**
 * Store data in localStorage with versioning
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 * @returns {boolean} - Whether the operation was successful
 */
const setItem = (key, data) => {
  if (!isStorageAvailable()) {
    console.error('localStorage is not available');
    return false;
  }
  
  try {
    // Convert data to string
    const serializedData = JSON.stringify(data);
    
    // Check if there's enough space
    if (!hasEnoughSpace(key, serializedData)) {
      console.error('Not enough localStorage space');
      // Dispatch storage limit event
      if (isBrowser) {
        const event = createCustomEvent('storage-limit-reached', { 
          key, 
          size: getStringSize(serializedData) 
        });
        if (event) window.dispatchEvent(event);
      }
      return false;
    }
    
    // Store the data
    localStorage.setItem(key, serializedData);
    
    // Update version
    setDataVersion(key, CURRENT_VERSION);
    
    // Broadcast change to other tabs
    if (isBrowser) {
      const event = createCustomEvent('storage-updated', { 
        key, 
        data, 
        version: CURRENT_VERSION 
      });
      if (event) window.dispatchEvent(event);
    }
    
    return true;
  } catch (e) {
    console.error(`Error storing data for key ${key}:`, e);
    return false;
  }
};

/**
 * Retrieve data from localStorage with version checking
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} - Retrieved data or default value
 */
const getItem = (key, defaultValue = null) => {
  if (!isStorageAvailable()) {
    console.error('localStorage is not available');
    return defaultValue;
  }
  
  try {
    // Get the stored data
    const serializedData = localStorage.getItem(key);
    
    if (serializedData === null) {
      return defaultValue;
    }
    
    // Parse the data
    const data = JSON.parse(serializedData);
    
    // Check version and migrate if necessary
    const version = getDataVersion(key);
    if (version < CURRENT_VERSION) {
      const migratedData = migrateData(key, data, version);
      
      // Save migrated data
      setItem(key, migratedData);
      
      return migratedData;
    }
    
    return data;
  } catch (e) {
    console.error(`Error retrieving data for key ${key}:`, e);
    return defaultValue;
  }
};

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} - Whether the operation was successful
 */
const removeItem = (key) => {
  if (!isStorageAvailable()) {
    console.error('localStorage is not available');
    return false;
  }
  
  try {
    // Remove the data and its version
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}_version`);
    
    // Broadcast removal to other tabs
    if (isBrowser) {
      const event = createCustomEvent('storage-updated', { 
        key, 
        data: null, 
        removed: true 
      });
      if (event) window.dispatchEvent(event);
    }
    
    return true;
  } catch (e) {
    console.error(`Error removing data for key ${key}:`, e);
    return false;
  }
};

/**
 * Clear all app data from localStorage
 * @param {Array<string>} preserveKeys - Keys to preserve
 * @returns {boolean} - Whether the operation was successful
 */
const clearAll = (preserveKeys = []) => {
  if (!isStorageAvailable()) {
    console.error('localStorage is not available');
    return false;
  }
  
  try {
    // If preserveKeys is provided, only remove app keys except those in preserveKeys
    if (preserveKeys.length > 0) {
      // Get all keys that start with app prefix
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!preserveKeys.includes(k)) {
          keysToRemove.push(k);
        }
      }
      
      // Remove each key
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}_version`);
      });
      
      // Broadcast clear event to other tabs
      if (isBrowser) {
        const event = createCustomEvent('storage-cleared', { preserveKeys });
        if (event) window.dispatchEvent(event);
      }
    } else {
      // Clear all localStorage
      localStorage.clear();
      
      // Broadcast clear event to other tabs
      if (isBrowser) {
        const event = createCustomEvent('storage-cleared', { preserveKeys: [] });
        if (event) window.dispatchEvent(event);
      }
    }
    
    return true;
  } catch (e) {
    console.error('Error clearing localStorage:', e);
    return false;
  }
};

/**
 * Set up cross-tab synchronization
 * @param {Function} onExternalChange - Callback for external changes
 * @returns {Function} - Function to remove the event listener
 */
const setupSyncListeners = (onExternalChange) => {
  // Handle storage events from other tabs
  const handleStorageEvent = (event) => {
    if (event.key && onExternalChange) {
      try {
        const newValue = event.newValue ? JSON.parse(event.newValue) : null;
        onExternalChange(event.key, newValue);
      } catch (e) {
        console.error('Error handling storage event:', e);
      }
    }
  };
  
  // Handle custom storage events from this tab
  const handleCustomEvent = (event) => {
    if (event.detail && event.detail.key && onExternalChange) {
      onExternalChange(event.detail.key, event.detail.data);
    }
  };
  
  // Add event listeners
  if (isBrowser) {
    window.addEventListener('storage', handleStorageEvent);
    if (hasCustomEvent) {
      window.addEventListener('storage-updated', handleCustomEvent);
    }
  }
  
  // Return function to remove listeners
  return () => {
    if (isBrowser) {
      window.removeEventListener('storage', handleStorageEvent);
      if (hasCustomEvent) {
        window.removeEventListener('storage-updated', handleCustomEvent);
      }
    }
  };
};

/**
 * Initialize the storage manager with version and migration strategies
 * @param {Object} options - Initialization options
 * @param {string} options.version - Current app version
 * @param {Object} options.migrationStrategies - Migration strategies for different versions
 */
const initialize = (options = {}) => {
  if (options.version) {
    CURRENT_VERSION = options.version;
  }
  
  if (options.migrationStrategies) {
    MIGRATION_STRATEGIES = options.migrationStrategies;
  }
  
  // Check for version mismatches and run migrations if needed
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      // Get all keys
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.endsWith('_version')) {
          keys.push(key);
        }
      }
      
      // Check versions and migrate if needed
      keys.forEach(key => {
        const version = getDataVersion(key);
        if (version && version !== CURRENT_VERSION) {
          migrateData(key, version, CURRENT_VERSION);
        }
      });
    } catch (error) {
      console.error('Error during storage initialization:', error);
    }
  }
};

/**
 * Subscribe to storage changes
 * @param {Function} callback - Function to call when storage changes
 * @returns {Function} - Function to unsubscribe
 */
const subscribe = (callback) => {
  if (!isBrowser) return () => {};
      
  // Add event listener for storage events
  window.addEventListener('storage', callback);
      
  // Add event listener for custom storage events
  if (hasCustomEvent) {
    window.addEventListener('storage-updated', (event) => {
      if (event && event.detail) {
        callback({
          key: event.detail.key,
          newValue: event.detail.data,
          oldValue: null,
          removed: event.detail.removed || false
        });
      }
    });
  }
      
  // Return unsubscribe function
  return () => unsubscribe(callback);
};

/**
 * Unsubscribe from storage changes
 * @param {Function} callback - Function to remove from listeners
 */
const unsubscribe = (callback) => {
  if (!isBrowser) return;
      
  // Remove event listeners
  window.removeEventListener('storage', callback);
      
  if (hasCustomEvent) {
    window.removeEventListener('storage-updated', callback);
  }
};

// Export the storage manager functions
const StorageManager = {
  initialize,
  isAvailable: isStorageAvailable,
  setItem,
  getItem,
  removeItem,
  clearAll,
  setupSyncListeners,
  subscribe,
  unsubscribe,
  CURRENT_VERSION
};

export default StorageManager;
