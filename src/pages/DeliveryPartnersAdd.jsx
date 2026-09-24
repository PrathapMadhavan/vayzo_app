import { useState, useEffect } from "react";
import {
  AlertCircle,
  CloudUpload,
  Eye,
  EyeOff,
  FileText,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import StatusSelect from "../components/ui/StatusSelect";
import { createDeliveryPartner, getDeliveryPartnerById, updateDeliveryPartner } from "../api/deliveryPartnersApi";
import { validateImage } from "../utils/fileUtils";

const vehicleOptions = [
  "Select vehicle type",
  "Bike",
  "Scooter",
  "Car",
  "Auto",
];

const statusOptions = ["Active"];
const onlineStatusOptions = ["Online"];

function RequiredLabel({ text }) {
  return (
    <span className="flex items-center gap-1">
      {text}
      <span className="text-danger text-sm">*</span>
    </span>
  );
}

function DeliveryPartnersAdd() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const isEditing = !!id;

  const [form, setForm] = useState({
    // Section 1
    firstName: "", lastName: "", email: "", mobileNumber: "", dateOfBirth: "", gender: "Male", alternateMobile: "",
    // Section 2
    emergencyContact: "", emergencyMobile: "",
    // Section 3
    address: "", city: "",
    // Section 4
    vehicleType: vehicleOptions[0], vehicleName: "", vehicleNumber: "", rcNumber: "",
    // Section 5
    insuranceProvider: "", insuranceNumber: "", insuranceValidTill: "",
    // Section 6
    bankName: "", accountHolderName: "", accountNumber: "", ifscCode: "",
    // Section 7
    status: statusOptions[0], onlineStatus: onlineStatusOptions[0],
    // Section 8 (Text Fields)
    aadhaarNumber: "", panNumber: ""
  });
  
  const [documentPreviews, setDocumentPreviews] = useState({
    aadhaar: null,
    pan: null,
    rc: null,
    insurance: null
  });
  
  const [documents, setDocuments] = useState({});
  const [profileImageFile, setProfileImageFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (isEditing) {
      loadPartnerData();
    }
  }, [id]);

  const loadPartnerData = async () => {
    try {
      setLoading(true);
      const data = await getDeliveryPartnerById(id);
      
      const fullName = data.name || "";
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(' ');

      setForm({
        firstName,
        lastName,
        email: data.email || "",
        mobileNumber: data.mobileNumber || "",
        dateOfBirth: data.dateOfBirth || "",
        gender: data.gender || "Male",
        alternateMobile: data.alternateMobile || "",
        emergencyContact: data.emergencyContact || "",
        emergencyMobile: data.emergencyMobile || "",
        address: data.address || "",
        city: data.city || "",
        vehicleType: data.vehicleType || vehicleOptions[0],
        vehicleName: data.vehicleName || "",
        vehicleNumber: data.vehicleNumber || "",
        rcNumber: data.rcNumber || "",
        insuranceProvider: data.insuranceProvider || "",
        insuranceNumber: data.insuranceNumber || "",
        insuranceValidTill: data.insuranceValidTill || "",
        bankName: data.bankName || "",
        accountHolderName: data.accountHolderName || "",
        accountNumber: data.accountNumber || "",
        ifscCode: data.ifscCode || "",
        status: data.status || statusOptions[0],
        onlineStatus: data.onlineStatus || onlineStatusOptions[0],
        aadhaarNumber: data.aadhaarNumber || "",
        panNumber: data.panNumber || "",
      });
      setImagePreview(data.profileImage || null);
      
      setDocumentPreviews({
        aadhaar: data.aadhaarDocumentUrl || null,
        pan: data.panDocumentUrl || null,
        rc: data.rcDocumentUrl || null,
        insurance: data.insuranceDocumentUrl || null,
      });
    } catch (err) {
      setError("Unable to load partner details.");
    } finally {
      setLoading(false);
    }
  };

  const update = (key) => (event) =>
    setForm({ ...form, [key]: event.target.value });

  const field = (id, labelText, key, type = "text", placeholder = "", required = true) => (
    <Input
      id={id}
      label={required ? <RequiredLabel text={labelText} /> : labelText}
      type={type}
      value={form[key]}
      onChange={update(key)}
      placeholder={placeholder}
      required={required}
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
        setProfileImageFile(file);
      } catch (err) {
        console.error("Failed to read file", err);
        setError(err.message);
      }
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (form.mobileNumber && form.mobileNumber.length !== 10) {
        setError("Mobile number must be exactly 10 digits.");
        return;
      }
      if (form.alternateMobile && form.alternateMobile.length !== 10) {
        setError("Alternate mobile number must be exactly 10 digits.");
        return;
      }
      if (form.emergencyMobile && form.emergencyMobile.length !== 10) {
        setError("Emergency mobile number must be exactly 10 digits.");
        return;
      }

      setLoading(true);
      setError("");
      
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'firstName' || key === 'lastName') return;
        formData.append(key, form[key]);
      });
      formData.append("name", `${form.firstName} ${form.lastName}`.trim());

      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }

      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          formData.append(key + 'File', documents[key]);
        }
      });

      if (isEditing) {
         // Pass the formData directly
         await updateDeliveryPartner(id, formData);
      } else {
         await createDeliveryPartner(formData);
      }

      navigate("/delivery");
    } catch (err) {
      console.error(err);
      setError("Unable to save delivery partner.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(300px,0.8fr)] items-start">
        {error && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm font-medium text-danger">
            {error}
          </div>
        )}
        
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
        >
          <div className="rounded-xl border border-border bg-surface shadow-sm p-4 sm:p-8">
            <div className="mb-6 flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-foreground">
                Basic Information
              </h2>
              <p className="text-sm text-muted">Primary identity and account status details.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
              <div className="space-y-8">
                <div className="grid gap-8 md:grid-cols-2">
                  <Input
                    id="first-name"
                    label={<RequiredLabel text="First Name" />}
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value.trimStart() })}
                    placeholder="First name"
                    required
                  />
                  <Input
                    id="last-name"
                    label="Last Name"
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value.trimStart() })}
                    placeholder="Last name (optional)"
                  />
                </div>
                
                <div className="grid gap-8 md:grid-cols-2">
                  <Input
                    id="mobile"
                    label={<RequiredLabel text="Mobile Number" />}
                    type="tel"
                    prefix={<span className="pl-3.5 pr-2 text-muted border-r border-border/50 text-sm bg-surface">+91</span>}
                    value={form.mobileNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setForm({ ...form, mobileNumber: val });
                    }}
                    placeholder="10-digit number"
                    required
                    pattern="[0-9]{10}"
                    title="Please enter exactly 10 digits"
                  />
                  <Input
                    id="alternateMobile"
                    label="Alternate Mobile"
                    type="tel"
                    prefix={<span className="pl-3.5 pr-2 text-muted border-r border-border/50 text-sm bg-surface">+91</span>}
                    value={form.alternateMobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setForm({ ...form, alternateMobile: val });
                    }}
                    placeholder="10-digit number (Optional)"
                    pattern="[0-9]{10}"
                    title="Please enter exactly 10 digits"
                  />
                </div>
                
                <div className="grid gap-8 md:grid-cols-2">
                  <Input
                    id="email"
                    label={<RequiredLabel text="Email Address" />}
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value.trim() })}
                    placeholder="Enter email address"
                    required
                  />
                  {field("dateOfBirth", "Date of Birth", "dateOfBirth", "date", "e.g. 15 Aug 1995")}
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <StatusSelect
                    id="gender"
                    label={<RequiredLabel text="Gender" />}
                    value={form.gender}
                    options={["Male", "Female", "Other"]}
                    onChange={update("gender")}
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <span className="mb-1.5 block text-sm font-medium text-foreground">
                  Profile Photo
                </span>
                <label
                  htmlFor="profile-image"
                  className="cursor-pointer flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-hover/30 hover:bg-surface-hover hover:border-primary/50 transition-all text-center p-2 group h-48 lg:h-full relative overflow-hidden"
                >
                  <input
                    type="file"
                    id="profile-image"
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleImageChange}
                  />
                  {imagePreview ? (
                    <div className="w-full h-full relative group/img rounded-lg overflow-hidden flex items-center justify-center bg-black/5">
                      <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <CloudUpload size={24} className="text-white mb-2" />
                        <p className="text-xs font-medium text-white">Change Photo</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <CloudUpload size={24} className="text-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        Upload Photo
                      </p>
                      <p className="mt-1 text-xs text-muted">JPG, PNG or WEBP (Max 2MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl border border-border bg-surface shadow-sm p-4 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground">
              Emergency Contact
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              {field("emergencyContact", "Contact Name", "emergencyContact", "text", "e.g. Selvam R")}
              <Input
                id="emergencyMobile"
                label={<RequiredLabel text="Emergency Mobile" />}
                type="tel"
                prefix={<span className="pl-3.5 pr-2 text-muted border-r border-border/50 text-sm bg-surface">+91</span>}
                value={form.emergencyMobile}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setForm({ ...form, emergencyMobile: val });
                }}
                placeholder="10-digit number"
                required
                pattern="[0-9]{10}"
                title="Please enter exactly 10 digits"
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface shadow-sm p-4 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground">
              Address
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div className="md:col-span-2">
                {field("address", "Address", "address", "text", "Flat, House no., Building, Area, Street")}
              </div>
              {field("city", "City", "city", "text", "e.g. Chennai")}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface shadow-sm p-4 sm:p-8">
             <h2 className="text-lg font-semibold text-foreground">
              Vehicle Information
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <StatusSelect
                id="vehicle-type"
                label={<RequiredLabel text="Vehicle Type" />}
                value={form.vehicleType}
                options={vehicleOptions}
                onChange={update("vehicleType")}
                required
              />
              {field("vehicle-name", "Vehicle Name", "vehicleName", "text", "e.g. Honda Activa")}
              {field("vehicle-number", "Vehicle Number", "vehicleNumber", "text", "e.g. TN 01 AB 1234")}
              {field("rcNumber", "RC Number", "rcNumber", "text", "Enter RC number")}
            </div>
          </div>
          
          <div className="rounded-xl border border-border bg-surface shadow-sm p-4 sm:p-8">
             <h2 className="text-lg font-semibold text-foreground">
              Insurance
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              {field("insuranceProvider", "Insurance Provider", "insuranceProvider", "text", "Enter insurance provider")}
              {field("insuranceNumber", "Insurance Number", "insuranceNumber", "text", "Enter insurance number")}
              {field("insuranceValidTill", "Insurance Valid Till", "insuranceValidTill", "date", "")}
            </div>
          </div>
          
          <div className="rounded-xl border border-border bg-surface shadow-sm p-4 sm:p-8">
             <h2 className="text-lg font-semibold text-foreground">
              Bank Information
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <StatusSelect
                id="bankName"
                label={<RequiredLabel text="Bank Name" />}
                value={form.bankName}
                options={["Select Bank", "State Bank of India", "Canara Bank", "ICICI Bank", "HDFC Bank", "Axis Bank", "Kotak Mahindra Bank", "Indian Bank", "Other"]}
                onChange={update("bankName")}
                required
              />
              {field("accountHolderName", "Account Holder Name", "accountHolderName", "text", "Enter account holder name")}
              <Input
                id="accountNumber"
                label={<RequiredLabel text="Account Number" />}
                type="text"
                value={form.accountNumber}
                onChange={update("accountNumber")}
                placeholder="Enter account number"
                required
              />
              {field("ifscCode", "IFSC Code", "ifscCode", "text", "Enter IFSC code")}
            </div>
          </div>
          
          <div className="rounded-xl border border-border bg-surface shadow-sm p-4 sm:p-8">
             <h2 className="text-lg font-semibold text-foreground">
              Account Information
            </h2>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <StatusSelect
                id="status"
                label={<RequiredLabel text="Status" />}
                value={form.status}
                options={statusOptions}
                onChange={update("status")}
                required
              />
              <StatusSelect
                id="online-status"
                label={<RequiredLabel text="Online Status" />}
                value={form.onlineStatus}
                options={onlineStatusOptions}
                onChange={update("onlineStatus")}
                required
              />
            </div>
          </div>
          
          <div className="rounded-xl border border-border bg-surface shadow-sm p-4 sm:p-8">
             <div className="mb-6 flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-foreground">
                Documents
              </h2>
              <p className="text-sm text-muted">Upload partner documents (PDF only, max 2MB).</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                { key: 'aadhaar', label: 'Aadhaar Card', inputKey: 'aadhaarNumber', inputLabel: 'Aadhaar Number', fileKey: 'aadhaarFile' },
                { key: 'pan', label: 'PAN Card', inputKey: 'panNumber', inputLabel: 'PAN Number', fileKey: 'panFile' },
                { key: 'rc', label: 'Vehicle RC Book', inputKey: 'rcNumber', inputLabel: 'RC Number (Filled above)', disabled: true, fileKey: 'rcFile' },
                { key: 'insurance', label: 'Insurance Document', inputKey: 'insuranceNumber', inputLabel: 'Insurance No (Filled above)', disabled: true, fileKey: 'insuranceFile' }
              ].map((doc) => (
                <div key={doc.key} className="flex flex-col gap-3 rounded-xl border border-border p-4 bg-background/50">
                  <span className="text-sm font-medium text-foreground">{doc.label}</span>
                  <div 
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface text-center p-2 h-32 relative overflow-hidden cursor-pointer hover:bg-muted/10 transition-colors"
                    onClick={() => document.getElementById(doc.fileKey).click()}
                  >
                    <input 
                      id={doc.fileKey} 
                      type="file" 
                      accept=".pdf,application/pdf" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.type !== 'application/pdf') return alert('Only PDF files are allowed');
                          if (file.size > 2 * 1024 * 1024) return alert('File size must be less than 2 MB');
                          setDocuments(prev => ({...prev, [doc.key]: file}));
                          setDocumentPreviews(prev => ({...prev, [doc.key]: URL.createObjectURL(file)}));
                        }
                      }} 
                    />
                    {documentPreviews[doc.key] ? (
                      <div className="w-full h-full relative rounded flex flex-col items-center justify-center bg-primary/10 text-primary">
                        <FileText size={32} className="mb-2" />
                        <span className="text-xs font-semibold px-2 text-center truncate w-full">
                          {documents[doc.key] ? documents[doc.key].name : (
                            <a href={documentPreviews[doc.key]} target="_blank" rel="noreferrer" className="text-primary hover:underline hover:text-primary/80" onClick={(e) => e.stopPropagation()}>
                              View PDF
                            </a>
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <CloudUpload size={20} className="text-muted mb-2" />
                        <span className="text-xs font-medium text-primary">Click to Upload PDF</span>
                        <span className="text-[10px] text-muted mt-1">Maximum 2 MB</span>
                      </div>
                    )}
                  </div>
                  {!doc.disabled && (
                    <Input id={doc.inputKey} type="text" value={form[doc.inputKey]} onChange={update(doc.inputKey)} placeholder={doc.inputLabel} required className="h-9 text-xs" />
                  )}
                  {doc.disabled && (
                    <div className="h-9 px-3 rounded-md bg-surface border border-border flex items-center text-xs text-muted/70 cursor-not-allowed">
                      {form[doc.inputKey] || doc.inputLabel}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 sm:gap-4 p-0">
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
              {loading ? "Saving..." : isEditing ? "Update Partner" : "Create Partner"}
            </Button>
          </div>
        </form>

        <aside className="hidden xl:flex flex-col gap-6">
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground border-b border-border pb-4 mb-4">
              Partner Guidelines
            </h2>
            <div className="space-y-4 text-sm text-muted">
              <p>
                <strong>Vehicle Requirements:</strong> Make sure the registered vehicle has valid insurance and RC up to date.
              </p>
              <p>
                <strong>Bank Details:</strong> Double-check the IFSC code and account number to ensure smooth payouts.
              </p>
              <p>
                <strong>Status Control:</strong> You can temporarily block a partner if they violate service terms.
              </p>
            </div>
          </div>
          
          <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-base font-semibold text-foreground border-b border-border pb-4 mb-4">
              Status Guide
            </h2>
            <div className="space-y-3">
              {[
                { title: "Active", text: "Partner can accept and deliver orders.", color: "text-success", bg: "bg-success", varName: "success" },
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

export default DeliveryPartnersAdd;
