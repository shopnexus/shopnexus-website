import Button from "../../components/ui/Button"
import CartItem from "./CartItem"
import { clearCart, getCart, updateCartItem,getProductModel } from "shopnexus-protobuf-gen-ts"
import { useMutation, useQuery } from "@connectrpc/connect-query"
import { useState } from "react";

const useProductModel = (itemId: bigint) => {
	const { data, isLoading, error } = useQuery(getProductModel, {
	  id: itemId,
	});
  
	return { data, isLoading, error };
  };

export default function Cart() {
	const [selectedItems, setSelectedItems] = useState<bigint[]>([]);

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

	 // Toggle chọn/bỏ chọn sản phẩm
	const toggleSelectItem = (id: bigint) => {
		setSelectedItems((prev) =>
		  prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
		);
	};

	// const toggleSelectAll = () => {
	// 	if (selectedItems.length === cartItems.length) {
	// 	  setSelectedItems([]);
	// 	} else {
	// 	  setSelectedItems(cartItems.map((item) => item.id));
	// 	}
	// };


	const subtotal = cartItems?.items.reduce(
		(acc, item) => {
			const {data:productModel}=useProductModel(item.itemId);
			const price=productModel?.data?.listPrice??0

			return acc+(Number(price)*Number(item.quantity));

		},0
	)
	const safeSubtotal = subtotal ?? 0;
	const tax =  safeSubtotal * 0.1;
	const total =  safeSubtotal + tax ;

	return (
		<div className="container mx-auto px-4 py-16">
			<h1 className="text-3xl font-bold mb-8">Your Cart</h1>
			{cartItems?.items.length === 0 ? (
				<div className="text-center">
					<p className="text-xl mb-4">Your cart is empty</p>
					<Button>
						<a href="/">Continue Shopping</a>
					</Button>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<div className="md:col-span-2">
						{cartItems?.items.map((item) =>{
						 const { data: productModel, isLoading, error } = useProductModel(item.itemId);
						 if (isLoading) return <div>Loading...</div>;
						 if (error) return <div>Error loading product model</div>;
		   
						 return (
						   <CartItem
							 key={item.itemId}
							 item={productModel?.data} // Gửi thông tin sản phẩm vào CartItem
							 selected={false}
							 onSelect={()=>toggleSelectItem}
							 onRemove={() => removeItem(item.itemId)}
							 onUpdateQuantity={(newQuantity) => updateQuantity(item.itemId, newQuantity)}
						   />
						 );
					   })}
					</div>
					<div className="md:col-span-1">
						<div className="bg-gray-100 p-6 rounded-lg">
							<h2 className="text-xl font-semibold mb-4">Order Summary</h2>
							<div className="flex justify-between mb-2">
								<span>Subtotal</span>
								<span>${safeSubtotal.toFixed(2)}</span>
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
