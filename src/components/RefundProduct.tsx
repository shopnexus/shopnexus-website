"use client"

import type React from "react"

import { useState, useRef } from "react"
import { ArrowLeft, X, Upload, CheckCircle } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

export interface RefundInfo {
  id: string
  paymentId: string
  method: string
  status: string
  reason: string
  dateCreated: string
  dateUpdated: string
  resources: string[]
}

// Product interface to match with PurchaseHistory
export interface ProductInfor {
  id: string
  type: string
  brandId: string
  name: string
  description: string
  listPrice: number
  dateManufactured: string
  resources: string[]
  tags: string[]
}

export interface PaymentProductItem {
  itemQuantity: {
    itemId: string
    quantity: string
  }
  serialIds: string[]
  price: string
  totalPrice: string
  productInfo?: ProductInfor | null
}

//test data
const dataModel: RefundInfo = {
  id: "2",
  paymentId: "3",
  method: "REFUND_METHOD_DROP_OFF",
  status: "STATUS_SUCCESS",
  reason: "Sub comedo voluptates uredo deorsum universe peior carus aestas adipisci.",
  dateCreated: "1743808940828",
  dateUpdated: "1743808940828",
  resources: [
    "https://loremflickr.com/800/600?lock=3346652999366532",
    "https://picsum.photos/seed/alIPKkY4Vp/800/600?grayscale&blur=8",
    "https://picsum.photos/seed/b0yMS3yqA/800/600?blur=1",
    "https://picsum.photos/seed/FqcOQm4uhU/800/600?blur=3",
    "https://picsum.photos/seed/U6WUuEL1/800/600?grayscale",
    "https://picsum.photos/seed/v1iD8SXxS/800/600?blur=5",
    "https://picsum.photos/seed/Wtws7H3Ft/800/600?grayscale&blur=9",
    "https://picsum.photos/seed/X8XFwhkQ/800/600?blur=7",
  ],
}

const RefundProduct: React.FC = () => {
  const [formData, setFormData] = useState({
    idRefund: "",
    selectedReason: "",
    customReason: "",
    productImages: [] as File[],
    productImagePreviews: [] as string[],
    refundMethod: "",
  })
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { paymentId, paymentInfo, products } = location.state || {}

  // Get product information from the location state
  const productItems = products || []

  const reasons = ["Product is defective", "Does not match description", "Wrong item delivered", "Missing accessories", "Other (Please specify)"]

  const paymentMethods = ["VNPay Wallet", "Cash", "MoMo Wallet"]

  // Calculate total refund amount
  const calculateTotalRefund = () => {
    return productItems.reduce((total, item) => {
      return total + Number.parseInt(item.totalPrice || "0")
    }, 0)
  }

  const totalRefundAmount = calculateTotalRefund()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.refundMethod) {
      alert("Please select a refund method")
      return
    }

    if (!formData.selectedReason) {
      alert("Please select a refund reason")
      return
    }

    if (formData.selectedReason === "Other (Please specify)" && !formData.customReason.trim()) {
      alert("Please enter a specific reason")
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      setMessage("Request Submitted!")
    }, 1500)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (formData.productImagePreviews.length + files.length > 8) {
      alert("You can only upload up to 8 images")
      return
    }

    const previews: string[] = []

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        previews.push(reader.result as string)
        if (previews.length === files.length) {
          setFormData((prev) => ({
            ...prev,
            productImages: [...prev.productImages, ...files],
            productImagePreviews: [...prev.productImagePreviews, ...previews],
          }))
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index),
      productImagePreviews: prev.productImagePreviews.filter((_, i) => i !== index),
    }))
  }

  const goBack = () => {
    navigate(-1)
  }

  // Format date
  const formatDate = (timestamp: string) => {
    if (!timestamp) return ""
    const date = new Date(Number.parseInt(timestamp))
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  return (
    <div className="max-w-3xl mx-auto p-4 bg-gray-50 min-h-screen">
      {isSuccess ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Submitted!</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={goBack}
            className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
          >
            Back to Purchase History
          </button>
        </div>
      ) : (
        <>
          {/* Header with back button */}
          <div className="flex items-center mb-6">
            <button
              onClick={goBack}
              className="mr-3 p-2 rounded-full hover:bg-gray-200 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="cursor-pointer w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Refund Request</h1>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Order information */}
            <div className="border-b border-gray-200 p-4 bg-blue-50">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-gray-800">Order Information</h2>
                <span className="text-sm text-gray-500">Order ID: #{paymentInfo?.id || "N/A"}</span>
              </div>
              <div className="text-sm text-gray-600">
                <p>Order Date: {formatDate(paymentInfo?.dateCreated || "")}</p>
                <p>Address: {paymentInfo?.address || "N/A"}</p>
              </div>
            </div>

            {/* Product list */}
            <div className="p-4">
              <h2 className="font-semibold text-gray-800 mb-3">Products to Refund</h2>

              <div className="space-y-4">
                {productItems.map((item: PaymentProductItem, index: number) => {
                  const product = item.productInfo

                  return (
                    <div key={index} className="flex gap-3 p-3 border border-gray-200 rounded-lg">
                      <div className="w-20 h-20 flex-shrink-0">
                        <img
                          src={product?.resources?.[0] || "https://via.placeholder.com/80"}
                          alt={product?.name || "Product"}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 mb-1 line-clamp-1">{product?.name || "Product"}</h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mb-1">{product?.description || ""}</p>
                        <div className="flex flex-wrap gap-x-4 text-sm">
                          <p className="text-gray-600">
                            Qty: <span className="font-medium">{item.itemQuantity?.quantity || 1}</span>
                          </p>
                          <p className="text-gray-600">
                            Unit Price:{" "}
                            <span className="font-medium">{Number.parseInt(item.price || "0").toLocaleString()} ₫</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="font-semibold text-red-600">
                          {Number.parseInt(item.totalPrice || "0").toLocaleString()} ₫
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Refund form */}
            <form onSubmit={handleSubmit} className="p-4">
              {/* Refund amount */}
              <div className="mb-5 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-gray-700 font-medium">Total Refund Amount:</p>
                  <p className="text-xl font-bold text-red-600">{totalRefundAmount.toLocaleString()} ₫</p>
                </div>
              </div>

              {/* Refund method */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Method <span className="text-red-500">*</span>
                </label>
                <select
                  name="refundMethod"
                  value={formData.refundMethod}
                  onChange={handleChange}
                  className="cursor-pointer w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                >
                  <option value="">-- Select Refund Method --</option>
                  {paymentMethods.map((method, index) => (
                    <option key={index} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reason for refund */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Reason <span className="text-red-500">*</span>
                </label>
                <select
                  name="selectedReason"
                  value={formData.selectedReason}
                  onChange={handleChange}
                  className="cursor-pointer w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                >
                  <option value="">-- Select Refund Reason --</option>
                  {reasons.map((reason, index) => (
                    <option key={index} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>

                {formData.selectedReason === "Other (Please specify)" && (
                  <textarea
                    name="customReason"
                    value={formData.customReason}
                    onChange={handleChange}
                    placeholder="Enter your specific reason"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg mt-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[100px]"
                  />
                )}
              </div>

              {/* Image upload */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Images (Max 8)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Upload Images
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    Upload images of the product to support your refund request
                  </p>
                </div>

                {/* Image previews */}
                {formData.productImagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {formData.productImagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`cursor-pointer w-full ${
                  isSubmitting ? "cursor-pointer bg-blue-400" : "cursor-pointer bg-blue-600 hover:bg-blue-700"
                } text-white p-3 rounded-lg font-medium transition-colors flex items-center justify-center`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Submit Refund Request"
                )}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

export default RefundProduct
