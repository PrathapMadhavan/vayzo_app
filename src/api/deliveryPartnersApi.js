import { apiRequest } from "./apiClient";

const ENDPOINT = "/api/v1/admin/partners";

export async function getDeliveryPartners(filters = {}) {
  // Querying against the new normalized /partners collection
  let url = ENDPOINT;
  
  const queryParams = [];
  if (filters.accountStatus) {
    queryParams.push(`accountStatus=${filters.accountStatus}`);
  }
  if (filters.verificationStatus) {
    queryParams.push(`verificationStatus=${filters.verificationStatus}`);
  }
  if (filters.availabilityStatus) {
    queryParams.push(`availabilityStatus=${filters.availabilityStatus}`);
  }
  
  if (queryParams.length > 0) {
    url += `?${queryParams.join("&")}`;
  }
  
  let data = await apiRequest(url, {}, "Unable to load delivery partners");
  
  if (filters.partnerTypes) {
    // Deterministic local filtering for array containment
    data = data.filter(partner => 
      partner.partnerTypes && partner.partnerTypes.includes(filters.partnerTypes)
    );
  }
  
  return data;
}

export async function getDeliveryPartnerById(partnerId) {
  // Use the new aggregated endpoint
  const result = await apiRequest(`${ENDPOINT}/${partnerId}`, {}, "Unable to load delivery partner");
  const response = result.data || result;
  
  // Also fetch related endpoints
  try {
    const activityResult = await apiRequest(`${ENDPOINT}/${partnerId}/activity`);
    const reviewsResult = await apiRequest(`${ENDPOINT}/${partnerId}/reviews`);
    
    // Attach to the main response for convenience
    if (response) {
      response.activity = activityResult?.data?.content || [];
      response.reviews = reviewsResult?.data?.reviews || [];
      response.reviewSummary = reviewsResult?.data?.summary || {};
    }
  } catch (err) {
    console.error("Failed to load associated partner activity/reviews", err);
  }

  return response;
}

export async function createDeliveryPartner(partnerData) {
  console.warn("MISSING REQUIREMENT: Backend generation of business partnerId is unavailable. Falling back to json-server internal id.");
  
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

export async function deleteDeliveryPartner(id) {
  await apiRequest(`${ENDPOINT}/${id}`, {
    method: "DELETE",
  }, "Unable to delete delivery partner");
  
  return true;
}

export async function getDeliveryPartnerLocation(partnerId) {
  // Simulating an endpoint that returns location data specifically.
  // In the future this can be updated to fetch from a dedicated backend endpoint
  // like GET /api/delivery-partners/:partnerId/location
  const data = await apiRequest(`/deliveryPartners?partnerId=${partnerId}`, {}, "Unable to load delivery partner location");

  if (!data || !data.length) {
    throw new Error("Delivery partner not found");
  }

  const partner = data[0];
  return {
    success: true,
    data: {
      address: partner.address || "",
      latitude: partner.latitude || null,
      longitude: partner.longitude || null
    }
  };
}
