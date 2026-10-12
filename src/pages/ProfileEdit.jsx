import { useState, useEffect, useRef } from "react";
import { ArrowLeft, User, Mail, Shield, Camera, Phone, Building2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Avatar from "../components/ui/Avatar";
import { updateAdminUser, getAdminUserById } from "../api/adminUsersApi";
import { ROLES } from "../constants/permissions";
import { validateImage } from "../utils/fileUtils";

const departmentOptions = [
  "Management",
  "Operations",
  "Support",
  "Finance",
  "IT",
  "Kitchen",
  "Marketing",
  "Logistics",
];

export default function ProfileEdit() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [canonicalId, setCanonicalId] = useState("ADM001");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Management",
    role: ROLES.SUPER_ADMIN,
  });

  useEffect(() => {
    let isMounted = true;

    const loadProfileData = async () => {
      try {
        setFetching(true);
        setError("");

        // 1. Resolve stored user from session
        const storedStr = localStorage.getItem("vayzo_admin_user");
        const storedUser = storedStr ? JSON.parse(storedStr) : {};
        const targetId = storedUser.id || storedUser.userId || "ADM001";
        setCanonicalId(targetId);

        // 2. Fetch canonical admin record from API
        const apiUser = await getAdminUserById(targetId);

        if (isMounted && apiUser) {
          setForm({
            name: apiUser.name || "",
            email: apiUser.email || "",
            phone: apiUser.phone || apiUser.mobileNumber || "",
            department: apiUser.department || "Management",
            role: apiUser.role || ROLES.SUPER_ADMIN,
          });
          setImagePreview(apiUser.profileImage || apiUser.image || null);
          setCanonicalId(apiUser.id || targetId);
        } else if (isMounted && storedUser) {
          setForm({
            name: storedUser.name || "",
            email: storedUser.email || "",
            phone: storedUser.phone || storedUser.mobileNumber || "",
            department: storedUser.department || "Management",
            role: storedUser.role || ROLES.SUPER_ADMIN,
          });
          setImagePreview(storedUser.profileImage || null);
        }
      } catch (err) {
        console.error("Failed to load canonical admin profile:", err);
        if (isMounted) {
          setError("Failed to fetch profile details from server.");
        }
      } finally {
        if (isMounted) setFetching(false);
      }
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, []);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Profile image upload using FileReader for persistent base64 data URLs
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
        console.error("Failed to process image:", err);
        setError(err.message || "Failed to load image file.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      // Load existing record to guarantee role and permissions are preserved
      const existingUser = await getAdminUserById(canonicalId);
      const targetId = existingUser?.id || canonicalId;

      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        mobileNumber: form.phone.trim(),
        department: form.department,
        // Strictly protect Super Admin role and permissions from being altered
        role: existingUser?.role || ROLES.SUPER_ADMIN,
        permissions:
          existingUser?.role === ROLES.SUPER_ADMIN
            ? ["all"]
            : existingUser?.permissions || ["all"],
        status: existingUser?.status || "Active",
      };

      if (imagePreview) {
        payload.profileImage = imagePreview;
      }

      // Update through API to persist directly to database collection
      const updatedRecord = await updateAdminUser(targetId, payload);

      // Synchronize active authentication session in localStorage
      const sessionUser = {
        ...(existingUser || {}),
        ...updatedRecord,
        id: targetId,
        userId: targetId,
      };

      localStorage.setItem("vayzo_admin_user", JSON.stringify(sessionUser));

      // Dispatch event so Header and Profile pages update reactively
      window.dispatchEvent(new Event("vayzo_admin_user_updated"));

      navigate("/profile");
    } catch (err) {
      console.error("Failed to update admin profile:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Form Header */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface border border-border hover:bg-surface-hover transition-colors text-muted hover:text-foreground shadow-xs"
            title="Back to Profile"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Edit Super Admin Profile</h1>
            <p className="mt-1 text-xs text-muted">
              Update your administrator credentials, contact details, and display photo.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger-dark text-sm font-medium flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0 text-danger" />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col rounded-2xl border border-border bg-surface shadow-sm overflow-hidden"
        >
          <div className="border-b border-border p-6 sm:p-8">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <User size={18} className="text-primary" />
              Profile Details
            </h2>

            {/* Profile Avatar Upload */}
            <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-border">
              <div className="relative group shrink-0">
                <div className="h-24 w-24 overflow-hidden rounded-2xl border-2 border-border bg-background shadow-sm sm:h-28 sm:w-28 relative">
                  <Avatar
                    src={imagePreview}
                    alt={form.name}
                    identifier={canonicalId || form.email || "admin"}
                    className="h-full w-full object-cover"
                  />
                  <label
                    htmlFor="profile-avatar-input"
                    className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-[2px]"
                  >
                    <Camera size={24} className="mb-1" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">
                      Change
                    </span>
                  </label>
                  <input
                    id="profile-avatar-input"
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground text-sm">Profile Photo</h3>
                <p className="text-xs text-muted mt-1 max-w-sm leading-relaxed">
                  Upload a clear profile picture. This photo will be visible across the admin console,
                  activity logs, and navigation header.
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs font-medium h-9"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={14} className="mr-1.5" /> Upload Photo
                  </Button>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="text-xs text-muted hover:text-danger transition-colors font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Form Inputs Grid */}
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Full Name <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <User
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <Input
                    className="pl-10 h-10 text-xs"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                    disabled={fetching}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Email Address <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <Input
                    type="email"
                    className="pl-10 h-10 text-xs"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    required
                    disabled={fetching}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Contact Number
                </label>
                <div className="relative">
                  <Phone
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <Input
                    type="tel"
                    className="pl-10 h-10 text-xs"
                    placeholder="e.g. +91 9876543210"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    disabled={fetching}
                  />
                </div>
              </div>

              {/* Department */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Department
                </label>
                <div className="relative">
                  <Building2
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none z-10"
                  />
                  <Select
                    value={form.department}
                    onChange={(e) => update("department", e.target.value)}
                    className="pl-10 h-10 text-xs"
                    disabled={fetching}
                  >
                    {departmentOptions.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Protected Role */}
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-foreground">
                  System Role (Protected)
                </label>
                <div className="relative">
                  <Shield
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-danger"
                  />
                  <Input
                    className="pl-10 h-10 text-xs bg-danger/5 border-danger/20 text-danger font-semibold cursor-not-allowed"
                    value={`${form.role} — Full System Authority`}
                    disabled
                  />
                </div>
                <span className="text-[11px] text-muted ml-1">
                  Super Admin role and permissions are immutable during personal profile edits.
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 p-6 sm:p-8 bg-surface-50">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              className="px-6 h-10 text-xs font-medium"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-8 h-10 text-xs font-semibold bg-primary hover:bg-primary-hover text-white shadow-sm"
              disabled={loading || fetching}
            >
              {loading ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
