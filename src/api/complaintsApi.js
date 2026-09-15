import { apiRequest } from "./apiClient";

const ENDPOINT = "/api/v1/admin/support";

export async function getComplaints() {
  return apiRequest(ENDPOINT, {}, "Unable to load complaints");
}

export async function getComplaintById(id) {
  return apiRequest(`${ENDPOINT}/${id}`, {}, "Unable to load complaint details");
}

export async function updateComplaint(id, complaintData) {
  return apiRequest(`${ENDPOINT}/${id}`, {
    method: "PUT",
    body: JSON.stringify(complaintData),
  }, "Unable to update complaint");
}

export async function deleteComplaint(id) {
  await apiRequest(`${ENDPOINT}/${id}`, {
    method: "DELETE",
  }, "Unable to delete complaint");
  return true;
}
