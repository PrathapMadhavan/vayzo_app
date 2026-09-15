import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Building2, 
  AlertCircle, 
  Trash2, 
  Plus, 
  Search,
  Filter,
  Eye,
  Edit2,
  MoreVertical,
  Maximize,
  RotateCcw,
  Download
} from "lucide-react";

import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SearchInput from "../components/ui/SearchInput";
import Select from "../components/ui/Select";
import Table from "../components/ui/Table";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import ActionMenu from "../components/ui/ActionMenu";
import FilterPanel from "../components/ui/FilterPanel";

import { getLocations, deleteLocation } from "../api/locationsApi";
import { exportToCSV } from "../utils/exportUtils";

const COLOR_MAP = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  danger: "bg-danger/10 text-danger",
};

const STATUS_MAP = {
  ACTIVE: "success",
  INACTIVE: "warning",
  RESTRICTED: "danger",
};

const TABS = [
  "All Locations",
  "Active",
  "Inactive",
  "Restricted"
];

const toTitleCase = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export default function Locations() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Status");
  const [city, setCity] = useState("All Cities");
  const [zone, setZone] = useState("All Zones");
  const [activeTab, setActiveTab] = useState("All Locations");

  const [deleteModalId, setDeleteModalId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    let mounted = true;
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const data = await getLocations();
        if (mounted) setLocations(data);
      } catch (err) {
        if (mounted) setError("Failed to load locations");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchLocations();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredLocations = useMemo(() => {
    let filtered = locations;
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (l) => l.name.toLowerCase().includes(q) || l.fullName.toLowerCase().includes(q)
      );
    }
    if (status !== "All Status") {
      filtered = filtered.filter((l) => l.status === status.toUpperCase());
    }
    if (activeTab !== "All Locations") {
      filtered = filtered.filter((l) => l.status === activeTab.toUpperCase());
    }
    if (city !== "All Cities") {
      filtered = filtered.filter((l) => l.city === city);
    }
    if (zone !== "All Zones") {
      filtered = filtered.filter((l) => l.zone === zone);
    }
    return filtered;
  }, [locations, query, status, activeTab, city, zone]);

  const hasFilters = query || status !== "All Status" || city !== "All Cities" || zone !== "All Zones";
  
  const resetFilters = () => {
    setQuery("");
    setStatus("All Status");
    setCity("All Cities");
    setZone("All Zones");
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage) || 1;
  const paginatedLocations = filteredLocations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteLocation = async () => {
    if (!deleteModalId) return;
    try {
      await deleteLocation(deleteModalId);
      setLocations((prev) => prev.filter((loc) => loc.id !== deleteModalId));
      setDeleteModalId(null);
      const newFilteredLength = filteredLocations.length - 1;
      const newTotalPages = Math.ceil(newFilteredLength / itemsPerPage) || 1;
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete location.");
    }
  };

  return (
    <section className="min-h-full bg-background p-4 sm:p-6 pb-20 flex flex-col gap-6">
      
      {/* 1. Action area is now moved down next to Tabs */}

      {/* 2. Stat cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          variant="horizontal"
          title="Total Locations"
          value={locations.length > 0 ? locations.length : 256}
          trend="8.5%"
          icon={MapPin}
          colorClass="text-primary"
          bgClass="bg-primary/10"
        />
        <StatCard
          variant="horizontal"
          title="Active Locations"
          value={locations.filter((l) => l.status === "ACTIVE").length || 198}
          trend="10.2%"
          icon={Building2}
          colorClass="text-success"
          bgClass="bg-success/10"
        />
        <StatCard
          variant="horizontal"
          title="Inactive Locations"
          value={locations.filter((l) => l.status === "INACTIVE").length || 45}
          trend="5.6%"
          isNegative
          icon={AlertCircle}
          colorClass="text-warning"
          bgClass="bg-warning/10"
        />
        <StatCard
          variant="horizontal"
          title="Restricted Locations"
          value={locations.filter((l) => l.status === "RESTRICTED").length || 13}
          trend="2.1%"
          isNegative
          icon={Trash2}
          colorClass="text-danger"
          bgClass="bg-danger/10"
        />
      </div>

      {/* 3. Search + Select/filter controls */}
      <div className="flex flex-col gap-5">
        <Card noPadding className="flex flex-col">
          <FilterPanel
            search={
              <SearchInput
                id="locations-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search location by name or address..."
              />
            }
            actions={
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  className="h-10 w-full sm:w-auto"
                  onClick={() => exportToCSV(filteredLocations, "locations.csv")}
                >
                  <Download size={14} className="mr-1" />
                  Export
                </Button>
                <Button className="gap-2 shrink-0 shadow-md h-10 w-full sm:w-auto px-4" onClick={() => navigate("/locations/add")}>
                  <Plus size={16} /> Add Location
                </Button>
              </>
            }
            filters={
              <>
                <Select
                  id="locations-status"
                  value={status}
                  options={["All Status", "Active", "Inactive", "Restricted"]}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full lg:w-[150px]"
                />
                <Select
                  id="locations-cities"
                  value={city}
                  options={["All Cities", "Madurai", "Chennai", "Coimbatore"]}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full lg:w-[150px]"
                />
                <Select
                  id="locations-zones"
                  value={zone}
                  options={["All Zones", "North Zone", "South Zone", "East Zone", "West Zone"]}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full lg:w-[150px]"
                />
              </>
            }
            hasActiveFilters={hasFilters}
            onReset={resetFilters}
          />
          {/* Tabs */}
          <div className="px-4 sm:px-6 pt-0 border-t border-border/50">
            <nav className="flex gap-5 overflow-x-auto scrollbar-none w-full mt-4">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setCurrentPage(1);
                  }}
                  className={`whitespace-nowrap border-b-2 px-2 pb-2 text-sm font-medium transition ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted hover:text-foreground hover:border-border"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </Card>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start mt-2">
        {/* 5. Locations table (Left Column) */}
        <div className="flex flex-col gap-6 flex-1 w-full lg:w-3/5 xl:w-2/3">
          <Card noPadding className="w-full overflow-hidden flex flex-col">
            {error ? (
              <div className="p-8 text-center text-sm font-medium text-danger">
                {error}
              </div>
            ) : (
              <Table
                headers={[
                  "No.",
                  "Location Name",
                  "Zone",
                  "City",
                  "Status",
                  "Orders (30D)",
                  "Actions"
                ]}
                currentCount={paginatedLocations.length}
                totalCount={filteredLocations.length}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                minWidth="800px"
                className="border-0 shadow-none rounded-none"
              >
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-sm text-muted">
                      Loading locations...
                    </td>
                  </tr>
                ) : paginatedLocations.length > 0 ? (
                  paginatedLocations.map((loc, index) => {
                      const bgAndColor = COLOR_MAP[loc.color] || COLOR_MAP.primary;

                      return (
                        <tr
                          key={loc.id}
                          onClick={() => navigate(`/locations/edit/${loc.id}`)}
                          className="border-b border-border transition-colors hover:bg-background last:border-0 cursor-pointer"
                        >
                          <td className="whitespace-nowrap px-5 py-4 font-medium text-foreground">
                            {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, "0")}
                          </td>
                          <td className="px-5 py-4 min-w-[220px]">
                            <div 
                              className="flex items-center gap-3 group"
                            >
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bgAndColor}`}>
                                <Building2 size={18} strokeWidth={2.5}/>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{loc.name}</span>
                                <span className="text-[11px] text-muted truncate max-w-[200px]">{loc.fullName}</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 font-medium text-muted text-sm">
                            {loc.zone}
                          </td>

                          <td className="px-5 py-4 font-medium text-muted text-sm">
                            {loc.city}
                          </td>

                          <td className="px-5 py-4">
                            <Badge variant={STATUS_MAP[loc.status] || "default"} className="px-2.5 py-1 text-[11px] font-bold tracking-wider">
                              {toTitleCase(loc.status)}
                            </Badge>
                          </td>

                          <td className="px-5 py-4 font-semibold text-foreground text-sm text-center">
                            {loc.orders30d}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <ActionMenu
                                actions={[
                                  {
                                    label: "View",
                                    icon: Eye,
                                    onClick: () => {},
                                  },
                                  {
                                    label: "Edit",
                                    icon: Edit2,
                                    onClick: () => navigate(`/locations/edit/${loc.id}`),
                                  },
                                  {
                                    label: "Delete",
                                    icon: Trash2,
                                    danger: true,
                                    onClick: () => setDeleteModalId(loc.id),
                                  },
                                ]}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-sm text-muted">
                        No locations found.
                      </td>
                    </tr>
                  )}
              </Table>
            )}
          </Card>
        </div>

        {/* 6. Right-side map/location panel */}
        <Card className="flex flex-col h-[500px] lg:h-[calc(100vh-200px)] w-full lg:w-2/5 xl:w-1/3 shrink-0 p-0 overflow-hidden lg:sticky lg:top-24">
            <div className="p-5 border-b border-border flex justify-between items-center bg-surface shrink-0">
              <h3 className="font-bold text-foreground">Location Map</h3>
              <div className="flex gap-2">
                <Button variant="secondary" className="px-3 py-1.5 h-auto text-xs font-semibold">
                  View Full Map
                </Button>
                <button className="text-muted hover:text-foreground">
                  <Maximize size={18} />
                </button>
              </div>
            </div>
            
            {/* Mock Map Area */}
            <div className="flex-1 bg-border/20 relative overflow-hidden flex items-center justify-center group cursor-grab active:cursor-grabbing">
               {/* Map Background Pattern */}
               <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
               
               {/* City Label */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 font-bold text-3xl text-foreground/40 text-center pointer-events-none">
                 Madurai<br/><span className="text-xl">மதுரை</span>
               </div>

               {/* North Zone */}
               <div className="absolute top-[10%] left-[30%] right-[20%] bottom-[50%] bg-info/20 border-2 border-info rounded-[30px] rounded-br-[100px] flex items-center justify-center transition-transform hover:scale-[1.02]">
                 <span className="bg-info text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg whitespace-nowrap">North Zone</span>
                 <MapPin size={24} className="text-info absolute top-[20%] right-[30%] drop-shadow-md" fill="white" />
               </div>

               {/* West Zone */}
               <div className="absolute top-[40%] left-[10%] right-[55%] bottom-[20%] bg-warning/20 border-2 border-warning rounded-[40px] rounded-tl-[80px] flex items-center justify-center transition-transform hover:scale-[1.02]">
                 <span className="bg-warning text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg whitespace-nowrap">West Zone</span>
                 <MapPin size={24} className="text-warning absolute top-[30%] left-[20%] drop-shadow-md" fill="white" />
               </div>

               {/* East Zone */}
               <div className="absolute top-[45%] left-[55%] right-[10%] bottom-[25%] bg-success/20 border-2 border-success rounded-[30px] rounded-tr-[90px] flex items-center justify-center transition-transform hover:scale-[1.02]">
                 <span className="bg-success text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg whitespace-nowrap">East Zone</span>
                 <MapPin size={24} className="text-success absolute bottom-[30%] right-[20%] drop-shadow-md" fill="white" />
               </div>

               {/* South Zone */}
               <div className="absolute top-[70%] left-[25%] right-[30%] bottom-[5%] bg-danger/20 border-2 border-danger rounded-[20px] rounded-bl-[60px] flex items-center justify-center transition-transform hover:scale-[1.02]">
                 <span className="bg-danger text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg whitespace-nowrap">South Zone</span>
                 <MapPin size={24} className="text-danger absolute top-[10%] left-[30%] drop-shadow-md" fill="white" />
               </div>

               {/* Map Controls */}
               <div className="absolute right-4 bottom-4 flex flex-col gap-1 z-10 bg-surface shadow-md rounded-lg overflow-hidden border border-border">
                 <button className="h-8 w-8 flex items-center justify-center hover:bg-muted/10 text-foreground text-lg font-bold">+</button>
                 <div className="h-px w-full bg-border"></div>
                 <button className="h-8 w-8 flex items-center justify-center hover:bg-muted/10 text-foreground text-lg font-bold">-</button>
               </div>
               
               <div className="absolute right-4 bottom-24 bg-surface shadow-md rounded-lg p-2 border border-border text-foreground hover:bg-muted/10 cursor-pointer">
                 <MapPin size={18} />
               </div>
            </div>

            {/* Map Legend */}
            <div className="p-4 bg-surface border-t border-border shrink-0">
               <div className="flex gap-4 items-center justify-center text-[11px] font-semibold text-foreground">
                 <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-success"></span> Active (198)</span>
                 <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-warning"></span> Inactive (45)</span>
                 <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-danger"></span> Restricted (13)</span>
               </div>
            </div>
          </Card>
      </div>

      <Modal 
        isOpen={!!deleteModalId} 
        onClose={() => setDeleteModalId(null)} 
        title="Delete Location"
      >
        <p className="text-sm text-muted">Are you sure you want to delete this location? This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModalId(null)}>Cancel</Button>
          <Button className="bg-danger hover:bg-danger/90 text-white border-0" onClick={handleDeleteLocation}>Delete</Button>
        </div>
      </Modal>
    </section>
  );
}
