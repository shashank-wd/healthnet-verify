import { useState, useCallback, useMemo, useEffect } from 'react';

export type NotificationType = 'email_sent' | 'approved' | 'review_requested' | 'validated' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  providerId?: string;
  providerName?: string;
  timestamp: Date;
  read: boolean;
}

// Global notifications state (shared across components)
let globalNotifications: Notification[] = [];
let listeners: Set<() => void> = new Set();

function notifyListeners() {
  listeners.forEach(listener => listener());
}

export function useNotifications() {
  const [, forceUpdate] = useState({});

  // Subscribe to global state changes
  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const notifications = globalNotifications;
  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  const addNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    providerInfo?: { id: string; name: string }
  ) => {
    const notification: Notification = {
      id: crypto.randomUUID(),
      type,
      title,
      message,
      providerId: providerInfo?.id,
      providerName: providerInfo?.name,
      timestamp: new Date(),
      read: false,
    };
    globalNotifications = [notification, ...globalNotifications].slice(0, 50); // Keep last 50
    notifyListeners();
    return notification;
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    globalNotifications = globalNotifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    notifyListeners();
  }, []);

  const markAllAsRead = useCallback(() => {
    globalNotifications = globalNotifications.map(n => ({ ...n, read: true }));
    notifyListeners();
  }, []);

  const clearNotification = useCallback((notificationId: string) => {
    globalNotifications = globalNotifications.filter(n => n.id !== notificationId);
    notifyListeners();
  }, []);

  const clearAll = useCallback(() => {
    globalNotifications = [];
    notifyListeners();
  }, []);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  };
}
