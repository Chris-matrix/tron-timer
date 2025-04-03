/**
 * TimerManager - A high-precision timer utility
 * Provides more accurate timing than setInterval and handles background tab behavior
 */

// Safely access browser APIs
const isBrowser = typeof window !== 'undefined';
const hasPerformance = isBrowser && typeof window.performance !== 'undefined' && typeof window.performance.now === 'function';

/**
 * Get high-resolution time safely
 * @returns {number} Current time in milliseconds
 */
const getHighResTime = () => {
  return hasPerformance ? 
    window.performance.now() : 
    Date.now();
};

/**
 * Creates a high-precision timer that adjusts for drift
 * @param {Function} callback - Function to call on each tick
 * @param {number} interval - Interval in milliseconds
 * @returns {Object} - Timer control object
 */
class PrecisionTimer {
  constructor(callback, interval) {
    this.callback = callback;
    this.interval = interval;
    this.expected = 0;
    this.timeout = null;
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = 0;
    this.pauseTime = 0;
    this.pauseDuration = 0;
    this.wasHidden = false;
    this.lastVisibilityChange = 0;
    this.backgroundStartTime = 0;
    this._wasInterrupted = false;
    
    // Bind methods
    this.step = this.step.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    
    // Add visibility change listener
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }
  
  /**
   * Start the timer
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.isPaused = false;
    this._wasInterrupted = false;
    this.pauseDuration = 0;
    
    // Set the expected time for the next tick
    this.expected = getHighResTime() + this.interval;
    this.startTime = getHighResTime();
    
    // Start the timer
    this.timeout = setTimeout(this.step, this.interval);
  }
  
  /**
   * Execute a single step of the timer
   */
  step() {
    if (!this.isRunning || this.isPaused) return;
    
    // Calculate drift and adjust the next interval
    const now = getHighResTime();
    const drift = now - this.expected;
    const adjustedInterval = Math.max(0, this.interval - drift);
    
    // Call the callback
    this.callback();
    
    // Set the expected time for the next tick
    this.expected = now + this.interval;
    
    // Schedule the next tick
    this.timeout = setTimeout(this.step, adjustedInterval);
  }
  
  /**
   * Pause the timer
   */
  pause() {
    if (!this.isRunning || this.isPaused) return;
    
    this.isPaused = true;
    this.pauseTime = getHighResTime();
    
    // Clear the timeout
    clearTimeout(this.timeout);
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
    
    // Adjust the expected time
    this.expected = now + this.interval;
    
    // Restart the timer
    this.timeout = setTimeout(this.step, this.interval);
  }
  
  /**
   * Stop the timer
   */
  stop() {
    this.isRunning = false;
    this.isPaused = false;
    
    // Clear the timeout
    clearTimeout(this.timeout);
  }
  
  /**
   * Reset the timer
   */
  reset() {
    this.stop();
    this.pauseDuration = 0;
    this._wasInterrupted = false;
    this.startTime = getHighResTime();
  }
  
  /**
   * Handle visibility change events (tab focus/blur)
   */
  handleVisibilityChange() {
    if (typeof document === 'undefined') return;
    
    const now = getHighResTime();
    
    if (document.hidden) {
      // Tab is hidden
      this.wasHidden = true;
      this.backgroundStartTime = now;
      
      // Mark as interrupted but don't pause automatically
      if (this.isRunning && !this.isPaused) {
        this._wasInterrupted = true;
      }
    } else if (this.wasHidden) {
      // Tab is visible again after being hidden
      const hiddenTime = now - this.backgroundStartTime;
      this.lastVisibilityChange = now;
      
      // Update the expected time to avoid drift when coming back to the tab
      if (this.isRunning && !this.isPaused) {
        this.expected = now + this.interval;
      }
    }
  }
  
  /**
   * Check if the timer was interrupted (e.g., by tab switching)
   */
  wasInterrupted() {
    return this._wasInterrupted;
  }
  
  /**
   * Clean up resources
   */
  destroy() {
    this.stop();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }
}

/**
 * Create a countdown timer
 * @param {Object} options - Timer options
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
  
  const tick = () => {
    timeLeft -= 1;
    
    if (onTick) {
      onTick(timeLeft);
    }
    
    if (timeLeft <= 0) {
      timer.stop();
      
      if (onComplete) {
        onComplete();
      }
    }
  };
  
  timer = new PrecisionTimer(tick, tickInterval);
  
  // Set up a periodic check for interruptions
  const checkInterruption = setInterval(() => {
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
      clearInterval(checkInterruption);
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
    wasInterrupted: () => timer.wasInterrupted(),
    destroy: () => {
      timer.destroy();
      clearInterval(checkInterruption);
    }
  };
};

// Export the timer API
const TimerManager = {
  createCountdownTimer
};

export default TimerManager;
