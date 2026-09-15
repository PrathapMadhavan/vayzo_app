import { useState, useEffect } from "react";
import { Download, RefreshCw, Eye, Calendar, Laptop, Info, Edit, Trash2 } from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import DateRangeInput from "../components/ui/DateRangeInput";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import ActionMenu from "../components/ui/ActionMenu";
import { getActivityLogs, deleteActivityLog } from "../api/activityLogsApi";

function ActivityLogs() {
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("All Actions");
  const [module, setModule] = useState("All Modules");
  const [dateRange, setDateRange] = useState([null, null]);
  
  const [logsData, setLogsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Modal State
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLogsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [startDate, endDate] = dateRange;
      const formattedStart = startDate ? startDate.toISOString() : null;
      const formattedEnd = endDate ? endDate.toISOString() : null;

      const data = await getActivityLogs({
        searchQuery: query,
        action,
        module,
        startDate: formattedStart,
        endDate: formattedEnd
      });

      setLogsData(data);
      setCurrentPage(1); // Reset to page 1 when filtering
    } catch (err) {
      setError(err.message || "Failed to load activity logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLogsData();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, action, module, dateRange]);

  const handleResetFilters = () => {
    setQuery("");
    setAction("All Actions");
    setModule("All Modules");
    setDateRange([null, null]);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Activity logs exported successfully.");
    }, 1500);
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleEdit = (log) => {
    alert(`Editing activity log ${log.id}`);
  };

  const handleDelete = async (log) => {
    if (window.confirm(`Are you sure you want to delete this activity log?`)) {
      try {
        await deleteActivityLog(log.id);
        fetchLogsData(); // Refresh the list
      } catch (err) {
        alert("Failed to delete activity log: " + err.message);
      }
    }
  };

  const moduleColors = {
    "Categories": "info",
    "Offers": "success",
    "Complaints": "warning",
    "Restaurants": "primary",
    "Users": "danger",
    "Admin Users": "danger",
    "System": "default",
    "Settings": "default",
    "Orders": "info",
    "Reports": "success",
    "Delivery": "warning"
  };
  
  const actionColors = {
    "LOGIN": "success",
    "CREATE": "primary",
    "UPDATE": "warning",
    "DELETE": "danger",
    "VIEW": "info",
    "EXPORT": "default"
  };

  const statusColors = {
    "Success": "success",
    "Failed": "danger"
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).format(date);
  };

  // Pagination Logic
  const totalPages = Math.ceil(logsData.length / itemsPerPage);
  const currentData = logsData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const tableHeaders = [
    "Date & Time",
    "Admin/User",
    "Action",
    "Module",
    "Description",
    "IP Address",
    "Status",
    "Details"
  ];

  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Activity Logs</h1>
          <p className="mt-1 text-xs text-muted">Track and monitor admin activity across the VAYZO platform.</p>
        </div>

        {/* Unified Filter/Action Card */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex flex-col xl:flex-row items-end gap-3 z-50 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            <div className="w-full relative">
              <label className="text-xs font-medium text-muted mb-1.5 block">Search</label>
              <Input
                id="activity-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search user, action, details..."
                className="h-10 text-sm w-full"
              />
            </div>
            <div className="w-full">
              <DateRangeInput
                label="Date Range"
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                onChange={setDateRange}
                placeholder="Select date range"
              />
            </div>
            <div className="w-full">
              <label className="text-xs font-medium text-muted mb-1.5 block">Action</label>
              <Select
                id="activity-action"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="h-10 text-sm w-full"
              >
                <option value="All Actions">All Actions</option>
                <option value="LOGIN">LOGIN</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="VIEW">VIEW</option>
                <option value="EXPORT">EXPORT</option>
              </Select>
            </div>
            <div className="w-full">
              <label className="text-xs font-medium text-muted mb-1.5 block">Module</label>
              <Select
                id="activity-module"
                value={module}
                onChange={(e) => setModule(e.target.value)}
                className="h-10 text-sm w-full"
              >
                <option value="All Modules">All Modules</option>
                <option value="System">System</option>
                <option value="Settings">Settings</option>
                <option value="Users">Users</option>
                <option value="Admin Users">Admin Users</option>
                <option value="Orders">Orders</option>
                <option value="Restaurants">Restaurants</option>
                <option value="Reports">Reports</option>
                <option value="Delivery">Delivery</option>
                <option value="Categories">Categories</option>
                <option value="Offers">Offers</option>
                <option value="Complaints">Complaints</option>
              </Select>
            </div>
          </div>
          
          <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-3 mt-3 xl:mt-0 ml-auto shrink-0">
            <Button variant="secondary" className="h-10 w-full sm:w-auto px-5" onClick={handleResetFilters}>
              <RefreshCw size={14} className="mr-2" /> Reset
            </Button>
            <Button className="h-10 w-full sm:w-auto px-5 bg-[#4a00e0] hover:bg-[#3b00b3] text-white" onClick={handleExport} disabled={isExporting}>
              <Download size={14} className="mr-2" /> {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-surface">
             <div className="flex flex-col items-center gap-3">
               <RefreshCw className="h-8 w-8 animate-spin text-primary" />
               <p className="text-sm font-medium text-muted">Loading activity logs...</p>
             </div>
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface text-center">
             <p className="text-sm text-danger font-medium">{error}</p>
             <Button onClick={fetchLogsData} variant="secondary" size="sm">Try Again</Button>
          </div>
        ) : (
          /* Table Section */
          <div className="mt-4">
            <Table
              headers={tableHeaders}
              currentCount={currentData.length}
              totalCount={logsData.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              minWidth="1050px"
            >
              {logsData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-sm text-muted">
                    No activity logs found matching your filters.
                  </td>
                </tr>
              ) : (
                currentData.map((log) => (
                  <tr key={log.id} className="border-t border-border hover:bg-surface-50 transition-colors text-sm">
                    <td className="px-4 py-4 text-muted whitespace-nowrap text-xs">{formatDate(log.timestamp)}</td>
                    <td className="px-4 py-4 font-medium text-foreground whitespace-nowrap">{log.user}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge variant={actionColors[log.action] || "default"} className="px-2 py-0.5 rounded-md font-medium text-[10px] tracking-wider">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge variant={moduleColors[log.module] || "default"} className="h-5 text-[10px] bg-background border-border text-foreground px-2">
                        {log.module}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-muted min-w-[250px] truncate max-w-xs" title={log.details}>
                      {log.details}
                    </td>
                    <td className="px-4 py-4 text-muted whitespace-nowrap font-mono text-xs">{log.ipAddress}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge variant={statusColors[log.status] || "default"} className="border-none rounded-full px-2">
                        {log.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center sm:text-left">
                      <ActionMenu
                        actions={[
                          { label: "View", icon: Eye, onClick: () => handleViewDetails(log) },
                          { label: "Edit", icon: Edit, onClick: () => handleEdit(log) },
                          { label: "Delete", icon: Trash2, danger: true, onClick: () => handleDelete(log) }
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </Table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Activity Log Details">
        {selectedLog && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                 <Badge variant={actionColors[selectedLog.action] || "default"} className="text-xs">
                   {selectedLog.action}
                 </Badge>
                 <Badge variant={moduleColors[selectedLog.module] || "default"} className="text-xs bg-background">
                   {selectedLog.module}
                 </Badge>
              </div>
              <Badge variant={statusColors[selectedLog.status] || "default"} className="rounded-full">
                {selectedLog.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted mb-1 flex items-center gap-1.5"><Info size={12} /> Log ID</p>
                <p className="font-medium text-foreground">{selectedLog.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1 flex items-center gap-1.5"><Calendar size={12} /> Date & Time</p>
                <p className="font-medium text-foreground">{formatDate(selectedLog.timestamp)}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Admin/User</p>
                <p className="font-medium text-foreground">{selectedLog.user}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1 flex items-center gap-1.5"><Laptop size={12} /> IP Address</p>
                <p className="font-mono text-foreground text-xs pt-0.5">{selectedLog.ipAddress}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-muted mb-1.5">Description</p>
              <div className="p-3 bg-background rounded-lg border border-border text-sm text-foreground leading-relaxed">
                {selectedLog.details}
              </div>
            </div>

            <div className="mt-6 flex justify-end pt-4 border-t border-border">
              <Button onClick={() => setIsModalOpen(false)} variant="secondary" className="px-6">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}

export default ActivityLogs;
