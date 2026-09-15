import { apiRequest } from "./apiClient";

const API_ENDPOINT = "/api/v1/admin/admin-users";

export async function getAdminUsers(filters = {}) {
  let data = await apiRequest(API_ENDPOINT);

  if (!data) return [];

  if (filters.role && filters.role !== "All Roles") {
    data = data.filter(user => user.role === filters.role);
  }

  if (filters.status && filters.status !== "All Status") {
    data = data.filter(user => 
      user.status === filters.status || 
      user.status === filters.status.toUpperCase() ||
      user.status?.toLowerCase() === filters.status.toLowerCase()
    );
  }

  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    data = data.filter(user => 
      user.name?.toLowerCase().includes(q) || 
      user.email?.toLowerCase().includes(q) ||
      user.mobileNumber?.includes(q)
    );
  }

  return data;
}

export async function getAdminUserById(id) {
  return await apiRequest(`${API_ENDPOINT}/${id}`);
}

export async function createAdminUser(userData) {
  console.warn("MISSING REQUIREMENT: Backend generation of business admin ID is unavailable.");
  const newUser = {
    ...userData,
    joinedDate: new Date().toISOString().split("T")[0],
    lastLogin: "--",
  };return await apiRequest(API_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(newUser),
  });
}

export async function updateAdminUser(id, userData) {
  const existingUser = await getAdminUserById(id);
  
  return await apiRequest(`${API_ENDPOINT}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...existingUser, ...userData }),
  });
}

export async function deleteAdminUser(id) {
  await apiRequest(`${API_ENDPOINT}/${id}`, {
    method: "DELETE",
  });
  return true;
}
