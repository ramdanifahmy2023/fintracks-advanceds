
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Upload, 
  PlusCircle, 
  BarChart3, 
  Package, 
  Store, 
  Users, 
  Settings, 
  BookOpen, 
  X, 
  DollarSign, 
  FileText,
  ChevronRight,
  Sparkles
} from 'lucide-react';
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
  }, {
    icon: FileText,
    label: 'Transaksi',
    path: '/transactions'
  }, {
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
  }, {
    icon: FileText,
    label: 'Transaksi',
    path: '/transactions'
  }, {
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
    icon: FileText,
    label: 'Transaksi',
    path: '/transactions'
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
    icon: FileText,
    label: 'Transaksi',
    path: '/transactions'
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

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300" 
          onClick={onClose} 
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-0 z-50 h-full w-72 bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border/50 shadow-xl transform transition-all duration-300 ease-in-out md:relative md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-full flex-col">
          {/* Close button for mobile */}
          <div className="flex items-center justify-between p-4 md:hidden">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-sidebar-foreground">Menu</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-sidebar-accent/50 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-4 py-2">
            <nav className="space-y-2">
              <div className="px-2 py-4">
                <h2 className="mb-4 px-2 text-lg font-bold tracking-tight text-sidebar-foreground flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-primary" />
                  Navigation
                </h2>
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={cn(
                          'group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-md',
                          'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                          active
                            ? 'bg-gradient-primary text-white shadow-lg shadow-primary/20'
                            : 'text-sidebar-foreground hover:translate-x-1'
                        )}
                      >
                        <Icon className={cn(
                          'mr-3 h-5 w-5 transition-all duration-200',
                          active ? 'text-white' : 'text-sidebar-foreground/70 group-hover:text-primary'
                        )} />
                        <span className="flex-1">{item.label}</span>
                        {active && (
                          <ChevronRight className="h-4 w-4 text-white/80" />
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>

              <Separator className="my-6 bg-sidebar-border/50" />

              {/* Role Badge */}
              <div className="px-2 py-4">
                <div className="rounded-xl bg-gradient-to-r from-sidebar-accent/30 to-sidebar-accent/10 p-4 border border-sidebar-border/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="text-xs font-medium text-sidebar-foreground/70">Current Role</div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="text-sm font-semibold bg-primary/10 text-primary border-primary/20"
                  >
                    {userRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Badge>
                </div>
              </div>
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-sidebar-border/50 p-4 bg-sidebar-accent/20">
            <div className="text-center">
              <div className="text-xs font-medium text-sidebar-foreground/90 mb-1">
                Fintracks Advanced
              </div>
              <div className="text-xs text-sidebar-foreground/60">
                By Silent Techs
              </div>
              <div className="mt-2 flex justify-center">
                <div className="w-8 h-1 bg-gradient-primary rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
