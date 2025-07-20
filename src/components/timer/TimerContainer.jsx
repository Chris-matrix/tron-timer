import React, { useState, useCallback, useEffect } from 'react';
import Timer from './Timer';
import { useData } from '../../context/DataContext';
import { useAchievements } from '../../context/AchievementContext';

const TimerContainer = () => {
  const { focusData, addSession } = useData();
  const { checkAchievements, setAchievements } = useAchievements();
  
  // Session state
  const [currentSession, setCurrentSession] = useState({
    type: 'focus',
    duration: focusData?.settings?.focusDuration || 25,
    startedAt: null
  });
  
  // Update session when settings change
  useEffect(() => {
    if (!currentSession.startedAt) {  // Only update if not in an active session
      setCurrentSession(prev => ({
        ...prev,
        duration: prev.type === 'focus' 
          ? focusData?.settings?.focusDuration || 25 
          : prev.type === 'shortBreak'
            ? focusData?.settings?.shortBreakDuration || 5
            : focusData?.settings?.longBreakDuration || 15
      }));
    }
  }, [focusData?.settings, currentSession.startedAt, currentSession.type]);
  
  // Handle session completion
  const handleSessionComplete = useCallback((sessionResult) => {
    // Add completed session to data context
    const completedSession = {
      ...currentSession,
      ...sessionResult,
      completedAt: new Date().toISOString()
    };
    
    addSession(completedSession);
    
    // Check for achievements
    checkAchievements();
    
    // Add notification for timer completion
    const notification = {
      id: `timer_complete_${Date.now()}`,
      type: 'timerComplete',
      title: 'Timer Complete!',
      message: `${currentSession.type === 'focus' ? 'Focus' : 'Break'} session completed`,
      icon: currentSession.type === 'focus' ? '🎯' : '☕',
      timestamp: new Date().toISOString()
    };
    
    // Add notification to state
    setAchievements(prev => ({
      ...prev,
      notifications: [notification, ...prev.notifications]
    }));
    
    // Determine next session type
    const nextSessionType = currentSession.type === 'focus' 
      ? 'shortBreak' 
      : 'focus';
    
    // Set up next session
    setCurrentSession({
      type: nextSessionType,
      duration: nextSessionType === 'focus' 
        ? focusData?.settings?.focusDuration || 25 
        : focusData?.settings?.shortBreakDuration || 5,
      startedAt: null
    });
  }, [currentSession, addSession, checkAchievements, setAchievements, focusData?.settings]);
  
  // Handle session pause
  const handleSessionPause = useCallback(() => {
    // Update session state if needed
    setCurrentSession(prev => ({
      ...prev,
      pausedAt: new Date().toISOString()
    }));
  }, []);
  
  // Handle session resume
  const handleSessionResume = useCallback(() => {
    // Update session state if needed
    setCurrentSession(prev => ({
      ...prev,
      pausedAt: null
    }));
  }, []);
  
  // Handle session reset
  const handleSessionReset = useCallback(() => {
    // Reset current session
    setCurrentSession(prev => ({
      ...prev,
      startedAt: null,
      pausedAt: null
    }));
  }, []);
  
  return (
    <Timer 
      session={currentSession}
      onComplete={handleSessionComplete}
      onPause={handleSessionPause}
      onResume={handleSessionResume}
      onReset={handleSessionReset}
    />
  );
};

export default TimerContainer;
