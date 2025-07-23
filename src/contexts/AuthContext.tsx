import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextType } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import ErrorBoundary from '@/components/ErrorBoundary';

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

const AuthProviderCore: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const { toast } = useToast();

  const safeToast = useCallback((options: any) => {
    try {
      if (toast) {
        toast(options);
      }
    } catch (error) {
      console.log('Toast message:', options.title, options.description);
    }
  }, [toast]);

  const fetchUserProfile = useCallback(async (userId: string): Promise<User | null> => {
    try {
      console.log(`👤 Fetching user profile for ID: ${userId}`);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching user profile:', error);
        setAuthError(`Profile fetch error: ${error.message}`);
        return null;
      }

      if (!data) {
        console.warn('⚠️ No user profile found');
        setAuthError('User profile not found');
        return null;
      }

      console.log('✅ User profile fetched successfully:', data.email);
      setAuthError(null);
      return data as User;
    } catch (error) {
      console.error('💥 Unexpected error fetching user profile:', error);
      setAuthError('Unexpected profile fetch error');
      return null;
    }
  }, []);

  const setAuthState = useCallback((newUser: User | null, role: string | null) => {
    setUser(newUser);
    setUserRole(role);
    setAuthError(null);
  }, []);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setUserRole(null);
    setAuthError(null);
  }, []);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    console.log('🚀 Initializing Auth Context...');
    
    // Set timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⏰ Auth initialization timeout, setting loading to false');
        setLoading(false);
        setInitializing(false);
      }
    }, 15000); // 15 seconds timeout (more generous)

    const initializeAuth = async () => {
      try {
        // Get initial session - ONLY ONCE
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          if (mounted) {
            clearAuthState();
            setLoading(false);
            setInitializing(false);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('🔍 Initial session found:', session.user.email);
          const userProfile = await fetchUserProfile(session.user.id);
          
          if (userProfile && mounted) {
            if (!userProfile.is_active) {
              console.warn('⚠️ User account is inactive');
              await supabase.auth.signOut();
              safeToast({
                title: "Account Inactive",
                description: "Your account has been deactivated. Please contact administrator.",
                variant: "destructive",
              });
              clearAuthState();
            } else {
              setAuthState(userProfile, userProfile.role);
              console.log(`✅ Initial user set: ${userProfile.email} (${userProfile.role})`);
            }
          }
        } else {
          console.log('🚪 No initial session found');
          if (mounted) {
            clearAuthState();
          }
        }

        if (mounted) {
          setLoading(false);
          setInitializing(false);
        }
      } catch (error) {
        console.error('💥 Auth initialization error:', error);
        if (mounted) {
          clearAuthState();
          setLoading(false);
          setInitializing(false);
        }
      }
    };

    // Initialize auth
    initializeAuth();

    // Set up auth state listener - AFTER initial check
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Skip if we're still initializing or if auth is already complete
        if (initializing || (!loading && user)) {
          console.log('🔄 Skipping auth state change during initialization or already authenticated:', event);
          return;
        }

        console.log(`🔄 Auth state changed: ${event}`);
        
        if (session?.user && mounted) {
          try {
            const userProfile = await fetchUserProfile(session.user.id);
            if (userProfile && mounted) {
              if (!userProfile.is_active) {
                console.warn('⚠️ User account is inactive');
                await supabase.auth.signOut();
                safeToast({
                  title: "Account Inactive",
                  description: "Your account has been deactivated. Please contact administrator.",
                  variant: "destructive",
                });
                clearAuthState();
              } else {
                setAuthState(userProfile, userProfile.role);
                console.log(`✅ User authenticated: ${userProfile.email} (${userProfile.role})`);
              }
            } else {
              console.error('❌ User profile not found in database');
              clearAuthState();
              setAuthError('Profile not found');
            }
          } catch (error) {
            console.error('💥 Error during auth state change:', error);
            setAuthError('Authentication error');
            clearAuthState();
          }
        } else {
          console.log('🚪 No user session, clearing state');
          if (mounted) {
            clearAuthState();
          }
        }

        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, safeToast, clearAuthState, setAuthState, initializing, loading, user]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setAuthError(null);
      
      console.log('🔐 Attempting login with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        let errorMessage = 'Login failed';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email first.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else {
          errorMessage = error.message;
        }

        setAuthError(errorMessage);
        safeToast({
          title: "Login Error",
          description: errorMessage,
          variant: "destructive",
        });

        return { error: errorMessage };
      }

      if (data.user) {
        console.log('✅ User authenticated successfully:', data.user.email);
        safeToast({
          title: "Login Successful!",
          description: `Welcome, ${data.user.email}`,
        });
      }

      return {};
    } catch (error) {
      console.error('💥 Unexpected login error:', error);
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setAuthError(errorMessage);
      safeToast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [safeToast]);

  const logout = useCallback(async () => {
    try {
      console.log('🚪 Logging out...');
      await supabase.auth.signOut();
      clearAuthState();
      safeToast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
      safeToast({
        title: "Logout Error",
        description: "An error occurred during logout.",
        variant: "destructive",
      });
    }
  }, [safeToast, clearAuthState]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setUser({ ...user, ...updates });
      safeToast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('❌ Update profile error:', error);
      safeToast({
        title: "Update Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  }, [user, safeToast]);

  const value: AuthContextType = useMemo(() => ({
    user,
    userRole,
    loading,
    login,
    logout,
    updateProfile,
  }), [user, userRole, loading, login, logout, updateProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <p className="text-muted-foreground">Authentication system error. Please refresh.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors mt-4"
          >
            Refresh Page
          </button>
        </div>
      </div>
    }>
      <AuthProviderCore>
        {children}
      </AuthProviderCore>
    </ErrorBoundary>
  );
};