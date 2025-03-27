import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const DataContext = createContext();

// Initial data
const initialData = {
  sessions: [],
  totalFocusTime: 0,
  streaks: {
    current: 0,
    longest: 0,
    history: []
  },
  settings: {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    autoStartPomodoros: false,
    autoStartBreaks: false,
    notifications: true,
    sound: true,
    dailyGoal: 120, // in minutes
    weeklyGoal: 600, // in minutes
    theme: 'tron', // 'dark' or 'light'
    character: 'tron'
  },
  lastActive: null,
};

// Define available themes and characters
const AVAILABLE_THEMES = {
  tron: {
    primary: '#00f6ff',
    secondary: '#ffffff',
    background: '#0c141f',
    text: '#ffffff',
    grid: '#1d2c3f',
    accent: '#00f6ff'
  },
  clu: {
    primary: '#ff8800',
    secondary: '#ff5500',
    background: '#0d0d0d',
    text: '#ffffff',
    grid: '#1a1a1a',
    accent: '#ff8800'
  },
  quorra: {
    primary: '#ffffff',
    secondary: '#c0c0c0',
    background: '#0f0f0f',
    text: '#ffffff',
    grid: '#2a2a2a',
    accent: '#c0c0c0'
  },
  program: {
    primary: '#0058f8',
    secondary: '#0030a0',
    background: '#0d0d0d',
    text: '#ffffff',
    grid: '#1a1a1a',
    accent: '#0058f8'
  }
};

const AVAILABLE_CHARACTERS = [
  { id: 'tron', name: 'Tron', description: 'Security program with white and light blue circuitry' },
  { id: 'clu', name: 'CLU', description: 'System administrator with black and orange circuitry' },
  { id: 'quorra', name: 'Quorra', description: 'ISO with white and silver circuitry' },
  { id: 'program', name: 'Program', description: 'Basic program with black and blue circuitry' }
];

export const DataProvider = ({ children }) => {
  const [focusData, setFocusData] = useState(() => {
    // Load data from localStorage if available
    const savedData = localStorage.getItem('focusData');
    return savedData ? JSON.parse(savedData) : initialData;
  });
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('focusData', JSON.stringify(focusData));
  }, [focusData]);
  
  // Add a new focus session
  const addSession = (session) => {
    setFocusData(prevData => {
      const newSessions = [...prevData.sessions, session];
      const totalTime = calculateTotalFocusTime(newSessions);
      const streakData = calculateStreaks(newSessions);
      
      return {
        ...prevData,
        sessions: newSessions,
        totalFocusTime: totalTime,
        streaks: streakData,
        lastActive: new Date().toISOString().split('T')[0]
      };
    });
  };
  
  // Calculate total focus time from sessions
  const calculateTotalFocusTime = (sessions) => {
    return sessions.reduce((total, session) => {
      return total + (session.completed ? session.duration : 0);
    }, 0);
  };
  
  // Calculate current and longest streaks
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
    
    // Calculate current streak
    let currentStreak = 1;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Check if the most recent date is today or yesterday
    const mostRecentDate = dates[dates.length - 1];
    if (mostRecentDate !== today && mostRecentDate !== yesterday) {
      currentStreak = 0;
    } else {
      // Count consecutive days backwards
      for (let i = dates.length - 2; i >= 0; i--) {
        const currentDate = new Date(dates[i + 1]);
        const prevDate = new Date(dates[i]);
        
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
    
    for (let i = 1; i < dates.length; i++) {
      const currentDate = new Date(dates[i]);
      const prevDate = new Date(dates[i - 1]);
      
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
    const history = dates.map(date => {
      return { date, count: 1 }; // Initialize with count 1 for each date with completed sessions
    });
    
    // Calculate consecutive streaks for history
    for (let i = 1; i < history.length; i++) {
      const currentDate = new Date(history[i].date);
      const prevDate = new Date(history[i-1].date);
      
      // Check if dates are consecutive
      const diffTime = currentDate - prevDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        history[i].count = history[i-1].count + 1;
      }
    }
    
    return {
      current: currentStreak,
      longest: longestStreak,
      history
    };
  };
  
  // Update settings
  const updateSettings = (newSettings) => {
    setFocusData(prevData => ({
      ...prevData,
      settings: {
        ...prevData.settings,
        ...newSettings
      }
    }));
  };
  
  // Toggle theme
  const toggleTheme = () => {
    setFocusData(prevData => ({
      ...prevData,
      settings: {
        ...prevData.settings,
        theme: prevData.settings.theme === 'tron' ? 'matrix' : 'tron'
      }
    }));
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
    return Object.keys(AVAILABLE_THEMES).map(key => ({
      id: key,
      name: key.charAt(0).toUpperCase() + key.slice(1)
    }));
  };
  
  const getAvailableCharacters = () => {
    return AVAILABLE_CHARACTERS;
  };
  
  const getCurrentTheme = () => {
    return AVAILABLE_THEMES[focusData.settings.theme] || AVAILABLE_THEMES.tron;
  };

  // Reset all user data
  const resetData = () => {
    setFocusData({
      ...initialData,
      settings: focusData.settings // Preserve user settings
    });
    localStorage.removeItem('focusData');
  };

  return (
    <DataContext.Provider value={{
      focusData,
      addSession,
      updateSettings,
      toggleTheme,
      getDailyProgress,
      getWeeklyProgress,
      getSessionsForDateRange,
      getAvailableThemes,
      getAvailableCharacters,
      getCurrentTheme,
      resetData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
