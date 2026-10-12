/**
 * VAYZO Admin Role and Permission Definitions
 * RECOMMENDED MOCK ARCHITECTURE / RBAC SPEC
 */

export const ROLES = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
};

export const MODULE_PERMISSIONS = [
  {
    id: "dashboard",
    label: "Dashboard & Analytics",
    description: "Access high-level metrics, revenue graphs, and operational dashboard.",
    category: "General",
  },
  {
    id: "restaurants",
    label: "Restaurants & Menus",
    description: "Manage restaurant listings, custom categories, items, and menu variants.",
    category: "Operations",
  },
  {
    id: "orders",
    label: "Orders Management",
    description: "View incoming orders, update progress statuses, and review order receipts.",
    category: "Operations",
  },
  {
    id: "customers",
    label: "Customer Management",
    description: "View customer profiles, contact info, wallets, and account statuses.",
    category: "Users",
  },
  {
    id: "delivery",
    label: "Delivery Fleet",
    description: "Review delivery partners, verify documents, and track active riders.",
    category: "Operations",
  },
  {
    id: "categories",
    label: "Categories & Catalog",
    description: "Maintain global categories, parent food items, and classification hierarchy.",
    category: "Catalog",
  },
  {
    id: "offers",
    label: "Offers & Discounts",
    description: "Create, schedule, edit, and toggle promotional coupons and discounts.",
    category: "Marketing",
  },
  {
    id: "earnings",
    label: "Earnings & Finance",
    description: "View gross revenue, partner payouts, transaction records, and settlements.",
    category: "Finance",
  },
  {
    id: "complaints",
    label: "Complaints & Helpdesk",
    description: "Review customer and partner complaints, update resolutions, and support tickets.",
    category: "Support",
  },
  {
    id: "reports",
    label: "Reports & Exports",
    description: "Generate sales, rider, and restaurant reports with CSV export capabilities.",
    category: "Finance",
  },
  {
    id: "notifications",
    label: "Notifications Hub",
    description: "Broadcast system announcements and view operational alerts.",
    category: "Communication",
  },
  {
    id: "settings",
    label: "Platform Settings",
    description: "Configure general settings, commission rates, fees, SMS, and email settings.",
    category: "Configuration",
  },
  {
    id: "admin_users",
    label: "Admin Management",
    description: "Create and manage system sub-administrators and assign role permissions.",
    category: "Security",
  },
];

export const ALL_PERMISSION_IDS = MODULE_PERMISSIONS.map((p) => p.id);

export const PERMISSION_PRESETS = [
  {
    id: "full",
    label: "Full Access",
    description: "Grant full access to every module across the admin console.",
    permissions: [...ALL_PERMISSION_IDS],
  },
  {
    id: "operations",
    label: "Operations Lead",
    description: "Day-to-day operations: restaurants, orders, delivery fleet, and categories.",
    permissions: ["dashboard", "restaurants", "orders", "delivery", "categories", "notifications"],
  },
  {
    id: "support",
    label: "Customer Support",
    description: "Helpdesk support: orders, customer accounts, and complaints resolution.",
    permissions: ["dashboard", "orders", "customers", "complaints", "notifications"],
  },
  {
    id: "finance",
    label: "Finance & Accounts",
    description: "Financial oversight: revenue, earnings, payouts, and reports.",
    permissions: ["dashboard", "earnings", "reports", "offers"],
  },
];

/**
 * Checks if an admin user has permission for a specific module
 * @param {object} user - The user object from session or state
 * @param {string} permission - The module permission id
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user) return false;
  if (user.role === ROLES.SUPER_ADMIN) return true;
  if (Array.isArray(user.permissions)) {
    if (user.permissions.includes("all")) return true;
    return user.permissions.includes(permission);
  }
  return false;
}

/**
 * Checks if a user is Super Admin
 * @param {object} user
 * @returns {boolean}
 */
export function isSuperAdmin(user) {
  return user?.role === ROLES.SUPER_ADMIN;
}
