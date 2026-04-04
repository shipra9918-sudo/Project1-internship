import { useLocation, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({ routes = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-generate breadcrumbs from location if routes not provided
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs = pathnames.map((value, index) => {
      const to = `/${pathnames.slice(0, index + 1).join('/')}`;
      
      // Handle dynamic route parameters
      const cleanLabel = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
      
      return {
        label: cleanLabel,
        to,
        isLast: index === pathnames.length - 1,
      };
    });

    // Add home at the beginning
    return [{ label: 'Home', to: '/', isLast: false }, ...breadcrumbs];
  };

  const breadcrumbs = routes.length > 0 ? routes : generateBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600" aria-label="Breadcrumb">
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.to} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400 flex-shrink-0" />
          )}
          
          {breadcrumb.isLast ? (
            <span className="font-medium text-gray-900">{breadcrumb.label}</span>
          ) : (
            <Link
              to={breadcrumb.to}
              className="hover:text-red-600 transition-colors flex items-center"
              onClick={(e) => {
                e.preventDefault();
                navigate(breadcrumb.to);
              }}
            >
              {index === 0 && <Home className="w-4 h-4 mr-1" />}
              {breadcrumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
