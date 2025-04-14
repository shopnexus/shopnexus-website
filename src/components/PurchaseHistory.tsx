// PurchaseHistory.tsx
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"

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
}

export interface Payment {
  id: string
  userId: string
  method: string
  status: string
  address: string
  total: string
  dateCreated: string
  products: PaymentProductItem[]
}

const dummyProducts: ProductInfor[] = [
  {
    id: "20",
    type: "5",
    brandId: "2",
    name: "Luxurious Granite Car",
    description: "The cyan Chips combines Trinidad and Tobago aesthetics with Roentgenium-based durability",
    listPrice: 395000,
    dateManufactured: "1730357904267",
    resources: ["https://picsum.photos/seed/0bOxh/800/600?blur=10"],
    tags: ["Games", "Jewelry", "Outdoors"],
  },
  {
    id: "21",
    type: "3",
    brandId: "1",
    name: "Incredible Wooden Keyboard",
    description: "Crafted from premium wood and powered by AI typing enhancements.",
    listPrice: 120000,
    dateManufactured: "1630357904267",
    resources: ["https://picsum.photos/seed/w0odkbd/800/600?grayscale"],
    tags: ["Electronics", "Office"],
  },
  {
    id: "22",
    type: "2",
    brandId: "3",
    name: "Sleek Steel Watch",
    description: "Stainless steel body with water-resistant features.",
    listPrice: 250000,
    dateManufactured: "1654357904267",
    resources: ["https://picsum.photos/seed/watch/800/600"],
    tags: ["Fashion", "Accessories"],
  },
]

const dummyPayments: Payment[] = [
  {
    id: "17",
    userId: "14",
    method: "PAYMENT_METHOD_VNPAY",
    status: "STATUS_SUCCESS",
    address: "123 Main St, City, Country",
    total: "1580000",
    dateCreated: "1744019502822",
    products: [
      {
        itemQuantity: {
          itemId: "20",
          quantity: "4",
        },
        serialIds: ["PYSIUFEKG8", "GPPBTJKXGD"],
        price: "395000",
        totalPrice: "1580000",
      },
    ],
  },
  {
    id: "18",
    userId: "15",
    method: "PAYMENT_METHOD_COD",
    status: "STATUS_PENDING",
    address: "456 Another St, Other City",
    total: "120000",
    dateCreated: "1733019502822",
    products: [
      {
        itemQuantity: {
          itemId: "21",
          quantity: "1",
        },
        serialIds: [],
        price: "120000",
        totalPrice: "120000",
      },
    ],
  },
  {
    id: "19",
    userId: "16",
    method: "PAYMENT_METHOD_MOMO",
    status: "STATUS_SUCCESS",
    address: "789 Third St, New Town",
    total: "250000",
    dateCreated: "1720019502822",
    products: [
      {
        itemQuantity: {
          itemId: "22",
          quantity: "1",
        },
        serialIds: [],
        price: "250000",
        totalPrice: "250000",
      },
    ],
  },
]

const formatDate = (timestamp: string) => {
  const date = new Date(parseInt(timestamp))
  return date.toLocaleDateString()
}

// Helper function to get status badge
const PaymentStatusBadge = ({ status }: { status: string }) => {
  let bgColor = "bg-gray-100"
  let textColor = "text-gray-700"
  let statusText = status

  switch (status) {
    case "STATUS_SUCCESS":
      bgColor = "bg-green-100"
      textColor = "text-green-800"
      statusText = "Success"
      break
    case "STATUS_PENDING":
      bgColor = "bg-yellow-100"
      textColor = "text-yellow-800"
      statusText = "Processing"
      break
    case "STATUS_FAILED":
      bgColor = "bg-red-100"
      textColor = "text-red-800"
      statusText = "Failed"
      break
    default:
      statusText = status.replace("STATUS_", "")
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {statusText}
    </span>
  )
}

// Helper function to format payment method
const formatPaymentMethod = (method: string) => {
  switch (method) {
    case "PAYMENT_METHOD_VNPAY":
      return "VNPay"
    case "PAYMENT_METHOD_COD":
      return "Cash on Delivery"
    case "PAYMENT_METHOD_MOMO":
      return "MoMo"
    default:
      return method.replace("PAYMENT_METHOD_", "")
  }
}

const PurchaseHistory: React.FC = () => {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const navigate = useNavigate()

  const handleViewPayment = (id: string) => {
    const payment = dummyPayments.find(p => p.id === id)
    if (payment) {
      setSelectedPayment(payment)
    }
  }

  const handleBuyProduct = () => {
	navigate("/")
  }

  const handleCloseDetail = () => {
    setSelectedPayment(null)
  }

  const handleReturn = (id: string) => {
    const payment = dummyPayments.find(p => p.id === id)
    if (!payment) return
  
    // Gắn thêm thông tin sản phẩm nếu cần
    const detailedProducts = payment.products.map(item => {
      const product = findProductById(item.itemQuantity.itemId)
      return {
        ...item,
        productInfo: product || null,
      }
    })
  
    navigate('/refund', {
      state: {
        paymentId: payment.id,
        paymentInfo: {
          id: payment.id,
          method: payment.method,
          status: payment.status,
          address: payment.address,
          total: payment.total,
          dateCreated: payment.dateCreated,
        },
        products: detailedProducts,
      },
    })
  }

  const findProductById = (id: string) => {
    return dummyProducts.find(p => p.id === id)
  }

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-blue-50 to-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">
          Purchase History
        </h1>

        {dummyPayments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <p className="text-gray-600 text-lg">No orders here</p>
            <button
				onClick={handleBuyProduct}
				className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
              Buy now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {dummyPayments.map((payment, index) => {
              const orderDate = formatDate(payment.dateCreated)
              
              return (
                <div
                  key={payment.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Header */}
                  <div className="bg-gray-50 px-4 py-3 flex flex-wrap items-center justify-between border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg font-semibold text-gray-800">
                        Oder #{payment.id}
                      </h2>
                      <PaymentStatusBadge status={payment.status} />
                    </div>
                    <div className="text-sm text-gray-500">
                      {orderDate}
                    </div>
                  </div>
                  
                  {/* Order Items */}
                  <div className="p-4">
                    {payment.products.map((item, idx) => {
                      const product = findProductById(item.itemQuantity.itemId)
                      if (!product) return null

                      return (
                        <div key={idx} className="flex flex-col md:flex-row gap-4 mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                          <div className="md:w-28 md:h-28 w-full h-48 flex-shrink-0">
                            <img
                              src={product.resources[0]}
                              alt={product.name}
                              className="w-full h-full object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-800">{product.name}</h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                            
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                              <p className="text-gray-700">
                                Quantity: <span className="font-medium">{item.itemQuantity.quantity}</span>
                              </p>
                              <p className="text-gray-700">
                                Unit price: <span className="text-blue-600 font-medium">
                                  {parseInt(item.price).toLocaleString()} ₫
                                </span>
                              </p>
                              <p className="col-span-2 mt-1">
                                <span className="text-gray-700">Total:</span>{" "}
                                <span className="text-red-600 font-semibold">
                                  {parseInt(item.totalPrice).toLocaleString()} ₫
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Actions */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
                    <button
                      onClick={() => handleViewPayment(payment.id)}
                      className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded-lg shadow-sm transition-all duration-200 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      Detail
                    </button>
                    <button
                      onClick={() => handleReturn(payment.id)}
                      className="cursor-pointer bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-4 rounded-lg shadow-sm transition-all duration-200 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"></path>
                      </svg>
                      Return/ Refund
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div 
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-800">
                Purchase Detail #{selectedPayment.id}
              </h2>
              <button
                onClick={handleCloseDetail}
                className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors p-1"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            {/* Order Information */}
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start">
                    <span className="text-gray-500 w-36">Purchase code:</span>
                    <span className="font-medium text-gray-800">{selectedPayment.id}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 w-36">Date order:</span>
                    <span className="font-medium text-gray-800">{formatDate(selectedPayment.dateCreated)}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 w-36">Method payment:</span>
                    <span className="font-medium text-gray-800">{formatPaymentMethod(selectedPayment.method)}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="text-gray-500 w-36">Status:</span>
                    <PaymentStatusBadge status={selectedPayment.status} />
                  </div>
                  <div className="flex items-start col-span-2">
                    <span className="text-gray-500 w-36">Address Shipping:</span>
                    <span className="font-medium text-gray-800">{selectedPayment.address}</span>
                  </div>
                </div>
              </div>
              
              {/* Order Items */}
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Product</h3>
              <div className="space-y-4 mb-6">
                {selectedPayment.products.map((item, idx) => {
                  const product = findProductById(item.itemQuantity.itemId)
                  if (!product) return null

                  return (
                    <div key={idx} className="flex gap-4 rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                      <img
                        src={product.resources[0] || "/default-product.png"}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-md border border-gray-200 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-800">{product.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                        
                        <div className="grid grid-cols-2 gap-x-4 text-sm">
                          <p className="text-gray-700">
                            Quantity: <span className="font-medium">{item.itemQuantity.quantity}</span>
                          </p>
                          <p className="text-gray-700">
                            Unit price: <span className="text-blue-600 font-medium">
                              {parseInt(item.price).toLocaleString()} ₫
                            </span>
                          </p>
                          
                          {item.serialIds.length > 0 && (
                            <div className="col-span-2 mt-2">
                              <p className="text-gray-700 font-medium mb-1">Mã serial:</p>
                              <div className="flex flex-wrap gap-2">
                                {item.serialIds.map((serial, i) => (
                                  <span key={i} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                    {serial}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-auto text-right">
                        <p className="text-sm font-medium text-gray-500">Total</p>
                        <p className="text-lg font-semibold text-red-600">
                          {parseInt(item.totalPrice).toLocaleString()} ₫
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              {/* Order Total */}
              <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                <span className="text-lg font-medium text-gray-700">Total:</span>
                <span className="text-2xl font-bold text-red-600">
                  {parseInt(selectedPayment.total).toLocaleString()} ₫
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
              <button
                onClick={() => {
                  handleReturn(selectedPayment.id);
                  handleCloseDetail();
                }}
                className="cursor-pointer bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"></path>
                </svg>
                Return/ Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PurchaseHistory