import { apiRequest } from "./apiClient";
import { ROLES } from "../constants/permissions";

const API_ENDPOINT = "/api/v1/admin/admin-users";

/**
 * Fetch all admin users with optional filters
 * @param {object} filters - { searchQuery, role, status }
 */
export async function getAdminUsers(filters = {}) {
  let data = await apiRequest(API_ENDPOINT);

  if (!data) return [];

  if (filters.role && filters.role !== "All Roles") {
    data = data.filter((user) => user.role === filters.role);
  }

  if (filters.status && filters.status !== "All Status") {
    data = data.filter((user) => {
      const uStatus = (user.status || "").toLowerCase();
      const fStatus = filters.status.toLowerCase();
      return uStatus === fStatus;
    });
  }

  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    data = data.filter((user) =>
      user.name?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.phone?.includes(q) ||
      user.mobileNumber?.includes(q) ||
      user.userId?.toLowerCase().includes(q) ||
      user.department?.toLowerCase().includes(q)
    );
  }

  return data;
}

/**
 * Fetch a single admin user by ID
 * @param {string} id
 */
export async function getAdminUserById(id) {
  if (!id) return null;
  try {
    const data = await apiRequest(`${API_ENDPOINT}/${id}`);
    if (data && (data.id || data.email)) return data;
  } catch (err) {
    // Fall through to lookup
  }
  const all = await getAdminUsers();
  return (
    all.find(
      (u) =>
        u.id === id ||
        u.userId === id ||
        u.email?.toLowerCase() === id.toLowerCase()
    ) || null
  );
}

/**
 * Create a new admin user with details and permissions
 * @param {object} userData
 */
export async function createAdminUser(userData) {
  // Validate email uniqueness
  const allAdmins = await getAdminUsers();

  const emailLower = userData.email?.trim().toLowerCase();
  if (allAdmins.some((a) => a.email?.toLowerCase() === emailLower)) {
    throw new Error("An admin user with this email address already exists.");
  }

  if (userData.phone) {
    const cleanPhone = userData.phone.replace(/[\s-]/g, "");
    if (
      allAdmins.some((a) => {
        const p = (a.phone || a.mobileNumber || "").replace(/[\s-]/g, "");
        return p && p === cleanPhone;
      })
    ) {
      throw new Error("An admin user with this phone number already exists.");
    }
  }

  // Authorization check: Only a Super Admin can create another Super Admin
  const currentAdmin = JSON.parse(localStorage.getItem("vayzo_admin_user") || "{}");
  if (userData.role === ROLES.SUPER_ADMIN && currentAdmin.role !== ROLES.SUPER_ADMIN) {
    throw new Error("Only a Super Admin can create another Super Admin account.");
  }

  const idSuffix = Date.now().toString().slice(-6);
  const newId = `ADM${idSuffix}`;

  const newUser = {
    id: newId,
    userId: newId,
    name: userData.name?.trim(),
    email: emailLower,
    phone: userData.phone || userData.mobile || "",
    mobileNumber: userData.phone || userData.mobile || "",
    role: userData.role || ROLES.ADMIN,
    department: userData.department || "Operations",
    status: userData.status || "Active",
    password: userData.password || "admin@123",
    permissions:
      userData.role === ROLES.SUPER_ADMIN
        ? ["all"]
        : Array.isArray(userData.permissions)
        ? userData.permissions
        : [],
    profileImage: userData.profileImage || null,
    lastLogin: "-",
    joinedDate: new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
  };

  return await apiRequest(API_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(newUser),
  });
}

/**
 * Update an existing admin user
 * @param {string} id
 * @param {object} userData
 */
export async function updateAdminUser(id, userData) {
  const existingUser = await getAdminUserById(id);
  if (!existingUser) {
    throw new Error("Admin user not found.");
  }

  const currentAdmin = JSON.parse(localStorage.getItem("vayzo_admin_user") || "{}");

  // Validate unique email if changing email
  if (userData.email) {
    const newEmail = userData.email.trim().toLowerCase();
    if (newEmail !== existingUser.email?.toLowerCase()) {
      const allAdmins = await getAdminUsers();
      if (allAdmins.some((a) => a.id !== id && a.email?.toLowerCase() === newEmail)) {
        throw new Error("An admin user with this email address already exists.");
      }
    }
  }

  // Authorization check: prevent unauthorized role escalation
  if (
    userData.role === ROLES.SUPER_ADMIN &&
    existingUser.role !== ROLES.SUPER_ADMIN &&
    currentAdmin.role !== ROLES.SUPER_ADMIN
  ) {
    throw new Error("Only a Super Admin can promote an account to Super Admin.");
  }

  // Super Admin cannot demote themselves to Admin if they are the current logged-in Super Admin
  if (
    existingUser.role === ROLES.SUPER_ADMIN &&
    userData.role &&
    userData.role !== ROLES.SUPER_ADMIN &&
    existingUser.id === currentAdmin.id
  ) {
    throw new Error("You cannot revoke your own Super Admin role.");
  }

  const updatedUser = {
    ...existingUser,
    ...userData,
    id: existingUser.id,
    userId: existingUser.userId || existingUser.id,
    name: userData.name !== undefined ? userData.name.trim() : existingUser.name,
    email: userData.email !== undefined ? userData.email.trim().toLowerCase() : existingUser.email,
    phone:
      userData.phone !== undefined
        ? userData.phone
        : userData.mobile !== undefined
        ? userData.mobile
        : existingUser.phone,
    mobileNumber:
      userData.phone !== undefined
        ? userData.phone
        : userData.mobile !== undefined
        ? userData.mobile
        : existingUser.mobileNumber,
    role: userData.role || existingUser.role,
    department: userData.department || existingUser.department,
    status: userData.status || existingUser.status,
    permissions:
      (userData.role || existingUser.role) === ROLES.SUPER_ADMIN
        ? ["all"]
        : userData.permissions !== undefined
        ? userData.permissions
        : existingUser.permissions || [],
    profileImage:
      userData.profileImage !== undefined ? userData.profileImage : existingUser.profileImage,
    password: userData.password ? userData.password : existingUser.password,
    updatedAt: new Date().toISOString(),
  };

  const targetId = existingUser.id || id;
  return await apiRequest(`${API_ENDPOINT}/${targetId}`, {
    method: "PUT",
    body: JSON.stringify(updatedUser),
  });
}

/**
 * Delete an admin user (Super Admin only, Super Admin cannot be deleted)
 * @param {string} id
 */
export async function deleteAdminUser(id) {
  const existingUser = await getAdminUserById(id);
  if (!existingUser) {
    throw new Error("Admin user not found.");
  }

  if (existingUser.role === ROLES.SUPER_ADMIN) {
    throw new Error("Super Admin accounts cannot be deleted.");
  }

  const currentAdmin = JSON.parse(localStorage.getItem("vayzo_admin_user") || "{}");
  if (currentAdmin.role !== ROLES.SUPER_ADMIN) {
    throw new Error("Only a Super Admin has authorization to delete admin users.");
  }

  await apiRequest(`${API_ENDPOINT}/${id}`, {
    method: "DELETE",
  });

  return { success: true };
}
