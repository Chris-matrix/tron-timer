/**
 * TimerManager - An advanced high-precision timer utility
 * 
 * Features:
 * - Uses requestAnimationFrame for more precise timing
 * - Handles background tabs using Page Visibility API
 * - Detects interruptions (tab switching, browser minimizing)
 * - Implements focus/blur event handling
 * - Provides state recovery for unexpected browser closures
 */

// Safely access browser APIs
const isBrowser = typeof window !== 'undefined';
const hasPerformance = isBrowser && typeof window.performance !== 'undefined' && typeof window.performance.now === 'function';
const hasRAF = isBrowser && typeof window.requestAnimationFrame === 'function' && typeof window.cancelAnimationFrame === 'function';
const hasVisibility = isBrowser && typeof document !== 'undefined' && typeof document.visibilityState !== 'undefined';
const hasLocalStorage = isBrowser && typeof window.localStorage !== 'undefined';

/**
 * Get high-resolution time safely
 * @returns {number} Current time in milliseconds
 */
const getHighResTime = () => {
  return hasPerformance ? window.performance.now() : Date.now();
};

/**
 * Storage key for timer state
 * @type {string}
 */
const TIMER_STATE_KEY = 'tron_timer_state';

/**
 * Creates a high-precision timer using requestAnimationFrame
 * Provides better accuracy than setTimeout and handles browser throttling
 */
class PrecisionTimer {
  /**
   * Create a new precision timer
   * @param {Function} callback - Function to call on each tick
   * @param {number} interval - Interval in milliseconds
   */
  constructor(callback, interval) {
    // Core timer properties
    this.callback = callback;
    this.interval = interval;
    this.rafId = null;
    this.isRunning = false;
    this.isPaused = false;
    
    // Time tracking
    this.startTime = 0;
    this.lastTickTime = 0;
    this.pauseTime = 0;
    this.pauseDuration = 0;
    this.elapsedTime = 0;
    this.lastTimestamp = 0;
    
    // Visibility and focus tracking
    this.wasHidden = false;
    this.backgroundStartTime = 0;
    this.lastVisibilityChange = 0;
    this._wasInterrupted = false;
    this.focusEvents = [];
    this.interruptionThreshold = 1000; // 1 second threshold for interruption
    
    // Bind methods to maintain context
    this.tick = this.tick.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.saveState = this.saveState.bind(this);
    
    // Add event listeners for visibility and focus
    if (hasVisibility) {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
    
    if (isBrowser) {
      window.addEventListener('focus', this.handleFocus);
      window.addEventListener('blur', this.handleBlur);
      window.addEventListener('beforeunload', this.saveState);
    }
  }
  
  /**
   * Start the timer
   * @param {boolean} [fromSavedState=false] - Whether starting from a saved state
   */
  start(fromSavedState = false) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.isPaused = false;
    
    if (!fromSavedState) {
      this._wasInterrupted = false;
      this.pauseDuration = 0;
      this.startTime = getHighResTime();
      this.lastTickTime = this.startTime;
      this.elapsedTime = 0;
    }
    
    // Start the animation frame loop
    this.lastTimestamp = getHighResTime();
    this.scheduleNextTick();
  }
  
  /**
   * Schedule the next tick using requestAnimationFrame or setTimeout as fallback
   */
  scheduleNextTick() {
    if (!this.isRunning || this.isPaused) return;
    
    if (hasRAF) {
      this.rafId = window.requestAnimationFrame(this.tick);
    } else {
      // Fallback to setTimeout if requestAnimationFrame is not available
      this.rafId = setTimeout(this.tick, this.interval);
    }
  }
  
  /**
   * Execute a single tick of the timer
   * @param {number} [timestamp] - Current timestamp from requestAnimationFrame
   */
  tick(timestamp) {
    if (!this.isRunning || this.isPaused) return;
    
    const now = timestamp || getHighResTime();
    const deltaTime = now - this.lastTimestamp;
    
    // Only execute if enough time has passed (respecting the interval)
    if (deltaTime >= this.interval) {
      // Calculate how many intervals have passed (usually 1, but could be more if browser throttled)
      const intervalsElapsed = Math.floor(deltaTime / this.interval);
      
      // Call the callback for each elapsed interval
      for (let i = 0; i < intervalsElapsed; i++) {
        this.callback();
      }
      
      // Update the last tick time
      this.lastTickTime = now;
      this.lastTimestamp = now - (deltaTime % this.interval);
      this.elapsedTime += deltaTime;
    }
    
    // Schedule the next tick
    this.scheduleNextTick();
  }
  
  /**
   * Pause the timer
   */
  pause() {
    if (!this.isRunning || this.isPaused) return;
    
    this.isPaused = true;
    this.pauseTime = getHighResTime();
    
    // Cancel the animation frame
    if (hasRAF) {
      window.cancelAnimationFrame(this.rafId);
    } else {
      clearTimeout(this.rafId);
    }
    
    // Save state when paused
    this.saveState();
  }
  
  /**
   * Resume the timer
   */
  resume() {
    if (!this.isRunning || !this.isPaused) return;
    
    this.isPaused = false;
    
    // Calculate the pause duration
    const now = getHighResTime();
    this.pauseDuration += now - this.pauseTime;
    
    // Reset the last timestamp to now
    this.lastTimestamp = now;
    
    // Restart the animation frame loop
    this.scheduleNextTick();
  }
  
  /**
   * Stop the timer
   */
  stop() {
    this.isRunning = false;
    this.isPaused = false;
    
    // Cancel the animation frame
    if (hasRAF) {
      window.cancelAnimationFrame(this.rafId);
    } else {
      clearTimeout(this.rafId);
    }
    
    // Clear saved state
    if (hasLocalStorage) {
      localStorage.removeItem(TIMER_STATE_KEY);
    }
  }
  
  /**
   * Reset the timer
   * @param {number} [_newDuration] - New duration in seconds (unused parameter)
   */
  reset(_newDuration) {
    this.stop();
    this.pauseDuration = 0;
    this._wasInterrupted = false;
    this.startTime = getHighResTime();
    this.elapsedTime = 0;
    this.focusEvents = [];
    
    // Clear saved state
    if (hasLocalStorage) {
      localStorage.removeItem(TIMER_STATE_KEY);
    }
  }
  
  /**
   * Handle visibility change events (tab focus/blur)
   * This is the primary method for detecting when the user switches tabs
   */
  handleVisibilityChange() {
    if (!hasVisibility) return;
    
    const now = getHighResTime();
    const isHidden = document.visibilityState === 'hidden';
    
    if (isHidden) {
      // Tab is hidden
      this.wasHidden = true;
      this.backgroundStartTime = now;
      
      // Record the interruption if the timer is running
      if (this.isRunning && !this.isPaused) {
        this._wasInterrupted = true;
        
        // Add to focus events log
        this.focusEvents.push({
          type: 'visibility',
          action: 'hidden',
          timestamp: now,
          timerState: {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            elapsedTime: this.elapsedTime
          }
        });
        
        // Save state when hidden
        this.saveState();
      }
    } else if (this.wasHidden) {
      // Tab is visible again after being hidden
      const hiddenTime = now - this.backgroundStartTime;
      this.lastVisibilityChange = now;
      
      // Add to focus events log
      this.focusEvents.push({
        type: 'visibility',
        action: 'visible',
        timestamp: now,
        duration: hiddenTime,
        timerState: {
          isRunning: this.isRunning,
          isPaused: this.isPaused,
          elapsedTime: this.elapsedTime
        }
      });
      
      // Update the last timestamp to avoid drift when coming back to the tab
      if (this.isRunning && !this.isPaused) {
        this.lastTimestamp = now;
      }
    }
  }
  
  /**
   * Handle window focus events
   * This detects when the user focuses back on the browser window
   */
  handleFocus() {
    const now = getHighResTime();
    
    this.focusEvents.push({
      type: 'window',
      action: 'focus',
      timestamp: now,
      timerState: {
        isRunning: this.isRunning,
        isPaused: this.isPaused,
        elapsedTime: this.elapsedTime
      }
    });
    
    // If returning from a significant time away, consider it an interruption
    if (this.isRunning && !this.isPaused && this.lastTimestamp > 0) {
      const timeSinceLastTick = now - this.lastTimestamp;
      if (timeSinceLastTick > this.interruptionThreshold) {
        this._wasInterrupted = true;
        this.lastTimestamp = now; // Reset to avoid drift
      }
    }
  }
  
  /**
   * Handle window blur events
   * This detects when the user clicks away from the browser window
   */
  handleBlur() {
    const now = getHighResTime();
    
    this.focusEvents.push({
      type: 'window',
      action: 'blur',
      timestamp: now,
      timerState: {
        isRunning: this.isRunning,
        isPaused: this.isPaused,
        elapsedTime: this.elapsedTime
      }
    });
    
    // Mark as interrupted if the timer is running
    if (this.isRunning && !this.isPaused) {
      this._wasInterrupted = true;
      
      // Save state when blurred
      this.saveState();
    }
  }
  
  /**
   * Save the current timer state to localStorage
   * This allows recovery if the browser is closed unexpectedly
   */
  saveState() {
    if (!hasLocalStorage || !this.isRunning) return;
    
    try {
      const state = {
        isRunning: this.isRunning,
        isPaused: this.isPaused,
        startTime: this.startTime,
        lastTickTime: this.lastTickTime,
        pauseTime: this.pauseTime,
        pauseDuration: this.pauseDuration,
        elapsedTime: this.elapsedTime,
        wasInterrupted: this._wasInterrupted,
        savedAt: getHighResTime(),
        interval: this.interval
      };
      
      localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  }
  
  /**
   * Load the timer state from localStorage
   * @returns {Object|null} The saved timer state or null if none exists
   */
  loadState() {
    if (!hasLocalStorage) return null;
    
    try {
      const stateJson = localStorage.getItem(TIMER_STATE_KEY);
      if (!stateJson) return null;
      
      const state = JSON.parse(stateJson);
      const now = getHighResTime();
      
      // Calculate time elapsed since the state was saved
      const timeSinceSave = now - state.savedAt;
      
      // Update the state with the elapsed time
      this.isRunning = state.isRunning;
      this.isPaused = state.isPaused;
      this.startTime = state.startTime;
      this.lastTickTime = now;
      this.pauseTime = state.isPaused ? now : state.pauseTime;
      this.pauseDuration = state.pauseDuration;
      this.elapsedTime = state.elapsedTime + (state.isRunning && !state.isPaused ? timeSinceSave : 0);
      this._wasInterrupted = true; // Always mark as interrupted when recovering
      
      return {
        ...state,
        timeSinceSave
      };
    } catch (error) {
      console.error('Error loading timer state:', error);
      return null;
    }
  }
  
  /**
   * Check if the timer was interrupted (e.g., by tab switching)
   * @returns {boolean} Whether the timer was interrupted
   */
  wasInterrupted() {
    return this._wasInterrupted;
  }
  
  /**
   * Get focus events history
   * @returns {Array} Array of focus/blur events
   */
  getFocusEvents() {
    return [...this.focusEvents];
  }
  
  /**
   * Get total time spent in background
   * @returns {number} Total background time in milliseconds
   */
  getBackgroundTime() {
    return this.focusEvents.reduce((total, event) => {
      if (event.duration) {
        return total + event.duration;
      }
      return total;
    }, 0);
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    this.stop();
    
    // Remove event listeners
    if (hasVisibility) {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    
    if (isBrowser) {
      window.removeEventListener('focus', this.handleFocus);
      window.removeEventListener('blur', this.handleBlur);
      window.removeEventListener('beforeunload', this.saveState);
    }
  }
}

/**
 * Create a countdown timer with advanced features
 * @param {Object} options - Timer options
 * @param {number} options.duration - Duration in seconds
 * @param {Function} options.onTick - Callback for each tick
 * @param {Function} options.onComplete - Callback when timer completes
 * @param {Function} options.onInterruption - Callback when timer is interrupted
 * @param {number} [options.tickInterval=1000] - Tick interval in milliseconds
 * @returns {Object} - Timer control object
 */
const createCountdownTimer = ({
  duration,
  onTick,
  onComplete,
  onInterruption,
  tickInterval = 1000
}) => {
  let timeLeft = duration;
  let timer = null;
  let interruptionCheckInterval = null;
  
  /**
   * Tick handler called on each interval
   */
  const tick = () => {
    timeLeft -= 1;
    
    if (onTick) {
      onTick(timeLeft);
    }
    
    if (timeLeft <= 0) {
      timer.stop();
      clearInterval(interruptionCheckInterval);
      
      if (onComplete) {
        onComplete();
      }
    }
  };
  
  // Create the precision timer
  timer = new PrecisionTimer(tick, tickInterval);
  
  // Try to recover state if available
  const savedState = timer.loadState();
  if (savedState && savedState.isRunning) {
    // Calculate how much time has passed since the state was saved
    const secondsElapsed = Math.floor(savedState.timeSinceSave / 1000);
    timeLeft = Math.max(0, duration - secondsElapsed);
    
    // Notify about the interruption
    if (onInterruption) {
      onInterruption();
    }
    
    // If there's still time left, resume the timer
    if (timeLeft > 0) {
      if (savedState.isPaused) {
        timer.start(true);
        timer.pause();
      } else {
        timer.start(true);
      }
      
      // Update the display immediately
      if (onTick) {
        onTick(timeLeft);
      }
    } else {
      // Timer would have completed while away
      if (onComplete) {
        onComplete();
      }
    }
  }
  
  // Set up a periodic check for interruptions
  interruptionCheckInterval = setInterval(() => {
    if (timer.wasInterrupted() && onInterruption) {
      onInterruption();
    }
  }, 1000);
  
  return {
    start: () => timer.start(),
    pause: () => timer.pause(),
    resume: () => timer.resume(),
    stop: () => {
      timer.stop();
      clearInterval(interruptionCheckInterval);
    },
    reset: (newDuration = duration) => {
      timer.stop();
      timeLeft = newDuration;
      if (onTick) {
        onTick(timeLeft);
      }
    },
    getTimeLeft: () => timeLeft,
    isRunning: () => timer.isRunning,
    isPaused: () => timer.isPaused,
    wasInterrupted: () => timer.wasInterrupted(),
    getFocusEvents: () => timer.getFocusEvents(),
    getBackgroundTime: () => timer.getBackgroundTime(),
    destroy: () => {
      timer.destroy();
      clearInterval(interruptionCheckInterval);
    }
  };
};

/**
 * Check if a timer state exists in storage
 * @returns {boolean} Whether a saved timer state exists
 */
const hasSavedTimerState = () => {
  if (!hasLocalStorage) return false;
  
  try {
    return localStorage.getItem(TIMER_STATE_KEY) !== null;
  } catch (error) {
    console.error('Error checking for saved timer state:', error);
    return false;
  }
};

/**
 * Clear any saved timer state
 * @returns {boolean} Whether the operation was successful
 */
const clearSavedTimerState = () => {
  if (!hasLocalStorage) return false;
  
  try {
    localStorage.removeItem(TIMER_STATE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing saved timer state:', error);
    return false;
  }
};

// Export the timer API
const TimerManager = {
  createCountdownTimer,
  hasSavedTimerState,
  clearSavedTimerState
};

export default TimerManager;
