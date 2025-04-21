import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AdminProtectedRoute = () => {
  const { user, admin, isAdmin, loading } = useAuth();

  if (loading) {
    return null; // Hoặc có thể trả về một loading spinner
  }

  if (!admin) {
    return <Navigate to="/admin-login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
