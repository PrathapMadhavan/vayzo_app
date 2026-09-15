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
  const allAdmins = await getAdminUsers();
  
  if (allAdmins.length >= 2) {
    throw new Error("Maximum admin user limit reached. Only one Super Admin and one Admin are allowed.");
  }

  const hasSuperAdmin = allAdmins.some(a => a.role === "Super Admin");
  const hasAdmin = allAdmins.some(a => a.role === "Admin");

  if (userData.role === "Super Admin" && hasSuperAdmin) {
    throw new Error("Only one Super Admin user is allowed.");
  }

  if (userData.role === "Admin" && hasAdmin) {
    throw new Error("Only one Admin user is allowed.");
  }

  if (userData.role !== "Admin" && userData.role !== "Super Admin") {
    throw new Error("Invalid role for Admin Users.");
  }

  const newUser = {
    ...userData,
    id: `ADM${Date.now()}`,
    userId: `ADM${Date.now()}`,
    lastLogin: "-",
    joinedDate: new Date().toISOString().split('T')[0]
  };

  return await apiRequest(API_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(newUser),
  });
}

export async function updateAdminUser(id, userData) {
  const existingUser = await getAdminUserById(id);
  
  if (existingUser.role === "Super Admin" && userData.role !== "Super Admin") {
    throw new Error("Super Admin role cannot be changed.");
  }
  
  if (existingUser.role === "Admin" && userData.role === "Super Admin") {
    throw new Error("Cannot change Admin to Super Admin.");
  }

  return await apiRequest(`${API_ENDPOINT}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...existingUser, ...userData }),
  });
}

export async function deleteAdminUser(id) {
  const existingUser = await getAdminUserById(id);
  
  if (existingUser.role === "Super Admin") {
    throw new Error("Super Admin cannot be deleted.");
  }

  await apiRequest(`${API_ENDPOINT}/${id}`, {
    method: "DELETE",
  });
  return true;
}
