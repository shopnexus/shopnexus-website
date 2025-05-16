"use client";

import { useState, useCallback, useEffect } from "react";
import { Check, ChevronRight, ShoppingBag, Trash } from "lucide-react";
import Button from "../../components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Badge } from "lucide-react";
import CartItem from "./CartItem";
import { useMutation, useQuery } from "@connectrpc/connect-query";
import { clearCart, getCart, updateCartItem } from "shopnexus-protobuf-gen-ts";
import { debounce } from "lodash";

export default function Cart() {
  const [selectedItems, setSelectedItems] = useState<bigint[]>([]);
  const [itemPrices, setItemPrices] = useState<Map<bigint, number>>(new Map());

  const { data: cartResponse, refetch } = useQuery(getCart);
  const { mutateAsync: mutateUpdateCart } = useMutation(updateCartItem, {
    onSuccess: () => {
      refetch();
    },
  });
  const { mutateAsync: mutateClearCart } = useMutation(clearCart, {
    onSuccess: () => {
      refetch();
    },
  });
  const cartItems = cartResponse?.items ?? [];

  useEffect(() => {
    refetch();
  }, []);

  const navigate = useNavigate();

  const debouncedUpdateCart = useCallback(
    debounce((itemId: bigint, quantity: number) => {
      mutateUpdateCart({
        items: [
          {
            itemId,
            quantity: BigInt(quantity),
          },
        ],
      });
    }, 500),
    [mutateUpdateCart]
  );

  const removeItem = (itemId: bigint) => {
    debouncedUpdateCart(itemId, 0);
    setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    setItemPrices((prev) => {
      const newMap = new Map(prev);
      newMap.delete(itemId);
      return newMap;
    });
  };

  const updateQuantity = (itemId: bigint, newQuantity: number) => {
    debouncedUpdateCart(itemId, newQuantity);
  };

  const clearAll = async () => {
    await mutateClearCart({});

    setSelectedItems([]);
    setItemPrices(new Map());
  };

  const toggleSelectItem = (id: bigint) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (cartItems.length === selectedItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.itemId));
    }
  };

  const handlePriceUpdate = (itemId: bigint, price: number) => {
    setItemPrices((prev) => {
      if (prev.get(itemId) !== price) {
        return new Map(prev).set(itemId, price);
      }
      return prev;
    });
  };

  const handleCheckout = () => {
    navigate("/checkout", { state: { selectedItems } });
  };

  const subtotal = cartItems.reduce((acc, item) => {
    if (selectedItems.includes(item.itemId)) {
      const price = itemPrices.get(item.itemId) || 0;
      return acc + price * Number(item.quantity);
    }
    return acc;
  }, 0);

  const safeSubtotal = subtotal ?? 0;

  // const tax = safeSubtotal * 0.1;
  const total = safeSubtotal;

  if (!cartItems.length) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button size="lg">
            <Link to="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
        <Badge className="text-sm">
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
        </Badge>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="md"
                    className="h-8 px-2 rounded-md flex items-center justify-center"
                    onClick={toggleSelectAll}
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-4 w-4 rounded-full border border-gray-300">
                        <Check
                          className={`h-4 w-4 ${
                            cartItems.length > 0 &&
                            selectedItems.length === cartItems.length
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                      </div>
                      <span className="ml-2">Select All</span>
                    </div>
                  </Button>
                </div>
                {selectedItems.length > 0 && (
                  <Button
                    size="sm"
                    className="h-8 px-3 flex items-center text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={clearAll}
                  >
                    <div className="flex items-center">
                      <Trash className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">
                        Remove Selected
                      </span>
                    </div>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-6 divide-y">
              {cartItems.map((item) => (
                <CartItem
                  key={String(item.itemId)}
                  quantity={item.quantity}
                  product_id={item.itemId}
                  selected={selectedItems.includes(item.itemId)}
                  onSelect={() => toggleSelectItem(item.itemId)}
                  onRemove={() => removeItem(item.itemId)}
                  onUpdateQuantity={(newQuantity) =>
                    updateQuantity(item.itemId, newQuantity)
                  }
                  onPriceUpdate={(price) =>
                    handlePriceUpdate(item.itemId, price)
                  }
                />
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>{safeSubtotal.toLocaleString()} ₫</span>
              </div>
              {/* <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax (10%)</span>
                <span>{tax.toLocaleString()} ₫</span>
              </div> */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span>Free</span>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>{total.toLocaleString()} ₫</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={!selectedItems.length}
                onClick={handleCheckout}
                className="cursor-pointer w-full flex items-center justify-center gap-2"
                size="lg"
              >
                <span className="text-base font-medium">Checkout</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
          <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
            <p className="flex items-center">
              <Check className="text-green-500 mr-2 h-4 w-4" />
              Free shipping on all orders
            </p>
            <p className="flex items-center mt-2">
              <Check className="text-green-500 mr-2 h-4 w-4" />
              30-day easy returns
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
