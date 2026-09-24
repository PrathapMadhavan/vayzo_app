import {
  CheckCircle,
  Clock3,
  Download,
  Eye,
  MoreVertical,
  Trash2,
  Package,
  Truck,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../components/ui/Avatar";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import StatCard from "../components/ui/StatCard";
import Table from "../components/ui/Table";
import Card from "../components/ui/Card";
import DateRangeInput from "../components/ui/DateRangeInput";
import SearchInput from "../components/ui/SearchInput";
import StatusSelect from "../components/ui/StatusSelect";
import Modal from "../components/ui/Modal";
import ActionMenu from "../components/ui/ActionMenu";
import FilterPanel from "../components/ui/FilterPanel";
import BadgeCell from "../components/ui/BadgeCell";
import { getOrders, updateOrderStatus } from "../api/ordersApi";
import { exportToCSV } from "../utils/exportUtils";

const STATUS_MAP = {
  delivered: "success",
  completed: "success",
  going_to_customer: "info",
  picked_up: "info",
  purchasing: "info",
  arrived_pickup: "info",
  going_to_pickup: "info",
  partner_assigned: "info",
  searching_partner: "warning",
  requested: "warning",
  cancelled: "danger",
  failed: "danger",
};

const TABS = [
  "All Orders",
  "Requested",
  "On The Way",
  "Delivered",
  "Cancelled",
];

const STATUS_OPTIONS = [
  "All Status",
  "Delivered",
  "On The Way",
  "Requested",
  "Cancelled",
];

const PAYMENT_OPTIONS = ["All Payment Status", "Paid", "Pending", "Refunded"];

const STAT_CONFIG = [
  {
    label: "Total Orders",
    key: "total",
    icon: Package,
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
    trend: "12.5%",
  },
  {
    label: "Requested",
    key: "pending",
    icon: Clock3,
    colorClass: "text-warning",
    bgClass: "bg-warning/10",
    trend: "5.2%",
  },
  {
    label: "On The Way",
    key: "inTransit",
    icon: Truck,
    colorClass: "text-info",
    bgClass: "bg-info/10",
    trend: "8.4%",
  },
  {
    label: "Delivered",
    key: "delivered",
    icon: CheckCircle,
    colorClass: "text-success",
    bgClass: "bg-success/10",
    trend: "15.3%",
  },
  {
    label: "Cancelled",
    key: "cancelled",
    icon: XCircle,
    colorClass: "text-danger",
    bgClass: "bg-danger/10",
    trend: "2.1%",
    isNegative: true,
  },
];

const formatStatus = (status = "") => status.replaceAll("_", " ");

const getDateOnly = (date = "") => {
  if (!date) return "";

  // Supports:
  // 2026-08-27
  // 2026-08-27 11:20
  // 2026-08-27T11:20
  return date.slice(0, 10);
};

const formatOrderDateTime = (dateStr) => {
  if (!dateStr) return { date: "--", time: "" };
  try {
    const d = new Date(dateStr.replace(" ", "T"));
    if (isNaN(d.getTime())) return { date: dateStr, time: "" };
    const dateFormatted = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeFormatted = d
      .toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase();
    return { date: dateFormatted, time: timeFormatted };
  } catch (e) {
    return { date: dateStr, time: "" };
  }
};

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Status");
  const [payment, setPayment] = useState("All Payment Status");
  const [activeTab, setActiveTab] = useState("All Orders");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [deleteModalId, setDeleteModalId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const loadOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getOrders();

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError("Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getOrders();

        if (mounted) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load orders:", err);

        if (mounted) {
          setError("Unable to load orders.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => {
      mounted = false;
    };
  }, []);

  /* --------------------------------
     Statistics
  -------------------------------- */

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((order) => order.status === "requested").length,
      inTransit: orders.filter((order) => ["going_to_customer", "picked_up", "going_to_pickup"].includes(order.status)).length,
      delivered: orders.filter((order) => order.status === "delivered" || order.status === "completed").length,
      cancelled: orders.filter((order) => order.status === "cancelled" || order.status === "failed").length,
    };
  }, [orders]);

  /* --------------------------------
     Filtering
  -------------------------------- */

  const filteredOrders = useMemo(() => {
    const searchValue = query.trim().toLowerCase();

    return orders.filter((order) => {
      const phoneStr =
        order.customer?.phone || order.customer?.mobile || "Unavailable";
      const searchableText = [
        order.id,
        order.customer?.name,
        phoneStr,
        phoneStr.replace(/\s+/g, ""), // spaceless version
        "Items", // No simple string items summary
        order.restaurant?.name,
        order.assignments?.[0]?.partner_id,
        order.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchValue || searchableText.includes(searchValue);

      const matchesStatus =
        status === "All Status" ||
        formatStatus(order.status).toLowerCase() === status.toLowerCase();

      const matchesPayment = true; // Payments API not integrated yet

      let matchesTab = true;

      if (activeTab !== "All Orders") {
        const tabStatus =
          activeTab === "On The Way"
            ? "going_to_customer" // Simplify filter to one status for now
            : activeTab.toLowerCase().replaceAll(" ", "_");

        matchesTab = order.status === tabStatus;
      }

      const orderDate = getDateOnly(order.created_at);

      const matchesFromDate = !fromDate || orderDate >= fromDate;

      const matchesToDate = !toDate || orderDate <= toDate;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment &&
        matchesTab &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [orders, query, status, payment, activeTab, fromDate, toDate]);

  /* --------------------------------
     Reset
  -------------------------------- */

  const resetFilters = () => {
    setQuery("");
    setStatus("All Status");
    setPayment("All Payment Status");
    setActiveTab("All Orders");
    setFromDate("");
    setToDate("");
  };

  const handleDeleteOrder = async () => {
    if (!deleteModalId) return;
    try {
      await updateOrderStatus(deleteModalId, { status: "cancelled" });
      setOrders((prev) =>
        prev.map((o) =>
          (o.id || o.orderId) === deleteModalId ? { ...o, status: "cancelled" } : o
        )
      );
      setDeleteModalId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to cancel order.");
    }
  };

  const hasFilters =
    query ||
    status !== "All Status" ||
    payment !== "All Payment Status" ||
    activeTab !== "All Orders" ||
    fromDate ||
    toDate;

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const maxPaymentStatus = useMemo(() => {
    return paginatedOrders.reduce((max, o) => {
      const val = o.payment_method || "--";
      return val.length > max.length ? val : max;
    }, "");
  }, [paginatedOrders]);

  const maxStatus = useMemo(() => {
    return paginatedOrders.reduce((max, o) => {
      const val = formatStatus(o.status) || "--";
      return val.length > max.length ? val : max;
    }, "");
  }, [paginatedOrders]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, status, payment, activeTab, fromDate, toDate]);

  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="space-y-4">
        {/* =========================
            Statistics
        ========================== */}

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-6">
          {STAT_CONFIG.map((stat) => (
            <StatCard
              key={stat.key}
              variant="horizontal"
              title={stat.label}
              value={loading ? "--" : stats[stat.key]}
              icon={stat.icon}
              colorClass={stat.colorClass}
              bgClass={stat.bgClass}
              trend={stat.trend}
              isNegative={stat.isNegative}
            />
          ))}
        </div>

        {/* =========================
            Filters Section
        ========================== */}

        <Card noPadding className="flex flex-col">
          <FilterPanel
            search={
              <SearchInput
                id="order-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by Order ID, Customer, Partner..."
              />
            }
            actions={
              <Button
                variant="secondary"
                size="sm"
                type="button"
                className="h-10 w-full sm:w-auto"
                onClick={() => exportToCSV(filteredOrders, "orders.csv")}
              >
                <Download size={14} className="mr-1" /> Export
              </Button>
            }
            filters={
              <>
                <Select
                  id="order-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="w-full lg:w-37.5"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
                <Select
                  id="payment-status"
                  value={payment}
                  onChange={(event) => setPayment(event.target.value)}
                  className="w-full lg:w-45"
                >
                  {PAYMENT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
                <DateRangeInput
                  fromValue={fromDate}
                  toValue={toDate}
                  onFromChange={(event) => setFromDate(event.target.value)}
                  onToChange={(event) => setToDate(event.target.value)}
                  className="w-full lg:w-65 shrink-0"
                />
              </>
            }
            hasActiveFilters={hasFilters}
            onReset={resetFilters}
          />
          {/* Tabs */}
          <div className="px-4 sm:px-6 pt-0 border-t border-border/50">
            <nav className="flex gap-5 overflow-x-auto scrollbar-none w-full xl:w-auto mt-4">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap border-b-2 px-2 pb-2 text-sm font-medium transition ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted hover:text-foreground hover:border-border"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </Card>

        {/* =========================
            Table Card
        ========================== */}
        <Card noPadding className="flex flex-col mt-2">
          <Table
            headers={[
              "No.",
              "Order ID",
              "Customer",
              "Items",
              "Delivery Partner",
              "Amount",
              "Payment",
              "Status",
              "Order Time",
              "Actions",
            ]}
            currentCount={paginatedOrders.length}
            totalCount={filteredOrders.length}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            minWidth="1000px"
            className="border-0 shadow-none rounded-none"
          >
            {loading ? (
              <tr>
                <td colSpan={9} className="p-10 text-center text-sm text-muted">
                  Loading orders...
                </td>
              </tr>
            ) : paginatedOrders.length ? (
              paginatedOrders.map((order, index) => (
                <tr
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="hover:bg-surface-50 hover:text-primary transition-colors cursor-pointer"
                >
                  <td className="whitespace-nowrap px-3 py-3 font-medium text-foreground">
                    {String(
                      (currentPage - 1) * itemsPerPage + index + 1,
                    ).padStart(2, "0")}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-sm font-semibold text-foreground">
                    {order.id?.startsWith("#")
                      ? order.id
                      : `#${order.id}`}
                  </td>
                  <td className="px-3 py-3 min-w-50">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={order.customer?.profileImage}
                        identifier={order.customer?.name || order.id}
                        className="h-9 w-9 rounded-full shadow-sm shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-medium text-foreground leading-tight">
                          {order.customer?.name || "Unavailable"}
                        </span>
                        <span className="truncate text-[11px] text-muted mt-0.5">
                          {order.customer?.phone || order.customer?.mobile || "Unavailable"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="min-w-30 px-3 py-3">
                    <div className="flex flex-col min-w-0">
                      <span className="truncate text-sm font-medium text-foreground leading-tight">
                        {order.items?.length !== undefined
                          ? `${order.items.length} Items`
                          : "Unavailable"}
                      </span>
                      <span className="truncate text-[11px] text-muted mt-0.5">
                        {order.restaurant?.name || "Unavailable"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {order.assignments?.[0]?.partner_id ? (
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col min-w-0">
                          <span className="truncate font-medium text-foreground leading-tight">
                            {order.assignments[0].partner_id}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted">--</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-medium text-foreground">
                    {order.total_estimated_amount !== undefined && order.total_estimated_amount !== null
                      ? `₹${Number(order.total_estimated_amount).toLocaleString("en-IN")}`
                      : "Unavailable"}
                  </td>
                  <td className="px-3 py-3">
                    <BadgeCell
                      maxContent={maxPaymentStatus}
                      content={order.payment_method || "--"}
                      variant={
                        order.payment_method
                          ? "success"
                          : "warning"
                      }
                      className="px-3"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <BadgeCell
                      maxContent={maxStatus}
                      content={formatStatus(order.status) || "--"}
                      variant={STATUS_MAP[order.status] || "default"}
                      className="px-3"
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {formatOrderDateTime(order.created_at).date}
                      </span>
                      <span className="text-[11px] text-muted mt-0.5">
                        {formatOrderDateTime(order.created_at).time}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex gap-1 flex-nowrap justify-end items-center">
                      <ActionMenu
                        actions={[
                          {
                            label: "View",
                            icon: Eye,
                            onClick: () => navigate(`/orders/${order.id}`),
                          },
                          {
                            label: "Cancel",
                            icon: XCircle,
                            danger: true,
                            onClick: () => setDeleteModalId(order.id),
                          },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="p-10 text-center">
                  <Package size={30} className="mx-auto text-muted" />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    No orders found
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Try adjusting your filters or search query.
                  </p>
                </td>
              </tr>
            )}
          </Table>
        </Card>

        {/* =========================
            Order Details Modal
        ========================== */}
      </div>

      <Modal
        isOpen={!!deleteModalId}
        onClose={() => setDeleteModalId(null)}
        title="Cancel Request"
      >
        <p className="text-sm text-muted">
          Are you sure you want to cancel this request? This action will set the status to cancelled.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModalId(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            className="w-full sm:w-auto px-6 font-semibold shadow-sm hover:shadow"
            onClick={handleDeleteOrder}
          >
            Yes, Cancel
          </Button>
        </div>
      </Modal>
    </section>
  );
}

export default Orders;
