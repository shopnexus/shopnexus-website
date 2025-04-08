// PurchaseHistory.tsx
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

export interface ProductInfor {
	id: string
	type: string
	brandId: string
	name: string
	description: string
	listPrice: number
	dateManufactured: string
	resources: string[]
	tags: string[]
}

export interface PaymentProductItem {
	itemQuantity: {
		itemId: string
		quantity: string
	}
	serialIds: string[]
	price: string
	totalPrice: string
}

export interface Payment {
	id: string
	userId: string
	method: string
	status: string
	address: string
	total: string
	dateCreated: string
	products: PaymentProductItem[]
}

const dummyProducts: ProductInfor[] = [
	{
		id: "20",
		type: "5",
		brandId: "2",
		name: "Luxurious Granite Car",
		description: "The cyan Chips combines Trinidad and Tobago aesthetics with Roentgenium-based durability",
		listPrice: 395000,
		dateManufactured: "1730357904267",
		resources: ["https://picsum.photos/seed/0bOxh/800/600?blur=10"],
		tags: ["Games", "Jewelry", "Outdoors"],
	},
	{
		id: "21",
		type: "3",
		brandId: "1",
		name: "Incredible Wooden Keyboard",
		description: "Crafted from premium wood and powered by AI typing enhancements.",
		listPrice: 120000,
		dateManufactured: "1630357904267",
		resources: ["https://picsum.photos/seed/w0odkbd/800/600?grayscale"],
		tags: ["Electronics", "Office"],
	},
	{
		id: "22",
		type: "2",
		brandId: "3",
		name: "Sleek Steel Watch",
		description: "Stainless steel body with water-resistant features.",
		listPrice: 250000,
		dateManufactured: "1654357904267",
		resources: ["https://picsum.photos/seed/watch/800/600"],
		tags: ["Fashion", "Accessories"],
	},
]

const dummyPayments: Payment[] = [
	{
		id: "17",
		userId: "14",
		method: "PAYMENT_METHOD_VNPAY",
		status: "STATUS_SUCCESS",
		address: "123 Main St, City, Country",
		total: "1580000",
		dateCreated: "1744019502822",
		products: [
			{
				itemQuantity: {
					itemId: "20",
					quantity: "4",
				},
				serialIds: ["PYSIUFEKG8", "GPPBTJKXGD"],
				price: "395000",
				totalPrice: "1580000",
			},
		],
	},
	{
		id: "18",
		userId: "15",
		method: "PAYMENT_METHOD_COD",
		status: "STATUS_PENDING",
		address: "456 Another St, Other City",
		total: "120000",
		dateCreated: "1733019502822",
		products: [
			{
				itemQuantity: {
					itemId: "21",
					quantity: "1",
				},
				serialIds: [],
				price: "120000",
				totalPrice: "120000",
			},
		],
	},
	{
		id: "19",
		userId: "16",
		method: "PAYMENT_METHOD_MOMO",
		status: "STATUS_SUCCESS",
		address: "789 Third St, New Town",
		total: "250000",
		dateCreated: "1720019502822",
		products: [
			{
				itemQuantity: {
					itemId: "22",
					quantity: "1",
				},
				serialIds: [],
				price: "250000",
				totalPrice: "250000",
			},
		],
	},
]

const formatDate = (timestamp: string) => {
	const date = new Date(parseInt(timestamp))
	return date.toLocaleDateString()
}

const PurchaseHistory: React.FC = () => {
	const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
	const navigate = useNavigate()

	const handleViewPayment = (id: string) => {
		const payment = dummyPayments.find(p => p.id === id)
		if (payment) {
			setSelectedPayment(payment)
		}
	}

	const handleCloseDetail = () => {
		setSelectedPayment(null)
	}

	const handleReturnOrder = (id: string) => {
		alert(`Yêu cầu hoàn hàng cho đơn ${id} đã được gửi!`)
	}

	const findProductById = (id: string) => {
		return dummyProducts.find(p => p.id === id)
	}

	return (
		<div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen">
			<h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Lịch sử mua hàng</h1>

			<div className="grid gap-6 max-w-4xl mx-auto">
				{dummyPayments.map((payment, index) => (
					<div
						key={payment.id}
						className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow relative"
					>
						<h2 className="text-xl font-semibold text-gray-900 mb-3">
							Đơn hàng số {index + 1}
						</h2>

						{payment.products.map((item, idx) => {
							const product = findProductById(item.itemQuantity.itemId)
							if (!product) return null

							return (
								<div key={idx} className="flex gap-4 mb-4">
									<img
										src={product.resources[0]}
										alt={product.name}
										className="w-28 h-28 object-cover rounded-xl border"
									/>
									<div className="flex-1">
										<h3 className="text-lg font-medium text-gray-800">{product.name}</h3>
										<p className="text-sm text-gray-600 mb-1">{product.description}</p>
										<p className="text-sm text-gray-700">
											Số lượng: <span className="font-semibold">{item.itemQuantity.quantity}</span>
										</p>
										<p className="text-sm text-gray-700">
											Đơn giá:{" "}
											<span className="text-blue-600">
												{parseInt(item.price).toLocaleString()} ₫
											</span>
										</p>
										<p className="text-sm text-gray-700">
											Tổng giá:{" "}
											<span className="text-red-500 font-semibold">
												{parseInt(item.totalPrice).toLocaleString()} ₫
											</span>
										</p>
										<p className="text-sm text-gray-500 italic">
											Ngày tạo đơn hàng: {formatDate(payment.dateCreated)}
										</p>
										<p className="text-me text-black-100">
											Trạng thái: {payment.status}
										</p>
									</div>
								</div>
							)
						})}

						<div className="mt-2 text-right space-x-2">
							<button
								onClick={() => handleViewPayment(payment.id)}
								className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded-md shadow-sm transition-all duration-200"
							>
								Xem chi tiết
							</button>
							<button
								onClick={() => handleReturnOrder(payment.id)}
								className="cursor-pointer bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-4 rounded-md shadow-sm transition-all duration-200"
							>
								Trả hàng/ hoàn tiền
							</button>
						</div>
					</div>
				))}
			</div>

			{/* Overlay chi tiết đơn hàng */}
			{selectedPayment && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-sm px-4">
					<div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 border-4 border-red-500">
						<button
							onClick={handleCloseDetail}
							className="cursor-pointer absolute top-4 right-4 text-gray-500 hover:text-red-500 text-2xl font-bold"
						>
							&times;
						</button>

						<h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
							Hóa đơn chi tiết
						</h2>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-sm mb-6">
							<p><strong>Mã đơn hàng:</strong> {selectedPayment.id}</p>
							<p><strong>Phương thức thanh toán:</strong> {selectedPayment.method}</p>
							<p><strong>Trạng thái:</strong> {selectedPayment.status}</p>
							<p><strong>Địa chỉ:</strong> {selectedPayment.address}</p>
							<p><strong>Ngày tạo:</strong> {formatDate(selectedPayment.dateCreated)}</p>
						</div>

						<div className="space-y-6">
							{selectedPayment.products.map((item, idx) => {
								const product = findProductById(item.itemQuantity.itemId)
								if (!product) return null

								return (
									<div key={idx} className="flex gap-4 border rounded-lg p-4 shadow-sm items-center">
										<img
											src={product.resources[0] || "/default-product.png"}
											alt={product.name}
											className="w-28 h-28 object-cover rounded-lg border"
										/>
										<div className="flex-1 space-y-1">
											<h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
											<p className="text-sm text-gray-600">{product.description}</p>
											<p className="text-sm">Số lượng: <strong>{item.itemQuantity.quantity}</strong></p>
											<p className="text-sm">Đơn giá: <strong>{parseInt(item.price).toLocaleString()} ₫</strong></p>
											<p className="text-sm text-red-600 font-semibold">
												Tổng: {parseInt(item.totalPrice).toLocaleString()} ₫
											</p>
										</div>
									</div>
								)
							})}
						</div>

						<div className="mt-8 text-right text-xl font-bold text-red-600">
							Tổng cộng: {parseInt(selectedPayment.total).toLocaleString()} ₫
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default PurchaseHistory
