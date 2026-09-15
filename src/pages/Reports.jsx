import { useState, useEffect } from "react";
import {
  Download,
  RefreshCw,
  DollarSign,
  Package,
  Users,
  Percent,
  Edit,
  Trash2,
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import DateRangeInput from "../components/ui/DateRangeInput";
import StatCard from "../components/ui/StatCard";
import Table from "../components/ui/Table";
import ActionMenu from "../components/ui/ActionMenu";
import FilterPanel from "../components/ui/FilterPanel";
import Card from "../components/ui/Card";
import { exportToCSV } from "../utils/exportUtils";
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
        getReports({
          reportType,
          status,
          startDate: formattedStart,
          endDate: formattedEnd,
        }),
        getReportSummary(),
      ]);

      // Handle custom local filtering for status since mock API doesn't fully support it
      let filteredReports = reportsResp;
      if (status !== "All Status") {
        filteredReports = filteredReports.filter((r) => r.status === status);
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
    Delivery: "info",
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



  // Pagination logic
  const totalPages = Math.ceil(reportsData.length / itemsPerPage);
  const currentData = reportsData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const tableHeaders = [
    "Date",
    "Report Type",
    "Title",
    "Total Amount",
    "Orders",
    "Users",
    "Status",
    "Action",
  ];

  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="space-y-4">
        {/* Unified Filter/Action Card */}
        <Card noPadding className="flex flex-col">
          <FilterPanel
            actions={
              <Button
                variant="secondary"
                size="sm"
                type="button"
                className="h-10 w-full sm:w-auto"
                onClick={() => exportToCSV(reportsData, "reports.csv")}
                disabled={isExporting}
              >
                <Download size={14} className="mr-1" /> Export
              </Button>
            }
            filters={
              <>
                <Select
                  id="report-type"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full sm:w-[150px]"
                >
                  <option value="All">All Reports</option>
                  <option value="Sales">Sales</option>
                  <option value="Orders">Orders</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Commission">Commission</option>
                  <option value="Users">Users</option>
                </Select>
                <Select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full sm:w-[150px]"
                >
                  <option value="All Status">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Processing">Processing</option>
                  <option value="Failed">Failed</option>
                </Select>
                <div className="w-full sm:w-auto">
                  <DateRangeInput
                    fromValue={dateRange[0]}
                    toValue={dateRange[1]}
                    onFromChange={(e) => setDateRange([e.target.value, dateRange[1]])}
                    onToChange={(e) => setDateRange([dateRange[0], e.target.value])}
                  />
                </div>
              </>
            }
            hasActiveFilters={reportType !== "All" || status !== "All Status" || dateRange[0] || dateRange[1]}
            onReset={handleResetFilters}
          />

          {/* Loading / Error States */}
          {isLoading ? (
            <div className="flex h-64 items-center justify-center bg-surface">
               <div className="flex flex-col items-center gap-3">
                 <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                 <p className="text-sm font-medium text-muted">Loading reports...</p>
               </div>
            </div>
          ) : error ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 bg-surface text-center">
               <p className="text-sm text-danger font-medium">{error}</p>
               <Button onClick={fetchReportsData} variant="secondary" size="sm">Try Again</Button>
            </div>
          ) : (
            <div className="flex-1 w-full flex flex-col min-h-0 overflow-hidden border-t border-border">
              <Table
                headers={tableHeaders}
                currentCount={currentData.length}
                totalCount={reportsData.length}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                minWidth="1000px"
                className="border-0 shadow-none rounded-none border-t-0"
              >
                {reportsData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-8 text-center text-sm text-muted"
                    >
                      No reports found matching your filters.
                    </td>
                  </tr>
                ) : (
                  currentData.map((report) => (
                    <tr
                      key={report.id}
                      onClick={() => handleView(report)}
                      className="border-t border-border hover:bg-surface-50 transition-colors text-sm cursor-pointer"
                    >
                      <td className="px-4 py-4 text-muted whitespace-nowrap">
                        {report.date}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge
                          variant={badgeVariant[report.reportType] || "default"}
                          className="px-2 py-0.5 rounded-md font-medium"
                        >
                          {report.reportType}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-foreground font-medium whitespace-nowrap">
                        {report.title}
                      </td>
                      <td className="px-4 py-4 text-muted whitespace-nowrap">
                        {formatCurrency(report.totalAmount)}
                      </td>
                      <td className="px-4 py-4 text-muted whitespace-nowrap">
                        {report.orders > 0 ? report.orders : "0"}
                      </td>
                      <td className="px-4 py-4 text-muted whitespace-nowrap">
                        {report.users > 0 ? report.users : "0"}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Badge
                          variant={badgeVariant[report.status] || "default"}
                          className="bg-success/10 text-success rounded-full border-none"
                        >
                          {report.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center sm:text-left">
                        <ActionMenu
                          actions={[
                            {
                              label: "View",
                              onClick: () => handleView(report),
                            },
                            {
                              label: "Edit",
                              icon: Edit,
                              onClick: () => handleEdit(report),
                            },
                            {
                              label: "Delete",
                              icon: Trash2,
                              danger: true,
                              onClick: () => handleDelete(report),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </Table>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}

export default Reports;
