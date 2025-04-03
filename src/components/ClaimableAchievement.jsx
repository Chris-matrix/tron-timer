import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const AchievementCard = styled.div`
  background-color: ${props => props.theme.background || '#0c141f'};
  border: 2px solid ${props => props.claimed ? '#666' : props.theme.primary || '#00f6ff'};
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  position: relative;
  transition: all 0.3s ease;
  opacity: ${props => props.claimed ? 0.7 : 1};
  
  &:hover {
    box-shadow: ${props => props.claimed ? 'none' : `0 0 10px ${props.theme.primary || '#00f6ff'}`};
  }
`;

const AchievementHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Icon = styled.span`
  font-size: 2em;
  margin-right: 15px;
  color: ${props => props.theme.primary || '#00f6ff'};
`;

const Title = styled.h3`
  margin: 0;
  color: ${props => props.theme.text || '#ffffff'};
`;

const Description = styled.p`
  margin: 5px 0;
  color: ${props => props.theme.text || '#ffffff'};
  opacity: 0.8;
`;

const RewardSection = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Reward = styled.div`
  color: ${props => props.theme.accent || '#00f6ff'};
  font-weight: bold;
`;

const ClaimButton = styled.button`
  background-color: ${props => props.theme.primary || '#00f6ff'};
  color: ${props => props.theme.background || '#0c141f'};
  border: none;
  border-radius: 4px;
  padding: 8px 15px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.theme.accent || '#00f6ff'};
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    background-color: #666;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ClaimedBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #666;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8em;
`;

const UnlockedDate = styled.div`
  font-size: 0.8em;
  color: ${props => props.theme.text || '#ffffff'};
  opacity: 0.6;
  margin-top: 5px;
`;

const ClaimableAchievement = ({ achievement, onClaim, theme }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AchievementCard theme={theme} claimed={achievement.claimed}>
      {achievement.claimed && <ClaimedBadge>Claimed</ClaimedBadge>}
      
      <AchievementHeader>
        <Icon theme={theme}>{achievement.icon}</Icon>
        <div>
          <Title theme={theme}>{achievement.title} - Level {achievement.level}</Title>
          <Description theme={theme}>{achievement.description}</Description>
        </div>
      </AchievementHeader>
      
      <RewardSection>
        <Reward theme={theme}>Reward: {achievement.reward}</Reward>
        {!achievement.claimed && (
          <ClaimButton 
            theme={theme} 
            onClick={() => onClaim(achievement.id)}
          >
            Claim Reward
          </ClaimButton>
        )}
      </RewardSection>
      
      <UnlockedDate theme={theme}>
        Unlocked: {formatDate(achievement.unlockedAt)}
      </UnlockedDate>
    </AchievementCard>
  );
};

ClaimableAchievement.propTypes = {
  achievement: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    level: PropTypes.number.isRequired,
    icon: PropTypes.string.isRequired,
    reward: PropTypes.string.isRequired,
    unlockedAt: PropTypes.string.isRequired,
    claimed: PropTypes.bool
  }).isRequired,
  onClaim: PropTypes.func.isRequired,
  theme: PropTypes.object
};

export default ClaimableAchievement;
