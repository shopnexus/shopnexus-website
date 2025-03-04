import { useListProductModel } from "../../core/product-models/product-model.query"
import ProductCard from "../../components/ProductCard"

export default function FeaturedProducts({
	title = "Best seller",
	limit = 4,
	className = "",
}: FeaturedProductsProps) {
	const {
		data: products,
		isLoading,
		error,
	} = useListProductModel({
		limit,
		// You can add more query parameters here as needed
	})

	if (isLoading) {
		return (
			<section className={`w-full max-w-7xl mx-auto mt-24 ${className}`}>
				<h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
					{title}
				</h2>
				<div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
					{Array(limit)
						.fill(0)
						.map((_, index) => (
							<div
								key={index}
								className="animate-pulse bg-gray-200 h-64 rounded"
							></div>
						))}
				</div>
			</section>
		)
	}

	if (error || !products) {
		return (
			<section className={`w-full max-w-7xl mx-auto mt-24 ${className}`}>
				<h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
					{title}
				</h2>
				<p className="text-red-500">Failed to load products</p>
			</section>
		)
	}

	return (
		<section className={`w-full max-w-7xl mx-auto mt-24 ${className}`}>
			<h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
				{title}
			</h2>
			<div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
				{products.map((product) => (
					<ProductCard
						key={product.id}
						id={product.id}
						name={product.name}
						price={product.list_price}
						image={
							product.resources?.[0] ||
							"/placeholder.jpeg?height=300&width=300&text=Product"
						}
					/>
				))}
			</div>
		</section>
	)
}
