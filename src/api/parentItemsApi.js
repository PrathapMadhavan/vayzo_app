import { apiRequest } from "./apiClient";

const BASE_ENDPOINT = "/api/v1/admin/categories";
const ITEM_ENDPOINT = "/api/v1/admin/parent-items";

export const getParentItemsByCategory = async (categoryId) => {
  return await apiRequest(`${BASE_ENDPOINT}/${categoryId}/parent-items`);
};

export const getAllParentItems = async () => {
  return await apiRequest(`${ITEM_ENDPOINT}`);
};

export const getParentItemById = async (id) => {
  return await apiRequest(`${ITEM_ENDPOINT}/${id}`);
};

export const addParentItem = async (categoryId, itemData) => {
  const payload = { ...itemData, categoryId };
  return await apiRequest(`${ITEM_ENDPOINT}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateParentItem = async (id, itemData) => {
  return await apiRequest(`${ITEM_ENDPOINT}/${id}`, {
    method: "PUT",
    body: JSON.stringify(itemData),
  });
};

export const deleteParentItem = async (id) => {
  return await apiRequest(`${ITEM_ENDPOINT}/${id}`, {
    method: "DELETE",
  });
};
