import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  Users, 
  Check, 
  ArrowRight,
  Star,
  MapPin,
  CreditCard,
  BarChart3,
  Smartphone,
  Globe
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const handleGetStarted = () => {
    navigate('/register');
  };

  const features = [
    {
      icon: MapPin,
      title: 'Geospatial Discovery',
      description: 'Advanced location-based restaurant discovery with real-time proximity search'
    },
    {
      icon: Zap,
      title: 'Real-time Tracking',
      description: 'Live order and courier tracking with WebSocket technology'
    },
    {
      icon: CreditCard,
      title: 'Seamless Payments',
      description: 'Integrated payment processing with multiple payment gateways'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive insights into your business performance'
    },
    {
      icon: Users,
      title: 'Multi-tenant Platform',
      description: 'Manage multiple restaurants and teams from one dashboard'
    },
    {
      icon: Smartphone,
      title: 'Mobile Optimized',
      description: 'Fully responsive design that works on all devices'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Restaurant Owner',
      image: '👩‍🍳',
      text: 'This platform transformed our delivery business. Orders increased by 300% in just 3 months!'
    },
    {
      name: 'Michael Chen',
      role: 'Fleet Manager',
      image: '👨‍💼',
      text: 'The real-time tracking and analytics have made managing our courier fleet incredibly efficient.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Food Entrepreneur',
      image: '👩‍💻',
      text: 'Started with the free plan, scaled to enterprise. The platform grew with our business perfectly.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-red-600">🍕 FoodFlow</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900">Testimonials</a>
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900"
              >
                Sign In
              </button>
              <button
                onClick={handleGetStarted}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Star className="w-4 h-4 mr-2" />
                Trusted by 10,000+ businesses
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Revolutionize Your
                <span className="text-red-600"> Food Delivery</span> Business
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                All-in-one platform for restaurants, couriers, and customers. 
                Geospatial discovery, real-time tracking, and seamless payments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  className="bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-medium hover:bg-red-700 transition flex items-center justify-center"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button
                  onClick={() => navigate('/pricing')}
                  className="bg-white text-gray-900 px-8 py-4 rounded-lg text-lg font-medium border-2 border-gray-300 hover:border-gray-400 transition"
                >
                  View Pricing
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                ✓ 14-day free trial • ✓ No credit card required • ✓ Cancel anytime
              </p>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Pizza Palace</p>
                      <p className="text-sm text-gray-600">0.5 km away • 4.5 ⭐</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Order #1234</p>
                      <p className="text-sm text-gray-600">En route • ETA 15 min</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Payment Confirmed</p>
                      <p className="text-sm text-gray-600">$24.99 • Visa ****4242</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed for modern food delivery businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="p-6 rounded-xl border border-gray-200 hover:shadow-lg transition">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-red-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold mb-2">10K+</p>
              <p className="text-red-100">Active Restaurants</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">1M+</p>
              <p className="text-red-100">Orders Delivered</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">50K+</p>
              <p className="text-red-100">Happy Customers</p>
            </div>
            <div>
              <p className="text-5xl font-bold mb-2">99.9%</p>
              <p className="text-red-100">Uptime SLA</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by Businesses Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="text-4xl mr-4">{testimonial.image}</div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-red-600 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-8 text-red-100">
            Join thousands of successful food delivery businesses today
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-red-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition inline-flex items-center"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
          <p className="text-sm text-red-100 mt-4">
            14-day free trial • No credit card required
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p>© 2024 FoodFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
