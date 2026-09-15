import { useState, useEffect } from "react";
import { ArrowLeft, CloudUpload, Eye, EyeOff, ShieldCheck, UserRound } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import StatusSelect from "../components/ui/StatusSelect";
import { createAdminUser, getAdminUserById, updateAdminUser } from "../api/adminUsersApi";

const statusOptions = ["Active", "Inactive"];
const departmentOptions = ["Select Department", "Operations", "Support", "Finance", "IT", "Management"];

function RequiredLabel({ text }) {
  return (
    <span className="flex items-center gap-1">
      {text}
      <span className="text-danger text-sm">*</span>
    </span>
  );
}

function AddAdminUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    department: departmentOptions[0],
    status: statusOptions[0],
    password: "",
    confirm: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existingRole, setExistingRole] = useState("Admin");

  useEffect(() => {
    if (isEditing) {
      loadUserData();
    }
  }, [id]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const data = await getAdminUserById(id);
      
      const toTitleCase = (str) => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };

      setExistingRole(data.role || "Admin");
      
      setForm({
        name: data.name || "",
        email: data.email || "",
        mobile: data.phone || data.mobileNumber || "",
        department: data.department || departmentOptions[0],
        status: data.status ? toTitleCase(data.status) : statusOptions[0],
        password: data.password || "",
        confirm: data.password || "",
      });
    } catch (err) {
      setError("Unable to load admin user details.");
    } finally {
      setLoading(false);
    }
  };

  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  
  const field = (id, labelText, key, type = "text", placeholder = "") => (
    <Input
      id={id}
      label={<RequiredLabel text={labelText} />}
      type={type}
      value={form[key]}
      onChange={update(key)}
      placeholder={placeholder}
      required
    />
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password && form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    
    if (form.department === departmentOptions[0]) {
      setError("Please select a valid department.");
      return;
    }

    try {
      setLoading(true);
      
      if (isEditing) {
        await updateAdminUser(id, {
          name: form.name,
          email: form.email,
          phone: form.mobile,
          department: form.department,
          status: form.status,
          role: existingRole, // Keep existing role (Admin or Super Admin)
          password: form.password,
        });
      } else {
        await createAdminUser({
          name: form.name,
          email: form.email,
          phone: form.mobile,
          department: form.department,
          status: form.status,
          role: "Admin", // Strongly locked
          password: form.password,
        });
      }

      navigate("/admin-users");
    } catch (err) {
      setError(err.message || "Unable to save admin user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        
        <header className="flex items-center gap-4">
          <button onClick={() => navigate("/admin-users")} className="p-2 rounded-lg bg-surface border border-border hover:bg-surface-hover transition-colors text-muted hover:text-foreground">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {isEditing ? "Edit Admin User" : "Add Admin User"}
            </h1>
            <p className="mt-1 text-xs text-muted">
              {isEditing ? "Update existing system administrator." : "Create a new system administrator."}
            </p>
          </div>
        </header>

        {error && (
          <div className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger-dark text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(300px,0.8fr)] items-stretch">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col rounded-xl border border-border bg-surface shadow-sm h-full"
          >
            <div className="border-b border-border p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-foreground">User Information</h2>

              <div className="mt-8 grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  {field("full-name", "Full Name", "name", "text", "Enter full name")}
                  {field("email", "Email Address", "email", "email", "Enter email address")}
                  {field("mobile", "Mobile Number", "mobile", "tel", "Enter mobile number")}
                </div>

                <div className="flex flex-col">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">Profile Image</span>
                  <label htmlFor="profile-image" className="cursor-pointer flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background hover:bg-surface-hover hover:border-primary/40 transition-all text-center p-6 group">
                    <input type="file" id="profile-image" className="hidden" accept="image/png, image/jpeg, image/webp" />
                    <CloudUpload size={32} className="text-primary mb-4 transition-transform group-hover:scale-110" />
                    <p className="text-sm font-medium text-foreground">Click to upload</p>
                    <p className="mt-1 text-xs text-muted">or drag and drop</p>
                    <p className="mt-2 text-[10px] text-muted">JPG, PNG or WEBP (Max 2MB)</p>
                  </label>
                </div>
              </div>

              <div className="mt-6 grid gap-8 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Role <span className="text-danger text-sm">*</span>
                  </label>
                  <div className="h-11 w-full rounded-lg border border-border bg-background/50 px-3 flex items-center text-sm text-foreground cursor-not-allowed">
                    <ShieldCheck size={16} className={existingRole === "Super Admin" ? "text-danger mr-2" : "text-warning mr-2"} />
                    {existingRole}
                  </div>
                  <p className="mt-1.5 text-xs text-muted">Role is fixed to {existingRole}.</p>
                </div>

                <StatusSelect
                  id="user-department"
                  label={<RequiredLabel text="Department" />}
                  value={form.department}
                  options={departmentOptions}
                  onChange={update("department")}
                  required
                />

                <StatusSelect
                  id="user-status"
                  label={<RequiredLabel text="Status" />}
                  value={form.status}
                  options={statusOptions}
                  onChange={update("status")}
                  required
                />
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-foreground">Password</h2>
              <div className="mt-8 grid gap-8 md:grid-cols-2">
                <div className="relative">
                  {field("password", "Password", "password", showPassword ? "text" : "password", "Enter password")}
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 bottom-2.5 text-muted hover:text-foreground transition-colors" aria-label="Toggle password">
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                <div className="relative">
                  {field("confirm-password", "Confirm Password", "confirm", showConfirm ? "text" : "password", "Confirm password")}
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 bottom-2.5 text-muted hover:text-foreground transition-colors" aria-label="Toggle confirm password">
                    {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-auto flex justify-end gap-4 border-t border-border p-6 bg-surface-hover/30 rounded-b-xl">
              <Button variant="secondary" type="button" onClick={() => navigate("/admin-users")} className="w-full sm:w-auto h-11 px-8 font-medium">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto h-11 px-8 font-medium bg-[#4a00e0] hover:bg-[#3b00b3] text-white">
                {loading ? "Saving..." : isEditing ? "Update Admin User" : "Create Admin User"}
              </Button>
            </div>
          </form>

          <aside className="flex flex-col gap-6 h-full">
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <h2 className="text-base font-semibold text-foreground border-b border-border pb-4 mb-4">
                Admin Constraints
              </h2>
              <div className="space-y-4">
                <div className="rounded-lg bg-danger/10 p-4 border border-danger/20 text-danger-dark">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <ShieldCheck size={16} /> Maximum 2 Admins
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed">
                    The system permits exactly ONE Super Admin and ONE Admin.
                  </p>
                </div>
                <div className="rounded-lg bg-background p-4 border border-border/50">
                  <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <UserRound size={16} className="text-primary" /> Admin Role
                  </p>
                  <p className="mt-1.5 text-xs text-muted leading-relaxed">
                    This user will have extensive system privileges, but will not be able to delete the Super Admin or alter global root settings.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default AddAdminUser;
