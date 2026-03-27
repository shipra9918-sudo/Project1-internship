import { Suspense, lazy, useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './routes/routes';
import { useAuthStore } from './context/authStore';
import LoadingSpinner from './components/shared/LoadingSpinner';

function App() {
  const loadUser = useAuthStore(state => state.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="xl" text="Loading application..." />
      </div>
    }>
      <RouterProvider router={router} />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </Suspense>
  );
}

export default App;
