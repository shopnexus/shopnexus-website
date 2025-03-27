import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import {
	Plus,
	Edit2,
	Trash2,
	Search,
	X,
	Upload,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	List,
} from "lucide-react"
import Button from "../../../components/ui/Button"
import Card from "../../../components/ui/Card"
import Modal from "../../../components/ui/Modal"
import * as tus from "tus-js-client"
import { ProductModelEntity } from "shopnexus-protobuf-gen-ts/pb/product/v1/product_model_pb"
import {
	useInfiniteQuery,
	useMutation,
	useQuery,
} from "@connectrpc/connect-query"
import {
	createProductModel,
	listBrands,
	listProductTypes,
	listTags,
	listProductModels,
	updateProductModel,
	deleteProductModel,
} from "shopnexus-protobuf-gen-ts"
import { useNavigate } from "react-router-dom"

interface ProductModelFormData {
	name: string
	description: string
	listPrice: number
	brandId: number
	type: number
	dateManufactured: number
	resources: string[]
	tags: string[]
}

interface AutocompleteOption {
	id: string
	name: string
}

const ProductModelManagement = () => {
	const { mutateAsync: mutateCreateProductModel } =
		useMutation(createProductModel)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [selectedModel, setSelectedModel] = useState<ProductModelEntity | null>(
		null
	)
	const [searchQuery, setSearchQuery] = useState("")
	const [formData, setFormData] = useState<ProductModelFormData>({
		name: "",
		description: "",
		listPrice: 0,
		brandId: 0,
		type: 0,
		dateManufactured: Date.now(),
		resources: [],
		tags: [],
	})
	const [uploadProgress, setUploadProgress] = useState<{
		[key: string]: number
	}>({})
	const [isUploading, setIsUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const { data: brands } = useQuery(listBrands, {
		pagination: { page: 1, limit: 100 },
	})
	const { data: tags } = useQuery(listTags, {
		pagination: { page: 1, limit: 100 },
	})
	const { data: productTypes } = useQuery(listProductTypes, {
		pagination: { page: 1, limit: 100 },
	})
	const {
		data: productModelsData,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch: refetchProductModels,
	} = useInfiniteQuery(
		listProductModels,
		{
			pagination: {
				page: 1,
				limit: 100,
			},
		},
		{
			getNextPageParam: (lastPage) =>
				lastPage?.pagination?.nextPage
					? {
							page: lastPage.pagination.nextPage,
							limit: lastPage.pagination.limit,
							cursor: lastPage.pagination.nextCursor,
					  }
					: undefined,
			pageParamKey: "pagination",
		}
	)
	const [brandSearchQuery, setBrandSearchQuery] = useState("")
	const [typeSearchQuery, setTypeSearchQuery] = useState("")
	const [tagSearchQuery, setTagSearchQuery] = useState("")
	const [showBrandDropdown, setShowBrandDropdown] = useState(false)
	const [showTypeDropdown, setShowTypeDropdown] = useState(false)
	const [showTagDropdown, setShowTagDropdown] = useState(false)
	const [selectedTags, setSelectedTags] = useState<AutocompleteOption[]>([])
	const brandDropdownRef = useRef<HTMLDivElement>(null)
	const typeDropdownRef = useRef<HTMLDivElement>(null)
	const tagDropdownRef = useRef<HTMLDivElement>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [itemsPerPage] = useState(10)
	const navigate = useNavigate()

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				brandDropdownRef.current &&
				!brandDropdownRef.current.contains(event.target as Node)
			) {
				setShowBrandDropdown(false)
			}
			if (
				typeDropdownRef.current &&
				!typeDropdownRef.current.contains(event.target as Node)
			) {
				setShowTypeDropdown(false)
			}
			if (
				tagDropdownRef.current &&
				!tagDropdownRef.current.contains(event.target as Node)
			) {
				setShowTagDropdown(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [])

	const brandOptions: AutocompleteOption[] =
		brands?.data?.map((brand) => ({
			id: String(brand.id),
			name: brand.name,
		})) || []

	const typeOptions: AutocompleteOption[] =
		productTypes?.data?.map((type) => ({
			id: String(type.id),
			name: type.name,
		})) || []

	const tagOptions: AutocompleteOption[] =
		tags?.data?.map((tag) => ({
			id: String(tag.tag),
			name: tag.tag,
		})) || []

	const filteredBrands = brandOptions.filter((brand) =>
		brand.name.toLowerCase().includes(brandSearchQuery.toLowerCase())
	)

	const filteredTypes = typeOptions.filter((type) =>
		type.name.toLowerCase().includes(typeSearchQuery.toLowerCase())
	)

	const filteredTags = tagOptions.filter(
		(tag) =>
			tag.name.toLowerCase().includes(tagSearchQuery.toLowerCase()) &&
			!selectedTags.some((selectedTag) => selectedTag.id === tag.id)
	)

	const handleBrandSelect = (brand: AutocompleteOption) => {
		setFormData((prev) => ({ ...prev, brandId: Number(brand.id) }))
		setBrandSearchQuery(brand.name)
		setShowBrandDropdown(false)
	}

	const handleTypeSelect = (type: AutocompleteOption) => {
		setFormData((prev) => ({ ...prev, type: Number(type.id) }))
		setTypeSearchQuery(type.name)
		setShowTypeDropdown(false)
	}

	const handleTagSelect = (tag: AutocompleteOption) => {
		const updatedTags = [...selectedTags, tag]
		setSelectedTags(updatedTags)
		setFormData((prev) => ({
			...prev,
			tags: updatedTags.map((t) => t.name),
		}))
		setTagSearchQuery("")
	}

	const removeTag = (tagToRemove: AutocompleteOption) => {
		const updatedTags = selectedTags.filter((tag) => tag.id !== tagToRemove.id)
		setSelectedTags(updatedTags)
		setFormData((prev) => ({
			...prev,
			tags: updatedTags.map((t) => t.name),
		}))
	}

	const openModal = (model?: ProductModelEntity) => {
		if (model) {
			setSelectedModel(model)
			setFormData({
				name: model.name,
				description: model.description,
				listPrice: Number(model.listPrice),
				brandId: Number(model.brandId),
				type: Number(model.type),
				dateManufactured: Number(model.dateManufactured),
				resources: model.resources,
				tags: model.tags,
			})
			const selectedBrand = brandOptions.find(
				(brand) => Number(brand.id) === Number(model.brandId)
			)
			if (selectedBrand) {
				setBrandSearchQuery(selectedBrand.name)
			}
			const selectedType = typeOptions.find(
				(type) => Number(type.id) === Number(model.type)
			)
			if (selectedType) {
				setTypeSearchQuery(selectedType.name)
			}
			const modelTags = model.tags.map((tagName) => {
				const foundTag = tagOptions.find((tag) => tag.name === tagName)
				return foundTag || { id: "-1", name: tagName }
			})
			setSelectedTags(modelTags)
		} else {
			setSelectedModel(null)
			setFormData({
				name: "",
				description: "",
				listPrice: 0,
				brandId: 0,
				type: 0,
				dateManufactured: Date.now(),
				resources: [],
				tags: [],
			})
			setBrandSearchQuery("")
			setTypeSearchQuery("")
			setTagSearchQuery("")
			setSelectedTags([])
		}
		setIsModalOpen(true)
	}

	const closeModal = () => {
		setIsModalOpen(false)
		setSelectedModel(null)
	}

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target
		setFormData((prev) => ({
			...prev,
			[name]:
				name === "listPrice" || name === "brandId" || name === "type"
					? Number(value)
					: value,
		}))
	}

	const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setTagSearchQuery(e.target.value)
	}

	const uploadFile = useCallback(async (file: File) => {
		return new Promise<string>((resolve, reject) => {
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
					resolve(upload.url || "")
				},
			})
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
			if (selectedModel) {
				// Update existing product model
				await mutateUpdateProductModel({
					id: BigInt(selectedModel.id),
					name: formData.name,
					description: formData.description,
					listPrice: BigInt(formData.listPrice),
					brandId: BigInt(formData.brandId),
					type: BigInt(formData.type),
					dateManufactured: BigInt(formData.dateManufactured),
					// resources: formData.resources,
					// tags: formData.tags,
				})
			} else {
				// Create new product model
				await mutateCreateProductModel({
					name: formData.name,
					description: formData.description,
					listPrice: BigInt(formData.listPrice),
					brandId: BigInt(formData.brandId),
					type: BigInt(formData.type),
					dateManufactured: BigInt(formData.dateManufactured),
					resources: formData.resources,
					tags: formData.tags,
				})
			}

			// Close modal after successful operation
			closeModal()
		} catch (error) {
			console.error("Error saving product model:", error)
		}
	}

	const handleDelete = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this product model?")) {
			try {
				await mutateDeleteProductModel({
					id: BigInt(id),
				})
			} catch (error) {
				console.error("Error deleting product model:", error)
			}
		}
	}

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value)
	}

	const productModels = useMemo(() => {
		if (!productModelsData) return []
		return productModelsData.pages.flatMap((page) => page.data || [])
	}, [productModelsData])

	const totalItems = productModels.length
	const totalPages = Math.ceil(totalItems / itemsPerPage)
	const indexOfLastItem = currentPage * itemsPerPage
	const indexOfFirstItem = indexOfLastItem - itemsPerPage
	const currentItems = productModels.slice(indexOfFirstItem, indexOfLastItem)

	const goToPage = (pageNumber: number) => {
		setCurrentPage(pageNumber)

		if (pageNumber > totalPages - 2 && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}

	const goToPreviousPage = () => {
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1)
		}
	}

	const goToNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1)

			if (currentPage >= totalPages - 2 && hasNextPage && !isFetchingNextPage) {
				fetchNextPage()
			}
		}
	}

	const onMutationSuccess = useCallback(() => {
		refetchProductModels()
	}, [refetchProductModels])

	const { mutateAsync: mutateDeleteProductModel } = useMutation(
		deleteProductModel,
		{
			onSuccess: onMutationSuccess,
		}
	)

	const { mutateAsync: mutateUpdateProductModel } = useMutation(
		updateProductModel,
		{
			onSuccess: onMutationSuccess,
		}
	)

	const viewProducts = (modelId: string) => {
		navigate(`/admin/products?modelId=${modelId}`)
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Product Models</h1>
				<div className="flex items-center space-x-4">
					<div className="relative">
						<Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search models..."
							value={searchQuery}
							onChange={handleSearch}
							className="pl-10 pr-4 py-2 border rounded-lg w-64"
						/>
					</div>
					<Button onClick={() => openModal()}>
						<Plus className="w-4 h-4 mr-2" />
						Add Model
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
									Name
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Brand
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									List Price
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Type
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Tags
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{currentItems
								.filter((model) =>
									model.name.toLowerCase().includes(searchQuery.toLowerCase())
								)
								.map((model) => (
									<tr key={model.id.toString()}>
										<td className="px-6 py-4">
											<img
												src={model.resources[0]}
												alt={model.name}
												className="w-16 h-16 object-cover rounded-lg"
											/>
										</td>
										<td className="px-6 py-4">
											<div className="font-medium">{model.name}</div>
											<div className="text-sm text-gray-500 truncate max-w-xs">
												{model.description}
											</div>
										</td>
										<td className="px-6 py-4">{model.brandId.toString()}</td>
										<td className="px-6 py-4">${model.listPrice.toString()}</td>
										<td className="px-6 py-4">{model.type.toString()}</td>
										<td className="px-6 py-4">
											<div className="flex flex-wrap gap-1">
												{model.tags.map((tag, index) => (
													<span
														key={index}
														className="px-2 py-1 text-xs bg-gray-100 rounded-full"
													>
														{tag}
													</span>
												))}
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="flex space-x-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => openModal(model)}
													className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
													title="Edit Model"
												>
													<Edit2 className="w-4 h-4" />
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleDelete(model.id.toString())}
													className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
													title="Delete Model"
												>
													<Trash2 className="w-4 h-4" />
												</Button>
												<Button
													variant="outline"
													size="sm"
													onClick={() => viewProducts(model.id.toString())}
													className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
													title="View Products"
												>
													<List className="w-4 h-4" />
												</Button>
											</div>
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>

				<div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
					<div className="flex flex-1 justify-between sm:hidden">
						<button
							onClick={goToPreviousPage}
							disabled={currentPage === 1}
							className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
								currentPage === 1
									? "text-gray-300"
									: "text-gray-700 hover:bg-gray-50"
							}`}
						>
							Previous
						</button>
						<button
							onClick={goToNextPage}
							disabled={currentPage === totalPages || totalPages === 0}
							className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
								currentPage === totalPages || totalPages === 0
									? "text-gray-300"
									: "text-gray-700 hover:bg-gray-50"
							}`}
						>
							Next
						</button>
					</div>
					<div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
						<div>
							<p className="text-sm text-gray-700">
								Showing{" "}
								<span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
								<span className="font-medium">
									{Math.min(indexOfLastItem, totalItems)}
								</span>{" "}
								of <span className="font-medium">{totalItems}</span> results
							</p>
						</div>
						<div>
							<nav
								className="isolate inline-flex -space-x-px rounded-md shadow-sm"
								aria-label="Pagination"
							>
								<button
									onClick={goToPreviousPage}
									disabled={currentPage === 1}
									className={`relative inline-flex items-center rounded-l-md px-2 py-2 ${
										currentPage === 1
											? "text-gray-300"
											: "text-gray-400 hover:bg-gray-50"
									}`}
								>
									<span className="sr-only">Previous</span>
									<ChevronLeft className="h-5 w-5" aria-hidden="true" />
								</button>

								{Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
									let pageNumber: number

									if (totalPages <= 5) {
										pageNumber = i + 1
									} else if (currentPage <= 3) {
										pageNumber = i + 1
									} else if (currentPage >= totalPages - 2) {
										pageNumber = totalPages - 4 + i
									} else {
										pageNumber = currentPage - 2 + i
									}

									return (
										<button
											key={pageNumber}
											onClick={() => goToPage(pageNumber)}
											className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
												currentPage === pageNumber
													? "z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
													: "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
											}`}
										>
											{pageNumber}
										</button>
									)
								})}

								<button
									onClick={goToNextPage}
									disabled={currentPage === totalPages || totalPages === 0}
									className={`relative inline-flex items-center rounded-r-md px-2 py-2 ${
										currentPage === totalPages || totalPages === 0
											? "text-gray-300"
											: "text-gray-400 hover:bg-gray-50"
									}`}
								>
									<span className="sr-only">Next</span>
									<ChevronRight className="h-5 w-5" aria-hidden="true" />
								</button>
							</nav>
						</div>
					</div>
				</div>
			</Card>

			<Modal
				isOpen={isModalOpen}
				onClose={closeModal}
				title={selectedModel ? "Edit Model" : "Add Model"}
			>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Name
						</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							className="w-full px-3 py-2 border rounded-lg"
							placeholder="Product model name"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Description
						</label>
						<textarea
							name="description"
							value={formData.description}
							onChange={handleChange}
							rows={3}
							className="w-full px-3 py-2 border rounded-lg"
							placeholder="Product model description"
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								List Price
							</label>
							<input
								type="number"
								name="listPrice"
								value={formData.listPrice}
								onChange={handleChange}
								className="w-full px-3 py-2 border rounded-lg"
								min="0"
								step="0.01"
							/>
						</div>

						<div ref={brandDropdownRef} className="relative">
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Brand
							</label>
							<div className="relative">
								<input
									type="text"
									value={brandSearchQuery}
									onChange={(e) => {
										setBrandSearchQuery(e.target.value)
										setShowBrandDropdown(true)
									}}
									onFocus={() => setShowBrandDropdown(true)}
									className="w-full px-3 py-2 border rounded-lg pr-10"
									placeholder="Search for a brand..."
								/>
								<ChevronDown
									className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 cursor-pointer"
									onClick={() => setShowBrandDropdown(!showBrandDropdown)}
								/>
							</div>
							{showBrandDropdown && (
								<div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border max-h-60 overflow-auto">
									{filteredBrands.length > 0 ? (
										filteredBrands.map((brand) => (
											<div
												key={brand.id}
												className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
												onClick={() => handleBrandSelect(brand)}
											>
												{brand.name}
											</div>
										))
									) : (
										<div className="px-4 py-2 text-gray-500">
											No brands found
										</div>
									)}
								</div>
							)}
						</div>
					</div>

					<div ref={typeDropdownRef} className="relative">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Type
						</label>
						<div className="relative">
							<input
								type="text"
								value={typeSearchQuery}
								onChange={(e) => {
									setTypeSearchQuery(e.target.value)
									setShowTypeDropdown(true)
								}}
								onFocus={() => setShowTypeDropdown(true)}
								className="w-full px-3 py-2 border rounded-lg pr-10"
								placeholder="Search for a product type..."
							/>
							<ChevronDown
								className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 cursor-pointer"
								onClick={() => setShowTypeDropdown(!showTypeDropdown)}
							/>
						</div>
						{showTypeDropdown && (
							<div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border max-h-60 overflow-auto">
								{filteredTypes.length > 0 ? (
									filteredTypes.map((type) => (
										<div
											key={type.id}
											className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
											onClick={() => handleTypeSelect(type)}
										>
											{type.name}
										</div>
									))
								) : (
									<div className="px-4 py-2 text-gray-500">No types found</div>
								)}
							</div>
						)}
					</div>

					<div ref={tagDropdownRef} className="relative">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Tags
						</label>
						<div className="flex flex-wrap gap-2 mb-2">
							{selectedTags.map((tag) => (
								<div
									key={tag.id}
									className="flex items-center bg-gray-100 rounded-full px-3 py-1"
								>
									<span className="text-sm">{tag.name}</span>
									<button
										type="button"
										onClick={() => removeTag(tag)}
										className="ml-1 text-gray-500 hover:text-gray-700"
									>
										<X className="w-3 h-3" />
									</button>
								</div>
							))}
						</div>
						<div className="relative">
							<input
								type="text"
								value={tagSearchQuery}
								onChange={handleTagsChange}
								onFocus={() => setShowTagDropdown(true)}
								className="w-full px-3 py-2 border rounded-lg"
								placeholder="Search for tags..."
							/>
						</div>
						{showTagDropdown && (
							<div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border max-h-60 overflow-auto">
								{filteredTags.length > 0 ? (
									filteredTags.map((tag) => (
										<div
											key={tag.id}
											className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
											onClick={() => handleTagSelect(tag)}
										>
											{tag.name}
										</div>
									))
								) : (
									<div className="px-4 py-2 text-gray-500">
										No matching tags found
									</div>
								)}
							</div>
						)}
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
														"https://via.placeholder.com/150?text=Image+Error"
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
					<Button variant="outline" onClick={closeModal} disabled={isUploading}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isUploading}>
						{isUploading ? "Uploading..." : selectedModel ? "Update" : "Add"}{" "}
						Model
					</Button>
				</div>
			</Modal>
		</div>
	)
}

export default ProductModelManagement
