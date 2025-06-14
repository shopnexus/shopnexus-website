import { useMutation, useQuery } from "@connectrpc/connect-query";
import { useState } from "react";
import {
  getAdmin,
  getProductByPOPID,
  getProductModel,
  listRefunds,
  updateRefund,
} from "shopnexus-protobuf-gen-ts";
import { Status } from "shopnexus-protobuf-gen-ts/pb/common/status_pb";
import { PaymentMethod } from "shopnexus-protobuf-gen-ts/pb/payment/v1/payment_pb";
import { Refund } from "shopnexus-protobuf-gen-ts/pb/payment/v1/refund_pb";

function string_of_enum(e, value): string {
  for (const k in e) if (e[k] == value) return k;
  return "";
}

const RefundManagement = () => {
  const { data: admin } = useQuery(getAdmin);
  const [status, setStatus] = useState<Status>(Status.PENDING);

  const { data: refundData, refetch } = useQuery(listRefunds, {
    pagination: {
      page: 1,
      limit: 10,
    },
    status: status,
  });
  const refunds = refundData?.data || [];

  const { mutateAsync: mutateUpdateRefund } = useMutation(updateRefund, {
    onSuccess() {
      refetch();
    },
  });

  // const [refunds, setRefunds] = useState<RefundInfo[]>([]);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);

  const handleViewDetails = (refund: Refund) => {
    setSelectedRefund(refund);
  };

  // Xử lý yêu cầu chấp nhận
  const handleAcceptRefund = () => {
    if (selectedRefund) {
      mutateUpdateRefund({
        id: selectedRefund.id,
        approvedBy: admin?.id,
        status: Status.SUCCESS,
      });
      setSelectedRefund(null);
    }
  };

  // Xử lý yêu cầu từ chối
  const handleRejectRefund = () => {
    if (selectedRefund) {
      mutateUpdateRefund({
        id: selectedRefund.id,
        status: Status.CANCELED,
        approvedBy: admin?.id,
      });
      setSelectedRefund(null);
    }
  };

  const getStatusTitle = (status: Status) => {
    switch (status) {
      case Status.PENDING:
        return "Pending Requests";
      case Status.SUCCESS:
        return "Completed Requests";
      case Status.CANCELED:
        return "Rejected Requests";
      case Status.FAILED:
        return "Failed Requests";
      default:
        return "Refund Requests";
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Refund Management</h1>

      {/* Status Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              status === Status.PENDING
                ? "bg-yellow-500 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-yellow-50"
            }`}
            onClick={() => setStatus(Status.PENDING)}
          >
            Pending
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              status === Status.SUCCESS
                ? "bg-green-500 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-green-50"
            }`}
            onClick={() => setStatus(Status.SUCCESS)}
          >
            Completed
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              status === Status.CANCELED
                ? "bg-red-500 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-red-50"
            }`}
            onClick={() => setStatus(Status.CANCELED)}
          >
            Rejected
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-colors duration-200 ${
              status === Status.FAILED
                ? "bg-gray-500 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setStatus(Status.FAILED)}
          >
            Failed
          </button>
        </div>
      </div>

      {/* Refund List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <h2 className="text-xl font-semibold p-4">{getStatusTitle(status)}</h2>
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Refund Amount</th>
              <th className="px-4 py-2 text-left">Method</th>
              <th className="px-4 py-2 text-left">Reason</th>
              <th className="px-4 py-2 text-left">Status</th>
              {status === Status.PENDING && (
                <th className="px-4 py-2 text-left">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {refunds.map((refund) => (
              <RefundItem
                key={refund.id}
                refund={refund}
                handleViewDetails={handleViewDetails}
                showAction={status === Status.PENDING}
              />
            ))}
            {refunds.length === 0 && (
              <tr>
                <td
                  colSpan={status === Status.PENDING ? 8 : 7}
                  className="text-center py-4 text-gray-500"
                >
                  No refund requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedRefund && (
        <RefundDetailsModal
          refund={selectedRefund}
          onClose={() => setSelectedRefund(null)}
          onAccept={handleAcceptRefund}
          onReject={handleRejectRefund}
        />
      )}
    </div>
  );
};

interface RefundDetailsModalProps {
  refund: Refund;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
}

function RefundDetailsModal({
  refund,
  onClose,
  onAccept,
  onReject,
}: RefundDetailsModalProps) {
  const { data: productData, isLoading: isLoadingProduct } = useQuery(
    getProductByPOPID,
    {
      productOnPaymentId: refund.productOnPaymentId,
    }
  );
  const product = productData?.data;
  const { data: productModelData, isLoading: isLoadingModel } = useQuery(
    getProductModel,
    {
      id: product?.productModelId,
    }
  );
  const productModel = productModelData?.data;

  const isLoading = isLoadingProduct || isLoadingModel;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product || !productModel) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <div className="text-center text-red-500">
            <p>Failed to load product information</p>
            <button
              className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const price = productModel.listPrice + product.addPrice;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Refund Request Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">
                Product Information
              </h3>
              <p className="text-gray-800">
                <strong>Product:</strong> {productModel.name}
              </p>
              <p className="text-gray-800">
                <strong>Product Price:</strong> {price.toLocaleString()} ₫
              </p>
              <p className="text-gray-800">
                <strong>Refund Amount:</strong> {price.toLocaleString()} ₫
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Refund Details</h3>
              <p className="text-gray-800">
                <strong>Refund Method:</strong>{" "}
                {string_of_enum(PaymentMethod, refund.method)}
              </p>
              <p className="text-gray-800">
                <strong>Reason:</strong> {refund.reason}
              </p>
              <p className="text-gray-800">
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    refund.status === Status.PENDING
                      ? "bg-yellow-100 text-yellow-800"
                      : refund.status === Status.SUCCESS
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {string_of_enum(Status, refund.status)}
                </span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Resources</h3>
              {refund.resources && refund.resources.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {refund.resources.map((resource, index) => {
                    const isVideo =
                      resource.toLowerCase().endsWith(".mp4") ||
                      resource.toLowerCase().endsWith(".mov") ||
                      resource.toLowerCase().endsWith(".avi");

                    return (
                      <div key={index} className="relative aspect-square">
                        {isVideo ? (
                          <video
                            src={resource}
                            controls
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <img
                            src={resource}
                            alt={`Refund resource ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 italic">No resources provided</p>
              )}
            </div>
          </div>
        </div>

        {refund.status === Status.PENDING && (
          <div className="mt-6 flex justify-end space-x-4">
            <button
              className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
              onClick={onReject}
            >
              Reject
            </button>
            <button
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
              onClick={onAccept}
            >
              Mark as Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface RefundItemProps {
  refund: Refund;
  handleViewDetails: (refund: Refund) => void;
  showAction: boolean;
}

function RefundItem({
  refund,
  handleViewDetails,
  showAction,
}: RefundItemProps) {
  const { data: productData } = useQuery(getProductByPOPID, {
    productOnPaymentId: refund.productOnPaymentId,
  });
  const product = productData?.data;
  const { data: productModelData } = useQuery(getProductModel, {
    id: product?.productModelId,
  });
  const productModel = productModelData?.data;

  if (!product || !productModel) {
    return null;
  }

  const price = productModel.listPrice + product.addPrice;

  return (
    <tr key={refund.id} className="border-t">
      <td className="px-4 py-2">{productModel.name}</td>
      <td className="px-4 py-2">{price.toLocaleString()} ₫</td>
      <td className="px-4 py-2 text-red-500">{price.toLocaleString()} ₫</td>
      <td className="px-4 py-2">
        {string_of_enum(PaymentMethod, refund.method)}
      </td>
      <td className="px-4 py-2">{refund.reason}</td>
      <td className="px-4 py-2 font-semibold">
        {string_of_enum(Status, refund.status)}
      </td>
      {showAction && (
        <td className="px-4 py-2">
          <button
            className="cursor-pointer bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            onClick={() => handleViewDetails(refund)}
          >
            View
          </button>
        </td>
      )}
    </tr>
  );
}

export default RefundManagement;
