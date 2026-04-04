import { Component } from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw, ArrowLeft } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoBack = () => {
    window.history.back();
  };

  handleGoHome = () => {
    this.props.navigate?.('/');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
          <div className="max-w-2xl w-full text-center">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              We're sorry for the inconvenience. Our team has been notified and we're working on it.
            </p>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-white rounded-lg border border-red-200 text-left">
                <p className="text-sm font-mono text-red-800 break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={this.handleReload}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleGoBack}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Go Back</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Home className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
            </div>

            {/* Support Contact */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Need immediate help?{' '}
                <a href="mailto:support@hospitality.com" className="text-red-600 hover:underline font-medium">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper to use hooks
const ErrorBoundaryWrapper = () => {
  const navigate = useNavigate();
  const error = useRouteError();
  
  return <ErrorBoundary navigate={navigate} error={error} />;
};

export default ErrorBoundaryWrapper;
