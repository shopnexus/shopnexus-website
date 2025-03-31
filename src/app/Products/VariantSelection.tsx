import React, { useCallback } from "react";
import { Product } from "./ProductDetail";

interface VariantSelectionProps {
  product: Product;
  selectedColor: string | null;
  selectedSize: number | null;
  onSelectColor: (color: string | null) => void;
  onSelectSize: (size: number | null) => void;
  quantity: number;
  availableStock: number;
  onQuantityChange: React.ChangeEventHandler<HTMLInputElement>;
  onAddToCart: () => void;
}

export const VariantSelection: React.FC<VariantSelectionProps> = React.memo(({
  product,
  selectedColor,
  selectedSize,
  onSelectColor,
  onSelectSize,
  quantity,
  availableStock,
  onQuantityChange,
  onAddToCart,
}) => {
  const isColorOptionAvailable = useCallback(
    (color: string): boolean => {
      if (!selectedSize) {
        return product.quantity.some(q => q.color === color && q.quantity > 0);
      } else {
        return product.quantity.some(q => q.color === color && q.size === selectedSize && q.quantity > 0);
      }
    },
    [product.quantity, selectedSize]
  );

  const isSizeOptionAvailable = useCallback(
    (size: number): boolean => {
      if (!selectedColor) {
        return product.quantity.some(q => q.size === size && q.quantity > 0);
      } else {
        return product.quantity.some(q => q.color === selectedColor && q.size === size && q.quantity > 0);
      }
    },
    [product.quantity, selectedColor]
  );

  return (
    <div className="space-y-4">
      {/* Chọn màu */}
      <div>
        <h3 className="font-medium">Color:</h3>
        <div className="flex space-x-2">
          {product.listColor.map((color) => (
            <button
              key={color}
              disabled={!isColorOptionAvailable(color)}
              onClick={() => onSelectColor(selectedColor === color ? null : color)}
              className={`px-3 py-1 border rounded transition duration-150 ease-in-out ${
                selectedColor === color ? 'bg-blue-500 text-white' : 'bg-white text-black'
              } ${!isColorOptionAvailable(color) ? 'opacity-50 cursor-not-allowed bg-gray-400' : ''}`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Chọn kích cỡ */}
      <div>
        <h3 className="font-medium">Size:</h3>
        <div className="flex space-x-2">
          {product.listSize.map((size) => (
            <button
              key={size}
              disabled={!isSizeOptionAvailable(size)}
              onClick={() => onSelectSize(selectedSize === size ? null : size)}
              className={`px-3 py-1 border rounded transition duration-150 ease-in-out ${
                selectedSize === size ? 'bg-blue-500 text-white' : 'bg-white text-black'
              } ${!isSizeOptionAvailable(size) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {availableStock === 0 && <p className="text-red-500">This combination is out of stock</p>}

      {/* Chọn số lượng */}
      <div className="flex items-center space-x-4">
        <label htmlFor="quantity" className="font-medium">Quantity:</label>
        <input
          type="number"
          id="quantity"
          value={quantity}
          onChange={onQuantityChange}
          min="1"
          max={availableStock}
          disabled={!selectedColor || !selectedSize}
          className="w-20 px-3 py-2 border rounded"
        />
      </div>
      <p className="text-sm text-gray-500">{availableStock} {(selectedColor&&selectedSize)?"items available for selected color and size":"for all"}</p>

      {/* Nút thêm vào giỏ hàng */}
      <button
        onClick={onAddToCart}
        disabled={!selectedColor || !selectedSize}
        className={`w-full py-3 px-6 rounded-lg text-white font-medium transition duration-150 ease-in-out ${
          selectedColor && selectedSize ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Add to Cart
      </button>
    </div>
  );
});