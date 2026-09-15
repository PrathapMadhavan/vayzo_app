import { NavLink, useLocation } from "react-router-dom";
import {
  Bell,
  CreditCard,
  Database,
  FileText,
  Globe,
  LayoutGrid,
  Mail,
  MonitorCog,
  Settings as SettingsIcon,
  Shield,
  Smartphone,
  TrendingUp,
  Truck,
} from "lucide-react";

const menuItems = [
  { label: "General Settings", path: "/settings/general", icon: LayoutGrid },
  { label: "Site Settings", path: "/settings/site", icon: Globe },
  { label: "Commission Settings", path: "/settings/commission", icon: TrendingUp },
  { label: "Payment Settings", path: "/settings/payment", icon: CreditCard },
  { label: "Delivery Settings", path: "/settings/delivery", icon: Truck },
  { label: "Notification Settings", path: "/settings/notifications", icon: Bell },
  { label: "Email Settings", path: "/settings/email", icon: Mail },
  { label: "SMS Settings", path: "/settings/sms", icon: Smartphone },
  { label: "App Settings", path: "/settings/app", icon: Smartphone },
  { label: "Security Settings", path: "/settings/security", icon: Shield },
  { label: "SEO Settings", path: "/settings/seo", icon: FileText },
  { label: "Maintenance Mode", path: "/settings/maintenance", icon: MonitorCog },
  { label: "Third Party Integrations", path: "/settings/integrations", icon: Database },
];

function Settings() {
  const location = useLocation();
  const activePath =
    location.pathname === "/settings" || location.pathname === "/settings/general"
      ? "/settings/general"
      : location.pathname;

  return (
    <section className="min-h-full bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4 flex items-center gap-2 text-xs text-muted">
          <span>Dashboard</span>
          <span>&gt;</span>
          <span className="font-medium text-foreground">Settings</span>
        </div>

        <h1 className="mb-5 text-2xl font-semibold text-foreground">Settings</h1>

        <div className="flex flex-col gap-5 xl:flex-row">
          <aside className="w-full xl:max-w-[280px]">
            <div className="rounded-2xl border border-border bg-surface p-3 shadow-sm">
              <div className="mb-3 flex items-center gap-2 px-2 py-2">
                <SettingsIcon size={18} className="text-primary" />
                <span className="text-sm font-semibold text-foreground">Settings Menu</span>
              </div>

              <nav className="space-y-1">
                {menuItems.map(({ label, path, icon: Icon }) => {
                  const isActive = activePath === path;

                  return (
                    <NavLink
                      key={label}
                      to={path}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "text-muted hover:bg-primary-light hover:text-primary"
                      }`}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span>{label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="flex-1">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">
                    Settings module
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-foreground">
                    General Settings
                  </h2>
                </div>
                <span className="rounded-full bg-primary-light px-2.5 py-1 text-xs font-medium text-primary">
                  Ready
                </span>
              </div>

              <div className="flex min-h-[260px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
                    <SettingsIcon size={26} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Settings shell ready
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-muted">
                    This is the main Settings layout shell. Individual setting pages will be added later one by one.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Settings;
