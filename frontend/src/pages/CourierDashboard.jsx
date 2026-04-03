import { useState, useEffect } from 'react';
import { Truck, MapPin, DollarSign, CheckCircle, Clock, Navigation, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../services/api';

const CourierDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [deliveries, setDeliveries] = useState([]);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    earnings: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0
  });

  useEffect(() => {
    fetchCourierData();
  }, []);

  const fetchCourierData = async () => {
    try {
      setLoading(true);
      
      // Get courier profile
      const profileRes = await api.get('/auth/me');
      const userData = profileRes.data.data.user;
      setIsAvailable(userData.courierProfile?.isAvailable || false);

      // Fetch assigned deliveries
      const deliveriesRes = await api.get('/orders/courier-deliveries');
      const deliveriesData = deliveriesRes.data.data.orders;
      setDeliveries(deliveriesData);

      // Calculate stats
      const totalDeliveries = userData.courierProfile?.totalDeliveries || 0;
      const earnings = userData.courierProfile?.earnings || 0;
      const pendingDeliveries = deliveriesData.filter(o => !['delivered', 'completed', 'cancelled'].includes(o.status)).length;
      const completedDeliveries = deliveriesData.filter(o => ['delivered', 'completed'].includes(o.status)).length;

      setStats({ totalDeliveries, earnings, pendingDeliveries, completedDeliveries });
    } catch (error) {
      console.error('Error fetching courier data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    try {
      await api.put('/auth/courier/availability', { isAvailable: !isAvailable });
      setIsAvailable(!isAvailable);
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };
 
  const acceptDelivery = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/accept-delivery`);
      fetchCourierData();
    } catch (error) {
      console.error('Error accepting delivery:', error);
    }
  };
 

  const completeDelivery = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/complete-delivery`);
      fetchCourierData();
    } catch (error) {
      console.error('Error completing delivery:', error);
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Courier Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your deliveries and earnings</p>
            </div>
            <button
              onClick={toggleAvailability}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isAvailable ? (
                <>
                  <ToggleRight className="h-6 w-6" />
                  <span>Available</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="h-6 w-6" />
                  <span>Unavailable</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Deliveries</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDeliveries}</p>
              </div>
              <Truck className="h-12 w-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-green-600">${stats.earnings.toFixed(2)}</p>
              </div>
              <DollarSign className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Deliveries</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingDeliveries}</p>
              </div>
              <Clock className="h-12 w-12 text-orange-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedDeliveries}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
        </div>

        {/* Available Deliveries */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Available Deliveries</h2>
            {deliveries.filter(d => d.status === 'ready').length === 0 ? (
              <p className="text-gray-600 text-center py-8">No available deliveries at the moment</p>
            ) : (
              <div className="space-y-4">
                {deliveries.filter(d => d.status === 'ready').map((delivery) => (
                  <div key={delivery._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-semibold text-gray-900">Order #{delivery._id.slice(-6)}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          <MapPin className="inline h-4 w-4 mr-1" />
                          {delivery.deliveryAddress.street}, {delivery.deliveryAddress.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">${(delivery.pricing?.deliveryFee || 0).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Delivery Fee</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Navigation className="h-4 w-4 mr-1" />
                          {delivery.items.length} items
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {delivery.preparationTime || 20} mins
                        </span>
                      </div>
                      <button
                        onClick={() => acceptDelivery(delivery._id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Accept Delivery
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Deliveries */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Active Deliveries</h2>
            {deliveries.filter(d => ['dispatched', 'in_transit'].includes(d.status)).length === 0 ? (
              <p className="text-gray-600 text-center py-8">No active deliveries</p>
            ) : (
              <div className="space-y-6">
                {deliveries.filter(d => ['dispatched', 'in_transit'].includes(d.status)).map((delivery) => (
                  <div key={delivery._id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          delivery.status === 'dispatched' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {delivery.status.replace('-', ' ')}
                        </span>
                        <p className="text-xl font-bold text-gray-900 mt-2">Order #{delivery.orderNumber?.slice(-6) || delivery._id.slice(-6)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">${(delivery.pricing?.deliveryFee || 0).toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Your Earning</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Pickup</h3>
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium">{delivery.restaurant?.name}</p>
                            <p className="text-sm text-gray-600">{delivery.restaurant?.address?.street}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Drop-off</h3>
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="font-medium">{delivery.customer?.name || delivery.user?.name}</p>
                            <p className="text-sm text-gray-600">{delivery.deliveryAddress.street}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      {delivery.status === 'dispatched' ? (
                        <button
                          onClick={() => api.put(`/orders/${delivery._id}/status`, { status: 'in_transit' }).then(fetchCourierData)}
                          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                        >
                          Start Delivery
                        </button>
                      ) : (
                        <button
                          onClick={() => completeDelivery(delivery._id)}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourierDashboard;
