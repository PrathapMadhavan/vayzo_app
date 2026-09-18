import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Eye, Pencil, Plus, RotateCcw, 
  Trash2, LayoutGrid, CheckCircle, AlertCircle, 
  Filter, ShoppingBag, Utensils, Pill, Store,
  Carrot, Baby, Coffee, Download
} from "lucide-react";

import Button from "../components/ui/Button";
import SearchInput from "../components/ui/SearchInput";
import Select from "../components/ui/Select";
import Table from "../components/ui/Table";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import StatCard from "../components/ui/StatCard";
import BadgeCell from "../components/ui/BadgeCell";
import ActionMenu from "../components/ui/ActionMenu";
import FilterPanel from "../components/ui/FilterPanel";

import { getCategories, deleteCategory } from "../api/categoriesApi";
import { exportToCSV } from "../utils/exportUtils";

const statusOptions = [
  "All Status",
  "Active",
  "Inactive",
];

const categoryTableHeaders = [
  "No.",
  "Parent Category",
  "Description",
  "Status",
  "Items",
  "Created At",
  "Actions",
];

// Helper to assign a random icon based on name
const getCategoryIcon = (name) => {
  const n = name?.toLowerCase() || "";
  if (n.includes('food') || n.includes('restaurant')) return <Utensils size={18} className="text-success" />;
  if (n.includes('grocer') || n.includes('retail')) return <ShoppingBag size={18} className="text-warning" />;
  if (n.includes('pharmacy') || n.includes('medicine')) return <Pill size={18} className="text-primary" />;
  if (n.includes('fruit') || n.includes('veg')) return <Carrot size={18} className="text-success" />;
  if (n.includes('baby')) return <Baby size={18} className="text-primary" />;
  if (n.includes('beverage') || n.includes('drink')) return <Coffee size={18} className="text-info" />;
  return <Store size={18} className="text-primary" />;
};

const getCategoryIconBg = (name) => {
  const n = name?.toLowerCase() || "";
  if (n.includes('food') || n.includes('restaurant') || n.includes('fruit') || n.includes('veg')) return "bg-success/10";
  if (n.includes('grocer') || n.includes('retail')) return "bg-warning/10";
  if (n.includes('beverage') || n.includes('drink')) return "bg-info/10";
  return "bg-primary/10";
};

export default function Categories() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [deleteModalId, setDeleteModalId] = useState(null);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCategories();
      // Only keep top-level categories (parentId is empty or null)
      setCategories(data.filter(c => !c.parentId));
    } catch (err) {
      setError("Unable to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchSearch =
        searchText === "" ||
        category.name?.toLowerCase().includes(searchText.toLowerCase());

      const matchStatus =
        statusFilter === "All Status" || category.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [categories, searchText, statusFilter]);

  const hasFilters = searchText !== "" || statusFilter !== "All Status";

  const resetFilters = () => {
    setSearchText("");
    setStatusFilter("All Status");
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const maxStatus = useMemo(() => {
    return paginatedCategories.reduce((max, c) => {
      const val = c.status || "Active";
      return val.length > max.length ? val : max;
    }, "");
  }, [paginatedCategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter]);

  const handleDeleteCategory = async () => {
    if (!deleteModalId) return;
    try {
      await deleteCategory(deleteModalId);
      setCategories(categories.filter((c) => c.id !== deleteModalId));
      setDeleteModalId(null);
      const newFilteredLength = filteredCategories.length - 1;
      const newTotalPages = Math.ceil(newFilteredLength / itemsPerPage) || 1;
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  return (
    <section className="min-h-full bg-background p-4 sm:p-6 pb-20 flex flex-col gap-6">
      
      {/* 2. Stat Cards Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          variant="horizontal"
          title="Total Categories"
          value={categories.length > 0 ? categories.length : 48}
          trend="12.5%"
          icon={LayoutGrid}
          colorClass="text-primary"
          bgClass="bg-primary/10"
        />
        <StatCard
          variant="horizontal"
          title="Active Categories"
          value={categories.length > 0 ? categories.filter((c) => c.status === "Active").length : 42}
          trend="10.3%"
          icon={CheckCircle}
          colorClass="text-success"
          bgClass="bg-success/10"
        />
        <StatCard
          variant="horizontal"
          title="Inactive Categories"
          value={categories.length > 0 ? categories.filter((c) => c.status === "Inactive").length : 5}
          trend="8.2%"
          isNegative
          icon={AlertCircle}
          colorClass="text-warning"
          bgClass="bg-warning/10"
        />
        <StatCard
          variant="horizontal"
          title="Deleted Categories"
          value="1"
          trend="50%"
          isNegative
          icon={Trash2}
          colorClass="text-danger"
          bgClass="bg-danger/10"
        />
      </div>

      <Card noPadding className="flex flex-col mb-2">
        <FilterPanel
          search={
            <SearchInput
              id="category-search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search category by name..."
            />
          }
          actions={
            <>
              <Button
                variant="secondary"
                size="sm"
                type="button"
                className="h-10 w-full sm:w-auto"
                onClick={() => exportToCSV(filteredCategories, "categories.csv")}
              >
                <Download size={14} className="mr-1" />
                Export
              </Button>
              <Button 
                size="sm" 
                className="gap-2 shrink-0 shadow-md h-10 w-full sm:w-auto px-4" 
                onClick={() => navigate("/categories/add")}
              >
                <Plus size={16} /> Add Category
              </Button>
            </>
          }
          filters={
            <>
              <Select
                id="category-status"
                value={statusFilter}
                options={statusOptions}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full lg:w-[150px]"
              />
            </>
          }
          hasActiveFilters={hasFilters}
          onReset={resetFilters}
        />
      </Card>

      {/* 4. Categories table */}
      <div className="flex flex-col gap-6 mt-2">
        <Card noPadding className="w-full overflow-hidden flex flex-col">
          {error ? (
            <div className="p-8 text-center text-sm font-medium text-danger">
              {error}
            </div>
          ) : (
            <Table
              headers={categoryTableHeaders}
              currentCount={paginatedCategories.length}
              totalCount={filteredCategories.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              minWidth="1000px"
              className="border-0 shadow-none rounded-none"
            >
              {loading ? (
                <tr>
                  <td
                    colSpan={categoryTableHeaders.length}
                    className="p-10 text-center text-sm text-muted"
                  >
                    Loading categories...
                  </td>
                </tr>
              ) : paginatedCategories.length ? (
                paginatedCategories.map((category, index) => (
                  <tr
                    key={category.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-background"
                  >
                    <td className="whitespace-nowrap px-5 py-4 font-medium text-foreground">
                      {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, "0")}
                    </td>
                    
                    <td className="px-5 py-4">
                      <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => navigate(`/categories/${category.id}`)}
                      >
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getCategoryIconBg(category.name)}`}>
                          {getCategoryIcon(category.name)}
                        </div>
                        <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                          {category.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-muted max-w-[200px] truncate">
                      {category.description || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <BadgeCell
                        maxContent={maxStatus}
                        content={category.status || "Active"}
                        variant={category.status === 'Active' ? 'success' : 'warning'}
                        className="px-3"
                      />
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-muted">
                      {category.itemCount || (Math.floor(Math.random() * 100) + 10)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {category.createdDate ? new Date(category.createdDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "12 May 2024"}
                        </span>
                        <span className="text-xs text-muted">
                          10:15 AM
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <ActionMenu
                          actions={[
                            {
                              label: "View",
                              icon: Eye,
                              onClick: () => navigate(`/categories/${category.id}`),
                            },
                            {
                              label: "Edit",
                              icon: Pencil,
                              onClick: () => navigate(`/categories/edit/${category.id}`),
                            },
                            {
                              label: "Delete",
                              icon: Trash2,
                              danger: true,
                              onClick: () => setDeleteModalId(category.id),
                            },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={categoryTableHeaders.length}
                    className="p-10 text-center text-sm text-muted"
                  >
                    No categories found.
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
        title="Delete Category"
      >
        <p className="text-sm text-muted">Are you sure you want to delete this category? This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModalId(null)}>Cancel</Button>
          <Button className="bg-danger hover:bg-danger/90 text-white border-0" onClick={handleDeleteCategory}>Delete</Button>
        </div>
      </Modal>
    </section>
  );
}
