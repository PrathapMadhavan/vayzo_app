import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const isLoggedIn = localStorage.getItem("vayzo_admin_logged_in");
  const hasToken = localStorage.getItem("vayzo_admin_token");

  return (isLoggedIn && hasToken) ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
