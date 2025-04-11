import React from 'react';
import FilterTopBar from './FilterTopBar';
import FilterSideBar from './FilterSideBar';

interface SearchLayoutProps {
  filters: any;
  sizes: number[];
  brands: string[];
  types: string[];
  toggleFilter: any;
  handleFilterChange: any;
  handleSortChange: (value: string) => void;
  handlePriceRangeChange: (min: number, max: number) => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  children: React.ReactNode;
}

const SearchLayout: React.FC<SearchLayoutProps> = ({
  filters,
  sizes,
  brands,
  types,
  toggleFilter,
  handleFilterChange,
  handleSortChange,
  handlePriceRangeChange,
  searchQuery,
  children
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filter top bar */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <FilterTopBar
          onSortChange={handleSortChange}
          onPriceRangeChange={handlePriceRangeChange}
        />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <FilterSideBar
          filters={filters}
          sizes={sizes}
          brands={brands}
          types={types}
          toggleFilter={toggleFilter}
          handleFilterChange={handleFilterChange}
        />

        {/* Results */}
        <div className="md:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SearchLayout;
