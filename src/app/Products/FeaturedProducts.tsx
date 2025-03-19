import ProductCard from "../../components/ProductCard"
import { useInfiniteQuery } from "@connectrpc/connect-query"
import { listProductModels } from "shopnexus-protobuf-gen-ts"
import React from "react"

interface FeaturedProductsProps {
	title?: string
	limit?: number
	className?: string
}

export default function FeaturedProducts({
	title = "Best seller",
	limit = 4,
	className = "",
}: FeaturedProductsProps) {
	const {
		data: products,
		isLoading,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery(
		listProductModels,
		{
			pagination: {
				limit: 5,
				page: 1,
			},
		},
		{
			pageParamKey: "pagination",
			getNextPageParam: (lastPage) => {
				if (lastPage.pagination?.nextPage) {
					return {
						limit: 10,
						page: lastPage.pagination.nextPage,
					}
				}
			},
		}
	)

	// Create a ref for the last product element
	const lastProductRef = React.useRef<HTMLDivElement>(null)

	// Set up an intersection observer to detect when the last element is visible
	React.useEffect(() => {
		if (!hasNextPage || isFetchingNextPage) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
					fetchNextPage()
				}
			},
			{ threshold: 0.1 } // Trigger when at least 10% of the element is visible
		)

		if (lastProductRef.current) {
			observer.observe(lastProductRef.current)
		}

		return () => observer.disconnect()
	}, [hasNextPage, isFetchingNextPage, fetchNextPage, products])

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

	if (error) {
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
				{products?.pages
					.flatMap((page) => page.data)
					.map((product, index, array) => (
						<div
							key={product.id}
							ref={index === array.length - 1 ? lastProductRef : undefined}
						>
							<ProductCard
								id={String(product.id)}
								name={product.name}
								price={Number(product.listPrice)}
								image={
									product.resources?.[0] ||
									"/placeholder.jpeg?height=300&width=300&text=Product"
								}
							/>
						</div>
					))}
			</div>
			{isFetchingNextPage && (
				<div className="flex justify-center mt-8">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
				</div>
			)}
			{!hasNextPage && products?.pages.length && products?.pages.length > 0 && (
				<p className="text-center text-gray-500 mt-8">
					No more products to load
				</p>
			)}
		</section>
	)
}
