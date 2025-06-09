"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import Button from "../../components/ui/Button";
import Checkbox from "../../components/ui/Checkbox";
import { getProduct, getProductModel } from "shopnexus-protobuf-gen-ts";
import { useQuery } from "@connectrpc/connect-query";
import { parseMetadata } from "../Products/ProductDetail";

interface CartItemProps {
  product_id: bigint;
  quantity: bigint;
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onUpdateQuantity: (newQuantity: number) => void;
  onPriceUpdate?: (price: number) => void;
}

export default function CartItem({
  product_id,
  quantity,
  selected = false,
  onSelect = () => {},
  onRemove,
  onUpdateQuantity,
  onPriceUpdate,
}: CartItemProps) {
  const [localQuantity, setLocalQuantity] = useState(Number(quantity));
  const [isHovered, setIsHovered] = useState(false);

  const { data: productResponse } = useQuery(
    getProduct,
    {
      id: product_id,
    },
    {
      enabled: !!product_id,
    }
  );
  const product = productResponse?.data!;
  const { data: productModelResponse } = useQuery(
    getProductModel,
    {
      id: productResponse?.data?.productModelId,
    },
    {
      enabled: !!productResponse?.data?.productModelId,
    }
  );
  const productModel = productModelResponse?.data!;

  // Update local quantity when the prop changes (after cart refetch)
  useEffect(() => {
    setLocalQuantity(Number(quantity));
  }, [quantity]);

  const handleIncrement = () => {
    const newQuantity = localQuantity + 1;
    setLocalQuantity(newQuantity);
    onUpdateQuantity(newQuantity);
  };

  const handleDecrement = () => {
    if (localQuantity > 1) {
      const newQuantity = localQuantity - 1;
      setLocalQuantity(newQuantity);
      onUpdateQuantity(newQuantity);
    }
  };

  const metadata = product?.metadata ? parseMetadata(product.metadata) : {};
  const metadataString = Object.entries(metadata)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ");

  useEffect(() => {
    if (productModel?.listPrice) {
      onPriceUpdate?.(Number(productModel.listPrice));
    }
  }, [productModel?.listPrice, onPriceUpdate]);

  if (!productModel) {
    return (
      <div className="py-6 px-4 bg-red-50 text-red-500 rounded-md">
        Product not found
      </div>
    );
  }

  return (
    <div
      className="flex items-center py-6"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={onSelect}
        className="mr-4"
        id={`item-${String(product.id)}`}
      />

      <Link
        to={`/product/${product.productModelId}`}
        className="relative group"
      >
        <div className="h-24 w-24 rounded-md overflow-hidden bg-gray-100">
          <img
            src={productModel.resources[0] || "/placeholder.svg"}
            alt={productModel.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </Link>

      <div className="ml-4 flex-grow">
        <Link to={`/product/${product.productModelId}`}>
          <h3 className="text-lg font-medium hover:text-primary transition-colors">
            {productModel.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm mt-1">{metadataString}</p>
        <p className="text-gray-600 mt-1">
          {productModel.listPrice.toLocaleString()} ₫
        </p>

        <div className="mt-3 flex items-center">
          <div className="flex items-center space-x-2">
            <div className="flex items-center border rounded-lg overflow-hidden bg-gray-50">
              <button
                onClick={handleDecrement}
                disabled={localQuantity <= 1}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>

              <input
                type="number"
                value={localQuantity}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value > 0) {
                    setLocalQuantity(value);
                    onUpdateQuantity(value);
                  }
                }}
                min="1"
                className="w-12 text-center py-1.5 font-medium focus:outline-none"
              />

              <button
                onClick={handleIncrement}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <Button
              size="md"
              onClick={onRemove}
              className={`text-gray-400 hover:text-red-500 transition-opacity ${
                isHovered ? "opacity-100" : "opacity-0 md:opacity-100"
              }`}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remove item</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="ml-4 flex-shrink-0 text-right">
        <p className="text-lg font-semibold">
          {(Number(productModel.listPrice) * localQuantity).toLocaleString()} ₫
        </p>
      </div>
    </div>
  );
}
