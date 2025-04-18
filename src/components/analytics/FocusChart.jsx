import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
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

// Helper function to prepare data for the chart
const prepareChartData = (sessions, timeRange, dateRange) => {
  if (!sessions || sessions.length === 0) {
    // Return empty data with appropriate structure based on timeRange
    if (timeRange === 'day') {
      return Array(24).fill().map((_, i) => ({
        time: `${i.toString().padStart(2, '0')}:00`,
        completed: 0,
        incomplete: 0
      }));
    } else if (timeRange === 'week') {
      return Array(7).fill().map((_, i) => ({
        time: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
        completed: 0,
        incomplete: 0
      }));
    } else if (timeRange === 'month') {
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      return Array(daysInMonth).fill().map((_, i) => ({
        time: i + 1,
        completed: 0,
        incomplete: 0
      }));
    }
    return [];
  }

  if (timeRange === 'day') {
    // Group by hour for day view
    const hourlyData = Array(24).fill().map((_, i) => ({
      time: `${i.toString().padStart(2, '0')}:00`,
      completed: 0,
      incomplete: 0
    }));
    
    sessions.forEach(session => {
      try {
        const sessionDate = new Date(session.date + 'T' + (session.time || '00:00:00'));
        const hour = sessionDate.getHours();
        
        if (hour >= 0 && hour < 24) {
          if (session.completed) {
            hourlyData[hour].completed += session.duration || 0;
          } else {
            hourlyData[hour].incomplete += session.duration || 0;
          }
        }
      } catch (error) {
        console.error('Error processing session:', session, error);
      }
    });
    
    return hourlyData;
  } else if (timeRange === 'week') {
    // Group by day for week view
    const dailyData = Array(7).fill().map((_, i) => ({
      time: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
      completed: 0,
      incomplete: 0
    }));
    
    sessions.forEach(session => {
      try {
        const sessionDate = new Date(session.date);
        if (!isNaN(sessionDate.getTime())) {
          const day = sessionDate.getDay();
          
          if (day >= 0 && day < 7) {
            if (session.completed) {
              dailyData[day].completed += session.duration || 0;
            } else {
              dailyData[day].incomplete += session.duration || 0;
            }
          }
        }
      } catch (error) {
        console.error('Error processing session:', session, error);
      }
    });
    
    return dailyData;
  } else if (timeRange === 'month') {
    // Group by date for month view
    const startDate = new Date(dateRange.startDate);
    const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
    
    const monthlyData = Array(daysInMonth).fill().map((_, i) => ({
      time: i + 1,
      completed: 0,
      incomplete: 0
    }));
    
    sessions.forEach(session => {
      try {
        const sessionDate = new Date(session.date);
        if (!isNaN(sessionDate.getTime())) {
          const day = sessionDate.getDate() - 1; // 0-indexed array
          
          if (day >= 0 && day < monthlyData.length) {
            if (session.completed) {
              monthlyData[day].completed += session.duration || 0;
            } else {
              monthlyData[day].incomplete += session.duration || 0;
            }
          }
        }
      } catch (error) {
        console.error('Error processing session:', session, error);
      }
    });
    
    return monthlyData;
  }
  
  return [];
};

const FocusChart = ({ timeRange, dateRange }) => {
  const { getSessionsForDateRange } = useData();
  
  const sessions = getSessionsForDateRange(dateRange?.startDate, dateRange?.endDate) || [];
  const chartData = prepareChartData(sessions, timeRange, dateRange);
  
  // Custom tooltip component
  const renderTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const completed = payload[0].value;
      const incomplete = payload[1] ? payload[1].value : 0;
      const total = completed + incomplete;
      
      return (
        <CustomTooltip>
          <div className="label">{label}</div>
          <div className="value">Completed: {completed} min</div>
          <div className="value">Incomplete: {incomplete} min</div>
          <div className="value">Total: {total} min</div>
        </CustomTooltip>
      );
    }
    
    return null;
  };
  
  return (
    <ChartContainer>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="time" 
            stroke="#00f6ff"
            tick={{ fill: '#ffffff' }}
          />
          <YAxis 
            stroke="#00f6ff"
            tick={{ fill: '#ffffff' }}
            label={{ 
              value: 'Minutes', 
              angle: -90, 
              position: 'insideLeft',
              fill: '#ffffff'
            }}
          />
          <Tooltip content={renderTooltip} />
          <Legend 
            wrapperStyle={{ 
              paddingTop: '10px',
              color: '#ffffff'
            }}
          />
          <Bar 
            dataKey="completed" 
            name="Completed" 
            stackId="a" 
            fill="#00ff9d" 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="incomplete" 
            name="Incomplete" 
            stackId="a" 
            fill="#ff3864" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// Add prop validation
FocusChart.propTypes = {
  timeRange: PropTypes.string.isRequired,
  dateRange: PropTypes.shape({
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired
  }).isRequired
};

export default FocusChart;
