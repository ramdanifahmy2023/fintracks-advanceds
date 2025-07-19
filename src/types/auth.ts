export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'viewer';
  avatar_url?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthContextType {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

export interface NavigationItem {
  icon: any;
  label: string;
  path: string;
  roles?: string[];
}

export interface Platform {
  id: string;
  platform_name: string;
  platform_code: string;
  is_active: boolean;
  created_at: string;
}