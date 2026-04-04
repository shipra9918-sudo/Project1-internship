import { createBrowserRouter } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import ScrollToTop from '../components/shared/ScrollToTop';
import HomePage from '../pages/HomePage';
import LandingPage from '../pages/LandingPage';
import PricingPage from '../pages/PricingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import OnboardingPage from '../pages/OnboardingPage';
import MerchantDashboard from '../pages/MerchantDashboard';
import CourierDashboard from '../pages/CourierDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import OrdersPage from '../pages/OrdersPage';
import OrderTrackingPage from '../pages/OrderTrackingPage';
import RestaurantPage from '../pages/RestaurantPage';
import ProfilePage from '../pages/ProfilePage';
import BillingSettings from '../pages/BillingSettings';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import ChatbotPage from '../pages/ChatbotPage';
import NotFound from '../pages/NotFound';

// Protected Route Component
import ProtectedRoute from '../components/shared/ProtectedRoute';

// Error Boundary
import ErrorBoundary from '../components/shared/ErrorBoundary';

/** Logged-in app roles (excludes unauthenticated). Admin uses /admin/* only in nav; may browse app when needed. */
const ROLES_APP = ['consumer', 'merchant', 'courier', 'admin'];

// Layout component for pages with Navbar, Footer and ScrollToTop
const withLayout = (Component) => () => (
  <>
    <Navbar />
    <main className="min-h-screen">
      <Component />
    </main>
    <Footer />
    <ScrollToTop />
  </>
);

export const router = createBrowserRouter([
  // Public Routes (no auth required)
  {
    path: '/',
    element: withLayout(LandingPage)(),
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/home',
    element: (
      <ProtectedRoute allowedRoles={ROLES_APP}>
        {withLayout(HomePage)()}
      </ProtectedRoute>
    ),
  },
  {
    path: '/pricing',
    element: withLayout(PricingPage)(),
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/onboarding',
    element: (
      <ProtectedRoute allowedRoles={['merchant', 'courier']}>
        {withLayout(OnboardingPage)()}
      </ProtectedRoute>
    ),
  },
  
  // Consumer Routes
  {
    path: '/restaurants',
    element: (
      <ProtectedRoute allowedRoles={ROLES_APP}>
        {withLayout(HomePage)()}
      </ProtectedRoute>
    ),
  },
  {
    path: '/restaurant/:id',
    element: (
      <ProtectedRoute allowedRoles={ROLES_APP}>
        {withLayout(RestaurantPage)()}
      </ProtectedRoute>
    ),
  },
  {
    path: '/orders',
    element: (
      <ProtectedRoute allowedRoles={['consumer']}>
        {withLayout(OrdersPage)()}
      </ProtectedRoute>
    ),
  },
  {
    path: '/cart',
    element: (
      <ProtectedRoute allowedRoles={['consumer', 'admin']}>
        {withLayout(CartPage)()}
      </ProtectedRoute>
    ),
  },
  {
    path: '/checkout',
    element: (
      <ProtectedRoute allowedRoles={['consumer']}>
        {withLayout(CheckoutPage)()}
      </ProtectedRoute>
    ),
  },
  {
    path: '/order/:id/tracking',
    element: (
      <ProtectedRoute allowedRoles={['consumer']}>
        {withLayout(OrderTrackingPage)()}
      </ProtectedRoute>
    ),
  },
  
  // Merchant Routes
  {
    path: '/merchant/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['merchant']}>
        {withLayout(MerchantDashboard)()}
      </ProtectedRoute>
    ),
  },
  
  // Courier Routes
  {
    path: '/courier/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['courier']}>
        {withLayout(CourierDashboard)()}
      </ProtectedRoute>
    ),
  },
  
  // Admin Routes
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        {withLayout(AdminDashboard)()}
      </ProtectedRoute>
    ),
  },
  
  // Profile & Settings (All authenticated users)
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        {withLayout(ProfilePage)()}
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/billing',
    element: (
      <ProtectedRoute>
        {withLayout(BillingSettings)()}
      </ProtectedRoute>
    ),
  },
  {
    path: '/assistant',
    element: (
      <ProtectedRoute allowedRoles={ROLES_APP}>
        {withLayout(ChatbotPage)()}
      </ProtectedRoute>
    ),
  },
  
  // 404 Route
  {
    path: '*',
    element: <NotFound />,
  },
]);
