
import React from 'react';
import { 
  BarChart3, 
  Upload, 
  Plus, 
  TrendingUp, 
  Package, 
  Store, 
  Users, 
  Settings,
  LogOut
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Upload Data', href: '/upload', icon: Upload },
    { name: 'Input Manual', href: '/manual-input', icon: Plus },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Stores', href: '/stores', icon: Store },
    { name: 'User Management', href: '/users', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h1 className="ml-3 text-xl font-bold text-gray-900">
              Hiban Analytics
            </h1>
          </div>
        </div>
        
        <nav className="mt-6">
          <div className="px-3">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href;
                
                return (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPath(item.href);
                        window.history.pushState({}, '', item.href);
                        window.location.reload();
                      }}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                        ${isActive
                          ? 'bg-blue-100 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon
                        className={`mr-3 h-5 w-5 ${
                          isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {item.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
        
        {/* User section */}
        <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">SA</span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Super Admin</p>
              <p className="text-xs text-gray-500">admin@hibanstore.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
