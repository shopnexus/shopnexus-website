import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}








// utils/validators.ts
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  export const isValidPhone = (phone: string): boolean => {
    // Giả sử số điện thoại phải gồm 10-11 chữ số
    const phoneRegex = /^\d{10,11}$/;
    return phoneRegex.test(phone);
  };

import { ProductVariant } from "../app/Product/ProductDetail";

export const getQuantityByColorAndSize = (products: ProductVariant[]): ProductVariant[] => {
  return products.map(({ id, color, size, quantity }) => ({ id, color, size, quantity }));
};

export const getUniqueColors = (products: ProductVariant[]): string[] => {
  return Array.from(new Set(products.map(({ color }) => color)));
};

export const getUniqueSizes = (products: ProductVariant[]): number[] => {
  return Array.from(new Set(products.map(({ size }) => size))).sort((a, b) => a - b);
};
  