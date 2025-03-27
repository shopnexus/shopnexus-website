import { useState, useRef, useCallback, useEffect } from "react"
import { Plus, Edit2, Trash2, Search, X, Upload, ArrowLeft } from "lucide-react"
import Button from "../../../components/ui/Button"
import Card from "../../../components/ui/Card"
import Modal from "../../../components/ui/Modal"
import * as tus from "tus-js-client"
import {
	createProduct,
	deleteProduct,
	getProductModel,
	listProducts,
	updateProduct,
} from "shopnexus-protobuf-gen-ts"
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
} from "@connectrpc/connect-query"
import { ProductEntity } from "shopnexus-protobuf-gen-ts/pb/product/v1/product_pb"
import { useSearchParams, useNavigate } from "react-router-dom"

const ProductManagement = () => {
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const modelId = searchParams.get("modelId")
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedProduct, setSelectedProduct] = useState<ProductEntity | null>(
		null
	)
	const [searchQuery, setSearchQuery] = useState("")
	const [formData, setFormData] = useState({
		serialId: "",
		productModelId: 0,
		quantity: 0,
		sold: 0,
		addPrice: 0,
		isActive: true,
		metadata: {},
		resources: [] as string[],
	})
	const [uploadProgress, setUploadProgress] = useState<{
		[key: string]: number
	}>({})
	const [isUploading, setIsUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const { data: productModel } = useQuery(
		getProductModel,
		{
			id: BigInt(formData.productModelId),
		},
		{
			enabled: !!formData.productModelId,
		}
	)
	const { data: products } = useInfiniteQuery(
		listProducts,
		{
			pagination: {
				page: 1,
				limit: 10,
			},
			productModelId: modelId ? BigInt(modelId) : undefined,
		},
		{
			getNextPageParam: (lastPage) => {
				if (lastPage.pagination?.nextPage) {
					return {
						page: lastPage.pagination?.nextPage,
						limit: lastPage.pagination?.limit,
					}
				}
				return null
			},
			pageParamKey: "pagination",
		}
	)

	const { mutateAsync: mutateCreateProduct } = useMutation(createProduct)
	const { mutateAsync: mutateUpdateProduct } = useMutation(updateProduct)
	const { mutateAsync: mutateDeleteProduct } = useMutation(deleteProduct)

	const openModal = (product?: ProductEntity) => {
		if (product) {
			setSelectedProduct(product)
			setFormData({
				serialId: product.serialId,
				productModelId: Number(product.productModelId),
				quantity: Number(product.quantity),
				sold: Number(product.sold),
				addPrice: Number(product.addPrice),
				isActive: product.isActive,
				metadata: JSON.parse(new TextDecoder().decode(product.metadata)),
				resources: product.resources,
			})
		} else {
			setSelectedProduct(null)
			setFormData({
				serialId: "",
				productModelId: 0,
				quantity: 0,
				sold: 0,
				addPrice: 0,
				isActive: true,
				metadata: {},
				resources: [],
			})
		}
		setIsModalOpen(true)
	}

	const closeModal = () => {
		setIsModalOpen(false)
		setSelectedProduct(null)
	}

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: name === "price" || name === "stock" ? Number(value) : value,
		}))
	}

	const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const tags = e.target.value.split(",").map((tag) => tag.trim())
		setFormData((prev) => ({ ...prev, tags }))
	}

	const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const images = e.target.value.split(",").map((url) => url.trim())
		setFormData((prev) => ({ ...prev, images }))
	}

	const uploadFile = useCallback(async (file: File) => {
		return new Promise<string>((resolve, reject) => {
			// Create a new tus upload
			const upload = new tus.Upload(file, {
				endpoint: "http://localhost:50051/files/",
				retryDelays: [0, 3000, 5000, 10000, 20000],
				metadata: {
					filename: file.name,
					filetype: file.type,
				},
				onError: (error) => {
					console.error("Failed to upload:", error)
					reject(error)
				},
				onProgress: (bytesUploaded, bytesTotal) => {
					const percentage = Math.round((bytesUploaded / bytesTotal) * 100)
					setUploadProgress((prev) => ({
						...prev,
						[file.name]: percentage,
					}))
				},
				onSuccess: () => {
					// Get the URL from the completed upload
					const uploadUrl = upload.url
					resolve(uploadUrl || "")
				},
			})

			// Start the upload
			upload.start()
		})
	}, [])

	const handleFileSelect = useCallback(
		async (e: React.ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files
			if (!files || files.length === 0) return

			setIsUploading(true)
			const uploadedUrls: string[] = []

			try {
				for (let i = 0; i < files.length; i++) {
					const file = files[i]
					const url = await uploadFile(file)
					uploadedUrls.push(url)
				}

				setFormData((prev) => ({
					...prev,
					resources: [...prev.resources, ...uploadedUrls],
				}))
			} catch (error) {
				console.error("Error uploading files:", error)
			} finally {
				setIsUploading(false)
				setUploadProgress({})
				if (fileInputRef.current) {
					fileInputRef.current.value = ""
				}
			}
		},
		[uploadFile]
	)

	const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
	}, [])

	const handleDrop = useCallback(
		async (e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault()
			e.stopPropagation()

			const files = e.dataTransfer.files
			if (!files || files.length === 0) return

			setIsUploading(true)
			const uploadedUrls: string[] = []

			try {
				for (let i = 0; i < files.length; i++) {
					const file = files[i]
					const url = await uploadFile(file)
					uploadedUrls.push(url)
				}

				setFormData((prev) => ({
					...prev,
					resources: [...prev.resources, ...uploadedUrls],
				}))
			} catch (error) {
				console.error("Error uploading files:", error)
			} finally {
				setIsUploading(false)
				setUploadProgress({})
			}
		},
		[uploadFile]
	)

	const removeImage = useCallback((index: number) => {
		setFormData((prev) => ({
			...prev,
			resources: prev.resources.filter((_, i) => i !== index),
		}))
	}, [])

	const handleSubmit = async () => {
		try {
			const metadataBuffer = new TextEncoder().encode(
				JSON.stringify(formData.metadata)
			)

			if (selectedProduct) {
				// Update existing product
				await mutateUpdateProduct({
					id: BigInt(selectedProduct.id),
					serialId: formData.serialId,
					productModelId: BigInt(formData.productModelId),
					quantity: BigInt(formData.quantity),
					addPrice: BigInt(formData.addPrice),
					isActive: formData.isActive,
					metadata: metadataBuffer,
					resources: formData.resources,
				})
			} else {
				// Create new product
				await mutateCreateProduct({
					serialId: formData.serialId,
					productModelId: BigInt(formData.productModelId),
					quantity: BigInt(formData.quantity),
					addPrice: BigInt(formData.addPrice),
					isActive: formData.isActive,
					metadata: metadataBuffer,
					resources: formData.resources,
				})
			}

			// Close modal after successful operation
			closeModal()
		} catch (error) {
			console.error("Error saving product:", error)
		}
	}

	const handleDelete = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this product?")) {
			await mutateDeleteProduct({
				id: BigInt(id),
			})
		}
	}

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value)
	}

	useEffect(() => {
		if (modelId) {
			setFormData((prev) => ({
				...prev,
				productModelId: Number(modelId),
			}))
		}
	}, [modelId])

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				{modelId ? (
					<div className="flex items-center">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => navigate("/admin/product-models")}
							className="mr-2 flex items-center text-blue-600 hover:bg-blue-50 transition-colors"
						>
							<ArrowLeft className="w-4 h-4 mr-1" />
							Back to Models
						</Button>
						<h1 className="text-2xl font-bold">
							Model: {productModel?.data?.name}
						</h1>
					</div>
				) : (
					<h1 className="text-2xl font-bold">Products</h1>
				)}
				<div className="flex items-center space-x-4">
					<div className="relative">
						<Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search products..."
							value={searchQuery}
							onChange={handleSearch}
							className="pl-10 pr-4 py-2 border rounded-lg w-64"
						/>
					</div>
					<Button
						onClick={() => openModal()}
						className="bg-blue-600 hover:bg-blue-700 text-white transition-colors inline-flex items-center"
					>
						<Plus className="w-4 h-4 mr-2" />
						Add Product
					</Button>
				</div>
			</div>

			<Card>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Image
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Serial ID
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Model ID
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Quantity
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Sold
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Add Price
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Created
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{products?.pages
								.flatMap((page) => page.data)
								.filter((product) =>
									product.serialId
										.toLowerCase()
										.includes(searchQuery.toLowerCase())
								)
								.map((product) => (
									<tr key={product.id.toString()}>
										<td className="px-6 py-4">
											<img
												src={
													product.resources[0] ||
													"https://via.placeholder.com/150?text=No+Image"
												}
												alt={product.serialId}
												className="w-16 h-16 object-cover rounded-lg"
												onError={(e) => {
													;(e.target as HTMLImageElement).src =
														"https://placehold.co/150x150"
												}}
											/>
										</td>
										<td className="px-6 py-4">
											<div className="font-medium">{product.serialId}</div>
										</td>
										<td className="px-6 py-4">
											{product.productModelId.toString()}
										</td>
										<td className="px-6 py-4">{product.quantity.toString()}</td>
										<td className="px-6 py-4">{product.sold.toString()}</td>
										<td className="px-6 py-4">
											${product.addPrice.toString()}
										</td>
										<td className="px-6 py-4">
											<span
												className={`px-2 py-1 rounded-full text-sm ${
													product.isActive
														? "bg-green-100 text-green-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{product.isActive ? "Active" : "Inactive"}
											</span>
										</td>
										<td className="px-6 py-4">
											{new Date(
												Number(product.dateCreated)
											).toLocaleDateString()}
										</td>
										<td className="px-6 py-4">
											<div className="flex space-x-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => openModal(product)}
													className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
													title="Edit Product"
												>
													<Edit2 className="w-4 h-4" />
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleDelete(product.id.toString())}
													className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
													title="Delete Product"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			</Card>

			{/* Product Form Modal */}
			<Modal
				isOpen={isModalOpen}
				onClose={closeModal}
				title={selectedProduct ? "Edit Product" : "Add Product"}
			>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Serial ID
						</label>
						<input
							type="text"
							name="serialId"
							value={formData.serialId}
							onChange={handleChange}
							className="w-full px-3 py-2 border rounded-lg"
							placeholder="Product serial ID"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Product Model ID
						</label>
						<input
							type="number"
							name="productModelId"
							value={formData.productModelId}
							onChange={handleChange}
							className="w-full px-3 py-2 border rounded-lg"
							min="0"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Quantity
						</label>
						<input
							type="number"
							name="quantity"
							value={formData.quantity}
							onChange={handleChange}
							className="w-full px-3 py-2 border rounded-lg"
							min="0"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Add Price
						</label>
						<input
							type="number"
							name="addPrice"
							value={formData.addPrice}
							onChange={handleChange}
							className="w-full px-3 py-2 border rounded-lg"
							min="0"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Is Active
						</label>
						<input
							type="checkbox"
							name="isActive"
							checked={formData.isActive}
							onChange={handleChange}
							className="w-full px-3 py-2 border rounded-lg"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Metadata
						</label>
						<textarea
							name="metadata"
							value={JSON.stringify(formData.metadata)}
							onChange={handleChange}
							rows={3}
							className="w-full px-3 py-2 border rounded-lg"
							placeholder="Product metadata"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Images
						</label>
						<div
							className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
							onDragOver={handleDragOver}
							onDrop={handleDrop}
							onClick={() => fileInputRef.current?.click()}
						>
							<input
								type="file"
								ref={fileInputRef}
								onChange={handleFileSelect}
								className="hidden"
								multiple
								accept="image/*"
							/>
							<div className="flex flex-col items-center justify-center py-4">
								<Upload className="w-10 h-10 text-gray-400 mb-2" />
								<p className="text-sm text-gray-500">
									Drag and drop images here or click to browse
								</p>
								<p className="text-xs text-gray-400 mt-1">
									Supported formats: JPG, PNG, GIF
								</p>
							</div>
						</div>

						{/* Upload Progress */}
						{Object.keys(uploadProgress).length > 0 && (
							<div className="mt-2 space-y-2">
								{Object.entries(uploadProgress).map(([filename, progress]) => (
									<div key={filename} className="flex items-center">
										<div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
											<div
												className="bg-blue-600 h-2.5 rounded-full"
												style={{ width: `${progress}%` }}
											></div>
										</div>
										<span className="text-xs text-gray-500">{progress}%</span>
									</div>
								))}
							</div>
						)}

						{/* Image Preview Carousel */}
						{formData.resources.length > 0 && (
							<div className="mt-4">
								<div className="flex overflow-x-auto space-x-2 py-2">
									{formData.resources.map((image, index) => (
										<div key={index} className="relative flex-shrink-0">
											<img
												src={image}
												alt={`Product image ${index + 1}`}
												className="w-24 h-24 object-cover rounded-lg border"
												onError={(e) => {
													;(e.target as HTMLImageElement).src =
														"https://placehold.co/150x150"
												}}
											/>
											<button
												type="button"
												onClick={() => removeImage(index)}
												className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
											>
												<X className="w-3 h-3" />
											</button>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="flex justify-end space-x-2 mt-6">
					<Button
						variant="outline"
						onClick={closeModal}
						disabled={isUploading}
						className="border-gray-300 hover:bg-gray-50"
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isUploading}
						className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
					>
						{isUploading ? "Uploading..." : selectedProduct ? "Update" : "Add"}{" "}
						Product
					</Button>
				</div>
			</Modal>
		</div>
	)
}

export default ProductManagement
