import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Package, DollarSign, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../services/api';

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);


  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch restaurant data
      const restaurantRes = await api.get('/restaurants/my-restaurant');
      setRestaurant(restaurantRes.data.data.restaurant);

      // Fetch orders
      const ordersRes = await api.get('/orders/merchant-orders');
      const ordersData = ordersRes.data.data.orders;
      setOrders(ordersData);

      // Calculate stats
      const totalOrders = ordersData.length;
      const totalRevenue = ordersData.reduce((sum, order) => sum + (order.pricing?.total || 0), 0);
      const pendingOrders = ordersData.filter(o => o.status === 'pending').length;
      const completedOrders = ordersData.filter(o => ['delivered', 'completed'].includes(o.status)).length;

      setStats({ totalOrders, totalRevenue, pendingOrders, completedOrders });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Merchant Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your restaurant and orders</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <Package className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingOrders}</p>
              </div>
              <Clock className="h-12 w-12 text-orange-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedOrders}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
        </div>

        {/* Restaurant Info */}
        {restaurant && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Restaurant Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{restaurant.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cuisine Type</p>
                  <p className="font-medium">{restaurant.cuisineType.join(', ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{restaurant.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    restaurant.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {restaurant.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
            {orders.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No orders yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order._id.slice(-6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customer?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.items.length} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${(order.pricing?.total || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            ['accepted', 'confirmed'].includes(order.status) ? 'bg-blue-100 text-blue-800' :
                            order.status === 'preparing' ? 'bg-purple-100 text-purple-800' :
                            ['ready', 'dispatched', 'in_transit'].includes(order.status) ? 'bg-indigo-100 text-indigo-800' :
                            ['delivered', 'completed'].includes(order.status) ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => updateOrderStatus(order._id, 'accepted')}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Accept
                              </button>
                            )}
                            {order.status === 'accepted' && (
                              <button
                                onClick={() => updateOrderStatus(order._id, 'preparing')}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                Start Preparing
                              </button>
                            )}
                            {order.status === 'preparing' && (
                              <button
                                onClick={() => updateOrderStatus(order._id, 'ready')}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Mark Ready
                              </button>
                            )}
                            {order.status !== 'delivered' && order.status !== 'completed' && order.status !== 'cancelled' && (
                              <button
                                onClick={() => updateOrderStatus(order._id, 'cancelled')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantDashboard;
