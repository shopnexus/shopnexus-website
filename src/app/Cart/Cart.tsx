import { useState } from "react"
import { useMutation, useQuery } from "@connectrpc/connect-query"
import { clearCart, getCart, updateCartItem } from "shopnexus-protobuf-gen-ts"
import { Check, ChevronRight, ShoppingBag, Trash } from 'lucide-react'

import Button from "../../components/ui/Button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/Card"
import { SeparatorHorizontal } from "lucide-react"
import { Badge } from "lucide-react"
import CartItem from "./CartItem"

export default function Cart() {
	const [selectedItems, setSelectedItems] = useState<bigint[]>([])
	const [itemPrices, setItemPrices] = useState<Map<bigint, number>>(new Map())
  
	const { data: cartItems, isLoading } = useQuery(getCart, {})
	const { mutateAsync: mutateUpdateCartItem } = useMutation(updateCartItem)
	const { mutateAsync: mutateClearCart } = useMutation(clearCart)
  
	const removeItem = async (itemId: bigint) => {
	  await mutateUpdateCartItem({
		items: [{ itemId: BigInt(itemId), quantity: BigInt(0) }],
	  })
	}
  
	const updateQuantity = async (itemId: bigint, newQuantity: number) => {
	  await mutateUpdateCartItem({
		items: [{ itemId: BigInt(itemId), quantity: BigInt(newQuantity) }],
	  })
	}
  
	const clearAll = async () => {
	  await mutateClearCart({})
	}
  
	const toggleSelectItem = (id: bigint) => {
	  setSelectedItems((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
	}
  
	const toggleSelectAll = () => {
	  if (cartItems?.items && selectedItems.length === cartItems.items.length) {
		setSelectedItems([])
	  } else if (cartItems?.items) {
		setSelectedItems(cartItems.items.map((item) => item.itemId))
	  }
	}
  
	const subtotal = cartItems?.items.reduce((acc, item) => {
	  if (selectedItems.includes(item.itemId)) {
		const price = itemPrices.get(item.itemId) || 0;
		return acc + (price * Number(item.quantity));
	  }
	  return acc;
	}, 0);
  
	const safeSubtotal = subtotal ?? 0;
	const tax = safeSubtotal * 0.1;
	const total = safeSubtotal + tax;
  
	if (isLoading) {
	  return (
		<div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-[60vh]">
		  <div className="animate-pulse flex flex-col items-center">
			<div className="h-8 w-48 bg-gray-200 rounded mb-8"></div>
			<div className="h-64 w-full max-w-3xl bg-gray-200 rounded"></div>
		  </div>
		</div>
	  )
	}
  
	if (!cartItems?.items.length) {
	  return (
		<div className="container mx-auto px-4 py-16">
		  <div className="max-w-md mx-auto text-center">
			<div className="flex justify-center mb-6">
			  <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
				<ShoppingBag className="h-12 w-12 text-gray-400" />
			  </div>
			</div>
			<h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
			<p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
			<Button size="lg">
			  <a href="/">Continue Shopping</a>
			</Button>
		  </div>
		</div>
	  )
	}
  
	return (
	  <div className="container mx-auto px-4 py-8 md:py-16">
		<div className="flex items-center justify-between mb-8">
		  <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
		  <Badge className="text-sm">
			{cartItems.items.length} {cartItems.items.length === 1 ? "item" : "items"}
		  </Badge>
		</div>
  
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
		  <div className="lg:col-span-2">
			<Card>
			  <CardHeader className="px-6">
				<div className="flex items-center justify-between">
				  <div className="flex items-center space-x-2">
					<Button variant="outline" size="md" className="h-8 px-2 rounded-md flex items-center justify-center" onClick={toggleSelectAll}>
					<div className="flex items-center">
  <div className="flex items-center justify-center h-4 w-4 rounded-full border border-gray-300">
    <Check
      className={`h-4 w-4 ${
        cartItems.items.length > 0 && selectedItems.length === cartItems.items.length
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
					  <span className="text-sm font-medium">Remove Selected</span>
					</div>
				  </Button>
				  
				  
				  )}
				</div>
			  </CardHeader>
			  <CardContent className="px-6 divide-y">
				{cartItems.items.map((item) => (
				  <CartItem
					key={String(item.itemId)}
					item={item}
					selected={selectedItems.includes(item.itemId)}
					onSelect={() => toggleSelectItem(item.itemId)}
					onRemove={() => removeItem(item.itemId)}
					onUpdateQuantity={(newQuantity) => updateQuantity(item.itemId, newQuantity)}
					onPriceUpdate={(price) => setItemPrices(prev => new Map(prev).set(item.itemId, price))}
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
				  <span>${safeSubtotal.toFixed(2)}</span>
				</div>
				<div className="flex justify-between text-sm">
				  <span className="text-gray-500">Tax (10%)</span>
				  <span>${tax.toFixed(2)}</span>
				</div>
				<div className="flex justify-between text-sm">
				  <span className="text-gray-500">Shipping</span>
				  <span>Free</span>
				</div>
				<SeparatorHorizontal />
				<div className="flex justify-between font-medium text-lg">
				  <span>Total</span>
				  <span>${total.toFixed(2)}</span>
				</div>
			  </CardContent>
			  <CardFooter>
			  <Button className="w-full flex items-center justify-center gap-2" size="lg">
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
	)
  }
  