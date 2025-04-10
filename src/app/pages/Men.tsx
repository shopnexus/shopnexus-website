import React from 'react';
import CategoryLayout from '../../components/CategoryLayout';
import ProductCard from '../../components/ProductCard';
import { useProductFilter } from '../Search/useProductFilter';
import SearchLayout from '../Search/SearchLayout';

const menProducts = [
  {
    id: BigInt(1),
    name: "Men's Running Shoes",
    price: 129.99,
    image: "/shoes/mens-running.jpg",
    brand: 'Nike',
    type: 'Running',
    size: 38
  },
  // ...
];

const sizes = [36, 37, 38, 39, 40];
const brands = ['Nike', 'Adidas', 'Zara'];
const types = ['Running', 'Heels', 'Sneakers'];

const Men: React.FC = () => {

  const {
      searchQuery,
      setSearchQuery,
      filters,
      toggleFilter,
      handlePriceRangeChange,
      handleFilterChange,
      handleSortChange,
      filteredProducts
    } = useProductFilter(menProducts);

  return (
    <CategoryLayout
      title="Men's Collection"
      description="Explore our premium selection of men's footwear, from casual shoes to athletic performance wear."
    >
       <SearchLayout
      filters={filters}
      sizes={sizes}
      brands={brands}
      types={types}
      toggleFilter={toggleFilter}
      handleFilterChange={handleFilterChange}
      handleSortChange={handleSortChange}
      handlePriceRangeChange={handlePriceRangeChange}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id.toString()}
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
          />
        ))}
      </div>
      {filteredProducts.length === 0 && (
        <div className="text-center py-10 text-gray-500">No products found</div>
      )}
    </SearchLayout>
    </CategoryLayout>
  );
};

export default Men; 