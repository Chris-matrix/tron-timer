import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useAchievements } from '../context/AchievementContext';
import AchievementNotification from './AchievementNotification';

const NotificationsContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NotificationManager = ({ theme }) => {
  const { achievements, dismissNotification } = useAchievements();
  const [activeNotifications, setActiveNotifications] = useState([]);
  
  // Listen for new notifications in the achievements context
  useEffect(() => {
    if (achievements.notifications && achievements.notifications.length > 0) {
      // Only show notifications that aren't already being displayed
      const currentIds = activeNotifications.map(n => n.id);
      const newNotifications = achievements.notifications.filter(
        n => !currentIds.includes(n.id)
      );
      
      if (newNotifications.length > 0) {
        setActiveNotifications(prev => [...prev, ...newNotifications]);
      }
    }
  }, [achievements.notifications, activeNotifications]);
  
  // Handle closing a notification
  const handleClose = (notificationId) => {
    setActiveNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
    dismissNotification(notificationId);
  };
  
  // Limit the number of visible notifications to 3 at a time
  const visibleNotifications = activeNotifications.slice(0, 3);
  
  return (
    <NotificationsContainer>
      {visibleNotifications.map(notification => (
        <AchievementNotification
          key={notification.id}
          achievement={notification}
          onClose={() => handleClose(notification.id)}
          theme={theme}
          autoCloseTime={5000}
        />
      ))}
    </NotificationsContainer>
  );
};

NotificationManager.propTypes = {
  theme: PropTypes.object
};

export default NotificationManager;
