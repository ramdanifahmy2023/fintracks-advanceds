import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface UserProfile {
  full_name: string;
  role: string;
  email: string;
  avatar_url?: string;
}

interface ExtendedUser extends User {
  full_name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: ExtendedUser | null;
  userRole: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch user profile ONCE
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    if (!userId) return null;
    
    try {
      console.log('👤 Fetching user profile for ID:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('full_name, role, email, avatar_url')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching user profile:', error);
        return null;
      }

      console.log('✅ User profile fetched successfully:', data?.email);
      return data;
    } catch (error) {
      console.error('❌ Profile fetch failed:', error);
      return null;
    }
  };

  // Merge user with profile data
  const mergeUserWithProfile = (authUser: User, profile: UserProfile | null): ExtendedUser => {
    return {
      ...authUser,
      full_name: profile?.full_name || authUser.email?.split('@')[0] || 'User',
      avatar_url: profile?.avatar_url || authUser.user_metadata?.avatar_url
    };
  };

  // Initialize auth ONCE
  useEffect(() => {
    if (isInitialized) return; // Prevent re-initialization
    
    console.log('🚀 Initializing Auth Context...');
    
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session error:', error);
          if (isMounted) {
            setUser(null);
            setUserRole(null);
            setLoading(false);
            setIsInitialized(true);
          }
          return;
        }

        if (session?.user && isMounted) {
          console.log('🔍 Initial session found:', session.user.email);
          
          const profile = await fetchUserProfile(session.user.id);
          
          if (isMounted) {
            const extendedUser = mergeUserWithProfile(session.user, profile);
            setUser(extendedUser);
            setUserRole(profile?.role || 'viewer');
            console.log('✅ Initial user set:', session.user.email, `(${profile?.role || 'viewer'})`);
          }
        } else {
          console.log('🚪 No initial session found');
          if (isMounted) {
            setUser(null);
            setUserRole(null);
          }
        }
        
        if (isMounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (isMounted) {
          setUser(null);
          setUserRole(null);
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initAuth();

    // Set up auth listener ONCE
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted || !isInitialized) return;
        
        console.log('🔄 Auth state changed:', event);

        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          if (isMounted) {
            const extendedUser = mergeUserWithProfile(session.user, profile);
            setUser(extendedUser);
            setUserRole(profile?.role || 'viewer');
            console.log('✅ User signed in:', session.user.email);
          }
        } else if (event === 'SIGNED_OUT') {
          if (isMounted) {
            setUser(null);
            setUserRole(null);
            console.log('👋 User signed out');
          }
        }
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isInitialized]); // Only depend on isInitialized

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 Attempting login with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('✅ User authenticated successfully:', data.user.email);
        toast.success('Login berhasil!');
        return { success: true };
      }

      return { success: false, error: 'Login gagal' };
    } catch (error) {
      console.error('❌ Login exception:', error);
      return { success: false, error: 'Terjadi kesalahan saat login' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      toast.success('Logout berhasil!');
    } catch (error) {
      console.error('❌ Logout error:', error);
      toast.error('Gagal logout');
    }
  };

  // Alias for logout (backward compatibility)
  const signOut = logout;

  const value = {
    user,
    userRole,
    loading,
    login,
    logout,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};