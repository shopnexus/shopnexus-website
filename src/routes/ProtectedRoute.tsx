import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = () => {
  const { user,admin, loading } = useAuth();

  if (loading) {
    return null; // Hoặc có thể trả về một loading spinner
  }

  if(admin){
    return <p>you is a admin</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }



  return <Outlet />;
};

export default ProtectedRoute;
