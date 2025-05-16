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

// type Variant = Record<string, any>;

// function isEmpty(obj: Record<string, any>) {
//   return Object.keys(obj).length === 0 && obj.constructor === Object;
// }

//#region Utility Functions
// Convert Uint8Array metadata to object
export const parseMetadata = (metadata: Uint8Array): Record<string, any> => {
  try {
    const decoder = new TextDecoder();
    const jsonString = decoder.decode(metadata);
    const data = JSON.parse(jsonString);
    for (const key in data) {
      data[key] = String(data[key]);
    }
    return data;
  } catch (error) {
    console.error("Error parsing metadata:", error);
    return {};
  }
};

// // filter metadata
// function getOptions(
//   variants: Variant[],
//   selected: Partial<Variant>
// ): Record<string, string[]> {
//   const filtered = isEmpty(selected)
//     ? variants
//     : variants.filter((variant) =>
//         Object.entries(selected).every(([k, v]) => variant[k] === v)
//       );

//   const options: Record<string, Set<string>> = {};
//   for (const variant of filtered) {
//     for (const [key, value] of Object.entries(variant)) {
//       if (!options[key]) options[key] = new Set();
//       options[key].add(value);
//     }
//   }

//   // Convert sets to arrays for UI rendering
//   return Object.fromEntries(
//     Object.entries(options).map(([k, v]) => [k, Array.from(v)])
//   );

//   /*
// {
//   size: ["5", "6"],
//   color: ["blue"]
// }
// */
// }

//#region Child Components
// Component for thumbnail list
const ThumbnailList: React.FC<{
  images: string[];
  selectedImage: string;
  onThumbnailClick: (image: string) => void;
}> = React.memo(({ images, selectedImage, onThumbnailClick }) => {
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
    // Get all possible variant keys and their values from metadata
    const variantOptions = useMemo(() => {
      if (products.length === 0) return {};

      const options: Record<string, Set<string>> = {};
      products.forEach((product) => {
        const metadata = parseMetadata(product.metadata);
        Object.entries(metadata).forEach(([key, value]) => {
          if (!options[key]) options[key] = new Set();
          options[key].add(value);
        });
      });

      return Object.fromEntries(
        Object.entries(options).map(([k, v]) => [k, Array.from(v)])
      );
    }, [products]);

    // Get available options based on current selection
    const getAvailableOptions = (key: string): string[] => {
      const currentSelection = { ...selectedVariantOptions };
      delete currentSelection[key];

      return products
        .filter((product) => {
          const metadata = parseMetadata(product.metadata);
          return Object.entries(currentSelection).every(
            ([k, v]) => metadata[k] === v
          );
        })
        .map((product) => parseMetadata(product.metadata)[key])
        .filter((value, index, self) => self.indexOf(value) === index);
    };

    // Check if an option is available
    const isOptionAvailable = (key: string, value: string): boolean => {
      return getAvailableOptions(key).includes(value);
    };

    // Check if an option is selected
    const isOptionSelected = (key: string, value: string): boolean => {
      return selectedVariantOptions[key] === value;
    };

    return (
      <div className="space-y-6">
        {Object.entries(variantOptions).map(([key, values]) => (
          <div key={key} className="space-y-3">
            <h3 className="font-medium capitalize text-gray-700">{key}:</h3>
            <div className="flex flex-wrap gap-3">
              {Array.from(new Set(values)).map((value) => {
                const isAvailable = isOptionAvailable(key, value);
                const isSelected = isOptionSelected(key, value);
                // Create a unique key by combining the variant key and value
                const uniqueKey = `${key}-${value}`;

                return (
                  <button
                    key={uniqueKey}
                    onClick={() =>
                      isAvailable && onSelectVariantOption(key, value)
                    }
                    disabled={!isAvailable}
                    className={`
                      relative flex items-center justify-center
                      min-w-[60px] px-4 py-2
                      rounded-md border-2 transition-all duration-200
                      ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }
                      ${!isAvailable && "opacity-50 cursor-not-allowed"}
                    `}
                  >
                    <span className="text-sm">{value}</span>
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-gray-100 opacity-50 rounded-md" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {availableStock === 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">
              This combination is out of stock
            </p>
          </div>
        )}

        {/* Quantity selector */}
        <div className="flex items-center space-x-4">
          <label htmlFor="quantity" className="font-medium text-gray-700">
            Quantity:
          </label>
          <div className="flex items-center border rounded-md">
            <button
              onClick={() =>
                quantity > 1 &&
                onQuantityChange({
                  target: { value: String(quantity - 1) },
                } as any)
              }
              disabled={quantity <= 1}
              className="px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              -
            </button>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={onQuantityChange}
              min="1"
              max={availableStock}
              disabled={availableStock <= 0}
              className="w-16 text-center border-x py-2 focus:outline-none"
            />
            <button
              onClick={() =>
                quantity < availableStock &&
                onQuantityChange({
                  target: { value: String(quantity + 1) },
                } as any)
              }
              disabled={quantity >= availableStock}
              className="px-3 py-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              +
            </button>
          </div>
          <p className="text-sm text-gray-500">
            {availableStock} items available
          </p>
        </div>

        {/* Add to cart button */}
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
    console.log(matchingProducts?.map((p) => parseMetadata(p.metadata)));

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
    setSelectedVariantOptions((prev) => {
      // If the clicked option is already selected, remove it
      if (prev[key] === value) {
        const newOptions = { ...prev };
        delete newOptions[key];
        return newOptions;
      }
      // Otherwise, update with the new selection
      return {
        ...prev,
        [key]: value,
      };
    });
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
