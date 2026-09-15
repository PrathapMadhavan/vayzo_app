import { apiRequest } from "./apiClient";

export async function getGeneralSettings() {
  return apiRequest("/settings/general", {}, "Failed to fetch general settings");
}

export async function saveGeneralSettings(settings) {
  return apiRequest("/settings/general", {
    method: "PATCH",
    body: JSON.stringify(settings),
  }, "Failed to save general settings");
}

export async function getPaymentSettings() {
  return apiRequest("/settings/payment", {}, "Failed to fetch payment settings");
}

export async function savePaymentSettings(settings) {
  return apiRequest("/settings/payment", {
    method: "PATCH",
    body: JSON.stringify(settings),
  }, "Failed to save payment settings");
}

export async function getCommissionSettings() {
  return apiRequest("/settings/commission", {}, "Failed to fetch commission settings");
}

export async function saveCommissionSettings(settings) {
  return apiRequest("/settings/commission", {
    method: "PATCH",
    body: JSON.stringify(settings),
  }, "Failed to save commission settings");
}

export async function getDeliverySettings() {
  return apiRequest("/settings/delivery", {}, "Failed to fetch delivery settings");
}

export async function saveDeliverySettings(settings) {
  return apiRequest("/settings/delivery", {
    method: "PATCH",
    body: JSON.stringify(settings),
  }, "Failed to save delivery settings");
}

export async function getSiteSettings() {
  return apiRequest("/settings/site", {}, "Failed to fetch site settings");
}

export async function saveSiteSettings(settings) {
  return apiRequest("/settings/site", {
    method: "PATCH",
    body: JSON.stringify(settings),
  }, "Failed to save site settings");
}

export async function getEmailSettings() {
  return apiRequest("/settings/email", {}, "Failed to fetch email settings");
}

export async function saveEmailSettings(settings) {
  return apiRequest("/settings/email", {
    method: "PATCH",
    body: JSON.stringify(settings),
  }, "Failed to save email settings");
}

export async function getSMSSettings() {
  return apiRequest("/settings/sms", {}, "Failed to fetch SMS settings");
}

export async function saveSMSSettings(settings) {
  return apiRequest("/settings/sms", {
    method: "PATCH",
    body: JSON.stringify(settings),
  }, "Failed to save SMS settings");
}

export async function getNotificationSettings() {
  return apiRequest("/settings/notification", {}, "Failed to fetch notification settings");
}

export async function saveNotificationSettings(settings) {
  return apiRequest("/settings/notification", {
    method: "PATCH",
    body: JSON.stringify(settings),
  }, "Failed to save notification settings");
}

export async function getSEOSettings() {
  return apiRequest("/settings/seo", {}, "Failed to fetch SEO settings");
}

export async function saveSEOSettings(settings) {
  return apiRequest("/settings/seo", {
    method: "PATCH",
    body: JSON.stringify(settings),
  }, "Failed to save SEO settings");
}

export async function getAppSettings() {
  return apiRequest("/settings/app", {}, "Failed to fetch app settings");
}

export async function saveAppSettings(settings) {
  return apiRequest("/settings/app", {
    method: "PATCH",
    body: JSON.stringify(settings),
  }, "Failed to save app settings");
}

export async function getSecuritySettings() {
  return apiRequest("/settings/security", {}, "Failed to fetch security settings");
}

export async function saveSecuritySettings(settings) {
  return apiRequest("/settings/security", {
    method: "PATCH",
    body: JSON.stringify(settings),
  }, "Failed to save security settings");
}

export async function getMaintenanceModeSettings() {
  return apiRequest("/settings/maintenance", {}, "Failed to fetch maintenance mode settings");
}

export async function saveMaintenanceModeSettings(settings) {
  return apiRequest("/settings/maintenance", {
    method: "PATCH",
    body: JSON.stringify(settings),
  }, "Failed to save maintenance mode settings");
}

export async function getIntegrationSettings() {
  return apiRequest("/settings/integrations", {}, "Failed to fetch integration settings");
}

export async function saveIntegrationSettings(settings) {
  return apiRequest("/settings/integrations", {
    method: "PATCH",
    body: JSON.stringify(settings),
  }, "Failed to save integration settings");
}
