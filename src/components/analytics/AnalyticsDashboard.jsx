import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import FocusChart from './FocusChart';
import StreakChart from './StreakChart';
import StatsSummary from './StatsSummary';
import { useData } from '../../context/DataContext';

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

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ChartCard = styled.div`
  background: linear-gradient(135deg, rgba(12, 20, 31, 0.8) 0%, rgba(26, 43, 71, 0.9) 100%);
  border: 1px solid ${props => props.theme.primary};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 0 15px ${props => props.theme.primary + '40'};
`;

const ChartTitle = styled.h3`
  color: ${props => props.theme.primary};
  margin: 0 0 15px;
  font-size: 1.2rem;
`;

const ExportButton = styled(motion.button)`
  background: transparent;
  border: 1px solid ${props => props.theme.primary};
  color: ${props => props.theme.primary};
  padding: 5px 10px;
  font-family: 'Orbitron', sans-serif;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  border-radius: 4px;
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 5px;
  
  &:hover {
    box-shadow: 0 0 10px ${props => props.theme.primary + '40'};
  }
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

// Helper function to get date ranges
const getDateRange = (range) => {
  const today = new Date();
  let startDate, endDate;
  
  switch (range) {
    case 'day':
      startDate = new Date(today);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // End of week (Saturday)
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'month':
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 30); // Last 30 days
      endDate = new Date(today);
      break;
  }
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('week');
  const { focusData, getSessionsForDateRange } = useData();
  
  const dateRange = getDateRange(timeRange);
  const filteredData = getSessionsForDateRange(dateRange.startDate, dateRange.endDate);
  
  // Function to export data as CSV
  const exportData = (type) => {
    let csvContent = '';
    let filename = '';
    
    if (type === 'focus') {
      csvContent = 'Date,Duration,Completed\n';
      filteredData.forEach(session => {
        csvContent += `${session.date},${session.duration},${session.completed}\n`;
      });
      filename = `focus-data-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    } else if (type === 'streak') {
      csvContent = 'Date,StreakCount\n';
      focusData.streaks.history.forEach(streak => {
        csvContent += `${streak.date},${streak.count}\n`;
      });
      filename = `streak-data-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Container>
      <Header>
        <Title>Analytics</Title>
        <FilterContainer>
          <FilterButton 
            active={timeRange === 'day'} 
            onClick={() => setTimeRange('day')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Day
          </FilterButton>
          <FilterButton 
            active={timeRange === 'week'} 
            onClick={() => setTimeRange('week')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Week
          </FilterButton>
          <FilterButton 
            active={timeRange === 'month'} 
            onClick={() => setTimeRange('month')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Month
          </FilterButton>
        </FilterContainer>
      </Header>
      
      <StatsSummary timeRange={timeRange} dateRange={dateRange} />
      
      <ChartsContainer>
        <ChartCard>
          <ChartHeader>
            <ChartTitle>Focus Time</ChartTitle>
            <ExportButton 
              onClick={() => exportData('focus')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Export CSV
            </ExportButton>
          </ChartHeader>
          <FocusChart timeRange={timeRange} dateRange={dateRange} />
        </ChartCard>
        
        <ChartCard>
          <ChartHeader>
            <ChartTitle>Streak Progress</ChartTitle>
            <ExportButton 
              onClick={() => exportData('streak')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Export CSV
            </ExportButton>
          </ChartHeader>
          <StreakChart />
        </ChartCard>
      </ChartsContainer>
    </Container>
  );
};

export default AnalyticsDashboard;
