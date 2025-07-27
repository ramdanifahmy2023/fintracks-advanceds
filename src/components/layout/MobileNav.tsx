
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings, Bell } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface MobileNavProps {
  user: any;
  logout: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ user, logout }) => {
  const getUserInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const formatRole = (role: string) => {
    return role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'User';
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Notifications */}
      <Button
        variant="ghost"
        size="sm"
        className="relative hover:bg-accent/50 transition-colors duration-200"
      >
        <Bell className="h-4 w-4" />
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
        >
          3
        </Badge>
      </Button>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-9 w-9 rounded-full hover:ring-2 hover:ring-primary/20 transition-all duration-200"
          >
            <Avatar className="h-9 w-9 ring-2 ring-border/50">
              <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
              <AvatarFallback className="bg-gradient-primary text-white text-xs font-semibold">
                {getUserInitials(user?.full_name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 bg-background/95 backdrop-blur-xl border-border/50 shadow-xl"
          align="end"
        >
          <div className="px-3 py-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                <AvatarFallback className="bg-gradient-primary text-white text-xs">
                  {getUserInitials(user?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {user?.full_name || user?.email}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {formatRole(user?.role)}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="hover:bg-accent/50 transition-colors duration-200">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:bg-accent/50 transition-colors duration-200">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={logout}
            className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 transition-colors duration-200"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
