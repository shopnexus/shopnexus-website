import { useMemo, useState } from "react"
import { Plus, Edit2, Trash2, Calendar, Search, Tag } from "lucide-react"
import Button from "../../../components/ui/Button"
import Card from "../../../components/ui/Card"
import Modal from "../../../components/ui/Modal"
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
} from "@connectrpc/connect-query"
import {
	createSale,
	deleteSale,
	listBrands,
	listProductModels,
	listSales,
	listTags,
	updateSale,
} from "shopnexus-protobuf-gen-ts"
import { SaleEntity } from "shopnexus-protobuf-gen-ts/pb/product/v1/sale_pb"

interface Sale {
	id: string
	name: string
	description: string
	discountPercentage: number
	startDate: string
	endDate: string
	status: "active" | "scheduled" | "expired"
	productsCount: number
	products: string[] // Product IDs
	createdAt: string
}

const SalesManagement = () => {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedSale, setSelectedSale] = useState<SaleEntity | null>(null)
	const [searchQuery, setSearchQuery] = useState("")
	const [formData, setFormData] = useState({
		tag: "",
		productModelId: undefined as bigint | undefined,
		brandId: undefined as bigint | undefined,
		dateStarted: "",
		dateEnded: "",
		quantity: 0n,
		discountPercent: 0,
		discountPrice: undefined as bigint | undefined,
		maxDiscountPrice: 0n,
	})

	// Fetch sales with pagination
	const {
		data: salesData,
		fetchNextPage,
		hasNextPage,
		isLoading,
		refetch,
	} = useInfiniteQuery(
		listSales,
		{
			pagination: {
				limit: 10,
				page: 1,
			},
		},
		{
			getNextPageParam: (lastPage) => {
				if (!lastPage?.pagination?.nextPage) return undefined
				return {
					page: lastPage.pagination.nextPage,
					limit: lastPage.pagination.limit ?? 10,
				}
			},
			pageParamKey: "pagination",
		}
	)

	// Fetch brands and product models for dropdowns
	const { data: brands } = useQuery(listBrands, {})
	const { data: productModels } = useQuery(listProductModels, {
		pagination: { limit: 100, page: 1 },
	})
	const { data: tags } = useQuery(listTags, {})

	// Mutations for create, update, delete
	const { mutateAsync: mutateCreateSale, isPending: isCreating } = useMutation(
		createSale,
		{
			onSuccess: () => refetch(),
		}
	)
	const { mutateAsync: mutateUpdateSale, isPending: isUpdating } = useMutation(
		updateSale,
		{
			onSuccess: () => refetch(),
		}
	)
	const { mutateAsync: mutateDeleteSale, isPending: isDeleting } = useMutation(
		deleteSale,
		{
			onSuccess: () => refetch(),
		}
	)

	// Flatten sales data from all pages
	const sales = useMemo(() => {
		return salesData?.pages.flatMap((page) => page.data || []) || []
	}, [salesData])

	const handleOpenModal = (sale?: SaleEntity) => {
		if (sale) {
			setSelectedSale(sale)
			setFormData({
				tag: sale.tag || "",
				productModelId: sale.productModelId,
				brandId: sale.brandId,
				dateStarted: new Date(Number(sale.dateStarted))
					.toISOString()
					.split("T")[0],
				dateEnded: sale.dateEnded
					? new Date(Number(sale.dateEnded)).toISOString().split("T")[0]
					: "",
				quantity: sale.quantity,
				discountPercent: sale.discountPercent || 0,
				discountPrice: sale.discountPrice,
				maxDiscountPrice: sale.maxDiscountPrice,
			})
		} else {
			setSelectedSale(null)
			setFormData({
				tag: "",
				productModelId: undefined,
				brandId: undefined,
				dateStarted: "",
				dateEnded: "",
				quantity: 0n,
				discountPercent: 0,
				discountPrice: undefined,
				maxDiscountPrice: 0n,
			})
		}
		setIsModalOpen(true)
	}

	const handleCloseModal = () => {
		setIsModalOpen(false)
		setSelectedSale(null)
	}

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>
	) => {
		const { name, value } = e.target
		setFormData((prev) => {
			const newValue = (() => {
				if (name === "discountPercent") return Number(value)
				if (name === "quantity" || name === "maxDiscountPrice")
					return BigInt(value || 0)
				if (name === "discountPrice") return value ? BigInt(value) : undefined
				if (name === "productModelId" || name === "brandId") {
					return value ? BigInt(value) : undefined
				}
				return value
			})()

			return {
				...prev,
				[name]: newValue,
			}
		})
	}

	const handleSubmit = async () => {
		try {
			const payload = {
				tag: formData.tag || undefined,
				productModelId: formData.productModelId,
				brandId: formData.brandId,
				dateStarted: BigInt(new Date(formData.dateStarted).getTime()),
				dateEnded: formData.dateEnded
					? BigInt(new Date(formData.dateEnded).getTime())
					: undefined,
				quantity: BigInt(formData.quantity),
				discountPercent: formData.discountPercent || undefined,
				discountPrice: formData.discountPrice,
				maxDiscountPrice: BigInt(formData.maxDiscountPrice),
			}

			if (selectedSale) {
				await mutateUpdateSale({
					id: selectedSale.id,
					...payload,
				})
			} else {
				await mutateCreateSale(payload)
			}
			handleCloseModal()
		} catch (error) {
			console.error("Error saving sale:", error)
			alert("Failed to save sale. Please try again.")
		}
	}

	const handleDelete = async (id: bigint) => {
		if (window.confirm("Are you sure you want to delete this sale?")) {
			try {
				await mutateDeleteSale({ id })
			} catch (error) {
				console.error("Error deleting sale:", error)
				alert("Failed to delete sale. Please try again.")
			}
		}
	}

	const getProductModelName = (id?: bigint) => {
		if (!id) return "N/A"
		const model = productModels?.data?.find((m) => m.id === id)
		return model?.name || id.toString()
	}

	const getBrandName = (id?: bigint) => {
		if (!id) return "N/A"
		const brand = brands?.data?.find((b) => b.id === id)
		return brand?.name || id.toString()
	}

	const formatDate = (timestamp?: bigint) => {
		if (!timestamp) return "N/A"
		return new Date(Number(timestamp)).toLocaleDateString()
	}

	const formatCurrency = (amount?: bigint) => {
		if (amount === undefined) return "N/A"
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(Number(amount) / 100)
	}

	const getSaleStatus = (sale: SaleEntity) => {
		const now = Date.now()
		const startTime = Number(sale.dateStarted)
		const endTime = sale.dateEnded ? Number(sale.dateEnded) : Infinity

		if (!sale.isActive) return "inactive"
		if (now < startTime) return "scheduled"
		if (now > endTime) return "expired"
		return "active"
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case "active":
				return "text-green-600 bg-green-100"
			case "scheduled":
				return "text-blue-600 bg-blue-100"
			case "expired":
				return "text-gray-600 bg-gray-100"
			case "inactive":
				return "text-red-600 bg-red-100"
			default:
				return "text-gray-600 bg-gray-100"
		}
	}

	const filteredSales = sales.filter((sale) =>
		(sale.tag || "").toLowerCase().includes(searchQuery.toLowerCase())
	)

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Sales & Discounts</h1>
				<div className="flex items-center space-x-4">
					<div className="relative">
						<Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search sales..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-10 pr-4 py-2 border rounded-lg w-64"
						/>
					</div>
					<Button
						onClick={() => handleOpenModal()}
						className="flex items-center"
						disabled={isCreating}
					>
						<Plus className="w-4 h-4 mr-2" />
						Add Sale
					</Button>
				</div>
			</div>

			<Card>
				<div className="overflow-x-auto">
					<table className="w-full table-fixed divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/6">
									Tag
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/6">
									Target
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/6">
									Discount
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/6">
									Duration
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/8">
									Quantity
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/8">
									Status
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{isLoading ? (
								<tr>
									<td colSpan={7} className="px-4 py-4 text-center">
										Loading sales...
									</td>
								</tr>
							) : filteredSales.length === 0 ? (
								<tr>
									<td colSpan={7} className="px-4 py-4 text-center">
										No sales found
									</td>
								</tr>
							) : (
								filteredSales.map((sale) => {
									const status = getSaleStatus(sale)
									return (
										<tr key={sale.id.toString()}>
											<td className="px-4 py-4 truncate">
												<span className="inline-flex items-center">
													<Tag className="w-4 h-4 mr-1 text-gray-400" />
													{sale.tag || "No tag"}
												</span>
											</td>
											<td className="px-4 py-4">
												<div className="space-y-1">
													{sale.productModelId && (
														<div className="text-sm">
															<span className="font-medium">Product:</span>{" "}
															{getProductModelName(sale.productModelId)}
														</div>
													)}
													{sale.brandId && (
														<div className="text-sm">
															<span className="font-medium">Brand:</span>{" "}
															{getBrandName(sale.brandId)}
														</div>
													)}
													{!sale.productModelId && !sale.brandId && (
														<div className="text-sm text-gray-500">
															All products
														</div>
													)}
												</div>
											</td>
											<td className="px-4 py-4">
												<div className="space-y-1">
													{sale.discountPercent && (
														<div className="font-medium text-green-600">
															{sale.discountPercent}% OFF
														</div>
													)}
													{sale.discountPrice && (
														<div className="font-medium text-green-600">
															Fixed price: {formatCurrency(sale.discountPrice)}
														</div>
													)}
													<div className="text-xs text-gray-500">
														Max: {formatCurrency(sale.maxDiscountPrice)}
													</div>
												</div>
											</td>
											<td className="px-4 py-4">
												<div className="flex items-center text-sm text-gray-500">
													<Calendar className="w-4 h-4 mr-2" />
													<div>
														<div>From: {formatDate(sale.dateStarted)}</div>
														{sale.dateEnded && (
															<div>To: {formatDate(sale.dateEnded)}</div>
														)}
													</div>
												</div>
											</td>
											<td className="px-4 py-4">
												<div className="text-sm">
													<span className="font-medium">
														{sale.used.toString()}
													</span>
													{" / "}
													<span>{sale.quantity.toString()}</span>
												</div>
											</td>
											<td className="px-4 py-4">
												<span
													className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
														status
													)}`}
												>
													{status}
												</span>
											</td>
											<td className="px-4 py-4">
												<div className="flex space-x-1">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleOpenModal(sale)}
														className="p-1"
														disabled={isUpdating}
													>
														<Edit2 className="w-3 h-3" />
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleDelete(sale.id)}
														className="p-1"
														disabled={isDeleting}
													>
														<Trash2 className="w-3 h-3" />
													</Button>
												</div>
											</td>
										</tr>
									)
								})
							)}
						</tbody>
					</table>
				</div>

				{hasNextPage && (
					<div className="flex justify-center mt-4">
						<Button
							variant="outline"
							onClick={() => fetchNextPage()}
							disabled={isLoading}
						>
							Load More
						</Button>
					</div>
				)}
			</Card>

			<Modal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				title={selectedSale ? "Edit Sale" : "Add New Sale"}
			>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Tag
						</label>
						<input
							type="text"
							name="tag"
							value={formData.tag}
							onChange={handleChange}
							className="w-full px-3 py-2 border rounded-lg"
							placeholder="Enter sale tag (optional)"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Target Product Model (optional)
						</label>
						<select
							name="productModelId"
							value={formData.productModelId?.toString() || ""}
							onChange={handleChange}
							className="w-full px-3 py-2 border rounded-lg"
						>
							<option value="">Select a product model</option>
							{productModels?.data?.map((model) => (
								<option key={model.id.toString()} value={model.id.toString()}>
									{model.name}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Target Brand (optional)
						</label>
						<select
							name="brandId"
							value={formData.brandId?.toString() || ""}
							onChange={handleChange}
							className="w-full px-3 py-2 border rounded-lg"
						>
							<option value="">Select a brand</option>
							{brands?.data?.map((brand) => (
								<option key={brand.id.toString()} value={brand.id.toString()}>
									{brand.name}
								</option>
							))}
						</select>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Start Date
							</label>
							<input
								type="date"
								name="dateStarted"
								value={formData.dateStarted}
								onChange={handleChange}
								className="w-full px-3 py-2 border rounded-lg"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								End Date (optional)
							</label>
							<input
								type="date"
								name="dateEnded"
								value={formData.dateEnded}
								onChange={handleChange}
								className="w-full px-3 py-2 border rounded-lg"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Quantity
						</label>
						<input
							type="number"
							name="quantity"
							value={formData.quantity.toString()}
							onChange={handleChange}
							min="0"
							className="w-full px-3 py-2 border rounded-lg"
							required
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Discount Percentage (%)
							</label>
							<input
								type="number"
								name="discountPercent"
								value={formData.discountPercent}
								onChange={handleChange}
								min="0"
								max="100"
								className="w-full px-3 py-2 border rounded-lg"
								placeholder="Enter discount percentage"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Fixed Price (cents)
							</label>
							<input
								type="number"
								name="discountPrice"
								value={formData.discountPrice?.toString() || ""}
								onChange={handleChange}
								min="0"
								className="w-full px-3 py-2 border rounded-lg"
								placeholder="Enter fixed price (in cents)"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Maximum Discount (cents)
						</label>
						<input
							type="number"
							name="maxDiscountPrice"
							value={formData.maxDiscountPrice.toString()}
							onChange={handleChange}
							min="0"
							className="w-full px-3 py-2 border rounded-lg"
							required
						/>
					</div>
				</div>

				<div className="flex justify-end space-x-2 mt-6">
					<Button variant="outline" onClick={handleCloseModal}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
						{selectedSale ? "Update" : "Add"} Sale
					</Button>
				</div>
			</Modal>
		</div>
	)
}

export default SalesManagement
