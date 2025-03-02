import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './app/Home/Home';
import Login from './app/Login_Resigter/Login';
import Register from './app/Login_Resigter/Register';
import Cart from './app/Cart/Cart';
import FeaturedProducts from './app/Product/FeaturedProducts';
import ProductDetail from './app/Product/ProductDetail';
import NavigationBar from './components/NavigationBar';
import Profile from './app/Profile/Profile'
import ProductManagement from './app/Admin/Pages/ProductManagement';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './app/Admin/Layout/AdminLayout';
import AdminDashboard from './app/Admin/Pages/AdminDashboard';
import TagManagement from './app/Admin/Pages/TagManagement';
import SalesManagement from './app/Admin/Pages/SalesManagement';
import SettingManager from './app/Admin/Pages/SettingManager';
import CustomerManager from './app/Admin/Pages/CustomerManager';
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/products" element={<FeaturedProducts />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/admin" element={
          
            <AdminLayout />
          
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="tags" element={<TagManagement />} />
          <Route path="sales" element={<SalesManagement />} />
          <Route path="settings" element={<SettingManager/>}/>
          <Route path="customers" element={<CustomerManager/>}/>
        </Route>
      </Routes>
      {!location.pathname.startsWith('/admin') && <NavigationBar />}
    </AuthProvider>
  );
};

export default App;
