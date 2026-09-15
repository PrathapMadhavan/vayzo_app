import { apiRequest } from "./apiClient";

const ENDPOINT = "/api/v1/admin/activity-logs";

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
  const fetchUrl = queryString ? `${ENDPOINT}?${queryString}` : ENDPOINT;

  let data = await apiRequest(fetchUrl, {}, "Unable to load activity logs");

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
  return await apiRequest(`${ENDPOINT}/${id}`, {}, "Failed to load activity log details");
}

export async function deleteActivityLog(id) {
  return await apiRequest(`${ENDPOINT}/${id}`, {
    method: "DELETE",
  }, "Failed to delete activity log");
}
