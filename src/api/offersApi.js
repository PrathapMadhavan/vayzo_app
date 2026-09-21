import { apiRequest } from "./apiClient";

const ENDPOINT = "/api/v1/admin/offers";

export async function getOffers() {
  return apiRequest(ENDPOINT, {}, "Unable to load offers");
}

export async function getOfferById(id) {
  const data = await apiRequest(`${ENDPOINT}/${id}`, {}, "Unable to load offer");

  if (!data || Object.keys(data).length === 0) {
    throw new Error("Offer not found");
  }

  return data;
}

export async function createOffer(offerData) {
  console.warn("MISSING REQUIREMENT: Backend generation of business offer ID is unavailable.");
  const newOffer = {
    ...offerData,
    offerId: offerData.offerId || `OFR${Date.now()}`,
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
