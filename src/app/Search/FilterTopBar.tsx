import React from 'react';

interface FilterTopBarProps {
  onSortChange: (value: string) => void;
  onPriceRangeChange: (min: number, max: number) => void;
}

const FilterTopBar: React.FC<FilterTopBarProps> = ({ onSortChange, onPriceRangeChange }) => {
  return (
    <div className="flex flex-wrap gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
      <select 
        onChange={(e) => onSortChange(e.target.value)}
        className="px-4 py-2 border rounded-md"
      >
        <option value="newest">Newest</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
      </select>

      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min Price"
          className="w-24 px-2 py-2 border rounded-md"
          onChange={(e) => onPriceRangeChange(Number(e.target.value), Infinity)}
        />
        <span>-</span>
        <input
          type="number"
          placeholder="Max Price"
          className="w-24 px-2 py-2 border rounded-md"
          onChange={(e) => onPriceRangeChange(0, Number(e.target.value))}
        />
      </div>
    </div>
  );
};

export default FilterTopBar; 