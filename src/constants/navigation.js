import {
  LayoutDashboard,
  Users,
  Truck,
  ShoppingCart,
  ArrowLeftRight,
  Wallet,
  MapPin,
  Tags,
  Store,
  Ticket,
  MessageSquareWarning,
  Bell,
  FileBarChart,
  Settings,
  ShieldUser,
  Activity,
} from "lucide-react";

export const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Customers",
    path: "/users",
    icon: Users,
  },
  {
    label: "Delivery Partners",
    path: "/delivery",
    icon: Truck,
  },
  {
    label: "Orders",
    path: "/orders",
    icon: ShoppingCart,
  },

  {
    label: "Earnings",
    path: "/earnings",
    icon: Wallet,
  },
  {
    label: "Locations",
    path: "/locations",
    icon: MapPin,
  },
  {
    label: "Categories",
    path: "/categories",
    icon: Tags,
  },
  {
    label: "Restaurants",
    path: "/restaurants",
    icon: Store,
  },
  {
    label: "Offers & Coupons",
    path: "/offers",
    icon: Ticket,
  },
  {
    label: "Complaints",
    path: "/complaints",
    icon: MessageSquareWarning,
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
  {
    label: "Transactions",
    path: "/transactions",
    icon: ArrowLeftRight,
  },
  {
    label: "Reports",
    path: "/reports",
    icon: FileBarChart,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
  {
    label: "Admin Users",
    path: "/admin-users",
    icon: ShieldUser,
  },
  {
    label: "Activity Logs",
    path: "/activity-logs",
    icon: Activity,
  },
];
