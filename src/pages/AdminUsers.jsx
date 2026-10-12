import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  UserPlus,
  AlertCircle,
  Download,
  Users,
  CheckCircle,
  XCircle,
  Check,
  X,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Table from "../components/ui/Table";
import Avatar from "../components/ui/Avatar";
import FilterPanel from "../components/ui/FilterPanel";
import SearchInput from "../components/ui/SearchInput";
import StatusSelect from "../components/ui/StatusSelect";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import Modal from "../components/ui/Modal";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { getAdminUsers, deleteAdminUser } from "../api/adminUsersApi";
import { MODULE_PERMISSIONS, ROLES } from "../constants/permissions";
import { exportToCSV } from "../utils/exportUtils";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All Roles");
  const [status, setStatus] = useState("All Status");
  const [adminUsersData, setAdminUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Admin for Quick View Modal
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchAdminUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers({ searchQuery: query, role, status });
      setAdminUsersData(Array.isArray(data) ? data : []);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "Failed to load admin users.");
    } finally {
      setIsLoading(false);
    }
  }, [query, role, status]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAdminUsers();
    }, 300);

    const handleSync = () => {
      fetchAdminUsers();
    };
    window.addEventListener("vayzo_admin_user_updated", handleSync);

    return () => {
      clearTimeout(delayDebounceFn);
      window.removeEventListener("vayzo_admin_user_updated", handleSync);
    };
  }, [fetchAdminUsers]);

  const handleResetFilters = () => {
    setQuery("");
    setRole("All Roles");
    setStatus("All Status");
  };

  const handleDelete = async (user) => {
    if (user.role === ROLES.SUPER_ADMIN) {
      alert("Super Admin accounts cannot be deleted.");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete administrator "${user.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteAdminUser(user.id);
        await fetchAdminUsers();
      } catch (err) {
        alert(err.message || "Failed to delete user.");
      }
    }
  };

  // Stats calculation
  const totalCount = adminUsersData.length;
  const superAdminCount = useMemo(
    () => adminUsersData.filter((u) => u.role === ROLES.SUPER_ADMIN).length,
    [adminUsersData]
  );
  const activeCount = useMemo(
    () =>
      adminUsersData.filter(
        (u) => (u.status || "").toLowerCase() === "active"
      ).length,
    [adminUsersData]
  );
  const inactiveCount = Math.max(0, totalCount - activeCount);

  // Pagination logic
  const totalPages = Math.ceil(adminUsersData.length / itemsPerPage) || 1;
  const currentData = adminUsersData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const roleColors = {
    [ROLES.SUPER_ADMIN]: "danger",
    [ROLES.ADMIN]: "primary",
  };

  const statusColors = {
    Active: "success",
    ACTIVE: "success",
    Inactive: "default",
    INACTIVE: "default",
  };

  const tableHeaders = [
    "Admin User",
    "Email",
    "Role",
    "Department",
    "Phone",
    "Permissions",
    "Status",
    "Joined Date",
    "Actions",
  ];

  const handleExport = () => {
    const exportData = adminUsersData.map((u) => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Department: u.department,
      Phone: u.phone || u.mobileNumber,
      Status: u.status,
      Permissions:
        u.role === ROLES.SUPER_ADMIN
          ? "Full Access"
          : Array.isArray(u.permissions)
          ? u.permissions.join(", ")
          : "None",
      JoinedDate: u.joinedDate,
    }));
    exportToCSV(exportData, "admin_users.csv");
  };

  return (
    <section className="min-h-full bg-background p-4 sm:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Admin Users
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {adminUsersData.length} total
            </span>
          </h1>
          <p className="mt-1 text-xs text-muted">
            Manage system administrators, configure role privileges, and grant module permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            className="h-10 text-xs font-medium"
            disabled={adminUsersData.length === 0}
          >
            <Download size={14} className="mr-1.5" />
            Export CSV
          </Button>

          <Button
            size="sm"
            onClick={() => navigate("/admin-users/add")}
            className="h-10 text-xs font-medium bg-primary hover:bg-primary-hover text-white shadow-sm"
          >
            <UserPlus size={15} className="mr-2" />
            Add Admin User
          </Button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          variant="horizontal"
          title="Total Administrators"
          value={totalCount}
          icon={Users}
          colorClass="text-primary"
          bgClass="bg-primary/10"
        />
        <StatCard
          variant="horizontal"
          title="Super Admins"
          value={superAdminCount}
          icon={ShieldCheck}
          colorClass="text-danger"
          bgClass="bg-danger/10"
        />
        <StatCard
          variant="horizontal"
          title="Active Accounts"
          value={activeCount}
          icon={CheckCircle}
          colorClass="text-success"
          bgClass="bg-success/10"
        />
        <StatCard
          variant="horizontal"
          title="Inactive Accounts"
          value={inactiveCount}
          icon={XCircle}
          colorClass="text-muted"
          bgClass="bg-surface-hover"
        />
      </div>

      {/* Filter / Search Card */}
      <Card noPadding className="flex flex-col overflow-hidden">
        <FilterPanel
          search={
            <SearchInput
              id="admin-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email, ID, or phone..."
              className="w-full"
            />
          }
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={fetchAdminUsers}
                className="h-10 text-xs text-muted hover:text-foreground"
                title="Refresh list"
              >
                <RefreshCw size={14} className={`mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          }
          filters={
            <>
              <Select
                id="admin-role-filter"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full sm:w-40 h-10 text-xs"
              >
                <option value="All Roles">All Roles</option>
                <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
                <option value={ROLES.ADMIN}>Admin</option>
              </Select>

              <StatusSelect
                id="admin-status-filter"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={["All Status", "Active", "Inactive"]}
                className="w-full sm:w-36 h-10 text-xs"
              >
                <option value="All Status">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </StatusSelect>
            </>
          }
          hasActiveFilters={query !== "" || role !== "All Roles" || status !== "All Status"}
          onReset={handleResetFilters}
        />

        {/* Loading / Error / Table Content */}
        {isLoading ? (
          <LoadingState message="Loading administrator accounts..." />
        ) : error ? (
          <div className="p-6">
            <ErrorState onRetry={fetchAdminUsers} />
          </div>
        ) : (
          <div className="flex-1 w-full flex flex-col min-h-0 overflow-hidden border-t border-border">
            <Table
              headers={tableHeaders}
              currentCount={currentData.length}
              totalCount={adminUsersData.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              minWidth="1100px"
              className="border-0 shadow-none rounded-none border-t-0"
            >
              {adminUsersData.length === 0 ? (
                <EmptyState
                  colSpan={9}
                  message="No admin users found."
                  description={
                    query || role !== "All Roles" || status !== "All Status"
                      ? "Try adjusting your search criteria or resetting filters."
                      : undefined
                  }
                  action={
                    (query || role !== "All Roles" || status !== "All Status")
                      ? { label: "Clear Filters", onClick: handleResetFilters }
                      : undefined
                  }
                />
              ) : (
                currentData.map((user) => {
                  const isSuper = user.role === ROLES.SUPER_ADMIN;
                  const perms = Array.isArray(user.permissions) ? user.permissions : [];
                  const permCount = isSuper ? "Full Access" : `${perms.length} Modules`;

                  return (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedAdmin(user)}
                      className="border-b border-border hover:bg-surface-hover/60 transition-colors text-sm last:border-0 cursor-pointer"
                    >
                      {/* Name & Avatar */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={user.profileImage || user.image}
                            seed={user.name}
                            size="md"
                          />
                          <div>
                            <p className="font-semibold text-foreground flex items-center gap-1.5">
                              {user.name}
                              {isSuper && (
                                <ShieldCheck
                                  size={14}
                                  className="text-danger inline-block shrink-0"
                                  title="Super Administrator"
                                />
                              )}
                            </p>
                            <p className="text-xs text-muted font-mono">{user.id || user.userId}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-4 text-muted whitespace-nowrap text-xs font-mono">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <Badge
                          variant={roleColors[user.role] || "default"}
                          className="px-2.5 py-0.5 rounded-md font-semibold text-[11px]"
                        >
                          {user.role}
                        </Badge>
                      </td>

                      {/* Department */}
                      <td className="px-5 py-4 text-foreground whitespace-nowrap text-xs font-medium">
                        {user.department || "Operations"}
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-4 text-muted whitespace-nowrap text-xs">
                        {user.phone || user.mobileNumber || "—"}
                      </td>

                      {/* Permissions Overview */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-danger/10 text-danger border border-danger/20">
                            <ShieldCheck size={12} />
                            Full Access
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                            <Lock size={11} />
                            {permCount}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <Badge
                          variant={statusColors[user.status] || "default"}
                          className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                        >
                          {user.status || "Active"}
                        </Badge>
                      </td>

                      {/* Joined Date */}
                      <td className="px-5 py-4 text-muted whitespace-nowrap text-xs">
                        {user.joinedDate || "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedAdmin(user)}
                            className="text-muted hover:text-foreground hover:bg-surface-hover transition-colors rounded-lg p-2"
                            title="View Details & Permissions"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => navigate(`/admin-users/edit/${user.id}`)}
                            className="text-primary hover:bg-primary-light transition-colors rounded-lg p-2"
                            title="Edit Admin"
                          >
                            <Edit size={16} />
                          </button>

                          {!isSuper && (
                            <button
                              type="button"
                              onClick={() => handleDelete(user)}
                              className="text-danger hover:bg-danger/10 transition-colors rounded-lg p-2"
                              title="Delete Admin"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </Table>
          </div>
        )}
      </Card>

      {/* Quick View Details & Permissions Modal */}
      {selectedAdmin && (
        <Modal
          isOpen={!!selectedAdmin}
          onClose={() => setSelectedAdmin(null)}
          title="Administrator Profile & Permissions"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6 pt-2">
            {/* Header Profile Section */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-50 border border-border">
              <Avatar
                src={selectedAdmin.profileImage || selectedAdmin.image}
                seed={selectedAdmin.name}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    {selectedAdmin.name}
                    <Badge
                      variant={roleColors[selectedAdmin.role] || "default"}
                      className="px-2 py-0.5 text-xs font-semibold"
                    >
                      {selectedAdmin.role}
                    </Badge>
                  </h3>
                  <Badge
                    variant={statusColors[selectedAdmin.status] || "default"}
                    className="rounded-full text-xs"
                  >
                    {selectedAdmin.status || "Active"}
                  </Badge>
                </div>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted">
                  <p>
                    <strong className="text-foreground">Email:</strong> {selectedAdmin.email}
                  </p>
                  <p>
                    <strong className="text-foreground">Phone:</strong> {selectedAdmin.phone || selectedAdmin.mobileNumber || "—"}
                  </p>
                  <p>
                    <strong className="text-foreground">Department:</strong> {selectedAdmin.department || "Operations"}
                  </p>
                  <p>
                    <strong className="text-foreground">ID:</strong> {selectedAdmin.id || selectedAdmin.userId}
                  </p>
                </div>
              </div>
            </div>

            {/* Assigned Permissions Matrix */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" />
                  Assigned Module Permissions
                </h4>
                {selectedAdmin.role === ROLES.SUPER_ADMIN ? (
                  <span className="text-xs text-danger font-semibold bg-danger/10 px-2 py-0.5 rounded">
                    Full Unrestricted System Access
                  </span>
                ) : (
                  <span className="text-xs text-muted">
                    {Array.isArray(selectedAdmin.permissions) ? selectedAdmin.permissions.length : 0} of{" "}
                    {MODULE_PERMISSIONS.length} modules granted
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {MODULE_PERMISSIONS.map((mod) => {
                  const isGranted =
                    selectedAdmin.role === ROLES.SUPER_ADMIN ||
                    (Array.isArray(selectedAdmin.permissions) &&
                      (selectedAdmin.permissions.includes("all") ||
                        selectedAdmin.permissions.includes(mod.id)));

                  return (
                    <div
                      key={mod.id}
                      className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs transition-colors ${
                        isGranted
                          ? "bg-success/5 border-success/30 text-foreground"
                          : "bg-background/50 border-border/60 text-muted opacity-60"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                          isGranted
                            ? "bg-success text-white"
                            : "bg-surface border border-border text-muted"
                        }`}
                      >
                        {isGranted ? <Check size={10} strokeWidth={3} /> : <X size={10} />}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-semibold ${isGranted ? "text-foreground" : "text-muted"}`}>
                          {mod.label}
                        </p>
                        <p className="text-[11px] text-muted line-clamp-1 mt-0.5">
                          {mod.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedAdmin(null)}
              >
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const adminId = selectedAdmin.id;
                  setSelectedAdmin(null);
                  navigate(`/admin-users/edit/${adminId}`);
                }}
                className="bg-primary hover:bg-primary-hover text-white"
              >
                <Edit size={14} className="mr-1.5" />
                Edit Profile & Permissions
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
