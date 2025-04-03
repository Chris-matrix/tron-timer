import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useData } from '../context/DataContext';

const StreakContainer = styled.div`
  background-color: ${props => props.theme.background || '#0c141f'};
  border: 1px solid ${props => props.theme.grid || '#1d2c3f'};
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  color: ${props => props.theme.text || '#ffffff'};
  margin-top: 0;
  margin-bottom: 15px;
`;

const StreakCards = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const StreakCard = styled.div`
  flex: 1;
  background-color: ${props => props.theme.grid || '#1d2c3f'};
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const StreakValue = styled.div`
  font-size: 2.5em;
  font-weight: bold;
  color: ${props => props.theme.primary || '#00f6ff'};
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FireIcon = styled.span`
  margin-right: 5px;
`;

const StreakLabel = styled.div`
  color: ${props => props.theme.text || '#ffffff'};
  font-size: 0.9em;
`;

const StreakHistoryTitle = styled.h4`
  color: ${props => props.theme.text || '#ffffff'};
  margin-top: 0;
  margin-bottom: 10px;
`;

const StreakCalendar = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
`;

const DayLabel = styled.div`
  text-align: center;
  color: ${props => props.theme.text || '#ffffff'};
  opacity: 0.7;
  font-size: 0.8em;
  margin-bottom: 5px;
`;

const CalendarDay = styled.div`
  aspect-ratio: 1;
  border-radius: 4px;
  background-color: ${props => 
    props.active 
      ? props.theme.primary 
      : props.theme.grid || '#1d2c3f'
  };
  opacity: ${props => props.active ? 1 : 0.3};
  transition: all 0.2s ease;
  
  &:hover {
    transform: ${props => props.active ? 'scale(1.1)' : 'none'};
    box-shadow: ${props => props.active ? '0 0 5px rgba(0, 246, 255, 0.5)' : 'none'};
  }
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: ${props => props.theme.text || '#ffffff'};
  opacity: 0.6;
`;

const StreakProgress = ({ theme }) => {
  const { focusData } = useData();
  
  // Get current and longest streaks
  const currentStreak = focusData.streaks?.current || 0;
  const longestStreak = focusData.streaks?.longest || 0;
  
  // Generate calendar data for the last 28 days (4 weeks)
  const generateCalendarData = () => {
    const today = new Date();
    const calendar = [];
    const activeDates = new Set();
    
    // Convert streak history dates to a Set for easy lookup
    if (focusData.sessions && focusData.sessions.length > 0) {
      focusData.sessions
        .filter(session => session.completed)
        .forEach(session => {
          activeDates.add(session.date);
        });
    }
    
    // Generate the last 28 days
    for (let i = 27; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      calendar.push({
        date: dateString,
        active: activeDates.has(dateString)
      });
    }
    
    return calendar;
  };
  
  const calendarData = generateCalendarData();
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <StreakContainer theme={theme}>
      <Title theme={theme}>Streak Progress</Title>
      
      <StreakCards>
        <StreakCard theme={theme}>
          <StreakValue theme={theme}>
            <FireIcon>🔥</FireIcon>
            {currentStreak}
          </StreakValue>
          <StreakLabel theme={theme}>Current Streak</StreakLabel>
        </StreakCard>
        
        <StreakCard theme={theme}>
          <StreakValue theme={theme}>
            <FireIcon>🏆</FireIcon>
            {longestStreak}
          </StreakValue>
          <StreakLabel theme={theme}>Longest Streak</StreakLabel>
        </StreakCard>
      </StreakCards>
      
      <StreakHistoryTitle theme={theme}>Recent Activity</StreakHistoryTitle>
      
      {calendarData.length > 0 ? (
        <>
          <div style={{ marginBottom: '10px' }}>
            {dayLabels.map(day => (
              <DayLabel key={day} theme={theme}>{day}</DayLabel>
            ))}
          </div>
          
          <StreakCalendar>
            {calendarData.map((day) => (
              <CalendarDay 
                key={day.date} 
                active={day.active}
                theme={theme}
                title={`${day.date}${day.active ? ' - Completed session' : ''}`}
              />
            ))}
          </StreakCalendar>
        </>
      ) : (
        <NoDataMessage theme={theme}>
          No streak data available yet. Complete focus sessions to build your streak!
        </NoDataMessage>
      )}
    </StreakContainer>
  );
};

StreakProgress.propTypes = {
  theme: PropTypes.object
};

export default StreakProgress;
