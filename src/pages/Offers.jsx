import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tag,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Edit2,
  RotateCcw,
  Trash2,
  Eye,
  Download,
  Pencil
} from "lucide-react";

import Button from "../components/ui/Button";
import SearchInput from "../components/ui/SearchInput";
import StatusSelect from "../components/ui/StatusSelect";
import StatCard from "../components/ui/StatCard";
import Table from "../components/ui/Table";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import ActionMenu from "../components/ui/ActionMenu";
import BadgeCell from "../components/ui/BadgeCell";
import FilterPanel from "../components/ui/FilterPanel";

import { getOffers, deleteOffer } from "../api/offersApi";
import { exportToCSV } from "../utils/exportUtils";

const statusBadgeMap = {
  ACTIVE: "success",
  SCHEDULED: "warning",
  EXPIRED: "danger",
};

const COLOR_MAP = {
  success: "text-success bg-success/10",
  info: "text-info bg-info/10",
  warning: "text-warning bg-warning/10",
  danger: "text-danger bg-danger/10",
  primary: "text-primary bg-primary/10",
  muted: "text-muted bg-muted/10"
};

const ICON_MAP = {
  Percentage: Tag,
  Flat: Tag,
  "Free Delivery": Tag
};

export default function Offers() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Status");
  const [type, setType] = useState("All Types");
  const [platform, setPlatform] = useState("All Platforms");
  
  const [deleteModalId, setDeleteModalId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getOffers();
      setOffers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Unable to load offers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const filteredOffers = useMemo(() => {
    const searchValue = query.trim().toLowerCase();

    return offers.filter((offer) => {
      const searchableText = [offer.name, offer.title, offer.offerId]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchValue === "" || searchableText.includes(searchValue);
      const matchesStatus = status === "All Status" || offer.status.toUpperCase() === status.toUpperCase();
      const matchesType = type === "All Types" || offer.type.toUpperCase() === type.toUpperCase();
      const matchesPlatform = platform === "All Platforms" || offer.platform.toUpperCase() === platform.toUpperCase();

      return matchesSearch && matchesStatus && matchesType && matchesPlatform;
    });
  }, [offers, query, status, type, platform]);

  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage) || 1;
  const paginatedOffers = filteredOffers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const maxStatus = useMemo(() => {
    return paginatedOffers.reduce((max, o) => {
      const val = o.status || "Active";
      return val.length > max.length ? val : max;
    }, "");
  }, [paginatedOffers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, status, type, platform]);

  const hasFilters =
    query !== "" ||
    status !== "All Status" ||
    type !== "All Types" ||
    platform !== "All Platforms";

  const resetFilters = () => {
    setQuery("");
    setStatus("All Status");
    setType("All Types");
    setPlatform("All Platforms");
  };

  const handleDeleteOffer = async () => {
    if (!deleteModalId) return;
    try {
      await deleteOffer(deleteModalId);
      setOffers((prev) => prev.filter((o) => o.offerId !== deleteModalId));
      setDeleteModalId(null);
      const newFilteredLength = filteredOffers.length - 1;
      const newTotalPages = Math.ceil(newFilteredLength / itemsPerPage) || 1;
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete offer.");
    }
  };

  return (
    <section className="min-h-full bg-background p-4 sm:p-6 pb-20 flex flex-col gap-6">
      
      {/* 2. Stat Cards Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          variant="horizontal"
          title="Total Offers"
          value={offers.length > 0 ? offers.length : 28}
          trend="12.5%"
          icon={Tag}
          colorClass="text-primary"
          bgClass="bg-primary/10"
        />
        <StatCard
          variant="horizontal"
          title="Active Offers"
          value={offers.filter((o) => o.status === "ACTIVE").length || 16}
          trend="8.7%"
          icon={CheckCircle}
          colorClass="text-success"
          bgClass="bg-success/10"
        />
        <StatCard
          variant="horizontal"
          title="Scheduled Offers"
          value={offers.filter((o) => o.status === "SCHEDULED").length || 7}
          trend="16.2%"
          icon={Clock}
          colorClass="text-warning"
          bgClass="bg-warning/10"
        />
        <StatCard
          variant="horizontal"
          title="Expired Offers"
          value={offers.filter((o) => o.status === "EXPIRED").length || 5}
          trend="10.3%"
          isNegative
          icon={XCircle}
          colorClass="text-danger"
          bgClass="bg-danger/10"
        />
      </div>

      <Card noPadding className="mb-2">
        <FilterPanel
          search={
            <SearchInput
              id="offers-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by offer name or code..."
            />
          }
          actions={
            <>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                className="h-10 w-full sm:w-auto"
                onClick={() => exportToCSV(filteredOffers, "offers.csv")}
              >
                <Download size={14} className="mr-1" />
                Export
              </Button>
              <Button 
                size="sm" 
                className="gap-2 shrink-0 shadow-md h-10 w-full sm:w-auto px-4" 
                onClick={() => navigate("/offers/add")}
              >
                <Plus size={16} /> Create Offer
              </Button>
            </>
          }
          filters={
            <>
              <StatusSelect
                id="offers-status"
                value={status}
                options={["All Status", "Active", "Scheduled", "Expired"]}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full lg:w-[150px]"
              />
              <StatusSelect
                id="offers-type"
                value={type}
                options={["All Types", "Percentage", "Flat", "Free Delivery"]}
                onChange={(e) => setType(e.target.value)}
                className="w-full lg:w-[150px]"
              />
              <StatusSelect
                id="offers-platform"
                value={platform}
                options={["All Platforms", "App", "Web"]}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full lg:w-[150px]"
              />
            </>
          }
          hasActiveFilters={hasFilters}
          onReset={resetFilters}
        />
      </Card>

      {/* 4. Table */}
      <div className="flex flex-col gap-6 mt-2">
        <Card noPadding className="w-full overflow-hidden flex flex-col">
          {error ? (
            <div className="p-8 text-center text-sm font-medium text-danger">
              {error}
            </div>
          ) : (
            <Table
              headers={[
                "No.",
                "Offer Details",
                "Type",
                "Discount",
                "Usage",
                "Validity",
                "Status",
                "Actions"
              ]}
              currentCount={paginatedOffers.length}
              totalCount={filteredOffers.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              minWidth="1000px"
              className="border-0 shadow-none rounded-none"
            >
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-sm text-muted">
                    Loading offers...
                  </td>
                </tr>
              ) : paginatedOffers.length ? (
                paginatedOffers.map((offer, index) => {
                  const Icon = ICON_MAP[offer.type] || Tag;
                  const bgAndColor = COLOR_MAP[offer.color] || COLOR_MAP.muted;
                  
                  const formatDt = (dt) => {
                     if (!dt) return "";
                     const d = new Date(dt);
                     return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                  };

                  return (
                    <tr
                      key={offer.offerId}
                      className="border-b border-border transition-colors hover:bg-background last:border-0"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-medium text-foreground">
                        {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, "0")}
                      </td>
                      <td className="px-5 py-4 min-w-[220px]">
                        <div 
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => navigate(`/offers/${offer.offerId}`)}
                        >
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bgAndColor}`}>
                            <Icon size={18} strokeWidth={2.5}/>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-sm uppercase tracking-wide group-hover:text-primary transition-colors">{offer.name}</span>
                            <span className="text-[11px] text-muted truncate max-w-[200px]">{offer.title}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-medium text-foreground text-sm">
                        {offer.type}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground text-sm">{offer.discountText}</span>
                          <span className="text-xs text-muted">{offer.discountDetail}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground text-sm">{offer.usageLimit?.toLocaleString() || 0}</span>
                          <span className="text-xs text-muted">/ {offer.usageMax?.toLocaleString() || "Unlimited"}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{formatDt(offer.validFrom)}</span>
                          <span className="text-xs text-muted">to {formatDt(offer.validTo)}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <BadgeCell
                          maxContent={maxStatus}
                          content={offer.status}
                          variant={statusBadgeMap[offer.status] || "default"}
                          className="px-2"
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                        <ActionMenu
                          actions={[
                            {
                              label: "View",
                              icon: Eye,
                              onClick: () => navigate(`/offers/${offer.offerId}`),
                            },
                            {
                              label: "Edit",
                              icon: Pencil,
                              onClick: () => navigate(`/offers/edit/${offer.offerId}`),
                            },
                            {
                              label: "Delete",
                              icon: Trash2,
                              danger: true,
                              onClick: () => setDeleteModalId(offer.id),
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
                  <td colSpan={8} className="p-10 text-center text-sm text-muted">
                    No offers found.
                  </td>
                </tr>
              )}
            </Table>
          )}
        </Card>
      </div>

      <Modal 
        isOpen={!!deleteModalId} 
        onClose={() => setDeleteModalId(null)} 
        title="Delete Offer"
      >
        <p className="text-sm text-muted">Are you sure you want to delete this offer? This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModalId(null)}>Cancel</Button>
          <Button className="bg-danger hover:bg-danger/90 text-white border-0" onClick={handleDeleteOffer}>Delete</Button>
        </div>
      </Modal>
    </section>
  );
}
