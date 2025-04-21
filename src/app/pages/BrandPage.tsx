"use client";

import { useParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import CategoryLayout from "../../components/CategoryLayout";
import { getBrand, listProductModels } from "shopnexus-protobuf-gen-ts";
import { useQuery } from "@connectrpc/connect-query";

export default function BrandPage() {
  const { brandSlug } = useParams<{ brandSlug: string }>();
  const { data: productModelsResponse } = useQuery(listProductModels, {
    pagination: {
      page: 1,
      limit: 10,
    },
    brandId: BigInt(brandSlug ?? ""),
  });
  const { data: brandResponse } = useQuery(getBrand, {
    id: BigInt(brandSlug ?? ""),
  });

  const products = productModelsResponse?.data ?? [];

  return (
    <CategoryLayout
      brandId={brandSlug ?? ""}
      title={`Brand: ${brandResponse?.data?.name} Collection`}
      description={brandResponse?.data?.description ?? ""}
    >
      {products.length === 0 ? (
        <p>No products found in this Brand.</p>
      ) : (
        <div className="grid grid-cols-2 gap-y-10 gap-x-6 md:grid-cols-2 lg:grid-cols-3  xl:grid-cols-4 xl:gap-x-8">
          {products.map((product) => (
            <ProductCard key={product.id} id={product.id} />
          ))}
        </div>
      )}
    </CategoryLayout>
  );
}
