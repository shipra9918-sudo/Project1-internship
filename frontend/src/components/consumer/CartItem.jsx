import { Trash2 } from 'lucide-react';
import { useCartStore } from '../../context/cartStore';

const CartItem = ({ item }) => {
  const { removeItem, updateQuantity } = useCartStore();

  const handleIncrement = () => {
    updateQuantity(item.menuItem, item.quantity + 1);
  };

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.menuItem, item.quantity - 1);
    } else {
      removeItem(item.menuItem);
    }
  };

  const handleRemove = () => {
    removeItem(item.menuItem);
  };

  return (
    <div className="flex items-center space-x-4 py-4 border-b border-gray-200">
      {/* Item Image */}
      {item.image && (
        <img
          src={item.image}
          alt={item.name}
          className="w-20 h-20 rounded-lg object-cover"
        />
      )}

      {/* Item Details */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{item.name}</h3>
        <p className="text-green-600 font-bold">${item.price.toFixed(2)}</p>
        
        {/* Quantity Controls */}
        <div className="flex items-center space-x-3 mt-2">
          <button
            onClick={handleDecrement}
            className="flex items-center justify-center h-8 w-8 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            -
          </button>
          <span className="font-semibold text-gray-900 w-8 text-center">
            {item.quantity}
          </span>
          <button
            onClick={handleIncrement}
            className="flex items-center justify-center h-8 w-8 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Total & Remove */}
      <div className="text-right">
        <p className="font-bold text-gray-900 text-lg">
          ${(item.price * item.quantity).toFixed(2)}
        </p>
        <button
          onClick={handleRemove}
          className="flex items-center justify-center text-red-600 hover:text-red-800 mt-2"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
