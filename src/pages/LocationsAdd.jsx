import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import StatusSelect from "../components/ui/StatusSelect";
import { createLocation } from "../api/locationsApi";

export default function LocationsAdd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    fullName: "",
    city: "Madurai",
    zone: "North Zone",
    status: "ACTIVE",
    color: "success"
  });

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
      await createLocation(finalData);
      alert("Location added successfully!");
      navigate("/locations");
    } catch (err) {
      alert("Failed to create location.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-full bg-background p-4 sm:p-6 pb-20">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="secondary" 
            className="h-10 w-10 p-0 rounded-full shrink-0" 
            onClick={() => navigate("/locations")}
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-foreground">Add New Location</h1>
            <p className="text-sm text-muted">Create a new delivery or service location</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Card className="p-6 flex flex-col gap-6">
            <div className="border-b border-border pb-4">
              <h2 className="text-lg font-bold text-foreground">Location Details</h2>
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

          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate("/locations")}>
              Cancel
            </Button>
            <Button type="submit" className="gap-2 px-6 shadow-md" disabled={loading}>
              <Save size={18} /> {loading ? "Saving..." : "Save Location"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
