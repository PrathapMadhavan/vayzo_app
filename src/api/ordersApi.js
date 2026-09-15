import { apiRequest } from "./apiClient";

const ENDPOINT = "/api/v1/admin/requests";

export async function getOrders(filters = {}) {
  let url = ENDPOINT;
  
  const queryParams = [];
  if (filters.serviceType) {
    queryParams.push(`serviceType=${filters.serviceType}`);
  }
  
  if (filters.status && filters.status !== "All Status") {
    queryParams.push(`status=${filters.status}`);
  }
  
  if (queryParams.length > 0) {
    url += `?${queryParams.join("&")}`;
  }
  
  return apiRequest(url, {}, "Unable to load requests");
}

export async function getOrderById(orderId) {
  let data = await apiRequest(`${ENDPOINT}?requestId=${orderId}`, {}, "Unable to load request");
  
  if (!data || data.length === 0) {
    data = await apiRequest(`${ENDPOINT}?id=${orderId}`, {}, "Unable to load request");
  }

  if (!data || !data.length) {
    throw new Error("Request not found");
  }

  return data[0];
}

export async function createOrder(orderData) {
  if (!orderData.serviceType) {
    console.warn("MISSING REQUIREMENT: serviceType is required for new requests.");
  }

  console.warn("MISSING REQUIREMENT: Backend generation of business request ID is unavailable.");
  const newRequest = {
    ...orderData,
    orderDate: new Date().toISOString(),
    serviceType: orderData.serviceType || undefined
  };

  return apiRequest(ENDPOINT, {
    method: "POST",
    body: JSON.stringify(newRequest),
  }, "Unable to create request");
}

export async function updateOrder(id, orderData) {
  return apiRequest(`${ENDPOINT}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(orderData),
  }, "Unable to update request");
}

export async function deleteOrder(id) {
  return apiRequest(`${ENDPOINT}/${id}`, {
    method: "DELETE",
  }, "Unable to delete request");
}
