import React from "react"
import { Routes, Route } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import Home from "./app/Home/Home"
import Login from "./app/Auth/Login"
import Register from "./app/Auth/Register"
import Cart from "./app/Cart/Cart"
import Search from "./app/Search/Search"
import Archive from "./app/Archive/Archive"
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
import RefundProduct from "./app/Products/Product/RefundProduct"
import { finalTransport, queryClient } from "./core/query-client"
import { TransportProvider } from "@connectrpc/connect-query"
import AdminLogin from "./app/Auth/AdminLogin"
import RefundManagement from "./app/Admin/Pages/RefundManagement"
import { ChatBubbleWrapper } from "./components/ChatBubleWrapper"

const App: React.FC = () => {
	return (
		<TransportProvider transport={finalTransport}>
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/login" element={<Login />} />
						<Route path="/admin-login" element={<AdminLogin />} />
						<Route path="/register" element={<Register />} />
						<Route path="/cart" element={<Cart />} />
						<Route path="/search" element={<Search />} />
						<Route path="archive" element={<Archive />} />
						<Route path="/products" element={<FeaturedProducts />} />
						<Route path="/product/:id" element={<ProductDetail />} />
						<Route path="/profile" element={<Profile />} />
						<Route path="/refund" element={<RefundProduct />} />

						<Route path="/admin" element={<AdminLayout />}>
							<Route index element={<AdminDashboard />} />
							<Route path="products" element={<ProductManagement />} />
							<Route
								path="product-models"
								element={<ProductModelManagement />}
							/>
							<Route path="refund" element = {<RefundManagement/>}></Route>
							<Route path="tags" element={<TagManagement />} />
							<Route path="sales" element={<SalesManagement />} />
							<Route path="settings" element={<SettingManager />} />
							<Route path="customers" element={<CustomerManager />} />
						</Route>
					</Routes>
					{!location.pathname.startsWith("/admin") && <NavigationBar />  }
					{!location.pathname.startsWith("/admin") && <ChatBubbleWrapper />  }
				</AuthProvider>
			</QueryClientProvider>
		</TransportProvider>
	)
}

export default App