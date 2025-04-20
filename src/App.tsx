import React from "react"
import { useLocation } from "react-router-dom"
import { QueryClientProvider } from "@tanstack/react-query"
import NavigationBar from "./components/NavigationBar"
import { AuthProvider } from "./contexts/AuthContext"
import { finalTransport, queryClient } from "./core/query-client"
import { TransportProvider } from "@connectrpc/connect-query"
import { ChatBubbleWrapper } from "./components/ChatBubleWrapper"
import InforFooter from "./components/InfoFooter"
import AppRoutes from "./routes"

const App: React.FC = () => {
	const location = useLocation();
	const isAdminRoute = location.pathname.startsWith("/admin");

	return (
		<TransportProvider transport={finalTransport}>
			<QueryClientProvider client={queryClient}>
				<AuthProvider>
					{!isAdminRoute && <NavigationBar />}
					<AppRoutes />
					{!isAdminRoute && <InforFooter />}
					<ChatBubbleWrapper />
				</AuthProvider>
			</QueryClientProvider>
		</TransportProvider>
	)
}

export default App