import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useAuthStore } from '../../context/authStore';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { isAuthenticated, user } = useAuthStore();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Hospitality Platform</h3>
            <p className="text-sm text-gray-400 mb-4">
              Connecting restaurants, couriers, and customers in one seamless platform. 
              Quality food delivery made simple.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/restaurants" className="hover:text-white transition-colors">
                  Browse Restaurants
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* For Business — no public admin URLs; dashboards only when signed in */}
          <div>
            <h4 className="text-white font-semibold mb-4">For Business</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Register as restaurant owner
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Register as courier
                </Link>
              </li>
              {isAuthenticated && user?.role === 'merchant' && (
                <li>
                  <Link to="/merchant/dashboard" className="hover:text-white transition-colors">
                    Merchant dashboard
                  </Link>
                </li>
              )}
              {isAuthenticated && user?.role === 'courier' && (
                <li>
                  <Link to="/courier/dashboard" className="hover:text-white transition-colors">
                    Courier dashboard
                  </Link>
                </li>
              )}
              {isAuthenticated && user?.role === 'admin' && (
                <li>
                  <Link to="/admin/dashboard" className="hover:text-white transition-colors">
                    Admin console
                  </Link>
                </li>
              )}
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  Partner with us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>123 Food Street, Culinary City, FC 12345</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>support@hospitality.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {currentYear} Hospitality Platform. All rights reserved.
            </p>
            
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
