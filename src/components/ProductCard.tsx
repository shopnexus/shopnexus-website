import { useQuery } from "@connectrpc/connect-query";
import { Link } from "react-router-dom";
import { getProductModel, listProducts } from "shopnexus-protobuf-gen-ts";

interface ProductCardProps {
  id: bigint;
}

export default function ProductCard({ id }: ProductCardProps) {
  const { data: productModelResponse } = useQuery(getProductModel, {
    id: id,
  });
  const productModel = productModelResponse?.data;
  const { data: products } = useQuery(listProducts, {
    productModelId: id,
    pagination: {
      limit: 100,
      page: 1,
    },
  });
  const sold =
    products?.data.reduce((acc, product) => acc + Number(product.sold), 0) || 0;

  return (
    <Link
      to={`/product/${id}`}
      className="group relative flex flex-col justify-between rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 w-50 h-80 bg-white border border-gray-100"
    >
      {/* Hình ảnh sản phẩm */}
      <div className="block w-full overflow-hidden rounded-lg">
        <img
          src={productModel?.resources[0] || "/placeholder.jpeg"}
          alt={productModel?.name || ""}
          className="w-full h-40 object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Tên sản phẩm */}
      <h3 className="mt-4 text-center text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600">
        {productModel?.name}
      </h3>

      {/* Mô tả sản phẩm */}
      <p className="mt-2 text-sm text-gray-600 line-clamp-2 group-hover:text-gray-700">
        {productModel?.description}
      </p>

      {/* Tags */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {productModel?.tags?.map((tag, index) => (
          <span
            key={index}
            className="px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full border border-blue-200 shadow-sm transform transition-transform hover:scale-105"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Phần dưới cùng: giá + đã bán */}
      <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
        <p className="text-sm font-bold text-blue-600">
          {productModel?.listPrice.toLocaleString("vi-VN")} ₫
        </p>
        <div className="flex items-center gap-1">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
          </svg>
          <p className="text-sm text-gray-500">Đã bán {sold}</p>
        </div>
      </div>
    </Link>
  );
}
