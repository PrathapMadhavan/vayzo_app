import { apiRequest } from "./apiClient";

export async function getDashboardData() {
  return apiRequest("/api/v1/admin/dashboard", {}, "Unable to load dashboard data");
}
