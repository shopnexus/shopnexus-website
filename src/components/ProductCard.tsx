import { Link } from "react-router-dom"
import Button from "./ui/Button"
import { useMutation } from "@connectrpc/connect-query"
import { addCartItem } from "shopnexus-protobuf-gen-ts"

interface ProductCardProps {
	id: string
	name: string
	price: number
	image?: string
	description?: string
}

export default function ProductCard({
	id,
	name,
	price,
	image,
	description,
}: ProductCardProps) {
	const { mutateAsync: mutateAddCartItem } = useMutation(addCartItem)

	const handleAddToCart = async () => {
		try {
			await mutateAddCartItem({
				items: [{ itemId: BigInt(id), quantity: BigInt(1) }],
			})
		} catch (err: any) {
			alert(err.message)
		}
	}

	return (
		<div className="group relative rounded-lg p-4 shadow-md hover:shadow-xl transition duration-300 transform hover:scale-105">
			{/* Hình ảnh sản phẩm */}
			<Link
				to={`/product/${id}`}
				className="block w-full overflow-hidden rounded-md bg-gray-200 aspect-square group-hover:opacity-80 transition duration-300"
			>
				<img
					src={image || "/placeholder.jpeg"}
					alt={name}
					width={300}
					height={300}
					className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:border-4 group-hover:border-gray-300 group-hover:rotate-2"
				/>
			</Link>

			{/* Thông tin sản phẩm */}
			<div className="mt-4 flex justify-between items-center">
				<h3 className="text-sm font-semibold text-gray-800">
					<Link to={`/product/${id}`}>{name}</Link>
				</h3>
				<p className="text-sm font-medium text-gray-900">${price.toFixed(2)}</p>
			</div>

			{description && (
				<p className="mt-1 text-sm text-gray-500 line-clamp-2">{description}</p>
			)}

			{/* Nút Add to Cart */}
			<Button className="mt-2 w-full" onClick={handleAddToCart}>
				Add to Cart
			</Button>
		</div>
	)
}
