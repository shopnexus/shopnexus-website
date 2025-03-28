import { createContext, useContext, useState } from "react";
import {ItemInCart} from "./CartItem";


interface CartContextType {
    cartItems: ItemInCart[];
    addToCart: (item: ItemInCart) => void;
    removeFromCart: (variantId: number) => void;
    updateQuantity: (variantId: number, quantity: number) => void;
    clearCart: ()=>void;
}

const CartContext=createContext<CartContextType|undefined>(undefined);


export const CartProvider: React.FC<{children:React.ReactNode}> = ({children}) => {
    const [cartItems,setCartItems]=useState<ItemInCart[]>([]);

    const addToCart = (item: ItemInCart) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((i) => i.variantId === item.variantId);
            if (existingItem) {
                // Giới hạn số lượng theo hàng tồn kho
                const updatedQuantity = Math.min(existingItem.quantity + item.quantity, item.stockQuantity);
                return prevItems.map((i) =>
                    i.variantId === item.variantId ? { ...i, quantity: updatedQuantity } : i
                );
            }
            // Kiểm tra nếu số lượng hợp lệ trước khi thêm mới
            return item.quantity > 0 ? [...prevItems, { ...item, quantity: Math.min(item.quantity, item.stockQuantity) }] : prevItems;
        });
    };
    

    const removeFromCart = (variantId: number) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.variantId !== variantId));
    };
    
    const updateQuantity = (variantId: number, quantity: number) => {
        setCartItems((prevItems) =>
            prevItems.map((item) => (item.variantId === variantId ? { ...item, quantity } : item))
        );
    };

    const clearCart= ()=>{
        setCartItems([]);
    }
    
    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity,clearCart }}>
            {children}
        </CartContext.Provider>
    );
    
}
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
      throw new Error('useCart must be used within a CartProvider');
    }
    return context;
  };