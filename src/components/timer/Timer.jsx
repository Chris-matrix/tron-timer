import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { useData, AVAILABLE_THEMES } from '../../context/DataContext';
import { useAchievements } from '../../context/AchievementContext';
import TimerSounds from './TimerSounds';
import PropTypes from 'prop-types';

// TRON-inspired animations
const glowEffect = keyframes`
  0% { filter: drop-shadow(0 0 5px ${props => props.theme?.primary || '#00f6ff'}); }
  50% { filter: drop-shadow(0 0 20px ${props => props.theme?.primary || '#00f6ff'}); }
  100% { filter: drop-shadow(0 0 5px ${props => props.theme?.primary || '#00f6ff'}); }
`;

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

const TimerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  height: 100%;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => {
      if (props.backgroundStyle === 'grid' || !props.backgroundStyle) {
        return `
          linear-gradient(to right, ${props.theme?.grid || '#1d2c3f'} 1px, transparent 1px),
          linear-gradient(to bottom, ${props.theme?.grid || '#1d2c3f'} 1px, transparent 1px)
        `;
      }
      return 'none';
    }};
    background-size: 30px 30px;
    opacity: 0.15;
    z-index: -1;
    animation: ${props => props.backgroundStyle === 'grid' ? gridLines : 'none'} 8s infinite;
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
  display: ${props => props.backgroundStyle === 'minimal' ? 'none' : 'block'};
`;

const DataLine = styled.path`
  fill: none;
  stroke: ${props => props.theme?.primary || '#00f6ff'};
  stroke-width: 2;
  stroke-dasharray: 10, 15;
  animation: ${dataFlow} 20s linear infinite;
`;

// Circuit background
const CircuitBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  display: ${props => props.backgroundStyle === 'circuits' ? 'block' : 'none'};
  
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

const CircuitLines = styled.svg`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  opacity: 0.3;
  display: ${props => props.backgroundStyle === 'circuits' ? 'block' : 'none'};
`;

const CircuitLine = styled.path`
  fill: none;
  stroke: ${props => props.theme?.primary || '#00f6ff'};
  stroke-width: 1.5;
  stroke-linecap: round;
  animation: ${circuitPulse} ${props => 3 + Math.random() * 5}s ease-in-out infinite;
`;

const CircuitNode = styled.circle`
  fill: ${props => props.theme?.primary || '#00f6ff'};
  r: 3;
  opacity: 0.8;
  filter: drop-shadow(0 0 2px ${props => props.theme?.primary || '#00f6ff'});
`;

// Code rain effect
const CodeRainContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
  display: ${props => props.backgroundStyle === 'code' ? 'block' : 'none'};
`;

const CodeColumn = styled.div`
  position: absolute;
  top: 0;
  left: ${props => props.$position}%;
  color: ${props => props.$theme?.primary || '#00f6ff'};
  font-family: monospace;
  font-size: 14px;
  line-height: 1;
  animation: ${codeRain} ${props => 5 + Math.random() * 15}s linear infinite;
  animation-delay: ${props => Math.random() * 5}s;
  opacity: ${props => 0.3 + Math.random() * 0.7};
`;

// YouTube player
const YouTubePlayerContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 200px;
  height: 40px;
  z-index: 10;
  display: ${props => props.url ? 'block' : 'none'};
  background: rgba(0, 0, 0, 0.5);
  border-radius: 5px;
  padding: 5px;
`;

const ProgressRingContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 250px;
  height: 250px;
  order: 1;
`;

const TimerDisplay = styled(motion.div)`
  font-size: 4.5rem;
  font-family: 'Orbitron', sans-serif;
  color: ${props => props.theme?.primary || '#00f6ff'};
  text-shadow: 0 0 10px ${props => (props.theme?.primary || '#00f6ff') + '80'};
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

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const TimerButton = styled(motion.button)`
  background: ${props => props.theme?.background || '#0c141f'};
  color: ${props => props.theme?.primary || '#00f6ff'};
  border: 2px solid ${props => props.theme?.primary || '#00f6ff'};
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-family: 'Orbitron', sans-serif;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 0 10px ${props => (props.theme?.primary || '#00f6ff') + '40'};
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => (props.theme?.primary || '#00f6ff') + '20'};
    box-shadow: 0 0 15px ${props => (props.theme?.primary || '#00f6ff') + '60'};
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
  const currentThemeId = focusData.settings.theme || 'tron';
  const theme = AVAILABLE_THEMES[currentThemeId] || AVAILABLE_THEMES.tron;
  const backgroundStyle = focusData.settings.backgroundStyle || 'grid';
  const musicYoutubeUrl = focusData.settings.musicYoutubeUrl || '';
  
  const duration = session?.duration || 25; // Default to 25 minutes if not provided
  const sessionType = session?.type || 'focus'; // Default to focus session
  
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Show notification
  const showNotification = useCallback((message) => {
    console.log(message);
  }, []);
  
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
    
    // Show notification
    if (focusData.settings.notifications) {
      showNotification(`${sessionType === 'focus' ? 'FOCUS SESSION' : 'BREAK'} completed!`);
      
      // Browser notification
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification('TRON Focus Timer', {
            body: `${sessionType === 'focus' ? 'FOCUS SESSION' : 'BREAK'} completed!`,
            icon: '/favicon.ico'
          });
        } catch {
          // Ignore notification errors
        }
      }
    }
    
    onComplete();
  }, [focusData.settings.notifications, sessionType, onComplete, showNotification]);
  
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
    if (focusData.settings.notifications && typeof Notification !== 'undefined') {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        try {
          Notification.requestPermission();
        } catch {
          // Ignore errors - Notification API might not be supported
          console.log('Notification API not supported in this environment');
        }
      }
    }
  }, [focusData.settings.notifications]);
  
  // Timer logic
  useEffect(() => {
    let interval = null;
    
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTimeLeft(prevTimeLeft => {
          if (prevTimeLeft <= 1) {
            clearInterval(interval);
            handleTimerComplete();
            return 0;
          }
          return prevTimeLeft - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, isPaused, handleTimerComplete]);
  
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
    setTimeLeft(duration * 60);
  };
  
  // Skip current session
  const skipSession = () => {
    handleTimerComplete();
  };
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <TimerContainer backgroundStyle={backgroundStyle} theme={theme}>
      {/* Add TRON-inspired data flow lines */}
      <DataFlowLines viewBox="0 0 1000 1000" backgroundStyle={backgroundStyle}>
        <DataLine d="M 50,50 C 200,300 800,700 950,950" theme={theme} />
        <DataLine d="M 950,50 C 800,300 200,700 50,950" theme={theme} />
        <DataLine d="M 500,0 C 500,300 500,700 500,1000" theme={theme} />
        <DataLine d="M 0,500 C 300,500 700,500 1000,500" theme={theme} />
        <DataLine d="M 0,0 C 300,300 700,700 1000,1000" theme={theme} />
        <DataLine d="M 1000,0 C 700,300 300,700 0,1000" theme={theme} />
      </DataFlowLines>
      
      {/* Circuit background */}
      <CircuitLines viewBox="0 0 1000 1000" backgroundStyle={backgroundStyle}>
        {circuitData.paths.map((path, index) => (
          <CircuitLine key={`path-${index}`} d={path} theme={theme} />
        ))}
        {circuitData.nodes.map((node, index) => (
          <CircuitNode key={`node-${index}`} cx={node.x} cy={node.y} theme={theme} />
        ))}
      </CircuitLines>
      
      {/* Code rain effect */}
      <CodeRainContainer backgroundStyle={backgroundStyle}>
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
      
      <ProgressRingContainer>
        <svg width="250" height="250" viewBox="0 0 250 250">
          <circle
            cx="125"
            cy="125"
            r="120"
            fill="none"
            stroke={theme.grid}
            strokeWidth="10"
          />
          <circle
            cx="125"
            cy="125"
            r="120"
            fill="none"
            stroke={theme.primary}
            strokeWidth="10"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - (timeLeft / (duration * 60)))}
            strokeLinecap="round"
            transform="rotate(-90 125 125)"
          />
        </svg>
      </ProgressRingContainer>
      
      <TimerDisplay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {formatTime(timeLeft)}
      </TimerDisplay>
      
      <SessionLabel>{sessionType === 'focus' ? 'FOCUS SESSION' : 'BREAK'}</SessionLabel>
      
      {/* YouTube player */}
      {youtubeVideoId && (
        <YouTubePlayerContainer url={musicYoutubeUrl}>
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
          disabled={!isActive && timeLeft === duration * 60}
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
