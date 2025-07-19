import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextType } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  login: async () => ({ error: 'Not implemented' }),
  logout: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch user profile from our custom users table
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If user not found in our custom table, create them
        if (error.code === 'PGRST116') {
          console.log('User not found in custom users table, will be created by trigger');
          return null;
        }
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data as User;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Defer Supabase calls with setTimeout to prevent deadlock
          setTimeout(async () => {
            const userProfile = await fetchUserProfile(session.user.id);
            if (userProfile) {
              setUser(userProfile);
              setUserRole(userProfile.role);
            } else {
              console.error('User profile not found in database');
              setUser(null);
              setUserRole(null);
            }
            setLoading(false);
          }, 0);
        } else {
          setUser(null);
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id).then((userProfile) => {
          if (userProfile) {
            setUser(userProfile);
            setUserRole(userProfile.role);
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = 'Login failed';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email address';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please try again later';
        }

        toast({
          title: "Login Error",
          description: errorMessage,
          variant: "destructive",
        });

        return { error: errorMessage };
      }

      if (data.user) {
        // Retry fetching user profile in case it's being created by trigger
        let userProfile = await fetchUserProfile(data.user.id);
        let retryCount = 0;
        
        while (!userProfile && retryCount < 3) {
          console.log(`Retrying user profile fetch, attempt ${retryCount + 1}`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
          userProfile = await fetchUserProfile(data.user.id);
          retryCount++;
        }
        
        if (userProfile) {
          if (!userProfile.is_active) {
            await supabase.auth.signOut();
            toast({
              title: "Account Disabled",
              description: "Your account has been disabled. Please contact an administrator.",
              variant: "destructive",
            });
            return { error: 'Account disabled' };
          }

          // Update last login
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', data.user.id);

          setUser(userProfile);
          setUserRole(userProfile.role);
          
          toast({
            title: "Welcome back!",
            description: `Successfully logged in as ${userProfile.full_name}`,
          });
        } else {
          toast({
            title: "Setup Required",
            description: "Please contact an administrator to complete your account setup.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return { error: 'Profile setup required' };
        }
      }

      return {};
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return { error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: "An error occurred while logging out.",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, ...updates });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Update profile error:', error);
      toast({
        title: "Update Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const value: AuthContextType = {
    user,
    userRole,
    loading,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};