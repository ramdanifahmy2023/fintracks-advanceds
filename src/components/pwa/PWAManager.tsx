import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PWAManagerProps {
  children: React.ReactNode;
}

export const PWAManager: React.FC<PWAManagerProps> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [swError, setSwError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Enhanced service worker registration with better error handling
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          console.log('🔧 PWA: Registering service worker...');
          
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          });
          
          console.log('✅ PWA: Service worker registered successfully');
          
          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  toast({
                    title: "App Updated",
                    description: "A new version is available. Refresh to update.",
                    action: (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.reload()}
                      >
                        Refresh
                      </Button>
                    ),
                  });
                }
              });
            }
          });

          // Listen for service worker errors
          navigator.serviceWorker.addEventListener('error', (error) => {
            console.warn('⚠️ PWA: Service worker error (non-critical):', error);
            setSwError('Service worker encountered an error, but app functionality is not affected.');
          });

        } catch (error) {
          console.warn('⚠️ PWA: Service worker registration failed (non-critical):', error);
          setSwError('Service worker registration failed. App will work without offline capabilities.');
        }
      } else {
        console.log('ℹ️ PWA: Service workers not supported');
      }
    };

    // PWA install prompt handling
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('📱 PWA: Install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('✅ PWA: App installed successfully');
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      toast({
        title: "App Installed",
        description: "Fintracks Advanced has been installed successfully!",
      });
    };

    // Register event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Register service worker with error handling
    registerServiceWorker();

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toast]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ PWA: User accepted install prompt');
      } else {
        console.log('❌ PWA: User dismissed install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('❌ PWA: Install prompt error:', error);
    }
  };

  const dismissError = () => {
    setSwError(null);
  };

  return (
    <>
      {children}
      
      {/* Install prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 right-4 bg-background border border-border rounded-lg p-4 shadow-lg max-w-sm z-50">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Install App</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Install Fintracks Advanced for quick access and offline use.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInstallPrompt(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </Button>
          </div>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="flex-1"
            >
              Install
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInstallPrompt(false)}
              className="flex-1"
            >
              Later
            </Button>
          </div>
        </div>
      )}

      {/* Service Worker Error (non-critical) */}
      {swError && (
        <div className="fixed bottom-4 left-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-md z-50">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5">
              ⚠️
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800">PWA Notice</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {swError}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissError}
              className="text-yellow-600 hover:text-yellow-800"
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </>
  );
};