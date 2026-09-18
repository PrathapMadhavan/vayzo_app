import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  ShieldBan,
  ShieldCheck,
  Phone,
  Mail,
  Calendar,
  MapPin,
  User,
  Wallet,
  FileText,
  AlertTriangle,
  History,
  ChevronRight,
  TrendingUp,
  Package,
  CreditCard,
  Check,
  X,
} from "lucide-react";
import {
  getCustomerById,
  updateCustomerStatus,
  getCustomerWallet,
  getCustomerTransactions,
  getCustomerRequests,
  getCustomerComplaints,
} from "../api/usersApi";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Avatar from "../components/ui/Avatar";
import Table from "../components/ui/Table";
import Input from "../components/ui/Input";

/* ─── helpers ─────────────────────────────────── */
const InfoRow = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:items-start py-3 border-b border-border/40 last:border-0 gap-1 sm:gap-4">
    <span className="text-[13px] sm:text-sm text-muted sm:min-w-[150px] shrink-0">
      {label}
    </span>
    <span className="text-sm sm:text-[15px] text-foreground font-medium break-words">
      {value || "—"}
    </span>
  </div>
);

const StatBox = ({ label, value, sub, color = "default", className = "" }) => {
  const colorMap = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    muted: "text-muted",
    default: "text-foreground",
  };
  return (
    <div className={`flex flex-col gap-1 px-3 sm:px-4 ${className} min-w-0`}>
      <p className="text-[11px] sm:text-xs text-muted whitespace-nowrap">
        {label}
      </p>
      <div
        className={`text-sm sm:text-base font-bold truncate ${colorMap[color]}`}
      >
        {value ?? "—"}
      </div>
      {sub && <p className={`text-xs ${colorMap[color]}`}>{sub}</p>}
    </div>
  );
};

const EmptyState = ({ message, icon: Icon }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {Icon && <Icon size={36} className="text-muted/30 mb-3" />}
    <p className="text-sm text-muted">{message}</p>
  </div>
);

const tabs = [
  { key: "overview", label: "Overview", icon: User },
  { key: "wallet", label: "Wallet", icon: Wallet },
  { key: "requests", label: "Requests", icon: Package },
  { key: "complaints", label: "Complaints", icon: AlertTriangle },
];

/* ─── main component ──────────────────────────── */
export default function CustomerDetails() {
  const { publicId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [statusModal, setStatusModal] = useState(false);
  const [msgModal, setMsgModal] = useState(false);
  const [msgForm, setMsgForm] = useState({ title: "", message: "" });
  const [imagePreviewModal, setImagePreviewModal] = useState(false);

  useEffect(() => {
    if (!publicId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [custData, walletData, txnsData, reqData, compData] =
          await Promise.all([
            getCustomerById(publicId),
            getCustomerWallet(publicId).catch(() => null),
            getCustomerTransactions(publicId).catch(() => []),
            getCustomerRequests(publicId).catch(() => []),
            getCustomerComplaints(publicId).catch(() => []),
          ]);
        setCustomer(custData);
        setWallet(walletData);
        setTransactions(Array.isArray(txnsData) ? txnsData : []);
        setRequests(Array.isArray(reqData) ? reqData : []);
        setComplaints(Array.isArray(compData) ? compData : []);
      } catch {
        setError("Unable to load customer details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [publicId]);

  const handleStatusToggle = async () => {
    if (!customer) return;
    const newStatus = isBlocked ? "Active" : "Blocked";
    try {
      await updateCustomerStatus(publicId, newStatus);
      setCustomer((prev) => ({ ...prev, status: newStatus }));
      setStatusModal(false);
    } catch {
      alert("Failed to update customer status.");
    }
  };

  const handleSendMessage = () => {
    if (!msgForm.message.trim()) return;
    alert("Message Sent (Simulated)");
    setMsgModal(false);
    setMsgForm({ title: "", message: "" });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted">Loading customer details...</p>
        </div>
      </div>
    );

  if (error || !customer)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-danger font-medium mb-2">
            {error || "Customer not found"}
          </p>
          <Button variant="secondary" onClick={() => navigate("/customers")}>
            <ArrowLeft size={16} className="mr-2" /> Back to Customers
          </Button>
        </div>
      </div>
    );

  const isBlocked = customer.status?.toLowerCase() === "blocked";
  const totalCredits = transactions
    .filter((t) => t.type === "credit")
    .reduce((s, t) => s + (t.amount || 0), 0);
  const totalDebits = transactions
    .filter((t) => t.type === "debit")
    .reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <div className="min-h-full bg-background">
      {/* ── Top breadcrumb & actions ── */}
      <div className="px-4 sm:px-6 pt-5 pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <button
            onClick={() => navigate("/customers")}
            className="flex items-center gap-1.5 text-muted hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft size={15} /> Back to List
          </button>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMsgModal(true)}
            className="flex items-center justify-center gap-1.5 text-xs sm:text-sm"
          >
            <MessageSquare size={14} />{" "}
            <span className="hidden sm:inline">Send Message</span>
            <span className="sm:hidden">Message</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setStatusModal(true)}
            variant={isBlocked ? "success" : "danger"}
            className="flex items-center justify-center gap-1.5 text-xs sm:text-sm"
          >
            {isBlocked ? (
              <>
                <ShieldCheck size={14} />{" "}
                <span className="hidden sm:inline">Unblock Customer</span>
                <span className="sm:hidden">Unblock</span>
              </>
            ) : (
              <>
                <ShieldBan size={14} />{" "}
                <span className="hidden sm:inline">Block Customer</span>
                <span className="sm:hidden">Block</span>
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(`/customers/edit/${publicId}`)}
            className="flex items-center justify-center gap-1.5 text-xs sm:text-sm"
          >
            Edit <span className="hidden sm:inline">Customer</span>
          </Button>
        </div>
      </div>

      {/* ── Profile Header Card ── */}
      <div className="mx-4 sm:mx-6 mt-4 bg-surface border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Top row: avatar + identity + stats */}
        <div className="flex flex-col xl:flex-row items-start xl:items-center p-5 sm:p-6 gap-6">
          {/* Avatar + name */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 w-full xl:w-auto shrink-0">
            <div
              className="cursor-pointer hover:opacity-80 transition-opacity shrink-0"
              onClick={() =>
                (customer.profileImage || customer.image) &&
                setImagePreviewModal(true)
              }
              title="View Profile Image"
            >
              <Avatar
                src={customer.profileImage || customer.image}
                identifier={customer.public_id}
                alt={customer.name}
                className="h-24 w-24 sm:h-20 sm:w-20 text-3xl sm:text-2xl rounded-full ring-4 ring-background shadow-sm"
              />
            </div>
            <div className="flex flex-col items-center sm:items-start w-full">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-2">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  {customer.name}
                </h1>
                <Badge
                  variant={isBlocked ? "danger" : "success"}
                  className="text-xs"
                >
                  {isBlocked ? "Blocked" : "Active"}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap items-center sm:items-start gap-2 sm:gap-4 mt-1">
                {customer.mobileNumber && (
                  <div className="flex items-center gap-1.5 text-sm text-muted">
                    <Phone size={14} className="text-primary/70" />{" "}
                    {customer.mobileNumber}
                  </div>
                )}
                {customer.email && (
                  <div className="flex items-center gap-1.5 text-sm text-muted">
                    <Mail size={14} className="text-primary/70" />{" "}
                    {customer.email}
                  </div>
                )}
                {customer.joinedOn && (
                  <div className="flex items-center gap-1.5 text-sm text-muted">
                    <Calendar size={14} className="text-primary/70" /> Joined{" "}
                    {customer.joinedOn}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vertical divider on desktop, horizontal on mobile */}
          <div className="hidden xl:block h-20 w-px bg-border/60 mx-2" />
          <div className="block xl:hidden w-full h-px bg-border/60 my-2" />

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-x-4 lg:flex lg:flex-nowrap w-full xl:w-auto items-center gap-y-6 sm:gap-y-6 lg:gap-0 lg:divide-x divide-border/40 lg:px-2">
            <StatBox
              label="Customer ID"
              value={customer.public_id?.slice(0, 14) + "…"}
              color="default"
              className="border-r border-border/40 lg:border-0"
            />
            <StatBox
              label="Wallet Balance"
              value={wallet ? `₹${wallet.balance?.toFixed(2)}` : "₹0.00"}
              color="primary"
              className="lg:border-0"
            />
            <StatBox
              label="Total Requests"
              value={requests.length}
              color="default"
              className="border-r border-border/40 lg:border-0"
            />
            <StatBox
              label="Verified"
              color="default"
              className="lg:border-0"
              value={
                <span
                  className={`flex items-center gap-1 ${customer.isVerified ? "text-success" : "text-danger"}`}
                >
                  {customer.isVerified ? (
                    <>
                      <Check size={14} strokeWidth={3} /> Yes
                    </>
                  ) : (
                    <>
                      <X size={14} strokeWidth={3} /> No
                    </>
                  )}
                </span>
              }
            />
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex border-t border-border/60 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={[
                  "flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                  active
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted hover:text-foreground hover:bg-muted/10",
                ].join(" ")}
              >
                <Icon size={15} />
                {tab.label}
                {tab.key === "requests" && requests.length > 0 && (
                  <span className="ml-1 text-xs bg-primary/15 text-primary rounded-full px-1.5 py-0.5">
                    {requests.length}
                  </span>
                )}
                {tab.key === "complaints" && complaints.length > 0 && (
                  <span className="ml-1 text-xs bg-danger/15 text-danger rounded-full px-1.5 py-0.5">
                    {complaints.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="mx-6 mt-4 mb-6">
        {/* ─ Overview Tab ─ */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Personal Information */}
            <div className="lg:col-span-2 bg-surface border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50">
                <User size={17} className="text-primary" />
                <h3 className="font-semibold text-foreground">
                  Personal Information
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <div>
                  <InfoRow label="Full Name" value={customer.name} />
                  <InfoRow label="Email Address" value={customer.email} />
                  <InfoRow
                    label="Mobile Number"
                    value={customer.mobileNumber}
                  />
                </div>
                <div>
                  <InfoRow label="Customer ID" value={customer.public_id} />
                  <InfoRow
                    label="Joined On"
                    value={customer.joinedOn || customer.created_at}
                  />
                  <InfoRow
                    label="Account Status"
                    value={
                      <span
                        className={
                          isBlocked
                            ? "text-danger font-semibold"
                            : "text-success font-semibold"
                        }
                      >
                        {isBlocked ? "Blocked" : "Active"}
                      </span>
                    }
                  />
                </div>
              </div>
            </div>

            {/* Wallet Summary */}
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50">
                <Wallet size={17} className="text-primary" />
                <h3 className="font-semibold text-foreground">
                  Wallet Summary
                </h3>
              </div>
              <div className="p-5 flex flex-col gap-3">
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                  <p className="text-xs text-primary font-medium mb-1">
                    Current Balance
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{wallet?.balance?.toFixed(2) ?? "0.00"}
                  </p>
                </div>
                <div className="mt-1">
                  <div className="bg-danger/10 border border-danger/20 rounded-xl p-3">
                    <p className="text-xs text-danger font-medium mb-1">
                      Total Debits
                    </p>
                    <p className="text-lg font-bold text-foreground">
                      ₹{totalDebits.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted">Total Transactions</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {transactions.length} transactions
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-3 bg-surface border border-border rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <History size={17} className="text-primary" />
                  <h3 className="font-semibold text-foreground">
                    Recent Activity
                  </h3>
                </div>
                {requests.length > 0 && (
                  <button
                    onClick={() => setActiveTab("requests")}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    View All <ChevronRight size={13} />
                  </button>
                )}
              </div>
              <div className="p-5">
                {requests.length > 0 ? (
                  <div className="space-y-2">
                    {requests.slice(0, 5).map((req) => (
                      <div
                        key={req.id || req.public_id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Package size={14} className="text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {req.service_type || req.type || "Request"}
                            </p>
                            <p className="text-xs text-muted">
                              {req.public_id || req.id}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge>{req.status}</Badge>
                          <p className="text-xs text-muted mt-1">
                            {req.created_at
                              ? new Date(req.created_at).toLocaleDateString()
                              : "—"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    message="No activity yet for this customer"
                    icon={History}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─ Wallet Tab ─ */}
        {activeTab === "wallet" && (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50">
              <Wallet size={17} className="text-primary" />
              <h3 className="font-semibold text-foreground">
                Wallet & Transactions
              </h3>
            </div>
            <div className="p-5">
              {/* Balance cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                  <p className="text-xs text-primary font-medium mb-1">
                    Current Balance
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{wallet?.balance?.toFixed(2) ?? "0.00"}
                  </p>
                </div>
                <div className="bg-danger/10 border border-danger/20 rounded-xl p-4">
                  <p className="text-xs text-danger font-medium mb-1">
                    Total Debits
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{totalDebits.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Transactions */}
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Transactions ({transactions.length})
              </h4>
              {transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-full flex items-center justify-center ${t.type === "credit" ? "bg-success/15" : "bg-danger/15"}`}
                        >
                          <TrendingUp
                            size={15}
                            className={
                              t.type === "credit"
                                ? "text-success"
                                : "text-danger rotate-180"
                            }
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {t.description || "Transaction"}
                          </p>
                          <p className="text-xs text-muted">
                            {t.created_at
                              ? new Date(t.created_at).toLocaleString()
                              : "—"}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`text-sm font-bold ${t.type === "credit" ? "text-success" : "text-danger"}`}
                      >
                        {t.type === "credit" ? "+" : "-"}₹{t.amount?.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  message="No wallet transactions yet"
                  icon={CreditCard}
                />
              )}
            </div>
          </div>
        )}

        {/* ─ Requests Tab ─ */}
        {activeTab === "requests" && (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50">
              <Package size={17} className="text-primary" />
              <h3 className="font-semibold text-foreground">
                Requests ({requests.length})
              </h3>
            </div>
            {requests.length > 0 ? (
              <Table
                headers={["Request ID", "Type", "Amount", "Status", "Date"]}
                currentCount={requests.length}
                totalCount={requests.length}
                currentPage={1}
                totalPages={1}
                className="border-0 shadow-none rounded-none border-t-0"
              >
                {requests.map((req) => (
                  <tr
                    key={req.public_id || req.id}
                    className="border-b border-border last:border-0 hover:bg-muted/5 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {req.public_id || req.id}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {req.service_type || req.type || "—"}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      ₹{req.amount?.toFixed(2) ?? "0.00"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{req.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {req.created_at
                        ? new Date(req.created_at).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </Table>
            ) : (
              <EmptyState
                message="No requests found for this customer"
                icon={Package}
              />
            )}
          </div>
        )}

        {/* ─ Complaints Tab ─ */}
        {activeTab === "complaints" && (
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border/50">
              <AlertTriangle size={17} className="text-primary" />
              <h3 className="font-semibold text-foreground">
                Complaints & Support ({complaints.length})
              </h3>
            </div>
            {complaints.length > 0 ? (
              <Table
                headers={["Ticket ID", "Issue Type", "Status", "Date"]}
                currentCount={complaints.length}
                totalCount={complaints.length}
                currentPage={1}
                totalPages={1}
                className="border-0 shadow-none rounded-none border-t-0"
              >
                {complaints.map((comp) => (
                  <tr
                    key={comp.id}
                    className="border-b border-border last:border-0 hover:bg-muted/5 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {comp.complaintId || comp.id}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {comp.issueType || comp.subject || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge>{comp.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {comp.date ||
                        (comp.created_at
                          ? new Date(comp.created_at).toLocaleDateString()
                          : "—")}
                    </td>
                  </tr>
                ))}
              </Table>
            ) : (
              <EmptyState
                message="No complaints or support tickets found for this customer"
                icon={AlertTriangle}
              />
            )}
          </div>
        )}
      </div>

      {/* ─ Block / Unblock Modal ─ */}
      <Modal
        isOpen={statusModal}
        onClose={() => setStatusModal(false)}
        title={isBlocked ? "Unblock Customer" : "Block Customer"}
      >
        <p className="text-sm text-muted">
          Are you sure you want to {isBlocked ? "unblock" : "block"}{" "}
          <strong>{customer.name}</strong>?
          {isBlocked
            ? " They will regain access to the app."
            : " They will no longer be able to use the app."}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setStatusModal(false)}>
            Cancel
          </Button>
          <Button
            variant={isBlocked ? "success" : "danger"}
            onClick={handleStatusToggle}
          >
            {isBlocked ? "Yes, Unblock" : "Yes, Block"}
          </Button>
        </div>
      </Modal>

      {/* ─ Send Message Modal ─ */}
      <Modal
        isOpen={msgModal}
        onClose={() => setMsgModal(false)}
        title="Send Message to Customer"
      >
        <div className="space-y-4">
          <Input
            label="Title / Subject (Optional)"
            placeholder="e.g. Account Update"
            value={msgForm.title}
            onChange={(e) =>
              setMsgForm((p) => ({ ...p, title: e.target.value }))
            }
          />
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Message Description *
            </label>
            <textarea
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary transition-colors min-h-[100px] resize-y"
              placeholder="Enter your message here..."
              value={msgForm.message}
              onChange={(e) =>
                setMsgForm((p) => ({ ...p, message: e.target.value }))
              }
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setMsgModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!msgForm.message.trim()}
          >
            Send Message
          </Button>
        </div>
      </Modal>

      {/* ─ Image Preview Modal ─ */}
      <Modal
        isOpen={imagePreviewModal}
        onClose={() => setImagePreviewModal(false)}
        title="Profile Image"
      >
        <div className="flex justify-center p-4">
          <img
            src={customer.profileImage || customer.image}
            alt={customer.name}
            className="max-w-full max-h-[70vh] rounded-xl object-contain"
          />
        </div>
      </Modal>
    </div>
  );
}
