/**
 * PerformanceUtils - Utilities for optimizing application performance
 * Provides memoization and other performance optimization techniques
 */

/**
 * Creates a memoized version of a function
 * @param {Function} fn - Function to memoize
 * @param {Function} keyFn - Optional function to generate cache key
 * @returns {Function} - Memoized function
 */
export const memoize = (fn, keyFn = (...args) => JSON.stringify(args)) => {
  const cache = new Map();
  
  return (...args) => {
    const key = keyFn(...args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  };
};

/**
 * Creates a debounced version of a function
 * @param {Function} fn - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (fn, wait = 100) => {
  let timeout;
  
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
};

/**
 * Creates a throttled version of a function
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (fn, limit = 100) => {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Optimized version of Array.filter that uses Set for faster lookups
 * @param {Array} array - Array to filter
 * @param {Function} predicate - Filter predicate
 * @returns {Array} - Filtered array
 */
export const fastFilter = (array, predicate) => {
  if (!array || array.length === 0) return [];
  
  const result = [];
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i, array)) {
      result.push(array[i]);
    }
  }
  return result;
};

/**
 * Optimized version of Array.find that short-circuits
 * @param {Array} array - Array to search
 * @param {Function} predicate - Search predicate
 * @returns {*} - Found item or undefined
 */
export const fastFind = (array, predicate) => {
  if (!array || array.length === 0) return undefined;
  
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i, array)) {
      return array[i];
    }
  }
  return undefined;
};

/**
 * Creates a cached selector function for Redux-like state
 * @param {Array<Function>} inputSelectors - Input selector functions
 * @param {Function} resultFn - Function to compute result
 * @returns {Function} - Memoized selector
 */
export const createSelector = (inputSelectors, resultFn) => {
  let lastInputs = null;
  let lastResult = null;
  
  return (...args) => {
    const inputs = inputSelectors.map(selector => selector(...args));
    
    // Check if inputs have changed
    if (
      lastInputs === null ||
      inputs.length !== lastInputs.length ||
      inputs.some((input, index) => input !== lastInputs[index])
    ) {
      // Inputs have changed, recompute result
      lastResult = resultFn(...inputs);
      lastInputs = inputs;
    }
    
    return lastResult;
  };
};

/**
 * Batch multiple state updates to prevent unnecessary re-renders
 * @param {Function} callback - Function containing multiple state updates
 */
export const batchUpdates = (callback) => {
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    // Use requestAnimationFrame for batching in browsers
    window.requestAnimationFrame(() => {
      callback();
    });
  } else {
    // Fallback to setTimeout
    setTimeout(callback, 0);
  }
};

/**
 * Optimized version of calculating unique dates from an array of objects
 * @param {Array} array - Array of objects with date property
 * @param {string} dateKey - Key for the date property
 * @returns {Array} - Array of unique dates
 */
export const getUniqueDates = (array, dateKey = 'date') => {
  if (!array || array.length === 0) return [];
  
  const dateSet = new Set();
  const result = [];
  
  for (let i = 0; i < array.length; i++) {
    const date = array[i][dateKey];
    if (date && !dateSet.has(date)) {
      dateSet.add(date);
      result.push(date);
    }
  }
  
  return result;
};

/**
 * Optimized streak calculation that doesn't recalculate the entire history
 * @param {Array} dates - Array of date strings (YYYY-MM-DD)
 * @param {Object} previousResult - Previous calculation result
 * @returns {Object} - Streak information
 */
export const calculateStreaksOptimized = (dates, previousResult = null) => {
  if (!dates || dates.length === 0) {
    return { current: 0, longest: 0, history: [] };
  }
  
  // Sort dates if they're not already sorted
  const sortedDates = [...dates].sort();
  
  // If we have previous results and only added one new date at the end
  if (
    previousResult && 
    previousResult.history.length === sortedDates.length - 1 &&
    sortedDates.slice(0, -1).every((date, i) => date === previousResult.history[i].date)
  ) {
    // We can optimize by just checking the new date
    const lastDate = new Date(sortedDates[sortedDates.length - 2]);
    const newDate = new Date(sortedDates[sortedDates.length - 1]);
    
    // Check if dates are consecutive
    const diffTime = newDate - lastDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive day, extend current streak
      const current = previousResult.current + 1;
      const longest = Math.max(current, previousResult.longest);
      
      // Update history
      const history = [...previousResult.history];
      history.push({ 
        date: sortedDates[sortedDates.length - 1], 
        count: history[history.length - 1].count + 1 
      });
      
      return { current, longest, history };
    }
  }
  
  // Fall back to full calculation if optimization not possible
  return calculateStreaksFull(sortedDates);
};

/**
 * Full streak calculation (used as fallback)
 * @param {Array} sortedDates - Sorted array of date strings
 * @returns {Object} - Streak information
 */
const calculateStreaksFull = (sortedDates) => {
  // Calculate current streak
  let currentStreak = 1;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  // Check if the most recent date is today or yesterday
  const mostRecentDate = sortedDates[sortedDates.length - 1];
  if (mostRecentDate !== today && mostRecentDate !== yesterday) {
    currentStreak = 0;
  } else {
    // Count consecutive days backwards
    for (let i = sortedDates.length - 2; i >= 0; i--) {
      const currentDate = new Date(sortedDates[i + 1]);
      const prevDate = new Date(sortedDates[i]);
      
      // Check if dates are consecutive
      const diffTime = currentDate - prevDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }
  
  // Calculate longest streak
  let longestStreak = 1;
  let tempStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const currentDate = new Date(sortedDates[i]);
    const prevDate = new Date(sortedDates[i - 1]);
    
    // Check if dates are consecutive
    const diffTime = currentDate - prevDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }
  
  // Calculate history
  const history = sortedDates.map((date, index) => {
    if (index === 0) {
      return { date, count: 1 };
    }
    
    const currentDate = new Date(date);
    const prevDate = new Date(sortedDates[index - 1]);
    
    // Check if dates are consecutive
    const diffTime = currentDate - prevDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return { date, count: history[index - 1].count + 1 };
    }
    
    return { date, count: 1 };
  });
  
  return {
    current: currentStreak,
    longest: longestStreak,
    history
  };
};

export default {
  memoize,
  debounce,
  throttle,
  fastFilter,
  fastFind,
  createSelector,
  batchUpdates,
  getUniqueDates,
  calculateStreaksOptimized
};
