import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Stack from '../../blocks/Components/Stack/Stack';

// Mock product data for frontend development
const MOCK_PRODUCT = {
  id: '1',
  name: 'Sample Product',
  description: 'This is a sample product description. It includes all the important details about the product that a customer might want to know.',
  price: 99.99,
  images: [
    'https://placehold.co/300x300/orange/white?text=placeholder1',
    'https://placehold.co/300x300/orange/white?text=placeholder2',
    'https://placehold.co/300x300/orange/white?text=placeholder3',
    'https://placehold.co/300x300/orange/white?text=placeholder4'
  ],
  stock: 10,
  category: 'Electronics',
  tags: ['New', 'Featured', 'Sale'],
  avatar: 'https://placehold.co/300x300/orange/white?text=avartar',
  additionalImages: [
    'https://placehold.co/300x300/orange/white?text=placeholder1',
    'https://placehold.co/300x300/orange/white?text=placeholder2',
    'https://placehold.co/300x300/orange/white?text=placeholder3',
    'https://placehold.co/300x300/orange/white?text=placeholder4'
  ]
};


interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  stock: number;
  avatar: string;
  additionalImages: string[];
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<{ id: number; img: string }[]>([]); // State cho stack

  useEffect(() => {
    if (id === MOCK_PRODUCT.id) {
      setProduct(MOCK_PRODUCT);
      const initialCards = [MOCK_PRODUCT.avatar, ...MOCK_PRODUCT.additionalImages].map(
        (img, index) => ({ id: index + 1, img })
      );
      setCards(initialCards);
      setSelectedImage(MOCK_PRODUCT.avatar); // Hình mặc định
    } else {
      setError('Product not found');
    }
  }, [id]);

  // Khi stack thay đổi, cập nhật selectedImage
  const handleCardChange = (topCard: { id: number; img: string }) => {
    setSelectedImage(topCard.img);
  };

  // Khi chọn thumbnail, cập nhật stack và selectedImage
  const handleThumbnailClick = (image: string) => {
    setSelectedImage(image);
    setCards((prev) => {
      const newCards = [...prev];
      const index = newCards.findIndex((card) => card.img === image);
      if (index !== -1) {
        const [card] = newCards.splice(index, 1); // Lấy card được chọn ra
        newCards.push(card); // Đưa card lên trên cùng
      }
      return newCards;
    });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && product && value <= product.stock) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    // Add to cart logic here
  };

  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!product) return <div className="text-center p-4">Product not found</div>;

  const allImages = [product.avatar, ...product.additionalImages];

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

          {/* Chọn image nhanh */}
          <div className="grid grid-cols-6 gap-2">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(image)}
                className={`border-2 rounded ${
                  selectedImage === image ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold text-blue-600">
            ${product.price.toFixed(2)}
          </p>
          <div className="space-y-2">
            <p className="text-gray-600">{product.description}</p>
            <p className="text-sm">
              Category: <span className="font-medium">{product.category}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 text-sm bg-gray-100 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
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
                max={product.stock}
                className="w-20 px-3 py-2 border rounded"
              />
            </div>
            <p className="text-sm text-gray-500">
              {product.stock} items in stock
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.stock}
            className={`w-full py-3 px-6 rounded-lg text-white font-medium ${
              product.stock
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {product.stock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
