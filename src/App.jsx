import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import Login from "./pages/Login";
import Forgetpassword from "./pages/Forgetpassword";
import OtpVerification from "./pages/OtpVerification";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import UsersAdd from "./pages/UsersAdd";
import UsersDetails from "./pages/UsersDetails";
import Orders from "./pages/Orders";
import Notifications from "./pages/Notifications";
import Complaints from "./pages/Complaints";
import OrderDetails from "./pages/OrderDetails";

import { NotificationProvider } from "./context/NotificationContext";

import DeliveryPartner from "./pages/DeliveryPartner";
import DeliveryPartners from "./pages/DeliveryPartners";
import DeliveryPartnersAdd from "./pages/DeliveryPartnersAdd";

import Categories from "./pages/Categories";
import CategoriesAdd from "./pages/CategoriesAdd";
import CategoriesDetails from "./pages/CategoriesDetails";

import Offers from "./pages/Offers";
import OffersAdd from "./pages/OffersAdd";
import OffersDetails from "./pages/OffersDetails";

import Locations from "./pages/Locations";
import LocationsAdd from "./pages/LocationsAdd";

import Earnings from "./pages/Earnings";

import Restaurants from "./pages/Restaurants";
import RestaurantsAdd from "./pages/RestaurantsAdd";
import RestaurantsDetails from "./pages/RestaurantsDetails";

import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";

import AdminUsers from "./pages/AdminUsers";
import AddAdminUser from "./pages/AddAdminUser";

import ActivityLogs from "./pages/ActivityLogs";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";

import SettingsLayout from "./pages/settings/SettingsLayout";
import GeneralSettings from "./pages/settings/GeneralSettings";
import SiteSettings from "./pages/settings/SiteSettings";
import CommissionSettings from "./pages/settings/CommissionSettings";
import PaymentSettings from "./pages/settings/PaymentSettings";
import DeliverySettings from "./pages/settings/DeliverySettings";
import NotificationSettings from "./pages/settings/NotificationSettings";
import EmailSettings from "./pages/settings/EmailSettings";
import SmsSettings from "./pages/settings/SMSSettings";
import AppSettings from "./pages/settings/AppSettings";
import SecuritySettings from "./pages/settings/SecuritySettings";
import SeoSettings from "./pages/settings/SEOSettings";
import MaintenanceMode from "./pages/settings/MaintenanceMode";
import ThirdPartyIntegrations from "./pages/settings/ThirdPartyIntegrations";

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgetpassword" element={<Forgetpassword />} />
          <Route path="/otp" element={<OtpVerification />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Profile */}
              <Route path="/profile" element={<Outlet />}>
                <Route index element={<Profile />} />
                <Route path="edit" element={<ProfileEdit />} />
              </Route>

              {/* Users */}
              <Route path="/users" element={<Outlet />}>
                <Route index element={<Users />} />
                <Route path="add" element={<UsersAdd />} />
                <Route path="edit/:userId" element={<UsersAdd />} />
                <Route path=":userId" element={<UsersDetails />} />
              </Route>

              {/* Orders */}
              <Route path="/orders" element={<Outlet />}>
                <Route index element={<Orders />} />
                <Route path=":orderId" element={<OrderDetails />} />
              </Route>

              {/* Delivery Partners */}
              <Route path="/delivery" element={<Outlet />}>
                <Route index element={<DeliveryPartners />} />
                <Route path="add" element={<DeliveryPartnersAdd />} />
                <Route
                  path="edit/:partnerId"
                  element={<DeliveryPartnersAdd />}
                />
                <Route path=":partnerId" element={<DeliveryPartner />} />
              </Route>

              {/* Categories */}
              <Route path="/categories" element={<Outlet />}>
                <Route index element={<Categories />} />
                <Route path="add" element={<CategoriesAdd />} />
                <Route path="edit/:categoryId" element={<CategoriesAdd />} />
                <Route path=":categoryId" element={<CategoriesDetails />} />
              </Route>

              {/* Offers */}
              <Route path="/offers" element={<Outlet />}>
                <Route index element={<Offers />} />
                <Route path="add" element={<OffersAdd />} />
                <Route path="edit/:offerId" element={<OffersAdd />} />
                <Route path=":offerId" element={<OffersDetails />} />
              </Route>

              {/* Locations */}
              <Route path="/locations" element={<Outlet />}>
                <Route index element={<Locations />} />
                <Route path="add" element={<LocationsAdd />} />
              </Route>

              {/* Earnings */}
              <Route path="/earnings" element={<Earnings />} />

              {/* Notifications */}
              <Route path="/notifications" element={<Notifications />} />

              {/* Complaints */}
              <Route path="/complaints" element={<Complaints />} />

              {/* Restaurants */}
              <Route path="/restaurants" element={<Outlet />}>
                <Route index element={<Restaurants />} />
                <Route path="add" element={<RestaurantsAdd />} />
                <Route path="edit/:restaurantId" element={<RestaurantsAdd />} />
                <Route path=":restaurantId" element={<RestaurantsDetails />} />
              </Route>

              {/* Admin Users */}
              <Route path="/admin-users" element={<Outlet />}>
                <Route index element={<AdminUsers />} />
                <Route path="add" element={<AddAdminUser />} />
                <Route path="edit/:userId" element={<AddAdminUser />} />
              </Route>

              {/* Activity Logs */}
              <Route path="/activity-logs" element={<ActivityLogs />} />

              {/* Transactions */}
              <Route path="/transactions" element={<Transactions />} />

              {/* Reports */}
              <Route path="/reports" element={<Reports />} />

              {/* Settings */}
              <Route path="/settings" element={<SettingsLayout />}>
                <Route index element={<GeneralSettings />} />
                <Route path="general" element={<GeneralSettings />} />
                <Route path="site" element={<SiteSettings />} />
                <Route path="commission" element={<CommissionSettings />} />
                <Route path="payment" element={<PaymentSettings />} />
                <Route path="delivery" element={<DeliverySettings />} />
                <Route path="notification" element={<NotificationSettings />} />
                <Route path="email" element={<EmailSettings />} />
                <Route path="sms" element={<SmsSettings />} />
                <Route path="app" element={<AppSettings />} />
                <Route path="security" element={<SecuritySettings />} />
                <Route path="seo" element={<SeoSettings />} />
                <Route path="maintenance" element={<MaintenanceMode />} />
                <Route
                  path="integrations"
                  element={<ThirdPartyIntegrations />}
                />
              </Route>
            </Route>
          </Route>
        </Routes>
      </NotificationProvider>
    </BrowserRouter>
  );
}

export default App;
