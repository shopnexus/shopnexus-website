import { Slider } from '@mui/material';
import React from 'react'
import AnimatedList from '../../blocks/Components/AnimatedList/AnimatedList';

const FilterSideBar = ({
  filters,
  sizes,
  brands,
  types,
  toggleFilter,
  handleFilterChange,
}) => {
  return (
    <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm">
      {/* Filters Panel */}

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Price Range</h4>

        <Slider
          value={filters.priceRange}
          onChange={handleFilterChange}
          valueLabelDisplay="auto"
          min={0}
          max={10000000}
          step={500000}
          valueLabelFormat={(value) => `${(value / 1000000).toFixed(1)}M ₫`}
          sx={{
            color: '#3B82F6',
            '& .MuiSlider-thumb': {
              backgroundColor: '#fff',
              border: '2px solid #3B82F6',
            },
            '& .MuiSlider-track': {
              backgroundColor: '#3B82F6',
            },
            '& .MuiSlider-rail': {
              backgroundColor: '#ccc',
            },
            '& .MuiSlider-valueLabel': {
              backgroundColor: '#3B82F6',
            },
          }}
        />

        <div className="flex justify-between text-sm text-gray-600">
          <span>{filters.priceRange[0].toLocaleString('vi-VN')} ₫</span>
          <span>{filters.priceRange[1].toLocaleString('vi-VN')} ₫</span>
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
                  ? 'bg-blue-500 text-white'
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
          onItemSelect={(brand) => toggleFilter('brands', brand)}
          showGradients={true}
          enableArrowNavigation={true}
          displayScrollbar={true}
          itemClassName="p-4 rounded-md"
          className="w-full"
          selectedItems={filters.brands}
        />
      </div>

      {/* Types */}
      <div className="mb-6">
        <h4 className="font-medium mb-2">Types</h4>
        <AnimatedList
          items={types}
          onItemSelect={(type) => toggleFilter('types', type)}
          showGradients={true}
          enableArrowNavigation={true}
          displayScrollbar={true}
          itemClassName="p-4 rounded-md"
          className="w-full"
          selectedItems={filters.types}
        />
      </div>
    </div>
  );
};

export default FilterSideBar;
