// This page is no longer used - routing now goes directly to dashboard
// Keeping for compatibility, but users should be redirected to /login or dashboard

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect based on auth status
  return user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />;
};

export default Index;
