
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Menu,
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  BarChart3,
  HelpCircle,
  Check,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(5);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Transaksi Baru',
      message: '15 transaksi baru dari Shopee',
      time: '2 menit lalu',
      type: 'info',
      read: false,
    },
    {
      id: 2,
      title: 'Target Tercapai',
      message: 'Penjualan bulan ini mencapai target',
      time: '1 jam lalu',
      type: 'success',
      read: false,
    },
    {
      id: 3,
      title: 'Stok Menipis',
      message: 'Produk SKU-001 stok tersisa 5',
      time: '3 jam lalu',
      type: 'warning',
      read: false,
    },
    {
      id: 4,
      title: 'Upload Berhasil',
      message: 'Data CSV berhasil diimpor',
      time: '1 hari lalu',
      type: 'success',
      read: true,
    },
    {
      id: 5,
      title: 'Laporan Siap',
      message: 'Laporan analitik bulan ini siap',
      time: '2 hari lalu',
      type: 'info',
      read: true,
    },
  ]);

  // Default beautiful avatar image
  const defaultAvatar = "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face&auto=format&q=80";

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'manager':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setNotificationCount(0);
  };

  const handleProfileClick = () => {
    toast.success('Navigasi ke Profile');
    // You can implement profile navigation here
    // navigate('/profile');
  };

  const handleSettingsClick = () => {
    toast.success('Navigasi ke Settings');
    navigate('/settings');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Berhasil logout');
      navigate('/login');
    } catch (error) {
      toast.error('Gagal logout');
    }
  };

  const handleHelpClick = () => {
    navigate('/help');
    toast.info('Membuka panduan pengguna');
  };

  const unreadNotifications = notifications.filter(n => !n.read);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="md:hidden hover:bg-accent/50 transition-colors duration-200"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground bg-gradient-primary bg-clip-text text-transparent">
                Fintracks Advanced
              </h1>
              <p className="text-xs text-muted-foreground">Analytics Dashboard</p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="relative hover:bg-accent/50 transition-all duration-200 hover:scale-105"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-blue-500" />
            )}
          </Button>

          {/* Help Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleHelpClick}
            className="hover:bg-accent/50 transition-colors duration-200"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* Enhanced Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-accent/50 transition-all duration-200 hover:scale-105"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse"
                  >
                    {unreadNotifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-80 bg-background/95 backdrop-blur-xl border-border/50 shadow-xl max-h-96 overflow-y-auto"
              align="end"
            >
              <DropdownMenuLabel className="font-semibold text-lg p-4 pb-2">
                <div className="flex items-center justify-between">
                  <span>Notifikasi</span>
                  {unreadNotifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs hover:bg-accent/50"
                    >
                      Tandai semua dibaca
                    </Button>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Tidak ada notifikasi</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`p-4 cursor-pointer transition-colors duration-200 ${
                        !notification.read ? 'bg-accent/20 hover:bg-accent/30' : 'hover:bg-accent/10'
                      }`}
                    >
                      <div className="flex items-start space-x-3 w-full">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2"></div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground/80 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all duration-200"
              >
                <Avatar className="h-10 w-10 ring-2 ring-border/50 hover:ring-primary/30 transition-all duration-200">
                  <AvatarImage 
                    src={user?.avatar_url || defaultAvatar} 
                    alt={user?.full_name || 'Profile'} 
                  />
                  <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                    {user ? getUserInitials(user.full_name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-64 bg-background/95 backdrop-blur-xl border-border/50 shadow-xl z-50"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2 p-2">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={user?.avatar_url || defaultAvatar} 
                        alt={user?.full_name || 'Profile'} 
                      />
                      <AvatarFallback className="bg-gradient-primary text-white">
                        {user ? getUserInitials(user.full_name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold leading-none">
                        {user?.full_name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={getRoleBadgeVariant(user?.role || '')}
                    className="w-fit text-xs"
                  >
                    {formatRole(user?.role || '')}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleProfileClick}
                className="hover:bg-accent/50 transition-colors duration-200 cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleSettingsClick}
                className="hover:bg-accent/50 transition-colors duration-200 cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 transition-colors duration-200 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
