import { apiRequest } from "./apiClient";

const ENDPOINT = "/api/v1/admin/notifications";

export async function getNotifications(filters = {}) {
  const queryParams = new URLSearchParams();

  if (filters.type && filters.type !== "All Types") {
    queryParams.append("type", filters.type);
  }
  if (filters.isRead !== undefined && filters.isRead !== null) {
    queryParams.append("isRead", String(filters.isRead));
  }
  if (filters.search) {
    queryParams.append("search", filters.search);
  }

  const queryString = queryParams.toString();
  const fetchUrl = queryString ? `${ENDPOINT}?${queryString}` : ENDPOINT;

  return await apiRequest(fetchUrl, {}, "Unable to load notifications");
}

export async function getUnreadCount() {
  const res = await apiRequest(`${ENDPOINT}/unread-count`, {}, "Unable to fetch unread count");
  return typeof res === "object" && res.count !== undefined ? res.count : 0;
}

export async function markNotificationAsRead(id) {
  return await apiRequest(
    `${ENDPOINT}/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ isRead: true }),
    },
    "Failed to mark notification as read"
  );
}

export async function markAllNotificationsAsRead() {
  return await apiRequest(
    `${ENDPOINT}/mark-all-read`,
    {
      method: "PATCH",
    },
    "Failed to mark all notifications as read"
  );
}

export async function deleteNotification(id) {
  return await apiRequest(
    `${ENDPOINT}/${id}`,
    {
      method: "DELETE",
    },
    "Failed to delete notification"
  );
}

export async function clearAllNotifications() {
  return await apiRequest(
    `${ENDPOINT}/clear-all`,
    {
      method: "DELETE",
    },
    "Failed to clear all notifications"
  );
}
