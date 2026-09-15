import { apiRequest } from "./apiClient";

const ENDPOINT = "/api/v1/admin/categories";

export async function getCategories() {
  return apiRequest(ENDPOINT, {}, "Failed to fetch categories");
}

export async function getCategoryById(id) {
  return apiRequest(`${ENDPOINT}/${id}`, {}, "Failed to fetch category");
}

export async function getCategoriesByParentId(parentId) {
  return apiRequest(`${ENDPOINT}?parentId=${parentId}`, {}, "Failed to fetch child categories");
}

export async function createCategory(categoryData) {
  return apiRequest(ENDPOINT, {
    method: "POST",
    body: JSON.stringify(categoryData),
  }, "Failed to create category");
}

export async function updateCategory(id, categoryData) {
  return apiRequest(`${ENDPOINT}/${id}`, {
    method: "PUT",
    body: JSON.stringify(categoryData),
  }, "Failed to update category");
}

export async function deleteCategory(id) {
  return apiRequest(`${ENDPOINT}/${id}`, {
    method: "DELETE",
  }, "Failed to delete category");
}
