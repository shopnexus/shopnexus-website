"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Stack from "../../blocks/Components/Stack/Stack";
import { useMutation, useQuery } from "@connectrpc/connect-query";
import {
  addCartItem,
  getBrand,
  getProductModel,
  listProducts,
  type ProductEntity,
} from "shopnexus-protobuf-gen-ts";
import CommentLayout from "../Comment/ComentLayout";
import FeaturedProducts from "./FeaturedProducts";
import NewProducts from "./NewProducts";
import SimilarProductsByTagAndBrand from "./SimilarProducts";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

//#region Utility Functions
// Convert Uint8Array metadata to object
export const parseMetadata = (metadata: Uint8Array): Record<string, any> => {
  try {
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(metadata);
    const data = JSON.parse(jsonString);
    return data;
  } catch (error) {
    console.error("Error parsing metadata:", error);
    return {};
  }
};

// Get unique values from product metadata for a specific key
const getUniqueMetadataValues = (
  products: ProductEntity[],
  key: string
): any[] => {
  const values = products
    .map((product) => {
      const metadata = parseMetadata(product.metadata);
      return metadata[key];
    })
    .filter((value) => value !== undefined && value !== null);

  // Return unique values, ensuring proper comparison for numbers and strings
  return Array.from(new Set(values.map(String))).map((value) => {
    // Convert back to number if it was originally a number
    const num = Number(value);
    return !isNaN(num) ? num : value;
  });
};

// Sort numeric values
const sortNumeric = (values: any[]): any[] => {
  return [...values].sort((a, b) => {
    if (typeof a === "number" && typeof b === "number") {
      return a - b;
    }
    return String(a).localeCompare(String(b));
  });
};
//#endregion

//#region Child Components
// Component for thumbnail list
const ThumbnailList: React.FC<{
  images: string[];
  selectedImage: string;
  onThumbnailClick: (image: string) => void;
}> = React.memo(({ images, selectedImage, onThumbnailClick }) => {
  console.log("images", images);
  return (
    <div className="grid grid-cols-6 gap-2">
      {images.map((image, index) => (
        <button
          key={index}
          onClick={() => onThumbnailClick(image)}
          className={`border-2 rounded transition duration-150 ease-in-out ${
            selectedImage === image ? "border-blue-500" : "border-gray-200"
          }`}
        >
          <img
            src={image || "/placeholder.svg"}
            alt={`thumbnail ${index + 1}`}
            loading="lazy"
            className="object-cover w-full h-full"
          />
        </button>
      ))}
    </div>
  );
});

// Component for variant selection
interface VariantSelectionProps {
  products: ProductEntity[];
  selectedVariantOptions: Record<string, any>;
  onSelectVariantOption: (key: string, value: any) => void;
  quantity: number;
  availableStock: number;
  onQuantityChange: React.ChangeEventHandler<HTMLInputElement>;
  onAddToCart: () => void;
  isAddingToCart: boolean;
  addToCartSuccess: boolean;
}

const VariantSelection: React.FC<VariantSelectionProps> = React.memo(
  ({
    products,
    selectedVariantOptions,
    onSelectVariantOption,
    quantity,
    availableStock,
    onQuantityChange,
    onAddToCart,
    isAddingToCart,
    addToCartSuccess,
  }) => {
    // Get all possible variant keys from metadata
    const variantKeys = useMemo(() => {
      if (products.length === 0) return [];

      // Collect all unique keys from all products' metadata
      const allKeys = new Set<string>();
      products.forEach((product) => {
        const metadata = parseMetadata(product.metadata);
        Object.keys(metadata).forEach((key) => allKeys.add(key));
      });

      return Array.from(allKeys);
    }, [products]);

    // Check if a variant option is available
    const isOptionAvailable = useCallback(
      (key: string, value: any): boolean => {
        // If no options are selected, all options with stock should be available
        const hasAnySelection = Object.values(selectedVariantOptions).some(
          (v) => v !== null
        );
        if (!hasAnySelection) {
          return products.some((product) => {
            const metadata = parseMetadata(product.metadata);
            return metadata[key] === value && product.quantity > 0;
          });
        }

        // Create a copy of current selections
        const selections = { ...selectedVariantOptions };

        // Check if any product matches the current selections with this option
        return products.some((product) => {
          const metadata = parseMetadata(product.metadata);

          // Check if this product matches all selected options
          for (const [k, v] of Object.entries(selections)) {
            // Skip null values (unselected options)
            if (v === null) continue;
            // Skip the current key we're checking
            if (k === key) continue;

            // If this option doesn't match, this product doesn't match
            if (metadata[k] !== v) return false;
          }

          // Check if this product has the value we're testing for this key
          return metadata[key] === value && product.quantity > 0;
        });
      },
      [products, selectedVariantOptions]
    );

    return (
      <div className="space-y-4">
        {/* Render each variant type dynamically from metadata */}
        {variantKeys.map((key) => (
          <div key={key}>
            <h3 className="font-medium capitalize">{key}:</h3>
            <div className="flex space-x-2">
              {sortNumeric(getUniqueMetadataValues(products, key)).map(
                (value) => {
                  // Check if this option is currently selected
                  const isSelected = selectedVariantOptions[key] === value;
                  // Only disable if it's not available AND not currently selected
                  const shouldDisable =
                    !isOptionAvailable(key, value) && !isSelected;

                  return (
                    <button
                      key={`${key}-${value}`}
                      disabled={shouldDisable}
                      onClick={() =>
                        onSelectVariantOption(key, isSelected ? null : value)
                      }
                      className={`px-3 py-1 border rounded transition duration-150 ease-in-out ${
                        isSelected
                          ? "bg-blue-500 text-white"
                          : "bg-white text-black"
                      } ${
                        shouldDisable
                          ? "opacity-50 cursor-not-allowed bg-gray-400"
                          : ""
                      }`}
                    >
                      {value}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        ))}

        {availableStock === 0 && (
          <p className="text-red-500">This combination is out of stock</p>
        )}

        {/* Quantity selection */}
        <div className="flex items-center space-x-4">
          <label htmlFor="quantity" className="font-medium">
            Quantity:
          </label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={onQuantityChange}
            min="1"
            max={availableStock}
            disabled={availableStock <= 0}
            className="w-20 px-3 py-2 border rounded"
          />
        </div>
        <p className="text-sm text-gray-500">
          {availableStock} items available
        </p>

        {/* Add to cart button with animation */}
        <button
          onClick={onAddToCart}
          disabled={availableStock <= 0 || isAddingToCart}
          className={`relative w-full py-3 px-6 rounded-lg text-white font-medium transition-all duration-300 ease-in-out overflow-hidden
            ${
              availableStock > 0 && !isAddingToCart
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            } 
            ${addToCartSuccess ? "bg-green-500" : ""}`}
        >
          <span
            className={`flex items-center justify-center transition-all duration-300 ${
              isAddingToCart ? "opacity-0" : "opacity-100"
            } ${addToCartSuccess ? "scale-0" : "scale-100"}`}
          >
            Add to Cart
          </span>

          {isAddingToCart && (
            <span className="absolute inset-0 flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </span>
          )}

          {addToCartSuccess && (
            <span className="absolute inset-0 flex items-center justify-center animate-fadeIn">
              <span className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Added to Cart
              </span>
            </span>
          )}
        </button>

        {addToCartSuccess && (
          <div className="fixed bottom-5 right-5 bg-white shadow-lg rounded-lg p-4 flex items-center space-x-3 animate-slideIn z-50">
            <div className="bg-green-100 p-2 rounded-full">
              <ShoppingCart className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="font-medium">Item added to cart!</p>
              <p className="text-sm text-gray-500">
                Continue shopping or checkout{" "}
                <Link style={{ color: "blue" }} to="/cart">
                  here
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
);
//#endregion

// Main Component
const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariantOptions, setSelectedVariantOptions] = useState<
    Record<string, any>
  >({});
  const [cards, setCards] = useState<{ id: number; img: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);

  const { mutateAsync: mutateAddCartItem } = useMutation(addCartItem);

  // Fetch product model data
  const {
    data: productModel,
    isLoading: isLoadingModel,
    error: modelError,
  } = useQuery(
    getProductModel,
    {
      id: id ? BigInt(id) : undefined,
    },
    {
      enabled: !!id,
    }
  );

  const { data: brand } = useQuery(
    getBrand,
    {
      id: productModel?.data?.brandId,
    },
    {
      enabled: !!productModel?.data?.brandId,
    }
  );

  // Fetch product variants
  const { data: products } = useQuery(listProducts, {
    productModelId: productModel?.data?.id,
    pagination: {
      limit: 100,
      page: 1,
    },
  });

  //#region Load Data & Default Setup
  useEffect(() => {
    if (productModel && products?.data.length) {
      try {
        // Set up image cards from resources
        const images = productModel?.data?.resources || [];
        if (images.length > 0) {
          const imageCards = images.map((img, index) => ({
            id: index + 1,
            img,
          }));
          setCards(imageCards);
          setSelectedImage(images[0]);
        }

        // Reset selections
        setSelectedVariantOptions({});
        setQuantity(1);
      } catch (err) {
        setError("Error processing product data");
        console.error(err);
      }
    }
  }, [productModel, products]);

  // Add useEffect to scroll to top when id changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  //#endregion

  //#region Stock & Quantity Handling
  const totalStock = useCallback((): number => {
    return (
      products?.data.reduce((sum, item) => sum + Number(item.quantity), 0) || 0
    );
  }, [products]);

  const getAvailableStock = useCallback((): number => {
    // If no variant options are selected, return total stock
    if (Object.keys(selectedVariantOptions).length === 0) {
      return totalStock();
    }

    // Find products that match all selected variant options
    const matchingProducts = products?.data.filter((product) => {
      const metadata = parseMetadata(product.metadata);

      // Check if this product matches all selected options
      for (const [key, value] of Object.entries(selectedVariantOptions)) {
        if (value === null) continue; // Skip unselected options
        if (metadata[key] !== value) return false;
      }

      return true;
    });
    console.log(matchingProducts);

    // Sum up quantities of matching products
    return (
      matchingProducts?.reduce(
        (sum, product) => sum + Number(product.quantity),
        0
      ) || 0
    );
  }, [products, selectedVariantOptions, totalStock]);

  useEffect(() => {
    const stock = getAvailableStock();
    if (stock > 0 && quantity > stock) {
      setQuantity(stock);
    }
  }, [selectedVariantOptions, quantity, getAvailableStock]);
  //#endregion

  //#region Event Handlers
  const handleCardChange = useCallback((card: { id: number; img: string }) => {
    setSelectedImage(card.img);
  }, []);

  const handleThumbnailClick = useCallback((image: string) => {
    setSelectedImage(image);
    setCards((prevCards) => {
      const newCards = [...prevCards];
      const index = newCards.findIndex((card) => card.img === image);
      if (index !== -1) {
        const [card] = newCards.splice(index, 1);
        newCards.push(card);
      }
      return newCards;
    });
  }, []);

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(e.target.value, 10);
      const stock = getAvailableStock();
      if (isNaN(value) || value < 1) {
        setQuantity(1);
      } else if (value > stock) {
        setQuantity(stock);
      } else {
        setQuantity(value);
      }
    },
    [getAvailableStock]
  );

  const handleSelectVariantOption = useCallback((key: string, value: any) => {
    setSelectedVariantOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleAddToCart = useCallback(() => {
    // Kiểm tra đăng nhập
    if (!user) {
      // Lưu lại product ID để quay về sau khi đăng nhập
      localStorage.setItem("redirectAfterLogin", `/product/${id}`);
      navigate("/login");
      return;
    }

    // Reset success state if it was previously set
    if (addToCartSuccess) {
      setAddToCartSuccess(false);
    }

    // Find the matching product variant
    const matchingProduct = products?.data.find((product) => {
      const metadata = parseMetadata(product.metadata);

      if (Object.keys(selectedVariantOptions).length === 0) {
        return false;
      }

      // Check if this product matches all selected options
      for (const [key, value] of Object.entries(selectedVariantOptions)) {
        if (value === null) return false; // All options must be selected
        if (metadata[key] !== value) return false;
      }

      return true;
    });

    if (matchingProduct) {
      console.log("Add to cart:", {
        productId: matchingProduct.id,
        quantity,
        metadata: parseMetadata(matchingProduct.metadata),
      });

      // Start loading animation
      setIsAddingToCart(true);

      if (productModel?.data?.id) {
        mutateAddCartItem({
          items: [
            {
              itemId: matchingProduct.id,
              quantity: BigInt(quantity),
            },
          ],
        })
          .then(() => {
            ////--------------------------------------- animation--------------------------------
            setAddToCartSuccess(true);
            setTimeout(() => setAddToCartSuccess(false), 3000);
          })
          .catch((error) => {
            console.error("Error adding to cart:", error);
          })
          .finally(() => {
            setIsAddingToCart(false);
          });
      } else {
        // Simulate API call for demo purposes
        setTimeout(() => {
          setIsAddingToCart(false);
          setAddToCartSuccess(true);

          // Reset after 3 seconds
          setTimeout(() => {
            setAddToCartSuccess(false);
          }, 3000);
        }, 800);
      }
    }
  }, [
    user,
    id,
    navigate,
    addToCartSuccess,
    selectedVariantOptions,
    quantity,
    products,
    productModel,
    mutateAddCartItem,
  ]);
  //#endregion

  //#region Derived Data with useMemo
  const allImages = useMemo(() => {
    return productModel?.data?.resources || [];
  }, [productModel]);

  const availableStock = useMemo(
    () => getAvailableStock(),
    [getAvailableStock]
  );

  const formattedPrice = useMemo(() => {
    if (!productModel?.data?.listPrice) return "0 ₫";
    // Convert bigint to number and format as Vietnamese Dong
    const price = Number(productModel?.data?.listPrice);
    return `${price.toLocaleString("vi-VN")} ₫`;
  }, [productModel]);
  //#endregion

  if (modelError) {
    return (
      <div className="text-red-500 text-center p-4">
        {modelError
          ? "Error loading product details"
          : "Error loading product variants"}
      </div>
    );
  }

  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (isLoadingModel || !productModel) {
    return <div className="text-center p-4">Loading product details...</div>;
  }

  return (
    <section className="mx-auto px-20 py-8 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images Section */}
        <div className="space-y-4">
          {cards.length > 0 && (
            <>
              <Stack
                randomRotation={true}
                sensitivity={180}
                sendToBackOnClick={false}
                cardDimensions={{ width: 300, height: 300 }}
                cardsData={cards}
                onCardChange={handleCardChange}
              />
              <ThumbnailList
                images={allImages}
                selectedImage={selectedImage}
                onThumbnailClick={handleThumbnailClick}
              />
            </>
          )}
          {cards.length === 0 && (
            <div className="bg-gray-200 h-64 flex items-center justify-center">
              <p>No images available</p>
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{productModel?.data?.name}</h1>
          <div className="flex items-center space-x-4 text-sm">
            <span>Brand: {brand?.data?.name}</span>
          </div>
          <p className="text-2xl font-semibold text-blue-600">
            {formattedPrice}
          </p>
          <div className="space-y-2">
            <p className="text-gray-600">{productModel?.data?.description}</p>
            <div className="flex flex-wrap gap-2">
              {productModel?.data?.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-sm bg-gray-100 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <VariantSelection
            products={products?.data || []}
            selectedVariantOptions={selectedVariantOptions}
            onSelectVariantOption={handleSelectVariantOption}
            quantity={quantity}
            availableStock={availableStock}
            onQuantityChange={handleQuantityChange}
            onAddToCart={handleAddToCart}
            isAddingToCart={isAddingToCart}
            addToCartSuccess={addToCartSuccess}
          />
        </div>
      </div>

      <CommentLayout dest_id={id ? BigInt(id) : BigInt(0)}></CommentLayout>
      <SimilarProductsByTagAndBrand
        currentProduct={productModel.data}
      ></SimilarProductsByTagAndBrand>
      <FeaturedProducts></FeaturedProducts>
      <NewProducts></NewProducts>
    </section>
  );
};

export default ProductDetail;
