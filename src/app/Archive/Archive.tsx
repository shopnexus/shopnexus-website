import React from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  id: string;
  date: string;
  status: string;
  total: number;
  items: OrderItem[];
  tracking?: {
    status: string;
    localNow: string;
    time_remaining: string;
    description?: string;
  };
}

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
        image: 'https://placehold.co/100x100',
      },
    ],
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
        image: 'https://placehold.co/100x100',
      },
    ],
    tracking: {
      status: 'shipped',
      localNow: 'HaNoi',
      time_remaining: '50 hours',
      description: 'ahihi',
    },
  },
];

const Archive = () => {
  return (
    <div>
      <h1>Order Archive</h1>
      <ul>
        {orders.map((order) => (
          <li key={order.id} style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>
            <h2>Order ID: {order.id}</h2>
            <p>Date: {order.date}</p>
            <p>Status: {order.status}</p>
            <p>Total: ${order.total}</p>
            <ul>
              {order.items.map((item, index) => (
                <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
                  <img src={item.image} alt={item.name} width="50" height="50" style={{ marginRight: '10px' }} />
                  <p>
                    {item.name} - {item.quantity} x ${item.price}
                  </p>
                </li>
              ))}
            </ul>
            {order.tracking && (
              <div>
                <h3>Tracking Info</h3>
                <p>Status: {order.tracking.status}</p>
                <p>Location: {order.tracking.localNow}</p>
                <p>Time Remaining: {order.tracking.time_remaining}</p>
                {order.tracking.description && <p>Description: {order.tracking.description}</p>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Archive;
