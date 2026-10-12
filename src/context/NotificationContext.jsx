import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as apiDeleteNotification,
  clearAllNotifications as apiClearAllNotifications,
} from "../api/notificationsApi";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageCount, setMessageCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch notifications from API:", err);
      setError(err.message || "Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId) => {
    const previous = [...notifications];
    setNotifications((curr) =>
      curr.map((n) =>
        (n.id === notificationId || n.notificationId === notificationId)
          ? { ...n, isRead: true }
          : n
      )
    );

    try {
      await markNotificationAsRead(notificationId);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      setNotifications(previous);
    }
  };

  const markAllAsRead = async () => {
    const previous = [...notifications];
    setNotifications((curr) => curr.map((n) => ({ ...n, isRead: true })));

    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      setNotifications(previous);
    }
  };

  const deleteNotification = async (notificationId) => {
    const previous = [...notifications];
    setNotifications((curr) =>
      curr.filter(
        (n) => n.id !== notificationId && n.notificationId !== notificationId
      )
    );

    try {
      await apiDeleteNotification(notificationId);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      setNotifications(previous);
    }
  };

  const clearAllNotifications = async () => {
    const previous = [...notifications];
    setNotifications([]);

    try {
      await apiClearAllNotifications();
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
      setNotifications(previous);
    }
  };

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  // Centralized polling for complaints to avoid duplicate calls on route changes
  useEffect(() => {
    let isMounted = true;
    const fetchComplaints = async () => {
      try {
        const { getComplaints } = await import("../api/complaintsApi.js");
        const complaints = await getComplaints();
        if (isMounted) {
          const activeComplaints = complaints.filter(
            (c) => c.status === "Open" || c.status === "In Progress"
          );
          setMessageCount(activeComplaints.length);
        }
      } catch (err) {
        console.error("Failed to fetch complaints for centralized notification badge", err);
      }
    };

    fetchComplaints();
    const intervalId = setInterval(fetchComplaints, 60000); // 60s
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        isLoading,
        error,
        unreadCount,
        refreshNotifications: fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        messageCount,
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
