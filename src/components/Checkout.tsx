"use client";

import { useState } from "react";
import { CreditCard, MapPin } from "lucide-react";
import Button from "./ui/Button";
import {
  CardTitle,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "./ui/Card";
import { useNavigate } from "react-router-dom";
import {
  createPayment,
  getCart,
  getProduct,
  getProductModel,
} from "shopnexus-protobuf-gen-ts";
import { useMutation, useQuery } from "@connectrpc/connect-query";
import { ItemQuantityInt64 } from "shopnexus-protobuf-gen-ts/pb/common/item_quantity_pb";
import { AddressModal } from "../app/Cart/AddressModel";
import {
  AddressSelectionModal,
  type Address,
} from "../app/Cart/AddressSelectionModal";
import { PaymentMethod } from "shopnexus-protobuf-gen-ts/pb/payment/v1/payment_pb";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })
    .format(amount)
    .replace("₫", "VND");
};

const defaultAddress = {
  fullName: "Nguyen Van A",
  phone: "0912345678",
  address: "123 Le Loi Street",
  district: "District 1",
  city: "Ho Chi Minh City",
};

const mockAddresses: Address[] = [
  {
    id: "1",
    ...defaultAddress,
    isDefault: true,
  },
  {
    id: "2",
    fullName: "Nguyen Van B",
    phone: "0987654321",
    address: "456 Nguyen Hue Street",
    district: "District 3",
    city: "Ho Chi Minh City",
  },
  {
    id: "3",
    fullName: "Nguyen Van C",
    phone: "0123456789",
    address: "789 Dong Khoi Street",
    district: "District 5",
    city: "Ho Chi Minh City",
  },
  {
    id: "3",
    fullName: "Nguyen Van C",
    phone: "0123456789",
    address: "789 Dong Khoi Street",
    district: "District 5",
    city: "Ho Chi Minh City",
  },
  {
    id: "4",
    fullName: "Nguyen Van C",
    phone: "0123456789",
    address: "789 Dong Khoi Street",
    district: "District 5",
    city: "Ho Chi Minh City",
  },
  {
    id: "5",
    fullName: "Nguyen Van C",
    phone: "0123456789",
    address: "789 Dong Khoi Street",
    district: "District 5",
    city: "Ho Chi Minh City",
  },
];

export default function Checkout() {
  const { data: cartResponse } = useQuery(getCart);
  const cartItems = cartResponse?.items ?? [];

  const [shippingAddress, setShippingAddress] = useState<Address>(
    mockAddresses[0]
  );
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSelectAddressModalOpen, setIsSelectAddressModalOpen] =
    useState(false);
  const [addresses] = useState<Address[]>(mockAddresses);
  const navigate = useNavigate();
  const { mutateAsync: mutateCreatePayment } = useMutation(createPayment);

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      // Get the price from the CartItem component's productModel
      const price = item.price || 0; // You'll need to pass the price from CartItem
      return sum + Number(price) * Number(item.quantity);
    }, 0);
  };

  const shippingFee = 30000;
  const subtotal = calculateSubtotal();
  const total = subtotal + shippingFee;

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    try {
      let method!: PaymentMethod;
      switch (paymentMethod) {
        case "cod":
          method = PaymentMethod.CASH;
          throw new Error("chua ho tro!");
          break;
        case "momo":
          method = PaymentMethod.MOMO;
          throw new Error("chua ho tro!");
          break;
        case "vnpay":
          method = PaymentMethod.VNPAY;
          break;
        default:
          throw new Error("❌ Invalid payment method.");
      }

      const data = await mutateCreatePayment({
        requestId: BigInt(1),
        address: shippingAddress.address,
        method: method,
      });

      if (!data.url) {
        throw new Error("Failed to process payment. Please try again.");
      } else {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error(error);
      alert("Failed to process payment. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8 px-4">
      <div className="w-full max-w-screen-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Checkout</h1>

        <div className="grid grid-cols-1 gap-8">
          <div className="lg:col-span-2">
            <Card className="w-full items-center justify-center shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product List */}
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <CartItem key={item.itemId} item={item} />
                  ))}
                </div>

                {/* Shipping Info */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-gray-800">
                      Shipping Address
                    </h5>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => setIsSelectAddressModalOpen(true)}
                      >
                        <MapPin className="h-4 w-4" />
                        Choose Another
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => setIsAddressModalOpen(true)}
                      >
                        <MapPin className="h-4 w-4" />
                        Update Current
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">
                    {shippingAddress.fullName} - {shippingAddress.phone}
                  </p>
                  <p className="text-sm text-gray-700">
                    {shippingAddress.address}, {shippingAddress.district},{" "}
                    {shippingAddress.city}
                  </p>
                </div>

                {/* Payment Methods */}
                <div className="border rounded-lg p-4 bg-white space-y-2">
                  <h5 className="font-medium text-gray-800 mb-2">
                    Payment Method
                  </h5>
                  <div className="space-y-2">
                    {[
                      { id: "cod", label: "Cash on Delivery (COD)" },
                      { id: "momo", label: "Pay via MoMo" },
                      { id: "vnpay", label: "Pay via VNPay" },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          id={method.id}
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="form-radio text-green-600 focus:ring-green-500"
                        />
                        <span className="text-gray-800">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Fee:</span>
                    <span>{formatCurrency(shippingFee)}</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-semibold text-base text-black">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handlePayment}
                  className="cursor-pointer w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-base font-semibold py-3 rounded-lg transition"
                >
                  <CreditCard className="w-5 h-5" />
                  Confirm Payment
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        <AddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          currentAddress={shippingAddress}
          onSave={setShippingAddress}
        />

        <AddressSelectionModal
          isOpen={isSelectAddressModalOpen}
          onClose={() => setIsSelectAddressModalOpen(false)}
          addresses={addresses}
          selectedAddress={shippingAddress}
          onSelect={(address) => {
            setShippingAddress(address);
          }}
          onAddNew={() => {
            setIsSelectAddressModalOpen(false);
            setIsAddressModalOpen(true);
          }}
        />
      </div>
    </div>
  );
}

function CartItem({ item }: { item: ItemQuantityInt64 }) {
  const { data: productResponse } = useQuery(getProduct, {
    id: item.itemId,
  });
  const product = productResponse?.data;
  const { data: productModelResponse } = useQuery(getProductModel, {
    id: product?.productModelId,
  });
  const productModel = productModelResponse?.data;

  const price = Number(productModel?.listPrice) || 0;
  const totalPrice = price * Number(item.quantity);

  return (
    <div key={item.itemId} className="flex items-start gap-4 border-b pb-4">
      <img
        src={productModel?.resources[0]}
        alt={productModel?.name}
        className="w-20 h-20 rounded-md object-cover border"
      />
      <div className="flex-grow">
        <h4 className="font-semibold text-gray-900">{productModel?.name}</h4>
        <p className="text-sm text-gray-500">
          {formatCurrency(price)} x {Number(item.quantity)}
        </p>
      </div>
      <div className="font-medium text-right min-w-[80px]">
        {formatCurrency(totalPrice)}
      </div>
    </div>
  );
}
