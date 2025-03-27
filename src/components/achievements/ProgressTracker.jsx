import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
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

const ProgressGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
`;

const CategoryProgress = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CategoryTitle = styled.h4`
  margin: 0;
  color: ${props => props.theme.text};
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CategoryIcon = styled.span`
  font-size: 1.2rem;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBar = styled(motion.div)`
  height: 100%;
  width: ${props => props.progress}%;
  background-color: ${props => props.theme.primary};
  border-radius: 4px;
`;

const ProgressStats = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: ${props => props.theme.text};
`;

const OverallStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid ${props => props.theme.primary + '40'};
`;

const StatBox = styled(motion.div)`
  background-color: rgba(0, 246, 255, 0.1);
  border: 1px solid ${props => props.theme.primary};
  border-radius: 4px;
  padding: 15px;
  text-align: center;
  flex: 1;
  
  &:not(:last-child) {
    margin-right: 10px;
  }
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${props => props.theme.primary};
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${props => props.theme.text};
`;

const ProgressTracker = () => {
  const { achievementTypes, getAllAchievements } = useAchievements();
  
  const allAchievements = getAllAchievements();
  const unlockedCount = allAchievements.filter(a => a.unlocked).length;
  const totalCount = allAchievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);
  
  // Calculate progress for each category
  const categoryProgress = Object.entries(achievementTypes).map(([typeId, typeData]) => {
    const typeAchievements = allAchievements.filter(a => a.type === typeId);
    const unlockedTypeCount = typeAchievements.filter(a => a.unlocked).length;
    const totalTypeCount = typeAchievements.length;
    const progress = (unlockedTypeCount / totalTypeCount) * 100;
    
    return {
      id: typeId,
      title: typeData.title,
      icon: typeData.icon,
      unlocked: unlockedTypeCount,
      total: totalTypeCount,
      progress
    };
  });
  
  return (
    <Container>
      <Title>Achievement Progress</Title>
      
      <ProgressGrid>
        {categoryProgress.map(category => (
          <CategoryProgress key={category.id}>
            <CategoryTitle>
              <CategoryIcon>{category.icon}</CategoryIcon>
              {category.title}
            </CategoryTitle>
            
            <ProgressBarContainer>
              <ProgressBar 
                progress={category.progress}
                initial={{ width: 0 }}
                animate={{ width: `${category.progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </ProgressBarContainer>
            
            <ProgressStats>
              <span>{category.unlocked} / {category.total} unlocked</span>
              <span>{Math.round(category.progress)}%</span>
            </ProgressStats>
          </CategoryProgress>
        ))}
      </ProgressGrid>
      
      <OverallStats>
        <StatBox
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <StatValue>{unlockedCount}</StatValue>
          <StatLabel>Achievements Unlocked</StatLabel>
        </StatBox>
        
        <StatBox
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <StatValue>{totalCount - unlockedCount}</StatValue>
          <StatLabel>Achievements Remaining</StatLabel>
        </StatBox>
        
        <StatBox
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <StatValue>{completionPercentage}%</StatValue>
          <StatLabel>Overall Completion</StatLabel>
        </StatBox>
      </OverallStats>
    </Container>
  );
};

export default ProgressTracker;
