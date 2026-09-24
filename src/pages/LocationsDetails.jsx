import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  MapPin, 
  Building2, 
  Phone, 
  Mail, 
  CheckCircle,
  FileText,
  Activity,
  Settings,
  Smartphone,
  Edit2
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import Toggle from "../components/ui/Toggle";
import MockMap from "../components/ui/MockMap";
import { getLocationById, updateLocation } from "../api/locationsApi";

function LocationsDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async (isMounted = true) => {
    try {
      setLoading(true);
      setError("");
      const locData = await getLocationById(id);
      if (isMounted) {
        setLocation(locData);
      }
    } catch {
      if (isMounted) setError("Unable to load location details.");
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    loadData(isMounted);
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleToggleStatus = async () => {
    if (!location) return;
    const newStatus = location.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const newColor = newStatus === 'ACTIVE' ? 'success' : 'warning';
    
    // Optimistic update
    const previousLocation = { ...location };
    setLocation({ ...location, status: newStatus, color: newColor });

    try {
      await updateLocation(id, { status: newStatus, color: newColor });
    } catch (err) {
      console.error("Failed to update status", err);
      // Revert on failure
      setLocation(previousLocation);
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <section className="min-h-full bg-background p-4 sm:p-6 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary/20 mb-4"></div>
          <p className="text-sm text-muted font-medium">Loading location details...</p>
        </div>
      </section>
    );
  }

  if (error || !location) {
    return (
      <section className="min-h-full bg-background p-4 sm:p-6">
        <div className="rounded-xl border border-border bg-surface p-6 flex flex-col items-center justify-center h-48">
          <p className="text-sm text-danger mb-4 font-medium">{error || "Location not found."}</p>
          <Button variant="secondary" size="sm" onClick={() => navigate("/locations")}>
            <ArrowLeft size={16} /> Back to Locations
          </Button>
        </div>
      </section>
    );
  }

  const currentStatus = location.status ? location.status.charAt(0).toUpperCase() + location.status.slice(1).toLowerCase() : "Active";
  const addressString = `${location.fullName || location.name}, ${location.city || 'N/A'}, Tamil Nadu`;

  return (
    <section className="min-h-full bg-background p-4 pb-12">
      <div className="mx-auto max-w-7xl space-y-4">
        
        {/* Navigation Breadcrumb & Back */}
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => navigate("/locations")}
            className="flex items-center gap-2 text-sm font-bold text-foreground hover:text-primary transition-colors w-fit pt-2"
          >
            <ArrowLeft size={16} /> Back to Locations
          </button>
        </div>

        {/* Location Header Card */}
        <Card className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPin size={24} />
              </div>
              <div>
                <div className="flex items-start gap-4">
                  <h1 className="text-xl font-bold text-foreground pt-1">{location.name}</h1>
                  <div className="flex flex-col items-center gap-1.5">
                    <Badge variant={location.status === 'ACTIVE' ? 'success' : 'danger'} className="px-2 py-0 shadow-sm text-[11px]">
                      {currentStatus}
                    </Badge>
                    <Toggle checked={location.status === 'ACTIVE'} onChange={handleToggleStatus} />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-muted mt-0.5">
                  <MapPin size={12} className="shrink-0" />
                  <span>{addressString}</span>
                </div>
              </div>
            </div>
            
            <Button
              variant="primary"
              onClick={() => navigate(`/locations/edit/${location.id}`)}
              className="rounded-xl shadow-sm px-5"
            >
              <Edit2 size={15} className="mr-2" /> Edit
            </Button>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Zone" 
            value={location.zone || "N/A"} 
            icon={MapPin} 
            colorClass="text-primary"
            bgClass="bg-primary/10"
            variant="horizontal"
          />
          <StatCard 
            title="City" 
            value={location.city || "N/A"} 
            icon={FileText} 
            colorClass="text-primary"
            bgClass="bg-primary/10"
            variant="horizontal"
          />
          <StatCard 
            title="Orders (30D)" 
            value={location.orders30d !== undefined ? location.orders30d : (location.orders30D !== undefined ? location.orders30D : "N/A")} 
            icon={Activity} 
            colorClass="text-primary"
            bgClass="bg-primary/10"
            variant="horizontal"
          />
          <StatCard 
            title="Status" 
            value={currentStatus} 
            icon={CheckCircle} 
            colorClass={location.status === 'ACTIVE' ? "text-success" : "text-danger"}
            bgClass={location.status === 'ACTIVE' ? "bg-success/10" : "bg-danger/10"}
            variant="horizontal"
          />
        </div>

        {/* Main Details Grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          
          {/* Location Information */}
          <Card className="p-0 overflow-hidden flex flex-col h-full">
            <div className="border-b border-border py-3 px-4 bg-surface flex items-center gap-2">
              <div className="bg-primary/10 p-1 rounded text-primary">
                <MapPin size={16} />
              </div>
              <h2 className="text-sm font-bold text-foreground">Location Information</h2>
            </div>
            <div className="p-4 flex-1">
              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_1.5fr] items-center pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <FileText size={14} /> Location Name
                  </div>
                  <div className="text-sm font-medium text-foreground">{location.name || "N/A"}</div>
                </div>
                <div className="grid grid-cols-[1fr_1.5fr] items-center pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <MapPin size={14} /> Address
                  </div>
                  <div className="text-sm font-medium text-foreground leading-tight">{addressString}</div>
                </div>
                <div className="grid grid-cols-[1fr_1.5fr] items-center pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <FileText size={14} /> Zone
                  </div>
                  <div className="text-sm font-medium text-foreground">{location.zone || "N/A"}</div>
                </div>
                <div className="grid grid-cols-[1fr_1.5fr] items-center pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <FileText size={14} /> City
                  </div>
                  <div className="text-sm font-medium text-foreground">{location.city || "N/A"}</div>
                </div>
                <div className="grid grid-cols-[1fr_1.5fr] items-center pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <MapPin size={14} /> Latitude
                  </div>
                  <div className="text-sm font-medium text-foreground">{location.latitude || "9.9252"}</div>
                </div>
                <div className="grid grid-cols-[1fr_1.5fr] items-center">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <MapPin size={14} /> Longitude
                  </div>
                  <div className="text-sm font-medium text-foreground">{location.longitude || "78.1198"}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Location Map */}
          <Card className="p-0 overflow-hidden flex flex-col h-full min-h-[200px]">
            <div className="border-b border-border py-3 px-4 bg-surface flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1 rounded text-primary">
                  <MapPin size={16} />
                </div>
                <h2 className="text-sm font-bold text-foreground">Location Map</h2>
              </div>
            </div>
            <div className="flex-1 relative bg-border/20">
              <MockMap 
                city={location.city || "Madurai"} 
                address={location.name || ""} 
                zone={location.zone || ""}
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </Card>

          {/* Contact & Details */}
          <Card className="p-0 overflow-hidden flex flex-col h-full">
            <div className="border-b border-border py-3 px-4 bg-surface flex items-center gap-2">
              <div className="bg-primary/10 p-1 rounded text-primary">
                <Smartphone size={16} />
              </div>
              <h2 className="text-sm font-bold text-foreground">Contact & Details</h2>
            </div>
            <div className="p-4 flex-1">
              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_1.5fr] items-center pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <Smartphone size={14} /> Phone
                  </div>
                  <div className="text-sm font-medium text-foreground">{location.phone || "+91 98765 43210"}</div>
                </div>
                <div className="grid grid-cols-[1fr_1.5fr] items-center pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <Mail size={14} /> Email
                  </div>
                  <div className="text-sm font-medium text-foreground truncate">{location.email || `${(location.name || "contact").toLowerCase().replace(/[^a-z0-9]/g, '.')}@vayzo.com`}</div>
                </div>
                <div className="grid grid-cols-[1fr_1.5fr] items-center pb-2 border-b border-border/50">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <Settings size={14} /> Type
                  </div>
                  <div className="text-sm font-medium text-foreground">{location.type || "Restaurant"}</div>
                </div>
                <div className="grid grid-cols-[1fr_1.5fr] items-center">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted">
                    <MapPin size={14} /> Delivery Radius
                  </div>
                  <div className="text-sm font-medium text-foreground">{location.deliveryRadius || "5.0 km"}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Created & Updated */}
          <Card className="p-0 overflow-hidden flex flex-col h-full">
            <div className="border-b border-border py-3 px-4 bg-surface flex items-center gap-2">
              <div className="bg-primary/10 p-1 rounded text-primary">
                <Activity size={16} />
              </div>
              <h2 className="text-sm font-bold text-foreground">Created & Updated</h2>
            </div>
            <div className="p-4 flex-1">
              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_1.5fr] items-center pb-2 border-b border-border/50">
                  <div className="text-xs font-medium text-muted">Created At</div>
                  <div className="text-sm font-medium text-foreground">{location.createdAt || "22 Apr 2025, 10:30 AM"}</div>
                </div>
                <div className="grid grid-cols-[1fr_1.5fr] items-center pb-2 border-b border-border/50">
                  <div className="text-xs font-medium text-muted">Created By</div>
                  <div className="text-sm font-medium text-foreground">{location.createdBy || "System Admin"}</div>
                </div>
                <div className="grid grid-cols-[1fr_1.5fr] items-center pb-2 border-b border-border/50">
                  <div className="text-xs font-medium text-muted">Updated At</div>
                  <div className="text-sm font-medium text-foreground">{location.updatedAt || "22 Apr 2025, 02:15 PM"}</div>
                </div>
                <div className="grid grid-cols-[1fr_1.5fr] items-center">
                  <div className="text-xs font-medium text-muted">Updated By</div>
                  <div className="text-sm font-medium text-foreground">{location.updatedBy || "Admin"}</div>
                </div>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </section>
  );
}

export default LocationsDetails;
