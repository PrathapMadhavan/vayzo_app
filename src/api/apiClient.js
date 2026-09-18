import { API_BASE_URL } from "./config";

const pendingRequests = new Map();

export async function apiRequest(endpoint, options = {}, customErrorMessage = "API request failed") {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = options.method || "GET";

  if (method === "GET") {
    const key = url;
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key);
    }
  }

  const requestPromise = (async () => {
    try {
      const headers = {
        ...(options.headers || {}),
      };
      if (options.body && options.body instanceof FormData) {
        // fetch automatically sets multipart/form-data with boundaries
      } else if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }

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

      const text = await response.text();
      return text ? JSON.parse(text) : true;
    } finally {
      if (method === "GET") {
        pendingRequests.delete(url);
      }
    }
  })();

  if (method === "GET") {
    pendingRequests.set(url, requestPromise);
  }

  return requestPromise;
}
