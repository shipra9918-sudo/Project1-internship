import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, LogOut, Store, MessageCircle, Shield } from 'lucide-react';
import { useAuthStore } from '../../context/authStore';
import { useCartStore } from '../../context/cartStore';
import Breadcrumb from './Breadcrumb';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'merchant') return '/merchant/dashboard';
    if (user?.role === 'courier') return '/courier/dashboard';
    return '/profile';
  };

  const showCart = user?.role === 'consumer' || user?.role === 'admin';

  // Hide navbar on certain pages
  const hideNavbarPages = ['/login', '/register', '/onboarding'];
  if (hideNavbarPages.includes(location.pathname)) {
    return null;
  }

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main Navbar */}
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <Store className="h-8 w-8 text-red-600" />
              <span className="text-xl font-bold text-gray-900">FoodHub</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  {/* Notification Bell */}
                  <NotificationBell />
                  
                  {showCart && (
                    <Link to="/cart" className="relative">
                      <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-red-600" />
                      {getItemCount() > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {getItemCount()}
                        </span>
                      )}
                    </Link>
                  )}

                  <Link to="/assistant" className="text-gray-700 hover:text-red-600 transition-colors" title="Assistant">
                    <MessageCircle className="h-6 w-6" />
                  </Link>

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className="text-gray-700 hover:text-red-600 transition-colors"
                      title="Admin"
                    >
                      <Shield className="h-6 w-6" />
                    </Link>
                  )}

                  {/* User Menu */}
                  <Link to={getDashboardLink()} className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium hidden md:inline">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-red-600 font-medium">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Breadcrumb Section (only on authenticated pages) */}
          {isAuthenticated && location.pathname !== '/' && (
            <div className="py-3 border-t border-gray-100">
              <Breadcrumb />
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
