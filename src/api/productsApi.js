import { apiRequest } from "./apiClient";

const ENDPOINT = "/api/restaurant_products";

export const getProducts = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const queryString = queryParams ? `?${queryParams}` : "";
  return await apiRequest(`${ENDPOINT}${queryString}`);
};

export const getProductsByCategory = async (categoryId) => {
  return await apiRequest(`${ENDPOINT}?categoryId=${categoryId}`);
};

export const getProductById = async (id) => {
  return await apiRequest(`${ENDPOINT}/${id}`);
};

export const addProduct = async (productData) => {
  return await apiRequest(ENDPOINT, {
    method: "POST",
    body: JSON.stringify(productData),
  });
};

export const updateProduct = async (id, productData) => {
  return await apiRequest(`${ENDPOINT}/${id}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
};

export const deleteProduct = async (id) => {
  return await apiRequest(`${ENDPOINT}/${id}`, {
    method: "DELETE",
  });
};
