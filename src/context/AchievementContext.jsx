import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useData } from './DataContext';

// Create the context
const AchievementContext = createContext();

// Achievement types and tiers as specified in the requirements
const achievementTypes = {
  focusMaster: {
    title: "Focus Master",
    description: "Accumulate total focus time",
    icon: "⏱️",
    tiers: [
      { level: 1, requirement: 5, reward: "Bronze Badge" },
      { level: 2, requirement: 15, reward: "Silver Badge" },
      { level: 3, requirement: 30, reward: "Gold Badge" }
    ]
  },
  streakChampion: {
    title: "Streak Champion",
    description: "Maintain consecutive days of focus",
    icon: "🔥",
    tiers: [
      { level: 1, requirement: 3, reward: "Bronze Trophy" },
      { level: 2, requirement: 7, reward: "Silver Trophy" },
      { level: 3, requirement: 14, reward: "Gold Trophy" }
    ]
  },
  consistencyKing: {
    title: "Consistency King",
    description: "Complete focus sessions regularly",
    icon: "👑",
    tiers: [
      { level: 1, requirement: 10, reward: "Daily Tracker" },
      { level: 2, requirement: 20, reward: "Weekly Insights" },
      { level: 3, requirement: 30, reward: "Monthly Report" }
    ]
  },
  focusNinja: {
    title: "Focus Ninja",
    description: "Complete sessions without interruptions",
    icon: "🥷",
    tiers: [
      { level: 1, requirement: 5, reward: "Focus Techniques" },
      { level: 2, requirement: 15, reward: "Distraction Blocker" },
      { level: 3, requirement: 30, reward: "Productivity Master" }
    ]
  },
  earlyBird: {
    title: "Early Bird",
    description: "Complete morning focus sessions",
    icon: "🌅",
    tiers: [
      { level: 1, requirement: 3, reward: "Morning Routine" },
      { level: 2, requirement: 7, reward: "Productivity Planner" },
      { level: 3, requirement: 14, reward: "Energy Booster" }
    ]
  }
};

// Provider component
export const AchievementProvider = ({ children }) => {
  const { focusData } = useData();
  
  // Initialize state with data from localStorage or use empty arrays
  const [achievements, setAchievements] = useState(() => {
    const savedAchievements = localStorage.getItem('achievements');
    return savedAchievements ? JSON.parse(savedAchievements) : {
      unlocked: [],
      recent: [],
      notifications: []
    };
  });

  // Save achievements to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('achievements', JSON.stringify(achievements));
  }, [achievements]);

  // Helper function to check a specific achievement type
  const checkAchievementType = useCallback((type, currentValue, newUnlocked) => {
    const achievementType = achievementTypes[type];
    
    if (!achievementType) return;
    
    for (const tier of achievementType.tiers) {
      const achievementId = `${type}_${tier.level}`;
      
      // Check if this achievement is already unlocked
      const alreadyUnlocked = achievements.unlocked.some(a => a.id === achievementId);
      
      // If not unlocked and requirement is met, add to new unlocked
      if (!alreadyUnlocked && currentValue >= tier.requirement) {
        newUnlocked.push({
          id: achievementId,
          type,
          title: achievementType.title,
          description: achievementType.description,
          level: tier.level,
          icon: achievementType.icon,
          reward: tier.reward,
          unlockedAt: new Date().toISOString()
        });
      }
    }
  }, [achievements]);
  
  // Check if any new achievements have been unlocked
  const checkAchievements = useCallback(() => {
    // Guard clause to ensure focusData is available
    if (!focusData) {
      console.warn('Focus data not available for achievement check');
      return;
    }
    
    const newUnlocked = [];
    
    // Check Focus Master achievements (based on total focus time)
    const totalFocusHours = (focusData.totalFocusTime || 0) / 60; // Convert minutes to hours
    checkAchievementType('focusMaster', totalFocusHours, newUnlocked);
    
    // Check Streak Champion achievements (based on current streak)
    const currentStreak = focusData.streaks?.current || 0;
    checkAchievementType('streakChampion', currentStreak, newUnlocked);
    
    // Check Consistency King achievements (based on completed sessions)
    const completedSessions = (focusData.sessions || []).filter(s => s?.completed).length;
    checkAchievementType('consistencyKing', completedSessions, newUnlocked);
    
    // Check Focus Ninja achievements (based on uninterrupted sessions)
    const uninterruptedSessions = focusData.uninterruptedSessions || 0;
    checkAchievementType('focusNinja', uninterruptedSessions, newUnlocked);
    
    // Check Early Bird achievements (based on morning sessions)
    const morningSessions = (focusData.sessions || []).filter(s => {
      if (!s?.date || !s?.completed) return false;
      try {
        const sessionDate = new Date(s.date + 'T' + (s.startTime || '08:00:00'));
        return sessionDate.getHours() < 10; // Before 10 AM
      } catch (error) {
        console.warn('Error parsing session date:', error);
        return false;
      }
    }).length;
    checkAchievementType('earlyBird', morningSessions, newUnlocked);
    
    // If new achievements were unlocked, update state and show notifications
    if (newUnlocked.length > 0) {
      setAchievements(prev => {
        // Mark new achievements as unclaimed by default
        const markedNewUnlocked = newUnlocked.map(achievement => ({
          ...achievement,
          claimed: false,
          timestamp: new Date().toISOString()
        }));
        
        return {
          unlocked: [...prev.unlocked, ...markedNewUnlocked],
          recent: [...markedNewUnlocked, ...prev.recent].slice(0, 5), // Keep only the 5 most recent
          notifications: [...markedNewUnlocked, ...prev.notifications]
        };
      });
      
      // Show on-screen notifications for each new achievement
      newUnlocked.forEach(achievement => {
        // This will trigger the UI notification
        showAchievementNotification(achievement);
      });
    }
  }, [focusData, checkAchievementType]);
  
  // Check for new achievements whenever focus data changes
  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);
  
  // Track uninterrupted sessions for Focus Ninja achievement
  const trackUninterruptedSession = (sessionData) => {
    if (!sessionData) return;
    
    // Check if this was an uninterrupted session
    const wasUninterrupted = !sessionData.interrupted;
    
    if (wasUninterrupted) {
      // Update focus data with this uninterrupted session
      const updatedFocusData = {
        ...focusData,
        uninterruptedSessions: (focusData.uninterruptedSessions || 0) + 1
      };
      
      // Check for Focus Ninja achievements
      const newUnlocked = [];
      checkAchievementType('focusNinja', updatedFocusData.uninterruptedSessions, newUnlocked);
      
      // If new achievements were unlocked, update state
      if (newUnlocked.length > 0) {
        setAchievements(prev => ({
          unlocked: [...prev.unlocked, ...newUnlocked],
          recent: [...newUnlocked, ...prev.recent].slice(0, 5), // Keep only the 5 most recent
          notifications: [...newUnlocked, ...prev.notifications]
        }));
      }
    }
    
    return wasUninterrupted;
  };

  // Dismiss a notification
  const dismissNotification = (notificationId) => {
    setAchievements(prev => ({
      ...prev,
      notifications: prev.notifications.filter(n => n.id !== notificationId)
    }));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setAchievements(prev => ({
      ...prev,
      notifications: []
    }));
  };

  // Get all available achievements (unlocked and locked)
  const getAllAchievements = () => {
    const allAchievements = [];
    
    // For each achievement type
    Object.entries(achievementTypes).forEach(([typeId, typeData]) => {
      // For each tier in this type
      typeData.tiers.forEach(tier => {
        const achievementId = `${typeId}_${tier.level}`;
        const unlocked = achievements.unlocked.find(a => a.id === achievementId);
        
        allAchievements.push({
          id: achievementId,
          type: typeId,
          title: typeData.title,
          description: typeData.description,
          level: tier.level,
          icon: typeData.icon,
          requirement: tier.requirement,
          reward: tier.reward,
          unlocked: !!unlocked,
          unlockedAt: unlocked ? unlocked.unlockedAt : null
        });
      });
    });
    
    return allAchievements;
  };

  // Get achievement progress
  const getAchievementProgress = (typeId, level) => {
    // Guard clause to ensure focusData is available
    if (!focusData) {
      console.warn('Focus data not available for achievement progress calculation');
      return { current: 0, required: 0, percentage: 0 };
    }
    
    const type = achievementTypes[typeId];
    if (!type) return { current: 0, required: 0, percentage: 0 };
    
    const tier = type.tiers.find(t => t.level === level);
    if (!tier) return { current: 0, required: 0, percentage: 0 };
    
    let currentValue = 0;
    
    // Determine current value based on achievement type
    switch (typeId) {
      case 'focusMaster':
        currentValue = (focusData.totalFocusTime || 0) / 60; // Convert minutes to hours
        break;
      case 'streakChampion':
        currentValue = focusData.streaks?.current || 0;
        break;
      case 'consistencyKing':
        currentValue = (focusData.sessions || []).filter(s => s?.completed).length;
        break;
      case 'focusNinja':
        // Using our dedicated tracking for uninterrupted sessions
        currentValue = focusData.uninterruptedSessions || 0;
        break;
      case 'earlyBird':
        // Assuming we have a way to track morning sessions
        currentValue = (focusData.sessions || []).filter(s => {
          if (!s?.date || !s?.completed) return false;
          try {
            const sessionDate = new Date(s.date + 'T' + (s.startTime || '08:00:00'));
            return sessionDate.getHours() < 10; // Before 10 AM
          } catch (error) {
            console.warn('Error parsing session date:', error);
            return false;
          }
        }).length;
        break;
      default:
        currentValue = 0;
    }
    
    // Calculate progress percentage
    const progress = Math.min((currentValue / tier.requirement) * 100, 100);
    
    return {
      current: currentValue,
      required: tier.requirement,
      percentage: progress
    };
  };

  // Claim an achievement reward
  const claimAchievement = (achievementId) => {
    setAchievements(prev => {
      // Find the achievement in the unlocked list
      const achievement = prev.unlocked.find(a => a.id === achievementId);
      
      if (!achievement) return prev;
      
      // Mark the achievement as claimed
      const updatedUnlocked = prev.unlocked.map(a => 
        a.id === achievementId ? { ...a, claimed: true } : a
      );
      
      // Add a notification that the reward was claimed
      const claimNotification = {
        id: `claim_${achievementId}_${Date.now()}`,
        type: 'claim',
        title: `Reward Claimed!`,
        message: `You've claimed the ${achievement.reward} reward from ${achievement.title} Level ${achievement.level}!`,
        icon: achievement.icon,
        timestamp: new Date().toISOString()
      };
      
      return {
        ...prev,
        unlocked: updatedUnlocked,
        notifications: [...prev.notifications, claimNotification]
      };
    });
  };

  // Show achievement notification on screen
  const showAchievementNotification = (achievement) => {
    // This function will be used by the UI component to display the notification
    console.log('Achievement unlocked:', achievement);
    // The actual UI implementation will be in a separate component
  };

  // The value that will be available to consumers of this context
  const value = {
    achievements,
    achievementTypes,
    dismissNotification,
    clearAllNotifications,
    getAllAchievements,
    getAchievementProgress,
    trackUninterruptedSession,
    claimAchievement,
    showAchievementNotification
  };

  return <AchievementContext.Provider value={value}>{children}</AchievementContext.Provider>;
};

AchievementProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook to use the achievement context
export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
};
