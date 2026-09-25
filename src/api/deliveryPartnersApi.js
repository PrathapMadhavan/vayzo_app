import { apiRequest } from "./apiClient";

const ENDPOINT = "/api/v1/admin/partners";

export async function getDeliveryPartners(filters = {}) {
  // Querying against the new normalized /partners collection
  let url = ENDPOINT;
  

  let data = await apiRequest(url, {}, "Unable to load delivery partners");
  
  if (filters.partnerTypes) {
    // Deterministic local filtering for array containment
    data = data.filter(partner => 
      partner.partnerTypes && partner.partnerTypes.includes(filters.partnerTypes)
    );
  }
  
  return data;
}

export async function getDeliveryPartnerById(id) {
  const result = await apiRequest(`${ENDPOINT}/${id}`, {}, "Unable to load delivery partner");
  return result.data || result;
}

export async function createDeliveryPartner(partnerData) {
  
  const body = partnerData instanceof FormData ? partnerData : JSON.stringify(partnerData);

  return apiRequest(ENDPOINT, {
    method: "POST",
    body,
  }, "Unable to create delivery partner");
}

export async function updateDeliveryPartner(id, partnerData) {
  const body = partnerData instanceof FormData ? partnerData : JSON.stringify(partnerData);
  
  return apiRequest(`${ENDPOINT}/${id}`, {
    method: "PATCH",
    body,
  }, "Unable to update delivery partner");
}

