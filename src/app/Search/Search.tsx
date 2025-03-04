import { useState } from 'react';
import { Slider } from '@mui/material';
import { Search as SearchIcon, X } from 'lucide-react';
import AnimatedList from '../../blocks/Components/AnimatedList/AnimatedList';
import ProductCard from '../../components/ProductCard';

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: "Nike Air Max",
    price: 129.99,
    image: "/shoes/nike-air-max.jpg",
    brand: "Nike",
    type: "Sneakers",
    size: 42
  },
  {
    id: 2,
    name: "Adidas Ultraboost",
    price: 179.99,
    image: "/shoes/adidas-ultraboost.jpg",
    brand: "Adidas",
    type: "Running",
    size: 41
  },
  // Add more mock products as needed
];

type FilterState = {
  priceRange: number[];
  sizes: number[];
  brands: string[];
  types: string[];
}

type FilterKey = keyof Omit<FilterState, 'priceRange'>;

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000],
    sizes: [],
    brands: [],
    types: []
  });

  const sizes = [36, 37, 38, 39, 40, 41, 42, 43, 44];
  const brands = ['Nike', 'Adidas', 'Puma', 'Reebok', 'New Balance'];
  const types = ['Sneakers', 'Running', 'Casual', 'Boots', 'Sandals'];

  const handleFilterChange = (_: any, newValue: number | number[]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: Array.isArray(newValue) ? newValue : [newValue, prev.priceRange[1]]
    }));
  };

  const toggleFilter = <K extends FilterKey>(type: K, value: FilterState[K][number]) => {
    setFilters(prev => ({
      ...prev,
      [type]: (prev[type] as Array<typeof value>).includes(value)
        ? (prev[type] as Array<typeof value>).filter(item => item !== value)
        : [...(prev[type] as Array<typeof value>), value]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="w-full flex items-center">
          {/* Logo */}
          <img 
            src="/src/assets/react.svg" 
            alt="Logo" 
            className="w-8 h-8 mr-3" 
          />
          {/* Input */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search for shoes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filters Panel */}
        {
          <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm">
            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Price Range</h4>
              <Slider
                value={filters.priceRange}
                onChange={handleFilterChange}
                valueLabelDisplay="auto"
                min={0}
                max={1000}
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>${filters.priceRange[0]}</span>
                <span>${filters.priceRange[1]}</span>
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Size</h4>
              <div className="grid grid-cols-3 gap-2">
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => toggleFilter('sizes', size)}
                    className={`px-3 py-2 text-sm rounded-md ${
                      filters.sizes.includes(size)
                        ? 'bg-[#161616] text-white'
                        : 'bg-gray-100 text-[#161616] hover:bg-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Brand</h4>
              <AnimatedList
                items={brands}
                onItemSelect={(brand) => toggleFilter("brands", brand)}
                showGradients={true}
                enableArrowNavigation={true}
                displayScrollbar={true}
                itemClassName="p-4 rounded-md"
                className='w-full'
                selectedItems={filters.brands}
              />
            </div>
            

            {/* Types */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Types</h4>
              <AnimatedList
                items={types}
                onItemSelect={(types) => toggleFilter("types", types)}
                showGradients={true}
                enableArrowNavigation={true}
                displayScrollbar={true}
                itemClassName="p-4 rounded-md"
                className='w-full'
                selectedItems={filters.types}
              />
            </div>
          </div>
        }

        {/* Search Results */}
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockProducts
              .filter(product => {
                // Filter by search query
                if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                  return false;
                }
                // Filter by price range
                if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
                  return false;
                }
                // Filter by size
                if (filters.sizes.length > 0 && !filters.sizes.includes(product.size)) {
                  return false;
                }
                // Filter by brand
                if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
                  return false;
                }
                // Filter by type
                if (filters.types.length > 0 && !filters.types.includes(product.type)) {
                  return false;
                }
                return true;
              })
              .map(product => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                />
              ))}
          </div>
          {mockProducts.filter(product => 
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
          ).length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No products found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search; 