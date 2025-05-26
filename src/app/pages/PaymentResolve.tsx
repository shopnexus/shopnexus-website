"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Home,
  Mail,
  Package,
  CreditCard,
  Clock,
  ArrowRight,
  XCircle,
  AlertCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@connectrpc/connect-query";
import { getPayment } from "shopnexus-protobuf-gen-ts";

export default function PaymentResolve() {
  // Example params: ?vnp_Amount=25438700&vnp_BankCode=NCB&vnp_BankTranNo=VNP14980277&vnp_CardType=ATM&vnp_OrderInfo=Payment+for+order+3007&vnp_PayDate=20250526171103&vnp_ResponseCode=00&vnp_TmnCode=5LEX1T18&vnp_TransactionNo=14980277&vnp_TransactionStatus=00&vnp_TxnRef=3007&vnp_SecureHash=75010697cc7399c4eac1baee93eae9ee715d7223543a3df70a9fcc5f703c30458d30cf4a91a4243cacbdda73e45cc09ccea48fbda9b0b766a144ce113c862606
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get("vnp_TransactionStatus") === "00";
  const { data: paymentRes, isLoading } = useQuery(getPayment, {
    id: BigInt(searchParams.get("vnp_TxnRef") ?? "0"),
  });
  const payment = paymentRes?.data;

  const [, setShowConfetti] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess && payment) {
      // Trigger confetti after a short delay
      const timer = setTimeout(() => {
        setShowConfetti(true);
        const duration = 3 * 1000;
        const end = Date.now() + duration;

        const runConfetti = () => {
          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#10b981", "#34d399", "#6ee7b7"],
          });

          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#10b981", "#34d399", "#6ee7b7"],
          });

          if (Date.now() < end) {
            requestAnimationFrame(runConfetti);
          }
        };

        runConfetti();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isSuccess, payment]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl p-6 shadow-xl mb-8 text-left border border-red-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Không tìm thấy thông tin thanh toán
            </h2>
            <p className="text-gray-600 mb-6">
              Không thể tìm thấy thông tin thanh toán của bạn. Vui lòng kiểm tra
              lại mã giao dịch.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-red-600 text-white px-8 py-3 rounded-xl hover:bg-red-700 transition shadow-lg flex items-center justify-center"
              onClick={() => navigate("/")}
            >
              <Home className="w-5 h-5 mr-2" />
              Quay về trang chủ
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  const orderDate = new Date(Number(payment.dateCreated)).toLocaleDateString(
    "vi-VN"
  );
  const estimatedDelivery = new Date(
    new Date(Number(payment.dateCreated)).getTime() + 7 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("vi-VN");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-white px-4 py-12 text-center">
      <div className="w-full max-w-2xl">
        {/* Status Icon with Pulse Effect */}
        <div className="relative mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="relative z-10"
          >
            <div className="bg-white rounded-full p-4 shadow-lg inline-block">
              {isSuccess ? (
                <CheckCircle className="text-emerald-500 w-16 h-16 md:w-20 md:h-20" />
              ) : (
                <XCircle className="text-red-500 w-16 h-16 md:w-20 md:h-20" />
              )}
            </div>
          </motion.div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.2, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 2,
              ease: "easeInOut",
            }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full w-24 h-24 md:w-28 md:h-28 ${
              isSuccess ? "bg-emerald-400" : "bg-red-400"
            }`}
          />
        </div>

        {/* Status Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8"
        >
          <h1
            className={`text-3xl md:text-4xl font-bold mb-3 ${
              isSuccess ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {isSuccess ? "Thanh toán thành công!" : "Thanh toán thất bại!"}
          </h1>
          <p
            className={`text-lg mb-2 ${
              isSuccess ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {isSuccess
              ? "Cảm ơn bạn đã mua hàng. Chúng tôi sẽ xử lý đơn hàng của bạn ngay lập tức."
              : "Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại sau."}
          </p>
        </motion.div>

        {isSuccess ? (
          <>
            {/* Order Details Card */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-xl mb-8 text-left border border-emerald-100"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Chi tiết đơn hàng
                  </h2>
                  <p className="text-gray-500">
                    Xem thông tin đơn hàng của bạn
                  </p>
                </div>
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full font-medium">
                  Đã xác nhận
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-emerald-50 p-2 rounded-lg mr-4">
                    <Package className="text-emerald-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Mã đơn hàng</p>
                    <p className="font-medium text-gray-800">
                      {payment.id.toString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-emerald-50 p-2 rounded-lg mr-4">
                    <Mail className="text-emerald-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Address</p>
                    <p className="font-medium text-gray-800">
                      {payment.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-emerald-50 p-2 rounded-lg mr-4">
                    <CreditCard className="text-emerald-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Tổng thanh toán</p>
                    <p className="font-medium text-gray-800">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(Number(payment.total))}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-emerald-50 p-2 rounded-lg mr-4">
                    <Clock className="text-emerald-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Ngày đặt hàng</p>
                    <p className="font-medium text-gray-800">{orderDate}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Delivery Timeline */}
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-xl mb-8 border border-emerald-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Trạng thái đơn hàng
              </h3>

              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-emerald-100 z-0"></div>

                <div className="relative z-10 flex mb-6">
                  <div className="bg-emerald-500 rounded-full w-8 h-8 flex items-center justify-center text-white">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-800">
                      Đã xác nhận thanh toán
                    </p>
                    <p className="text-sm text-gray-500 text-left">
                      {orderDate}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex mb-6">
                  <div className="bg-emerald-100 text-emerald-500 rounded-full w-8 h-8 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-800 text-left">
                      Đang chuẩn bị hàng
                    </p>
                    <p className="text-sm text-gray-500">
                      Đơn hàng đang được xử lý
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex">
                  <div className="bg-emerald-100 text-emerald-500 rounded-full w-8 h-8 flex items-center justify-center">
                    <Home className="w-5 h-5" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-800">
                      Dự kiến giao hàng
                    </p>
                    <p className="text-sm text-gray-500 text-left">
                      {estimatedDelivery}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-white rounded-2xl p-6 shadow-xl mb-8 text-left border border-red-100"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Thông tin lỗi
                </h2>
                <p className="text-gray-500">Chi tiết về lỗi thanh toán</p>
              </div>
              <div className="bg-red-50 text-red-700 px-4 py-2 rounded-full font-medium">
                Thất bại
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-red-50 p-2 rounded-lg mr-4">
                  <AlertCircle className="text-red-600 w-5 h-5" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Mã lỗi</p>
                  <p className="font-medium text-gray-800">
                    {searchParams.get("vnp_ResponseCode") || "Không xác định"}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-red-50 p-2 rounded-lg mr-4">
                  <Clock className="text-red-600 w-5 h-5" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Thời gian</p>
                  <p className="font-medium text-gray-800">{orderDate}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-red-50 p-2 rounded-lg mr-4">
                  <Package className="text-red-600 w-5 h-5" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Mã đơn hàng</p>
                  <p className="font-medium text-gray-800">
                    {payment.id.toString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`${
              isSuccess
                ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                : "bg-red-600 hover:bg-red-700 shadow-red-200"
            } text-white px-8 py-3 rounded-xl transition shadow-lg flex items-center justify-center`}
            onClick={() => navigate("/")}
          >
            <Home className="w-5 h-5 mr-2" />
            Quay về trang chủ
          </motion.button>

          {isSuccess ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white text-emerald-600 border border-emerald-200 px-8 py-3 rounded-xl hover:bg-emerald-50 transition shadow-md flex items-center justify-center"
              onClick={() => navigate(`/purchase-history`)}
            >
              Theo dõi đơn hàng
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white text-red-600 border border-red-200 px-8 py-3 rounded-xl hover:bg-red-50 transition shadow-md flex items-center justify-center"
              onClick={() => navigate(`/checkout`)}
            >
              Thử lại thanh toán
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
