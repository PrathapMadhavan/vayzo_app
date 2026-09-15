import { apiRequest } from "./apiClient";

const ENDPOINT = "/api/v1/admin/restaurants";

export async function getRestaurants() {
  return apiRequest(ENDPOINT, {}, "Unable to load restaurants");
}

export async function getRestaurantById(id) {
  return apiRequest(`${ENDPOINT}/${id}`, {}, "Restaurant not found");
}

export async function createRestaurant(data) {
  return apiRequest(ENDPOINT, {
    method: "POST",
    body: JSON.stringify(data),
  }, "Unable to create restaurant");
}

export async function updateRestaurant(id, data) {
  return apiRequest(`${ENDPOINT}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }, "Unable to update restaurant");
}

export async function deleteRestaurant(id) {
  await apiRequest(`${ENDPOINT}/${id}`, { method: "DELETE" }, "Unable to delete restaurant");
  return true;
}
