import React, { useEffect, useState, useMemo, useCallback } from "react"
import { useParams } from "react-router-dom"
import Stack from "../../blocks/Components/Stack/Stack"
import { callUnaryMethod, useMutation, useQuery } from "@connectrpc/connect-query"
import {
	addCartItem,
	getBrand,
	getProduct,
	getProductModel,
	ProductEntity,
} from "shopnexus-protobuf-gen-ts"
import { finalTransport } from "../../core/query-client"
import FeedBack from "../../components/FeedBack"
import FeaturedProducts from "./FeaturedProducts"
import NewProducts from "./NewProducts"
import SimilarProductsByTagAndBrand from "./SimilarProducts"
//#region Utility Functions
// Convert Uint8Array metadata to object
const parseMetadata = (metadata: Uint8Array): Record<string, any> => {
	try {
		const decoder = new TextDecoder()
		const jsonString = decoder.decode(metadata)
		const data = JSON.parse(jsonString)
		return data
	} catch (error) {
		console.error("Error parsing metadata:", error)
		return {}
	}
}

// Get unique values from product metadata for a specific key
const getUniqueMetadataValues = (
	products: ProductEntity[],
	key: string
): any[] => {
	const values = products
		.map((product) => {
			const metadata = parseMetadata(product.metadata)
			return metadata[key]
		})
		.filter((value) => value !== undefined && value !== null)

	// Return unique values, ensuring proper comparison for numbers and strings
	return Array.from(new Set(values.map(String))).map(value => {
		// Convert back to number if it was originally a number
		const num = Number(value)
		return !isNaN(num) ? num : value
	})
}

// Sort numeric values
const sortNumeric = (values: any[]): any[] => {
	return [...values].sort((a, b) => {
		if (typeof a === "number" && typeof b === "number") {
			return a - b
		}
		return String(a).localeCompare(String(b))
	})
}
//#endregion

//#region Child Components
// Component for thumbnail list
const ThumbnailList: React.FC<{
	images: string[]
	selectedImage: string
	onThumbnailClick: (image: string) => void
}> = React.memo(({ images, selectedImage, onThumbnailClick }) => (
	<div className="grid grid-cols-6 gap-2">
		{images.map((image, index) => (
			<button
				key={index}
				onClick={() => onThumbnailClick(image)}
				className={`border-2 rounded transition duration-150 ease-in-out ${selectedImage === image ? "border-blue-500" : "border-gray-200"
					}`}
			>
				<img
					src={image}
					alt={`thumbnail ${index + 1}`}
					loading="lazy"
					className="object-cover w-full h-full"
				/>
			</button>
		))}
	</div>
))

// Component for variant selection
interface VariantSelectionProps {
	products: ProductEntity[]
	selectedVariantOptions: Record<string, any>
	onSelectVariantOption: (key: string, value: any) => void
	quantity: number
	availableStock: number
	onQuantityChange: React.ChangeEventHandler<HTMLInputElement>
	onAddToCart: () => void
}

const VariantSelection: React.FC<VariantSelectionProps> = React.memo(
	({
		products,
		selectedVariantOptions,
		onSelectVariantOption,
		quantity,
		availableStock,
		onQuantityChange,
		onAddToCart,
	}) => {
		// Get all possible variant keys from metadata
		const variantKeys = useMemo(() => {
			if (products.length === 0) return []

			// Collect all unique keys from all products' metadata
			const allKeys = new Set<string>()
			products.forEach((product) => {
				const metadata = parseMetadata(product.metadata)
				Object.keys(metadata).forEach((key) => allKeys.add(key))
			})

			return Array.from(allKeys)
		}, [products])

		// Check if a variant option is available
		const isOptionAvailable = useCallback(
			(key: string, value: any): boolean => {
				// If no options are selected, all options with stock should be available
				const hasAnySelection = Object.values(selectedVariantOptions).some(
					(v) => v !== null
				)
				if (!hasAnySelection) {
					return products.some((product) => {
						const metadata = parseMetadata(product.metadata)
						return metadata[key] === value && product.quantity > 0
					})
				}

				// Create a copy of current selections
				const selections = { ...selectedVariantOptions }

				// Check if any product matches the current selections with this option
				return products.some((product) => {
					const metadata = parseMetadata(product.metadata)

					// Check if this product matches all selected options
					for (const [k, v] of Object.entries(selections)) {
						// Skip null values (unselected options)
						if (v === null) continue
						// Skip the current key we're checking
						if (k === key) continue

						// If this option doesn't match, this product doesn't match
						if (metadata[k] !== v) return false
					}

					// Check if this product has the value we're testing for this key
					return metadata[key] === value && product.quantity > 0
				})
			},
			[products, selectedVariantOptions]
		)

		return (
			<div className="space-y-4">
				{/* Render each variant type dynamically from metadata */}
				{variantKeys.map((key) => (
					<div key={key}>
						<h3 className="font-medium capitalize">{key}:</h3>
						<div className="flex space-x-2">
							{sortNumeric(getUniqueMetadataValues(products, key)).map(
								(value) => {
									// Check if this option is currently selected
									const isSelected = selectedVariantOptions[key] === value
									// Only disable if it's not available AND not currently selected
									const shouldDisable =
										!isOptionAvailable(key, value) && !isSelected

									return (
										<button
											key={`${key}-${value}`}
											disabled={shouldDisable}
											onClick={() =>
												onSelectVariantOption(key, isSelected ? null : value)
											}
											className={`px-3 py-1 border rounded transition duration-150 ease-in-out ${isSelected
													? "bg-blue-500 text-white"
													: "bg-white text-black"
												} ${shouldDisable
													? "opacity-50 cursor-not-allowed bg-gray-400"
													: ""
												}`}
										>
											{value}
										</button>
									)
								}
							)}
						</div>
					</div>
				))}

				{availableStock === 0 && (
					<p className="text-red-500">This combination is out of stock</p>
				)}

				{/* Quantity selection */}
				<div className="flex items-center space-x-4">
					<label htmlFor="quantity" className="font-medium">
						Quantity:
					</label>
					<input
						type="number"
						id="quantity"
						value={quantity}
						onChange={onQuantityChange}
						min="1"
						max={availableStock}
						disabled={availableStock <= 0}
						className="w-20 px-3 py-2 border rounded"
					/>
				</div>
				<p className="text-sm text-gray-500">
					{availableStock} items available
				</p>

				{/* Add to cart button */}
				<button
					onClick={onAddToCart}
					disabled={availableStock <= 0}
					className={`w-full py-3 px-6 rounded-lg text-white font-medium transition duration-150 ease-in-out ${availableStock > 0
							? "bg-blue-600 hover:bg-blue-700"
							: "bg-gray-400 cursor-not-allowed"
						}`}
				>
					Add to Cart
				</button>
			</div>
		)
	}
)
//#endregion

// Main Component
const ProductDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>()
	const [selectedImage, setSelectedImage] = useState<string>("")
	const [quantity, setQuantity] = useState<number>(1)
	const [selectedVariantOptions, setSelectedVariantOptions] = useState<
		Record<string, any>
	>({})
	const [cards, setCards] = useState<{ id: number; img: string }[]>([])
	const [error, setError] = useState<string | null>(null)
	const { mutateAsync: mutateAddCartItem } = useMutation(addCartItem)

	// Fetch product model data
	const {
		data: productModel,
		isLoading: isLoadingModel,
		error: modelError,
	} = useQuery(
		getProductModel,
		{
			id: id ? BigInt(id) : undefined,
		},
		{
			enabled: !!id,
		}
	)

	const { data: brand } = useQuery(getBrand, {
		id: productModel?.data?.brandId,
	}, {
		enabled: !!productModel?.data?.brandId,
	})

	// Fetch product variants
	const [products, setProducts] = useState<ProductEntity[]>([])
	const [isLoadingVariants, setIsLoadingVariants] = useState(true)
	const [variantsError, setVariantsError] = useState<Error | null>(null)

	// Load product variants when product model is available
	useEffect(() => {
		if (!productModel?.serialIds?.length) {
			setIsLoadingVariants(false)
			return
		}

		setIsLoadingVariants(true)
		Promise.all(
			productModel?.serialIds.map(async (serial_id) => {
				return callUnaryMethod(finalTransport, getProduct, {
					serialId: serial_id,
				})
			})
		)
			.then((data) => {
				const validProducts = data
					.map((d) => d.data!)
					.filter((d) => d !== undefined)
				setProducts(validProducts)
				setIsLoadingVariants(false)
			})
			.catch((error) => {
				setVariantsError(error)
				setIsLoadingVariants(false)
			})
	}, [productModel])

	//#region Load Data & Default Setup
	useEffect(() => {
		if (productModel && products.length > 0) {
			try {
				// Set up image cards from resources
				const images = productModel?.data?.resources || []
				if (images.length > 0) {
					const imageCards = images.map((img, index) => ({
						id: index + 1,
						img,
					}))
					setCards(imageCards)
					setSelectedImage(images[0])
				}

				// Reset selections
				setSelectedVariantOptions({})
				setQuantity(1)
			} catch (err) {
				setError("Error processing product data")
				console.error(err)
			}
		}
	}, [productModel, products])
	//#endregion

	//#region Stock & Quantity Handling
	const totalStock = useCallback((): number => {
		return products.reduce((sum, item) => sum + Number(item.quantity), 0)
	}, [products])

	const getAvailableStock = useCallback((): number => {
		// If no variant options are selected, return total stock
		if (Object.keys(selectedVariantOptions).length === 0) {
			return totalStock()
		}

		// Find products that match all selected variant options
		const matchingProducts = products.filter((product) => {
			const metadata = parseMetadata(product.metadata)

			// Check if this product matches all selected options
			for (const [key, value] of Object.entries(selectedVariantOptions)) {
				if (value === null) continue // Skip unselected options
				if (metadata[key] !== value) return false
			}

			return true
		})
		console.log(matchingProducts)

		// Sum up quantities of matching products
		return matchingProducts.reduce(
			(sum, product) => sum + Number(product.quantity),
			0
		)
	}, [products, selectedVariantOptions, totalStock])

	useEffect(() => {
		const stock = getAvailableStock()
		if (stock > 0 && quantity > stock) {
			setQuantity(stock)
		}
	}, [selectedVariantOptions, quantity, getAvailableStock])
	//#endregion

	//#region Event Handlers
	const handleCardChange = useCallback((card: { id: number; img: string }) => {
		setSelectedImage(card.img)
	}, [])

	const handleThumbnailClick = useCallback((image: string) => {
		setSelectedImage(image)
		setCards((prevCards) => {
			const newCards = [...prevCards]
			const index = newCards.findIndex((card) => card.img === image)
			if (index !== -1) {
				const [card] = newCards.splice(index, 1)
				newCards.push(card)
			}
			return newCards
		})
	}, [])

	const handleQuantityChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = parseInt(e.target.value, 10)
			const stock = getAvailableStock()
			if (isNaN(value) || value < 1) {
				setQuantity(1)
			} else if (value > stock) {
				setQuantity(stock)
			} else {
				setQuantity(value)
			}
		},
		[getAvailableStock]
	)

	const handleSelectVariantOption = useCallback((key: string, value: any) => {
		setSelectedVariantOptions((prev) => ({
			...prev,
			[key]: value,
		}))
	}, [])

	const handleAddToCart = useCallback(() => {
		// Find the matching product variant
		const matchingProduct = products.find((product) => {
			const metadata = parseMetadata(product.metadata)

			// Check if this product matches all selected options
			for (const [key, value] of Object.entries(selectedVariantOptions)) {
				if (value === null) return false // All options must be selected
				if (metadata[key] !== value) return false
			}

			return true
		})

		if (matchingProduct) {
			console.log("Add to cart:", {
				productId: matchingProduct.id,
				quantity,
				metadata: parseMetadata(matchingProduct.metadata),
			})
			// Implement actual cart functionality here
			if (productModel?.data?.id) {
				mutateAddCartItem({
					items: [{
						itemId: productModel.data.id,
						quantity: BigInt(quantity),
						// TODO: add metadata on server
						// metadata: parseMetadata(matchingProduct.metadata),
					}]
				})
			}
		}
	}, [selectedVariantOptions, quantity, products])
	//#endregion

	//#region Derived Data with useMemo
	const allImages = useMemo(() => {
		return productModel?.data?.resources || []
	}, [productModel])

	const availableStock = useMemo(() => getAvailableStock(), [getAvailableStock])

	const formattedPrice = useMemo(() => {
		if (!productModel?.data?.listPrice) return "$0.00"
		// Convert bigint to number and format as currency
		const price = Number(productModel?.data?.listPrice) / 100 // Assuming price is in cents
		return `$${price.toFixed(2)}`
	}, [productModel])
	//#endregion

	if (modelError || variantsError) {
		return (
			<div className="text-red-500 text-center p-4">
				{modelError
					? "Error loading product details"
					: "Error loading product variants"}
			</div>
		)
	}

	if (error) return <div className="text-red-500 text-center p-4">{error}</div>
	if (isLoadingModel || isLoadingVariants || !productModel) {
		return <div className="text-center p-4">Loading product details...</div>
	}

	return (
		<section className=" mx-auto px-20 py-8 bg-gray-100">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 ">
				{/* Product Images Section */}
				<div className="space-y-4">
					{cards.length > 0 && (
						<>
							<Stack
								randomRotation={true}
								sensitivity={180}
								sendToBackOnClick={false}
								cardDimensions={{ width: 300, height: 300 }}
								cardsData={cards}
								onCardChange={handleCardChange}
							/>
							<ThumbnailList
								images={allImages}
								selectedImage={selectedImage}
								onThumbnailClick={handleThumbnailClick}
							/>
						</>
					)}
					{cards.length === 0 && (
						<div className="bg-gray-200 h-64 flex items-center justify-center">
							<p>No images available</p>
						</div>
					)}
				</div>

				{/* Product Info Section */}
				<div className="space-y-6">
					<h1 className="text-3xl font-bold">{productModel?.data?.name}</h1>
					<div className="flex items-center space-x-4 text-sm">
						<span>
							Brand:{" "}
							{brand?.data?.name}
						</span>
					</div>
					<p className="text-2xl font-semibold text-blue-600">
						{formattedPrice}
					</p>
					<div className="space-y-2">
						<p className="text-gray-600">{productModel?.data?.description}</p>
						<div className="flex flex-wrap gap-2">
							{productModel?.data?.tags?.map((tag) => (
								<span
									key={tag}
									className="px-2 py-1 text-sm bg-gray-100 rounded-full"
								>
									{tag}
								</span>
							))}
						</div>
					</div>

					<VariantSelection
						products={products}
						selectedVariantOptions={selectedVariantOptions}
						onSelectVariantOption={handleSelectVariantOption}
						quantity={quantity}
						availableStock={availableStock}
						onQuantityChange={handleQuantityChange}
						onAddToCart={handleAddToCart}
					/>
				</div>
			</div>

			<FeedBack></FeedBack>
			<SimilarProductsByTagAndBrand currentProduct={productModel.data}>
			</SimilarProductsByTagAndBrand>
      		<FeaturedProducts></FeaturedProducts>
      		<NewProducts></NewProducts>
		</section>
	)
}

export default ProductDetail
