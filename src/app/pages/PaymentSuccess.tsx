"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle, Home, Mail, Package, CreditCard, Clock, ArrowRight } from "lucide-react"
import confetti from "canvas-confetti"

export default function PaymentSuccess() {
  const [showConfetti, setShowConfetti] = useState(false)
  const orderId = "DH20240516001"
  const customerEmail = "user@example.com"
  const amount = "2,499,000₫"
  const orderDate = new Date().toLocaleDateString("vi-VN")
  const estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN")

  useEffect(() => {
    // Trigger confetti after a short delay
    const timer = setTimeout(() => {
      setShowConfetti(true)
      const duration = 3 * 1000
      const end = Date.now() + duration

      const runConfetti = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#10b981", "#34d399", "#6ee7b7"],
        })

        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#10b981", "#34d399", "#6ee7b7"],
        })

        if (Date.now() < end) {
          requestAnimationFrame(runConfetti)
        }
      }

      runConfetti()
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-white px-4 py-12 text-center">
      <div className="w-full max-w-2xl">
        {/* Success Icon with Pulse Effect */}
        <div className="relative mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 120 }}
            className="relative z-10"
          >
            <div className="bg-white rounded-full p-4 shadow-lg inline-block">
              <CheckCircle className="text-emerald-500 w-16 h-16 md:w-20 md:h-20" />
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
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-400 rounded-full w-24 h-24 md:w-28 md:h-28"
          />
        </div>

        {/* Success Message */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-700 mb-3">Thanh toán thành công!</h1>
          <p className="text-lg text-emerald-600 mb-2">
            Cảm ơn bạn đã mua hàng. Chúng tôi sẽ xử lý đơn hàng của bạn ngay lập tức.
          </p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-xl mb-8 text-left border border-emerald-100"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Chi tiết đơn hàng</h2>
              <p className="text-gray-500">Xem thông tin đơn hàng của bạn</p>
            </div>
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full font-medium">Đã xác nhận</div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-emerald-50 p-2 rounded-lg mr-4">
                <Package className="text-emerald-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Mã đơn hàng</p>
                <p className="font-medium text-gray-800">{orderId}</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-emerald-50 p-2 rounded-lg mr-4">
                <Mail className="text-emerald-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Email</p>
                <p className="font-medium text-gray-800">{customerEmail}</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-emerald-50 p-2 rounded-lg mr-4">
                <CreditCard className="text-emerald-600 w-5 h-5" />
              </div>
              <div>
                <p className="text-gray-500 text-sm">Tổng thanh toán</p>
                <p className="font-medium text-gray-800">{amount}</p>
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Trạng thái đơn hàng</h3>

          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-emerald-100 z-0"></div>

            <div className="relative z-10 flex mb-6">
              <div className="bg-emerald-500 rounded-full w-8 h-8 flex items-center justify-center text-white">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-800">Đã xác nhận thanh toán</p>
                <p className="text-sm text-gray-500">{orderDate}</p>
              </div>
            </div>

            <div className="relative z-10 flex mb-6">
              <div className="bg-emerald-100 text-emerald-500 rounded-full w-8 h-8 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-800">Đang chuẩn bị hàng</p>
                <p className="text-sm text-gray-500">Đơn hàng đang được xử lý</p>
              </div>
            </div>

            <div className="relative z-10 flex">
              <div className="bg-emerald-100 text-emerald-500 rounded-full w-8 h-8 flex items-center justify-center">
                <Home className="w-5 h-5" />
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-800">Dự kiến giao hàng</p>
                <p className="text-sm text-gray-500">{estimatedDelivery}</p>
              </div>
            </div>
          </div>
        </motion.div>

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
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Quay về trang chủ
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white text-emerald-600 border border-emerald-200 px-8 py-3 rounded-xl hover:bg-emerald-50 transition shadow-md flex items-center justify-center"
          >
            Theo dõi đơn hàng
            <ArrowRight className="w-5 h-5 ml-2" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
