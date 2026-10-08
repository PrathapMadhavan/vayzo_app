import { apiRequest } from "./apiClient";

const BASE_ENDPOINT = "/api/v1/admin/parent-items";
const ITEM_ENDPOINT = "/api/v1/admin/child-items";

export const getChildItemsByParentItem = async (parentItemId) => {
  return await apiRequest(`${BASE_ENDPOINT}/${parentItemId}/items`);
};

export const getAllChildItems = async () => {
  return await apiRequest(`${ITEM_ENDPOINT}`);
};

export const getChildItemById = async (id) => {
  return await apiRequest(`${ITEM_ENDPOINT}/${id}`);
};

export const addChildItem = async (parentItemId, itemData) => {
  return await apiRequest(`${ITEM_ENDPOINT}`, {
    method: "POST",
    body: JSON.stringify(itemData),
  });
};

export const updateChildItem = async (id, itemData) => {
  return await apiRequest(`${ITEM_ENDPOINT}/${id}`, {
    method: "PUT",
    body: JSON.stringify(itemData),
  });
};

export const deleteChildItem = async (id) => {
  return await apiRequest(`${ITEM_ENDPOINT}/${id}`, {
    method: "DELETE",
  });
};
