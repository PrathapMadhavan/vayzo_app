import { apiRequest } from "./apiClient";

const ENDPOINT = "/api/v1/admin/customers";

export async function getUsers() {
  return apiRequest(`${ENDPOINT}?userType=Customer`, {}, "Unable to load users");
}

export async function getUserById(userId) {
  const data = await apiRequest(`${ENDPOINT}?userId=${userId}&userType=Customer`, {}, "Unable to load user");

  if (!data || !data.length) {
    throw new Error("User not found");
  }

  return data[0];
}

export async function createUser(userData) {
  console.warn("MISSING REQUIREMENT: Backend generation of business userId is unavailable.");
  const newUser = {
    ...userData,
    name: userData.name,
    email: userData.email,
    mobileNumber: userData.mobileNumber,
    userType: "Customer",
  };

  return apiRequest(ENDPOINT, {
    method: "POST",
    body: JSON.stringify(newUser),
  }, "Unable to create user");
}

export async function updateUser(id, userData) {
  return apiRequest(`${ENDPOINT}/${id}`, {
    method: "PATCH", // Using PATCH for json-server to preserve existing data (contract is PUT)
    body: JSON.stringify(userData),
  }, "Unable to update user");
}

export async function deleteUser(id) {
  return apiRequest(`${ENDPOINT}/${id}`, {
    method: "DELETE",
  }, "Unable to delete user");
}
