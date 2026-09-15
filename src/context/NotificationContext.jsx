import { createContext, useContext, useMemo, useState } from "react";
import { notifications as notificationData } from "../mock/notifications";

const NotificationContext = createContext(null);

const STORAGE_KEY = "vayzo_notifications";

function getInitialNotifications() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return notificationData;
    }
  }

  return notificationData;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(getInitialNotifications);

  const updateNotifications = (updater) => {
    setNotifications((current) => {
      const updated =
        typeof updater === "function" ? updater(current) : updater;

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      return updated;
    });
  };

  const markAsRead = (notificationId) => {
    updateNotifications((current) =>
      current.map((notification) =>
        notification.notificationId === notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    updateNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    );
  };

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider",
    );
  }

  return context;
}
