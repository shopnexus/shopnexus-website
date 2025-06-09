"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  createRefund,
  getPayment,
  getProduct,
  getProductModel,
} from "shopnexus-protobuf-gen-ts";
import { useMutation, useQuery } from "@connectrpc/connect-query";
import FileUpload from "./ui/FileUpload";
import { RefundMethod } from "shopnexus-protobuf-gen-ts/pb/payment/v1/refund_pb";
export interface RefundInfo {
  id: string;
  paymentId: string;
  method: string;
  status: string;
  reason: string;
  dateCreated: string;
  dateUpdated: string;
  resources: string[];
}

// Product interface to match with PurchaseHistory
export interface ProductInfor {
  id: string;
  type: string;
  brandId: string;
  name: string;
  description: string;
  listPrice: number;
  dateManufactured: string;
  resources: string[];
  tags: string[];
}

export interface PaymentProductItem {
  itemQuantity: {
    itemId: string;
    quantity: string;
  };
  serialIds: string[];
  price: string;
  totalPrice: string;
  productInfo?: ProductInfor | null;
}

const RefundProduct: React.FC = () => {
  const [searchParams] = useSearchParams();
  const payment_id = searchParams.get("id");
  const product_id = searchParams.get("product_id");

  const [formData, setFormData] = useState<{
    productOnPaymentId: bigint;
    method: RefundMethod;
    reason: string;
    address: string;
    resources: string[];
  }>({
    productOnPaymentId: BigInt(0),
    method: RefundMethod.UNSPECIFIED,
    reason: "",
    address: "",
    resources: [],
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { data: productResponse } = useQuery(getProduct, {
    id: BigInt(product_id || "0"),
  });
  const product = productResponse?.data;
  const { data: productModelResponse } = useQuery(getProductModel, {
    id: product?.productModelId,
  });
  const { data: paymentResponse } = useQuery(getPayment, {
    id: BigInt(payment_id || "0"),
  });
  const paymentInfo = paymentResponse?.data;
  const paymentItem = paymentInfo?.products.find(
    (product) => product.itemQuantity?.itemId === BigInt(product_id || "0")
  );
  console.log(paymentInfo?.products);
  const productModel = productModelResponse?.data;
  const { mutateAsync: mutateCreateRefund } = useMutation(createRefund);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      productOnPaymentId: BigInt(paymentItem?.id || 0),
    }));
  }, [paymentItem]);

  const reasons = [
    "Product is defective",
    "Does not match description",
    "Wrong item delivered",
    "Missing accessories",
    "Other (Please specify)",
  ];

  const refundMethods = ["Drop off", "Pick up"];
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "refundMethod") {
      // Map the UI-friendly method names to RefundMethod enum values
      const methodMap: { [key: string]: RefundMethod } = {
        "Drop off": RefundMethod.DROP_OFF,
        "Pick up": RefundMethod.PICK_UP,
      };
      setFormData((prev) => ({
        ...prev,
        method: methodMap[value] || RefundMethod.UNSPECIFIED,
      }));
    } else if (name === "selectedReason" || name === "customReason") {
      // Handle both reason select and custom reason textarea
      const reason =
        name === "customReason"
          ? value
          : value === "Other (Please specify)"
          ? formData.reason
          : value;
      setFormData((prev) => ({ ...prev, reason }));
    }
  };

  const handleUploadComplete = (urls: string[]) => {
    setFormData((prev) => ({
      ...prev,
      resources: [...prev.resources, ...urls],
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.method === RefundMethod.UNSPECIFIED) {
      alert("Please select a refund method");
      return;
    }

    if (!formData.reason) {
      alert("Please provide a refund reason");
      return;
    }

    setIsSubmitting(true);

    try {
      // Only include address if method is PICK_UP
      const requestData = {
        paymentId: BigInt(payment_id || "0"),
        productOnPaymentId: formData.productOnPaymentId,
        method: formData.method,
        reason: formData.reason,
        resources: formData.resources,
        ...(formData.method === RefundMethod.PICK_UP && {
          address: paymentInfo?.address || "",
        }),
      };

      await mutateCreateRefund(requestData);

      setIsSuccess(true);
      setMessage("Request Submitted!");
    } catch (error: any) {
      console.error("Error submitting refund:", error);
      setMessage("Failed to submit refund request");
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  // Format date
  const formatDate = (timestamp: string) => {
    if (!timestamp) return "";
    const date = new Date(Number.parseInt(timestamp));
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-gray-50 min-h-screen">
      {isSuccess ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Request Submitted!
          </h2>
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
                <h2 className="font-semibold text-gray-800">
                  Order Information
                </h2>
                <span className="text-sm text-gray-500">
                  Order ID: #{paymentInfo?.id.toString() || "N/A"}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  Order Date:{" "}
                  {formatDate(paymentInfo?.dateCreated.toString() || "")}
                </p>
                <p>Address: {paymentInfo?.address || "N/A"}</p>
              </div>
            </div>

            {/* Product list */}
            <div className="p-4">
              <h2 className="font-semibold text-gray-800 mb-3">
                Products to Refund
              </h2>

              <div className="space-y-4">
                <div className="flex gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="w-20 h-20 flex-shrink-0">
                    <img
                      src={
                        product?.resources?.[0] ||
                        "https://via.placeholder.com/80"
                      }
                      alt={productModel?.name || "Product"}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 mb-1 line-clamp-1">
                      {productModel?.name || "Product"}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-1">
                      {productModel?.description || ""}
                    </p>
                    <div className="flex flex-wrap gap-x-4 text-sm">
                      <p className="text-gray-600">
                        Qty:{" "}
                        <span className="font-medium">
                          {paymentItem?.itemQuantity?.quantity.toString() ||
                            "1"}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        Unit Price:{" "}
                        <span className="font-medium">
                          {Number.parseInt(
                            productModel?.listPrice.toString() || "0"
                          ).toLocaleString()}{" "}
                          ₫
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="font-semibold text-red-600">
                      {Number.parseInt(
                        paymentItem?.totalPrice.toString() || "0"
                      ).toLocaleString()}{" "}
                      ₫
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Refund form */}
            <form onSubmit={handleSubmit} className="p-4">
              {/* Refund amount */}
              <div className="mb-5 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-gray-700 font-medium">
                    Total Refund Amount:
                  </p>
                  <p className="text-xl font-bold text-red-600">
                    {Number.parseInt(
                      paymentItem?.totalPrice.toString() || "0"
                    ).toLocaleString()}{" "}
                    ₫
                  </p>
                </div>
              </div>

              {/* Refund method */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Method <span className="text-red-500">*</span>
                </label>
                <select
                  name="refundMethod"
                  value={
                    {
                      [RefundMethod.DROP_OFF]: "Drop off",
                      [RefundMethod.PICK_UP]: "Pick up",
                    }[formData.method] || ""
                  }
                  onChange={handleChange}
                  className="cursor-pointer w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  required
                >
                  <option value="">-- Select Refund Method --</option>
                  {refundMethods.map((method, index) => (
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
                  value={formData.reason}
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

                {formData.reason === "Other (Please specify)" && (
                  <textarea
                    name="customReason"
                    value={formData.reason}
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
                <FileUpload
                  onUploadComplete={handleUploadComplete}
                  resources={formData.resources}
                  onRemoveImage={handleRemoveImage}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`cursor-pointer w-full ${
                  isSubmitting
                    ? "cursor-pointer bg-blue-400"
                    : "cursor-pointer bg-blue-600 hover:bg-blue-700"
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
  );
};

export default RefundProduct;
