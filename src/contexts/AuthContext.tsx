
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextType } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import ErrorBoundary from '@/components/ErrorBoundary';

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  login: async () => ({ error: 'Not implemented' }),
  logout: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProviderCore: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const safeToast = React.useCallback((options: any) => {
    try {
      if (toast) {
        toast(options);
      }
    } catch (error) {
      console.log('Toast message:', options.title, options.description);
    }
  }, [toast]);

  const fetchUserProfile = React.useCallback(async (userId: string, retryCount = 0): Promise<User | null> => {
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

      if (!data && retryCount < 2) {
        console.log(`⏳ Retrying profile fetch... (attempt ${retryCount + 2}/3)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchUserProfile(userId, retryCount + 1);
      }

      if (!data) {
        console.warn('⚠️ No user profile found after retries');
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

  React.useEffect(() => {
    console.log('🚀 Initializing Auth Context...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔄 Auth state changed: ${event}`);
        
        if (session?.user) {
          try {
            const userProfile = await fetchUserProfile(session.user.id);
            if (userProfile) {
              if (!userProfile.is_active) {
                console.warn('⚠️ User account is inactive');
                await supabase.auth.signOut();
                safeToast({
                  title: "Account Inactive",
                  description: "Your account has been deactivated. Please contact administrator.",
                  variant: "destructive",
                });
                setUser(null);
                setUserRole(null);
                setLoading(false);
                return;
              }

              setUser(userProfile);
              setUserRole(userProfile.role);
              setAuthError(null);
              console.log(`✅ User authenticated: ${userProfile.email} (${userProfile.role})`);
            } else {
              console.error('❌ User profile not found in database');
              setUser(null);
              setUserRole(null);
              setAuthError('Profile not found');
            }
          } catch (error) {
            console.error('💥 Error during auth state change:', error);
            setAuthError('Authentication error');
            setUser(null);
            setUserRole(null);
          }
          setLoading(false);
        } else {
          console.log('🚪 No user session, clearing state');
          setUser(null);
          setUserRole(null);
          setAuthError(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Initial session check:', session?.user?.email || 'No session');
      if (session?.user) {
        fetchUserProfile(session.user.id).then((userProfile) => {
          if (userProfile) {
            setUser(userProfile);
            setUserRole(userProfile.role);
            setAuthError(null);
            console.log(`✅ Initial user set: ${userProfile.email} (${userProfile.role})`);
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, safeToast]);

  const login = React.useCallback(async (email: string, password: string) => {
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

  const logout = React.useCallback(async () => {
    try {
      console.log('🚪 Logging out...');
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      setAuthError(null);
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
  }, [safeToast]);

  const updateProfile = React.useCallback(async (updates: Partial<User>) => {
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

  const value: AuthContextType = React.useMemo(() => ({
    user,
    userRole,
    loading,
    login,
    logout,
    updateProfile,
  }), [user, userRole, loading, login, logout, updateProfile]);

  // Don't render error boundary if there's just an auth error
  if (authError && !user) {
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
  }

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
        </div>
      </div>
    }>
      <AuthProviderCore>
        {children}
      </AuthProviderCore>
    </ErrorBoundary>
  );
};
