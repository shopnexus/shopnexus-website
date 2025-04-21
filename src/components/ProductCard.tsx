import { useQuery } from "@connectrpc/connect-query";
import { Link } from "react-router-dom";
import { getProductModel, listProducts } from "shopnexus-protobuf-gen-ts";

interface ProductCardProps {
  id: bigint;
}

export default function ProductCard({ id }: ProductCardProps) {
  const { data: productModelResponse, isLoading: isProductModelLoading } =
    useQuery(getProductModel, {
      id: id,
    });
  const productModel = productModelResponse?.data;
  const { data: products, isLoading: isProductsLoading } = useQuery(
    listProducts,
    {
      productModelId: id,
      pagination: {
        limit: 100,
        page: 1,
      },
    }
  );
  const sold =
    products?.data.reduce((acc, product) => acc + Number(product.sold), 0) || 0;

  const isLoading = isProductModelLoading || isProductsLoading;

  return (
    <Link
      to={`/product/${id}`}
      className="group relative flex flex-col justify-between rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 w-72 h-96 bg-white border border-gray-100"
    >
      {/* Product image */}
      <div className="block w-full overflow-hidden rounded-lg">
        {isLoading ? (
          <div className="w-full h-48 bg-gray-200 animate-pulse rounded-lg" />
        ) : (
          <img
            src={productModel?.resources[0]}
            alt={productModel?.name || ""}
            className="w-full h-48 object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>

      {/* Product name */}
      <h3 className="mt-4 text-center text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-blue-600">
        {isLoading ? (
          <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4 mx-auto" />
        ) : (
          productModel?.name
        )}
      </h3>

      {/* Product description */}
      <p className="mt-2 text-sm text-gray-600 line-clamp-2 group-hover:text-gray-700">
        {isLoading ? (
          <>
            <div className="h-3 bg-gray-200 animate-pulse rounded w-full mb-1" />
            <div className="h-3 bg-gray-200 animate-pulse rounded w-4/5" />
          </>
        ) : (
          productModel?.description
        )}
      </p>

      {/* Tags */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {isLoading ? (
          <>
            <div className="h-6 bg-gray-200 animate-pulse rounded-full w-16" />
            <div className="h-6 bg-gray-200 animate-pulse rounded-full w-20" />
          </>
        ) : (
          productModel?.tags?.map((tag, index) => (
            <span
              key={index}
              className="px-2.5 py-1 text-xs font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-full border border-blue-200 shadow-sm transform transition-transform hover:scale-105"
            >
              {tag}
            </span>
          ))
        )}
      </div>

      {/* Bottom section: price + sold count */}
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
