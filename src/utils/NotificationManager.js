/**
 * NotificationManager - A centralized utility for handling notifications
 * Provides a unified interface for both in-app and browser notifications
 * with robust error handling and permission management
 */

// Sound preloading for better performance
const audioCache = new Map();

/**
 * Preload audio files to prevent playback delays
 * @param {string} soundUrl - URL of the sound to preload
 * @returns {Promise<HTMLAudioElement>} - Promise resolving to the audio element
 */
const preloadSound = (soundUrl) => {
  if (audioCache.has(soundUrl)) {
    return Promise.resolve(audioCache.get(soundUrl));
  }
  
  return new Promise((resolve) => {
    try {
      // Create a fallback audio element in case of errors
      const createFallbackAudio = () => {
        try {
          const audio = new Audio();
          audio.volume = 0; // Silent fallback
          return audio;
        } catch (e) {
          console.warn('Could not create fallback audio:', e);
          // Return a dummy object that mimics the Audio interface
          return {
            play: () => Promise.resolve(),
            pause: () => {},
            volume: 0,
            currentTime: 0
          };
        }
      };
      
      const audio = new Audio();
      
      audio.addEventListener('canplaythrough', () => {
        audioCache.set(soundUrl, audio);
        resolve(audio);
      }, { once: true });
      
      audio.addEventListener('error', (error) => {
        console.warn('Error preloading sound:', error);
        // Instead of rejecting, resolve with a fallback audio
        const fallbackAudio = createFallbackAudio();
        audioCache.set(soundUrl, fallbackAudio);
        resolve(fallbackAudio);
      }, { once: true });
      
      audio.src = soundUrl;
      audio.load();
    } catch (error) {
      console.warn('Sound preloading not supported:', error);
      // Create a fallback audio element
      const fallbackAudio = {
        play: () => Promise.resolve(),
        pause: () => {},
        volume: 0,
        currentTime: 0
      };
      audioCache.set(soundUrl, fallbackAudio);
      resolve(fallbackAudio); // Resolve instead of reject
    }
  });
};

/**
 * Check if browser notifications are supported
 * @returns {boolean} - Whether notifications are supported
 */
const isNotificationSupported = () => {
  return 'Notification' in window;
};

/**
 * Get the current notification permission status
 * @returns {string|null} - Current permission status or null if not supported
 */
const getNotificationPermission = () => {
  if (!isNotificationSupported()) {
    return null;
  }
  return Notification.permission;
};

/**
 * Request permission to show browser notifications
 * @returns {Promise<string>} - Promise resolving to the permission status
 */
const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    return Promise.reject(new Error('Notifications not supported'));
  }
  
  // Don't re-request if already granted
  if (Notification.permission === 'granted') {
    return Promise.resolve('granted');
  }
  
  // Don't re-request if already denied (browser policy)
  if (Notification.permission === 'denied') {
    return Promise.reject(new Error('Notification permission denied'));
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return Promise.reject(error);
  }
};

/**
 * Show a browser notification
 * @param {string} title - Notification title
 * @param {Object} options - Notification options
 * @returns {Promise<Notification|null>} - Promise resolving to the notification object
 */
const showBrowserNotification = async (title, options = {}) => {
  if (!isNotificationSupported()) {
    return Promise.reject(new Error('Notifications not supported'));
  }
  
  if (Notification.permission !== 'granted') {
    try {
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        return Promise.reject(new Error(`Notification permission: ${permission}`));
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }
  
  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      ...options
    });
    
    // Handle notification events
    notification.addEventListener('error', (error) => {
      console.error('Notification error:', error);
    });
    
    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
    return Promise.reject(error);
  }
};

/**
 * Play a notification sound
 * @param {string} soundUrl - URL of the sound to play
 * @returns {Promise<HTMLAudioElement|null>} - Promise resolving to the audio element
 */
const playSound = async (soundUrl) => {
  try {
    // Use cached audio if available
    const audio = audioCache.has(soundUrl) 
      ? audioCache.get(soundUrl) 
      : await preloadSound(soundUrl);
    
    // Create a fallback audio if cloning fails
    let audioClone;
    try {
      // Clone the audio to allow multiple simultaneous playback
      audioClone = audio.cloneNode ? audio.cloneNode() : audio;
    } catch (error) {
      console.warn('Error cloning audio, using original:', error);
      audioClone = audio;
    }
    
    // Play the sound with error handling
    try {
      // Set volume to ensure it's audible
      if (audioClone.volume !== undefined) {
        audioClone.volume = 1.0;
      }
      
      // Reset playback position
      if (audioClone.currentTime !== undefined) {
        audioClone.currentTime = 0;
      }
      
      // Play the sound
      const playPromise = audioClone.play ? audioClone.play() : Promise.resolve();
      
      // Handle promise rejection (required for modern browsers)
      if (playPromise && playPromise.catch) {
        playPromise.catch(error => {
          console.warn('Error playing sound:', error);
          // Just log the error, don't reject the promise
        });
      }
    } catch (error) {
      console.warn('Error during audio playback setup:', error);
      // Continue execution, don't throw
    }
    
    return audioClone;
  } catch (error) {
    console.warn('Error in playSound function:', error);
    // Return a dummy audio object instead of rejecting
    return {
      play: () => Promise.resolve(),
      pause: () => {},
      volume: 1.0,
      currentTime: 0
    };
  }
};

/**
 * Main notification function that handles both in-app and browser notifications
 * @param {string} message - Notification message
 * @param {Object} options - Notification options
 * @returns {Promise<Object>} - Promise resolving to notification results
 */
const notify = async (message, options = {}) => {
  const {
    title = 'TRON Focus Timer',
    sound = null,
    showBrowser = true,
    showInApp = true,
    icon = '/favicon.ico',
    ...otherOptions
  } = options;
  
  const results = {
    browser: null,
    sound: null,
    inApp: null
  };
  
  // Handle browser notification
  if (showBrowser) {
    try {
      results.browser = await showBrowserNotification(title, {
        body: message,
        icon,
        ...otherOptions
      });
    } catch (error) {
      console.error('Browser notification failed:', error);
      results.browser = { error };
    }
  }
  
  // Handle sound
  if (sound) {
    try {
      results.sound = await playSound(sound);
    } catch (error) {
      console.error('Sound notification failed:', error);
      results.sound = { error };
    }
  }
  
  // Handle in-app notification (to be implemented by the UI component)
  if (showInApp) {
    results.inApp = { message, title, ...otherOptions };
    // The actual in-app notification will be handled by the UI component
  }
  
  return results;
};

/**
 * Log errors with consistent formatting
 * @param {string} message - Error message
 * @param {Error|any} error - Error object or details
 */
const logError = (message, error) => {
  console.error(`NotificationManager: ${message}`, error);
  
  // Could be extended to log to a service or display in the UI
  return {
    timestamp: new Date().toISOString(),
    message,
    error: error instanceof Error ? error.message : error
  };
};

// Export the notification API
const NotificationManager = {
  notify,
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  preloadSound,
  playSound,
  logError
};

export default NotificationManager;
