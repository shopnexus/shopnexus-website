import React from "react";
import { Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import {
  listProductModels,
  ProductModelEntity,
} from "shopnexus-protobuf-gen-ts";
import { useQuery } from "@connectrpc/connect-query";

interface SimilarProductsByTagAndBrandProps {
  currentProduct: ProductModelEntity | undefined;
}

const SimilarProductsByTagAndBrand: React.FC<
  SimilarProductsByTagAndBrandProps
> = ({ currentProduct }) => {
  const { data: similarProducts } = useQuery(listProductModels, {
    pagination: {
      limit: 10,
      page: 1,
    },
    brandId: currentProduct?.brandId,
    type: currentProduct?.type,
  });

  if (similarProducts?.data.length === 0) {
    return <div>notfoud</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-24">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
        Similar Products
      </h2>
      <div className="grid grid-cols-2 gap-y-10 gap-x-6 sm:grid-cols-3 md:grid-cols-4  lg:grid-cols-4 xl:grid-cols-6 xl:gap-x-8">
        {similarProducts?.data.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            id={BigInt(product.id)}
            name={product.name}
            price={199000} // 👈 giá tạm thời, bạn có thể thêm vào mock nếu cần giá thật
            image={product.resources[0]}
            description=""
          />
        ))}
      </div>
    </div>
  );
};

export default SimilarProductsByTagAndBrand;
