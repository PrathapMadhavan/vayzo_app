import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Shield, Pencil } from "lucide-react";
import Button from "../components/ui/Button";
import UserImg from "../assets/logo/Trans_full.png";
import { getAdminUserById } from "../api/adminUsersApi";
import Avatar from "../components/ui/Avatar";

const DetailCard = ({ title, icon: Icon, children }) => (
  <div className="rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-sm h-full flex flex-col">
    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground pb-3 border-b border-border">
      <Icon size={16} className="text-primary" />
      {title}
    </h3>
    <div className="flex-1">
      {children}
    </div>
  </div>
);

const getValue = (value) => value || "--";

export default function Profile() {
  const navigate = useNavigate();
  
  const [user, setUser] = useState(() => {
    const userStr = localStorage.getItem("vayzo_admin_user");
    if (!userStr) {
      // Handle missing session safely
      navigate("/");
      return null;
    }
    return JSON.parse(userStr);
  });

  if (!user) {
    return null; // Don't render until redirected
  }

  useEffect(() => {
    let isMounted = true;
    if (user.id || user.userId) {
      getAdminUserById(user.id || user.userId).then((apiUser) => {
        if (isMounted && apiUser) {
          setUser(apiUser);
          localStorage.setItem("vayzo_admin_user", JSON.stringify(apiUser));
        }
      }).catch(err => console.error("Failed to fetch admin profile", err));
    }
    return () => { isMounted = false; };
  }, [user.id, user.userId]);

  const personalInformation = [
    ["Full Name", user.name],
    ["Email Address", user.email],
    ["Role", user.role],
  ];

  return (
    <section className="min-h-full bg-background p-4 sm:p-6 pb-20 flex flex-col gap-6">
      {/* Header Profile Section */}
      <div className="relative rounded-xl border border-border bg-surface p-6 shadow-sm overflow-hidden">
        {/* Cover Background */}
        <div className="absolute inset-0 h-32 w-full bg-gradient-to-r from-primary/20 to-primary/5"></div>
        
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end">
          <div className="mt-12 h-24 w-24 shrink-0 overflow-hidden rounded-xl border-4 border-surface bg-white shadow-sm sm:mt-16 sm:h-32 sm:w-32">
            <Avatar
              src={user.profileImage}
              alt={user.name}
              identifier={user.id || user.userId || user.email}
              className="h-full w-full object-cover"
            />
          </div>
          
          <div className="flex flex-1 flex-col justify-end gap-2 pb-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">
                  {user.name}
                </h1>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-primary">
                  <Shield size={14} />
                  {user.role}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button onClick={() => navigate("/profile/edit")}>
                  <Pencil size={15} className="mr-1.5" /> Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <DetailCard title="Personal Information" icon={User}>
          <div className="space-y-4">
            {personalInformation.map(([label, value]) => (
              <div key={label} className="flex gap-4 items-center">
                <span className="w-1/3 shrink-0 text-sm text-muted">{label}</span>
                <span className="font-medium text-foreground text-sm flex-1">
                  {getValue(value)}
                </span>
              </div>
            ))}
          </div>
        </DetailCard>

        <DetailCard title="Account Security" icon={Shield}>
          <div className="flex flex-col gap-6 h-full justify-center text-center">
             <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Shield size={28} />
             </div>
             <div>
               <h4 className="font-medium text-foreground mb-1">Update Password</h4>
               <p className="text-sm text-muted mb-4">Ensure your account is using a long, random password to stay secure.</p>
               <Button variant="secondary" size="sm" onClick={() => navigate("/settings")}>Manage Security</Button>
             </div>
          </div>
        </DetailCard>
      </div>
    </section>
  );
}
