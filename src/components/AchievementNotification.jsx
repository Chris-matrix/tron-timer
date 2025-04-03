import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

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
  animation: slideIn 0.5s ease-out forwards;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  &.closing {
    animation: slideOut 0.5s ease-in forwards;
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

const AchievementNotification = ({ achievement, onClose, theme, autoCloseTime = 5000 }) => {
  const [isClosing, setIsClosing] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, autoCloseTime);
    
    return () => clearTimeout(timer);
  }, [autoCloseTime]);
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 500); // Match the animation duration
  };
  
  return (
    <NotificationContainer theme={theme} className={isClosing ? 'closing' : ''}>
      <CloseButton onClick={handleClose} theme={theme}>×</CloseButton>
      <Title theme={theme}>
        <Icon>{achievement.icon}</Icon>
        Achievement Unlocked!
      </Title>
      <Message>
        <strong>{achievement.title} Level {achievement.level}</strong>: {achievement.description}
      </Message>
      <div>Reward: {achievement.reward}</div>
    </NotificationContainer>
  );
};

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
