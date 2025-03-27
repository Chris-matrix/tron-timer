import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { useAchievements } from '../../context/AchievementContext';
import RecentMilestones from './RecentMilestones';

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

const ProgressGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  
  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const ProgressCard = styled.div`
  background: linear-gradient(135deg, rgba(12, 20, 31, 0.8) 0%, rgba(26, 43, 71, 0.9) 100%);
  border: 1px solid ${props => props.theme.primary};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 0 15px ${props => props.theme.primary + '40'};
`;

const CardTitle = styled.h3`
  color: ${props => props.theme.primary};
  margin: 0 0 15px;
  font-size: 1.2rem;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
`;

const ProgressBar = styled(motion.div)`
  height: 100%;
  width: ${props => props.progress}%;
  background-color: ${props => props.theme.primary};
  border-radius: 6px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    animation: shine 1.5s infinite;
  }
  
  @keyframes shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: ${props => props.theme.text};
  margin-bottom: 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const StatCard = styled(motion.div)`
  background-color: rgba(0, 246, 255, 0.1);
  border: 1px solid ${props => props.theme.primary};
  border-radius: 8px;
  padding: 15px;
  text-align: center;
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

const MotivationalQuote = styled.div`
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: ${props => props.theme.text};
  border-top: 1px solid ${props => props.theme.primary + '40'};
  margin-top: 20px;
`;

// Motivational quotes array
const motivationalQuotes = [
  "The Grid. A digital frontier. I tried to picture clusters of information as they moved through the computer.",
  "The only way to achieve the impossible is to believe it is possible.",
  "Sometimes life has a way of moving you past wants and hopes.",
  "Chaos. Good news.",
  "Your combativeness makes you predictable.",
  "I'm not a program. I'm a user.",
  "It's all in the wrist.",
  "You're really in there, man.",
  "The game has changed, son of Flynn.",
  "I fight for the users!"
];

const ProgressOverview = () => {
  const { focusData, getDailyProgress, getWeeklyProgress } = useData();
  const { achievements, getAllAchievements } = useAchievements();
  
  // Get today's date
  const today = new Date().toISOString().split('T')[0];
  
  // Calculate progress
  const dailyProgress = getDailyProgress(today);
  const weeklyProgress = getWeeklyProgress();
  
  // Get achievement stats
  const allAchievements = getAllAchievements();
  const unlockedAchievements = allAchievements.filter(a => a.unlocked);
  const achievementProgress = Math.round((unlockedAchievements.length / allAchievements.length) * 100);
  
  // Get a random motivational quote
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  
  return (
    <Container>
      <Header>
        <Title>Progress Dashboard</Title>
      </Header>
      
      <ProgressGrid>
        <div>
          <ProgressCard>
            <CardTitle>Daily Focus Goal</CardTitle>
            <ProgressBarContainer>
              <ProgressBar 
                progress={dailyProgress}
                initial={{ width: 0 }}
                animate={{ width: `${dailyProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </ProgressBarContainer>
            <ProgressText>
              <span>Today's Progress</span>
              <span>{Math.round(dailyProgress)}%</span>
            </ProgressText>
            
            <CardTitle>Weekly Focus Goal</CardTitle>
            <ProgressBarContainer>
              <ProgressBar 
                progress={weeklyProgress}
                initial={{ width: 0 }}
                animate={{ width: `${weeklyProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </ProgressBarContainer>
            <ProgressText>
              <span>This Week's Progress</span>
              <span>{Math.round(weeklyProgress)}%</span>
            </ProgressText>
            
            <CardTitle>Achievement Progress</CardTitle>
            <ProgressBarContainer>
              <ProgressBar 
                progress={achievementProgress}
                initial={{ width: 0 }}
                animate={{ width: `${achievementProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </ProgressBarContainer>
            <ProgressText>
              <span>Achievements Unlocked</span>
              <span>{unlockedAchievements.length} / {allAchievements.length}</span>
            </ProgressText>
            
            <StatsGrid>
              <StatCard
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <StatValue>{focusData.totalFocusTime}</StatValue>
                <StatLabel>Total Focus Minutes</StatLabel>
              </StatCard>
              
              <StatCard
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <StatValue>{focusData.streaks.current}</StatValue>
                <StatLabel>Current Streak</StatLabel>
              </StatCard>
              
              <StatCard
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <StatValue>{focusData.sessions.filter(s => s.completed).length}</StatValue>
                <StatLabel>Completed Sessions</StatLabel>
              </StatCard>
              
              <StatCard
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <StatValue>{focusData.streaks.longest}</StatValue>
                <StatLabel>Longest Streak</StatLabel>
              </StatCard>
            </StatsGrid>
            
            <MotivationalQuote>
              "{randomQuote}"
            </MotivationalQuote>
          </ProgressCard>
        </div>
        
        <RecentMilestones />
      </ProgressGrid>
    </Container>
  );
};

export default ProgressOverview;
