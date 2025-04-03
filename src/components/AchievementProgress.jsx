import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const ProgressContainer = styled.div`
  margin-bottom: 15px;
  padding: 15px;
  background-color: ${props => props.theme.background || '#0c141f'};
  border: 1px solid ${props => props.theme.grid || '#1d2c3f'};
  border-radius: 8px;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const Title = styled.h4`
  margin: 0;
  color: ${props => props.theme.text || '#ffffff'};
  display: flex;
  align-items: center;
`;

const Icon = styled.span`
  margin-right: 8px;
  font-size: 1.2em;
`;

const ProgressValue = styled.div`
  color: ${props => props.theme.primary || '#00f6ff'};
  font-weight: bold;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 10px;
  background-color: ${props => props.theme.grid || '#1d2c3f'};
  border-radius: 5px;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  height: 100%;
  width: ${props => props.percentage}%;
  background-color: ${props => props.theme.primary || '#00f6ff'};
  transition: width 0.5s ease;
`;

const ProgressDetails = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 0.8em;
  color: ${props => props.theme.text || '#ffffff'};
  opacity: 0.8;
`;

const AchievementProgress = ({ achievement, progress, theme }) => {
  const percentage = progress.percentage || 0;
  
  return (
    <ProgressContainer theme={theme}>
      <ProgressHeader>
        <Title theme={theme}>
          <Icon>{achievement.icon}</Icon>
          {achievement.title} - Level {achievement.level}
        </Title>
        <ProgressValue theme={theme}>
          {progress.current} / {progress.required}
        </ProgressValue>
      </ProgressHeader>
      
      <ProgressBarContainer theme={theme}>
        <ProgressBar 
          percentage={percentage} 
          theme={theme} 
        />
      </ProgressBarContainer>
      
      <ProgressDetails theme={theme}>
        <span>{achievement.description}</span>
        <span>{Math.round(percentage)}%</span>
      </ProgressDetails>
    </ProgressContainer>
  );
};

AchievementProgress.propTypes = {
  achievement: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    level: PropTypes.number.isRequired,
    icon: PropTypes.string.isRequired
  }).isRequired,
  progress: PropTypes.shape({
    current: PropTypes.number.isRequired,
    required: PropTypes.number.isRequired,
    percentage: PropTypes.number.isRequired
  }).isRequired,
  theme: PropTypes.object
};

export default AchievementProgress;
