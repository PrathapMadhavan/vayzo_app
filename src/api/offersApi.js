import { apiRequest } from "./apiClient";

const ENDPOINT = "/api/v1/admin/offers";

export async function getOffers() {
  return apiRequest(ENDPOINT, {}, "Unable to load offers");
}

export async function getOfferById(offerId) {
  const data = await apiRequest(`${ENDPOINT}?offerId=${offerId}`, {}, "Unable to load offer");

  if (!data || !data.length) {
    throw new Error("Offer not found");
  }

  return data[0];
}

export async function createOffer(offerData) {
  console.warn("MISSING REQUIREMENT: Backend generation of business offer ID is unavailable.");
  const newOffer = {
    ...offerData,
    createdAt: new Date().toISOString(),
  };

  return apiRequest(ENDPOINT, {
    method: "POST",
    body: JSON.stringify(newOffer),
  }, "Unable to create offer");
}

export async function updateOffer(id, updateData) {
  return apiRequest(`${ENDPOINT}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updateData),
  }, "Unable to update offer");
}

export async function deleteOffer(id) {
  return apiRequest(`${ENDPOINT}/${id}`, {
    method: "DELETE",
  }, "Unable to delete offer");
}
