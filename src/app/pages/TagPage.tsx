"use client";

import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../../components/ProductCard";
import CategoryLayout from "../../components/CategoryLayout";
import { Tag } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const mockProducts = [
  {
    id: BigInt(1),
    name: "Sneakers",
    tags: ["sneakers", "running"],
    price: 129.99,
    rating: 4.5,
  },
  {
    id: BigInt(2),
    name: "Running Shoes",
    tags: ["running", "athletic"],
    price: 149.99,
    rating: 4.8,
  },
  {
    id: BigInt(3),
    name: "Boots",
    tags: ["boots"],
    price: 199.99,
    rating: 4.7,
  },
  {
    id: BigInt(4),
    name: "Sandals",
    tags: ["sandals"],
    price: 79.99,
    rating: 4.3,
  },
  {
    id: BigInt(5),
    name: "Heels",
    tags: ["heels"],
    price: 159.99,
    rating: 4.6,
  },
  {
    id: BigInt(6),
    name: "School Shoes",
    tags: ["school"],
    price: 89.99,
    rating: 4.4,
  },
];

export default function TagPage() {
  const { tagSlug } = useParams<{ tagSlug: string }>();

  // const { data: tag } = useQuery(getTag, {
  //   tag: tagSlug ?? "",
  // });

  // Filter products by tagSlug
  const products = mockProducts.filter((product) =>
    product.tags.includes(tagSlug ?? "")
  );

  const capitalizeTitle = tagSlug
    ?.replace("-", " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const tagTitle = `${capitalizeTitle} Collection`;
  const tagDescription =
    "Discover our curated collection of high-quality products, carefully selected to match your style and preferences.";

  return (
    <CategoryLayout title={tagTitle} description={tagDescription}>
      {products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
            <Tag className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">
            No products found with this tag.
          </p>
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
