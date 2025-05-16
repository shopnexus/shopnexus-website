"use client";

import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../../components/ProductCard";
import CategoryLayout from "../../components/CategoryLayout";
import { getBrand, listProductModels } from "shopnexus-protobuf-gen-ts";
import { useQuery } from "@connectrpc/connect-query";
import { ShoppingBag, Star, TrendingUp } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

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
  const brand = brandResponse?.data;

  const brandTitle = `${brand?.name} Collection`;
  const brandDescription = brand?.description ?? "";

  return (
    <CategoryLayout
      brandId={brandSlug ?? ""}
      title={brandTitle}
      description={brandDescription}
    >


      {products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-500 text-lg">No products found in this brand.</p>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={item}>
              <ProductCard id={product.id} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </CategoryLayout>
  );
}
