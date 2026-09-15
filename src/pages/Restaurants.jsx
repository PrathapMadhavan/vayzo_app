import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, RotateCcw, Trash2, Eye, Pencil, Star, ShoppingBag, Store, TrendingUp, Download } from "lucide-react";

import Badge from "../components/ui/Badge";
import BadgeCell from "../components/ui/BadgeCell";
import Button from "../components/ui/Button";
import SearchInput from "../components/ui/SearchInput";
import StatusSelect from "../components/ui/StatusSelect";
import Table from "../components/ui/Table";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import StatCard from "../components/ui/StatCard";
import ActionMenu from "../components/ui/ActionMenu";
import FilterPanel from "../components/ui/FilterPanel";

import { getRestaurants, deleteRestaurant } from "../api/restaurantsApi";
import { exportToCSV } from "../utils/exportUtils";

const statusOptions = ["All Status", "Active", "Inactive"];
export const RESTAURANT_CUISINES = [
  "South Indian", "North Indian", "Fast Food",
  "Chinese", "Italian", "Biryani", "Multi-Cuisine", "Cafe",
];

const cuisineOptions = ["All Cuisine", ...RESTAURANT_CUISINES];

const tableHeaders = ["No.", "Restaurant", "Owner", "City", "Cuisine", "Rating", "Orders", "Status", "Actions"];

function RatingStars({ rating }) {
  return (
    <span className="flex items-center gap-1 font-semibold text-foreground">
      <Star size={13} className="text-warning fill-warning" />
      {rating?.toFixed(1) ?? "-"}
    </span>
  );
}

function Restaurants() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [cuisine, setCuisine] = useState("All Cuisine");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [deleteModalId, setDeleteModalId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRestaurants();
        if (isMounted) setRestaurants(data);
      } catch {
        if (isMounted) setError("Failed to load restaurants");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return restaurants.filter((r) => {
      const matchQ =
        !q ||
        r.name?.toLowerCase().includes(q) ||
        r.ownerName?.toLowerCase().includes(q) ||
        r.city?.toLowerCase().includes(q);
      const matchStatus = status === "All Status" || r.status === status;
      const matchCuisine =
        cuisine === "All Cuisine" ||
        (r.cuisineType || "").toLowerCase().includes(cuisine.toLowerCase());
      return matchQ && matchStatus && matchCuisine;
    });
  }, [restaurants, search, status, cuisine]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => { setCurrentPage(1); }, [search, status, cuisine]);

  const hasFilters = search || status !== "All Status" || cuisine !== "All Cuisine";
  const resetFilters = () => {
    setSearch("");
    setStatus("All Status");
    setCuisine("All Cuisine");
  };

  const maxStatus = useMemo(
    () => paginated.reduce((m, r) => (r.status || "").length > m.length ? r.status : m, ""),
    [paginated]
  );

  const handleDelete = async () => {
    if (!deleteModalId) return;
    setDeleteLoading(true);
    try {
      await deleteRestaurant(deleteModalId);
      setRestaurants((prev) => prev.filter((r) => r.id !== deleteModalId));
      setDeleteModalId(null);
      const newTotal = Math.ceil((filtered.length - 1) / itemsPerPage) || 1;
      if (currentPage > newTotal) setCurrentPage(newTotal);
    } catch {
      alert("Failed to delete restaurant.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const activeCount = restaurants.filter((r) => r.status === "Active").length;
  const totalOrders = restaurants.reduce((s, r) => s + (r.totalOrders || 0), 0);
  const avgRating = restaurants.length
    ? (restaurants.reduce((s, r) => s + (r.rating || 0), 0) / restaurants.length).toFixed(1)
    : "0";

  return (
    <section className="min-h-full bg-background p-4 sm:p-6">

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard variant="horizontal" title="Total Restaurants" value={restaurants.length} icon={Store} colorClass="text-primary" bgClass="bg-primary/10" trend="12.5%" />
        <StatCard variant="horizontal" title="Active Restaurants" value={activeCount} icon={TrendingUp} colorClass="text-success" bgClass="bg-success/10" trend="8.3%" />
        <StatCard variant="horizontal" title="Total Orders" value={totalOrders.toLocaleString("en-IN")} icon={ShoppingBag} colorClass="text-info" bgClass="bg-info/10" trend="15.7%" />
        <StatCard variant="horizontal" title="Avg. Rating" value={avgRating} icon={Star} colorClass="text-warning" bgClass="bg-warning/10" trend="2.1%" />
      </div>

      {/* Filters */}
      <Card noPadding className="mb-6">
        <FilterPanel
          search={
            <SearchInput
              id="restaurant-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurant, owner, city..."
            />
          }
          actions={
            <>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                className="h-10 w-full sm:w-auto"
                onClick={() => exportToCSV(filtered, "restaurants.csv")}
              >
                <Download size={14} className="mr-1" /> Export
              </Button>
              <Button onClick={() => navigate("/restaurants/add")} className="gap-2 h-10 whitespace-nowrap shrink-0 w-full sm:w-auto">
                <Plus size={16} /> Add Restaurant
              </Button>
            </>
          }
          filters={
            <>
              <StatusSelect
                id="rst-status"
                value={status}
                options={statusOptions}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full lg:w-[150px]"
              />
              <StatusSelect
                id="rst-cuisine"
                value={cuisine}
                options={cuisineOptions}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full lg:w-[170px]"
              />
            </>
          }
          hasActiveFilters={hasFilters}
          onReset={resetFilters}
        />
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-danger text-sm">{error}</div>
        ) : (
          <Table
            headers={tableHeaders}
            currentCount={paginated.length}
            totalCount={filtered.length}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            minWidth="900px"
            className="border-0 shadow-none rounded-none"
          >
            {loading ? (
              <tr>
                <td colSpan={tableHeaders.length} className="p-10 text-center text-sm text-muted">
                  Loading restaurants...
                </td>
              </tr>
            ) : paginated.length ? (
              paginated.map((r, index) => (
                <tr
                  key={r.id}
                  className="border-b border-border transition-colors hover:bg-background last:border-0"
                >
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-foreground">
                    {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, "0")}
                  </td>
                  <td className="px-5 py-4 min-w-[200px]">
                    <div
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => navigate(`/restaurants/${r.id}`)}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Store size={18} strokeWidth={2} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors truncate">
                          {r.name}
                        </span>
                        <span className="text-[11px] text-muted truncate max-w-[180px]">{r.deliveryTime}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-foreground whitespace-nowrap">{r.ownerName}</td>
                  <td className="px-5 py-4 text-sm text-muted whitespace-nowrap">{r.city}</td>
                  <td className="px-5 py-4 text-sm text-muted max-w-[150px] truncate">{r.cuisineType}</td>
                  <td className="px-5 py-4"><RatingStars rating={r.rating} /></td>
                  <td className="px-5 py-4 text-sm font-semibold text-foreground whitespace-nowrap">
                    {(r.totalOrders || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-4">
                    <BadgeCell
                      maxContent={maxStatus}
                      content={r.status}
                      variant={r.status === "Active" ? "success" : "danger"}
                      className="px-3"
                    />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end pr-2">
                      <ActionMenu
                        actions={[
                          { label: "View", icon: Eye, onClick: () => navigate(`/restaurants/${r.id}`) },
                          { label: "Edit", icon: Pencil, onClick: () => navigate(`/restaurants/edit/${r.id}`) },
                          { label: "Delete", icon: Trash2, danger: true, onClick: () => setDeleteModalId(r.id) },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={tableHeaders.length} className="p-10 text-center text-sm text-muted">
                  No restaurants found.
                </td>
              </tr>
            )}
          </Table>
        )}
      </Card>

      <Modal isOpen={!!deleteModalId} onClose={() => setDeleteModalId(null)} title="Delete Restaurant">
        <p className="text-sm text-muted">
          Are you sure you want to delete this restaurant? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModalId(null)}>Cancel</Button>
          <Button
            className="bg-danger hover:bg-danger/90 text-white"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </section>
  );
}

export default Restaurants;