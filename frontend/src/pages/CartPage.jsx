import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCartStore } from '../context/cartStore';
import { useAuthStore } from '../context/authStore';

const CartPage = () => {
  const { items, restaurant, total, updateQuantity, removeItem, clearCart } = useCartStore();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Add items from restaurants to get started</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Browse Restaurants
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{restaurant?.name}</h2>
        
        {items.map(item => (
          <div key={item.menuItem} className="flex items-center justify-between py-4 border-b">
            <div className="flex-1">
              <h3 className="font-semibold">{item.name}</h3>
              <p className="text-gray-600">${item.price.toFixed(2)}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => updateQuantity(item.menuItem, item.quantity - 1)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.menuItem, item.quantity + 1)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <button
                onClick={() => removeItem(item.menuItem)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
        
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-lg">
            <span>Subtotal:</span>
            <span className="font-semibold">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg">
            <span>Delivery Fee:</span>
            <span className="font-semibold">${restaurant?.deliveryFee?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between text-xl font-bold border-t pt-2">
            <span>Total:</span>
            <span>${(total + (restaurant?.deliveryFee || 0)).toFixed(2)}</span>
          </div>
        </div>
        
        <div className="mt-6 flex space-x-4">
          <button onClick={clearCart} className="btn-secondary flex-1">
            Clear Cart
          </button>
          <button onClick={() => navigate('/checkout')} className="btn-primary flex-1">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
