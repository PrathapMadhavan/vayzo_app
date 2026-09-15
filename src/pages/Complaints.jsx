import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle, Clock, Search, X, MessageSquare, AlertTriangle, FileText, User, RotateCcw, Trash2, Eye, Download, Plus } from "lucide-react";
import Avatar from "../components/ui/Avatar";

import Badge from "../components/ui/Badge";
import BadgeCell from "../components/ui/BadgeCell";
import Button from "../components/ui/Button";
import SearchInput from "../components/ui/SearchInput";
import StatusSelect from "../components/ui/StatusSelect";
import Table from "../components/ui/Table";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import Modal from "../components/ui/Modal";
import ActionMenu from "../components/ui/ActionMenu";
import DateRangeInput from "../components/ui/DateRangeInput";
import FilterPanel from "../components/ui/FilterPanel";

import { getComplaints, updateComplaint, deleteComplaint } from "../api/complaintsApi";
import { exportToCSV } from "../utils/exportUtils";

const statusBadgeMap = {
  Open: "danger",
  "In Progress": "warning",
  Resolved: "success",
  Closed: "default",
};

const priorityBadgeMap = {
  High: "danger",
  Medium: "warning",
  Low: "info",
};

const statusOptions = ["All Status", "Open", "In Progress", "Resolved", "Closed"];
const priorityOptions = ["All Priority", "High", "Medium", "Low"];
const typeOptions = ["All Types", "Customer", "Delivery Partner", "Merchant"];

const tableHeaders = [
  "No.",
  "Complaint ID",
  "Date",
  "Reported By",
  "User Type",
  "Issue Type",
  "Priority",
  "Status",
  "Actions",
];

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");
  const [priority, setPriority] = useState("All Priority");
  const [userType, setUserType] = useState("All Types");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Selection
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState(null);

  // Pending drawer form state (not persisted until Update clicked)
  const [pendingStatus, setPendingStatus] = useState("");
  const [pendingAssignTo, setPendingAssignTo] = useState("");
  const [pendingPriority, setPendingPriority] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  const assignOptions = ["Support Agent 1", "Support Agent 2", "Support Agent 3", "Manager", "Unassigned"];
  const drawerPriorityOptions = ["High", "Medium", "Low"];

  const openDrawer = (complaint) => {
    setSelectedComplaint(complaint);
    setPendingStatus(complaint.status);
    setPendingAssignTo(complaint.assignTo || "Unassigned");
    setPendingPriority(complaint.priority || "Medium");
    setUpdateError("");
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setUpdateError("");
  };

  useEffect(() => {
    let isMounted = true;
    const loadComplaints = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getComplaints();
        if (isMounted) {
          setComplaints(data);
          // Do NOT auto-open the drawer — user must click View Details
        }
      } catch (err) {
        if (isMounted) setError("Failed to load complaints");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadComplaints();
    return () => { isMounted = false; };
  }, []);

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;
    setUpdateLoading(true);
    setUpdateError("");
    try {
      const updated = {
        ...selectedComplaint,
        status: pendingStatus,
        assignTo: pendingAssignTo,
        priority: pendingPriority,
      };
      await updateComplaint(selectedComplaint.id, updated);
      setComplaints(prev => prev.map(c => c.id === selectedComplaint.id ? updated : c));
      setSelectedComplaint(updated);
    } catch (err) {
      setUpdateError("Failed to update. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const filteredComplaints = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return complaints.filter((c) => {
      const matchesSearch = !searchValue ||
        c.complaintId?.toLowerCase().includes(searchValue) ||
        c.userName?.toLowerCase().includes(searchValue);

      const matchesStatus = status === "All Status" || c.status === status;
      const matchesPriority = priority === "All Priority" || c.priority === priority;
      const matchesType = userType === "All Types" || c.userType === userType;

      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });
  }, [complaints, search, status, priority, userType]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const maxStatus = useMemo(() => {
    return paginatedComplaints.reduce((max, c) => {
      const val = c.status || "--";
      return val.length > max.length ? val : max;
    }, "");
  }, [paginatedComplaints]);

  const maxPriority = useMemo(() => {
    return paginatedComplaints.reduce((max, c) => {
      const val = c.priority || "--";
      return val.length > max.length ? val : max;
    }, "");
  }, [paginatedComplaints]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, priority, userType]);

  const hasFilters =
    search ||
    status !== "All Status" ||
    priority !== "All Priority" ||
    userType !== "All Types" ||
    fromDate ||
    toDate;

  const resetFilters = () => {
    setSearch("");
    setStatus("All Status");
    setPriority("All Priority");
    setUserType("All Types");
    setFromDate("");
    setToDate("");
  };

  const handleDeleteComplaint = async () => {
    if (!deleteModalId) return;
    try {
      await deleteComplaint(deleteModalId);
      setComplaints((prev) => prev.filter((c) => c.id !== deleteModalId));
      if (selectedComplaint?.id === deleteModalId) {
        setSelectedComplaint(null);
      }
      setDeleteModalId(null);
      const newFilteredLength = filteredComplaints.length - 1;
      const newTotalPages = Math.ceil(newFilteredLength / itemsPerPage) || 1;
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete complaint.");
    }
  };

  const stats = [
    { title: "Total Complaints", value: complaints.length, icon: MessageSquare, color: "text-primary", bg: "bg-primary/10", trend: "12.5%", isNegative: false },
    { title: "Open Issues", value: complaints.filter(c => c.status === "Open").length, icon: AlertCircle, color: "text-danger", bg: "bg-danger/10", trend: "8.3%", isNegative: false },
    { title: "In Progress", value: complaints.filter(c => c.status === "In Progress").length, icon: Clock, color: "text-warning", bg: "bg-warning/10", trend: "15.7%", isNegative: false },
    { title: "Resolved", value: complaints.filter(c => c.status === "Resolved" || c.status === "Closed").length, icon: CheckCircle, color: "text-success", bg: "bg-success/10", trend: "18.2%", isNegative: false },
  ];

  return (
    <section className="min-h-full bg-background p-4 sm:p-6 relative">

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            colorClass={stat.color}
            bgClass={stat.bg}
            trend={stat.trend}
            isNegative={stat.isNegative}
            variant="horizontal"
          />
        ))}
      </div>

      <div className={`grid gap-6 grid-cols-1 items-start`}>
        <div className="flex flex-col gap-6 min-w-0">
          <Card noPadding className="flex flex-col mb-2">
            <FilterPanel
              search={
                <SearchInput
                  id="complaint-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by ID or name..."
                />
              }
              actions={
                <Button
                  variant="secondary"
                  className="px-4 h-10 w-full xl:w-auto shrink-0 shadow-sm"
                  onClick={() => exportToCSV(filteredComplaints, "complaints.csv")}
                >
                  <Download size={16} className="mr-1" /> Export
                </Button>
              }
              filters={
                <>
                  <StatusSelect
                    id="c-status"
                    value={status}
                    options={statusOptions}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full lg:w-[150px]"
                  />
                  <StatusSelect
                    id="c-priority"
                    value={priority}
                    options={priorityOptions}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full lg:w-[150px]"
                  />
                  <StatusSelect
                    id="c-type"
                    value={userType}
                    options={typeOptions}
                    onChange={(e) => setUserType(e.target.value)}
                    className="w-full lg:w-[160px]"
                  />
                  <DateRangeInput
                    id="complaints-date"
                    fromValue={fromDate}
                    toValue={toDate}
                    onFromChange={(e) => setFromDate(e.target.value)}
                    onToChange={(e) => setToDate(e.target.value)}
                    className="w-full lg:w-[250px]"
                  />
                </>
              }
              hasActiveFilters={hasFilters}
              onReset={resetFilters}
            />
          </Card>

          <Card noPadding className="flex flex-col overflow-x-auto min-w-0">
            {error ? (
              <div className="m-6 rounded-xl border border-danger/30 bg-danger/5 p-8 text-center text-sm font-medium text-danger">
                {error}
              </div>
            ) : (
              <Table
                headers={tableHeaders}
                currentCount={paginatedComplaints.length}
                totalCount={filteredComplaints.length}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                minWidth="900px"
                className="border-0 shadow-none rounded-none"
              >
                {loading ? (
                  <tr>
                    <td colSpan={tableHeaders.length} className="p-10 text-center text-sm text-muted">
                      Loading complaints...
                    </td>
                  </tr>
                ) : paginatedComplaints.length ? (
                  paginatedComplaints.map((c, index) => (
                    <tr 
                      key={c.id} 
                      onClick={() => openDrawer(c)} 
                      className="border-b border-border hover:bg-surface-50 transition-colors cursor-pointer"
                    >
                      <td className="whitespace-nowrap px-3 py-3 font-medium text-foreground">
                        {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, "0")}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 font-medium text-primary">
                        {c.complaintId}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted">{c.date}</td>
                      <td className="px-3 py-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="h-8 w-8 rounded-full overflow-hidden shrink-0 border border-border">
                            <Avatar src={c.avatar} alt={c.userName} identifier={c.userId} className="h-full w-full object-cover" />
                          </div>
                          <span className="truncate font-medium text-foreground">
                            {c.userName}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted">{c.userType}</td>
                      <td className="px-3 py-3 text-muted">{c.issueType}</td>
                      <td className="px-3 py-3">
                        <BadgeCell
                          maxContent={maxPriority}
                          content={c.priority}
                          variant={
                            c.priority === "High"
                              ? "danger"
                              : c.priority === "Medium"
                                ? "warning"
                                : "default"
                          }
                          className="px-3"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <BadgeCell
                          maxContent={maxStatus}
                          content={c.status}
                          variant={
                            c.status === "Open"
                              ? "warning"
                              : c.status === "In Progress"
                                ? "info"
                                : "success"
                          }
                          className="px-3"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end pr-2">
                          <ActionMenu
                            actions={[
                              {
                                label: "View Details",
                                icon: Eye,
                                onClick: () => openDrawer(c),
                              },
                              {
                                label: "Delete",
                                icon: Trash2,
                                danger: true,
                                onClick: () => setDeleteModalId(c.id),
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={tableHeaders.length} className="p-10 text-center text-sm text-muted">
                      No complaints found.
                    </td>
                  </tr>
                )}
              </Table>
            )}
          </Card>
        </div>

        {/* Drawer Backdrop */}
        {drawerOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity" 
            onClick={closeDrawer} 
          />
        )}

        {/* Right-Side Drawer */}
        <div 
          className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-surface border-l border-border shadow-2xl transform transition-transform duration-300 flex flex-col ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {drawerOpen && selectedComplaint && (
            <>
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-5 border-b border-border bg-background">
                <h2 className="text-lg font-bold text-foreground">Complaint Details</h2>
                <button 
                  onClick={closeDrawer}
                  className="h-8 w-8 rounded-md flex items-center justify-center text-muted hover:bg-surface-hover hover:text-foreground transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* ID and Status Row */}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="px-3 py-1 font-medium bg-secondary text-secondary-foreground">{selectedComplaint.complaintId}</Badge>
                  <Badge variant={statusBadgeMap[selectedComplaint.status] || "default"} className="px-3 py-1">
                    {selectedComplaint.status}
                  </Badge>
                </div>

                {/* Raised By */}
                <div>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Raised By</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 border border-border">
                        <Avatar src={selectedComplaint.avatar} alt={selectedComplaint.userName} identifier={selectedComplaint.userId} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm">{selectedComplaint.userName}</p>
                        <p className="text-xs text-muted font-medium">+91 98765 43210</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="h-8 w-8 flex items-center justify-center rounded-full border border-border text-muted hover:text-primary transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      </button>
                      <button className="h-8 w-8 flex items-center justify-center rounded-full border border-border text-muted hover:text-primary transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/50" />

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-y-4 text-sm">
                  <div>
                    <span className="block text-xs font-medium text-muted mb-1">Type</span>
                    <span className="font-medium text-foreground">{selectedComplaint.userType}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-muted mb-1">Category</span>
                    <span className="font-medium text-foreground">{selectedComplaint.issueType}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-muted mb-1">Related To</span>
                    <span className="font-medium text-foreground block">Order #ORD12458</span>
                    <span className="text-xs text-muted">ABC Cafe</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-muted mb-1">Order Date</span>
                    <span className="font-medium text-foreground">{selectedComplaint.date}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-xs font-medium text-muted mb-1">Complaint Date</span>
                    <span className="font-medium text-foreground">{selectedComplaint.date}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    {selectedComplaint.description || "My order is very late. It was supposed to be delivered by 9:45 AM but I received at 10:25 AM. Please take necessary action."}
                  </p>
                </div>

                {/* Attachments */}
                <div>
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Attachments</h3>
                  <div className="flex gap-3">
                    <div className="h-16 w-16 bg-surface-hover rounded-lg border border-border overflow-hidden">
                       <div className="h-full w-full bg-muted/20 flex items-center justify-center text-muted">Img</div>
                    </div>
                    <button className="h-16 w-16 rounded-lg border border-dashed border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary transition-colors">
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                <div className="border-t border-border/50" />

                {/* Form Controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Status</label>
                    <StatusSelect 
                      options={statusOptions.filter(o => o !== "All Status")}
                      value={pendingStatus}
                      onChange={(e) => setPendingStatus(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-foreground mb-1">Assign To</label>
                      <StatusSelect
                        options={assignOptions}
                        value={pendingAssignTo}
                        onChange={(e) => setPendingAssignTo(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-foreground mb-1">Priority</label>
                      <StatusSelect
                        options={drawerPriorityOptions}
                        value={pendingPriority}
                        onChange={(e) => setPendingPriority(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Internal Note</label>
                    <textarea 
                      placeholder="Add internal note..."
                      className="w-full min-h-[80px] p-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t border-border bg-background flex flex-col gap-3">
                {updateError && (
                  <p className="text-xs text-danger">{updateError}</p>
                )}
                <div className="flex items-center gap-3">
                  <Button variant="secondary" className="flex-1" onClick={closeDrawer}>Close</Button>
                  <Button className="flex-1" onClick={handleUpdateComplaint} disabled={updateLoading}>
                    {updateLoading ? "Updating..." : "Update"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal 
        isOpen={!!deleteModalId} 
        onClose={() => setDeleteModalId(null)} 
        title="Delete Complaint"
      >
        <p className="text-sm text-muted">Are you sure you want to delete this complaint? This action cannot be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModalId(null)}>Cancel</Button>
          <Button className="bg-danger hover:bg-danger/90 text-white" onClick={handleDeleteComplaint}>Delete</Button>
        </div>
      </Modal>
    </section>
  );
}

export default Complaints;
