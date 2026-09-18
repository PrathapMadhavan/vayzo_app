import { useState, useEffect } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CloudUpload,
  Eye,
  EyeOff,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import StatusSelect from "../components/ui/StatusSelect";
import { createCustomer, getCustomerById, updateCustomer, getCustomers } from "../api/usersApi";
import { fileToBase64 } from "../utils/fileUtils";

const statusOptions = ["Active", "Inactive", "Blocked"];

function RequiredLabel({ text }) {
  return (
    <span className="flex items-center gap-1">
      {text}
      <span className="text-danger text-sm">*</span>
    </span>
  );
}

function AddCustomers() {
  const navigate = useNavigate();
  const { publicId: customerId } = useParams();
  const isEditing = !!customerId;
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    status: statusOptions[0],
  });
  
  const [customerDbId, setCustomerDbId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      loadCustomerData();
    }
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      setLoading(true);
      const data = await getCustomerById(customerId);
      setCustomerDbId(data.id);
      const toTitleCase = (str) => {
        if (!str) return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };

      let fName = "";
      let lName = "";
      if (data.name) {
        const parts = data.name.trim().split(" ");
        fName = parts[0] || "";
        lName = parts.slice(1).join(" ") || "";
      }

      setForm({
        firstName: fName,
        lastName: lName,
        email: data.email || "",
        mobile: data.mobileNumber || "",
        status: data.status ? toTitleCase(data.status) : statusOptions[0],
      });
      setEmailVerified(data.isVerified || false);
      setImagePreview(data.profileImage || data.image || null);
    } catch (err) {
      setError("Unable to load customer details.");
    } finally {
      setLoading(false);
    }
  };
  const update = (key) => (event) =>
    setForm({ ...form, [key]: event.target.value });
  const field = (id, labelText, key, type = "text", placeholder = "") => (
    <Input
      id={id}
      label={<RequiredLabel text={labelText} />}
      type={type}
      value={form[key]}
      onChange={update(key)}
      placeholder={placeholder}
      error={formErrors[key]}
    />
  );

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setImagePreview(base64);
      } catch (err) {
        console.error("Failed to read file", err);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = {};
    if (!form.firstName.trim()) errors.firstName = "First name is required.";
    if (!form.lastName.trim()) errors.lastName = "Last name is required.";
    
    if (!form.email.trim()) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!form.mobile.trim()) {
      errors.mobile = "Mobile number is required.";
    } else if (form.mobile.length !== 10 || !/^\d{10}$/.test(form.mobile)) {
      errors.mobile = "Enter a valid 10-digit Indian mobile number.";
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      setLoading(true);
      setError("");

      const allCustomers = await getCustomers();
      const duplicateEmail = allCustomers.find(
        (u) => u.email?.toLowerCase() === form.email.trim().toLowerCase() && u.public_id !== customerId
      );
      
      if (duplicateEmail) {
        setFormErrors(prev => ({ ...prev, email: "This email is already registered." }));
        setLoading(false);
        return;
      }

      const duplicateMobile = allCustomers.find(
        (u) => u.mobileNumber === form.mobile.trim() && u.public_id !== customerId
      );
      
      if (duplicateMobile) {
        setFormErrors(prev => ({ ...prev, mobile: "This mobile number is already registered." }));
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", `${form.firstName.trim()} ${form.lastName.trim()}`.trim());
      formData.append("email", form.email);
      formData.append("mobileNumber", form.mobile);
      formData.append("status", form.status);
      formData.append("isVerified", emailVerified);
      
      const fileInput = document.getElementById("profile-image");
      if (fileInput && fileInput.files[0]) {
        formData.append("profileImage", fileInput.files[0]);
      } else if (isEditing && imagePreview && !imagePreview.startsWith("data:")) {
        // Just keeping existing preview doesn't strictly need appending if backend preserves it, 
        // but we'll leave it out of FormData so backend doesn't overwrite it with empty file
      }

      if (isEditing) {
        await updateCustomer(customerDbId, formData);
      } else {
        await createCustomer(formData);
      }

      navigate("/customers");
    } catch (err) {
      setError("Unable to save customer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(300px,0.8fr)] items-stretch">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col rounded-xl border border-border bg-surface shadow-sm h-full"
          >
            <div className="border-b border-border p-4 sm:p-8">
              <h2 className="text-lg font-semibold text-foreground">
                Customer Information
              </h2>

              <div className="mt-6 sm:mt-8 grid gap-6 sm:gap-8 md:grid-cols-2">
                <div className="space-y-5 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {field(
                      "first-name",
                      "First Name",
                      "firstName",
                      "text",
                      "First name",
                    )}
                    {field(
                      "last-name",
                      "Last Name",
                      "lastName",
                      "text",
                      "Last name",
                    )}
                  </div>
                  {field(
                    "email",
                    "Email Address",
                    "email",
                    "email",
                    "Enter email address",
                  )}
                  
                  <div className="w-full">
                    <label className="mb-1.5 block text-sm font-medium text-foreground"><RequiredLabel text="Mobile Number" /></label>
                    <div className={`flex w-full rounded-lg border bg-surface ${formErrors.mobile ? "border-danger focus-within:border-danger" : "border-border focus-within:border-primary"} transition-colors overflow-hidden`}>
                      <div className="flex items-center justify-center bg-muted/10 px-3 border-r border-border text-sm text-foreground font-medium select-none">
                        +91
                      </div>
                      <input
                        type="tel"
                        value={form.mobile}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.length > 10 && val.startsWith("91")) val = val.slice(2);
                          if (val.length > 10) val = val.slice(0, 10);
                          setForm({ ...form, mobile: val });
                        }}
                        placeholder="9876543210"
                        className="flex-1 min-w-0 px-3.5 py-2.5 text-sm text-foreground outline-none bg-transparent placeholder:text-subtle"
                      />
                    </div>
                    {formErrors.mobile && <p className="mt-1.5 text-xs text-danger">{formErrors.mobile}</p>}
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="mb-1.5 block text-sm font-medium text-foreground">
                    Profile Image
                  </span>
                  <label
                    htmlFor="profile-image"
                    className="cursor-pointer flex h-full min-h-[160px] max-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background hover:bg-surface-hover hover:border-primary/40 transition-all text-center p-2 group overflow-hidden relative"
                  >
                    <input
                      type="file"
                      id="profile-image"
                      className="hidden"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageChange}
                    />
                    {imagePreview ? (
                      <div className="absolute inset-2 group/img rounded-lg overflow-hidden flex items-center justify-center bg-black/5">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
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
                          JPG, PNG or WEBP (Max 2MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="mt-6 grid gap-8 md:grid-cols-2">

                <StatusSelect
                  id="customer-status"
                  label={<RequiredLabel text="Status" />}
                  value={form.status}
                  options={statusOptions}
                  onChange={update("status")}
                  required
                />

                <div className="flex flex-col pt-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="block text-sm font-medium text-foreground">
                      Email Verified
                    </span>
                    <button
                      type="button"
                      onClick={() => setEmailVerified(!emailVerified)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${emailVerified ? "bg-primary" : "bg-border"}`}
                      role="switch"
                      aria-checked={emailVerified}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailVerified ? "translate-x-2" : "-translate-x-2"}`}
                      />
                    </button>
                  </div>
                  <span className="text-xs text-muted mt-0.5">
                    If enabled, the customer will be marked as email verified.
                  </span>
                </div>
              </div>
            </div>


            <div className="mt-auto flex justify-end gap-3 sm:gap-4 border-t border-border p-4 sm:p-6 bg-surface-hover/30 rounded-b-xl">
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto h-11 px-8 font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto h-11 px-8 font-medium"
              >
                {loading ? "Saving..." : isEditing ? "Update Customer" : "Create Customer"}
              </Button>
            </div>
          </form>

          <aside className="hidden xl:flex flex-col gap-6 h-full">

            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm flex-1">
              <h2 className="text-base font-semibold text-foreground border-b border-border pb-4 mb-4">
                Status Guide
              </h2>
              <div className="space-y-3">
                {[
                  {
                    title: "Active",
                    text: "Customer can login and access the system.",
                    color: "text-success",
                    bg: "bg-success",
                    varName: "success",
                  },
                  {
                    title: "Inactive",
                    text: "Customer cannot login and access the system.",
                    color: "text-warning",
                    bg: "bg-warning",
                    varName: "warning",
                  },
                  {
                    title: "Blocked",
                    text: "Customer is blocked and cannot access the system.",
                    color: "text-danger",
                    bg: "bg-danger",
                    varName: "danger",
                  },
                ].map(({ title, text, color, bg, varName }) => (
                  <div
                    key={title}
                    className="rounded-lg bg-background p-4 border-l-[3px] shadow-sm"
                    style={{
                      borderLeftColor: `var(--color-${varName})`,
                      borderTop: "1px solid var(--color-border)",
                      borderRight: "1px solid var(--color-border)",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <span className={`h-2.5 w-2.5 rounded-full ${bg}`}></span>
                      <span className={color}>{title}</span>
                    </p>
                    <p className="mt-1.5 text-xs text-muted leading-relaxed">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default AddCustomers;
