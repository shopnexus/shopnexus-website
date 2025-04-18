import { useProductFilter } from './useProductFilter'
import ProductCard from '../../components/ProductCard';
import SearchLayout from './SearchLayout';

const products = [
  {
    id: BigInt(1),
    name: "Men's Running Shoes",
    price: 99.99,
    image: "/shoes/mens-running.jpg",
    brand: 'Nike',
    type: 'Running',
    size: 40
  },
  {
    id: BigInt(2),
    name: "Women's Heels",
    price: 89.99,
    image: "/shoes/womens-heels.jpg",
    brand: 'Zara',
    type: 'Heels',
    size: 38
  },
  {
    id: BigInt(3),
    name: "Unisex Sneakers",
    price: 109.99,
    image: "/shoes/unisex-sneakers.jpg",
    brand: 'Adidas',
    type: 'Sneakers',
    size: 39
  },
  // thêm sản phẩm khác nếu có...
];

const sizes = [36, 37, 38, 39, 40];
const brands = ['Nike', 'Adidas', 'Zara'];
const types = ['Running', 'Heels', 'Sneakers'];

const Search = () => {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    toggleFilter,
    handlePriceRangeChange,
    handleFilterChange,
    handleSortChange,
    filteredProducts
  } = useProductFilter(products);

  return (
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
  );
};

export default Search;
