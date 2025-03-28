import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAchievements } from '../../context/AchievementContext';

const Card = styled(motion.div)`
  background: linear-gradient(135deg, rgba(12, 20, 31, 0.8) 0%, rgba(26, 43, 71, 0.9) 100%);
  border: 2px solid ${props => props.$unlocked ? props.theme.success : props.theme.primary};
  border-radius: 8px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 15px ${props => props.$unlocked ? props.theme.success + '40' : props.theme.primary + '40'};
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, ${props => props.$unlocked ? props.theme.success : props.theme.primary}, transparent);
    animation: ${props => props.$unlocked ? 'scan 2s linear infinite' : 'none'};
  }
  
  @keyframes scan {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const AchievementIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.$unlocked ? props.theme.success + '20' : props.theme.primary + '20'};
  border: 1px solid ${props => props.$unlocked ? props.theme.success : props.theme.primary};
  margin: 0 auto 15px;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  margin: 0 0 10px;
  color: ${props => props.$unlocked ? props.theme.success : props.theme.primary};
  text-align: center;
  font-weight: 700;
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: ${props => props.theme.text};
  margin: 0 0 15px;
  text-align: center;
`;

const ProgressContainer = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${props => props.theme.background};
  border-radius: 4px;
  margin: 10px 0;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  width: ${props => props.$progress}%;
  background-color: ${props => props.$unlocked ? props.theme.success : props.theme.primary};
  border-radius: 4px;
  transition: width 0.5s ease;
`;

const ProgressText = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.text};
  text-align: center;
  margin-bottom: 15px;
`;

const RewardBadge = styled.div`
  background-color: ${props => props.$unlocked ? props.theme.success + '20' : props.theme.primary + '20'};
  border: 1px solid ${props => props.$unlocked ? props.theme.success : props.theme.primary};
  color: ${props => props.$unlocked ? props.theme.success : props.theme.text};
  font-size: 0.8rem;
  padding: 5px 10px;
  border-radius: 20px;
  display: inline-block;
  text-align: center;
  width: fit-content;
  margin: 0 auto;
`;

const LevelIndicator = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.7rem;
  color: ${props => props.theme.text};
  background-color: rgba(0, 0, 0, 0.3);
  padding: 3px 8px;
  border-radius: 10px;
`;

const UnlockedDate = styled.div`
  font-size: 0.7rem;
  color: ${props => props.theme.text + '80'};
  text-align: center;
  margin-top: 10px;
`;

const AchievementCard = ({ achievement }) => {
  const { getAchievementProgress } = useAchievements();
  
  const progress = getAchievementProgress(achievement.type, achievement.level);
  const formattedDate = achievement.unlockedAt 
    ? new Date(achievement.unlockedAt).toLocaleDateString() 
    : null;
  
  return (
    <Card 
      $unlocked={achievement.unlocked}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <LevelIndicator>Level {achievement.level}</LevelIndicator>
      <AchievementIcon $unlocked={achievement.unlocked}>
        {achievement.icon}
      </AchievementIcon>
      <Title $unlocked={achievement.unlocked}>{achievement.title}</Title>
      <Description>{achievement.description}</Description>
      
      <ProgressContainer>
        <ProgressBar 
          $progress={progress.percentage} 
          $unlocked={achievement.unlocked} 
        />
      </ProgressContainer>
      
      <ProgressText>
        {progress.current} / {achievement.requirement} {achievement.type === 'focusMaster' ? 'hours' : 'sessions'}
      </ProgressText>
      
      <RewardBadge $unlocked={achievement.unlocked}>
        {achievement.reward}
      </RewardBadge>
      
      {achievement.unlocked && (
        <UnlockedDate>Unlocked on {formattedDate}</UnlockedDate>
      )}
    </Card>
  );
};

export default AchievementCard;
