import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminProtectedRoute from "./AdminProtectedRoute";

// Lazy load components
const Home = lazy(() =>
  import("../app/pages/Home").then((module) => ({ default: module.default }))
);
const Login = lazy(() =>
  import("../app/Auth/Login").then((module) => ({ default: module.default }))
);
const Register = lazy(() =>
  import("../app/Auth/Register").then((module) => ({ default: module.default }))
);
const Cart = lazy(() =>
  import("../app/Cart/Cart").then((module) => ({ default: module.default }))
);
const Search = lazy(() =>
  import("../app/Search/Search").then((module) => ({ default: module.default }))
);
const FeaturedProducts = lazy(() =>
  import("../app/Products/FeaturedProducts").then((module) => ({
    default: module.default,
  }))
);
const ProductDetail = lazy(() =>
  import("../app/Products/ProductDetail").then((module) => ({
    default: module.default,
  }))
);
const UserProfile = lazy(() =>
  import("../app/Profile/UserProfile").then((module) => ({
    default: module.default,
  }))
);
const About = lazy(() =>
  import("../app/pages/About").then((module) => ({ default: module.default }))
);
const TagPage = lazy(() =>
  import("../app/pages/TagPage").then((module) => ({ default: module.default }))
);
const BrandPage = lazy(() =>
  import("../app/pages/BrandPage").then((module) => ({
    default: module.default,
  }))
);
const Checkout = lazy(() =>
  import("../components/Checkout").then((module) => ({
    default: module.default,
  }))
);
const ForgotPassword = lazy(() =>
  import("../components/ForgotPassword").then((module) => ({
    default: module.ForgotPassword,
  }))
);
const PurchaseHistory = lazy(() =>
  import("../components/PurchaseHistory").then((module) => ({
    default: module.default,
  }))
);
const RefundProduct = lazy(() =>
  import("../components/RefundProduct").then((module) => ({
    default: module.default,
  }))
);

// Admin pages
const AdminLayout = lazy(() =>
  import("../app/Admin/Layout/AdminLayout").then((module) => ({
    default: module.default,
  }))
);
const AdminDashboard = lazy(() =>
  import("../app/Admin/Pages/AdminDashboard").then((module) => ({
    default: module.default,
  }))
);
const ProductManagement = lazy(() =>
  import("../app/Admin/Pages/ProductManagement").then((module) => ({
    default: module.default,
  }))
);
const ProductModelManagement = lazy(() =>
  import("../app/Admin/Pages/ProductModelManagement").then((module) => ({
    default: module.default,
  }))
);
const TagManagement = lazy(() =>
  import("../app/Admin/Pages/TagManagement").then((module) => ({
    default: module.default,
  }))
);
const SalesManagement = lazy(() =>
  import("../app/Admin/Pages/SalesManagement").then((module) => ({
    default: module.default,
  }))
);
const SettingManager = lazy(() =>
  import("../app/Admin/Pages/SettingManager").then((module) => ({
    default: module.default,
  }))
);
const CustomerManager = lazy(() =>
  import("../app/Admin/Pages/CustomerManager").then((module) => ({
    default: module.default,
  }))
);
const ChatManager = lazy(() =>
  import("../app/Admin/Pages/ChatManager").then((module) => ({
    default: module.default,
  }))
);
const RefundManagement = lazy(() =>
  import("../app/Admin/Pages/RefundManagement").then((module) => ({
    default: module.default,
  }))
);
const AdminLogin = lazy(() =>
  import("../app/Auth/AdminLogin").then((module) => ({
    default: module.default,
  }))
);

const AppRoutes = () => {
  return (
    <Suspense fallback={null}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search />} />
        <Route path="/products" element={<FeaturedProducts />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/tags/:tagSlug" element={<TagPage />} />
        <Route path="/brands/:brandSlug" element={<BrandPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/purchase-history" element={<PurchaseHistory />} />
          <Route path="/refund" element={<RefundProduct />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="product-models" element={<ProductModelManagement />} />
            <Route path="refund" element={<RefundManagement />} />
            <Route path="tags" element={<TagManagement />} />
            <Route path="sales" element={<SalesManagement />} />
            <Route path="settings" element={<SettingManager />} />
            <Route path="customers" element={<CustomerManager />} />
            <Route path="message" element={<ChatManager />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
