import { apiRequest } from "./apiClient";

const ENDPOINT = "/api/v1/admin/categories/categoryitems";

export const getCategoryItems = async (params = {}) => {
  const queryParams = new URLSearchParams(params).toString();
  const queryString = queryParams ? `?${queryParams}` : "";
  return await apiRequest(`${ENDPOINT}${queryString}`);
};

export const getCategoryItemsByCategory = async (categoryId) => {
  return await apiRequest(`${ENDPOINT}?categoryId=${categoryId}`);
};

export const addCategoryItem = async (itemData) => {
  return await apiRequest(ENDPOINT, {
    method: "POST",
    body: JSON.stringify(itemData),
  });
};

export const updateCategoryItem = async (id, itemData) => {
  return await apiRequest(`${ENDPOINT}/${id}`, {
    method: "PUT",
    body: JSON.stringify(itemData),
  });
};

export const deleteCategoryItem = async (id) => {
  return await apiRequest(`${ENDPOINT}/${id}`, {
    method: "DELETE",
  });
};
