import { useState, useEffect, useRef } from "react";
import { ArrowLeft, User, Mail, Shield, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { updateAdminUser, getAdminUserById } from "../api/adminUsersApi";
import { validateImage } from "../utils/fileUtils";
import UserImg from "../assets/logo/Trans_full.png";
import Avatar from "../components/ui/Avatar";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [adminId, setAdminId] = useState(null);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Super Admin",
  });

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      const userStr = localStorage.getItem("vayzo_admin_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        setAdminId(user.id || user.userId); // fallback to userId if id is missing
        
        try {
          // If we have an ID, fetch latest from API
          if (user.id) {
            const apiUser = await getAdminUserById(user.id);
            if (isMounted) {
              setForm({
                name: apiUser.name || "",
                email: apiUser.email || "",
                role: apiUser.role || "Super Admin",
              });
              setImagePreview(apiUser.profileImage || null);
            }
          } else {
            // Fallback
            setForm({
              name: user.name || "",
              email: user.email || "",
              role: user.role || "Super Admin",
            });
            setImagePreview(user.profileImage || null);
          }
        } catch (err) {
          console.error("Failed to load admin from API", err);
        }
      }
    };
    loadProfile();
    return () => { isMounted = false; };
  }, []);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await validateImage(file);
        const objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);
        // Note: We need a real file upload mechanism to persist this.
      } catch (err) {
        console.error("Failed to validate image", err);
        alert(err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userStr = localStorage.getItem("vayzo_admin_user");
      const user = userStr ? JSON.parse(userStr) : {};
      
      const payload = {
        ...user,
        name: form.name,
        email: form.email,
      };

      if (imagePreview && imagePreview.startsWith("blob:")) {
        console.warn("MISSING REQUIREMENT: Image upload endpoint not available. Preview image will not be persisted to DB.");
      } else if (imagePreview) {
        payload.profileImage = imagePreview; // Keep existing image if it wasn't changed
      }
      
      // Update via API if we have an ID
      if (user.id) {
        await updateAdminUser(user.id, payload);
      }
      
      // Update localStorage so Header reflects it
      localStorage.setItem("vayzo_admin_user", JSON.stringify(payload));
      
      navigate("/profile");
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col rounded-xl border border-border bg-surface shadow-sm"
        >
          <div className="border-b border-border p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="mr-1 rounded-md p-1 hover:bg-background transition-colors text-muted hover:text-foreground"
              >
                <ArrowLeft size={18} />
              </button>
              Edit Profile
            </h2>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative group shrink-0">
                <div className="h-24 w-24 overflow-hidden rounded-xl border-2 border-border bg-background shadow-sm sm:h-28 sm:w-28 relative">
                  <Avatar
                    src={imagePreview}
                    alt="Profile"
                    identifier={adminId || form.email || "admin"}
                    className="h-full w-full object-cover"
                  />
                  <label
                    className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-[2px]"
                  >
                    <Camera size={24} className="mb-1" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Change</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Profile Image</h3>
                <p className="text-sm text-muted mt-1 max-w-sm">
                  Upload a high-quality professional photo. Recommended size is 256x256 pixels.
                </p>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="mt-3"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={14} className="mr-1.5" /> Upload Image
                </Button>
              </div>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Full Name <span className="text-danger">*</span>
                </label>
                <div className="relative">
                   <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                   <Input 
                     className="pl-10" 
                     placeholder="Enter your full name" 
                     value={form.name} 
                     onChange={(e) => update("name", e.target.value)} 
                     required 
                   />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Email Address <span className="text-danger">*</span>
                </label>
                <div className="relative">
                   <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                   <Input 
                     type="email"
                     className="pl-10" 
                     placeholder="Enter your email" 
                     value={form.email} 
                     onChange={(e) => update("email", e.target.value)} 
                     required 
                   />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-medium text-foreground">
                  Role
                </label>
                <div className="relative">
                   <Shield size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                   <Input 
                     className="pl-10 bg-background/50 text-muted" 
                     value={form.role} 
                     disabled
                   />
                </div>
                <span className="text-xs text-muted ml-1">Roles can only be changed by system administrators.</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3 p-6 sm:p-8 bg-background/50 rounded-b-xl">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/profile")}
              className="px-6"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="px-8" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
