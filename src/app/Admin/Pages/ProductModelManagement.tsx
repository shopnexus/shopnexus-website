import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import {
	Plus,
	Edit2,
	Trash2,
	Search,
	X,
	ChevronDown,
	List,
} from "lucide-react"
import Button from "../../../components/ui/Button"
import {Card} from "../../../components/ui/Card"
import Modal from "../../../components/ui/Modal"
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
import Pagination from "../../../components/ui/Pagination"
import FileUpload from "../../../components/ui/FileUpload"

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
	const { data: brands } = useQuery(listBrands, {
		pagination: { page: 1, limit: 100 },
	})
	const { data: tags } = useQuery(listTags, {
		pagination: { page: 1, limit: 100 },
	})
	const { data: productTypes } = useQuery(listProductTypes, {
		pagination: { page: 1, limit: 100 },
	})

  const itemsPerPage= 10
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
				limit: itemsPerPage,
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

	const handleSubmit = async () => {
		try {
			const payload = {
				name: formData.name,
				description: formData.description,
				listPrice: BigInt(formData.listPrice),
				brandId: BigInt(formData.brandId),
				type: BigInt(formData.type),
				dateManufactured: BigInt(formData.dateManufactured),
				resources: formData.resources,
				tags: formData.tags,
			}

			if (selectedModel) {
				await mutateUpdateProductModel({
					id: selectedModel.id,
					...payload,
				})
			} else {
				await mutateCreateProductModel(payload)
			}
			closeModal()
		} catch (error) {
			console.error("Error saving product model:", error)
		}
	}

	const handleDelete = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this product model?")) {
			try {
				await mutateDeleteProductModel({ id: BigInt(id) })
			} catch (error) {
				console.error("Error deleting product model:", error)
			}
		}
	}

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value)
	}

	const currentItems = useMemo(() => {
		if (!productModelsData?.pages) return []
		
		const pageIndex = currentPage - 1
		
		if (pageIndex < productModelsData.pages.length) {
			return productModelsData.pages[pageIndex].data || []
		}
		
		return productModelsData.pages[productModelsData.pages.length - 1].data || []
	}, [productModelsData, currentPage])

	const handlePageChange = async (page: number) => {
		setCurrentPage(page)
		
		const neededPages = page - (productModelsData?.pages.length ?? 0)
		
		if (neededPages > 0 && hasNextPage) {
			for (let i = 0; i < neededPages; i++) {
				if (!hasNextPage || isFetchingNextPage) break
				await fetchNextPage()
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

	// Get brand and type names for display
	const getBrandName = useCallback(
		(brandId: bigint) => {
			const brand = brands?.data?.find((b) => b.id === brandId)
			return brand?.name ?? brandId.toString()
		},
		[brands?.data]
	)

	const getTypeName = useCallback(
		(typeId: bigint) => {
			const type = productTypes?.data?.find((t) => t.id === typeId)
			return type?.name ?? typeId.toString()
		},
		[productTypes?.data]
	)

	// Format currency for display
	const formatCurrency = (amount: bigint) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(Number(amount))
	}

	const totalPages = Math.ceil(
		(productModelsData?.pages[0]?.pagination?.total || 0) / itemsPerPage
	)

	const totalItems = productModelsData?.pages[0]?.pagination?.total ?? 0

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Product Models</h1>
				<div className="flex items-center space-x-4 ">
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
					<Button onClick={() => openModal()} className="flex items-center">
						<Plus className="w-4 h-4 mr-2" />
						Add Model
					</Button>
				</div>
			</div>

			<Card>
				<div className="overflow-x-auto">
					<table className="w-full table-fixed divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/10">
									Image
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/4">
									Name
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/8">
									Brand
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/8">
									List Price
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/12">
									Type
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-1/6">
									Tags
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">
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
										<td className="px-4 py-4">
											{model.resources.length > 0 ? (
												<img
													src={model.resources[0]}
													alt={model.name}
													className="w-16 h-16 object-cover rounded-lg"
													onError={(e) => {
														;(e.target as HTMLImageElement).src =
															"https://placehold.co/150x150"
													}}
												/>
											) : (
												<div className="w-16 h-16 bg-gray-100 flex items-center justify-center rounded-lg">
													<span className="text-xs text-gray-400">
														No image
													</span>
												</div>
											)}
										</td>
										<td className="px-4 py-4">
											<div
												className="font-medium truncate max-w-[200px]"
												title={model.name}
											>
												{model.name}
											</div>
											<div
												className="text-sm text-gray-500 truncate max-w-[200px]"
												title={model.description}
											>
												{model.description}
											</div>
										</td>
										<td className="px-4 py-4">{getBrandName(model.brandId)}</td>
										<td className="px-4 py-4">
											{formatCurrency(model.listPrice)}
										</td>
										<td className="px-4 py-4">{getTypeName(model.type)}</td>
										<td className="px-4 py-4">
											<div className="flex flex-wrap gap-1">
												{model.tags.length > 0 ? (
													model.tags.slice(0, 3).map((tag) => (
														<span
															key={tag}
															className="px-2 py-1 text-xs bg-gray-100 rounded-full"
														>
															{tag}
														</span>
													))
												) : (
													<span className="text-gray-400 text-sm">No tags</span>
												)}
												{model.tags.length > 3 && (
													<span className="px-2 py-1 text-xs bg-gray-100 rounded-full">
														+{model.tags.length - 3} more
													</span>
												)}
											</div>
										</td>
										<td className="px-4 py-4">
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

				<Pagination
					currentPage={currentPage}
					totalPages={totalPages}
					totalItems={totalItems}
					limit={itemsPerPage}
					onPageChange={handlePageChange}
					hasNextPage={hasNextPage}
					isFetchingNextPage={isFetchingNextPage}
					fetchNextPage={fetchNextPage}
				/>
			</Card>

			<Modal
				isOpen={isModalOpen}
				onClose={closeModal}
				title={selectedModel ? "Edit Model" : "Add Model"}
			>
				<div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
					<div>
						<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
							Name
						</label>
						<input
							id="name"
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							className="w-full px-3 py-2 border rounded-lg"
							placeholder="Product model name"
						/>
					</div>

					<div>
						<label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
							Description
						</label>
						<textarea
							id="description"
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
							<label htmlFor="listPrice" className="block text-sm font-medium text-gray-700 mb-1">
								List Price
							</label>
							<input
								id="listPrice"
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
							<label htmlFor="brandSearch" className="block text-sm font-medium text-gray-700 mb-1">
								Brand
							</label>
							<div className="relative">
								<input
									id="brandSearch"
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
											<button
												key={brand.id}
												className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-left"
												onClick={() => handleBrandSelect(brand)}
											>
												{brand.name}
											</button>
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

					<div className="grid grid-cols-2 gap-4">
						<div ref={typeDropdownRef} className="relative">
							<label htmlFor="typeSearch" className="block text-sm font-medium text-gray-700 mb-1">
								Type
							</label>
							<div className="relative">
								<input
									id="typeSearch"
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
										<div className="px-4 py-2 text-gray-500">
											No types found
										</div>
									)}
								</div>
							)}
						</div>

						<div>
							<label htmlFor="dateManufactured" className="block text-sm font-medium text-gray-700 mb-1">
								Date Manufactured
							</label>
							<input
								id="dateManufactured"
								type="date"
								name="dateManufactured"
								value={
									new Date(formData.dateManufactured)
										.toISOString()
										.split("T")[0]
								}
								onChange={(e) => {
									const date = new Date(e.target.value)
									setFormData((prev) => ({
										...prev,
										dateManufactured: date.getTime(),
									}))
								}}
								className="w-full px-3 py-2 border rounded-lg"
							/>
						</div>
					</div>

					<div ref={tagDropdownRef} className="relative">
						<label htmlFor="tagSearch" className="block text-sm font-medium text-gray-700 mb-1">
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
								id="tagSearch"
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
						<label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-1">
							Images
						</label>
						<FileUpload
							resources={formData.resources}
							onUploadComplete={(urls) => {
								setFormData(prev => ({
									...prev,
									resources: [...prev.resources, ...urls],
								}))
							}}
							onRemoveImage={(index) => {
								setFormData(prev => ({
									...prev,
									resources: prev.resources.filter((_, i) => i !== index),
								}))
							}}
						/>
					</div>
				</div>

				<div className="flex justify-end space-x-2 mt-6">
					<Button variant="outline" onClick={closeModal}>
						Cancel
					</Button>
					<Button onClick={handleSubmit}>
						{selectedModel ? "Update" : "Add"} Model
					</Button>
				</div>
			</Modal>
		</div>
	)
}

export default ProductModelManagement
