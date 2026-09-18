import { apiRequest } from "./apiClient";

const ENDPOINT = "/api/v1/admin/customers";

export async function getCustomers(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return apiRequest(`${ENDPOINT}${query ? `?${query}` : ""}`, {}, "Unable to load customers");
}

export async function getCustomerById(publicId) {
  const data = await apiRequest(`${ENDPOINT}/${publicId}`, {}, "Unable to load customer");

  if (!data) {
    throw new Error("Customer not found");
  }

  return data;
}

export async function createCustomer(formData) {
  return apiRequest(ENDPOINT, {
    method: "POST",
    body: formData,
  }, "Unable to create customer");
}

export async function updateCustomer(publicId, formData) {
  return apiRequest(`${ENDPOINT}/${publicId}`, {
    method: "PATCH",
    body: formData,
  }, "Unable to update customer");
}

export async function deleteCustomer(publicId) {
  return apiRequest(`${ENDPOINT}/${publicId}`, {
    method: "DELETE",
  }, "Unable to delete customer");
}

export async function getCustomerRequests(publicId) {
  return apiRequest(`${ENDPOINT}/${publicId}/requests`, {}, "Unable to load customer requests");
}

export async function getCustomerWallet(publicId) {
  return apiRequest(`${ENDPOINT}/${publicId}/wallet`, {}, "Unable to load customer wallet");
}

export async function getCustomerTransactions(publicId) {
  return apiRequest(`${ENDPOINT}/${publicId}/wallet/transactions`, {}, "Unable to load customer transactions");
}

export async function getCustomerComplaints(publicId) {
  return apiRequest(`${ENDPOINT}/${publicId}/complaints`, {}, "Unable to load customer complaints");
}

export async function updateCustomerStatus(publicId, status) {
  return apiRequest(`${ENDPOINT}/${publicId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status })
  }, "Unable to update customer status");
}
