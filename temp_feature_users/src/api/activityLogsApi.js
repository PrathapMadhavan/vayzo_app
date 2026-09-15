import { API_BASE_URL } from "./config";

const API_URL = `${API_BASE_URL}/activityLogs`;

export async function getActivityLogs(filters = {}) {
  // Construct query parameters for the mock backend
  const queryParams = new URLSearchParams();
  
  // JSON Server simple filtering
  if (filters.action && filters.action !== "All Actions") {
    queryParams.append("action", filters.action);
  }
  if (filters.module && filters.module !== "All Modules") {
    queryParams.append("module", filters.module);
  }
  if (filters.adminUser && filters.adminUser !== "All Users") {
    queryParams.append("user", filters.adminUser);
  }

  const queryString = queryParams.toString();
  const fetchUrl = queryString ? `${API_URL}?${queryString}` : API_URL;

  const response = await fetch(fetchUrl);
  if (!response.ok) {
    throw new Error("Unable to load activity logs");
  }

  let data = await response.json();

  // Apply custom local filtering for complex rules not supported out of the box by json-server mock
  
  // Search query (checks user, action, module, details)
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    data = data.filter(log => 
      log.user.toLowerCase().includes(q) || 
      log.action.toLowerCase().includes(q) ||
      log.module.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  }

  // Date Range filtering
  if (filters.startDate || filters.endDate) {
    const start = filters.startDate ? new Date(filters.startDate) : new Date(0);
    const end = filters.endDate ? new Date(filters.endDate) : new Date(8640000000000000); // Max date

    data = data.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= start && logDate <= end;
    });
  }

  // Sort by timestamp descending (newest first)
  data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return data;
}

export async function getActivityLogById(id) {
  const response = await fetch(`${API_URL}/${id}`);
  if (!response.ok) {
    throw new Error("Failed to load activity log details");
  }
  return await response.json();
}

export async function deleteActivityLog(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete activity log");
  }
  return await response.json();
}
