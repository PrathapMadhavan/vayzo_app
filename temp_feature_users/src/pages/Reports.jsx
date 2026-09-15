import { useState, useEffect } from "react";
import { Download, RefreshCw, DollarSign, Package, Users, Percent, Edit, Trash2 } from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import DateRangeInput from "../components/ui/DateRangeInput";
import StatCard from "../components/ui/StatCard";
import Table from "../components/ui/Table";
import ActionMenu from "../components/ui/ActionMenu";
import { getReports, getReportSummary, deleteReport } from "../api/reportsApi";

function Reports() {
  const [reportType, setReportType] = useState("All");
  const [status, setStatus] = useState("All Status");
  const [dateRange, setDateRange] = useState([null, null]);
  const [reportsData, setReportsData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchReportsData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [startDate, endDate] = dateRange;
      const formattedStart = startDate ? startDate.toISOString() : null;
      const formattedEnd = endDate ? endDate.toISOString() : null;

      const [reportsResp, summaryResp] = await Promise.all([
        getReports({ reportType, status, startDate: formattedStart, endDate: formattedEnd }),
        getReportSummary(),
      ]);

      // Handle custom local filtering for status since mock API doesn't fully support it
      let filteredReports = reportsResp;
      if (status !== "All Status") {
        filteredReports = filteredReports.filter(r => r.status === status);
      }

      setReportsData(filteredReports);
      setSummaryData(summaryResp);
      setCurrentPage(1); // Reset page on filter change
    } catch (err) {
      setError(err.message || "Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [reportType, status, dateRange]);

  const handleResetFilters = () => {
    setReportType("All");
    setStatus("All Status");
    setDateRange([null, null]);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      // Mock safe export behavior
      alert("Report successfully downloaded as CSV.");
    }, 1500);
  };

  const handleView = (report) => {
    alert(`Viewing details for ${report.title}`);
  };

  const handleEdit = (report) => {
    alert(`Editing report ${report.title}`);
  };

  const handleDelete = async (report) => {
    if (window.confirm(`Are you sure you want to delete "${report.title}"?`)) {
      try {
        await deleteReport(report.id);
        fetchReportsData(); // Refresh the list
      } catch (err) {
        alert("Failed to delete report: " + err.message);
      }
    }
  };

  const badgeVariant = {
    Completed: "success",
    Processing: "warning",
    Failed: "danger",
    Sales: "primary",
    Orders: "info",
    Revenue: "success",
    Commission: "warning",
    Users: "danger",
    Delivery: "info"
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatNumber = (val) => {
    return new Intl.NumberFormat("en-IN").format(val || 0);
  };

  const statCards = summaryData ? [
    { label: "Total Revenue", value: formatCurrency(summaryData.totalRevenue), trend: summaryData.trends?.totalRevenue, icon: DollarSign, colorClass: "text-success", bgClass: "bg-success/10" },
    { label: "Total Orders", value: formatNumber(summaryData.totalOrders), trend: summaryData.trends?.totalOrders, icon: Package, colorClass: "text-primary", bgClass: "bg-primary/10" },
    { label: "Total Users", value: formatNumber(summaryData.totalUsers), trend: summaryData.trends?.totalUsers, icon: Users, colorClass: "text-info", bgClass: "bg-info/10" },
    { label: "Total Commission", value: formatCurrency(summaryData.totalCommission), trend: summaryData.trends?.totalCommission, icon: Percent, colorClass: "text-warning", bgClass: "bg-warning/10" },
  ] : [];

  // Pagination logic
  const totalPages = Math.ceil(reportsData.length / itemsPerPage);
  const currentData = reportsData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const tableHeaders = [
    "Date",
    "Report Type",
    "Title",
    "Total Amount",
    "Orders",
    "Users",
    "Status",
    "Action"
  ];

  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="space-y-4">
        {/* Title without the unnecessary top box actions */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
          <p className="mt-1 text-xs text-muted">Generate and analyze business reports.</p>
        </div>

        {/* Unified Filter/Action Card */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm flex flex-col md:flex-row items-end gap-3 z-10 relative">
          <div className="w-full md:w-auto flex-1">
             <DateRangeInput
               label="Date Range"
               startDate={dateRange[0]}
               endDate={dateRange[1]}
               onChange={setDateRange}
               placeholder="Select date range"
             />
          </div>
          <div className="w-full md:w-auto">
            <label className="text-xs font-medium text-muted mb-1.5 block">Report Type</label>
            <Select
              id="report-type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="h-10 text-sm min-w-[150px] w-full"
            >
              <option value="All">All Reports</option>
              <option value="Sales">Sales</option>
              <option value="Orders">Orders</option>
              <option value="Revenue">Revenue</option>
              <option value="Commission">Commission</option>
              <option value="Users">Users</option>
            </Select>
          </div>
          <div className="w-full md:w-auto">
            <label className="text-xs font-medium text-muted mb-1.5 block">Status</label>
            <Select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 text-sm min-w-[150px] w-full"
            >
              <option value="All Status">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Processing">Processing</option>
              <option value="Failed">Failed</option>
            </Select>
          </div>
          <div className="w-full md:w-auto flex gap-3 mt-2 md:mt-0">
            <Button variant="secondary" className="h-10 w-full sm:w-auto" onClick={handleResetFilters}>
              <RefreshCw size={14} className="mr-2" /> Reset
            </Button>
            <Button className="h-10 w-full sm:w-auto bg-[#4a00e0] hover:bg-[#3b00b3] text-white" onClick={handleExport} disabled={isExporting}>
              <Download size={14} className="mr-2" /> {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-surface">
             <div className="flex flex-col items-center gap-3">
               <RefreshCw className="h-8 w-8 animate-spin text-primary" />
               <p className="text-sm font-medium text-muted">Loading reports...</p>
             </div>
          </div>
        ) : error ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface text-center">
             <p className="text-sm text-danger font-medium">{error}</p>
             <Button onClick={fetchReportsData} variant="secondary" size="sm">Try Again</Button>
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
               {statCards.map((stat, i) => (
                 <StatCard
                   key={i}
                   title={stat.label}
                   value={stat.value}
                   trend={stat.trend}
                   icon={stat.icon}
                   colorClass={stat.colorClass}
                   bgClass={stat.bgClass}
                   variant="horizontal"
                 />
               ))}
            </div>

            {/* Reports Details Table */}
            <div className="mt-4">
              <h2 className="text-sm font-semibold text-foreground mb-3">Report Details</h2>
              <Table
                headers={tableHeaders}
                currentCount={currentData.length}
                totalCount={reportsData.length}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                minWidth="1000px"
              >
                {reportsData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-sm text-muted">
                      No reports found matching your filters.
                    </td>
                  </tr>
                ) : (
                  currentData.map((report) => (
                    <tr key={report.id} className="border-t border-border hover:bg-surface-50 transition-colors text-sm">
                      <td className="px-4 py-4 text-muted whitespace-nowrap">{report.date}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge variant={badgeVariant[report.reportType] || "default"} className="px-2 py-0.5 rounded-md font-medium">
                          {report.reportType}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-foreground font-medium whitespace-nowrap">{report.title}</td>
                      <td className="px-4 py-4 text-muted whitespace-nowrap">{formatCurrency(report.totalAmount)}</td>
                      <td className="px-4 py-4 text-muted whitespace-nowrap">{report.orders > 0 ? report.orders : "0"}</td>
                      <td className="px-4 py-4 text-muted whitespace-nowrap">{report.users > 0 ? report.users : "0"}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge variant={badgeVariant[report.status] || "default"} className="bg-success/10 text-success rounded-full border-none">
                          {report.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center sm:text-left">
                        <ActionMenu
                          actions={[
                            { label: "View", onClick: () => handleView(report) },
                            { label: "Edit", icon: Edit, onClick: () => handleEdit(report) },
                            { label: "Delete", icon: Trash2, danger: true, onClick: () => handleDelete(report) }
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </Table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Reports;
