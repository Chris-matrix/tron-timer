import React from 'react';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { useData } from '../../context/DataContext';

const ChartContainer = styled.div`
  height: 300px;
  width: 100%;
`;

const CustomTooltip = styled.div`
  background-color: ${props => props.theme.background};
  border: 1px solid ${props => props.theme.primary};
  padding: 10px;
  border-radius: 4px;
  font-family: 'Orbitron', sans-serif;
  font-size: 0.8rem;
  
  .label {
    color: ${props => props.theme.primary};
    font-weight: 700;
    margin-bottom: 5px;
  }
  
  .value {
    color: ${props => props.theme.text};
  }
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${props => props.theme.text};
  font-size: 1rem;
  text-align: center;
`;

const StreakChart = () => {
  const { focusData } = useData();
  
  // Prepare data for the chart
  const chartData = focusData.streaks.history.map(streak => ({
    date: streak.date,
    count: streak.count
  }));
  
  // Find the longest streak
  const longestStreak = focusData.streaks.longest;
  
  // Custom tooltip component
  const renderTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const date = new Date(label).toLocaleDateString();
      const streakCount = payload[0].value;
      
      return (
        <CustomTooltip>
          <div className="label">{date}</div>
          <div className="value">Streak: {streakCount} day{streakCount !== 1 ? 's' : ''}</div>
        </CustomTooltip>
      );
    }
    
    return null;
  };
  
  if (chartData.length === 0) {
    return (
      <NoDataMessage>
        No streak data available yet.<br />
        Complete focus sessions to build your streak!
      </NoDataMessage>
    );
  }
  
  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="#00f6ff"
            tick={{ fill: '#ffffff' }}
            tickFormatter={(date) => new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            stroke="#00f6ff"
            tick={{ fill: '#ffffff' }}
            label={{ 
              value: 'Streak Days', 
              angle: -90, 
              position: 'insideLeft',
              fill: '#ffffff'
            }}
          />
          <Tooltip content={renderTooltip} />
          <ReferenceLine 
            y={longestStreak} 
            label={{ 
              value: 'Longest Streak', 
              position: 'top', 
              fill: '#ffbb00' 
            }} 
            stroke="#ffbb00" 
            strokeDasharray="3 3" 
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#00f6ff" 
            strokeWidth={2}
            dot={{ fill: '#00f6ff', r: 4 }}
            activeDot={{ fill: '#ffffff', r: 6, stroke: '#00f6ff', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default StreakChart;
