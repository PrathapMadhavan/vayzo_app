import {
  Bell,
  CheckCheck,
  Clock3,
  CreditCard,
  Package,
  Search,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { useNotifications } from "../context/NotificationContext";

const typeConfig = {
  ORDER: {
    label: "Order",
    icon: Package,
    variant: "info",
  },
  USER: {
    label: "User",
    icon: UserRound,
    variant: "success",
  },
  COMPLAINT: {
    label: "Complaint",
    icon: ShieldAlert,
    variant: "danger",
  },
  PAYMENT: {
    label: "Payment",
    icon: CreditCard,
    variant: "warning",
  },
};

const filters = ["All", "Unread", "Read"];

function Notifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [type, setType] = useState("All Types");

  const filteredNotifications = useMemo(() => {
    const search = query.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesSearch =
        !search ||
        [notification.title, notification.message, notification.type]
          .join(" ")
          .toLowerCase()
          .includes(search);

      const matchesFilter =
        filter === "All" ||
        (filter === "Unread" && !notification.isRead) ||
        (filter === "Read" && notification.isRead);

      const matchesType = type === "All Types" || notification.type === type;

      return matchesSearch && matchesFilter && matchesType;
    });
  }, [notifications, query, filter, type]);

  const readCount = notifications.length - unreadCount;

  const resetFilters = () => {
    setQuery("");
    setFilter("All");
    setType("All Types");
  };

  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Total */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light">
                <Bell size={18} className="text-primary" />
              </div>

              <div>
                <p className="text-xs text-muted">Total Notifications</p>

                <p className="mt-0.5 text-xl font-semibold text-foreground">
                  {notifications.length}
                </p>
              </div>
            </div>
          </div>

          {/* Unread */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light">
                <Clock3 size={18} className="text-primary" />
              </div>

              <div>
                <p className="text-xs text-muted">Unread</p>

                <p className="mt-0.5 text-xl font-semibold text-foreground">
                  {unreadCount}
                </p>
              </div>
            </div>
          </div>

          {/* Read */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light">
                <CheckCheck size={18} className="text-primary" />
              </div>

              <div>
                <p className="text-xs text-muted">Read</p>

                <p className="mt-0.5 text-xl font-semibold text-foreground">
                  {readCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_0.7fr_auto]">
            {/* Search */}
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />

              <Input
                id="notification-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search notifications..."
                className="h-10 pl-10 text-xs"
              />
            </div>

            {/* Type */}
            <Select
              id="notification-type"
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="h-10 text-xs"
            >
              <option>All Types</option>
              <option value="ORDER">Order</option>
              <option value="USER">User</option>
              <option value="COMPLAINT">Complaint</option>
              <option value="PAYMENT">Payment</option>
            </Select>

            {/* Reset */}
            <Button variant="secondary" size="sm" onClick={resetFilters}>
              Reset
            </Button>
          </div>

          {/* Filter Tabs + Mark All */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={[
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition",
                    filter === item
                      ? "bg-primary text-white"
                      : "bg-background text-muted hover:bg-primary-light hover:text-primary",
                  ].join(" ")}
                >
                  {item}
                </button>
              ))}
            </div>

            {unreadCount > 0 && (
              <Button variant="secondary" size="sm" onClick={markAllAsRead}>
                <CheckCheck size={14} className="mr-1.5" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification) => {
                const config = typeConfig[notification.type] || typeConfig.USER;

                const Icon = config.icon;

                return (
                  <div
                    key={notification.notificationId}
                    className={[
                      "flex gap-3 p-4 transition",
                      !notification.isRead
                        ? "bg-primary-light/30"
                        : "bg-surface",
                    ].join(" ")}
                  >
                    {/* Icon */}
                    <div
                      className={[
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        !notification.isRead
                          ? "bg-primary-light text-primary"
                          : "bg-background text-muted",
                      ].join(" ")}
                    >
                      <Icon size={18} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={[
                                "text-sm",
                                !notification.isRead
                                  ? "font-semibold text-foreground"
                                  : "font-medium text-foreground",
                              ].join(" ")}
                            >
                              {notification.title}
                            </h3>

                            <Badge
                              variant={config.variant}
                              className="h-5 px-1.5 text-[9px]"
                            >
                              {config.label}
                            </Badge>

                            {!notification.isRead && (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                          </div>

                          <p className="mt-1 text-xs leading-5 text-muted">
                            {notification.message}
                          </p>
                        </div>

                        <span className="shrink-0 text-[10px] text-subtle">
                          {notification.createdAt}
                        </span>
                      </div>

                      {/* Mark Read */}
                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={() =>
                            markAsRead(notification.notificationId)
                          }
                          className="mt-2 text-[11px] font-semibold text-primary hover:underline"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="flex min-h-60 flex-col items-center justify-center p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light">
                <Bell size={21} className="text-primary" />
              </div>

              <h3 className="mt-3 text-sm font-semibold text-foreground">
                No notifications found
              </h3>

              <p className="mt-1 max-w-sm text-xs text-muted">
                There are no notifications matching your current search or
                filters.
              </p>

              <Button
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={resetFilters}
              >
                Clear filters
              </Button>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-border px-4 py-3 text-xs text-muted">
            Showing {filteredNotifications.length} of {notifications.length}{" "}
            notifications
          </div>
        </div>
      </div>
    </section>
  );
}

export default Notifications;
