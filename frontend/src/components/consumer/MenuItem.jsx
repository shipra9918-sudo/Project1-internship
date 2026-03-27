import { useState } from 'react';
import { Plus, Minus, ShoppingCart, Clock } from 'lucide-react';
import { useCartStore } from '../../context/cartStore';

const MenuItem = ({ item, restaurantId, restaurantName }) => {
  const [quantity, setQuantity] = useState(0);
  const { addItem, removeItem } = useCartStore();

  const handleAddToCart = () => {
    if (!item.isAvailable) return;
    
    addItem({
      menuItem: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      restaurantId,
      restaurantName
    });
    setQuantity(prev => prev + 1);
  };

  const handleRemoveFromCart = () => {
    if (quantity <= 0) return;
    
    removeItem(item._id);
    setQuantity(prev => prev - 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Item Image */}
      {item.image && (
        <div className="relative h-40">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold">
                Unavailable
              </span>
            </div>
          )}
        </div>
      )}

      {/* Item Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-900">{item.name}</h3>
          <span className="font-bold text-green-600">${item.price.toFixed(2)}</span>
        </div>

        {item.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Dietary Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {item.dietary?.vegetarian && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
              Vegetarian
            </span>
          )}
          {item.dietary?.vegan && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
              Vegan
            </span>
          )}
          {item.dietary?.glutenFree && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              Gluten Free
            </span>
          )}
          {item.dietary?.spicy && (
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
              Spicy
            </span>
          )}
        </div>

        {/* Prep Time */}
        {item.preparationTime && (
          <div className="flex items-center text-xs text-gray-600 mb-4">
            <Clock className="h-3 w-3 mr-1" />
            {item.preparationTime} min prep time
          </div>
        )}

        {/* Quantity Controls */}
        {quantity > 0 ? (
          <div className="flex items-center justify-between bg-blue-50 rounded-lg p-2">
            <button
              onClick={handleRemoveFromCart}
              className="flex items-center justify-center h-8 w-8 rounded bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-bold text-gray-900 text-lg">{quantity}</span>
            <button
              onClick={handleAddToCart}
              disabled={!item.isAvailable}
              className="flex items-center justify-center h-8 w-8 rounded bg-green-100 text-green-600 hover:bg-green-200 transition-colors disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={!item.isAvailable}
            className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors ${
              item.isAvailable
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>{item.isAvailable ? 'Add to Cart' : 'Unavailable'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MenuItem;
