import { Link, useLocation } from "react-router-dom";
import {
  Package,
  Tag,
  Percent,
  Settings,
  Users,
  House,
  Repeat,
  MessageCircle,
  MessageSquareDot,
} from "lucide-react";

const AdminSidebar = () => {
  const location = useLocation();

  const menuItemDashboard = [
    { icon: House, label: "Dashboard", path: "/admin" },
  ];

  const menuItems = [
    { icon: Package, label: "Product Models", path: "/admin/product-models" },
    { icon: Package, label: "Products", path: "/admin/products" },
    { icon: Tag, label: "Tags", path: "/admin/tags" },
    { icon: Percent, label: "Sales", path: "/admin/sales" },
    { icon: Repeat, label: "Refunds", path: "/admin/refund" },
    // { icon: Users, label: "Customers", path: "/admin/customers" },
    // { icon: MessageCircle, label: "Message", path: "/admin/message" },
    // { icon: MessageSquareDot, label: "Comment", path: "/admin/comment" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white shadow-md min-w-[15%]">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
      </div>
      <nav className="">
        {menuItemDashboard.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
              location.pathname === path
                ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                : ""
            }`}
          >
            <Icon className="w-5 h-5 mr-3 "></Icon>
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800">Manager</h2>
      </div>
      <nav className="mt-4">
        {menuItems.map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={`
              flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100
              ${
                location.pathname === path
                  ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600"
                  : ""
              }
            `}
          >
            <Icon className="w-5 h-5 mr-3" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
