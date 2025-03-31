import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import Button from "../../components/ui/Button";
import CartItem from "./CartItem";

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

import Button from "../../components/ui/Button"
import CartItem from "./CartItem"
import { clearCart, getCart, updateCartItem } from "shopnexus-protobuf-gen-ts"
import { useMutation, useQuery } from "@connectrpc/connect-query"

export default function Cart() {
	const { data: cartItems } = useQuery(getCart, {})
	const { mutateAsync: mutateUpdateCartItem } = useMutation(updateCartItem)
	const { mutateAsync: mutateClearCart } = useMutation(clearCart)
	// const {data: }

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

	const subtotal = cartItems?.items.reduce(
		(acc, item) => acc + Number(item.price) * Number(item.quantity),
		0
	)
	const tax = subtotal * 0.1
	const total = subtotal + tax

	return (
		<div className="container mx-auto px-4 py-16">
			<h1 className="text-3xl font-bold mb-8">Your Cart</h1>
			{cartItems?.items.length === 0 ? (
				<div className="text-center">
					<p className="text-xl mb-4">Your cart is empty</p>
					<Button>
						<a href="/products">Continue Shopping</a>
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="md:col-span-2">
						{cartItems?.items.map((item) => (
							<CartItem
								key={item.itemId}
								item={item}
								onRemove={() => removeItem(item.itemId)}
								onUpdateQuantity={(newQuantity) =>
									updateQuantity(item.id, newQuantity)
								}
							/>
						))}
					</div>
					<div className="md:col-span-1">
						<div className="bg-gray-100 p-6 rounded-lg">
							<h2 className="text-xl font-semibold mb-4">Order Summary</h2>
							<div className="flex justify-between mb-2">
								<span>Subtotal</span>
								<span>${subtotal.toFixed(2)}</span>
							</div>
							<div className="flex justify-between mb-2">
								<span>Tax</span>
								<span>${tax.toFixed(2)}</span>
							</div>
							<div className="flex justify-between font-semibold text-lg mt-4">
								<span>Total</span>
								<span>${total.toFixed(2)}</span>
							</div>
							<Button className="w-full mt-6">Proceed to Checkout</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
