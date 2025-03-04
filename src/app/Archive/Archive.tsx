import React, { useState } from 'react';
import { Package, RefreshCcw, Clock, CheckCircle, Truck, MapPin, X } from 'lucide-react';
import Card from '../../components/ui/Card';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'refunded' | 'cancelled';
  items: OrderItem[];
  total: number;
  tracking?: {
    number: string;
    status: string;
    updates: {
      status: string;
      date: string;
      location: string;
    }[];
  };
}

const Archive = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  // Mock orders data
  const orders: Order[] = [
    {
      id: '123456',
      date: '2024-03-15',
      status: 'processing',
      total: 129.99,
      items: [
        {
          name: 'Nike Air Max',
          quantity: 1,
          price: 129.99,
          image: 'https://placehold.co/100x100'
        }
      ]
    },
    {
      id: '123457',
      date: '2024-03-14',
      status: 'shipped',
      total: 199.99,
      items: [
        {
          name: 'Adidas Ultraboost',
          quantity: 1,
          price: 199.99,
          image: 'https://placehold.co/100x100'
        }
      ],
      tracking: {
        number: 'TRK123456',
        status: 'In Transit',
        updates: [
          {
            status: 'Out for Delivery',
            date: '2024-03-15',
            location: 'Local Distribution Center'
          }
        ]
      }
    }
  ];

  const canRefund = (order: Order) => {
    return ['processing', 'shipped', 'delivered'].includes(order.status) &&
           new Date().getTime() - new Date(order.date).getTime() < 30 * 24 * 60 * 60 * 1000; // 30 days
  };

  const handleRefundRequest = (order: Order) => {
    setSelectedOrder(order);
    setShowRefundForm(true);
  };

  const submitRefund = () => {
    if (!selectedOrder || !refundReason) return;
    
    // Here you would typically make an API call to process the refund
    console.log('Processing refund for order:', selectedOrder.id, 'Reason:', refundReason);
    
    setShowRefundForm(false);
    setSelectedOrder(null);
    setRefundReason('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

        {/* Order Tracking Section */}
        <Card className="mb-6">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Track Your Order</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
                Track
              </button>
            </div>
          </div>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium">Order #{order.id}</h3>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-600' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    {canRefund(order) && (
                      <button
                        onClick={() => handleRefundRequest(order)}
                        className="text-sm text-blue-600 hover:text-blue-700 underline"
                      >
                        Request Refund
                      </button>
                    )}
                  </div>
                </div>
                <div className="border-t pt-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-right font-medium">
                      Total: ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Refund Form Modal */}
        {showRefundForm && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Request Refund</h2>
                  <button
                    onClick={() => setShowRefundForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Order #{selectedOrder.id}</p>
                  <p className="text-sm text-gray-600">
                    Placed on {new Date(selectedOrder.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Refund
                    </label>
                    <select
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a reason</option>
                      <option value="wrong_size">Wrong Size</option>
                      <option value="damaged">Item Damaged</option>
                      <option value="not_as_described">Not as Described</option>
                      <option value="changed_mind">Changed Mind</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowRefundForm(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitRefund}
                      disabled={!refundReason}
                      className={`px-4 py-2 rounded-lg ${
                        refundReason
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Submit Refund Request
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Archive; 