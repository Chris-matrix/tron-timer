import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievements } from '../../context/AchievementContext';
import AchievementCard from './AchievementCard';
import ProgressTracker from './ProgressTracker';
import UnlockAnimation from './UnlockAnimation';

const Container = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: ${props => props.theme.primary};
  margin: 0;
  font-size: 1.8rem;
  text-shadow: 0 0 10px ${props => props.theme.primary + '60'};
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const FilterButton = styled(motion.button)`
  background: transparent;
  border: 1px solid ${props => props.active ? props.theme.accent : props.theme.primary};
  color: ${props => props.active ? props.theme.accent : props.theme.primary};
  padding: 8px 16px;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 4px;
  
  &:hover {
    box-shadow: 0 0 10px ${props => props.active ? props.theme.accent + '60' : props.theme.primary + '60'};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => props.theme.text};
  border: 1px dashed ${props => props.theme.primary};
  border-radius: 8px;
  margin: 20px 0;
`;

const NotificationContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 300px;
`;

const AchievementList = () => {
  const { achievements, getAllAchievements, dismissNotification } = useAchievements();
  const [filter, setFilter] = useState('all'); // all, unlocked, locked
  
  const allAchievements = getAllAchievements();
  
  // Filter achievements based on current filter
  const filteredAchievements = allAchievements.filter(achievement => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    return true;
  });
  
  // Sort achievements: unlocked first, then by level
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    // First sort by unlock status
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    
    // Then sort by type
    if (a.type !== b.type) {
      return a.type.localeCompare(b.type);
    }
    
    // Then sort by level
    return a.level - b.level;
  });
  
  return (
    <Container>
      <Header>
        <Title>Achievements</Title>
        <FilterContainer>
          <FilterButton 
            active={filter === 'all'} 
            onClick={() => setFilter('all')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            All
          </FilterButton>
          <FilterButton 
            active={filter === 'unlocked'} 
            onClick={() => setFilter('unlocked')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Unlocked
          </FilterButton>
          <FilterButton 
            active={filter === 'locked'} 
            onClick={() => setFilter('locked')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Locked
          </FilterButton>
        </FilterContainer>
      </Header>
      
      <ProgressTracker />
      
      {sortedAchievements.length > 0 ? (
        <Grid>
          {sortedAchievements.map(achievement => (
            <AchievementCard 
              key={achievement.id} 
              achievement={achievement} 
            />
          ))}
        </Grid>
      ) : (
        <EmptyState>
          <h3>No achievements found</h3>
          <p>Change your filter or complete more focus sessions to unlock achievements!</p>
        </EmptyState>
      )}
      
      {/* Achievement Notifications */}
      <NotificationContainer>
        <AnimatePresence>
          {achievements.notifications.map(notification => (
            <UnlockAnimation 
              key={notification.id} 
              achievement={notification} 
              onDismiss={() => dismissNotification(notification.id)} 
            />
          ))}
        </AnimatePresence>
      </NotificationContainer>
    </Container>
  );
};

export default AchievementList;
