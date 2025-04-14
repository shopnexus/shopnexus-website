"use client"

import { useState } from "react"
import { MinusIcon, PlusIcon, CreditCard } from "lucide-react"
import Button from "./ui/Button"
import { CardTitle, Card, CardContent, CardFooter, CardHeader } from "./ui/Card"
import { useNavigate } from "react-router-dom"

interface Product {
  id: number
  name: string
  price: number
  quantity: number
  image: string
}

export default function Checkout() {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Premium T-shirt",
      price: 250000,
      quantity: 2,
      image: "/placeholder3.jpeg",
    },
    {
      id: 2,
      name: "Men's Jeans",
      price: 450000,
      quantity: 1,
      image: "/placeholder3.jpeg",
    },
  ])

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "Nguyen Van A",
    phone: "0912345678",
    address: "123 Le Loi Street",
    district: "District 1",
    city: "Ho Chi Minh City",
  })

  const [paymentMethod, setPaymentMethod] = useState("cod") // cod, momo, vnpay
  const navigate = useNavigate()

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setProducts(products.map((product) => (product.id === id ? { ...product, quantity: newQuantity } : product)))
  }

  const calculateSubtotal = () => {
    return products.reduce((sum, product) => sum + product.price * product.quantity, 0)
  }

  const shippingFee = 30000
  const subtotal = calculateSubtotal()
  const total = subtotal + shippingFee

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount).replace("₫", "VND")
  }

  const handlePayment = () => {
    if (!paymentMethod) {
      alert("Please select a payment method.")
      return
    }

    switch (paymentMethod) {
      case "cod":
        alert("✅ Cash on Delivery confirmed. You will be redirected after this alert closes!")
        break
      case "momo":
        alert("✅ You selected MoMo. Redirecting...")
        break
      case "vnpay":
        alert("✅ You selected VNPay. Redirecting...")
        break
      default:
        alert("❌ Invalid payment method.")
    }

    setTimeout(() => {
      navigate("/") // Redirect to success page
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-8 px-4">
      <div className="w-full max-w-screen-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Checkout</h1>

        <div className="grid grid-cols-1 gap-8">
          <div className="lg:col-span-2">
            <Card className="w-full items-center justify-center shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Product List */}
                <div className="space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="flex items-start gap-4 border-b pb-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-20 h-20 rounded-md object-cover border"
                      />
                      <div className="flex-grow">
                        <h4 className="font-semibold text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(product.price)} x {product.quantity}
                        </p>
                      </div>
                      <div className="font-medium text-right min-w-[80px]">
                        {formatCurrency(product.price * product.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Info */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h5 className="font-medium text-gray-800 mb-2">Shipping Address</h5>
                  <p className="text-sm text-gray-700">
                    {shippingAddress.fullName} - {shippingAddress.phone}
                  </p>
                  <p className="text-sm text-gray-700">
                    {shippingAddress.address}, {shippingAddress.district}, {shippingAddress.city}
                  </p>
                </div>

                {/* Payment Methods */}
                <div className="border rounded-lg p-4 bg-white space-y-2">
                  <h5 className="font-medium text-gray-800 mb-2">Payment Method</h5>
                  <div className="space-y-2">
                    {[ 
                      { id: "cod", label: "Cash on Delivery (COD)" },
                      { id: "momo", label: "Pay via MoMo" },
                      { id: "vnpay", label: "Pay via VNPay" },
                    ].map((method) => (
                      <label key={method.id} className="flex items-center space-x-2 cursor-pointer">
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
      </div>
    </div>
  )
}
