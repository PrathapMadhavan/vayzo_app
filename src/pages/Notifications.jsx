import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Clock3,
  CreditCard,
  Package,
  ShieldAlert,
  UserRound,
  Trash2,
  Check,
  ExternalLink,
  RotateCcw,
  Bike,
  RefreshCw,
} from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import StatCard from "../components/ui/StatCard";
import FilterPanel from "../components/ui/FilterPanel";
import SearchInput from "../components/ui/SearchInput";
import Select from "../components/ui/Select";
import LoadingState from "../components/ui/LoadingState";
import ErrorState from "../components/ui/ErrorState";
import { useNotifications } from "../context/NotificationContext";

const TYPE_CONFIG = {
  ORDER: {
    label: "Order",
    icon: Package,
    colorClass: "text-blue-500",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/20",
    variant: "info",
    linkPath: "/orders",
    linkLabel: "View Orders",
  },
  ORDER_UPDATE: {
    label: "Order",
    icon: Package,
    colorClass: "text-blue-500",
    bgClass: "bg-blue-500/10",
    borderClass: "border-blue-500/20",
    variant: "info",
    linkPath: "/orders",
    linkLabel: "View Orders",
  },
  DELIVERY_UPDATE: {
    label: "Delivery",
    icon: Bike,
    colorClass: "text-purple-500",
    bgClass: "bg-purple-500/10",
    borderClass: "border-purple-500/20",
    variant: "primary",
    linkPath: "/delivery",
    linkLabel: "View Fleet",
  },
  USER: {
    label: "Customer",
    icon: UserRound,
    colorClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
    borderClass: "border-emerald-500/20",
    variant: "success",
    linkPath: "/customers",
    linkLabel: "View Customers",
  },
  COMPLAINT: {
    label: "Complaint",
    icon: ShieldAlert,
    colorClass: "text-rose-500",
    bgClass: "bg-rose-500/10",
    borderClass: "border-rose-500/20",
    variant: "danger",
    linkPath: "/complaints",
    linkLabel: "View Complaint",
  },
  PAYMENT: {
    label: "Payment",
    icon: CreditCard,
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
    borderClass: "border-amber-500/20",
    variant: "warning",
    linkPath: "/transactions",
    linkLabel: "View Payments",
  },
};

const FILTER_TABS = ["All", "Unread", "Read"];

function formatNotificationDate(dateStr) {
  if (!dateStr) return "";
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

export default function Notifications() {
  const navigate = useNavigate();
  const {
    notifications = [],
    isLoading = false,
    error = null,
    unreadCount = 0,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [type, setType] = useState("All Types");

  // Metrics
  const totalCount = notifications.length;
  const readCount = Math.max(0, totalCount - unreadCount);
  const complaintCount = useMemo(
    () => notifications.filter((n) => n.type === "COMPLAINT").length,
    [notifications]
  );

  const filteredNotifications = useMemo(() => {
    const search = query.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesSearch =
        !search ||
        [
          notification.title,
          notification.message,
          notification.type,
          notification.notificationId,
          notification.id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(search);

      const matchesFilter =
        filter === "All" ||
        (filter === "Unread" && !notification.isRead) ||
        (filter === "Read" && notification.isRead);

      const matchesType =
        type === "All Types" ||
        notification.type === type ||
        (type === "ORDER" && notification.type === "ORDER_UPDATE");

      return matchesSearch && matchesFilter && matchesType;
    });
  }, [notifications, query, filter, type]);

  const resetFilters = () => {
    setQuery("");
    setFilter("All");
    setType("All Types");
  };

  const handleClearAll = () => {
    if (notifications.length === 0) return;
    if (window.confirm("Are you sure you want to dismiss all notifications?")) {
      if (clearAllNotifications) {
        clearAllNotifications();
      }
    }
  };

  return (
    <section className="min-h-full bg-background p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="mt-1 text-xs text-muted">
            Stay updated with real-time operational alerts, orders, complaints, and system events.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {refreshNotifications && (
            <Button
              variant="secondary"
              size="sm"
              onClick={refreshNotifications}
              className="h-9 px-3 text-xs font-medium"
              title="Refresh notifications"
            >
              <RefreshCw size={13} className="mr-1.5" />
              Refresh
            </Button>
          )}

          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={markAllAsRead}
              className="h-9 px-3.5 text-xs font-medium"
            >
              <CheckCheck size={14} className="mr-1.5 text-primary" />
              Mark all as read
            </Button>
          )}

          {totalCount > 0 && clearAllNotifications && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearAll}
              className="h-9 px-3 text-xs text-muted hover:text-danger hover:border-danger/30"
              title="Clear all alerts"
            >
              <Trash2 size={14} className="mr-1" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* 4 Modern Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          variant="horizontal"
          title="Total Alerts"
          value={totalCount}
          icon={Bell}
          colorClass="text-primary"
          bgClass="bg-primary/10"
        />
        <StatCard
          variant="horizontal"
          title="Unread Alerts"
          value={unreadCount}
          icon={Clock3}
          colorClass="text-warning"
          bgClass="bg-warning/10"
        />
        <StatCard
          variant="horizontal"
          title="Read Alerts"
          value={readCount}
          icon={CheckCheck}
          colorClass="text-success"
          bgClass="bg-success/10"
        />
        <StatCard
          variant="horizontal"
          title="Support & Complaints"
          value={complaintCount}
          icon={ShieldAlert}
          colorClass="text-danger"
          bgClass="bg-danger/10"
        />
      </div>

      {/* Filter and Tab Section */}
      <Card noPadding className="flex flex-col overflow-hidden">
        <FilterPanel
          search={
            <SearchInput
              id="notification-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search notifications by title, message, or ID..."
              className="w-full"
            />
          }
          actions={
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Tab Pills */}
              <div className="flex items-center bg-background rounded-lg p-1 border border-border w-full sm:w-auto">
                {FILTER_TABS.map((tab) => {
                  const count =
                    tab === "All"
                      ? totalCount
                      : tab === "Unread"
                      ? unreadCount
                      : readCount;
                  const isActive = filter === tab;

                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setFilter(tab)}
                      className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "text-muted hover:text-foreground hover:bg-surface-hover"
                      }`}
                    >
                      <span>{tab}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-surface text-muted border border-border"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          }
          filters={
            <Select
              id="notification-type-filter"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full sm:w-44 h-10 text-xs"
            >
              <option value="All Types">All Categories</option>
              <option value="ORDER">Orders</option>
              <option value="DELIVERY_UPDATE">Delivery</option>
              <option value="COMPLAINT">Complaints</option>
              <option value="PAYMENT">Payments</option>
              <option value="USER">Customers</option>
            </Select>
          }
          hasActiveFilters={query !== "" || filter !== "All" || type !== "All Types"}
          onReset={resetFilters}
        />

        {/* Notifications List Content */}
        <div className="border-t border-t-border bg-surface divide-y divide-border/60">
          {isLoading ? (
            <div className="py-12">
              <LoadingState message="Loading notifications..." />
            </div>
          ) : error ? (
            <div className="p-6">
              <ErrorState onRetry={refreshNotifications} message={error} />
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
                <Bell size={26} />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                No notifications found
              </h3>
              <p className="mt-1 text-xs text-muted max-w-sm">
                {query || filter !== "All" || type !== "All Types"
                  ? "No alerts match your current search query or filter options."
                  : "You're all caught up! There are currently no new notifications."}
              </p>
              {(query || filter !== "All" || type !== "All Types") && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={resetFilters}
                  className="mt-4"
                >
                  <RotateCcw size={13} className="mr-1.5" />
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.USER;
              const Icon = cfg.icon;
              const isUnread = !item.isRead;
              const notifId = item.id || item.notificationId;

              return (
                <div
                  key={notifId}
                  className={`group relative flex flex-col sm:flex-row items-start gap-4 p-4 sm:p-5 transition-colors ${
                    isUnread
                      ? "bg-primary/3 hover:bg-primary/6 border-l-4 border-l-primary"
                      : "bg-surface hover:bg-surface-hover/60 border-l-4 border-l-transparent"
                  }`}
                >
                  {/* Left Icon Badge */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${cfg.bgClass} ${cfg.colorClass} ${cfg.borderClass} shadow-xs`}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2
                          className={`text-sm ${
                            isUnread
                              ? "font-bold text-foreground"
                              : "font-semibold text-foreground/90"
                          }`}
                        >
                          {item.title}
                        </h2>

                        <Badge
                          variant={cfg.variant}
                          className="h-5 px-2 text-[10px] font-semibold tracking-wide uppercase"
                        >
                          {cfg.label}
                        </Badge>

                        {isUnread && (
                          <span className="flex h-2 w-2 rounded-full bg-primary ring-2 ring-primary/20" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted shrink-0">
                        <span className="text-[11px] font-medium">
                          {formatNotificationDate(item.createdAt)}
                        </span>
                        {(item.notificationId || item.id) && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-background border border-border text-muted font-mono">
                            {item.notificationId || item.id}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted leading-relaxed max-w-3xl">
                      {item.message}
                    </p>

                    {/* Action buttons on notification item */}
                    <div className="flex items-center gap-3 mt-3 pt-1">
                      {isUnread && (
                        <button
                          type="button"
                          onClick={() => markAsRead(notifId)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary-hover hover:underline transition-colors"
                        >
                          <Check size={13} />
                          Mark as read
                        </button>
                      )}

                      {(item.linkPath || cfg.linkPath) && (
                        <button
                          type="button"
                          onClick={() => navigate(item.linkPath || cfg.linkPath)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted hover:text-foreground transition-colors"
                        >
                          <ExternalLink size={12} />
                          {cfg.linkLabel}
                        </button>
                      )}

                      {deleteNotification && (
                        <button
                          type="button"
                          onClick={() => deleteNotification(notifId)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted hover:text-danger transition-colors ml-auto opacity-70 group-hover:opacity-100"
                          title="Dismiss notification"
                        >
                          <Trash2 size={12} />
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-border px-5 py-3 text-xs text-muted flex items-center justify-between bg-surface-50">
          <span>
            Showing <strong className="text-foreground">{filteredNotifications.length}</strong> of{" "}
            <strong className="text-foreground">{totalCount}</strong> notifications
          </span>
          {unreadCount > 0 && (
            <span className="text-primary font-medium">
              {unreadCount} unread alert{unreadCount === 1 ? "" : "s"} requiring attention
            </span>
          )}
        </div>
      </Card>
    </section>
  );
}
