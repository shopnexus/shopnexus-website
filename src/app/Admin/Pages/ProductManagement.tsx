import { useState, useEffect, useMemo } from "react";
import { Plus, Edit2, Trash2, Search, ArrowLeft } from "lucide-react";
import Button from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import Modal from "../../../components/ui/Modal";
import {
  createProduct,
  deleteProduct,
  getProductModel,
  listProducts,
  updateProduct,
} from "shopnexus-protobuf-gen-ts";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@connectrpc/connect-query";
import { ProductEntity } from "shopnexus-protobuf-gen-ts/pb/product/v1/product_pb";
import { useSearchParams, useNavigate } from "react-router-dom";
import Pagination from "../../../components/ui/Pagination";
import MetadataEditor from "../../../components/ui/MetadataEditor";
import FileUpload from "../../../components/ui/FileUpload";

// Add this new component for product rows
const ProductRow = ({ product, onEdit, onDelete }) => {
  const { data: productModel } = useQuery(
    getProductModel,
    {
      id: BigInt(product.productModelId),
    },
    {
      enabled: !!product.productModelId,
    }
  );

  return (
    <tr key={product.id.toString()}>
      <td className="px-6 py-4">
        <img
          src={product.resources[0] || "https://placehold.co/150x150"}
          alt={product.serialId}
          className="w-16 h-16 object-cover rounded-lg"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/150x150";
          }}
        />
      </td>
      <td className="px-6 py-4">
        <div className="font-medium">{product.serialId}</div>
      </td>
      <td className="px-6 py-4">
        <div>
          <div>{productModel?.data?.name ?? "Loading..."}</div>
          <div className="text-xs text-gray-500">
            ID: {product.productModelId.toString()}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">{product.quantity.toString()}</td>
      <td className="px-6 py-4">{product.sold.toString()}</td>
      <td className="px-6 py-4">${product.addPrice.toString()}</td>
      <td className="px-6 py-4">
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            product.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {product.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-6 py-4">
        {new Date(Number(product.dateCreated)).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(product)}
            className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
            title="Edit Product"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(product.id.toString())}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

const ProductManagement = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const modelId = searchParams.get("modelId");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductEntity | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    productModelId: modelId ? Number(modelId) : 0,
    quantity: 0,
    sold: 0,
    addPrice: 0,
    isActive: true,
    metadata: {},
    resources: [] as string[],
  });
  const { data: productModel } = useQuery(
    getProductModel,
    {
      id: BigInt(formData.productModelId),
    },
    {
      enabled: !!formData.productModelId,
    }
  );
  const {
    data: products,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery(
    listProducts,
    {
      pagination: {
        page: 1,
        limit: 10,
      },
      productModelId: modelId ? BigInt(modelId) : undefined,
    },
    {
      getNextPageParam: (lastPage) => {
        if (lastPage.pagination?.nextPage) {
          return {
            page: lastPage.pagination?.nextPage,
            limit: lastPage.pagination?.limit,
          };
        }
        return null;
      },
      pageParamKey: "pagination",
    }
  );

  const { mutateAsync: mutateCreateProduct } = useMutation(createProduct, {
    onSuccess: () => {
      refetch();
    },
  });
  const { mutateAsync: mutateUpdateProduct } = useMutation(updateProduct, {
    onSuccess: () => {
      refetch();
    },
  });
  const { mutateAsync: mutateDeleteProduct } = useMutation(deleteProduct, {
    onSuccess: () => {
      refetch();
    },
  });

  // Add these pagination states and constants
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Match the limit in your query

  // Get total pages from the pagination info
  const totalPages = Math.ceil(
    (products?.pages[products.pages.length - 1]?.pagination?.total ?? 0) /
      (products?.pages[products.pages.length - 1]?.pagination?.limit ?? 10)
  );

  // Calculate indices for displaying "Showing X to Y of Z results"
  const totalItems =
    products?.pages[products.pages.length - 1]?.pagination?.total ?? 0;

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);

    const neededPages = page - (products?.pages.length ?? 0);

    if (neededPages > 0 && hasNextPage) {
      for (let i = 0; i < neededPages; i++) {
        if (!hasNextPage || isFetchingNextPage) break;
        await fetchNextPage();
      }
    }
  };

  // Get current page data
  const currentItems = useMemo(() => {
    if (!products?.pages) return [];

    // Get the target page index
    const pageIndex = currentPage - 1;

    // If we have the page in our cache, return it
    if (pageIndex < products.pages.length) {
      return products.pages[pageIndex].data || [];
    }

    // If we're still loading the page, return the last available page
    return products.pages[products.pages.length - 1].data || [];
  }, [products, currentPage]);

  const openModal = (product?: ProductEntity) => {
    if (product) {
      setSelectedProduct(product);
      const metadata = JSON.parse(new TextDecoder().decode(product.metadata));

      setFormData({

        productModelId: Number(product.productModelId),
        quantity: Number(product.quantity),
        sold: Number(product.sold),
        addPrice: Number(product.addPrice),
        isActive: product.isActive,
        metadata: metadata,
        resources: product.resources,
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        productModelId: modelId ? Number(modelId) : 0,
        quantity: 0,
        sold: 0,
        addPrice: 0,
        isActive: true,
        metadata: {},
        resources: [],
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const metadataBuffer = new TextEncoder().encode(
        JSON.stringify(formData.metadata)
      );

      if (selectedProduct) {
        // Update existing product
        await mutateUpdateProduct({
          id: BigInt(selectedProduct.id),
          productModelId: BigInt(formData.productModelId),
          quantity: BigInt(formData.quantity),
          addPrice: BigInt(formData.addPrice),
          isActive: formData.isActive,
          metadata: metadataBuffer,
          resources: formData.resources,
        });
      } else {
        // Create new product
        await mutateCreateProduct({
          productModelId: BigInt(formData.productModelId),
          quantity: BigInt(formData.quantity),
          addPrice: BigInt(formData.addPrice),
          isActive: formData.isActive,
          metadata: metadataBuffer,
          resources: formData.resources,
        });
      }

      // Close modal after successful operation
      closeModal();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await mutateDeleteProduct({
        id: BigInt(id),
      });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    if (modelId) {
      setFormData((prev) => ({
        ...prev,
        productModelId: Number(modelId),
      }));
    }
  }, [modelId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {modelId ? (
          <div className="flex items-center">
            <Button
              size="sm"
              onClick={() => navigate("/admin/product-models")}
              className="mr-2 flex items-center text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Models
            </Button>
            <h1 className="text-2xl font-bold">
              Model: {productModel?.data?.name}
            </h1>
          </div>
        ) : (
          <h1 className="text-2xl font-bold">Products</h1>
        )}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border rounded-lg w-64"
            />
          </div>
          <Button
            onClick={() => openModal()}
            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Serial ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Add Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((product) => (
                <ProductRow
                  key={product.id.toString()}
                  product={product}
                  onEdit={openModal}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          limit={itemsPerPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          onPageChange={handlePageChange}
        />
      </Card>

      {/* Product Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedProduct ? "Edit Product" : "Add Product"}
        className="max-w-xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serial ID
            </label>
            <input
              type="text"
              name="serialId"
              value={formData.productModelId}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Product serial ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Model ID
            </label>
            <input
              type="number"
              name="productModelId"
              value={formData.productModelId}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Add Price
            </label>
            <input
              type="number"
              name="addPrice"
              value={formData.addPrice}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Is Active
            </label>
            <input
              type="checkbox"
              name="isActive"
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              defaultChecked={formData.isActive}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Metadata
            </label>
            <MetadataEditor
              metadata={formData.metadata}
              onChange={(newMetadata) => {
                setFormData((prev) => ({
                  ...prev,
                  metadata: newMetadata,
                }));
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images
            </label>
            <FileUpload
              resources={formData.resources}
              onUploadComplete={(urls) => {
                setFormData((prev) => ({
                  ...prev,
                  resources: [...prev.resources, ...urls],
                }));
              }}
              onRemoveImage={(index) => {
                setFormData((prev) => ({
                  ...prev,
                  resources: prev.resources.filter((_, i) => i !== index),
                }));
              }}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={closeModal}
            className="border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            {selectedProduct ? "Update" : "Add"} Product
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductManagement;
