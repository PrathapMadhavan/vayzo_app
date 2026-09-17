import apiClient from "./apiClient";

export const getProducts = async (params = {}) => {
  const response = await apiClient.get("/restaurant_products", { params });
  return response.data;
};

export const getProductsByCategory = async (categoryId) => {
  const response = await apiClient.get(`/restaurant_products?categoryId=${categoryId}`);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await apiClient.get(`/restaurant_products/${id}`);
  return response.data;
};

export const addProduct = async (productData) => {
  const response = await apiClient.post("/restaurant_products", productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await apiClient.put(`/restaurant_products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/restaurant_products/${id}`);
  return response.data;
};
