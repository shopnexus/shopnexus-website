import { useState, useEffect } from "react";

interface RefundInfo {
  id: string;
  paymentId: string;
  method: string;
  status: string;
  reason: string;
  dateCreated: string;
  dateUpdated: string;
  resources: string[];
  productName: string;
  price: number;
  refundAmount: number;
  refundMethod: string;
  address: string;
}

const dummyRefunds: RefundInfo[] = [
  {
    id: 'RR123456789',
    paymentId: 'PMT987654321',
    method: 'VNPAY',
    status: 'pending', // trạng thái có thể là: pending, approved, rejected, processing, completed
    reason: 'Product is defective when received',
    dateCreated: '2025-04-08T10:30:00Z',
    dateUpdated: '2025-04-08T10:30:00Z',
    resources: [
      'https://example.com/uploads/image1.jpg',
      'https://example.com/uploads/image2.jpg',
    ],
    productName: 'Product 1',
    price: 100000,
    refundAmount: 50000,
    refundMethod: 'VNPAY',
    address: '123 Main St, Hanoi',
  },
  {
    id: 'RR123456789',
    paymentId: 'PMT987654321',
    method: 'VNPAY',
    status: 'pending',
    reason: 'Product is defective when received',
    dateCreated: '2025-04-08T10:30:00Z',
    dateUpdated: '2025-04-08T10:30:00Z',
    resources: [
      'https://example.com/uploads/image1.jpg',
      'https://example.com/uploads/image2.jpg',
    ],
    productName: 'Product 2',
    price: 150000,
    refundAmount: 75000,
    refundMethod: 'VNPAY',
    address: '456 Elm St, Hanoi',
  },
  {
    id: 'RR987654321',
    paymentId: 'PMT123456789',
    method: 'COD',
    status: 'processing',
    reason: 'Wrong model delivered',
    dateCreated: '2025-04-07T15:00:00Z',
    dateUpdated: '2025-04-08T09:45:00Z',
    resources: [
      'https://example.com/uploads/wrong_product.jpg',
    ],
    productName: 'Product 3',
    price: 200000,
    refundAmount: 100000,
    refundMethod: 'COD',
    address: '789 Oak St, Hanoi',
  },
  {
    id: 'RR555666777',
    paymentId: 'PMT222333444',
    method: 'MOMO',
    status: 'approved',
    reason: 'Size does not match description',
    dateCreated: '2025-04-06T12:10:00Z',
    dateUpdated: '2025-04-07T08:20:00Z',
    resources: [
      'https://example.com/uploads/size_issue.jpg',
    ],
    productName: 'Product 4',
    price: 250000,
    refundAmount: 125000,
    refundMethod: 'MOMO',
    address: '101 Pine St, Hanoi',
  },
  {
    id: 'RR444333222',
    paymentId: 'PMT999888777',
    method: 'ZALO_PAY',
    status: 'rejected',
    reason: 'Want to exchange for another product',
    dateCreated: '2025-04-05T18:30:00Z',
    dateUpdated: '2025-04-06T10:00:00Z',
    resources: [],
    productName: 'Product 5',
    price: 300000,
    refundAmount: 150000,
    refundMethod: 'ZALO_PAY',
    address: '202 Maple St, Hanoi',
  },
];

const RefundManagement = () => {
  const [refunds, setRefunds] = useState<RefundInfo[]>([]);
  const [selectedRefund, setSelectedRefund] = useState<RefundInfo | null>(null);

  useEffect(() => {
    setRefunds(dummyRefunds);
  }, []);

  const handleViewDetails = (refund: RefundInfo) => {
    setSelectedRefund(refund);
  };

  // Xử lý yêu cầu chấp nhận
  const handleAcceptRefund = () => {
    if (selectedRefund) {
      const updatedRefunds = refunds.map((refund) =>
        refund.id === selectedRefund.id
          ? { ...refund, status: "SUCCESS" }
          : refund
      );
      setRefunds(updatedRefunds);
      setSelectedRefund(null);
    }
  };

  // Xử lý yêu cầu từ chối
  const handleRejectRefund = () => {
    if (selectedRefund) {
      const updatedRefunds = refunds.map((refund) =>
        refund.id === selectedRefund.id
          ? { ...refund, status: "CANCELLED" }
          : refund
      );
      setRefunds(updatedRefunds);
      setSelectedRefund(null);
    }
  };

  const pendingRefunds = refunds.filter((refund) => refund.status === "PENDING");
  const acceptedRefunds = refunds.filter((refund) => refund.status === "SUCCESS");
  const rejectedRefunds = refunds.filter((refund) => refund.status === "CANCELLED");

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Refund Management</h1>

      {/* Pending Requests */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <h2 className="text-xl font-semibold p-4">Pending Requests</h2>
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-left">Price</th>
              <th className="px-4 py-2 text-left">Refund Amount</th>
              <th className="px-4 py-2 text-left">Method</th>
              <th className="px-4 py-2 text-left">Reason</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingRefunds.map((refund) => (
              <tr key={refund.id} className="border-t">
                <td className="px-4 py-2">{refund.productName}</td>
                <td className="px-4 py-2">{refund.price.toLocaleString()} ₫</td>
                <td className="px-4 py-2 text-red-500">{refund.refundAmount.toLocaleString()} ₫</td>
                <td className="px-4 py-2">{refund.refundMethod}</td>
                <td className="px-4 py-2">{refund.reason}</td>
                <td className="px-4 py-2 font-semibold">{refund.status}</td>
                <td className="px-4 py-2">
                  <button
                    className="cursor-pointer bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    onClick={() => handleViewDetails(refund)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {pendingRefunds.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-500">
                  No refund requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Accepted Requests */}
      {acceptedRefunds.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <h2 className="text-xl font-semibold p-4">Accepted Requests</h2>
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Refund Amount</th>
                <th className="px-4 py-2 text-left">Method</th>
                <th className="px-4 py-2 text-left">Reason</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {acceptedRefunds.map((refund) => (
                <tr key={refund.id} className="border-t">
                  <td className="px-4 py-2">{refund.productName}</td>
                  <td className="px-4 py-2">{refund.price.toLocaleString()} ₫</td>
                  <td className="px-4 py-2 text-red-500">{refund.refundAmount.toLocaleString()} ₫</td>
                  <td className="px-4 py-2">{refund.refundMethod}</td>
                  <td className="px-4 py-2">{refund.reason}</td>
                  <td className="px-4 py-2 font-semibold">{refund.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejected Requests */}
      {rejectedRefunds.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <h2 className="text-xl font-semibold p-4">Rejected Requests</h2>
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Refund Amount</th>
                <th className="px-4 py-2 text-left">Method</th>
                <th className="px-4 py-2 text-left">Reason</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {rejectedRefunds.map((refund) => (
                <tr key={refund.id} className="border-t">
                  <td className="px-4 py-2">{refund.productName}</td>
                  <td className="px-4 py-2">{refund.price.toLocaleString()} ₫</td>
                  <td className="px-4 py-2 text-red-500">{refund.refundAmount.toLocaleString()} ₫</td>
                  <td className="px-4 py-2">{refund.refundMethod}</td>
                  <td className="px-4 py-2">{refund.reason}</td>
                  <td className="px-4 py-2 font-semibold">{refund.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRefund && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900">Refund Request Details</h2>
            <div className="space-y-4">
              <p className="text-gray-800"><strong>Product:</strong> {selectedRefund.productName}</p>
              <p className="text-gray-800"><strong>Product Price:</strong> {selectedRefund.price.toLocaleString()} ₫</p>
              <p className="text-gray-800"><strong>Refund Amount:</strong> {selectedRefund.refundAmount.toLocaleString()} ₫</p>
              <p className="text-gray-800"><strong>Refund Method:</strong> {selectedRefund.refundMethod}</p>
              <p className="text-gray-800"><strong>Reason:</strong> {selectedRefund.reason}</p>
              <p className="text-gray-800"><strong>Address:</strong> {selectedRefund.address}</p>
              <p className="text-gray-800"><strong>Status:</strong> {selectedRefund.status}</p>
            </div>
            <div className="mt-6 flex justify-between space-x-4">
              <button
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                onClick={handleAcceptRefund}
              >
                Accept
              </button>
              <button
                className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                onClick={handleRejectRefund}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundManagement;
