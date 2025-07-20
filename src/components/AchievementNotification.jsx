import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';

// Animation keyframes
const slideIn = keyframes`
  from {
    transform: translate3d(100%, 0, 0);
    opacity: 0;
  }
  to {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
  to {
    transform: translate3d(100%, 0, 0);
    opacity: 0;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 350px;
  background-color: ${props => props.theme.background || '#0c141f'};
  border: 2px solid ${props => props.theme.primary || '#00f6ff'};
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 246, 255, 0.4);
  padding: 15px;
  color: ${props => props.theme.text || '#ffffff'};
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
  animation: ${slideIn} 0.5s ease-out forwards;
  
  &.closing {
    animation: ${slideOut} 0.5s ease-in forwards;
  }
`;

const Title = styled.h3`
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  color: ${props => props.theme.primary || '#00f6ff'};
`;

const Icon = styled.span`
  font-size: 1.5em;
  margin-right: 10px;
`;

const Message = styled.p`
  margin: 0 0 15px 0;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: ${props => props.theme.text || '#ffffff'};
  cursor: pointer;
  font-size: 16px;
  
  &:hover {
    color: ${props => props.theme.primary || '#00f6ff'};
  }
`;

const AchievementNotification = React.memo(({ achievement, onClose, theme, autoCloseTime = 30000 }) => {
  const [isClosing, setIsClosing] = useState(false);
  const timerRef = useRef();
  
  const handleClose = useCallback(() => {
    setIsClosing(true);
    // Clear any pending auto-close timeout
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // Schedule the actual close after animation
    const closeTimer = setTimeout(() => {
      onClose();
    }, 500); // Match the animation duration
    
    return () => clearTimeout(closeTimer);
  }, [onClose]);
  
  useEffect(() => {
    // Set up auto-close timer
    timerRef.current = setTimeout(() => {
      handleClose();
    }, autoCloseTime);
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [autoCloseTime, handleClose]);
  
  // Memoize the notification content to prevent unnecessary re-renders
  const notificationContent = useMemo(() => ({
    title: `${achievement.title} Level ${achievement.level}`,
    description: achievement.description,
    reward: achievement.reward,
    icon: achievement.icon
  }), [achievement]);
  
  return (
    <NotificationContainer 
      theme={theme} 
      className={isClosing ? 'closing' : ''}
      aria-live="polite"
      role="status"
    >
      <CloseButton 
        onClick={handleClose} 
        theme={theme}
        aria-label="Close notification"
      >
        ×
      </CloseButton>
      <Title theme={theme}>
        <Icon aria-hidden="true">{notificationContent.icon}</Icon>
        Achievement Unlocked!
      </Title>
      <Message>
        <strong>{notificationContent.title}</strong>: {notificationContent.description}
      </Message>
      <div>Reward: {notificationContent.reward}</div>
    </NotificationContainer>
  );
});

AchievementNotification.propTypes = {
  achievement: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    level: PropTypes.number.isRequired,
    icon: PropTypes.string.isRequired,
    reward: PropTypes.string.isRequired
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  theme: PropTypes.object,
  autoCloseTime: PropTypes.number
};

export default AchievementNotification;
