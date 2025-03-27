import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { useAchievements } from '../../context/AchievementContext';

const Container = styled.div`
  background: linear-gradient(135deg, rgba(12, 20, 31, 0.8) 0%, rgba(26, 43, 71, 0.9) 100%);
  border: 1px solid ${props => props.theme.primary};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 0 15px ${props => props.theme.primary + '40'};
`;

const Title = styled.h3`
  color: ${props => props.theme.primary};
  margin: 0 0 15px;
  font-size: 1.2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
`;

const StatCard = styled(motion.div)`
  background-color: rgba(0, 246, 255, 0.1);
  border: 1px solid ${props => props.theme.primary};
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.primary};
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.text};
`;

const DateRangeText = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme.text};
  margin-bottom: 15px;
`;

const StatsSummary = ({ timeRange, dateRange }) => {
  const { focusData, getSessionsForDateRange } = useData();
  const { getAllAchievements } = useAchievements();
  
  const sessions = getSessionsForDateRange(dateRange.startDate, dateRange.endDate);
  const completedSessions = sessions.filter(s => s.completed);
  
  // Calculate statistics
  const totalSessions = sessions.length;
  const completionRate = totalSessions > 0 
    ? Math.round((completedSessions.length / totalSessions) * 100) 
    : 0;
  
  const totalFocusTime = completedSessions.reduce((total, session) => total + session.duration, 0);
  const averageFocusTime = completedSessions.length > 0 
    ? Math.round(totalFocusTime / completedSessions.length) 
    : 0;
  
  const currentStreak = focusData.streaks.current;
  
  // Get achievement stats
  const allAchievements = getAllAchievements();
  const unlockedAchievements = allAchievements.filter(a => a.unlocked).length;
  const achievementPercentage = Math.round((unlockedAchievements / allAchievements.length) * 100);
  
  // Format date range for display
  const formatDateRange = () => {
    const start = new Date(dateRange.startDate).toLocaleDateString();
    const end = new Date(dateRange.endDate).toLocaleDateString();
    
    if (timeRange === 'day') {
      return `Today (${start})`;
    } else {
      return `${start} - ${end}`;
    }
  };
  
  return (
    <Container>
      <Title>Performance Summary</Title>
      <DateRangeText>{formatDateRange()}</DateRangeText>
      
      <StatsGrid>
        <StatCard
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <StatValue>{totalSessions}</StatValue>
          <StatLabel>Total Sessions</StatLabel>
        </StatCard>
        
        <StatCard
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <StatValue>{completedSessions.length}</StatValue>
          <StatLabel>Completed Sessions</StatLabel>
        </StatCard>
        
        <StatCard
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <StatValue>{completionRate}%</StatValue>
          <StatLabel>Completion Rate</StatLabel>
        </StatCard>
        
        <StatCard
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <StatValue>{totalFocusTime}</StatValue>
          <StatLabel>Total Focus Minutes</StatLabel>
        </StatCard>
        
        <StatCard
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <StatValue>{averageFocusTime}</StatValue>
          <StatLabel>Avg. Session Length</StatLabel>
        </StatCard>
        
        <StatCard
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <StatValue>{currentStreak}</StatValue>
          <StatLabel>Current Streak</StatLabel>
        </StatCard>
        
        <StatCard
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <StatValue>{unlockedAchievements}</StatValue>
          <StatLabel>Achievements Unlocked</StatLabel>
        </StatCard>
        
        <StatCard
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <StatValue>{achievementPercentage}%</StatValue>
          <StatLabel>Achievement Progress</StatLabel>
        </StatCard>
      </StatsGrid>
    </Container>
  );
};

export default StatsSummary;
