import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { useAchievements } from '../../context/AchievementContext';
import TimerSounds from './TimerSounds';

const TimerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  height: 100%;
`;

const ProgressRing = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2rem 0;
`;

const ProgressCircle = styled.svg`
  transform: rotate(-90deg);
  filter: drop-shadow(0 0 15px ${props => (props.theme?.primary || '#1e88e5') + '40'});
`;

const CircleBackground = styled.circle`
  fill: ${props => props.theme?.background || '#121212'};
  stroke: ${props => (props.theme?.text || '#ffffff') + '30'};
  stroke-width: 8;
`;

const CircleProgress = styled.circle`
  fill: none;
  stroke: ${props => props.theme?.primary || '#1e88e5'};
  stroke-width: 10;
  stroke-linecap: round;
  stroke-dasharray: ${props => props.$circumference};
  stroke-dashoffset: ${props => props.$dashOffset};
  transition: stroke-dashoffset 0.5s ease;
  filter: drop-shadow(0 0 8px ${props => (props.theme?.primary || '#1e88e5') + '80'});
`;

const TimerDisplay = styled(motion.div)`
  font-size: 3.5rem;
  font-family: 'Orbitron', sans-serif;
  color: ${props => props.theme?.primary || '#1e88e5'};
  text-shadow: 0 0 10px ${props => (props.theme?.primary || '#1e88e5') + '80'};
  letter-spacing: 2px;
`;

const SessionLabel = styled.div`
  font-size: 1.2rem;
  color: ${props => props.theme?.text || '#ffffff'};
  margin-top: 1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
`;

const SessionCounter = styled.div`
  font-size: 0.9rem;
  color: ${props => (props.theme?.text || '#ffffff') + '80'};
  margin-top: 0.5rem;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const TimerButton = styled(motion.button)`
  background: ${props => props.theme?.background || '#121212'};
  color: ${props => props.theme?.primary || '#1e88e5'};
  border: 2px solid ${props => props.theme?.primary || '#1e88e5'};
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-family: 'Orbitron', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 0 10px ${props => (props.theme?.primary || '#1e88e5') + '40'};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => (props.theme?.primary || '#1e88e5') + '20'};
    box-shadow: 0 0 15px ${props => (props.theme?.primary || '#1e88e5') + '60'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
`;

const Notification = styled(motion.div)`
  background: ${props => props.theme?.background || '#121212'};
  border: 1px solid ${props => props.theme?.primary || '#1e88e5'};
  color: ${props => props.theme?.text || '#ffffff'};
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  box-shadow: 0 0 10px ${props => (props.theme?.primary || '#1e88e5') + '40'};
`;

const Timer = () => {
  const { focusData, addSession, updateSettings } = useData();
  const [timeLeft, setTimeLeft] = useState(focusData.settings.focusDuration * 60); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSession, setCurrentSession] = useState('focus'); // focus, shortBreak, longBreak
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [notification, setNotification] = useState(null);
  
  // Timer logic
  useEffect(() => {
    let interval = null;
    
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            clearInterval(interval);
            handleTimerComplete();
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, isPaused, timeLeft]);
  
  // Handle timer completion
  const handleTimerComplete = () => {
    // Play sound
    if (focusData.settings.sound) {
      TimerSounds.play('digital');
    }
    
    // Show notification
    if (focusData.settings.notifications) {
      showNotification(`${currentSession.charAt(0).toUpperCase() + currentSession.slice(1)} session completed!`);
      
      // Browser notification
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification('TRON Focus Timer', {
            body: `${currentSession.charAt(0).toUpperCase() + currentSession.slice(1)} session completed!`,
            icon: '/favicon.ico'
          });
        } catch (error) {
          console.log('Notification creation failed', error);
        }
      }
    }
    
    // Record session if it was a focus session
    if (currentSession === 'focus') {
      addSession({
        duration: focusData.settings.focusDuration,
        completed: true,
        date: new Date().toISOString().split('T')[0]
      });
      
      setSessionsCompleted(prev => prev + 1);
      
      // Determine next session type
      if (sessionsCompleted + 1 >= focusData.settings.sessionsBeforeLongBreak) {
        setCurrentSession('longBreak');
        setTimeLeft(focusData.settings.longBreakDuration * 60);
        setSessionsCompleted(0);
      } else {
        setCurrentSession('shortBreak');
        setTimeLeft(focusData.settings.shortBreakDuration * 60);
      }
    } else {
      // After break, go back to focus
      setCurrentSession('focus');
      setTimeLeft(focusData.settings.focusDuration * 60);
    }
    
    // Auto-start next session if enabled
    if (
      (currentSession === 'focus' && focusData.settings.autoStartBreaks) ||
      (currentSession !== 'focus' && focusData.settings.autoStartPomodoros)
    ) {
      setIsActive(true);
      setIsPaused(false);
    } else {
      setIsActive(false);
      setIsPaused(false);
    }
  };
  
  // Start timer
  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
  };
  
  // Pause timer
  const pauseTimer = () => {
    setIsPaused(true);
  };
  
  // Resume timer
  const resumeTimer = () => {
    setIsPaused(false);
  };
  
  // Reset timer
  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    
    // Reset to appropriate time based on current session type
    if (currentSession === 'focus') {
      setTimeLeft(focusData.settings.focusDuration * 60);
    } else if (currentSession === 'shortBreak') {
      setTimeLeft(focusData.settings.shortBreakDuration * 60);
    } else {
      setTimeLeft(focusData.settings.longBreakDuration * 60);
    }
  };
  
  // Skip current session
  const skipSession = () => {
    handleTimerComplete();
  };
  
  // Show notification
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress for the ring
  const radius = 150;
  const circumference = 2 * Math.PI * radius;
  
  // Determine total time for current session type
  const getTotalTime = () => {
    if (currentSession === 'focus') {
      return focusData.settings.focusDuration * 60;
    } else if (currentSession === 'shortBreak') {
      return focusData.settings.shortBreakDuration * 60;
    } else {
      return focusData.settings.longBreakDuration * 60;
    }
  };
  
  const totalTime = getTotalTime();
  const progress = (totalTime - timeLeft) / totalTime;
  const dashOffset = circumference * (1 - progress);
  
  // Request notification permission
  useEffect(() => {
    if (focusData.settings.notifications && typeof Notification !== 'undefined') {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        try {
          Notification.requestPermission();
        } catch (error) {
          console.log('Notification API not supported in this environment');
        }
      }
    }
  }, [focusData.settings.notifications]);
  
  return (
    <TimerContainer>
      <ProgressRing>
        <ProgressCircle viewBox="0 0 400 400">
          <CircleBackground cx="200" cy="200" r={radius} />
          <CircleProgress 
            cx="200" 
            cy="200" 
            r={radius} 
            $circumference={circumference}
            $dashOffset={dashOffset}
          />
        </ProgressCircle>
        <TimerDisplay
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)' 
          }}
        >
          {formatTime(timeLeft)}
        </TimerDisplay>
      </ProgressRing>
      
      <SessionLabel>
        {currentSession === 'focus' ? 'Focus Session' : 
         currentSession === 'shortBreak' ? 'Short Break' : 'Long Break'}
      </SessionLabel>
      
      <SessionCounter>
        Session {sessionsCompleted + 1} of {focusData.settings.sessionsBeforeLongBreak}
      </SessionCounter>
      
      <ButtonsContainer>
        {!isActive ? (
          <TimerButton 
            onClick={startTimer}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Start
          </TimerButton>
        ) : isPaused ? (
          <TimerButton 
            onClick={resumeTimer}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Resume
          </TimerButton>
        ) : (
          <TimerButton 
            onClick={pauseTimer}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Pause
          </TimerButton>
        )}
        
        <TimerButton 
          onClick={resetTimer}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!isActive && timeLeft === getTotalTime()}
        >
          Reset
        </TimerButton>
        
        <TimerButton 
          onClick={skipSession}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Skip
        </TimerButton>
      </ButtonsContainer>
      
      {/* Notifications */}
      <NotificationContainer>
        {notification && (
          <Notification
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {notification}
          </Notification>
        )}
      </NotificationContainer>
    </TimerContainer>
  );
};

export default Timer;
