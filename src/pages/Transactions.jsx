import {
  Download,
  Eye,
  RefreshCw,
  Calendar,
  CreditCard,
  User,
  ShoppingBag,
  MapPin,
  FileText,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import FilterPanel from "../components/ui/FilterPanel";
import SearchInput from "../components/ui/SearchInput";
import StatusSelect from "../components/ui/StatusSelect";
import DateRangeInput from "../components/ui/DateRangeInput";
import Table from "../components/ui/Table";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import ActionMenu from "../components/ui/ActionMenu";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import { exportToCSV } from "../utils/exportUtils";
import { getTransactions } from "../api/financeApi";

const statusBadgeMap = {
  SUCCESS: "success",
  PAID: "success",
  COMPLETED: "success",
  PENDING: "warning",
  FAILED: "danger",
  REFUNDED: "info",
};

const typeLabelMap = {
  PAYMENT: "Order Payment",
  WALLET_TRANSACTION: "Wallet Transaction",
  PARTNER_EARNING: "Partner Earning",
  PARTNER_PAYOUT: "Partner Payout",
};

const tabs = ["All Transactions", "Success", "Pending", "Failed"];

function formatTransactionDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

function Transactions() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Status");
  const [type, setType] = useState("All Type");
  const [tab, setTab] = useState(tabs[0]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [transactionList, setTransactionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Details Modal State
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactions();
      setTransactionList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading transactions:", err);
      setError(err.message || "Unable to connect to the server. Please check your connection or server status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filtered = useMemo(() => {
    return transactionList.filter((item) => {
      const matchesQuery =
        !query ||
        [
          item.transactionId,
          item.userName,
          item.description,
          item.method,
          item.city,
          item.relatedOrder,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());

      const itemDate = item.date ? String(item.date).slice(0, 10) : "";
      const [start, end] = dateRange;
      const startDate = start ? new Date(start).toISOString().slice(0, 10) : null;
      const endDate = end ? new Date(end).toISOString().slice(0, 10) : null;

      const itemStatus = String(item.status || "").toUpperCase();
      const matchesStatus =
        status === "All Status" ||
        itemStatus === status.toUpperCase();

      const itemType = String(item.type || "").toUpperCase();
      const matchesType =
        type === "All Type" ||
        itemType === type.toUpperCase() ||
        (typeLabelMap[itemType] && typeLabelMap[itemType].toLowerCase() === type.toLowerCase());

      const matchesTab =
        tab === tabs[0] ||
        (tab === "Success" && (itemStatus === "SUCCESS" || itemStatus === "PAID")) ||
        (tab === "Pending" && itemStatus === "PENDING") ||
        (tab === "Failed" && itemStatus === "FAILED");

      const matchesDateRange =
        (!startDate || (itemDate && itemDate >= startDate)) &&
        (!endDate || (itemDate && itemDate <= endDate));

      return matchesQuery && matchesStatus && matchesType && matchesTab && matchesDateRange;
    });
  }, [query, status, type, tab, transactionList, dateRange]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage]);

  const handleReset = () => {
    setQuery("");
    setStatus("All Status");
    setType("All Type");
    setTab(tabs[0]);
    setDateRange([null, null]);
    setCurrentPage(1);
  };

  const handleExport = () => {
    if (!filtered || filtered.length === 0) return;
    const exportData = filtered.map((t) => ({
      "Transaction ID": t.transactionId,
      "User / Partner": t.userName || "N/A",
      "Type": typeLabelMap[t.type] || t.type,
      "Status": t.status,
      "Amount (INR)": t.amount,
      "Payment Method": t.method,
      "Related Order": t.relatedOrder || "N/A",
      "City": t.city || "N/A",
      "Description": t.description || "N/A",
      "Date": t.date || "N/A",
    }));
    exportToCSV(exportData, "transactions.csv");
  };

  const handleViewDetails = (item) => {
    setSelectedTxn(item);
    setIsModalOpen(true);
  };

  return (
    <section className="min-h-full bg-background p-3 sm:p-4">
      <div className="space-y-3">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">Transactions</h1>
            <p className="text-xs text-muted mt-0.5">
              Verified financial records aggregated from payments, wallets, and settlements.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={fetchTransactions}>
              <RefreshCw size={14} className="mr-1.5" />
              Refresh
            </Button>
          </div>
        </header>

        <Card noPadding className="flex flex-col overflow-hidden">
          <FilterPanel
            search={
              <SearchInput
                id="transaction-search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by ID, user, description..."
              />
            }
            actions={
              <Button
                variant="secondary"
                size="sm"
                className="h-10 w-full sm:w-auto"
                onClick={handleExport}
                disabled={filtered.length === 0}
              >
                <Download size={14} className="mr-1.5" /> Export
              </Button>
            }
            filters={
              <>
                <StatusSelect
                  id="transaction-status"
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value);
                    setCurrentPage(1);
                  }}
                  options={["All Status", "Success", "Pending", "Failed"]}
                  className="w-full sm:w-37.5"
                />
                <Select
                  id="transaction-type"
                  value={type}
                  onChange={(event) => {
                    setType(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-42.5"
                >
                  <option value="All Type">All Type</option>
                  <option value="PAYMENT">Order Payment</option>
                  <option value="WALLET_TRANSACTION">Wallet Transaction</option>
                  <option value="PARTNER_EARNING">Partner Earning</option>
                  <option value="PARTNER_PAYOUT">Partner Payout</option>
                </Select>
                <div className="w-full sm:w-auto">
                  <DateRangeInput
                    fromValue={dateRange[0]}
                    toValue={dateRange[1]}
                    onFromChange={(e) => {
                      setDateRange([e.target.value, dateRange[1]]);
                      setCurrentPage(1);
                    }}
                    onToChange={(e) => {
                      setDateRange([dateRange[0], e.target.value]);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </>
            }
            hasActiveFilters={
              query !== "" ||
              status !== "All Status" ||
              type !== "All Type" ||
              dateRange[0] !== null ||
              dateRange[1] !== null
            }
            onReset={handleReset}
          />

          <div className="bg-surface px-4">
            <nav className="flex gap-4 overflow-hidden border-b border-border mt-2">
              {tabs.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setTab(item);
                    setCurrentPage(1);
                  }}
                  className={`whitespace-nowrap border-b-2 px-1 pb-2 text-sm font-medium ${
                    tab === item
                      ? "border-primary text-primary"
                      : "border-transparent text-muted hover:text-foreground"
                  }`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 w-full flex flex-col min-h-0 overflow-hidden border-t border-border">
            {loading ? (
              <LoadingState message="Loading transactions..." />
            ) : error ? (
              <div className="p-6">
                <ErrorState onRetry={fetchTransactions} message={error} />
              </div>
            ) : (
              <Table
                headers={[
                  "Transaction ID",
                  "User / Partner",
                  "Type",
                  "Status",
                  "Amount",
                  "Method",
                  "Description",
                  "Date",
                  "Actions",
                ]}
                currentCount={paginatedData.length}
                totalCount={filtered.length}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
                minWidth="1050px"
                className="border-0 shadow-none rounded-none border-t-0"
              >
                {filtered.length === 0 ? (
                  <EmptyState
                    colSpan={9}
                    message="No transactions found."
                    description={
                      query || status !== "All Status" || type !== "All Type" || tab !== tabs[0]
                        ? "Try adjusting your filters or search query."
                        : undefined
                    }
                  />
                ) : (
                  paginatedData.map((item) => {
                    const normalizedStatus = String(item.status || "SUCCESS").toUpperCase();
                    const statusVariant = statusBadgeMap[normalizedStatus] || "default";

                    return (
                      <tr
                        key={item.transactionId}
                        onClick={() => handleViewDetails(item)}
                        className="border-b border-border hover:bg-surface-50 transition-colors text-sm last:border-0 cursor-pointer"
                      >
                        <td className="truncate px-4 py-4 font-medium text-foreground whitespace-nowrap">
                          {item.transactionId}
                        </td>
                        <td className="truncate px-4 py-4 text-muted whitespace-nowrap">
                          {item.userName || "N/A"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge
                            variant="secondary"
                            className="px-2 py-0.5 rounded-md font-medium text-[10px] tracking-wider uppercase"
                          >
                            {typeLabelMap[item.type] || item.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge
                            variant={statusVariant}
                            className="px-2.5 py-0.5 rounded-full font-medium"
                          >
                            {normalizedStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 font-semibold text-foreground whitespace-nowrap">
                          ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-4 text-muted whitespace-nowrap">
                          {item.method || "N/A"}
                        </td>
                        <td
                          className="truncate px-4 py-4 text-muted max-w-xs"
                          title={item.description || "N/A"}
                        >
                          {item.description || "N/A"}
                        </td>
                        <td className="px-4 py-4 text-muted whitespace-nowrap text-xs">
                          {formatTransactionDate(item.date)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <ActionMenu
                            actions={[
                              {
                                label: "View Details",
                                icon: Eye,
                                onClick: () => handleViewDetails(item),
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </Table>
            )}
          </div>
        </Card>
      </div>

      {/* Transaction Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Transaction Details"
      >
        {selectedTxn && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs uppercase">
                  {typeLabelMap[selectedTxn.type] || selectedTxn.type}
                </Badge>
              </div>
              <Badge
                variant={statusBadgeMap[String(selectedTxn.status).toUpperCase()] || "default"}
                className="rounded-full px-3 py-1 font-semibold"
              >
                {String(selectedTxn.status).toUpperCase()}
              </Badge>
            </div>

            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted">Transaction Amount</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">
                  ₹{Number(selectedTxn.amount || 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">Payment Method</p>
                <p className="text-sm font-semibold text-foreground flex items-center justify-end gap-1.5 mt-0.5">
                  <CreditCard size={15} className="text-primary" />
                  {selectedTxn.method || "N/A"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted mb-1 flex items-center gap-1.5">
                  <FileText size={12} /> Transaction ID
                </p>
                <p className="font-mono text-xs font-semibold text-foreground">
                  {selectedTxn.transactionId}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1 flex items-center gap-1.5">
                  <Calendar size={12} /> Date & Time
                </p>
                <p className="font-medium text-foreground text-xs">
                  {formatTransactionDate(selectedTxn.date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1 flex items-center gap-1.5">
                  <User size={12} /> User / Partner
                </p>
                <p className="font-medium text-foreground">
                  {selectedTxn.userName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1 flex items-center gap-1.5">
                  <MapPin size={12} /> City
                </p>
                <p className="font-medium text-foreground">
                  {selectedTxn.city || "N/A"}
                </p>
              </div>
              {selectedTxn.relatedOrder && (
                <div className="col-span-2">
                  <p className="text-xs text-muted mb-1 flex items-center gap-1.5">
                    <ShoppingBag size={12} /> Related Order Reference
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      navigate(`/orders/${selectedTxn.relatedOrder}`);
                    }}
                    className="font-mono text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    #{selectedTxn.relatedOrder}
                  </button>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-muted mb-1.5">Description</p>
              <div className="p-3 bg-surface-50 rounded-lg border border-border text-xs text-foreground leading-relaxed">
                {selectedTxn.description || "No description provided."}
              </div>
            </div>

            <div className="mt-4 flex justify-end pt-3 border-t border-border">
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

export default Transactions;
