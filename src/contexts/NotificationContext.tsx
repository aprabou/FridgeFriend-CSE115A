import React, { createContext, useContext, useState, useEffect } from 'react';
import { useInventory } from './InventoryContext';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { items } = useInventory();
  const { user } = useAuth();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user || items.length === 0) return;

    const today = new Date();
    const targetDays = [3, 5];

    items.forEach(item => {
      const expDate = new Date(item.expiration);
      const daysUntilExpiration = Math.ceil(
        (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (targetDays.includes(daysUntilExpiration)) {
        const alreadyNotified = notifications.find(
          n =>
            n.title.includes(item.name) &&
            n.message.includes(`${daysUntilExpiration} day`)
        );

        if (!alreadyNotified) {
          addNotification({
            title: `${item.name} expiring soon!`,
            message: `${item.name} will expire in ${daysUntilExpiration} day${daysUntilExpiration !== 1 ? 's' : ''}.`,
            type: daysUntilExpiration <= 3 ? 'warning' : 'info',
          });
        }
      }
    });
  }, [items, user]);

  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      createdAt: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
