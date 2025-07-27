
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface TransactionErrorBoundaryProps {
  children: React.ReactNode;
}

interface TransactionErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class TransactionErrorBoundary extends React.Component<
  TransactionErrorBoundaryProps,
  TransactionErrorBoundaryState
> {
  constructor(props: TransactionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): TransactionErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Transaction Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertCircle className="h-6 w-6 mr-2" />
              Terjadi Kesalahan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Maaf, terjadi kesalahan saat memuat halaman transaksi. Silakan coba lagi.
            </p>
            {this.state.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700 font-medium">Detail Error:</p>
                <p className="text-sm text-red-600 mt-1">{this.state.error.message}</p>
              </div>
            )}
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Muat Ulang Halaman
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
