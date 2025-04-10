import React, { useState } from 'react';
import CategoryLayout from '../../components/CategoryLayout';
import ProductCard from '../../components/ProductCard';
import FilterBar from '../Search/FilterTopBar';
import { useProductFilter } from '../Search/useProductFilter';
import SearchLayout from '../Search/SearchLayout';

const womenProducts = [
  {
    id: BigInt(1),
    name: "Women's Running Shoes",
    price: 129.99,
    image: "/shoes/womens-running.jpg",
    brand: 'Nike',
    type: 'Running',
    size: 38
  },
  // ...
];


const sizes = [36, 37, 38, 39, 40];
const brands = ['Nike', 'Adidas', 'Zara'];
const types = ['Running', 'Heels', 'Sneakers'];


const Women: React.FC = () => {

  const {
    searchQuery,
    setSearchQuery,
    filters,
    toggleFilter,
    handlePriceRangeChange,
    handleFilterChange,
    handleSortChange,
    filteredProducts
  } = useProductFilter(womenProducts);


  return (
    <CategoryLayout
      title="Women's Collection"
      description="Discover our latest collection of women's footwear, from elegant heels to comfortable sneakers."
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

export default Women; 