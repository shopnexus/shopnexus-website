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

    </div>
  );
};

export default FilterTopBar; 