import { Star, Clock, DollarSign, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link
      to={`/restaurant/${restaurant._id}`}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {/* Cover Image */}
      <div className="relative h-48">
        {restaurant.coverImage ? (
          <img
            src={restaurant.coverImage}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-orange-400 to-red-500" />
        )}
        {!restaurant.isOpen && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Closed
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900">{restaurant.name}</h3>
          <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded">
            <Star className="h-4 w-4 text-green-600 fill-current" />
            <span className="font-bold text-green-800">
              {restaurant.rating?.average?.toFixed(1) || 'N/A'}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {restaurant.description}
        </p>

        {/* Cuisine Types */}
        <div className="flex flex-wrap gap-2 mb-3">
          {restaurant.cuisineType?.slice(0, 3).map((cuisine, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded capitalize"
            >
              {cuisine}
            </span>
          ))}
        </div>

        {/* Info Row */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              {restaurant.priceRange}
            </span>
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {restaurant.estimatedDeliveryTime || '30-45'} min
            </span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            {(restaurant.distance / 1000).toFixed(1)} km
          </div>
        </div>

        {/* Additional Info */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Delivery: ${restaurant.deliveryFee?.toFixed(2) || '0.00'}</span>
          <span>Min: ${restaurant.minimumOrder?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
