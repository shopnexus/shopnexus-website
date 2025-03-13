import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Stack from '../../blocks/Components/Stack/Stack';

// Mock product data
const demodata = {
  productModel: {
    id: 1,
    name: 'Adidas Sneakers',
    description: 'High-quality sports shoes',
    price: 999,
    sold: 10,
    score: 9.4,
    tag: ['adidas', 'sport', 'hot'],
    listImgae: ["https://placehold.co/600x400", "https://placehold.co/600x400", "https://placehold.co/600x400"],
  },
  product: [
    { id: 12, quantity: 20, color: 'white', size: 36 },
    { id: 13, quantity: 20, color: 'white', size: 37 },
    { id: 14, quantity: 20, color: 'black', size: 36 },
    { id: 15, quantity: 0, color: 'black', size: 37 },
  ],
};

// Utility functions
const getQuantityByColorAndSize = (products: { id: number; color: string; size: number; quantity: number }[]) => {
  return products.map(({ id, color, size, quantity }) => ({ id, color, size, quantity }));
};

const getUniqueColors = (products: { color: string }[]) => {
  return Array.from(new Set(products.map(({ color }) => color)));
};

const getUniqueSizes = (products: { size: number }[]) => {
  return Array.from(new Set(products.map(({ size }) => size))).sort((a, b) => a - b);
};

// Mock product
const MOCK_PRODUCT = {
  id: 1,
  name: demodata.productModel.name,
  description: demodata.productModel.description,
  price: demodata.productModel.price,
  score: demodata.productModel.score,
  sold: demodata.productModel.sold,
  tags: demodata.productModel.tag,
  quantity: getQuantityByColorAndSize(demodata.product),
  listSize: getUniqueSizes(demodata.product),
  listColor: getUniqueColors(demodata.product),
  avatar: demodata.productModel.listImgae[0],
  additionalImages: demodata.productModel.listImgae,
};

// Product interface
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  score: number;
  sold: number;
  tags: string[];
  quantity: { id: number; color: string; size: number; quantity: number }[];
  listSize: number[];
  listColor: string[];
  avatar: string;
  additionalImages: string[];
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [cards, setCards] = useState<{ id: number; img: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load product data
  useEffect(() => {
    if (id === String(MOCK_PRODUCT.id)) {
      setProduct(MOCK_PRODUCT);
      const imageCards = [MOCK_PRODUCT.avatar, ...MOCK_PRODUCT.additionalImages].map((img, index) => ({
        id: index + 1,
        img,
      }));
      setCards(imageCards);
      setSelectedImage(MOCK_PRODUCT.avatar);
      if (MOCK_PRODUCT.listColor.length > 0) setSelectedColor(MOCK_PRODUCT.listColor[0]);
      if (MOCK_PRODUCT.listSize.length > 0) setSelectedSize(MOCK_PRODUCT.listSize[0]);
    } else {
      setError('Product not found');
    }
  }, [id]);

  // Adjust quantity when color/size changes
  useEffect(() => {
    const stock = getAvailableStock();
    if (stock > 0 && quantity > stock) {
      setQuantity(stock);
    }
  }, [selectedColor, selectedSize]);

  const getAvailableStock = () => {
    if (!product || !selectedColor || !selectedSize) return 0;
    const variant = product.quantity.find((q) => q.color === selectedColor && q.size === selectedSize);
    return variant?.quantity || 0;
  };

  const handleCardChange = (topCard: { id: number; img: string }) => {
    setSelectedImage(topCard.img);
  };

  const handleThumbnailClick = (image: string) => {
    setSelectedImage(image);
    setCards((prev) => {
      const newCards = [...prev];
      const index = newCards.findIndex((card) => card.img === image);
      if (index !== -1) {
        const [card] = newCards.splice(index, 1);
        newCards.push(card);
      }
      return newCards;
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const stock = getAvailableStock();
    if (isNaN(value) || value < 1) {
      setQuantity(1);
    } else if (value > stock) {
      setQuantity(stock);
    } else {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (selectedColor && selectedSize) {
      const variant = product?.quantity.find((q) => q.color === selectedColor && q.size === selectedSize);
      if (variant) {
        console.log('Add to cart:', {
          variantId: variant.id,
          quantity,
          color: selectedColor,
          size: selectedSize,
        });
        // Add real cart logic here (e.g., API call or Redux dispatch)
      }
    }
  };

  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!product) return <div className="text-center p-4">Loading...</div>;

  const allImages = [product.avatar, ...product.additionalImages];
  const availableStock = getAvailableStock();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <Stack
            randomRotation={true}
            sensitivity={180}
            sendToBackOnClick={false}
            cardDimensions={{ width: 300, height: 300 }}
            cardsData={cards}
            onCardChange={handleCardChange}
          />
          <div className="grid grid-cols-6 gap-2">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(image)}
                className={`border-2 rounded ${
                  selectedImage === image ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <img src={image} alt={`${product.name} thumbnail ${index + 1}`} className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
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
              {product.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 text-sm bg-gray-100 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Variant Selection */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Color:</h3>
              <div className="flex space-x-2">
                {product.listColor.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-3 py-1 border rounded ${
                      selectedColor === color ? 'bg-blue-500 text-white' : 'bg-white text-black'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium">Size:</h3>
              <div className="flex space-x-2">
                {product.listSize.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1 border rounded ${
                      selectedSize === size ? 'bg-blue-500 text-white' : 'bg-white text-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {availableStock === 0 && <p className="text-red-500">This combination is out of stock</p>}

            <div className="flex items-center space-x-4">
              <label htmlFor="quantity" className="font-medium">
                Quantity:
              </label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={availableStock}
                disabled={availableStock === 0}
                className="w-20 px-3 py-2 border rounded"
              />
            </div>
            <p className="text-sm text-gray-500">{availableStock} items available for selected color and size</p>

            <button
              onClick={handleAddToCart}
              disabled={availableStock === 0}
              className={`w-full py-3 px-6 rounded-lg text-white font-medium ${
                availableStock > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {availableStock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;