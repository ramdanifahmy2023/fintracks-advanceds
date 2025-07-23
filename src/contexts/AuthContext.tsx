import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  userRole: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch user profile ONCE
  const fetchUserProfile = async (userId: string) => {
    if (!userId) return null;
    
    try {
      console.log('👤 Fetching user profile for ID:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('full_name, role, email')
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
            setUser(session.user);
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
            setUser(session.user);
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

  const signOut = async () => {
    try {
      console.log('🚪 Signing out...');
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
    } catch (error) {
      console.error('❌ Sign out error:', error);
    }
  };

  const value = {
    user,
    userRole,
    loading,
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