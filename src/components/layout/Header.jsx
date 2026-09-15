  import {
    Menu,
    Bell,
    MessageSquareWarning,
    ChevronDown,
    ChevronRight,
    User,
    Settings,
    LogOut,
  } from "lucide-react";
  import { useState, useEffect } from "react";
  import { NavLink, useLocation, useNavigate } from "react-router-dom";
  import { navigationItems } from "../../constants/navigation";
  import UserImg from "../../assets/logo/Trans_full.png";
  import { useNotifications } from "../../context/NotificationContext";
  import { getComplaints } from "../../api/complaintsApi";
  import Avatar from "../ui/Avatar";

  const singularLabels = {
    "Delivery Partners": "Delivery Partner",
    "Categories": "Category",
    "Offers & Coupons": "Offer",
    "Restaurants": "Restaurant",
    "Users": "User",
    "Orders": "Order",
    "Locations": "Location",
    "Settings": "Settings",
    "Profile": "Profile",
  };

  const settingsTitles = {
    general: "General",
    site: "Site Settings",
    commission: "Commission Settings",
    payment: "Payment Settings",
    delivery: "Delivery Settings",
    notification: "Notification Settings",
    email: "Email Settings",
    sms: "SMS Settings",
    app: "App Settings",
    security: "Security Settings",
    seo: "SEO Settings",
    maintenance: "Maintenance Mode",
    integrations: "Third Party Integrations"
  };

  const getRouteInfo = (pathname) => {
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 0 || pathname === "/dashboard") {
      return { title: "Dashboard", parent: null, parentPath: null };
    }

    // Handle settings specifically
    if (segments[0] === "settings") {
      const settingTab = segments[1] || "general";
      const tabTitle = settingsTitles[settingTab] || "Settings";
      if (settingTab === "general" && segments.length === 1) {
        return { title: tabTitle, parent: "Settings", parentPath: "/settings" };
      }
      return { title: tabTitle, parent: "Settings", parentPath: "/settings" };
    }

    // Find main route from navigation
    const mainRoute = navigationItems.find(
      (item) => pathname === item.path || pathname.startsWith(`${item.path}/`)
    );

    // If we can't find it, fallback
    if (!mainRoute) {
      if (segments[0] === "profile") {
        if (segments[1] === "edit") {
          return { title: "Edit Profile", parent: "Profile", parentPath: "/profile" };
        }
        return { title: "Profile", parent: null, parentPath: null };
      }
      return { title: "Dashboard", parent: null, parentPath: null };
    }

    // Exact match
    if (pathname === mainRoute.path) {
      return { title: mainRoute.label, parent: null, parentPath: null };
    }

    const action = segments[1];
    const singularLabel = singularLabels[mainRoute.label] || mainRoute.label;

    if (action === "add") {
      return { title: `Add ${singularLabel}`, parent: mainRoute.label, parentPath: mainRoute.path };
    }
    
    if (action === "edit") {
      return { title: `Edit ${singularLabel}`, parent: mainRoute.label, parentPath: mainRoute.path };
    }

    // Details page
    return { title: `${singularLabel} Details`, parent: mainRoute.label, parentPath: mainRoute.path };
  };

  function Header({ onMenuClick }) {
    const navigate = useNavigate();
    const location = useLocation();

    const {
      title: pageTitle,
      parent: parentPage,
      parentPath,
    } = getRouteInfo(location.pathname);

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { unreadCount } = useNotifications();
    const [messageCount, setMessageCount] = useState(0);

    useEffect(() => {
      let isMounted = true;
      const fetchComplaints = async () => {
        try {
          const complaints = await getComplaints();
          if (isMounted) {
            const activeComplaints = complaints.filter(
              (c) => c.status === "Open" || c.status === "In Progress"
            );
            setMessageCount(activeComplaints.length);
          }
        } catch (err) {
          console.error("Failed to fetch complaints for header badge", err);
        }
      };
      
      fetchComplaints();
      
      // Optional polling could be added here if real-time isn't set up via context
      const intervalId = setInterval(fetchComplaints, 30000); // 30s
      return () => {
        isMounted = false;
        clearInterval(intervalId);
      };
    }, []);

    const storedUser = localStorage.getItem("vayzo_admin_user");

    const user = storedUser
      ? JSON.parse(storedUser)
      : null;

    if (!user) {
      return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface lg:px-2">
          {/* Placeholder while redirecting or not logged in */}
        </header>
      );
    }

    return (
      <header className="flex h-16 items-center justify-between border-b border-border bg-surface lg:px-2">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg px-1 text-muted hover:text-primary lg:hidden"
          aria-label="Open navigation"
        >
          <Menu size={25} strokeWidth={2.8} />
        </button>

        <div>
          <p className="text-lg font-semibold text-foreground">{pageTitle}</p>

          {parentPage && (
            <div className="flex items-center gap-1 text-xs text-muted">
              <NavLink
                to="/dashboard"
                className="transition-colors hover:text-primary"
              >
                Dashboard
              </NavLink>

              <ChevronRight size={14} strokeWidth={1.8} />

              <NavLink
                to={parentPath}
                className="transition-colors hover:text-primary"
              >
                {parentPage}
              </NavLink>

              <ChevronRight size={14} strokeWidth={1.8} />

              <span>{pageTitle}</span>
            </div>
          )}

          {!parentPage && pageTitle !== "Dashboard" && (
            <div className="flex items-center gap-1 text-xs text-muted">
              <NavLink
                to="/dashboard"
                className="transition-colors hover:text-primary"
              >
                Dashboard
              </NavLink>

              <ChevronRight size={14} strokeWidth={1.8} />

              <span>{pageTitle}</span>
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          <NavLink
            to="/notifications"
            className="relative rounded-lg p-2 text-muted transition hover:bg-primary-light hover:text-primary"
            title="Notifications"
            aria-label={`Notifications (${unreadCount})`}
          >
            <Bell size={20} strokeWidth={1.8} />

            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/complaints"
            className="relative rounded-lg p-2 text-muted transition hover:bg-primary-light hover:text-primary"
            title="Complaints"
            aria-label={`Complaints (${messageCount})`}
          >
            <MessageSquareWarning size={20} strokeWidth={1.8} />

            {messageCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-none text-white">
                {messageCount > 99 ? "99+" : messageCount}
              </span>
            )}
          </NavLink>

          <div className="relative" title="Profile">
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-lg p-1.5 transition hover:bg-primary-light"
              aria-label="Open profile menu"
            >
              <div className="h-9 w-9 overflow-hidden rounded-full">
                <Avatar
                  src={user.profileImage}
                  alt={user.name}
                  identifier={user.id || user.userId || user.email || "admin"}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-foreground">
                  {user.name}
                </p>

                <p className="text-xs text-muted">{user.role}</p>
              </div>

              <ChevronDown
                size={17}
                strokeWidth={1.8}
                className={[
                  "hidden text-muted transition-transform duration-200 sm:block",
                  isProfileOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-border bg-surface p-1 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/profile");
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-primary-light hover:text-primary"
                >
                  <User size={16} /> Profile
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigate("/settings");
                    setIsProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-primary-light hover:text-primary"
                >
                  <Settings size={16} /> Settings
                </button>

                <div className="my-1 border-t border-border" />

                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("vayzo_admin_logged_in");
                    localStorage.removeItem("vayzo_admin_token");
                    localStorage.removeItem("vayzo_admin_user");
                    setIsProfileOpen(false);
                    navigate("/");
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-danger hover:bg-danger/10"
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  export default Header;
