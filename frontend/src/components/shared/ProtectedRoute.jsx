import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../context/authStore';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save the intended destination
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  // Check if user role is in allowed roles list
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to appropriate dashboard based on user role
    const redirectPaths = {
      admin: '/admin/dashboard',
      merchant: '/merchant/dashboard',
      courier: '/courier/dashboard',
      consumer: '/restaurants',
    };
    return <Navigate to={redirectPaths[user?.role] || '/'} replace />;
  }

  return children;
};

export default ProtectedRoute;
