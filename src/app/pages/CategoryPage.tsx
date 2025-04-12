"use client";

import { useParams } from "react-router-dom";
import ProductCard from "../../components/ProductCard";
import CategoryLayout from "../../components/CategoryLayout";


const mockProducts = [
  {
    id: BigInt(1123231),
    name: "Áo thun nam basic",
    image:
      "https://i.pinimg.com/736x/d8/1f/2e/d81f2e5f3fa6d8e2b1affcda685f58b4.jpg",
    brandId: "101",
    tags: ["Games", "nam"],
  },
  {
    id: BigInt(2123123),
    name: "Quần jean nữ cá tính",
    image:
      "https://i.pinimg.com/736x/d8/1f/2e/d81f2e5f3fa6d8e2b1affcda685f58b4.jpg",
    brandId: "101",
    tags: ["Games", "nu"],
  },
  {
    id: BigInt(124124),
    name: "Giày sneaker trắng",
    image:
      "https://i.pinimg.com/736x/d8/1f/2e/d81f2e5f3fa6d8e2b1affcda685f58b4.jpg",
    brandId: "101",
    tags: ["Games", "unisex"],
  },
  {
    id: BigInt(23434),
    name: "Túi xách thời trang",
    image:
      "https://i.pinimg.com/736x/d8/1f/2e/d81f2e5f3fa6d8e2b1affcda685f58b4.jpg",
    brandId: "101",
    tags: ["Shoes", "nu"],
  },
  {
    id: BigInt(234324),
    name: "Mũ lưỡi trai đen",
    image:
      "https://i.pinimg.com/736x/d8/1f/2e/d81f2e5f3fa6d8e2b1affcda685f58b4.jpg",
    brandId: "102",
    tags: ["Shoes", "nam"],
  },
];
export default function CategoryPage() {
  const { categorySlug } = useParams<{ categorySlug: string }>();

  // Lọc sản phẩm theo categorySlug
  const products = mockProducts.filter((product) =>
    product.tags.includes(categorySlug ?? "")
  );

  return (

      <CategoryLayout
        title={`Category: ${categorySlug?.replace("-", " ")} Collection`}
        description="Discover our latest collection of women's footwear, from elegant heels to comfortable sneakers."
      >
        {products.length === 0 ? (
          <p>No products found in this Category.</p>
        ) : (
          <div className="grid grid-cols-2 gap-y-10 gap-x-6 sm:grid-cols-3 md:grid-cols-4  lg:grid-cols-4 xl:grid-cols-6 xl:gap-x-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                image={product.image}
                price={123}
              />
            ))}
          </div>
        )}
      </CategoryLayout>

  );
}
