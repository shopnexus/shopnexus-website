import React from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import Home from "./app/pages/Home"
import Login from "./app/Auth/Login"
import Register from "./app/Auth/Register"
import Cart from "./app/Cart/Cart"
import Search from "./app/Search/Search"
import FeaturedProducts from "./app/Products/FeaturedProducts"
import ProductDetail from "./app/Products/ProductDetail"
import NavigationBar from "./components/NavigationBar"
import Profile from "./app/Profile/Profile"
import ProductManagement from "./app/Admin/Pages/ProductManagement"
import ProductModelManagement from "./app/Admin/Pages/ProductModelManagement"
import { AuthProvider } from "./contexts/AuthContext"
import AdminLayout from "./app/Admin/Layout/AdminLayout"
import AdminDashboard from "./app/Admin/Pages/AdminDashboard"
import TagManagement from "./app/Admin/Pages/TagManagement"
import SalesManagement from "./app/Admin/Pages/SalesManagement"
import SettingManager from "./app/Admin/Pages/SettingManager"
import CustomerManager from "./app/Admin/Pages/CustomerManager"
import ChatManager from "./app/Admin/Pages/ChatManager"
import RefundProduct from "./components/RefundProduct"
import { finalTransport, queryClient } from "./core/query-client"
import { TransportProvider } from "@connectrpc/connect-query"
import AdminLogin from "./app/Auth/AdminLogin"
import RefundManagement from "./app/Admin/Pages/RefundManagement"
import PurchaseHistory from "./components/PurchaseHistory"
import { ChatBubbleWrapper } from "./components/ChatBubleWrapper"
import Women from './app/pages/Women'
import Men from './app/pages/Men'
import Kids from './app/pages/Kids'
import UserProfile from "./app/Profile/UserProfile"
import About from "./app/pages/About"
import InforFooter from "./components/InfoFooter"
import TagPage from "./app/pages/TagPage"
import Checkout from "./components/Checkout"
import BrandPage from "./app/pages/BrandPage"

const App: React.FC = () => {

	const location = useLocation();
	const isAdminRoute = location.pathname.startsWith("/admin");

	return (
		<TransportProvider transport={finalTransport}>
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					{!isAdminRoute&&<NavigationBar />}
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/login" element={<Login />} />
						<Route path="/admin-login" element={<AdminLogin />} />
						<Route path="/register" element={<Register />} />
						<Route path="/cart" element={<Cart />} />
						<Route path="/checkout" element= {<Checkout/>}/>
						<Route path="/search" element={<Search />} />
						<Route path="/products" element={<FeaturedProducts />} />
						<Route path="/product/:id" element={<ProductDetail />} />
						<Route path="/profile" element={<UserProfile />} />
						<Route path="/purchase-history" element={<PurchaseHistory />} />
						<Route path="/refund" element={<RefundProduct />} />
						<Route path="/women" element={<Women />} />
						<Route path="/men" element={<Men />} />
						<Route path="/kids" element={<Kids />} />
						<Route path="/about" element={<About />} />
						<Route path="/tags/:tagSlug" element={<TagPage />} />
						<Route path="/brands/:brandSlug" element={<BrandPage />} />

						<Route path="/admin" element={<AdminLayout />}>
							<Route index element={<AdminDashboard />} />
							<Route path="products" element={<ProductManagement />} />
							<Route
								path="product-models"
								element={<ProductModelManagement />}
							/>
							<Route path="refund" element={<RefundManagement />} />
							<Route path="tags" element={<TagManagement />} />
							<Route path="sales" element={<SalesManagement />} />
							<Route path="settings" element={<SettingManager />} />
							<Route path="customers" element={<CustomerManager />} />
							<Route path="message" element={<ChatManager />} />
						</Route>
					</Routes>
					{!isAdminRoute&&<InforFooter />}
					
					<ChatBubbleWrapper />
				</AuthProvider>
			</QueryClientProvider>
		</TransportProvider>
	)
}

export default App