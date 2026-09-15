import { useState, useEffect } from "react";
import { Search, ShieldUser, RefreshCw, Trash2, Edit, Eye, UserPlus, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Table from "../components/ui/Table";
import Avatar from "../components/ui/Avatar";
import { getAdminUsers, deleteAdminUser } from "../api/adminUsersApi";

function AdminUsers() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All Roles");
  const [status, setStatus] = useState("All Status");
  const [adminUsersData, setAdminUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchAdminUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers({ searchQuery: query, role, status });
      setAdminUsersData(data);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "Failed to load admin users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Adding debounce for search query
    const delayDebounceFn = setTimeout(() => {
      fetchAdminUsers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, role, status]);

  const handleResetFilters = () => {
    setQuery("");
    setRole("All Roles");
    setStatus("All Status");
  };

  const handleDelete = async (user) => {
    if (user.role === "Super Admin") {
      alert("Super Admin cannot be deleted.");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        await deleteAdminUser(user.id);
        fetchAdminUsers(); // Refresh list
      } catch (err) {
        alert(err.message || "Failed to delete user");
      }
    }
  };

  const roleColors = {
    "Super Admin": "danger",
    "Admin": "warning"
  };

  const statusColors = {
    Active: "success",
    Inactive: "default",
  };

  // Check if Add User should be disabled
  // We fetch total count regardless of filters to accurately assess limits
  const [totalAdminCount, setTotalAdminCount] = useState(0);
  useEffect(() => {
    const checkTotalLimit = async () => {
      try {
        const allAdmins = await getAdminUsers();
        setTotalAdminCount(allAdmins.length);
      } catch (e) {
        console.error(e);
      }
    };
    checkTotalLimit();
  }, [adminUsersData]); // re-check when table data changes

  // Pagination logic
  const totalPages = Math.ceil(adminUsersData.length / itemsPerPage);
  const currentData = adminUsersData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const tableHeaders = [
    "Admin User",
    "Email",
    "Role",
    "Department",
    "Phone",
    "Status",
    "Last Login",
    "Joined Date",
    "Actions"
  ];

  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Admin Users</h1>
          <p className="mt-1 text-xs text-muted">Manage admin users and their access.</p>
        </div>

        {totalAdminCount >= 2 && (
          <div className="flex items-start gap-3 rounded-lg bg-danger/10 p-4 border border-danger/20 text-danger-dark">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Maximum Admin Limit Reached</p>
              <p className="mt-1 text-xs">The system allows exactly ONE Super Admin and ONE Admin. You cannot create more admin users.</p>
            </div>
          </div>
        )}

        {/* Filter/Search Card */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex flex-col md:flex-row items-end gap-3 z-50 relative">
          <div className="w-full md:w-auto flex-1 relative">
            <label className="text-xs font-medium text-muted mb-1.5 block">Search</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <Input
                id="admin-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or email..."
                className="h-10 text-sm pl-9 w-full"
              />
            </div>
          </div>
          <div className="w-full md:w-auto">
            <label className="text-xs font-medium text-muted mb-1.5 block">Role</label>
            <Select
              id="admin-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-10 text-sm min-w-[140px] w-full"
            >
              <option value="All Roles">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
            </Select>
          </div>
          <div className="w-full md:w-auto">
            <label className="text-xs font-medium text-muted mb-1.5 block">Status</label>
            <Select
              id="admin-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 text-sm min-w-[140px] w-full"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </div>
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 mt-2 md:mt-0">
            <Button variant="secondary" className="h-10 w-full sm:w-auto" onClick={handleResetFilters}>
              <RefreshCw size={14} className="mr-2" /> Reset
            </Button>
            <Button 
              className={`h-10 w-full sm:w-auto ${totalAdminCount >= 2 ? 'opacity-50 cursor-not-allowed bg-muted text-white' : 'bg-[#4a00e0] hover:bg-[#3b00b3] text-white'}`}
              onClick={() => {
                if (totalAdminCount < 2) {
                  navigate("/admin-users/add");
                }
              }}
              disabled={totalAdminCount >= 2}
            >
              <UserPlus size={14} className="mr-2" /> Add Admin User
            </Button>
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-surface">
             <div className="flex flex-col items-center gap-3">
               <RefreshCw className="h-8 w-8 animate-spin text-primary" />
               <p className="text-sm font-medium text-muted">Loading admin users...</p>
             </div>
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface text-center">
             <p className="text-sm text-danger font-medium">{error}</p>
             <Button onClick={fetchAdminUsers} variant="secondary" size="sm">Try Again</Button>
          </div>
        ) : (
          /* Table Section */
          <div className="mt-4">
            <Table
              headers={tableHeaders}
              currentCount={currentData.length}
              totalCount={adminUsersData.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              minWidth="1050px"
            >
              {adminUsersData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-sm text-muted">
                    No admin users found matching your filters.
                  </td>
                </tr>
              ) : (
                currentData.map((user) => (
                  <tr key={user.id} className="border-t border-border hover:bg-surface-50 transition-colors text-sm">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar seed={user.name} size="sm" />
                        <div>
                          <p className="font-semibold text-foreground">{user.name}</p>
                          <p className="text-xs text-muted">ID: {user.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted whitespace-nowrap">{user.email}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge variant={roleColors[user.role] || "default"} className="px-2 py-0.5 rounded-md font-medium text-[11px]">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-muted whitespace-nowrap">{user.department}</td>
                    <td className="px-4 py-4 text-muted whitespace-nowrap">{user.phone}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge variant={statusColors[user.status] || "default"} className="border-none rounded-full">
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-muted whitespace-nowrap text-xs">{user.lastLogin}</td>
                    <td className="px-4 py-4 text-muted whitespace-nowrap text-xs">{user.joinedDate}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => navigate(`/admin-users/edit/${user.id}`)} className="text-primary hover:bg-primary-light transition-colors rounded-md p-1.5" title="View/Edit">
                          <Edit size={16} />
                        </button>
                        {user.role !== "Super Admin" && (
                          <button type="button" onClick={() => handleDelete(user)} className="text-danger hover:bg-danger/10 transition-colors rounded-md p-1.5" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </Table>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminUsers;
