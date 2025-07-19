import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Database } from 'lucide-react';

interface ConnectionStatus {
  status: 'loading' | 'connected' | 'error';
  message: string;
  platforms?: any[];
}

export const DatabaseTest = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'loading',
    message: 'Testing database connection...'
  });

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test basic connectivity by fetching platforms
        const { data, error } = await supabase
          .from('platforms')
          .select('*')
          .limit(5);

        if (error) {
          setConnectionStatus({
            status: 'error',
            message: `Connection failed: ${error.message}`
          });
        } else {
          setConnectionStatus({
            status: 'connected',
            message: `Successfully connected! Found ${data.length} platforms.`,
            platforms: data
          });
        }
      } catch (error) {
        setConnectionStatus({
          status: 'error',
          message: `Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    };

    testConnection();
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus.status) {
      case 'loading':
        return <Badge variant="outline">Testing...</Badge>;
      case 'connected':
        return <Badge variant="default" className="bg-success">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <Database className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          Database Connection
          {getStatusIcon()}
        </CardTitle>
        <CardDescription>
          Supabase connectivity status
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {getStatusBadge()}
        <p className="text-sm text-muted-foreground">
          {connectionStatus.message}
        </p>
        
        {connectionStatus.platforms && connectionStatus.platforms.length > 0 && (
          <div className="text-left">
            <h4 className="text-sm font-medium mb-2">Available Platforms:</h4>
            <div className="space-y-1">
              {connectionStatus.platforms.map((platform) => (
                <div key={platform.id} className="text-xs bg-muted p-2 rounded">
                  <span className="font-medium">{platform.platform_name}</span>
                  <span className="text-muted-foreground ml-2">({platform.platform_code})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};