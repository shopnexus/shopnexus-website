import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export type Product = {
  id: bigint;
  name: string;
  price: number;
  image: string;
  brand: string;
  type: string;
  size: number;
};

export type FilterState = {
  priceRange: number[];
  sizes: number[];
  brands: string[];
  types: string[];
};

type FilterKey = keyof Omit<FilterState, 'priceRange'>;

export const useProductFilter = (allProducts: Product[]) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 1000],
    sizes: [],
    brands: [],
    types: []
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    setSearchQuery(q);
  }, [location.search]);

  const toggleFilter = <K extends FilterKey>(type: K, value: FilterState[K][number]) => {
    setFilters(prev => ({
      ...prev,
      [type]: (prev[type] as any[]).includes(value)
        ? (prev[type] as any[]).filter(item => item !== value)
        : [...(prev[type] as any[]), value]
    }));
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [min, max]
    }));
  };

  const handleFilterChange = (_: any, newValue: number | number[]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: Array.isArray(newValue) ? newValue : [newValue, prev.priceRange[1]]
    }));
  };

  const handleSortChange = (sort: string) => {
    if (sort === 'price-low') {
      allProducts.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      allProducts.sort((a, b) => b.price - a.price);
    } else {
      allProducts.sort((a, b) => Number(b.id) - Number(a.id));
    }
  };

  const filteredProducts = allProducts.filter(product => {
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false;
    }
    if (filters.sizes.length > 0 && !filters.sizes.includes(product.size)) {
      return false;
    }
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
      return false;
    }
    if (filters.types.length > 0 && !filters.types.includes(product.type)) {
      return false;
    }
    return true;
  });

  return {
    searchQuery,
    setSearchQuery,
    filters,
    toggleFilter,
    handlePriceRangeChange,
    handleFilterChange,
    handleSortChange,
    filteredProducts
  };
};
