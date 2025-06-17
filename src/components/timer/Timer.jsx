import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useData, AVAILABLE_THEMES } from '../../context/DataContext';
import TimerSounds from './TimerSounds';
import TimerManager from '../../utils/TimerManager';
import NotificationManager from '../../utils/NotificationManager';
import PropTypes from 'prop-types';

// TRON-inspired animations

const gridLines = keyframes`
  0% { opacity: 0.2; }
  50% { opacity: 0.8; }
  100% { opacity: 0.2; }
`;

const dataFlow = keyframes`
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -1000; }
`;

const trailEffect = keyframes`
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -943; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const codeRain = keyframes`
  0% { transform: translateY(-100%); opacity: 1; }
  85% { opacity: 1; }
  100% { transform: translateY(1000%); opacity: 0; }
`;

const circuitPulse = keyframes`
  0% { stroke-width: 1; opacity: 0.3; }
  50% { stroke-width: 2; opacity: 0.8; }
  100% { stroke-width: 1; opacity: 0.3; }
`;

const TimerContainer = styled.div.attrs(() => ({
  style: {
    // Dynamic styles that change frequently can go here
  }
}))`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: ${props => props.theme?.background || '#0c141f'};
  
  &:before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => {
      if (props.$backgroundStyle === 'grid' || !props.$backgroundStyle) {
        return `
          linear-gradient(to right, ${props.theme?.grid || '#1d2c3f'} 1px, transparent 1px),
          linear-gradient(to bottom, ${props.theme?.grid || '#1d2c3f'} 1px, transparent 1px)
        `;
      }
      return 'none';
    }};
    background-size: 40px 40px;
    opacity: 0.15;
    z-index: 0;
    animation: ${props => props.$backgroundStyle === 'grid' ? gridLines : 'none'} 15s linear infinite;
    pointer-events: none;
  }
`;

// Add data flow lines
const DataFlowLines = styled.svg`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  opacity: 0.4;
  display: ${props => props.$backgroundStyle === 'minimal' ? 'none' : 'block'};
`;

const DataLine = styled.path`
  fill: none;
  stroke: ${props => props.theme?.primary || '#00f6ff'};
  stroke-width: 2;
  stroke-dasharray: 10, 15;
  animation: ${dataFlow} 20s linear infinite;
`;

// Circuit background
const CircuitBackground = styled.div.attrs(props => ({
  style: {
    display: props.$backgroundStyle === 'circuits' ? 'block' : 'none'
  }
}))`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  
  svg {
    width: 100%;
    height: 100%;
  }
  
  .data-flow {
    animation: ${dataFlow} 20s linear infinite;
  }
  
  .light-trail {
    animation: ${trailEffect} 30s linear infinite;
  }
`;

const CircuitLines = styled.svg.attrs(props => ({
  style: {
    display: props.$backgroundStyle === 'circuits' ? 'block' : 'none'
  }
}))`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  opacity: 0.3;
`;

const CircuitLine = styled.path.attrs(props => ({
  style: {
    stroke: props.theme?.primary || '#00f6ff'
  }
}))`
  fill: none;
  stroke-width: 1.5;
  stroke-linecap: round;
  animation: ${circuitPulse} ${() => 3 + Math.random() * 5}s ease-in-out infinite;
`;

const CircuitNode = styled.circle`
  fill: ${props => props.theme?.primary || '#00f6ff'};
  r: 3;
  opacity: 0.8;
  filter: drop-shadow(0 0 2px ${props => props.theme?.primary || '#00f6ff'});
`;

// Code rain effect
const CodeRainContainer = styled.div.attrs(({ $backgroundStyle }) => ({
  style: {
    display: $backgroundStyle === 'code' ? 'block' : 'none'
  }
}))`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
`;

const CodeColumn = styled.div`
  position: absolute;
  top: 0;
  left: ${props => props.$position}%;
  color: ${props => props.$theme?.primary || '#00f6ff'};
  font-family: monospace;
  font-size: 14px;
  line-height: 1;
  animation: ${codeRain} ${() => 5 + Math.random() * 15}s linear infinite;
  animation-delay: ${() => Math.random() * 5}s;
  opacity: ${() => 0.3 + Math.random() * 0.7};
`;

// YouTube player
const YouTubePlayerContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 200px;
  height: 40px;
  z-index: 10;
  display: ${props => props.$url ? 'block' : 'none'};
  background: rgba(0, 0, 0, 0.5);
  border-radius: 5px;
  padding: 5px;
`;

const ProgressRingContainer = styled(motion.div)`
  position: relative;
  width: min(90vw, 400px);
  height: min(90vw, 400px);
  margin: 1rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.02);
    }
  }
`;

const TimerDisplay = styled(motion.div)`
  font-size: 5.5rem;
  font-family: 'Orbitron', sans-serif;
  color: ${props => props.theme?.primary || '#00f6ff'};
  text-shadow: 0 0 15px ${props => (props.theme?.primary || '#00f6ff') + 'b3'};
  margin: 0.5rem 0;
  letter-spacing: 2px;
  position: relative;
  z-index: 2;
  text-align: center;
  letter-spacing: 2px;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  animation: ${fadeIn} 1s;
  position: relative;
  order: 2;
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

const ButtonsContainer = styled(motion.div)`
  display: flex;
  gap: 1.2rem;
  margin: 1.5rem 0;
  z-index: 1;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  max-width: 500px;
  padding: 0 1rem;
  
  @media (max-width: 480px) {
    gap: 0.8rem;
    margin: 1rem 0;
  }
`;

const TimerButton = styled(motion.button)`
  background: ${props => props.theme?.background || '#0c141f'};
  color: ${props => props.theme?.primary || '#00f6ff'};
  border: 2px solid ${props => props.theme?.primary || '#00f6ff'};
  padding: 0.9rem 1.8rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  transition: all 0.3s ease;
  box-shadow: 0 0 15px ${props => (props.theme?.primary || '#00f6ff') + '4d'};
  position: relative;
  overflow: hidden;
  z-index: 1;
  min-width: 120px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      ${props => props.theme?.primary + '33' || 'rgba(0, 246, 255, 0.2)'},
      transparent
    );
    transition: 0.5s;
    z-index: -1;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:hover {
    background: ${props => props.theme?.primary + '1a' || 'rgba(0, 246, 255, 0.1)'};
    box-shadow: 0 0 25px ${props => (props.theme?.primary || '#00f6ff') + 'b3'};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 480px) {
    padding: 0.7rem 1.2rem;
    font-size: 1rem;
    min-width: 100px;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
`;

const Notification = styled(motion.div)`
  background: ${props => props.theme?.background || '#0c141f'};
  border: 1px solid ${props => props.theme?.primary || '#00f6ff'};
  color: ${props => props.theme?.text || '#ffffff'};
  padding: 1rem;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  box-shadow: 0 0 10px ${props => (props.theme?.primary || '#00f6ff') + '40'};
`;

const Timer = ({ session = {}, onComplete = () => {}, onPause = () => {}, onResume = () => {}, onReset = () => {} }) => {
  const { focusData } = useData();
  const currentThemeId = focusData?.settings?.theme || 'tron';
  const theme = AVAILABLE_THEMES[currentThemeId] || AVAILABLE_THEMES.tron;
  const backgroundStyle = focusData?.settings?.backgroundStyle || 'grid';
  const musicYoutubeUrl = focusData?.settings?.musicYoutubeUrl || '';
  
  // Get session type first
  const sessionType = session?.type || 'focus'; // Default to focus session
  
  // Get duration from settings based on session type
  let defaultDuration = 25;
  if (sessionType === 'focus' && focusData?.settings?.focusDuration) {
    defaultDuration = focusData.settings.focusDuration;
  } else if (sessionType === 'shortBreak' && focusData?.settings?.shortBreakDuration) {
    defaultDuration = focusData.settings.shortBreakDuration;
  } else if (sessionType === 'longBreak' && focusData?.settings?.longBreakDuration) {
    defaultDuration = focusData.settings.longBreakDuration;
  }
  
  const duration = session?.duration || defaultDuration; // Use settings-based default if not provided
  
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [wasInterrupted, setWasInterrupted] = useState(false);
  const timerRef = useRef(null);
  
  // Show notification
  const showNotification = useCallback((message) => {
    // Use the NotificationManager to show notifications
    const soundUrl = focusData?.settings?.sound ? TimerSounds.getSoundUrl(focusData.settings.sound) : null;
    
    NotificationManager.notify(message, {
      title: 'TRON Focus Timer',
      sound: soundUrl,
      showBrowser: focusData?.settings?.notifications,
      showInApp: true
    }).catch(error => {
      console.error('Notification error:', error);
    });
  }, [focusData?.settings?.notifications, focusData?.settings?.sound]);
  
  // Extract YouTube video ID
  const getYoutubeVideoId = useCallback((url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }, []);
  
  const youtubeVideoId = useMemo(() => getYoutubeVideoId(musicYoutubeUrl), [musicYoutubeUrl, getYoutubeVideoId]);
  
  // Handle timer complete
  const handleTimerComplete = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    
    // Show notification
    if (focusData?.settings?.notifications) {
      showNotification(`${sessionType === 'focus' ? 'FOCUS SESSION' : 'BREAK'} completed!`);
    }
    
    // Play sound if enabled
    if (focusData?.settings?.sound) {
      TimerSounds.play(focusData.settings.sound);
    }
    
    // Call the onComplete callback with interruption status
    onComplete({
      wasInterrupted: timerRef.current ? timerRef.current.wasInterrupted() : wasInterrupted,
      sessionType,
      duration
    });
  }, [focusData?.settings?.notifications, focusData?.settings?.sound, sessionType, duration, onComplete, showNotification, wasInterrupted]);
  
  // Generate random code characters for the code rain effect
  const generateRandomCode = () => {
    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    let result = '';
    const length = 20 + Math.floor(Math.random() * 30);
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };
  
  // Generate random circuit paths
  const generateCircuitPaths = () => {
    const paths = [];
    const nodes = [];
    
    // Create 10 random circuit paths
    for (let i = 0; i < 10; i++) {
      const startX = Math.random() * 1000;
      const startY = Math.random() * 1000;
      
      let path = `M ${startX},${startY}`;
      let currentX = startX;
      let currentY = startY;
      
      nodes.push({ x: startX, y: startY });
      
      // Add 5-10 segments to each path
      const segments = 5 + Math.floor(Math.random() * 5);
      for (let j = 0; j < segments; j++) {
        // Decide if we're going horizontal or vertical
        const isHorizontal = Math.random() > 0.5;
        
        // Calculate new position with some randomness
        const length = 30 + Math.random() * 100;
        const newX = isHorizontal ? currentX + length : currentX;
        const newY = isHorizontal ? currentY : currentY + length;
        
        // Add line to path
        path += ` L ${newX},${newY}`;
        
        // Update current position
        currentX = newX;
        currentY = newY;
        
        // Add node at junction
        nodes.push({ x: currentX, y: currentY });
      }
      
      paths.push(path);
    }
    
    return { paths, nodes };
  };
  
  const circuitData = useMemo(() => generateCircuitPaths(), []);
  const codeColumns = useMemo(() => {
    const columns = [];
    for (let i = 0; i < 30; i++) {
      columns.push({
        id: i,
        position: Math.random() * 100,
        content: generateRandomCode()
      });
    }
    return columns;
  }, []);
  
  // Request notification permission
  useEffect(() => {
    if (focusData?.settings?.notifications) {
      NotificationManager.requestNotificationPermission()
        .catch(error => {
          console.log('Notification permission error:', error);
        });
    }
  }, [focusData?.settings?.notifications]);
  
  // Handle timer interruption
  const handleInterruption = useCallback(() => {
    setWasInterrupted(true);
  }, []);
  
  // Initialize the timer
  useEffect(() => {
    // Create a new timer
    timerRef.current = TimerManager.createCountdownTimer({
      duration: timeLeft,
      onTick: (remaining) => {
        setTimeLeft(remaining);
      },
      onComplete: handleTimerComplete,
      onInterruption: handleInterruption
    });
    
    // Start the timer if it should be active
    if (isActive && !isPaused) {
      timerRef.current.start();
    }
    
    // Clean up the timer when the component unmounts
    return () => {
      if (timerRef.current) {
        timerRef.current.destroy();
      }
    };
  }, [handleTimerComplete, handleInterruption, timeLeft, isActive, isPaused]);
  
  // Update timer when settings change
  useEffect(() => {
    // Get the appropriate duration based on session type and settings
    let newDuration = duration;
    if (sessionType === 'focus' && focusData?.settings?.focusDuration) {
      newDuration = focusData.settings.focusDuration;
    } else if (sessionType === 'shortBreak' && focusData?.settings?.shortBreakDuration) {
      newDuration = focusData.settings.shortBreakDuration;
    } else if (sessionType === 'longBreak' && focusData?.settings?.longBreakDuration) {
      newDuration = focusData.settings.longBreakDuration;
    }
    
    // Only update if the timer is not active and the duration has changed
    if (!isActive && newDuration !== duration) {
      // Reset the timer with the new duration
      setTimeLeft(newDuration * 60);
      
      if (timerRef.current) {
        timerRef.current.reset(newDuration * 60);
      }
    }
  }, [focusData?.settings, sessionType, duration, isActive]);
  
  // Update timer state when isActive or isPaused changes
  useEffect(() => {
    if (!timerRef.current) return;
    
    if (isActive && !isPaused) {
      timerRef.current.start();
    } else if (isPaused) {
      timerRef.current.pause();
    } else if (!isActive) {
      timerRef.current.stop();
    }
  }, [isActive, isPaused]);
  
  // Start timer
  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
    setWasInterrupted(false);
    
    if (timerRef.current) {
      timerRef.current.start();
    }
    
    // Preload the completion sound
    if (focusData?.settings?.sound) {
      const soundUrl = TimerSounds.getSoundUrl(focusData.settings.sound);
      NotificationManager.preloadSound(soundUrl);
    }
  };
  
  // Pause timer
  const pauseTimer = () => {
    setIsPaused(true);
    
    if (timerRef.current) {
      timerRef.current.pause();
    }
    
    // Call the onPause callback
    onPause();
  };
  
  // Resume timer
  const resumeTimer = () => {
    setIsPaused(false);
    
    if (timerRef.current) {
      timerRef.current.resume();
    }
    
    // Call the onResume callback
    onResume();
  };
  
  // Reset timer
  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setWasInterrupted(false);
    
    if (timerRef.current) {
      timerRef.current.reset(duration * 60);
    } else {
      setTimeLeft(duration * 60);
    }
    
    // Call the onReset callback
    onReset();
  };
  
  // Skip current session
  const skipSession = () => {
    // Stop the timer first
    if (timerRef.current) {
      timerRef.current.stop();
    }
    
    // Set timer state
    setIsActive(false);
    setIsPaused(false);
    
    // Play sound if enabled (directly using NotificationManager to avoid TimerSounds issue)
    if (focusData?.settings?.sound) {
      const soundUrl = `/sounds/${focusData.settings.sound === 'digital' ? 'digital-alarm' : focusData.settings.sound}.mp3`;
      NotificationManager.playSound(soundUrl).catch(error => {
        console.warn('Error playing skip sound:', error);
      });
    }
    
    // Call the onComplete callback with interruption status
    onComplete({
      wasInterrupted: false,
      sessionType,
      duration
    });
  };
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) {
      return '00:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <TimerContainer $backgroundStyle={backgroundStyle} theme={theme}>
      {/* Enhanced TRON-inspired data flow lines */}
      <DataFlowLines viewBox="0 0 1000 1000" $backgroundStyle={backgroundStyle}>
        {Array.from({ length: 8 }).map((_, i) => (
          <DataLine 
            key={`line-${i}`}
            d={`M ${Math.random() * 1000},0 C ${Math.random() * 1000},${Math.random() * 1000} ${Math.random() * 1000},${Math.random() * 1000} ${Math.random() * 1000},1000`} 
            theme={theme} 
            style={{
              animationDelay: `${i * 0.5}s`,
              opacity: 0.3 + (Math.random() * 0.3)
            }}
          />
        ))}
      </DataFlowLines>
      
      {/* Circuit background */}
      <CircuitLines viewBox="0 0 1000 1000" $backgroundStyle={backgroundStyle}>
        {circuitData.paths.map((path, index) => (
          <CircuitLine key={`path-${index}`} d={path} theme={theme} />
        ))}
        {circuitData.nodes.map((node, index) => (
          <CircuitNode key={`node-${index}`} cx={node.x} cy={node.y} theme={theme} />
        ))}
      </CircuitLines>
      
      {/* Code rain effect */}
      <CodeRainContainer $backgroundStyle={backgroundStyle}>
        {codeColumns.map(column => (
          <CodeColumn 
            key={column.id} 
            $position={column.position} 
            $theme={theme}
          >
            {column.content}
          </CodeColumn>
        ))}
      </CodeRainContainer>
      
      <ProgressRingContainer
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring', damping: 10, stiffness: 100 }}
      >
        <svg viewBox="0 0 250 250">
          {/* Background circle */}
          <circle
            cx="125"
            cy="125"
            r="120"
            fill="none"
            stroke={theme.grid}
            strokeWidth="10"
            opacity="0.3"
          />
          {/* Progress circle */}
          <motion.circle
            cx="125"
            cy="125"
            r="120"
            fill="none"
            stroke={theme.primary}
            strokeWidth="12"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - ((timeLeft || 0) / (duration * 60 || 1)))}
            strokeLinecap="round"
            transform="rotate(-90 125 125)"
            style={{
              filter: `drop-shadow(0 0 8px ${theme.primary + '80'})`
            }}
            transition={{
              strokeDashoffset: { duration: 1, ease: 'linear' }
            }}
          />
          {/* Inner glow */}
          <circle
            cx="125"
            cy="125"
            r="114"
            fill="none"
            stroke={theme.primary}
            strokeWidth="2"
            opacity="0.3"
          />
        </svg>
      </ProgressRingContainer>
      
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <TimerDisplay
          key={timeLeft}
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 10, stiffness: 100 }}
        >
          {formatTime(timeLeft)}
        </TimerDisplay>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <SessionLabel>
          {sessionType === 'focus' ? 'FOCUS SESSION' : 'BREAK'}
          {sessionType === 'focus' && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                repeat: Infinity, 
                repeatType: 'reverse',
                duration: 2,
                ease: 'easeInOut'
              }}
              style={{
                display: 'inline-block',
                marginLeft: '10px',
                color: theme.primary,
                textShadow: `0 0 8px ${theme.primary}`
              }}
            >
              ⚡
            </motion.span>
          )}
        </SessionLabel>
      </motion.div>
      
      {/* YouTube player */}
      {youtubeVideoId && (
        <YouTubePlayerContainer $url={musicYoutubeUrl}>
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&controls=1&loop=1&playlist=${youtubeVideoId}`}
            title="YouTube music player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </YouTubePlayerContainer>
      )}
      
      <ButtonsContainer
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
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
          disabled={!isActive && timeLeft === duration * 60}
        >
          Reset
        </TimerButton>
        
        <TimerButton 
          onClick={skipSession}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          data-active="false"
        >
          Skip
        </TimerButton>
      </ButtonsContainer>
    </TimerContainer>
  );
};

Timer.propTypes = {
  session: PropTypes.object.isRequired,
  onComplete: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onResume: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default Timer;
