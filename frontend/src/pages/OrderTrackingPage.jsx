import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Clock, MapPin, Phone, CheckCircle, Truck } from 'lucide-react';
import api from '../services/api';

const OrderTrackingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [courier, setCourier] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}`);
      const orderData = response.data.data.order;
      setOrder(orderData);
      
      // Fetch courier info if assigned (courier is already populated in getOrder)
      if (orderData.courier) {
        setCourier(orderData.courier);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    const steps = ['pending', 'accepted', 'preparing', 'ready', 'dispatched', 'in_transit', 'delivered', 'completed'];
    const index = steps.indexOf(status);
    return index === -1 ? 0 : index;
  };

  const currentStep = order ? getStatusStep(order.status) : 0;

  const statusLabels = [
    { label: 'Pending', icon: Package },
    { label: 'Accepted', icon: CheckCircle },
    { label: 'Preparing', icon: Clock },
    { label: 'Ready', icon: Package },
    { label: 'In Transit', icon: Truck },
    { label: 'Delivered', icon: CheckCircle }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/orders')}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back to Orders
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Track Your Order</h1>
          <p className="text-gray-600 mt-1">Order #{order.orderNumber?.slice(-6) || order._id.slice(-6)}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Status Timeline */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
              
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200">
                  <div 
                    className="w-full bg-green-500 transition-all duration-500"
                    style={{ height: `${(currentStep / (statusLabels.length - 1)) * 100}%` }}
                  />
                </div>

                {/* Status Steps */}
                <div className="space-y-8 relative">
                  {statusLabels.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index <= currentStep;
                    const isCurrent = index === currentStep;

                    return (
                      <div key={step.label} className="flex items-start space-x-4">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-200'
                        }`}>
                          <Icon className={`h-5 w-5 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                          {isCurrent && (
                            <p className="text-sm text-blue-600 mt-1">
                              {['dispatched', 'in_transit'].includes(order.status) ? 'Courier is on the way!' : 'In progress...'}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Address</h2>
              <div className="flex items-start space-x-3">
                <MapPin className="h-6 w-6 text-gray-400 mt-1" />
                <div>
                  <p className="text-gray-900">{order.deliveryAddress?.street || 'N/A'}</p>
                  <p className="text-gray-600">
                    {order.deliveryAddress?.city || ''}, {order.deliveryAddress?.state || ''} {order.deliveryAddress?.zipCode || ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Details</h2>
              
              {/* Items */}
              <div className="space-y-4 mb-6">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{item.name || 'Item'}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${order.pricing?.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                {order.pricing?.deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>${order.pricing.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>${order.pricing?.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>

            {/* Courier Info */}
            {courier && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Your Courier</h2>
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{courier.name}</p>
                    <p className="text-sm text-gray-600">Courier</p>
                  </div>
                </div>
                <a
                  href={`tel:${courier.phone}`}
                  className="mt-4 flex items-center justify-center space-x-2 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  <Phone className="h-5 w-5" />
                  <span>Call Courier</span>
                </a>
              </div>
            )}

            {/* Estimated Time */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <div className="flex items-center space-x-3">
                <Clock className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Estimated Delivery Time</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {order.estimatedDeliveryTime || '30-45'} mins
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
