import { useState, useEffect } from "react";
import {
  ArrowLeft,
  CloudUpload,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  UserRound,
  Check,
  Lock,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import {
  createAdminUser,
  getAdminUserById,
  updateAdminUser,
} from "../api/adminUsersApi";
import {
  MODULE_PERMISSIONS,
  ALL_PERMISSION_IDS,
  PERMISSION_PRESETS,
  ROLES,
} from "../constants/permissions";
import { validateImage } from "../utils/fileUtils";

const statusOptions = ["Active", "Inactive"];
const departmentOptions = [
  "Select Department",
  "Operations",
  "Support",
  "Finance",
  "IT",
  "Management",
  "Kitchen",
  "Marketing",
  "Logistics",
];

function RequiredLabel({ text }) {
  return (
    <span className="flex items-center gap-1">
      {text}
      <span className="text-danger text-sm">*</span>
    </span>
  );
}

export default function AddAdminUser() {
  const navigate = useNavigate();
  const { id, userId } = useParams();
  const adminId = id || userId;
  const isEditing = !!adminId;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Current session admin
  const currentAdmin = JSON.parse(
    localStorage.getItem("vayzo_admin_user") || "{}"
  );
  const isCurrentSuperAdmin = currentAdmin.role === ROLES.SUPER_ADMIN;

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    role: ROLES.ADMIN,
    department: departmentOptions[1], // "Operations" default
    status: statusOptions[0], // "Active"
    password: "",
    confirm: "",
    permissions: ["dashboard", "orders", "restaurants"], // Default starting set
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAdminUserById(adminId);

      if (!data) {
        setError("Admin user record not found.");
        return;
      }

      const toTitleCase = (str) => {
        if (!str) return "Active";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };

      setForm({
        name: data.name || "",
        email: data.email || "",
        mobile: data.phone || data.mobileNumber || "",
        role: data.role || ROLES.ADMIN,
        department: data.department || departmentOptions[1],
        status: data.status ? toTitleCase(data.status) : statusOptions[0],
        password: "",
        confirm: "",
        permissions: Array.isArray(data.permissions)
          ? data.permissions
          : data.role === ROLES.SUPER_ADMIN
          ? ["all"]
          : [],
      });

      setImagePreview(data.profileImage || data.image || null);
    } catch (err) {
      setError(err.message || "Unable to load administrator details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEditing) {
      loadUserData();
    }
  }, [adminId, isEditing]);

  const update = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  // Image Upload with base64 conversion for reliable local persistence
  const handleImageChange = async (e) => {
    setError("");
    const file = e.target.files?.[0];
    if (file) {
      try {
        await validateImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError(err.message || "Invalid image file.");
      }
    }
  };

  // Toggle individual permission checkbox
  const handleTogglePermission = (permissionId) => {
    if (form.role === ROLES.SUPER_ADMIN) return;

    setForm((prev) => {
      const currentPerms = prev.permissions.includes("all")
        ? [...ALL_PERMISSION_IDS]
        : [...prev.permissions];

      if (currentPerms.includes(permissionId)) {
        return {
          ...prev,
          permissions: currentPerms.filter((p) => p !== permissionId),
        };
      } else {
        return {
          ...prev,
          permissions: [...currentPerms, permissionId],
        };
      }
    });
  };

  // Apply a permission preset
  const handleApplyPreset = (presetPermissions) => {
    if (form.role === ROLES.SUPER_ADMIN) return;
    setForm((prev) => ({
      ...prev,
      permissions: [...presetPermissions],
    }));
  };

  const handleSelectAllPermissions = () => {
    if (form.role === ROLES.SUPER_ADMIN) return;
    setForm((prev) => ({
      ...prev,
      permissions: [...ALL_PERMISSION_IDS],
    }));
  };

  const handleClearPermissions = () => {
    if (form.role === ROLES.SUPER_ADMIN) return;
    setForm((prev) => ({
      ...prev,
      permissions: [],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setError("");

    // Form validations
    if (!form.name.trim()) {
      setError("Please enter the administrator's full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!form.mobile.trim()) {
      setError("Please enter a mobile phone number.");
      return;
    }

    if (!isEditing && !form.password) {
      setError("Please provide a password for the new administrator.");
      return;
    }

    if (form.password && form.password !== form.confirm) {
      setError("Passwords do not match. Please verify both password fields.");
      return;
    }

    if (form.department === departmentOptions[0]) {
      setError("Please select a valid department.");
      return;
    }

    // Role Escalation validation
    if (form.role === ROLES.SUPER_ADMIN && !isCurrentSuperAdmin) {
      setError("Only an existing Super Admin is authorized to grant the Super Admin role.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.mobile.trim(),
        role: form.role,
        department: form.department,
        status: form.status,
        permissions:
          form.role === ROLES.SUPER_ADMIN
            ? ["all"]
            : form.permissions,
      };

      if (form.password) {
        payload.password = form.password;
      }

      if (imagePreview) {
        payload.profileImage = imagePreview;
      }

      if (isEditing) {
        const updated = await updateAdminUser(adminId, payload);
        const currentStored = JSON.parse(localStorage.getItem("vayzo_admin_user") || "{}");
        if (
          currentStored.id === adminId ||
          currentStored.userId === adminId ||
          currentStored.email?.toLowerCase() === payload.email?.toLowerCase()
        ) {
          localStorage.setItem("vayzo_admin_user", JSON.stringify({ ...currentStored, ...updated }));
          window.dispatchEvent(new Event("vayzo_admin_user_updated"));
        }
      } else {
        await createAdminUser(payload);
      }

      navigate(-1);
    } catch (err) {
      setError(err.message || "Failed to save administrator.");
    } finally {
      setLoading(false);
    }
  };

  const isModuleGranted = (modId) => {
    if (form.role === ROLES.SUPER_ADMIN) return true;
    if (form.permissions.includes("all")) return true;
    return form.permissions.includes(modId);
  };

  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-border hover:bg-surface-hover transition-colors text-muted hover:text-foreground shadow-xs"
            title="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditing ? "Edit Administrator" : "Add New Administrator"}
            </h1>
            <p className="mt-1 text-xs text-muted">
              {isEditing
                ? "Update admin account details and configure granular module permissions."
                : "Create a system administrator account and assign access rights."}
            </p>
          </div>
        </header>

        {error && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger-dark text-sm font-medium flex items-center gap-3">
            <ShieldAlert size={20} className="shrink-0 text-danger" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2.3fr)_minmax(320px,0.9fr)] items-start">
          {/* Main Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col rounded-2xl border border-border bg-surface shadow-sm overflow-hidden"
          >
            {/* Section 1: User Profile Info */}
            <div className="border-b border-border p-6 sm:p-8">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <UserRound size={18} className="text-primary" />
                Personal Information
              </h2>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <Input
                    id="admin-full-name"
                    label={<RequiredLabel text="Full Name" />}
                    value={form.name}
                    onChange={update("name")}
                    placeholder="e.g. Rahul Sharma"
                    required
                  />

                  <Input
                    id="admin-email"
                    label={<RequiredLabel text="Email Address" />}
                    type="email"
                    value={form.email}
                    onChange={update("email")}
                    placeholder="e.g. rahul@vayzo.com"
                    required
                  />

                  <Input
                    id="admin-mobile"
                    label={<RequiredLabel text="Mobile Number" />}
                    type="tel"
                    value={form.mobile}
                    onChange={update("mobile")}
                    placeholder="e.g. +91 9876543210"
                    required
                  />
                </div>

                {/* Profile Image Upload */}
                <div className="flex flex-col">
                  <span className="mb-1.5 block text-xs font-semibold text-foreground">
                    Profile Photo
                  </span>
                  <label
                    htmlFor="profile-image-upload"
                    className="cursor-pointer flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background hover:bg-surface-hover hover:border-primary/40 transition-all text-center p-6 group overflow-hidden relative min-h-42.5"
                  >
                    <input
                      type="file"
                      id="profile-image-upload"
                      className="hidden"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageChange}
                    />
                    {imagePreview ? (
                      <div className="absolute inset-0">
                        <img
                          src={imagePreview}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                          <CloudUpload size={24} className="mb-1" />
                          <span className="text-xs font-medium">Change Photo</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2 transition-transform group-hover:scale-110">
                          <CloudUpload size={22} />
                        </div>
                        <p className="text-xs font-semibold text-foreground">
                          Upload Profile Picture
                        </p>
                        <p className="mt-1 text-[11px] text-muted">
                          PNG, JPG or WebP (max 2MP)
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Role, Department, Status */}
              <div className="mt-6 grid gap-6 sm:grid-cols-3">
                {/* Role selection */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    <RequiredLabel text="Assigned Role" />
                  </label>
                  <Select
                    id="admin-role-select"
                    value={form.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setForm((prev) => ({
                        ...prev,
                        role: newRole,
                        permissions:
                          newRole === ROLES.SUPER_ADMIN
                            ? ["all"]
                            : prev.permissions.includes("all")
                            ? ["dashboard", "restaurants", "orders"]
                            : prev.permissions,
                      }));
                    }}
                    className="h-10 text-xs"
                  >
                    <option value={ROLES.ADMIN}>Admin</option>
                    <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
                  </Select>
                  <p className="mt-1 text-[11px] text-muted">
                    {form.role === ROLES.SUPER_ADMIN
                      ? "Super Admin has full access."
                      : "Standard Admin with custom permissions."}
                  </p>
                </div>

                {/* Department */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    <RequiredLabel text="Department" />
                  </label>
                  <Select
                    id="admin-department-select"
                    value={form.department}
                    onChange={update("department")}
                    className="h-10 text-xs"
                  >
                    {departmentOptions.slice(1).map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Status */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    <RequiredLabel text="Status" />
                  </label>
                  <Select
                    id="admin-status-select"
                    value={form.status}
                    onChange={update("status")}
                    className="h-10 text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Account Password */}
            <div className="border-b border-border p-6 sm:p-8">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Lock size={18} className="text-primary" />
                {isEditing ? "Update Password (Optional)" : "Security Credentials"}
              </h2>
              <p className="mt-1 text-xs text-muted">
                {isEditing
                  ? "Leave password fields empty to keep existing password unchanged."
                  : "Set a strong password for this administrator to log in."}
              </p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="relative">
                  <Input
                    id="admin-password"
                    label={
                      isEditing ? "New Password" : <RequiredLabel text="Password" />
                    }
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={update("password")}
                    placeholder={isEditing ? "Leave blank to keep current" : "••••••••"}
                    required={!isEditing}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-muted hover:text-foreground transition-colors"
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    id="admin-confirm-password"
                    label={
                      isEditing ? "Confirm New Password" : (
                        <RequiredLabel text="Confirm Password" />
                      )
                    }
                    type={showConfirm ? "text" : "password"}
                    value={form.confirm}
                    onChange={update("confirm")}
                    placeholder={isEditing ? "Leave blank to keep current" : "••••••••"}
                    required={!isEditing && !!form.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-8 text-muted hover:text-foreground transition-colors"
                    aria-label="Toggle confirm password"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Section 3: Module Permissions Matrix */}
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck size={18} className="text-primary" />
                    Module Permissions Assignment
                  </h2>
                  <p className="mt-1 text-xs text-muted">
                    {form.role === ROLES.SUPER_ADMIN
                      ? "Super Admin accounts have full, unrestricted permissions across all modules."
                      : "Choose which modules this administrator can view and manage."}
                  </p>
                </div>

                {form.role !== ROLES.SUPER_ADMIN && (
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={handleSelectAllPermissions}
                      className="text-xs font-semibold text-primary hover:underline px-2 py-1"
                    >
                      Select All
                    </button>
                    <span className="text-border">|</span>
                    <button
                      type="button"
                      onClick={handleClearPermissions}
                      className="text-xs font-semibold text-muted hover:text-danger px-2 py-1"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>

              {/* Super Admin Notice */}
              {form.role === ROLES.SUPER_ADMIN ? (
                <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger-dark flex items-start gap-3">
                  <ShieldCheck size={20} className="shrink-0 text-danger mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-danger">Super Admin: Full System Authority</p>
                    <p className="mt-0.5 text-xs text-danger/90 leading-relaxed">
                      This user has global access to all features, restaurants, orders, finance, complaints,
                      platform settings, and admin user management.
                    </p>
                  </div>
                </div>
              ) : (
                /* Module Permissions Grid */
                <div className="grid gap-3 sm:grid-cols-2">
                  {MODULE_PERMISSIONS.map((mod) => {
                    const granted = isModuleGranted(mod.id);

                    return (
                      <div
                        key={mod.id}
                        onClick={() => handleTogglePermission(mod.id)}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                          granted
                            ? "bg-primary/4 border-primary/40 shadow-xs"
                            : "bg-background/60 border-border hover:border-border/90 hover:bg-surface-hover/50 opacity-75"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                            granted
                              ? "bg-primary border-primary text-white"
                              : "bg-surface border-border text-transparent"
                          }`}
                        >
                          <Check size={12} strokeWidth={3} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-foreground">
                              {mod.label}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-background border border-border text-muted font-medium">
                              {mod.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted leading-tight mt-1">
                            {mod.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Form Submit Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-border p-6 sm:p-8 bg-surface-50">
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 h-10 text-xs font-medium"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="px-8 h-10 text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-sm"
              >
                {loading
                  ? "Saving..."
                  : isEditing
                  ? "Save Administrator"
                  : "Create Administrator"}
              </Button>
            </div>
          </form>

          {/* Right Sidebar: Role Presets & Help */}
          <aside className="space-y-6">
            {/* Quick Presets Card */}
            {form.role !== ROLES.SUPER_ADMIN && (
              <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Sparkles size={16} className="text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Permission Presets
                  </h3>
                </div>

                <p className="text-xs text-muted leading-relaxed">
                  Apply a pre-configured template to grant appropriate module access with one click:
                </p>

                <div className="space-y-2">
                  {PERMISSION_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset.permissions)}
                      className="w-full text-left p-3 rounded-xl border border-border bg-background hover:bg-primary-light hover:border-primary/40 transition-colors group"
                    >
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {preset.label}
                      </p>
                      <p className="text-[11px] text-muted mt-0.5 leading-snug">
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* RBAC Info Card */}
            <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <Info size={16} className="text-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Security & Guidelines
                </h3>
              </div>

              <div className="space-y-3 text-xs text-muted leading-relaxed">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
                  <span>
                    <strong>Role Separation:</strong> Only Super Admins can manage platform settings and other admins.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
                  <span>
                    <strong>Data Integrity:</strong> Administrator emails and phone numbers must be unique across the platform.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
                  <span>
                    <strong>Protection:</strong> Super Admin accounts cannot be deleted or demoted to prevent system lockout.
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
