import { apiRequest } from "./apiClient";

const ENDPOINT = "/api/v1/admin/requests";

export async function getOrders(filters = {}) {
  let url = ENDPOINT;
  
  const queryParams = [];
  if (filters.service_type) {
    queryParams.push(`service_type=${filters.service_type}`);
  }
  
  if (filters.status && filters.status !== "All Status") {
    queryParams.push(`status=${filters.status}`);
  }
  
  if (queryParams.length > 0) {
    url += `?${queryParams.join("&")}`;
  }
  
  const data = await apiRequest(url, {}, "Unable to load requests");
  return data?.data ? data.data : data;
}

export async function getOrderById(orderId) {
  const data = await apiRequest(`${ENDPOINT}/${orderId}`, {}, "Unable to load order");
  if (!data) {
    throw new Error("Order not found");
  }
  return data?.data ? data.data : data;
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

export async function updateOrderStatus(id, statusData) {
  return apiRequest(`${ENDPOINT}/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(statusData),
  }, "Unable to update request status");
}
