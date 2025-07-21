import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { LayoutDashboard, Upload, PlusCircle, BarChart3, Package, Store, Users, Settings, BookOpen, X, DollarSign } from 'lucide-react';
import { NavigationItem } from '@/types/auth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: string;
}

const navigationItems: Record<string, NavigationItem[]> = {
  super_admin: [{
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/'
  }, {
    icon: Upload,
    label: 'Upload Data',
    path: '/upload'
  }, {
    icon: PlusCircle,
    label: 'Input Manual',
    path: '/manual-input'
  }, { // <-- Item baru ditambahkan di sini
    icon: DollarSign,
    label: 'Biaya Iklan',
    path: '/ad-expenses'
  }, {
    icon: BarChart3,
    label: 'Analytics',
    path: '/analytics'
  }, {
    icon: Package,
    label: 'Products',
    path: '/products'
  }, {
    icon: Store,
    label: 'Stores',
    path: '/stores'
  }, {
    icon: Users,
    label: 'User Management',
    path: '/users'
  }, {
    icon: Settings,
    label: 'Settings',
    path: '/settings'
  }, {
    icon: BookOpen,
    label: 'Panduan',
    path: '/help'
  }],
  admin: [{
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/'
  }, {
    icon: Upload,
    label: 'Upload Data',
    path: '/upload'
  }, {
    icon: PlusCircle,
    label: 'Input Manual',
    path: '/manual-input'
  }, { // <-- Item baru ditambahkan di sini
    icon: DollarSign,
    label: 'Biaya Iklan',
    path: '/ad-expenses'
  }, {
    icon: BarChart3,
    label: 'Analytics',
    path: '/analytics'
  }, {
    icon: Package,
    label: 'Products',
    path: '/products'
  }, {
    icon: Store,
    label: 'Stores',
    path: '/stores'
  }, {
    icon: BookOpen,
    label: 'Panduan',
    path: '/help'
  }],
  manager: [{
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/'
  }, {
    icon: BarChart3,
    label: 'Analytics',
    path: '/analytics'
  }, {
    icon: Package,
    label: 'Products',
    path: '/products'
  }, {
    icon: BookOpen,
    label: 'Panduan',
    path: '/help'
  }],
  viewer: [{
    icon: LayoutDashboard,
    label: 'Dashboard',
    path: '/'
  }, {
    icon: BookOpen,
    label: 'Panduan',
    path: '/help'
  }]
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  userRole
}) => {
  const location = useLocation();
  const items = navigationItems[userRole] || navigationItems.viewer;
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  return <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <aside className={cn('fixed left-0 top-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0', isOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex h-full flex-col">
          {/* Header */}
          

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-2">
              <div className="px-3 py-2">
                <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight text-sidebar-foreground">
                  Navigation
                </h2>
                <div className="space-y-1">
                  {items.map(item => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return <NavLink key={item.path} to={item.path} onClick={onClose} className={cn('flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors', 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground', active ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' : 'text-sidebar-foreground')}>
                        <Icon className="mr-3 h-4 w-4" />
                        {item.label}
                      </NavLink>;
                })}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Role Badge */}
              <div className="px-3 py-2">
                <div className="rounded-lg bg-sidebar-accent/50 p-3">
                  <div className="text-xs text-sidebar-foreground/70">Current Role</div>
                  <div className="text-sm font-medium text-sidebar-foreground mt-1">
                    {userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                </div>
              </div>
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4">
            <div className="text-xs text-sidebar-foreground/70 text-center">Fintracks Advanced By Silent Techs.</div>
          </div>
        </div>
      </aside>
    </>;
};