import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import { ProductModelEntity } from 'shopnexus-protobuf-gen-ts';

interface SimilarProductsByTagAndBrandProps {
  currentProduct:ProductModelEntity|undefined
}

// Mock dữ liệu giả lập danh sách sản phẩm
const mockProducts = [
  {
    id: 1123231,
    name: 'Áo thun nam basic',
    image: 'https://i.pinimg.com/736x/d8/1f/2e/d81f2e5f3fa6d8e2b1affcda685f58b4.jpg',
    brandId: '101',
    tags: ['Games', 'nam'],
  },
  {
    id: 2123123,
    name: 'Quần jean nữ cá tính',
    image: 'https://i.pinimg.com/736x/d8/1f/2e/d81f2e5f3fa6d8e2b1affcda685f58b4.jpg',
    brandId: '101',
    tags: ['Games', 'nu'],
  },
  {
    id: 124124,
    name: 'Giày sneaker trắng',
    image: 'https://i.pinimg.com/736x/d8/1f/2e/d81f2e5f3fa6d8e2b1affcda685f58b4.jpg',
    brandId: '101',
    tags: ['Games', 'unisex'],
  },
  {
    id: 23434,
    name: 'Túi xách thời trang',
    image: 'https://i.pinimg.com/736x/d8/1f/2e/d81f2e5f3fa6d8e2b1affcda685f58b4.jpg',
    brandId: '101',
    tags: ['Shoes', 'nu'],
  },
  {
    id: 234324,
    name: 'Mũ lưỡi trai đen',
    image: 'https://i.pinimg.com/736x/d8/1f/2e/d81f2e5f3fa6d8e2b1affcda685f58b4.jpg',
    brandId: '102',
    tags: ['Shoes', 'nam'],
  },
];

const SimilarProductsByTagAndBrand: React.FC<SimilarProductsByTagAndBrandProps> = ({currentProduct }) => {
  // Lọc sản phẩm theo brandId và có ít nhất 1 tag trùng
  const similarProducts = mockProducts.filter(product => {
    // const brandMatch = product.brandId === brandId.toString();
    // const tagMatch = product.tags.some(tag => tags.includes(tag));
    // const isNotCurrentProduct = product.id !== Number(currentProductId);
    // return brandMatch && tagMatch && isNotCurrentProduct;
    return true;
  });

  if (similarProducts.length === 0) {
    return (
      <div>
        notfoud
      </div>
    )
  }

  return (
    <div className='w-full max-w-7xl mx-auto mt-24'>
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
				Similar Products
			</h2>
      <div className="grid grid-cols-2 gap-y-10 gap-x-6 sm:grid-cols-3 md:grid-cols-4  lg:grid-cols-4 xl:grid-cols-6 xl:gap-x-8">
        {similarProducts.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            id={BigInt(product.id)}
            name={product.name}
            price={199000} // 👈 giá tạm thời, bạn có thể thêm vào mock nếu cần giá thật
            image={product.image}
            description=""
          />
        ))}
      </div>
    </div>
  );
};

export default SimilarProductsByTagAndBrand;
