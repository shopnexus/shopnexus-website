import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@connectrpc/connect-query";
import {
  listProductModels,
  listBrands,
  listProductTypes,
} from "shopnexus-protobuf-gen-ts";
import Button from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import ProductCard from "../../components/ProductCard";
import { Search as SearchIcon } from "lucide-react";
import debounce from "lodash/debounce";
import { useLocation, useNavigate } from "react-router-dom";

export default function Search() {
  const [searchParams, setSearchParams] = useState({
    name: "",
    description: "",
    brandId: "",
    type: "",
    listPriceFrom: "",
    listPriceTo: "",
    dateManufacturedFrom: "",
    dateManufacturedTo: "",
  });

  // Create a debounced version of setSearchParams
  const debouncedSetSearchParams = useCallback(
    debounce((newParams) => {
      setSearchParams(newParams);
    }, 500),
    []
  );

  // Get the query from URL when component mounts
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nameQuery = params.get("name");
    if (nameQuery) {
      debouncedSetSearchParams({
        ...searchParams,
        name: nameQuery,
      });
    }
  }, [location.search]);

  // Handler for input changes
  const handleInputChange = (field: string, value: string) => {
    const newParams = {
      ...searchParams,
      [field]: value,
    };
    // Debounce the actual search
    debouncedSetSearchParams(newParams);
  };

  const { data: productModels } = useQuery(listProductModels, {
    pagination: {
      page: 1,
      limit: 12,
    },
    ...(searchParams.name && { name: searchParams.name }),
    ...(searchParams.description && { description: searchParams.description }),
    ...(searchParams.brandId && { brandId: BigInt(searchParams.brandId) }),
    ...(searchParams.type && { type: BigInt(searchParams.type) }),
    ...(searchParams.listPriceFrom && {
      listPriceFrom: BigInt(searchParams.listPriceFrom),
    }),
    ...(searchParams.listPriceTo && {
      listPriceTo: BigInt(searchParams.listPriceTo),
    }),
    ...(searchParams.dateManufacturedFrom && {
      dateManufacturedFrom: BigInt(
        new Date(searchParams.dateManufacturedFrom).getTime()
      ),
    }),
    ...(searchParams.dateManufacturedTo && {
      dateManufacturedTo: BigInt(
        new Date(searchParams.dateManufacturedTo).getTime()
      ),
    }),
  });

  const { data: brands } = useQuery(listBrands, {
    pagination: { page: 1, limit: 100 },
  });

  const { data: productTypes } = useQuery(listProductTypes, {
    pagination: { page: 1, limit: 100 },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search will automatically trigger due to the useQuery dependencies
  };

  const handleReset = () => {
    setSearchParams({
      name: "",
      description: "",
      brandId: "",
      type: "",
      listPriceFrom: "",
      listPriceTo: "",
      dateManufacturedFrom: "",
      dateManufacturedTo: "",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[800px]">
      {/* Top Navigation Search Bar */}
      {/* <div className="mb-8 sticky top-0 z-10 bg-white py-4 shadow-sm">
        <div className="relative">
          <input
            type="text"
            onInput={(e) =>
              handleInputChange("name", (e.target as HTMLInputElement).value)
            }
            placeholder="Search by name..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div> */}

      {/* Advanced Search Form */}
      <Card className="mb-8 p-6">
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <select
                value={searchParams.brandId}
                onChange={(e) => handleInputChange("brandId", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Brands</option>
                {brands?.data?.map((brand) => (
                  <option key={brand.id.toString()} value={brand.id.toString()}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Type
              </label>
              <select
                value={searchParams.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Types</option>
                {productTypes?.data?.map((type) => (
                  <option key={type.id.toString()} value={type.id.toString()}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range (From)
              </label>
              <input
                type="number"
                defaultValue={searchParams.listPriceFrom}
                onChange={(e) =>
                  handleInputChange("listPriceFrom", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-lg"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range (To)
              </label>
              <input
                type="number"
                defaultValue={searchParams.listPriceTo}
                onChange={(e) =>
                  handleInputChange("listPriceTo", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-lg"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufactured Date (From)
              </label>
              <input
                type="date"
                value={searchParams.dateManufacturedFrom}
                onChange={(e) =>
                  handleInputChange("dateManufacturedFrom", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufactured Date (To)
              </label>
              <input
                type="date"
                value={searchParams.dateManufacturedTo}
                onChange={(e) =>
                  handleInputChange("dateManufacturedTo", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Search
            </Button>
          </div>
        </form>
      </Card>

      {/* Search Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {productModels?.data?.map((productModel) => (
          <ProductCard key={productModel.id} id={productModel.id} />
        ))}
      </div>

      {productModels?.data?.length === 0 && (
        <div className="text-center">
          <p className="text-gray-500">
            No products found matching your criteria
          </p>
        </div>
      )}
    </div>
  );
}
