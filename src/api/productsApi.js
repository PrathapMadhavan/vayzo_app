import { apiRequest } from "./apiClient";

export const getProducts = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const queryString = queryParams ? `?${queryParams}` : "";
  return await apiRequest(`/restaurant_products${queryString}`);
};

export const getProductsByCategory = async (categoryId) => {
  return await apiRequest(`/restaurant_products?categoryId=${categoryId}`);
};

export const getProductById = async (id) => {
  return await apiRequest(`/restaurant_products/${id}`);
};

export const addProduct = async (productData) => {
  return await apiRequest("/restaurant_products", {
    method: "POST",
    body: JSON.stringify(productData),
  });
};

export const updateProduct = async (id, productData) => {
  return await apiRequest(`/restaurant_products/${id}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });
};

export const deleteProduct = async (id) => {
  return await apiRequest(`/restaurant_products/${id}`, {
    method: "DELETE",
  });
};
