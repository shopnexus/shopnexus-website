import { Link } from "react-router-dom"

interface ProductCardProps {
	id: bigint
	name: string
	price: number
	image?: string
	description?: string
	sold?: number // Thêm số lượng đã bán nếu cần
}

export default function ProductCard({
	id,
	name,
	price,
	image,
	sold = 0, // default nếu không truyền vào
}: ProductCardProps) {
	return (
		<Link to={`/product/${id}`} className="group relative flex flex-col justify-between rounded-lg p-4 shadow-md hover:shadow-blue-300 transition duration-300 transform w-50 h-80 ">
			{/* Hình ảnh sản phẩm */}
			<div className="block w-full overflow-hidden bg-white rounded-md">
				<img
					src={image || "/placeholder.jpeg"}
					alt={name}
					className="w-full h-40 object-cover object-center"
				/>
			</div>

			{/* Tên sản phẩm */}
			<h3 className="mt-3 text-center text-sm font-semibold text-gray-800 line-clamp-1">
				{name}
			</h3>

			{/* Phần dưới cùng: giá + đã bán */}
			<div className="flex justify-between items-center mt-auto pt-4">
				<p className="text-sm font-semibold text-gray-900">${price.toFixed(2)}</p>
				<p className="text-sm text-gray-500">Đã bán {sold}</p>
			</div>
		</Link>
	)
}
