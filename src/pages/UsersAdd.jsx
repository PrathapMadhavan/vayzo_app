import { useState, useEffect } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CloudUpload,
  Eye,
  EyeOff,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import StatusSelect from "../components/ui/StatusSelect";
import { createUser, getUserById, updateUser } from "../api/usersApi";
import { validateImage } from "../utils/fileUtils";



function RequiredLabel({ text }) {
  return (
    <span className="flex items-center gap-1">
      {text}
      <span className="text-danger text-sm">*</span>
    </span>
  );
}

function AddUsers() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const isEditing = !!userId;
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirm: "",
  });
  
  const [userDbId, setUserDbId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditing) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const data = await getUserById(userId);
      setUserDbId(data.id);
      const toTitleCase = (str) => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };

      setForm({
        name: data.name || "",
        email: data.email || "",
        mobile: data.mobileNumber || "",
        password: "",
        confirm: "",
      });

      setImagePreview(data.profileImage || data.image || null);
    } catch (err) {
      setError("Unable to load user details.");
    } finally {
      setLoading(false);
    }
  };
  const update = (key) => (event) =>
    setForm({ ...form, [key]: event.target.value });
  const field = (id, labelText, key, type = "text", placeholder = "", readOnly = false) => (
    <Input
      id={id}
      label={readOnly ? labelText : <RequiredLabel text={labelText} />}
      type={type}
      value={form[key]}
      onChange={update(key)}
      placeholder={placeholder}
      required={!readOnly}
      readOnly={readOnly}
      disabled={readOnly}
    />
  );

  const handleImageChange = async (e) => {
    setError("");
    const file = e.target.files[0];
    if (file) {
      try {
        await validateImage(file);
        const objectUrl = URL.createObjectURL(file);
        setImagePreview(objectUrl);
      } catch (err) {
        console.error("Failed to read file", err);
        setError(err.message);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.password && form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (isEditing) {
        const existing = await getUserById(userId);
        let validImage = existing.profileImage || existing.image;
        if (imagePreview && !imagePreview.startsWith("blob:")) {
          validImage = imagePreview;
        } else if (imagePreview && imagePreview.startsWith("blob:")) {
          console.warn("MISSING REQUIREMENT: Real image upload infrastructure is unavailable. Blob URL not saved.");
        }

        const updatePayload = {
          name: form.name,
          email: form.email,
        };
        if (validImage) {
          updatePayload.profileImage = validImage;
        }

        await updateUser(userDbId, updatePayload);
      } else {
        await createUser({
          name: form.name,
          email: form.email,
          mobileNumber: form.mobile,
          password: form.password,
        });
      }

      navigate("/users");
    } catch (err) {
      setError("Unable to save user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="items-stretch">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col rounded-xl border border-border bg-surface shadow-sm h-full"
          >
            <div className="border-b border-border p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-foreground">
                User Information
              </h2>

              <div className="mt-8 grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  {field(
                    "full-name",
                    "Full Name",
                    "name",
                    "text",
                    "Enter full name",
                  )}
                  {field(
                    "email",
                    "Email Address",
                    "email",
                    "email",
                    "Enter email address",
                  )}
                  {field(
                    "mobile",
                    "Mobile Number",
                    "mobile",
                    "tel",
                    "Enter mobile number",
                    isEditing
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">
                    Profile Image
                  </span>
                  <label
                    htmlFor="profile-image"
                    className="cursor-pointer flex flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background hover:bg-surface-hover hover:border-primary/40 transition-all text-center p-2 group overflow-hidden relative"
                  >
                    <input
                      type="file"
                      id="profile-image"
                      className="hidden"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageChange}
                    />
                    {imagePreview ? (
                      <div className="w-full h-full min-h-[140px] relative group/img rounded-lg overflow-hidden flex items-center justify-center bg-black/5">
                        <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                          <CloudUpload size={24} className="text-white mb-2" />
                          <p className="text-xs text-white">Change Image</p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 flex flex-col items-center">
                        <CloudUpload
                          size={32}
                          className="text-primary mb-4 transition-transform group-hover:scale-110"
                        />
                        <p className="text-sm font-medium text-foreground">
                          Click to upload
                        </p>
                        <p className="mt-1 text-xs text-muted">or drag and drop</p>
                        <p className="mt-2 text-[10px] text-muted">
                          JPG, PNG or WEBP (Max 2MP)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>


            </div>

            {!isEditing && (
              <div className="p-6 sm:p-8">
                <h2 className="text-lg font-semibold text-foreground">
                  Password
                </h2>
                <div className="mt-8 grid gap-8 md:grid-cols-2">
                  <div className="relative">
                    {field(
                      "password",
                      "Password",
                      "password",
                      showPassword ? "text" : "password",
                      "Enter password",
                    )}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 bottom-2.5 text-muted hover:text-foreground transition-colors"
                      aria-label="Toggle password"
                    >
                      {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                  <div className="relative">
                    {field(
                      "confirm-password",
                      "Confirm Password",
                      "confirm",
                      showConfirm ? "text" : "password",
                      "Confirm password",
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 bottom-2.5 text-muted hover:text-foreground transition-colors"
                      aria-label="Toggle confirm password"
                    >
                      {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-auto flex justify-end gap-4 border-t border-border p-6 bg-surface-hover/30 rounded-b-xl">
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate("/users")}
                className="w-full sm:w-auto h-11 px-8 font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto h-11 px-8 font-medium"
              >
                {loading ? "Saving..." : isEditing ? "Update User" : "Create User"}
              </Button>
            </div>
          </form>


        </div>
      </div>
    </section>
  );
}

export default AddUsers;
