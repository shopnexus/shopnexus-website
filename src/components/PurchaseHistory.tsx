// PurchaseHistory.tsx
import { useInfiniteQuery } from "@connectrpc/connect-query";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { listPayments } from "shopnexus-protobuf-gen-ts";
import { PurchaseHistoryItem } from "./PurchaseHistoryItem";
import { Status } from "shopnexus-protobuf-gen-ts/pb/common/status_pb";
import {
  PaymentEntity,
  PaymentMethod,
} from "shopnexus-protobuf-gen-ts/pb/payment/v1/payment_pb";
import { PurchaseHistoryDetailItem } from "./PurchaseHistoryDetailItem";

const formatDate = (timestamp: string) => {
  const date = new Date(parseInt(timestamp));
  return date.toLocaleDateString();
};

// Helper function to get status badge
const PaymentStatusBadge = ({ status }: { status: Status }) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-700";
  let statusText: string;

  switch (status) {
    case Status.SUCCESS:
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      statusText = "Success";
      break;
    case Status.PENDING:
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      statusText = "Processing";
      break;
    case Status.FAILED:
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      statusText = "Failed";
      break;
    default:
      statusText = status.toString();
  }

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}
    >
      {statusText}
    </span>
  );
};

// Helper function to format payment method
const formatPaymentMethod = (method: PaymentMethod) => {
  switch (method) {
    case PaymentMethod.CASH:
      return "Cash";
    case PaymentMethod.MOMO:
      return "MoMo";
    case PaymentMethod.VNPAY:
      return "VNPay";
    default:
      return method.toString();
  }
};

const PurchaseHistory: React.FC = () => {
  const [selectedPayment, setSelectedPayment] = useState<PaymentEntity | null>(
    null
  );
  const navigate = useNavigate();
  const { data: paymentsResponse } = useInfiniteQuery(
    listPayments,
    {
      pagination: {
        page: 1,
        limit: 10,
      },
    },
    {
      pageParamKey: "pagination",
      getNextPageParam: (lastPage, pages) => {
        return {
          limit: lastPage.pagination?.limit,
          page: pages.length + 1,
        };
      },
    }
  );
  const payments = paymentsResponse?.pages.flatMap((page) => page.data) ?? [];

  const handleViewPayment = (id: bigint) => {
    const payment = payments.find((p) => p.id === id);
    if (payment) {
      setSelectedPayment(payment);
    }
  };

  const handleBuyProduct = () => {
    navigate("/");
  };

  const handleCloseDetail = () => {
    setSelectedPayment(null);
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">
          Purchase History
        </h1>

        {payments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
            <p className="text-gray-600 text-lg">No orders here</p>
            <button
              onClick={handleBuyProduct}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Buy now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {payments.map((payment) => {
              const orderDate = formatDate(payment.dateCreated.toString());

              return (
                <div
                  key={payment.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Header */}
                  <div className="bg-gray-50 px-4 py-3 flex flex-wrap items-center justify-between border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-semibold text-gray-800">
                        Oder #{payment.id.toString()}
                      </h2>
                      <PaymentStatusBadge status={payment.status} />
                    </div>
                    <div className="text-sm text-gray-500">{orderDate}</div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4">
                    {payment.products.length > 0 && (
                      <PurchaseHistoryItem item={payment.products[0]} />
                    )}
                    {payment.products.length > 1 && (
                      <div className="text-center mt-2 text-sm text-gray-500">
                        +{payment.products.length - 1} more items
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
                    <button
                      onClick={() => handleViewPayment(payment.id)}
                      className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded-lg shadow-sm transition-all duration-200 flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        ></path>
                      </svg>
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-800">
                Purchase Detail #{selectedPayment.id.toString()}
              </h2>
              <button
                onClick={handleCloseDetail}
                className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Close"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            {/* Order Information */}
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start">
                    <span className="text-gray-500 w-36">Purchase code:</span>
                    <span className="font-medium text-gray-800">
                      {selectedPayment.id.toString()}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 w-36">Date order:</span>
                    <span className="font-medium text-gray-800">
                      {formatDate(selectedPayment.dateCreated.toString())}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 w-36">Method payment:</span>
                    <span className="font-medium text-gray-800">
                      {formatPaymentMethod(selectedPayment.method)}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 w-36">Status:</span>
                    <PaymentStatusBadge status={selectedPayment.status} />
                  </div>
                  <div className="flex items-start col-span-2">
                    <span className="text-gray-500 w-36">
                      Address Shipping:
                    </span>
                    <span className="font-medium text-gray-800">
                      {selectedPayment.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Product
              </h3>
              <div className="space-y-4 mb-6">
                {selectedPayment.products.map((item, idx) => (
                  <PurchaseHistoryDetailItem
                    key={idx}
                    item={item}
                    paymentId={selectedPayment.id}
                    onClose={handleCloseDetail}
                  />
                ))}
              </div>

              {/* Order Total */}
              <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                <span className="text-lg font-medium text-gray-700">
                  Total:
                </span>
                <span className="text-2xl font-bold text-red-600">
                  {parseInt(selectedPayment.total.toString()).toLocaleString()}₫
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
              <button
                onClick={handleCloseDetail}
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
