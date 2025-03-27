import React, { useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const NotificationCard = styled(motion.div)`
  background: linear-gradient(135deg, rgba(0, 246, 255, 0.1) 0%, rgba(0, 88, 248, 0.2) 100%);
  border: 2px solid ${props => props.theme.success};
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 20px ${props => props.theme.success + '60'};
  max-width: 300px;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, ${props => props.theme.success}, transparent);
    animation: scan 2s linear infinite;
  }
  
  @keyframes scan {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Icon = styled.div`
  font-size: 1.8rem;
  margin-right: 10px;
`;

const Title = styled.h4`
  margin: 0;
  color: ${props => props.theme.success};
  font-size: 1rem;
`;

const Content = styled.div`
  margin-bottom: 10px;
`;

const Description = styled.p`
  margin: 0 0 5px;
  font-size: 0.9rem;
  color: ${props => props.theme.text};
`;

const Reward = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.success};
  font-weight: 500;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: transparent;
  border: none;
  color: ${props => props.theme.text};
  font-size: 0.8rem;
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    color: ${props => props.theme.success};
  }
`;

const UnlockAnimation = ({ achievement, onDismiss }) => {
  // Auto-dismiss after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onDismiss]);
  
  return (
    <NotificationCard
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      transition={{ duration: 0.4 }}
      layout
    >
      <CloseButton onClick={onDismiss}>×</CloseButton>
      
      <Header>
        <Icon>{achievement.icon}</Icon>
        <Title>Achievement Unlocked!</Title>
      </Header>
      
      <Content>
        <Description>
          {achievement.title} (Level {achievement.level})
        </Description>
        <Reward>Reward: {achievement.reward}</Reward>
      </Content>
      
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 5 }}
        style={{
          height: '3px',
          background: `linear-gradient(90deg, ${achievement.theme?.success || '#00ff9d'}, transparent)`,
          alignSelf: 'flex-start'
        }}
      />
    </NotificationCard>
  );
};

export default UnlockAnimation;
