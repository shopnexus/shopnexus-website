"use client";

import { useEffect, useState } from "react";
import { CreditCard, MapPin } from "lucide-react";
import Button from "./ui/Button";
import {
  CardTitle,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "./ui/Card";
import {
  createAddress,
  createPayment,
  getAppliedSales,
  getCart,
  getProduct,
  getProductModel,
  getUser,
  listAddresses,
} from "shopnexus-protobuf-gen-ts";
import { useMutation, useQuery } from "@connectrpc/connect-query";
import { ItemQuantityInt64 } from "shopnexus-protobuf-gen-ts/pb/common/item_quantity_pb";
import { AddressModal } from "../app/Cart/AddressModel";
import { AddressSelectionModal } from "../app/Cart/AddressSelectionModal";
import { PaymentMethod } from "shopnexus-protobuf-gen-ts/pb/payment/v1/payment_pb";
import { AddressEntity } from "shopnexus-protobuf-gen-ts/pb/account/v1/address_pb";
import { useLocation } from "react-router-dom";
import { SaleEntity } from "shopnexus-protobuf-gen-ts/pb/product/v1/sale_pb";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })
    .format(amount)
    .replace("₫", "VND");
};

export default function Checkout() {
  const location = useLocation();
  const selectedItems =
    (location.state as { selectedItems: bigint[] })?.selectedItems ?? [];
  const { data: cartResponse } = useQuery(getCart);
  const cartItems = (cartResponse?.items ?? []).filter((item) =>
    selectedItems.includes(item.itemId)
  );
  // const {data:saleData} = useQuery(getAppliedSales, {
  //   productId: itemid,
  // })
  // const sales = saleData?.data

  const [shippingAddress, setShippingAddress] = useState<AddressEntity>();
  const [paymentMethod, setPaymentMethod] = useState("vnpay");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSelectAddressModalOpen, setIsSelectAddressModalOpen] =
    useState(false);
  const { data: addressesResponse, refetch: refetchAddresses } = useQuery(
    listAddresses,
    {
      pagination: {
        page: 1,
        limit: 10,
      },
    }
  );
  const addresses = addressesResponse?.data ?? [];
  const { mutateAsync: mutateCreatePayment } = useMutation(createPayment);
  const { mutateAsync: mutateCreateAddress } = useMutation(createAddress);
  const { data: user } = useQuery(getUser);

  const [itemPrices, setItemPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!addressesResponse?.data) return;
    if (addressesResponse.data.length > 0) {
      if (user?.defaultAddressId) {
        const defaultAddress = addressesResponse?.data.find(
          (address) => address.id === user.defaultAddressId
        ) as AddressEntity;
        setShippingAddress(defaultAddress);
      } else {
        setShippingAddress(addressesResponse?.data[0]);
      }
    } else {
      // Show dialog to user and open address modal
      // alert("Please add a shipping address to continue with checkout.");
      setIsAddressModalOpen(true);
    }
  }, [addressesResponse?.data, user?.defaultAddressId]);

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      // Get the price from the CartItem component's productModel
      const price = itemPrices[item.itemId.toString()] || 0; // You'll need to pass the price from CartItem
      return sum + Number(price) * Number(item.quantity);
    }, 0);
  };

  const shippingFee = 0;
  const subtotal = calculateSubtotal();
  const total = subtotal + shippingFee;

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    if (!shippingAddress) {
      alert("Please select a shipping address.");
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
        address: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.country}`,
        method: method,
        productIds: cartItems.map((item) => item.itemId),
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

  // Handle saving new address
  const handleSaveAddress = async (address: AddressEntity) => {
    try {
      await mutateCreateAddress({
        fullName: address.fullName,
        phone: address.phone,
        address: address.address,
        city: address.city,
        country: address.country,
      });
      await refetchAddresses();
      setIsAddressModalOpen(false);
    } catch (error) {
      console.error("Failed to save address:", error);
      alert("Failed to save address. Please try again.");
    }
  };

  const updatePrice = (id: bigint, price: number) => {
    setItemPrices((prev) => ({ ...prev, [id.toString()]: price }));
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
                    <CartItem
                      key={item.itemId}
                      item={item}
                      updatePrice={updatePrice}
                    />
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
                      {/* <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => setIsAddressModalOpen(true)}
                      >
                        <MapPin className="h-4 w-4" />
                        Update Current
                      </Button> */}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">
                    {shippingAddress?.fullName} - {shippingAddress?.phone}
                  </p>
                  <p className="text-sm text-gray-700">
                    {shippingAddress?.address}, {shippingAddress?.city},{" "}
                    {shippingAddress?.country}
                  </p>
                </div>

                {/* Payment Methods */}
                <div className="border rounded-lg p-4 bg-white space-y-2">
                  <h5 className="font-medium text-gray-800 mb-2">
                    Payment Method
                  </h5>
                  <div className="space-y-2">
                    {[
                      { id: "vnpay", label: "Pay via VNPay (recommended)" },
                      { id: "momo", label: "Pay via MoMo" },
                      { id: "cod", label: "Cash on Delivery (COD)" },
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
          currentAddress={undefined}
          onSave={handleSaveAddress}
          title="Add New Address"
          description="Please enter your shipping address details"
        />

        <AddressSelectionModal
          isOpen={isSelectAddressModalOpen}
          onClose={() => setIsSelectAddressModalOpen(false)}
          addresses={addresses}
          selectedAddress={shippingAddress}
          onSelect={setShippingAddress}
          onAddNew={() => {
            setIsSelectAddressModalOpen(false);
            setIsAddressModalOpen(true);
          }}
        />
      </div>
    </div>
  );
}

function SaleDetails({
  sale,
  originalPrice,
  finalPrice,
}: {
  sale: SaleEntity;
  originalPrice: number;
  finalPrice: number;
}) {
  const getSaleType = () => {
    if (sale.discountPercent) {
      return `${sale.discountPercent}% off`;
    } else if (sale.discountPrice) {
      return `Fixed price: ${formatCurrency(Number(sale.discountPrice))}`;
    }
    return "";
  };

  const getSaleScope = () => {
    if (sale.productModelId) return "Product";
    if (sale.brandId) return "Brand";
    if (sale.tag) return `Tag: ${sale.tag}`;
    return "";
  };

  const savings = originalPrice - finalPrice;
  const savingsPercentage = (savings / originalPrice) * 100;

  return (
    <div className="mt-1 text-xs bg-green-50 p-2 rounded border border-green-100">
      <div className="flex items-center gap-1 text-green-700">
        <span className="font-medium">Sale:</span>
        <span>{getSaleType()}</span>
      </div>
      <div className="text-green-600">
        {getSaleScope()}
        {sale.maxDiscountPrice > BigInt(0) && (
          <span className="ml-1">
            (Max discount: {formatCurrency(Number(sale.maxDiscountPrice))})
          </span>
        )}
      </div>
      <div className="mt-1 pt-1 border-t border-green-100">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Original:</span>
          <span className="text-gray-600 line-through">
            {formatCurrency(originalPrice)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-green-700 font-medium">Final:</span>
          <span className="text-green-700 font-medium">
            {formatCurrency(finalPrice)}
          </span>
        </div>
        <div className="flex justify-between items-center text-green-600">
          <span>You save:</span>
          <span>
            {formatCurrency(savings)} ({savingsPercentage.toFixed(0)}%)
          </span>
        </div>
      </div>
    </div>
  );
}

function CartItem({
  item,
  updatePrice,
}: {
  item: ItemQuantityInt64;
  updatePrice: (id: bigint, price: number) => void;
}) {
  const { data: productResponse } = useQuery(getProduct, {
    id: item.itemId,
  });
  const product = productResponse?.data;
  const { data: productModelResponse } = useQuery(getProductModel, {
    id: product?.productModelId,
  });
  const productModel = productModelResponse?.data;
  const { data: saleData } = useQuery(getAppliedSales, {
    productId: item.itemId,
  });

  const originalPrice = Number(productModel?.listPrice) || 0;

  // Calculate sale price
  const calculateSalePrice = (originalPrice: number) => {
    if (!saleData?.data || saleData.data.length === 0) return originalPrice;

    const activeSale = saleData.data.find((sale) => {
      // Check if sale applies to this product
      return (
        sale.productModelId === product?.productModelId ||
        sale.brandId === productModel?.brandId ||
        (sale.tag && productModel?.tags?.includes(sale.tag))
      );
    });

    if (!activeSale) return originalPrice;

    let finalPrice = originalPrice;

    if (activeSale.discountPercent) {
      const discountAmount = (originalPrice * activeSale.discountPercent) / 100;
      finalPrice = originalPrice - discountAmount;
    } else if (activeSale.discountPrice) {
      finalPrice = Number(activeSale.discountPrice);
    }

    // Apply max discount price limit if set
    if (activeSale.maxDiscountPrice > BigInt(0)) {
      const maxDiscount = Number(activeSale.maxDiscountPrice);
      const discount = originalPrice - finalPrice;
      if (discount > maxDiscount) {
        finalPrice = originalPrice - maxDiscount;
      }
    }

    return finalPrice;
  };

  const price = calculateSalePrice(originalPrice);
  const totalPrice = price * Number(item.quantity);
  const hasSale = price < originalPrice;

  // Find active sale for display
  const activeSale = saleData?.data?.find((sale) => {
    return (
      sale.productModelId === product?.productModelId ||
      sale.brandId === productModel?.brandId ||
      (sale.tag && productModel?.tags?.includes(sale.tag))
    );
  });

  useEffect(() => {
    updatePrice(item.itemId, price);
  }, [price]);

  return (
    <div key={item.itemId} className="flex items-start gap-4 border-b pb-4">
      <img
        src={productModel?.resources[0]}
        alt={productModel?.name}
        className="w-20 h-20 rounded-md object-cover border"
      />
      <div className="flex-grow">
        <h4 className="font-semibold text-gray-900">{productModel?.name}</h4>
        <div className="text-sm">
          {hasSale ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 line-through">
                {formatCurrency(originalPrice)}
              </span>
              <span className="text-green-600 font-medium">
                {formatCurrency(price)}
              </span>
              <span className="text-gray-500">x {Number(item.quantity)}</span>
            </div>
          ) : (
            <p className="text-gray-500">
              {formatCurrency(price)} x {Number(item.quantity)}
            </p>
          )}
          {activeSale && (
            <SaleDetails
              sale={activeSale}
              originalPrice={originalPrice}
              finalPrice={price}
            />
          )}
        </div>
      </div>
      <div className="font-medium text-right min-w-[80px]">
        {formatCurrency(totalPrice)}
      </div>
    </div>
  );
}
