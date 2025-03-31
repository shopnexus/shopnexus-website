// src/app/Product/product.mock.ts
import { Product, ProductVariant } from './ProductDetail'; // Adjust path as needed
import { getQuantityByColorAndSize, getUniqueColors, getUniqueSizes } from '../../utils/validators';
// Use these functions in MOCK_PRODUCT definition

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