import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Eye,
  MoreVertical,
  RefreshCw,
  Wallet,
  X,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import FilterPanel from "../components/ui/FilterPanel";
import SearchInput from "../components/ui/SearchInput";
import StatusSelect from "../components/ui/StatusSelect";
import DateRangeInput from "../components/ui/DateRangeInput";
import Table from "../components/ui/Table";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import { exportToCSV } from "../utils/exportUtils";
import { getTransactions } from "../api/financeApi";
const statusMap = { SUCCESS: "success", PENDING: "warning", FAILED: "danger" };
const tabs = ["All Transactions", "Success", "Pending", "Failed"];

const label = (item) => String(item || "").replaceAll("_", " ");
function Transactions() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Status");
  const [type, setType] = useState("All Type");
  const [tab, setTab] = useState(tabs[0]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [transactionList, setTransactionList] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactionList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [form, setForm] = useState({
    userName: "",
    amount: "",
    type: "CREDIT",
    method: "UPI",
    description: "",
    city: "",
    status: "SUCCESS",
  });
  const filtered = useMemo(
    () =>
      transactionList.filter((item) => {
        const matchesQuery =
          !query ||
          [
            item.transactionId,
            item.userName,
            item.description,
            item.method,
            item.city,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase());
        const date = item.date ? String(item.date).slice(0, 10) : "";
        const [start, end] = dateRange;
        const startDate = start
          ? new Date(start).toISOString().slice(0, 10)
          : null;
        const endDate = end ? new Date(end).toISOString().slice(0, 10) : null;
        return (
          matchesQuery &&
          (status === "All Status" ||
            String(item.status || "").toLowerCase() === status.toLowerCase()) &&
          (type === "All Type" ||
            String(item.type || "").toLowerCase() === type.toLowerCase()) &&
          (tab === tabs[0] || String(item.status || "") === tab.toUpperCase()) &&
          (!startDate || (date && date >= startDate)) &&
          (!endDate || (date && date <= endDate))
        );
      }),
    [query, status, type, tab, transactionList, dateRange],
  );
  const update = (key) => (event) =>
    setForm({ ...form, [key]: event.target.value });
  const refresh = () => {
    setQuery("");
    setStatus("All Status");
    setType("All Type");
    setTab(tabs[0]);
    setDateRange([null, null]);
    fetchTransactions();
  };
  return (
    <section className="min-h-full bg-background p-3 sm:p-4">
      <div className="space-y-3">
        <header className="flex flex-wrap items-center justify-end gap-2 border-b border-border pb-3">
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={refresh}>
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
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by ID, user, description..."
              />
            }
            actions={
              <Button
                variant="secondary"
                size="sm"
                className="h-10 w-full sm:w-auto"
                onClick={() => exportToCSV(transactionList, "transactions.csv")}
              >
                <Download size={14} className="mr-1.5" /> Export
              </Button>
            }
            filters={
              <>
                <StatusSelect
                  id="transaction-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  options={["All Status", "Success", "Pending", "Failed"]}
                  className="w-full sm:w-[150px]"
                />
                <Select
                  id="transaction-type"
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="w-full sm:w-[150px]"
                >
                  <option>All Type</option>
                  <option>Credit</option>
                  <option>Debit</option>
                  <option>Refund</option>
                </Select>
                <div className="w-full sm:w-auto">
                  <DateRangeInput
                    fromValue={dateRange[0]}
                    toValue={dateRange[1]}
                    onFromChange={(e) =>
                      setDateRange([e.target.value, dateRange[1]])
                    }
                    onToChange={(e) =>
                      setDateRange([dateRange[0], e.target.value])
                    }
                  />
                </div>
              </>
            }
            hasActiveFilters={
              query ||
              status !== "All Status" ||
              type !== "All Type" ||
              dateRange[0] ||
              dateRange[1]
            }
            onReset={refresh}
          />
          <div className="bg-surface px-4">
            <nav className="flex gap-4 overflow-hidden border-b border-border mt-2">
              {tabs.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`whitespace-nowrap border-b-2 px-1 pb-2 text-sm font-medium ${tab === item ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"}`}
                >
                  {item}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex-1 w-full flex flex-col min-h-0 overflow-hidden border-t border-border">
            <Table
              headers={[
                "Transaction ID",
                "User",
                "Type",
                "Status",
                "Amount",
                "Method",
                "Description",
                "Date",
                "Actions",
              ]}
              currentCount={filtered.length}
              totalCount={transactionList.length}
              currentPage={1}
              totalPages={1}
              onPageChange={() => {}}
              minWidth="1050px"
              className="border-0 shadow-none rounded-none border-t-0"
            >
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="p-8 text-center text-sm text-muted"
                  >
                    No transactions found for the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.transactionId}
                    onClick={() =>
                      alert(`View details for ${item.transactionId}`)
                    }
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
                        {item.type || "UNKNOWN"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          statusMap[String(item.status || "").toUpperCase()] || "default"
                        }
                        className="px-2 py-0.5 rounded-full font-medium"
                      >
                        {label(item.status || "UNKNOWN")}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 font-medium text-foreground whitespace-nowrap">
                      ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-4 text-muted whitespace-nowrap">
                      {item.method || "N/A"}
                    </td>
                    <td
                      className="truncate px-4 py-4 text-muted max-w-[200px]"
                      title={item.description || "N/A"}
                    >
                      {item.description || "N/A"}
                    </td>
                    <td className="px-4 py-4 text-muted whitespace-nowrap text-xs">
                      {item.date || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          aria-label={`View ${item.transactionId}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`View ${item.transactionId}`);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded border border-border text-primary hover:bg-primary-light"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          aria-label={`More actions for ${item.transactionId}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`More actions for ${item.transactionId}`);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded border border-border text-primary hover:bg-primary-light"
                        >
                          <MoreVertical size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </Table>
          </div>
        </Card>
      </div>
    </section>
  );
}

export default Transactions;
