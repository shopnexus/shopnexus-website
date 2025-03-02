import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

// Mock product data for frontend development
const MOCK_PRODUCT = {
  id: '1',
  name: 'Sample Product',
  description: 'This is a sample product description. It includes all the important details about the product that a customer might want to know.',
  price: 99.99,
  images: [
    'https://via.placeholder.com/500x500?text=Product+Image+1',
    'https://via.placeholder.com/500x500?text=Product+Image+2',
    'https://via.placeholder.com/500x500?text=Product+Image+3',
    'https://via.placeholder.com/500x500?text=Product+Image+4'
  ],
  stock: 10,
  category: 'Electronics',
  tags: ['New', 'Featured', 'Sale'],
  avatar: 'https://via.placeholder.com/500x500?text=Product+Avatar',
  additionalImages: [
    'https://via.placeholder.com/500x500?text=Additional+Image+1',
    'https://via.placeholder.com/500x500?text=Additional+Image+2',
    'https://via.placeholder.com/500x500?text=Additional+Image+3',
    'https://via.placeholder.com/500x500?text=Additional+Image+4'
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

  // Combine avatar and additional images for the gallery
  const allImages = [product.avatar, ...product.additionalImages];
  const currentImage = selectedImage || product.avatar;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-w-1 aspect-h-1 w-full">
            <img
              src={currentImage}
              alt={product.name}
              className="object-cover w-full h-full rounded-lg"
            />
          </div>
          <div className="grid grid-cols-6 gap-2">
            {allImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(image)}
                className={`border-2 rounded ${
                  currentImage === image ? 'border-blue-500' : 'border-gray-200'
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
                <span
                  key={tag}
                  className="px-2 py-1 text-sm bg-gray-100 rounded-full"
                >
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
            className={`w-full py-3 px-6 rounded-lg text-white font-medium
              ${
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
