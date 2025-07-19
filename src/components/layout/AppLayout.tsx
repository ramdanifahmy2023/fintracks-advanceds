import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userRole } = useAuth();
  const isMobile = useIsMobile();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <Header onToggleSidebar={toggleSidebar} />
      
      <div className="flex">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          userRole={userRole || 'viewer'}
        />
        
        <main className="flex-1 overflow-hidden">
          <div className="h-[calc(100vh-4rem)] overflow-auto">
            <div className="container mx-auto px-4 py-6 md:px-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};