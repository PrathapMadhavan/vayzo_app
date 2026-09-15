import { apiRequest } from "./apiClient";

const ENDPOINT = "/api/v1/admin/finance/earnings";

export async function getEarnings() {
  const data = await apiRequest(ENDPOINT, {}, "Unable to load earnings data");

  if (Array.isArray(data) && data.length > 0) {
    return data[0];
  }
  
  return null;
}

export async function deleteEarning(id) {
  return apiRequest(`${ENDPOINT}/${id}`, {
    method: 'DELETE',
  }, "Unable to delete earning");
}
