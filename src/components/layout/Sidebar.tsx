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
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, userRole }) => {
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/', 
      icon: BarChart3,
      roles: ['super_admin', 'admin', 'manager', 'viewer']
    },
    { 
      name: 'Upload Data', 
      href: '/upload', 
      icon: Upload,
      roles: ['super_admin', 'admin']
    },
    { 
      name: 'Input Manual', 
      href: '/manual-input', 
      icon: Plus,
      roles: ['super_admin', 'admin', 'manager']
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: TrendingUp,
      roles: ['super_admin', 'admin', 'manager']
    },
    { 
      name: 'Products', 
      href: '/products', 
      icon: Package,
      roles: ['super_admin', 'admin', 'manager']
    },
    { 
      name: 'Stores', 
      href: '/stores', 
      icon: Store,
      roles: ['super_admin', 'admin']
    },
    { 
      name: 'User Management', 
      href: '/users', 
      icon: Users,
      roles: ['super_admin']
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings,
      roles: ['super_admin']
    },
  ];

  const handleNavigation = (href: string) => {
    setCurrentPath(href);
    window.location.href = href;
    onClose();
  };

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:top-auto md:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 md:hidden border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900">
              Hiban Analytics
            </h1>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 md:mt-0">
          <div className="px-3">
            <ul className="space-y-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.href;
                
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className={`
                        w-full group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-left
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
                      {item.name !== 'Dashboard' && item.name !== 'Upload Data' && (
                        <span className="ml-auto text-xs text-gray-400">
                          Soon
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* User Role Display */}
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {userRole.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Current Role</p>
              <p className="text-xs text-gray-500 capitalize">
                {userRole.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};