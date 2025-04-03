import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import StorageManager from '../utils/StorageManager';

// Create context
const DataContext = createContext();

// Define available themes and characters
export const AVAILABLE_THEMES = {
  tron: {
    primary: '#00f6ff',
    secondary: '#ffffff',
    background: '#0c141f',
    text: '#ffffff',
    grid: '#1d2c3f',
    accent: '#00f6ff',
    name: 'Tron Legacy',
    description: 'Classic blue circuit theme from Tron Legacy'
  },
  clu: {
    primary: '#ff8800',
    secondary: '#ff5500',
    background: '#0d0d0d',
    text: '#ffffff',
    grid: '#1a1a1a',
    accent: '#ff8800',
    name: 'CLU',
    description: 'Orange villain theme inspired by CLU'
  },
  quorra: {
    primary: '#ffffff',
    secondary: '#c0c0c0',
    background: '#0f0f0f',
    text: '#ffffff',
    grid: '#2a2a2a',
    accent: '#c0c0c0',
    name: 'Quorra',
    description: 'White and silver ISO theme'
  },
  program: {
    primary: '#0058f8',
    secondary: '#0030a0',
    background: '#0d0d0d',
    text: '#ffffff',
    grid: '#1a1a1a',
    accent: '#0058f8',
    name: 'Program',
    description: 'Basic program with blue circuitry'
  },
  rinzler: {
    primary: '#ff3300',
    secondary: '#cc2200',
    background: '#0a0a0a',
    text: '#ffffff',
    grid: '#1a1a1a',
    accent: '#ff3300',
    name: 'Rinzler',
    description: 'Red-orange theme inspired by reprogrammed Tron'
  },
  matrix: {
    primary: '#00ff00',
    secondary: '#00cc00',
    background: '#000000',
    text: '#00ff00',
    grid: '#001100',
    accent: '#00ff00',
    name: 'Matrix',
    description: 'Green code theme inspired by The Matrix'
  },
  cyberpunk: {
    primary: '#ff00ff',
    secondary: '#cc00cc',
    background: '#0a0a18',
    text: '#ffffff',
    grid: '#1a1a2a',
    accent: '#ff00ff',
    name: 'Cyberpunk',
    description: 'Neon pink futuristic theme'
  },
  synthwave: {
    primary: '#ff00aa',
    secondary: '#aa0088',
    background: '#16002a',
    text: '#ffffff',
    grid: '#2a0044',
    accent: '#00ffff',
    name: 'Synthwave',
    description: '80s retro synthwave sunset colors'
  }
};

export const AVAILABLE_CHARACTERS = [
  { id: 'tron', name: 'Tron', description: 'Security program with white and light blue circuitry' },
  { id: 'clu', name: 'CLU', description: 'System administrator with black and orange circuitry' },
  { id: 'quorra', name: 'Quorra', description: 'ISO with white and silver circuitry' },
  { id: 'program', name: 'Program', description: 'Basic program with black and blue circuitry' },
  { id: 'rinzler', name: 'Rinzler', description: 'Reprogrammed Tron with red-orange circuitry' },
  { id: 'sam', name: 'Sam Flynn', description: 'User with blue-white circuitry' },
  { id: 'kevin', name: 'Kevin Flynn', description: 'Creator with white circuitry' },
  { id: 'custom', name: 'Custom', description: 'Create your own identity' }
];

// App version for storage versioning
const APP_VERSION = '1.0.0';

// Storage keys
const STORAGE_KEYS = {
  FOCUS_DATA: 'tron_focus_data',
  SETTINGS: 'tron_settings',
  SESSIONS: 'tron_sessions',
  STATS: 'tron_stats'
};

// Default settings
const DEFAULT_SETTINGS = {
  theme: 'tron',
  sound: 'digital',
  notifications: true,
  backgroundStyle: 'grid', // grid, codeRain, particles
  musicYoutubeUrl: '',
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartNextSession: false
};

// Default focus data structure
const DEFAULT_FOCUS_DATA = {
  settings: DEFAULT_SETTINGS,
  sessions: [],
  currentStreak: 0,
  longestStreak: 0,
  totalFocusTime: 0, // Total focus time in minutes
  totalSessions: 0,
  uninterruptedSessions: 0,
  interruptedSessions: 0,
  focusEvents: [],
  lastSessionDate: null,
  streaks: {
    current: 0,
    longest: 0,
    history: [] // Track streak history for graphs
  },
  dailyStats: {}, // Store daily focus minutes for graphs
  weeklyStats: {}, // Store weekly focus minutes for graphs
  monthlyStats: {} // Store monthly focus minutes for graphs
};

// Initialize the storage manager with our app version
StorageManager.initialize({
  version: APP_VERSION,
  migrationStrategies: {
    // Migration strategies for future versions
  }
});

// Provider component
export const DataProvider = ({ children }) => {
  // State for focus data
  const [focusData, setFocusData] = useState(() => {
    // Load focus data from storage or use default
    try {
      const storedData = StorageManager.getItem(STORAGE_KEYS.FOCUS_DATA);
      return storedData || DEFAULT_FOCUS_DATA;
    } catch (error) {
      console.error('Error loading focus data:', error);
      return DEFAULT_FOCUS_DATA;
    }
  });

  // Update local storage when focus data changes
  useEffect(() => {
    try {
      StorageManager.setItem(STORAGE_KEYS.FOCUS_DATA, focusData);
    } catch (error) {
      console.error('Error saving focus data:', error);
    }
  }, [focusData]);

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === STORAGE_KEYS.FOCUS_DATA) {
        try {
          setFocusData(event.newValue || DEFAULT_FOCUS_DATA);
        } catch (error) {
          console.error('Error handling storage change:', error);
        }
      }
    };

    // Subscribe to storage changes
    StorageManager.subscribe(handleStorageChange);

    // Unsubscribe when component unmounts
    return () => {
      StorageManager.unsubscribe(handleStorageChange);
    };
  }, []);

  // Update statistics for graphs
  const updateStatistics = (sessions) => {
    const dailyStats = {};
    const weeklyStats = {};
    const monthlyStats = {};
    
    // Process all completed sessions
    sessions.filter(session => session.completed).forEach(session => {
      const date = session.date;
      const duration = session.duration || 0;
      
      // Update daily stats
      if (!dailyStats[date]) {
        dailyStats[date] = 0;
      }
      dailyStats[date] += duration;
      
      // Update weekly stats
      const weekDate = new Date(date);
      const weekStart = new Date(weekDate);
      weekStart.setDate(weekDate.getDate() - weekDate.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyStats[weekKey]) {
        weeklyStats[weekKey] = 0;
      }
      weeklyStats[weekKey] += duration;
      
      // Update monthly stats
      const monthKey = date.substring(0, 7); // YYYY-MM format
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = 0;
      }
      monthlyStats[monthKey] += duration;
    });
    
    return { dailyStats, weeklyStats, monthlyStats };
  };
  
  // Add a new focus session
  const addSession = (session) => {
    setFocusData(prevData => {
      const newSessions = [...prevData.sessions, session];
      const totalTime = calculateTotalFocusTime(newSessions);
      const streakData = calculateStreaks(newSessions);
      const stats = updateStatistics(newSessions);
      
      // Track if this session was interrupted
      const uninterruptedSessions = session.interrupted 
        ? prevData.uninterruptedSessions 
        : prevData.uninterruptedSessions + 1;
      
      const interruptedSessions = session.interrupted 
        ? prevData.interruptedSessions + 1 
        : prevData.interruptedSessions;

      return {
        ...prevData,
        sessions: newSessions,
        totalFocusTime: totalTime,
        streaks: streakData,
        uninterruptedSessions,
        interruptedSessions,
        lastActive: new Date().toISOString().split('T')[0],
        dailyStats: stats.dailyStats,
        weeklyStats: stats.weeklyStats,
        monthlyStats: stats.monthlyStats
      };
    });
  };

  // Calculate total focus time from sessions
  const calculateTotalFocusTime = (sessions) => {
    return sessions.reduce((total, session) => {
      return total + (session.completed ? session.duration : 0);
    }, 0);
  };

  // Calculate current and longest streaks with history for graphs
  const calculateStreaks = (sessions) => {
    if (sessions.length === 0) {
      return { current: 0, longest: 0, history: [] };
    }

    // Get unique dates with completed sessions
    const dates = [...new Set(
      sessions
        .filter(session => session.completed)
        .map(session => session.date)
    )].sort();
    
    if (dates.length === 0) {
      return { current: 0, longest: 0, history: [] };
    }
    
    // Create a history array for streak visualization in graphs
    const streakHistory = [];

    // Calculate current streak
    let currentStreak = 1;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Check if the most recent date is today or yesterday
    const mostRecentDate = dates[dates.length - 1];
    if (mostRecentDate !== today && mostRecentDate !== yesterdayStr) {
      currentStreak = 0;
    } else {
      // Count consecutive days backwards from the most recent date
      for (let i = dates.length - 2; i >= 0; i--) {
        const currentDate = new Date(dates[i + 1]);
        const prevDate = new Date(dates[i]);
        
        // Check if dates are consecutive
        const diffTime = Math.abs(currentDate - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
    
    // Calculate longest streak
    let longestStreak = currentStreak;
    let tempStreak = 1;
    
    // Initialize streak history with the first date
    streakHistory.push({
      date: dates[0],
      streak: 1
    });
    
    // Calculate streak for each day and build history
    for (let i = 1; i < dates.length; i++) {
      const nextDate = new Date(dates[i]);
      const prevDate = new Date(dates[i - 1]);
      
      // Check if dates are consecutive
      const diffTime = Math.abs(nextDate - prevDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
      
      // Add to streak history for graphs
      streakHistory.push({
        date: dates[i],
        streak: tempStreak
      });
    }
    
    return {
      current: currentStreak,
      longest: longestStreak,
      history: streakHistory
    };
  };

  // Add a completed session
  const addCompletedSession = useCallback((sessionData) => {
    const now = new Date();
    const newSession = {
      ...sessionData,
      completedAt: now.toISOString(),
      id: Date.now(),
      // Ensure we have the interrupted flag
      interrupted: sessionData.interrupted || false
    };

    setFocusData(prevData => {
      // Check if this continues a streak (within 24 hours of last session)
      let currentStreak = prevData.currentStreak;
      let longestStreak = prevData.longestStreak;
      let lastSessionDate = prevData.lastSessionDate;

      if (sessionData.type === 'focus' && !sessionData.wasInterrupted) {
        // If there's a previous session, check if it was within 24 hours
        if (lastSessionDate) {
          const lastDate = new Date(lastSessionDate);
          const hoursDiff = (now - lastDate) / (1000 * 60 * 60);

          if (hoursDiff <= 24) {
            // Continue the streak
            currentStreak += 1;
          } else {
            // Reset the streak
            currentStreak = 1;
          }
        } else {
          // First session ever
          currentStreak = 1;
        }

        // Update longest streak if needed
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }

        // Update last session date
        lastSessionDate = now.toISOString();
      }

      // Calculate total focus minutes
      const totalFocusMinutes = sessionData.type === 'focus'
        ? prevData.totalFocusMinutes + sessionData.duration
        : prevData.totalFocusMinutes;

      // Calculate total completed sessions
      const totalSessions = sessionData.type === 'focus'
        ? prevData.totalSessions + 1
        : prevData.totalSessions;
        
      // Track uninterrupted sessions for Focus Ninja achievement
      const uninterruptedSessions = (sessionData.type === 'focus' && !sessionData.interrupted)
        ? prevData.uninterruptedSessions + 1
        : prevData.uninterruptedSessions;
        
      // Track interrupted sessions
      const interruptedSessions = (sessionData.type === 'focus' && sessionData.interrupted)
        ? prevData.interruptedSessions + 1
        : prevData.interruptedSessions;
        
      // Store focus events if provided
      const focusEvents = sessionData.focusEvents
        ? [...(prevData.focusEvents || []), ...sessionData.focusEvents].slice(0, 100) // Keep only last 100 events
        : (prevData.focusEvents || []);

      // Update sessions list
      const updatedSessions = [newSession, ...prevData.sessions].slice(0, 100); // Keep only the last 100 sessions

      // Store sessions separately for quicker access
      try {
        StorageManager.setItem(STORAGE_KEYS.SESSIONS, updatedSessions);
      } catch (error) {
        console.error('Error saving sessions:', error);
      }

      // Store stats separately for quicker access
      const stats = {
        currentStreak,
        longestStreak,
        totalFocusMinutes,
        totalSessions,
        uninterruptedSessions,
        interruptedSessions,
        focusEvents,
        lastSessionDate
      };

      try {
        StorageManager.setItem(STORAGE_KEYS.STATS, stats);
      } catch (error) {
        console.error('Error saving stats:', error);
      }

      return {
        ...prevData,
        sessions: updatedSessions,
        ...stats
      };
    });

    return newSession;
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    setFocusData(prevData => {
      const updatedSettings = {
        ...prevData.settings,
        ...newSettings
      };

      // Also store settings separately for quicker access
      try {
        StorageManager.setItem(STORAGE_KEYS.SETTINGS, updatedSettings);
      } catch (error) {
        console.error('Error saving settings:', error);
      }

      return {
        ...prevData,
        settings: updatedSettings
      };
    });
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setFocusData(prevData => {
      const currentThemeId = prevData.settings.theme;
      const themeKeys = Object.keys(AVAILABLE_THEMES);
      const currentIndex = themeKeys.indexOf(currentThemeId);
      const nextIndex = (currentIndex + 1) % themeKeys.length;
      const nextThemeId = themeKeys[nextIndex];

      return {
        ...prevData,
        settings: {
          ...prevData.settings,
          theme: nextThemeId
        }
      };
    });
  };

  // Get daily progress as percentage
  const getDailyProgress = (date) => {
    const sessionsForDate = focusData.sessions.filter(
      session => session.date === date && session.completed
    );

    const totalMinutes = sessionsForDate.reduce(
      (total, session) => total + session.duration, 0
    );

    return Math.min(100, (totalMinutes / focusData.settings.dailyGoal) * 100);
  };

  // Get weekly progress as percentage
  const getWeeklyProgress = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const sessionsThisWeek = focusData.sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= startOfWeek && session.completed;
    });

    const totalMinutes = sessionsThisWeek.reduce(
      (total, session) => total + session.duration, 0
    );

    return Math.min(100, (totalMinutes / focusData.settings.weeklyGoal) * 100);
  };

  // Get sessions for a specific date range
  const getSessionsForDateRange = (startDate, endDate) => {
    return focusData.sessions.filter(session => {
      return session.date >= startDate && session.date <= endDate;
    });
  };

  const getAvailableThemes = () => {
    return AVAILABLE_THEMES;
  };

  const getAvailableCharacters = () => {
    return AVAILABLE_CHARACTERS;
  };

  const getCurrentTheme = () => {
    return AVAILABLE_THEMES[focusData.settings.theme] || AVAILABLE_THEMES.tron;
  };

  // Clear all data and reset to defaults
  const clearAllData = useCallback(() => {
    try {
      // Clear all storage keys
      Object.values(STORAGE_KEYS).forEach(key => {
        StorageManager.removeItem(key);
      });

      // Reset state to defaults
      setFocusData(DEFAULT_FOCUS_DATA);
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }, []);

  // Track session interruptions
  const trackSessionInterruption = useCallback((sessionData, focusEvents) => {
    if (!sessionData) return;
    
    setFocusData(prevData => {
      // Update the session with interruption data
      const updatedSessions = prevData.sessions.map(session => {
        if (session.id === sessionData.id) {
          return {
            ...session,
            interrupted: true,
            focusEvents: focusEvents || []
          };
        }
        return session;
      });
      
      return {
        ...prevData,
        sessions: updatedSessions,
        interruptedSessions: prevData.interruptedSessions + 1
      };
    });
  }, []);
  
  return (
    <DataContext.Provider value={{
      focusData,
      addSession,
      addCompletedSession,
      updateSettings,
      toggleTheme,
      getDailyProgress,
      getWeeklyProgress,
      getSessionsForDateRange,
      getAvailableThemes,
      getAvailableCharacters,
      getCurrentTheme,
      trackSessionInterruption,
      clearAllData
    }}>
      {children}
    </DataContext.Provider>
  );
};

DataProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useData = () => useContext(DataContext);
