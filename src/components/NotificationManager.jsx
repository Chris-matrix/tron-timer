import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useAchievements } from '../context/AchievementContext';
import AchievementNotification from './AchievementNotification';
// Enhanced debounce implementation with cancel method
const debounce = (func, wait) => {
  let timeout;
  
  const debounced = function(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
  
  debounced.cancel = () => {
    clearTimeout(timeout);
  };
  
  return debounced;
};

// Constants
const MAX_VISIBLE_NOTIFICATIONS = 3;
const NOTIFICATION_DEBOUNCE_MS = 100;

const NotificationsContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const NotificationManager = React.memo(({ theme }) => {
  const { achievements, dismissNotification } = useAchievements();
  const [activeNotifications, setActiveNotifications] = useState([]);
  const notificationsRef = React.useRef(achievements.notifications || []);
  
  // Memoize the dismiss function to prevent unnecessary re-renders
  const handleClose = useCallback((notificationId) => {
    setActiveNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
    // Use setTimeout with 0ms as a fallback for requestAnimationFrame
    const timer = setTimeout(() => {
      dismissNotification(notificationId);
    }, 0);
    return () => clearTimeout(timer);
  }, [dismissNotification]);
  
  // Debounce state updates to prevent rapid re-renders
  const updateActiveNotifications = useMemo(
    () =>
      debounce((newNotifications) => {
        setActiveNotifications(prev => {
          // Only update if there are actual changes
          const currentIds = new Set(prev.map(n => n.id));
          const uniqueNew = newNotifications.filter(n => !currentIds.has(n.id));
          return uniqueNew.length > 0 ? [...prev, ...uniqueNew] : prev;
        });
      }, NOTIFICATION_DEBOUNCE_MS),
    []
  );
  
  // Effect to handle new notifications
  useEffect(() => {
    if (achievements.notifications?.length > 0) {
      // Only process if notifications array has changed
      if (JSON.stringify(notificationsRef.current) !== JSON.stringify(achievements.notifications)) {
        const newNotifications = achievements.notifications.filter(
          n => !notificationsRef.current.some(existing => existing.id === n.id)
        );
        
        if (newNotifications.length > 0) {
          updateActiveNotifications(newNotifications);
          notificationsRef.current = [...achievements.notifications];
        }
      }
    }
    
    return () => {
      updateActiveNotifications.cancel();
    };
  }, [achievements.notifications, updateActiveNotifications]);
  
  // Memoize visible notifications to prevent unnecessary re-renders
  const visibleNotifications = useMemo(() => 
    activeNotifications.slice(0, MAX_VISIBLE_NOTIFICATIONS),
    [activeNotifications]
  );
  
  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (updateActiveNotifications && typeof updateActiveNotifications.cancel === 'function') {
        updateActiveNotifications.cancel();
      }
    };
  }, [updateActiveNotifications]);
  
  return (
    <NotificationsContainer>
      {visibleNotifications.map(notification => (
        <AchievementNotification
          key={notification.id}
          achievement={notification}
          onClose={handleClose}
          theme={theme}
          autoCloseTime={30000} // 30 seconds
        />
      ))}
    </NotificationsContainer>
  );
});

NotificationManager.propTypes = {
  theme: PropTypes.object
};

export default NotificationManager;
