
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalyticsErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  error?: Error | null;
  onRetry?: () => void;
}

export const AnalyticsErrorBoundary: React.FC<AnalyticsErrorBoundaryProps> = ({
  children,
  fallback,
  error,
  onRetry
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  if (error) {
    return fallback || (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <p className="font-medium">Terjadi kesalahan saat memuat analisis profit</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleRetry} className="ml-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
