import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useData } from '../context/DataContext';

const GraphContainer = styled.div`
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

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid ${props => props.theme.grid || '#1d2c3f'};
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: 10px 15px;
  margin-right: 5px;
  color: ${props => props.active ? props.theme.primary : props.theme.text};
  border-bottom: 2px solid ${props => props.active ? props.theme.primary : 'transparent'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    color: ${props => props.theme.primary};
  }
`;

const GraphCanvas = styled.div`
  height: 250px;
  position: relative;
  margin-bottom: 10px;
  display: flex;
  align-items: flex-end;
`;

const BarContainer = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding: 0 2px;
`;

const Bar = styled.div`
  width: 100%;
  background-color: ${props => props.theme.primary || '#00f6ff'};
  border-radius: 3px 3px 0 0;
  height: ${props => props.height}%;
  min-height: 1px;
  transition: height 0.5s ease;
  position: relative;
  
  &:hover {
    background-color: ${props => props.theme.accent || '#00f6ff'};
    box-shadow: 0 0 10px rgba(0, 246, 255, 0.5);
  }
  
  &:hover::after {
    content: "${props => props.value} min";
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 3px 6px;
    border-radius: 3px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 10;
  }
`;

const AxisLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
`;

const Label = styled.div`
  color: ${props => props.theme.text || '#ffffff'};
  font-size: 0.8em;
  text-align: center;
  flex: 1;
  padding: 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoDataMessage = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${props => props.theme.text || '#ffffff'};
  opacity: 0.6;
`;

const AnalyticsGraph = ({ theme }) => {
  const { focusData } = useData();
  const [activeTab, setActiveTab] = useState('daily');
  
  // Format date labels based on the selected time period
  const formatLabel = (key) => {
    if (activeTab === 'daily') {
      // Format: Apr 3
      const date = new Date(key);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } else if (activeTab === 'weekly') {
      // Format: Apr 1-7
      const startDate = new Date(key);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      return `${startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}-${endDate.getDate()}`;
    } else if (activeTab === 'monthly') {
      // Format: Apr 2025
      const [year, month] = key.split('-');
      const date = new Date(year, month - 1);
      return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
    }
    return key;
  };
  
  // Get the appropriate data based on the selected tab
  const getData = () => {
    switch (activeTab) {
      case 'daily':
        return focusData.dailyStats || {};
      case 'weekly':
        return focusData.weeklyStats || {};
      case 'monthly':
        return focusData.monthlyStats || {};
      default:
        return {};
    }
  };
  
  // Prepare data for the graph
  const prepareGraphData = () => {
    const data = getData();
    const keys = Object.keys(data).sort();
    
    // Limit to the last 10 entries for better visualization
    const limitedKeys = keys.slice(-10);
    
    // Find the maximum value for scaling
    const maxValue = Math.max(...limitedKeys.map(key => data[key]), 1);
    
    return {
      keys: limitedKeys,
      values: limitedKeys.map(key => data[key]),
      maxValue
    };
  };
  
  const { keys, values, maxValue } = prepareGraphData();
  
  return (
    <GraphContainer theme={theme}>
      <Title theme={theme}>Focus Time Analytics</Title>
      
      <TabContainer theme={theme}>
        <Tab 
          active={activeTab === 'daily'} 
          onClick={() => setActiveTab('daily')}
          theme={theme}
        >
          Daily
        </Tab>
        <Tab 
          active={activeTab === 'weekly'} 
          onClick={() => setActiveTab('weekly')}
          theme={theme}
        >
          Weekly
        </Tab>
        <Tab 
          active={activeTab === 'monthly'} 
          onClick={() => setActiveTab('monthly')}
          theme={theme}
        >
          Monthly
        </Tab>
      </TabContainer>
      
      <GraphCanvas>
        {keys.length > 0 ? (
          keys.map((key, index) => (
            <BarContainer key={key}>
              <Bar 
                theme={theme} 
                height={(values[index] / maxValue) * 100}
                value={values[index]}
              />
            </BarContainer>
          ))
        ) : (
          <NoDataMessage theme={theme}>
            No data available for this time period
          </NoDataMessage>
        )}
      </GraphCanvas>
      
      {keys.length > 0 && (
        <AxisLabels>
          {keys.map(key => (
            <Label key={key} theme={theme}>
              {formatLabel(key)}
            </Label>
          ))}
        </AxisLabels>
      )}
    </GraphContainer>
  );
};

AnalyticsGraph.propTypes = {
  theme: PropTypes.object
};

export default AnalyticsGraph;
