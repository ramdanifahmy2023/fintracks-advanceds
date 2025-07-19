import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  Download, 
  Share, 
  X, 
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PWAManagerProps {
  children: React.ReactNode;
}

export const PWAManager = ({ children }: PWAManagerProps) => {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Detect iOS
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    
    // Detect if running as PWA
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
    
    // Register service worker
    registerServiceWorker();
    
    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered successfully');
        
        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
                toast({
                  title: "Update Tersedia",
                  description: "Versi baru aplikasi telah tersedia",
                  variant: "default"
                });
              }
            });
          }
        });
      } catch (error) {
        console.log('SW registration failed:', error);
      }
    }
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        toast({
          title: "App Berhasil Diinstall",
          description: "Hiban Analytics telah ditambahkan ke home screen",
          variant: "default"
        });
      }
      
      setDeferredPrompt(null);
    }
  };

  const handleUpdateApp = async () => {
    setIsRefreshing(true);
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    
    // Wait a bit for the service worker to update
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handlePullToRefresh = async () => {
    setIsRefreshing(true);
    
    try {
      // Simulate refresh action
      await new Promise(resolve => setTimeout(resolve, 1000));
      window.location.reload();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="bg-yellow-600 text-white p-2 text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span>Mode Offline - Beberapa fitur mungkin tidak tersedia</span>
          </div>
        </div>
      )}

      {/* PWA Install Banner */}
      {deferredPrompt && !isStandalone && (
        <Alert className="m-4 border-blue-200 bg-blue-50">
          <Smartphone className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Install app untuk pengalaman yang lebih baik</span>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setDeferredPrompt(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button 
                size="sm"
                onClick={handleInstallPWA}
              >
                <Download className="h-4 w-4 mr-2" />
                Install
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* iOS Install Instructions */}
      {isIOS && !isStandalone && (
        <Alert className="m-4 border-blue-200 bg-blue-50">
          <Share className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center gap-2 text-sm">
              Tap <strong>Share</strong> button, then <strong>Add to Home Screen</strong> untuk install
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Update Available Banner */}
      {updateAvailable && (
        <Alert className="m-4 border-green-200 bg-green-50">
          <RefreshCw className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Update baru tersedia untuk aplikasi</span>
            <Button 
              size="sm" 
              onClick={handleUpdateApp}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Update
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main App Content */}
      <div className={cn(
        "transition-opacity duration-300",
        isRefreshing ? "opacity-50" : "opacity-100"
      )}>
        {children}
      </div>

      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg">
            <RefreshCw className="h-5 w-5 animate-spin" />
          </div>
        </div>
      )}

      {/* Offline Data Sync Indicator */}
      {isOnline && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Wifi className="h-3 w-3 text-green-500" />
            <span className="hidden sm:inline">Online</span>
          </div>
        </div>
      )}
    </div>
  );
};