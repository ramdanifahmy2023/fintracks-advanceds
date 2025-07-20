import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallback,
}) => {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();
  const [authTimeout, setAuthTimeout] = useState(false);

  // Set timeout for loading state to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('⏰ ProtectedRoute: Auth loading timeout reached');
        setAuthTimeout(true);
      }
    }, 15000); // 15 seconds timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  // Show loading spinner while checking authentication
  if (loading && !authTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
          <div className="text-xs text-muted-foreground/60">
            This should only take a few seconds
          </div>
        </div>
      </div>
    );
  }

  // Handle auth timeout
  if (authTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8 max-w-md">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground">Authentication Timeout</h2>
          <p className="text-muted-foreground">
            Authentication is taking longer than expected. This might be due to a network issue.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Refresh Page
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user || !userRole) {
    console.log('🔒 ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    console.log('🚫 ProtectedRoute: User role insufficient', { userRole, requiredRoles });
    
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground max-w-md">
            You don't have permission to access this page. Your current role ({userRole}) doesn't meet the requirements.
          </p>
          <p className="text-sm text-muted-foreground">
            Required roles: {requiredRoles.join(', ')}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  console.log('✅ ProtectedRoute: User authorized, rendering children');
  return <>{children}</>;
};