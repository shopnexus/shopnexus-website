import { useState, useEffect } from 'react';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import { BarChart, Users, ShoppingBag, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
  });

  useEffect(() => {
    // TODO: Fetch real stats from your backend
    setStats({
      totalSales: 15000,
      totalOrders: 150,
      totalCustomers: 120,
      averageOrderValue: 100,
    });
  }, []);

  const statCards = [
    {
      title: 'Total Sales',
      value: `$${stats.totalSales.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      color: 'text-blue-600',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: 'text-purple-600',
    },
    {
      title: 'Average Order Value',
      value: `$${stats.averageOrderValue.toLocaleString()}`,
      icon: BarChart,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardBody className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.title}</p>
                <p className="text-xl font-semibold">{stat.value}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Recent Orders</h2>
          </CardHeader>
          <CardBody>
            {/* TODO: Add recent orders table */}
            <p className="text-gray-500">No recent orders to display</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Top Products</h2>
          </CardHeader>
          <CardBody>
            {/* TODO: Add top products list */}
            <p className="text-gray-500">No top products to display</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;