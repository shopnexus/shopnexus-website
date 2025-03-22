import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Stack from '../../blocks/Components/Stack/Stack';

//#region Type Definitions
interface ProductVariant {
  id: number;
  color: string;
  size: number;
  quantity: number;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  score: number;
  sold: number;
  tags: string[];
  quantity: ProductVariant[];
  listSize: number[];
  listColor: string[];
  avatar: string;
  additionalImages: string[];
}
//#endregion

//#region Utility Functions
export const getQuantityByColorAndSize = (products: ProductVariant[]): ProductVariant[] => {
  return products.map(({ id, color, size, quantity }) => ({ id, color, size, quantity }));
};

export const getUniqueColors = (products: ProductVariant[]): string[] => {
  return Array.from(new Set(products.map(({ color }) => color)));
};

export const getUniqueSizes = (products: ProductVariant[]): number[] => {
  return Array.from(new Set(products.map(({ size }) => size))).sort((a, b) => a - b);
};
//#endregion

//#region Mock Data
const demoData = {
  productModel: {
    id: 1,
    name: 'Adidas Sneakers',
    description: 'High-quality sports shoes',
    price: 999,
    sold: 10,
    score: 9.4,
    tag: ['adidas', 'sport', 'hot'],
    listImgae: [
      "https://placehold.co/600x400",
      "https://placehold.co/600x400?text=Hello+World",
      "https://placehold.co/600x400/orange/white"
    ],
  },
  product: [
    { id: 12, quantity: 1, color: 'white', size: 36 },
    { id: 13, quantity: 20, color: 'white', size: 37 },
    { id: 14, quantity: 0, color: 'black', size: 36 },
    { id: 15, quantity: 0, color: 'black', size: 37 },
  ],
};

export const MOCK_PRODUCT: Product = {
  id: demoData.productModel.id,
  name: demoData.productModel.name,
  description: demoData.productModel.description,
  price: demoData.productModel.price,
  score: demoData.productModel.score,
  sold: demoData.productModel.sold,
  tags: demoData.productModel.tag,
  quantity: getQuantityByColorAndSize(demoData.product),
  listSize: getUniqueSizes(demoData.product),
  listColor: getUniqueColors(demoData.product),
  avatar: demoData.productModel.listImgae[0],
  additionalImages: demoData.productModel.listImgae,
};
//#endregion

//#region Child Components

// Component danh sách thumbnail – được memo để tránh render lại không cần thiết
const ThumbnailList: React.FC<{
  images: string[];
  selectedImage: string;
  onThumbnailClick: (image: string) => void;
}> = React.memo(({ images, selectedImage, onThumbnailClick }) => (
  <div className="grid grid-cols-6 gap-2">
    {images.map((image, index) => (
      <button
        key={index}
        onClick={() => onThumbnailClick(image)}
        className={`border-2 rounded transition duration-150 ease-in-out ${
          selectedImage === image ? 'border-blue-500' : 'border-gray-200'
        }`}
      >
        <img src={image} alt={`thumbnail ${index + 1}`} loading="lazy" className="object-cover w-full h-full" />
      </button>
    ))}
  </div>
));

// Component chọn biến thể sản phẩm
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

const VariantSelection: React.FC<VariantSelectionProps> = React.memo(({
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
//#endregion

// Main Component
const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [cards, setCards] = useState<{ id: number; img: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  //#region Load Data & Default Setup
  useEffect(() => {
    if (id === String(MOCK_PRODUCT.id)) {
      setProduct(MOCK_PRODUCT);
      // Xử lý duplicate images
      const imageCards = Array.from(new Set([MOCK_PRODUCT.avatar, ...MOCK_PRODUCT.additionalImages])).map((img, index) => ({
        id: index + 1,
        img,
      }));
      setCards(imageCards);
      setSelectedImage(MOCK_PRODUCT.avatar);
    } else {
      setError('Product not found');
    }
  }, [id]);
  //#endregion

  //#region Stock & Quantity Handling
  const totalStock = useCallback((prod: Product | null): number => {
    if (!prod) return 0;
    return prod.quantity.reduce((sum, item) => sum + item.quantity, 0);
  }, []);

  const getAvailableStock = useCallback((): number => {
    if (!product) return 0;
    if (!selectedColor || !selectedSize) return totalStock(product);
    const variant = product.quantity.find(q => q.color === selectedColor && q.size === selectedSize);
    return variant?.quantity || 0;
  }, [product, selectedColor, selectedSize, totalStock]);

  useEffect(() => {
    const stock = getAvailableStock();
    if (stock > 0 && quantity > stock) {
      setQuantity(stock);
    }
  }, [selectedColor, selectedSize, quantity, getAvailableStock]);
  //#endregion

  //#region Event Handlers (useCallback)
  const handleCardChange = useCallback((card: { id: number; img: string }) => {
    setSelectedImage(card.img);
  }, []);

  const handleThumbnailClick = useCallback((image: string) => {
    setSelectedImage(image);
    setCards(prevCards => {
      const newCards = [...prevCards];
      const index = newCards.findIndex(card => card.img === image);
      if (index !== -1) {
        const [card] = newCards.splice(index, 1);
        newCards.push(card);
      }
      return newCards;
    });
  }, []);

  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const stock = getAvailableStock();
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (value > stock) {
      setQuantity(stock);
    } else {
      setQuantity(value);
    }
  }, [getAvailableStock]);

  const handleAddToCart = useCallback(() => {
    if (selectedColor && selectedSize && product) {
      const variant = product.quantity.find(q => q.color === selectedColor && q.size === selectedSize);
      if (variant) {
        console.log('Add to cart:', {
          variantId: variant.id,
          quantity,
          color: selectedColor,
          size: selectedSize,
        });
        // Xử lý thêm vào giỏ hàng, thông báo thành công, v.v.
      }
    }
  }, [selectedColor, selectedSize, quantity, product]);
  //#endregion

  //#region Derived Data with useMemo
  const allImages = useMemo(() => {
    if (!product) return [];
    return Array.from(new Set([product.avatar, ...product.additionalImages]));
  }, [product]);

  const availableStock = useMemo(() => getAvailableStock(), [getAvailableStock]);
  //#endregion

  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!product) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images Section */}
        <div className="space-y-4">
          <Stack
            randomRotation={true}
            sensitivity={180}
            sendToBackOnClick={false}
            cardDimensions={{ width: 300, height: 300 }}
            cardsData={cards}
            onCardChange={handleCardChange}
          />
          <ThumbnailList images={allImages} selectedImage={selectedImage} onThumbnailClick={handleThumbnailClick} />
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <div className="flex items-center space-x-4 text-sm">
            <span>Score: {product.score}</span>
            <div className="border-r-2 h-4 border-gray-500" />
            <span>Sold: {product.sold}</span>
          </div>
          <p className="text-2xl font-semibold text-blue-600">${product.price.toFixed(2)}</p>
          <div className="space-y-2">
            <p className="text-gray-600">{product.description}</p>
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="px-2 py-1 text-sm bg-gray-100 rounded-full">{tag}</span>
              ))}
            </div>
          </div>

          <VariantSelection
            product={product}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            onSelectColor={setSelectedColor}
            onSelectSize={setSelectedSize}
            quantity={quantity}
            availableStock={availableStock}
            onQuantityChange={handleQuantityChange}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
