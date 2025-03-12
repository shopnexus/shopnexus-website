import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { auth } from "../../firebase";
import AdminSidebar from "../Layout/AdminSidebar";
import AdminTopBar from "../Layout/AdminTopBar";

const AdminLayout = () => {
  const navigate = useNavigate();

  // useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged(async (user) => {
  //     if (!user?.email?.endsWith('@shopnexus.com')) {
  //       navigate('/login');
  //     }
  //   });

  //   return () => unsubscribe();
  // }, [navigate]); 

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminTopBar />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 