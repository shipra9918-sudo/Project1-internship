import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin, Phone, DollarSign, Plus, Minus, ShoppingCart } from 'lucide-react';
import api from '../services/api';
import { useCartStore } from '../context/cartStore';
import toast from 'react-hot-toast';

const RestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addItem, removeItem, getItemQuantity } = useCartStore();

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/restaurants/${id}`);
      setRestaurant(response.data.data.restaurant);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      toast.error('Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (menuItem) => {
    addItem({
      menuItem: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      image: menuItem.image,
      restaurantId: restaurant._id,
      restaurantName: restaurant.name
    });
    toast.success(`${menuItem.name} added to cart!`);
  };

  const handleRemoveFromCart = (menuItem) => {
    removeItem(menuItem._id);
    toast.success(`${menuItem.name} removed from cart`);
  };

  const categories = ['all', ...new Set(restaurant?.menu?.map(item => item.category))];
  
  const filteredMenu = selectedCategory === 'all'
    ? restaurant?.menu
    : restaurant?.menu?.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Restaurant not found</h2>
          <button
            onClick={() => navigate('/home')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Restaurant Header */}
      <div className="relative h-64 md:h-80">
        {restaurant.coverImage ? (
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-orange-400 to-red-500" />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-1" />
                {restaurant.rating?.average?.toFixed(1) || 'N/A'} ({restaurant.rating?.count || 0} reviews)
              </span>
              <span className="flex items-center">
                <DollarSign className="h-5 w-5 mr-1" />
                {restaurant.priceRange}
              </span>
              <span className="flex items-center">
                <Clock className="h-5 w-5 mr-1" />
                {restaurant.estimatedDeliveryTime || '30-45'} mins
              </span>
            </div>
            <p className="mt-2 text-gray-200">{restaurant.description}</p>
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {restaurant.address?.street}, {restaurant.address?.city}
              </span>
              <span className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                {restaurant.phone}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                restaurant.isOpen 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {restaurant.isOpen ? 'Open Now' : 'Closed'}
              </span>
              <span className="text-xs text-gray-600">
                Delivery: ${restaurant.deliveryFee?.toFixed(2) || '0.00'}
              </span>
              <span className="text-xs text-gray-600">
                Min: ${restaurant.minimumOrder?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Menu Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
              <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-lg capitalize ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                    {category !== 'all' && (
                      <span className="text-xs ml-2 opacity-75">
                        ({restaurant.menu.filter(m => m.category === category).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {selectedCategory === 'all' ? 'Full Menu' : selectedCategory}
              </h2>
              <p className="text-gray-600 mt-1">
                {filteredMenu?.length || 0} items available
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMenu?.map((item) => {
                const quantity = getItemQuantity(item._id);
                
                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900">{item.name}</h3>
                        <p className="font-bold text-green-600">${item.price.toFixed(2)}</p>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                      )}

                      <div className="flex items-center space-x-2 mb-3">
                        {item.dietary?.vegetarian && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            Veg
                          </span>
                        )}
                        {item.dietary?.vegan && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            Vegan
                          </span>
                        )}
                        {item.dietary?.glutenFree && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            GF
                          </span>
                        )}
                        {item.preparationTime && (
                          <span className="text-xs text-gray-600 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.preparationTime} min
                          </span>
                        )}
                      </div>

                      {/* Add to Cart Controls */}
                      {quantity > 0 ? (
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleRemoveFromCart(item)}
                            className="flex items-center justify-center h-10 w-10 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                          >
                            <Minus className="h-5 w-5" />
                          </button>
                          <span className="text-lg font-bold text-gray-900">{quantity}</span>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="flex items-center justify-center h-10 w-10 rounded-lg bg-green-100 text-green-600 hover:bg-green-200"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={!item.isAvailable}
                          className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 ${
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
              })}
            </div>

            {(!filteredMenu || filteredMenu.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-600">No items in this category</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      <FloatingCartButton onCheckout={() => navigate('/cart')} />
    </div>
  );
};

// Floating Cart Button Component
const FloatingCartButton = ({ onCheckout }) => {
  const { getItemCount, getTotalPrice } = useCartStore();
  const itemCount = getItemCount();

  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <button
        onClick={onCheckout}
        className="bg-blue-600 text-white px-8 py-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center space-x-4"
      >
        <div className="flex items-center space-x-2">
          <ShoppingCart className="h-6 w-6" />
          <span className="font-bold text-lg">{itemCount} items</span>
        </div>
        <div className="border-l border-white pl-4">
          <span className="font-bold text-xl">${getTotalPrice().toFixed(2)}</span>
        </div>
      </button>
    </div>
  );
};

export default RestaurantPage;
