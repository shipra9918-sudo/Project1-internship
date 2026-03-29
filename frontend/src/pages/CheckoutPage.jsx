import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../context/cartStore';
import { orderAPI, paymentAPI } from '../services/api';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const { items, restaurant, total, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    orderType: 'delivery',
    paymentMethod: 'credit_card',
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    }
  });


  
  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create order
      const orderResponse = await orderAPI.create({
        restaurantId: restaurant._id,
        items: items.map(item => ({
          menuItem: item.menuItem,
          quantity: item.quantity,
          specialInstructions: ''
        })),
        orderType: formData.orderType,
        deliveryAddress: formData.orderType === 'delivery' ? formData.deliveryAddress : undefined,
        paymentMethod: formData.paymentMethod
      });

      const order = orderResponse.data.data.order;

      // Process payment
      const paymentResponse = await paymentAPI.checkout({
        orderId: order._id,
        paymentMethod: formData.paymentMethod,
        cardNumber: '4111111111111111' // Mock card number
      });

      if (paymentResponse.data.success) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate(`/order/${order._id}/tracking`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <form onSubmit={handleCheckout} className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Order Type</h2>
          <select
            value={formData.orderType}
            onChange={(e) => setFormData({...formData, orderType: e.target.value})}
            className="input-field"
          >
            <option value="delivery">Delivery</option>
            <option value="takeout">Takeout</option>
          </select>
        </div>

        {formData.orderType === 'delivery' && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Street Address"
                required
                value={formData.deliveryAddress.street}
                onChange={(e) => setFormData({
                  ...formData,
                  deliveryAddress: {...formData.deliveryAddress, street: e.target.value}
                })}
                className="input-field"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  required
                  value={formData.deliveryAddress.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    deliveryAddress: {...formData.deliveryAddress, city: e.target.value}
                  })}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="State"
                  required
                  value={formData.deliveryAddress.state}
                  onChange={(e) => setFormData({
                    ...formData,
                    deliveryAddress: {...formData.deliveryAddress, state: e.target.value}
                  })}
                  className="input-field"
                />
              </div>
              <input
                type="text"
                placeholder="ZIP Code"
                required
                value={formData.deliveryAddress.zipCode}
                onChange={(e) => setFormData({
                  ...formData,
                  deliveryAddress: {...formData.deliveryAddress, zipCode: e.target.value}
                })}
                className="input-field"
              />
            </div>
          </div>
        )}

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
            className="input-field"
          >
            <option value="credit_card">Credit Card</option>
            <option value="debit_card">Debit Card</option>
            <option value="cash">Cash on Delivery</option>
          </select>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.menuItem} className="flex justify-between">
                <span>{item.quantity}x {item.name}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 text-lg"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
