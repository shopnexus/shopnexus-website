import { useState, useEffect } from "react";

interface RefundInfo {
  id: string;
  productName: string;
  price: number;
  refundMethod: string;
  refundAmount: number;
  reason: string;
  address: string;
  status: "PENDING" | "SUCCESS" | "CANCELLED" | "FAILED";
}

const dummyRefunds: RefundInfo[] = [
  {
    id: "1",
    productName: "Giày thể thao Nike",
    price: 500000,
    refundMethod: "Banking",
    refundAmount: 450000,
    reason: "Sản phẩm bị lỗi",
    address: "Chờ xử lý",
    status: "PENDING",
  },
  {
    id: "2",
    productName: "Dép tổ ong",
    price: 30000,
    refundMethod: "Tiền mặt",
    refundAmount: 450000,
    reason: "Sản phẩm bị lỗi",
    address: "Chờ xử lý",
    status: "PENDING",
  },
  {
    id: "3",
    productName: "Giày Bitis",
    price: 347000,
    refundMethod: "Banking",
    refundAmount: 450000,
    reason: "Sản phẩm bị lỗi",
    address: "Chờ xử lý",
    status: "PENDING",
  },
  {
    id: "4",
    productName: "Giày thể thao cầu lông Yonex",
    price: 1000000,
    refundMethod: "Banking",
    refundAmount: 450000,
    reason: "Sản phẩm bị lỗi",
    address: "Chờ xử lý",
    status: "PENDING",
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
      <h1 className="text-2xl font-bold mb-6">Quản lý yêu cầu hoàn trả hàng</h1>

      {/* Yêu cầu chưa xử lý */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <h2 className="text-xl font-semibold p-4">Yêu cầu chưa xử lý</h2>
        <table className="min-w-full table-auto">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">Sản phẩm</th>
              <th className="px-4 py-2 text-left">Giá</th>
              <th className="px-4 py-2 text-left">Hoàn lại</th>
              <th className="px-4 py-2 text-left">Phương thức</th>
              <th className="px-4 py-2 text-left">Lý do</th>
              <th className="px-4 py-2 text-left">Trạng thái</th>
              <th className="px-4 py-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {pendingRefunds.map((refund) => (
              <tr key={refund.id} className="border-t">
                <td className="px-4 py-2">{refund.productName}</td>
                <td className="px-4 py-2">{refund.price.toLocaleString()} VNĐ</td>
                <td className="px-4 py-2 text-red-500">{refund.refundAmount.toLocaleString()} VNĐ</td>
                <td className="px-4 py-2">{refund.refundMethod}</td>
                <td className="px-4 py-2">{refund.reason}</td>
                <td className="px-4 py-2 font-semibold">{refund.status}</td>
                <td className="px-4 py-2">
                  <button
                    className="cursor-pointer bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    onClick={() => handleViewDetails(refund)}
                  >
                    Xem
                  </button>
                </td>
              </tr>
            ))}
            {pendingRefunds.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-500">
                  Không có yêu cầu hoàn trả nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Yêu cầu đã được chấp nhận */}
      {acceptedRefunds.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <h2 className="text-xl font-semibold p-4">Yêu cầu đã được chấp nhận</h2>
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Sản phẩm</th>
                <th className="px-4 py-2 text-left">Giá</th>
                <th className="px-4 py-2 text-left">Hoàn lại</th>
                <th className="px-4 py-2 text-left">Phương thức</th>
                <th className="px-4 py-2 text-left">Lý do</th>
                <th className="px-4 py-2 text-left">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {acceptedRefunds.map((refund) => (
                <tr key={refund.id} className="border-t">
                  <td className="px-4 py-2">{refund.productName}</td>
                  <td className="px-4 py-2">{refund.price.toLocaleString()} VNĐ</td>
                  <td className="px-4 py-2 text-red-500">{refund.refundAmount.toLocaleString()} VNĐ</td>
                  <td className="px-4 py-2">{refund.refundMethod}</td>
                  <td className="px-4 py-2">{refund.reason}</td>
                  <td className="px-4 py-2 font-semibold">{refund.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Yêu cầu bị từ chối */}
      {rejectedRefunds.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <h2 className="text-xl font-semibold p-4">Yêu cầu bị từ chối</h2>
          <table className="min-w-full table-auto">
            <thead className="bg-gray-200 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Sản phẩm</th>
                <th className="px-4 py-2 text-left">Giá</th>
                <th className="px-4 py-2 text-left">Hoàn lại</th>
                <th className="px-4 py-2 text-left">Phương thức</th>
                <th className="px-4 py-2 text-left">Lý do</th>
                <th className="px-4 py-2 text-left">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rejectedRefunds.map((refund) => (
                <tr key={refund.id} className="border-t">
                  <td className="px-4 py-2">{refund.productName}</td>
                  <td className="px-4 py-2">{refund.price.toLocaleString()} VNĐ</td>
                  <td className="px-4 py-2 text-red-500">{refund.refundAmount.toLocaleString()} VNĐ</td>
                  <td className="px-4 py-2">{refund.refundMethod}</td>
                  <td className="px-4 py-2">{refund.reason}</td>
                  <td className="px-4 py-2 font-semibold">{refund.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal chi tiết */}
      {selectedRefund && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900">Chi tiết yêu cầu hoàn trả</h2>
          <div className="space-y-4">
            <p className="text-gray-800"><strong>Sản phẩm:</strong> {selectedRefund.productName}</p>
            <p className="text-gray-800"><strong>Giá sản phẩm:</strong> {selectedRefund.price.toLocaleString()} VNĐ</p>
            <p className="text-gray-800"><strong>Số tiền hoàn lại:</strong> {selectedRefund.refundAmount.toLocaleString()} VNĐ</p>
            <p className="text-gray-800"><strong>Phương thức hoàn trả:</strong> {selectedRefund.refundMethod}</p>
            <p className="text-gray-800"><strong>Lý do:</strong> {selectedRefund.reason}</p>
            <p className="text-gray-800"><strong>Địa chỉ:</strong> {selectedRefund.address}</p>
            <p className="text-gray-800"><strong>Trạng thái:</strong> {selectedRefund.status}</p>
          </div>
          <div className="mt-6 flex justify-between space-x-4">
            <button
              className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
              onClick={handleAcceptRefund}
            >
              Chấp nhận
            </button>
            <button
              className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
              onClick={handleRejectRefund}
            >
              Từ chối
            </button>
          </div>
          <button
            className="absolute top-2 right-2 text-gray-600 hover:text-black focus:outline-none"
            onClick={() => setSelectedRefund(null)}
          >
            ×
          </button>
        </div>
      </div>
      
      )}
    </div>
  );
};

export default RefundManagement;
