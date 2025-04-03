import React, { useState } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useData, AVAILABLE_THEMES } from './context/DataContext';
import TimerContainer from './components/timer/TimerContainer';
import ProgressOverview from './components/dashboard/ProgressOverview';
import AchievementList from './components/achievements/AchievementList';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import Settings from './components/settings/Settings';
import NotificationManager from './components/NotificationManager';

// Global styles
const GlobalStyle = createGlobalStyle`
  /* Font imports are handled in index.html */
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
    font-family: 'Roboto', sans-serif;
    transition: background-color 0.3s ease, color 0.3s ease;
    overflow-x: hidden;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-family: 'Orbitron', sans-serif;
  }
  
  button, input, select {
    font-family: 'Roboto', sans-serif;
  }
`;

// App container
const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      linear-gradient(to right, ${props => props.theme.grid} 1px, transparent 1px),
      linear-gradient(to bottom, ${props => props.theme.grid} 1px, transparent 1px);
    background-size: 20px 20px;
    opacity: 0.1;
    z-index: -1;
  }
`;

// Header
const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid ${props => props.theme.primary + '30'};
`;

const Logo = styled.h1`
  color: ${props => props.theme.primary};
  font-size: 1.5rem;
  font-weight: 700;
  text-shadow: 0 0 10px ${props => props.theme.primary + '80'};
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavButton = styled(motion.button)`
  background: transparent;
  border: none;
  color: ${props => props.$isActive ? props.theme.primary : props.theme.text};
  font-family: 'Orbitron', sans-serif;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${props => props.theme.primary};
    transform: scaleX(${props => props.$isActive ? 1 : 0});
    transition: transform 0.3s ease;
  }
  
  &:hover:after {
    transform: scaleX(1);
  }
`;

const ThemeToggle = styled(motion.button)`
  background: transparent;
  border: 2px solid ${props => props.theme.primary};
  color: ${props => props.theme.primary};
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 0 10px ${props => props.theme.primary + '40'};
  
  &:hover {
    box-shadow: 0 0 15px ${props => props.theme.primary + '80'};
  }
`;

// Main content
const Main = styled.main`
  flex: 1;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`;

const App = () => {
  const { focusData, toggleTheme, getCurrentTheme } = useData();
  const [activeTab, setActiveTab] = useState('timer');
  
  // Get current theme from context
  const currentTheme = getCurrentTheme();
  
  const fallbackTheme = {
    primary: '#1e88e5',
    background: '#121212',
    text: '#ffffff',
    grid: '#333',
  };

  return (
    <ThemeProvider theme={currentTheme || fallbackTheme}>
      <GlobalStyle />
      <AppContainer>
        <NotificationManager theme={currentTheme || fallbackTheme} />
        <Header>
          <Logo>TRON TIMER</Logo>
          <Nav>
            <NavButton 
              $isActive={activeTab === 'timer'} 
              onClick={() => setActiveTab('timer')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Timer
            </NavButton>
            <NavButton 
              $isActive={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Dashboard
            </NavButton>
            <NavButton 
              $isActive={activeTab === 'achievements'} 
              onClick={() => setActiveTab('achievements')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Achievements
            </NavButton>
            <NavButton 
              $isActive={activeTab === 'analytics'} 
              onClick={() => setActiveTab('analytics')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Analytics
            </NavButton>
            <NavButton 
              $isActive={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Settings
            </NavButton>
          </Nav>
          <ThemeToggle 
            onClick={toggleTheme}
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {focusData.settings.theme === 'tron' ? '🌙' : '☀️'}
          </ThemeToggle>
        </Header>
        
        <Main>
          <AnimatePresence mode="wait">
            {activeTab === 'timer' && (
              <motion.div
                key="timer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                <TimerContainer />
              </motion.div>
            )}
            
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <ProgressOverview />
              </motion.div>
            )}
            
            {activeTab === 'achievements' && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <AchievementList />
              </motion.div>
            )}
            
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <AnalyticsDashboard />
              </motion.div>
            )}
            
            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <Settings />
              </motion.div>
            )}
          </AnimatePresence>
        </Main>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;
