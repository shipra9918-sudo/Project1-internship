import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-200 select-none">404</h1>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Oops! Page not found
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            The page you're looking for seems to have wandered off into the digital void.
          </p>
          <p className="text-sm text-gray-500">
            Don't worry, even the best delivery orders get lost sometimes!
          </p>
        </div>

        {/* Illustration */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl">
              <Search className="w-16 h-16 text-white opacity-80" />
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <span className="text-2xl">🤔</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5" />
            <span>Back to Home</span>
          </button>

          <button
            onClick={() => navigate('/restaurants')}
            className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Search className="w-5 h-5" />
            <span>Browse Restaurants</span>
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Popular Pages:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <button
              onClick={() => navigate('/login')}
              className="text-red-600 hover:text-red-700 hover:underline"
            >
              Login
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate('/register')}
              className="text-red-600 hover:text-red-700 hover:underline"
            >
              Sign Up
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate('/pricing')}
              className="text-red-600 hover:text-red-700 hover:underline"
            >
              Pricing
            </button>
            <span className="text-gray-300">•</span>
            <button
              onClick={() => navigate('/profile')}
              className="text-red-600 hover:text-red-700 hover:underline"
            >
              Profile
            </button>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-xs text-gray-400">
          <p>Lost? Need help?</p>
          <p className="mt-1">
            Contact support at{' '}
            <a href="mailto:support@hospitality.com" className="text-red-600 hover:underline">
              support@hospitality.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
