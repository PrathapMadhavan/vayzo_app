import { API_BASE_URL } from "./config";

export async function apiRequest(
  endpoint,
  options = {},
  customErrorMessage = "API request failed",
) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = localStorage.getItem("vayzo_admin_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    headers,
    ...options,
  });

  if (!response.ok) {
    let errorMessage = customErrorMessage;
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore json parse error
    }

    if (response.status === 401) {
      localStorage.removeItem("vayzo_admin_logged_in");
      localStorage.removeItem("vayzo_admin_token");
      localStorage.removeItem("vayzo_admin_user");
      // Optional: Redirect to login if unauthenticated
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    throw new Error(errorMessage);
  }

  // Some operations (like DELETE in json-server) return empty body.
  const text = await response.text();
  return text ? JSON.parse(text) : true;
}
