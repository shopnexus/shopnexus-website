"use client";

import { useParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import CategoryLayout from "../../components/CategoryLayout";

const mockProducts = [
  {
    id: BigInt(1),
    name: "Sneakers",
    tags: ["sneakers", "running"],
  },
  {
    id: BigInt(2),
    name: "Running Shoes",
    tags: ["running", "athletic"],
  },
  {
    id: BigInt(3),
    name: "Boots",
    tags: ["boots"],
  },
  {
    id: BigInt(4),
    name: "Sandals",
    tags: ["sandals"],
  },
  {
    id: BigInt(5),
    name: "Heels",
    tags: ["heels"],
  },
  {
    id: BigInt(6),
    name: "School Shoes",
    tags: ["school"],
  },
];
export default function TagPage() {
  const { tagSlug } = useParams<{ tagSlug: string }>();

  // Lọc sản phẩm theo tagSlug
  const products = mockProducts.filter((product) =>
    product.tags.includes(tagSlug ?? "")
  );
  const capitalizeTitle = tagSlug
    ?.replace("-", " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <CategoryLayout
      title={`${capitalizeTitle} Collection`}
      description="Discover our latest collection of women's footwear, from elegant heels to comfortable sneakers."
    >
      {products.length === 0 ? (
        <p>No products found in this Tag.</p>
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
