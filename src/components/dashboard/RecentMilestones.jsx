import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAchievements } from '../../context/AchievementContext';

const Container = styled.div`
  background: linear-gradient(135deg, rgba(12, 20, 31, 0.8) 0%, rgba(26, 43, 71, 0.9) 100%);
  border: 1px solid ${props => props.theme.primary};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 0 15px ${props => props.theme.primary + '40'};
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  color: ${props => props.theme.primary};
  margin: 0 0 15px;
  font-size: 1.2rem;
`;

const MilestonesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-grow: 1;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 5px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.primary};
    border-radius: 10px;
  }
`;

const MilestoneItem = styled(motion.div)`
  background-color: rgba(0, 246, 255, 0.1);
  border: 1px solid ${props => props.theme.primary};
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MilestoneIcon = styled.div`
  font-size: 1.5rem;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 246, 255, 0.2);
  border-radius: 50%;
`;

const MilestoneContent = styled.div`
  flex-grow: 1;
`;

const MilestoneTitle = styled.h4`
  margin: 0 0 5px;
  color: ${props => props.theme.primary};
  font-size: 1rem;
`;

const MilestoneDescription = styled.p`
  margin: 0;
  font-size: 0.8rem;
  color: ${props => props.theme.text};
`;

const MilestoneDate = styled.div`
  font-size: 0.7rem;
  color: ${props => props.theme.text + '80'};
  margin-top: 5px;
`;

const UpcomingSection = styled.div`
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid ${props => props.theme.primary + '40'};
`;

const UpcomingTitle = styled.h3`
  color: ${props => props.theme.accent};
  margin: 0 0 15px;
  font-size: 1.2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 20px;
  color: ${props => props.theme.text};
  font-style: italic;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RecentMilestones = () => {
  const { achievements, getAllAchievements, getAchievementProgress } = useAchievements();
  
  // Get all achievements
  const allAchievements = getAllAchievements();
  
  // Get recently unlocked achievements (sorted by unlock date, most recent first)
  const recentAchievements = allAchievements
    .filter(a => a.unlocked)
    .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))
    .slice(0, 5); // Show only the 5 most recent
  
  // Get upcoming achievements (not unlocked, sorted by progress)
  const upcomingAchievements = allAchievements
    .filter(a => !a.unlocked)
    .map(a => ({
      ...a,
      progress: getAchievementProgress(a.type, a.level).percentage
    }))
    .sort((a, b) => b.progress - a.progress) // Sort by progress (highest first)
    .slice(0, 3); // Show only the top 3 closest to unlocking
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <Container>
      <Title>Recent Milestones</Title>
      
      <MilestonesList>
        {recentAchievements.length > 0 ? (
          recentAchievements.map((achievement, index) => (
            <MilestoneItem 
              key={achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <MilestoneIcon>{achievement.icon}</MilestoneIcon>
              <MilestoneContent>
                <MilestoneTitle>{achievement.title} (Level {achievement.level})</MilestoneTitle>
                <MilestoneDescription>
                  {achievement.description} - Reward: {achievement.reward}
                </MilestoneDescription>
                <MilestoneDate>Unlocked on {formatDate(achievement.unlockedAt)}</MilestoneDate>
              </MilestoneContent>
            </MilestoneItem>
          ))
        ) : (
          <EmptyState>
            No achievements unlocked yet. Complete focus sessions to earn achievements!
          </EmptyState>
        )}
      </MilestonesList>
      
      {upcomingAchievements.length > 0 && (
        <UpcomingSection>
          <UpcomingTitle>Upcoming Achievements</UpcomingTitle>
          
          <MilestonesList>
            {upcomingAchievements.map((achievement, index) => (
              <MilestoneItem 
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <MilestoneIcon>{achievement.icon}</MilestoneIcon>
                <MilestoneContent>
                  <MilestoneTitle>{achievement.title} (Level {achievement.level})</MilestoneTitle>
                  <MilestoneDescription>
                    {achievement.description} - {Math.round(achievement.progress)}% complete
                  </MilestoneDescription>
                </MilestoneContent>
              </MilestoneItem>
            ))}
          </MilestonesList>
        </UpcomingSection>
      )}
    </Container>
  );
};

export default RecentMilestones;
