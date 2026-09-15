import { apiRequest } from "./apiClient";

const ADMIN_ENDPOINT = "/adminUsers";

export async function login(email, password) {
  try {
    const response = await apiRequest(`/api/v1/admin/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return response; 
    // expected: { success: true, message: "...", data: { accessToken, tokenType, user } }
  } catch (err) {
    throw new Error(err.message || "Invalid email or password");
  }
}

export async function requestLoginOtp(contact) {
  if (!contact) {
    throw new Error("Contact is required");
  }

  // Use the new mock server auth endpoint
  try {
    const response = await apiRequest("/api/v1/admin/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ mobileNumber: contact }),
    });
    return response; // { success: true, message: "..." }
  } catch (err) {
    throw new Error(err.message || "Admin account not found. Please check your mobile number.");
  }
}

export async function verifyLoginOtp(contact, otp) {
  if (!contact || !otp) {
    throw new Error("Contact and OTP are required");
  }

  try {
    const response = await apiRequest("/api/v1/admin/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ mobileNumber: contact, otp }),
    });
    return response; 
    // { success: true, data: { accessToken, tokenType, user } }
  } catch (err) {
    throw new Error(err.message || "Invalid OTP or Admin User not found");
  }
}

export async function requestPasswordReset(email) {
  try {
    const response = await apiRequest("/api/v1/admin/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return response;
  } catch (err) {
    throw new Error(err.message || "Email not registered as an Admin. Please check the email address.");
  }
}

export async function resetPassword(email, newPassword) {
  return { success: true, message: "Password reset not fully implemented in mock" };
}
