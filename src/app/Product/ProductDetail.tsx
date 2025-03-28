import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Stack from '../../blocks/Components/Stack/Stack';
import FeedBack from '../../components/FeedBack';
import FeaturedProducts from './FeaturedProducts';
import NewProducts from './NewProducts';
import { useCart } from '../Cart/CartContext';
import { getQuantityByColorAndSize, getUniqueColors, getUniqueSizes } from '../../utils/validators';
import { MOCK_PRODUCT } from './ProductMock';
import { VariantSelection } from './VariantSelection';

//#region Type Definitions
export interface ProductVariant {
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
  const [message,setMessage]=useState<String|null>(null);
  const {addToCart} =useCart();

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
        // Truyền số lượng tồn kho hiện tại (dựa trên biến thể được chọn) làm đối số thứ hai
        addToCart({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.avatar,
          variantId: variant.id,
          color: selectedColor,
          size: selectedSize,
          stockQuantity:getAvailableStock()
        });
        setMessage('Added to cart successfully');
        setTimeout(() => setMessage(null), 3000);
      }
    }
  }, [selectedColor, selectedSize, quantity, product, getAvailableStock, addToCart]);
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
      
      <FeedBack></FeedBack>
      <FeaturedProducts></FeaturedProducts>
      <NewProducts></NewProducts>

    </div>
  );
};

export default ProductDetail;
