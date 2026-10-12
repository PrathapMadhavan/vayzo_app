import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  Pencil,
  Phone,
  Building2,
  Calendar,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Avatar from "../components/ui/Avatar";
import { getAdminUserById } from "../api/adminUsersApi";
import { ROLES } from "../constants/permissions";

const DetailCard = ({ title, icon: Icon, children }) => (
  <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-sm h-full flex flex-col">
    <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground pb-3 border-b border-border">
      <Icon size={16} className="text-primary" />
      {title}
    </h3>
    <div className="flex-1">{children}</div>
  </div>
);

const getValue = (value) => value || "—";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem("vayzo_admin_user");
    return userStr ? JSON.parse(userStr) : null;
  });

  const [loading, setLoading] = useState(!user);

  const fetchLatestProfile = useCallback(async () => {
    try {
      const storedStr = localStorage.getItem("vayzo_admin_user");
      const stored = storedStr ? JSON.parse(storedStr) : {};
      const targetId = stored.id || stored.userId || "ADM001";

      const apiUser = await getAdminUserById(targetId);
      if (apiUser) {
        setUser(apiUser);
        localStorage.setItem("vayzo_admin_user", JSON.stringify(apiUser));
      }
    } catch (err) {
      console.error("Failed to fetch fresh admin profile:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatestProfile();

    const handleProfileUpdate = () => {
      fetchLatestProfile();
    };

    window.addEventListener("vayzo_admin_user_updated", handleProfileUpdate);
    window.addEventListener("storage", handleProfileUpdate);

    return () => {
      window.removeEventListener("vayzo_admin_user_updated", handleProfileUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, [fetchLatestProfile]);

  if (!user && loading) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 text-muted">
        Loading administrator profile...
      </div>
    );
  }

  const currentUser = user || {
    name: "System Admin",
    email: "admin@vayzo.com",
    role: ROLES.SUPER_ADMIN,
    department: "Management",
    phone: "+91 9876543210",
    status: "Active",
  };

  const isSuper = currentUser.role === ROLES.SUPER_ADMIN;

  const personalInformation = [
    ["Full Name", currentUser.name, User],
    ["Email Address", currentUser.email, Mail],
    ["Contact Number", currentUser.phone || currentUser.mobileNumber, Phone],
    ["Department", currentUser.department || "Management", Building2],
    ["Role Designation", currentUser.role, Shield],
    ["Account Status", currentUser.status || "Active", CheckCircle],
    ["Member Since", currentUser.joinedDate || "August 2026", Calendar],
  ];

  return (
    <section className="min-h-full bg-background p-4 sm:p-6 pb-20 flex flex-col gap-6">
      {/* Top Banner / Hero Profile Card */}
      <div className="relative rounded-2xl border border-border bg-surface p-6 shadow-sm overflow-hidden">
        {/* Cover Background Gradient */}
        <div className="absolute inset-0 h-32 w-full bg-linear-to-r from-primary/15 via-primary/5 to-transparent"></div>

        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end">
          {/* Avatar */}
          <div className="mt-8 h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-surface bg-background shadow-md sm:mt-12 sm:h-28 sm:w-28 relative">
            <Avatar
              src={currentUser.profileImage || currentUser.image}
              alt={currentUser.name}
              identifier={currentUser.id || currentUser.userId || currentUser.email}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-1 flex-col justify-end gap-2 pb-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground sm:text-2xl flex items-center gap-2">
                  {currentUser.name}
                  {isSuper && (
                    <ShieldCheck size={18} className="text-danger" title="Super Administrator" />
                  )}
                </h1>
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={isSuper ? "danger" : "primary"}
                    className="px-2.5 py-0.5 text-xs font-semibold rounded-md"
                  >
                    {currentUser.role}
                  </Badge>
                  <span className="text-xs text-muted">
                    {currentUser.department || "Management"} Department
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => navigate("/profile/edit")}
                  className="bg-primary hover:bg-primary-hover text-white shadow-sm text-xs font-semibold h-9 px-4"
                >
                  <Pencil size={14} className="mr-1.5" /> Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Personal Details */}
        <DetailCard title="Account Information" icon={User}>
          <div className="divide-y divide-border/60">
            {personalInformation.map(([label, value, FieldIcon]) => (
              <div key={label} className="py-3 flex items-center justify-between text-xs gap-4 first:pt-0 last:pb-0">
                <span className="text-muted flex items-center gap-2 font-medium">
                  {FieldIcon && <FieldIcon size={14} className="text-muted/70" />}
                  {label}
                </span>
                <span className="font-semibold text-foreground text-right truncate max-w-[60%]">
                  {getValue(value)}
                </span>
              </div>
            ))}
          </div>
        </DetailCard>

        {/* Security & Access Rights */}
        <DetailCard title="System Privileges & Security" icon={Shield}>
          <div className="flex flex-col gap-4 h-full justify-between">
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-primary/4 border border-primary/20">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-primary" />
                  Privilege Level: {currentUser.role}
                </p>
                <p className="text-[11px] text-muted mt-1 leading-relaxed">
                  {isSuper
                    ? "You hold full unrestricted root administrative rights across restaurants, orders, finance, complaints, system settings, and administrator management."
                    : "You hold modular administrative privileges as assigned by the Super Administrator."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-50 border border-border text-xs text-muted flex items-center justify-between">
                <span>Direct Admin ID:</span>
                <span className="font-mono font-semibold text-foreground">
                  {currentUser.id || currentUser.userId || "ADM001"}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground">Admin User Management</h4>
                <p className="text-[11px] text-muted">Manage all administrators and permissions.</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/admin-users")}
                className="text-xs"
              >
                View Admins
              </Button>
            </div>
          </div>
        </DetailCard>
      </div>
    </section>
  );
}
