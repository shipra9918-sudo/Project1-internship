import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Clock, Store } from 'lucide-react';
import { restaurantAPI } from '../services/api';
import toast from 'react-hot-toast';

const HomePage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    cuisineType: '',
    minRating: '',
    priceRange: ''
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Get user's location and fetch nearby restaurants
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchRestaurants(position.coords.longitude, position.coords.latitude);
          },
          () => {
            // Default location if permission denied
            fetchRestaurants(-74.006, 40.7128); // New York
          }
        );
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filters, searchTerm]);

  const fetchRestaurants = async (longitude, latitude) => {
    setLoading(true);
    try {
      const apiMethod = searchTerm ? restaurantAPI.search : restaurantAPI.discover;
      const params = {
        longitude,
        latitude,
        maxDistance: 10000,
        ...filters
      };
      
      if (searchTerm) {
        params.keyword = searchTerm;
      }

      const response = await apiMethod(params);
      setRestaurants(response.data.data.restaurants);
    } catch (error) {
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discover Amazing Food Near You
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Order from the best restaurants with real-time tracking
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for restaurants or cuisines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <select
          value={filters.cuisineType}
          onChange={(e) => setFilters({...filters, cuisineType: e.target.value})}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Cuisines</option>
          <option value="italian">Italian</option>
          <option value="chinese">Chinese</option>
          <option value="indian">Indian</option>
          <option value="mexican">Mexican</option>
          <option value="japanese">Japanese</option>
        </select>

        <select
          value={filters.minRating}
          onChange={(e) => setFilters({...filters, minRating: e.target.value})}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Ratings</option>
          <option value="4">4+ Stars</option>
          <option value="4.5">4.5+ Stars</option>
        </select>

        <select
          value={filters.priceRange}
          onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Prices</option>
          <option value="$">$ - Budget</option>
          <option value="$$">$$ - Moderate</option>
          <option value="$$$">$$$ - Expensive</option>
        </select>
      </div>

      {/* Restaurant Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-lg shadow-md h-64"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map(restaurant => (
            <Link
              key={restaurant._id}
              to={`/restaurant/${restaurant._id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="h-48 bg-gray-200 relative">
                {restaurant.coverImage ? (
                  <img
                    src={restaurant.coverImage}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-300">
                    <div className="text-center">
                      <Store className="h-12 w-12 mx-auto mb-2" />
                      <span className="text-sm font-medium">No Image</span>
                    </div>
                  </div>
                )}
                <span className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-semibold">
                  {restaurant.priceRange}
                </span>
              </div>
              
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {restaurant.name}
                </h3>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span>{restaurant.rating.average.toFixed(1)} ({restaurant.rating.count})</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{restaurant.estimatedDeliveryTime} min</span>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{restaurant.distanceInKm?.toFixed(1)} km away</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {restaurant.cuisineType.slice(0, 2).map(cuisine => (
                    <span key={cuisine} className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-600">
                      {cuisine}
                    </span>
                  ))}
                </div>

                {restaurant.deliveryFee > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Delivery: ${restaurant.deliveryFee.toFixed(2)}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && restaurants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No restaurants found nearby</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
