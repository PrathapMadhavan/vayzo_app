import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowLeft, MapPin } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import StatusSelect from "../components/ui/StatusSelect";
import Badge from "../components/ui/Badge";
import { createLocation, getLocationById, updateLocation } from "../api/locationsApi";

export default function LocationsAdd() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    fullName: "",
    city: "Madurai",
    zone: "North Zone",
    latitude: "",
    longitude: "",
    phone: "",
    email: "",
    type: "Restaurant",
    deliveryRadius: "",
    status: "ACTIVE",
    color: "success"
  });

  useEffect(() => {
    if (isEdit) {
      const fetchLocation = async () => {
        try {
          const data = await getLocationById(id);
          setFormData({
            name: data.name || "",
            fullName: data.fullName || data.name || "",
            city: data.city || "Madurai",
            zone: data.zone || "North Zone",
            latitude: data.latitude || "",
            longitude: data.longitude || "",
            phone: data.phone || "",
            email: data.email || "",
            type: data.type || "Restaurant",
            deliveryRadius: data.deliveryRadius || "",
            status: data.status || "ACTIVE",
            color: data.color || "success"
          });
        } catch (error) {
          console.error("Error fetching location:", error);
        }
      };
      fetchLocation();
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.fullName) {
      alert("Please fill in all mandatory fields");
      return;
    }
    
    // Auto map status to color for UI
    const colorMap = {
      ACTIVE: "success",
      INACTIVE: "warning",
      RESTRICTED: "danger"
    };
    const finalData = {
      ...formData,
      color: colorMap[formData.status] || "primary"
    };

    try {
      setLoading(true);
      if (isEdit) {
        await updateLocation(id, finalData);
        alert("Location updated successfully!");
        navigate(`/locations/${id}`);
      } else {
        await createLocation(finalData);
        alert("Location added successfully!");
        navigate("/locations");
      }
    } catch (err) {
      alert(isEdit ? "Failed to update location." : "Failed to create location.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isEdit) {
      navigate(`/locations/${id}`);
    } else {
      navigate("/locations");
    }
  };

  return (
    <section className="min-h-full bg-background p-4 sm:p-6 pb-20">
      <div className="w-full mx-auto flex flex-col gap-6">
        

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Dynamic Location Header Card */}
          <Card className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin size={24} />
                </div>
                <div>
                  <div className="flex items-start gap-3">
                    <h1 className="text-xl font-bold text-foreground pt-0.5">{formData.name || "Location Name"}</h1>
                    <Badge variant={formData.status === 'ACTIVE' ? 'success' : 'danger'} className="px-2 py-0 shadow-sm text-[11px]">
                      {formData.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted mt-1">
                    <MapPin size={12} className="shrink-0" />
                    <span>{formData.fullName || "Full Address, City"}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1 sm:flex-none gap-2 shadow-sm" disabled={loading}>
                  <Save size={16} /> Save Changes
                </Button>
              </div>
            </div>
          </Card>
          <Card className="p-6 flex flex-col gap-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-bold text-foreground">Location Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">
                  Short Name <span className="text-danger">*</span>
                </label>
                <Input 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. KK Nagar" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">
                  Full Area Name <span className="text-danger">*</span>
                </label>
                <Input 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. K.K. Nagar, Madurai" 
                  required 
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">
                  City <span className="text-danger">*</span>
                </label>
                <StatusSelect 
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  options={["Madurai", "Chennai", "Coimbatore", "Trichy"]}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">
                  Zone <span className="text-danger">*</span>
                </label>
                <StatusSelect 
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  options={["North Zone", "South Zone", "East Zone", "West Zone", "Central Zone"]}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">
                  Latitude
                </label>
                <Input 
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  placeholder="e.g. 9.9252" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">
                  Longitude
                </label>
                <Input 
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  placeholder="e.g. 78.1198" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">
                  Status <span className="text-danger">*</span>
                </label>
                <StatusSelect 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={["ACTIVE", "INACTIVE", "RESTRICTED"]}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 flex flex-col gap-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-bold text-foreground">Contact & Details</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">
                  Phone
                </label>
                <Input 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">
                  Email
                </label>
                <Input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">
                  Type
                </label>
                <StatusSelect 
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  options={["Restaurant", "Grocery", "Pharmacy"]}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-foreground">
                  Delivery Radius
                </label>
                <Input 
                  name="deliveryRadius"
                  value={formData.deliveryRadius}
                  onChange={handleChange}
                  placeholder="e.g. 5.0 km" 
                />
              </div>
            </div>
          </Card>


        </form>
      </div>
    </section>
  );
}
