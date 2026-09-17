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
      const fetchHeaders = new Headers();
      fetchHeaders.append("Content-Type", "application/json");

      // Attach any custom headers passed in options
      if (options && options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          fetchHeaders.set(key, value);
        });
      }

      // Do not attach token for authentication endpoints (e.g. login, otp, forgot-password)
      if (endpoint && !endpoint.includes("/auth/")) {
        const token = localStorage.getItem("vayzo_admin_token");
        if (token) {
          fetchHeaders.set("Authorization", `Bearer ${token}`);
        }
      }

      const fetchOptions = {
        method: method,
        headers: fetchHeaders,
      };

      if (options && options.body) {
        fetchOptions.body = options.body;
      }

      let response;
      try {
        response = await fetch(url, fetchOptions);
      } catch (networkError) {
        console.error("Network or CORS error when fetching from:", url, networkError);
        throw new Error("Unable to connect to the server. Please check your connection or server status.");
      }

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
