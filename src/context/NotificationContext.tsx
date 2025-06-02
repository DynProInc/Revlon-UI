import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';

// Notification types
export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  autoClose?: boolean;
  duration?: number;
}

// Notification context type
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

// Create notification context
export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  clearAllNotifications: () => {},
});

// Create hook for using notification context
export const useNotification = () => useContext(NotificationContext);

// Define provider props
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Add a new notification - memoized to prevent recreation on each render
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      autoClose: notification.autoClose !== false,
      duration: notification.duration || 5000,
    };
    
    setNotifications((prev) => [...prev, newNotification]);
    
    // Auto close notifications if enabled
    if (newNotification.autoClose) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.filter(item => item.id !== id));
      }, newNotification.duration);
      
      // Clean up timer if component unmounts
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Remove a notification by ID - memoized to prevent recreation on each render
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);
  
  // Clear all notifications - memoized to prevent recreation on each render
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);
  
  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
  }), [notifications, addNotification, removeNotification, clearAllNotifications]);
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
