import { apiRequest } from "./apiClient";
import { API_BASE_URL } from "./config";

const ENDPOINT = "/api/v1/admin/customers";

const resolveImageUrl = (img) => {
  if (img && img.startsWith("/uploads/")) {
    const base = API_BASE_URL || window.location.origin;
    return `${base}${img}`;
  }
  return img;
};

const resolveCustomerImage = (customer) => {
  if (customer && customer.profileImage) {
    customer.profileImage = resolveImageUrl(customer.profileImage);
  }
  return customer;
};

export async function getCustomers(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const data = await apiRequest(`${ENDPOINT}${query ? `?${query}` : ""}`, {}, "Unable to load customers");
  return Array.isArray(data) ? data.map(resolveCustomerImage) : data;
}

export async function getCustomerById(publicId) {
  const data = await apiRequest(`${ENDPOINT}/${publicId}`, {}, "Unable to load customer");

  if (!data) {
    throw new Error("Customer not found");
  }

  return resolveCustomerImage(data);
}

export async function createCustomer(formData) {
  const data = await apiRequest(ENDPOINT, {
    method: "POST",
    body: formData,
  }, "Unable to create customer");
  return resolveCustomerImage(data);
}

export async function updateCustomer(publicId, formData) {
  const data = await apiRequest(`${ENDPOINT}/${publicId}`, {
    method: "PATCH",
    body: formData,
  }, "Unable to update customer");
  return resolveCustomerImage(data);
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
