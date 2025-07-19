import React, { createContext, useContext, useEffect, useState } from 'react';
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
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string, retryCount = 0): Promise<User | null> => {
    try {
      console.log(`👤 Fetching user profile for ID: ${userId} (attempt ${retryCount + 1})`);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching user profile:', error);
        return null;
      }

      if (!data) {
        console.warn(`⚠️ No user profile found for ID: ${userId} (attempt ${retryCount + 1})`);
        
        if (retryCount < 3) {
          console.log(`⏳ Retrying in 1 second... (attempt ${retryCount + 2}/4)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchUserProfile(userId, retryCount + 1);
        }
        
        console.error('💥 Failed to fetch user profile after 4 attempts');
        return null;
      }

      console.log('✅ User profile fetched successfully:', {
        id: data.id,
        email: data.email,
        role: data.role,
        is_active: data.is_active
      });
      
      return data as User;
    } catch (error) {
      console.error('💥 Unexpected error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('🚀 Initializing Auth Context...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`🔄 Auth state changed: ${event}`, session?.user?.email || 'No user');
        
        if (session?.user) {
          setTimeout(async () => {
            const userProfile = await fetchUserProfile(session.user.id);
            if (userProfile) {
              if (!userProfile.is_active) {
                console.warn('⚠️ User account is inactive');
                await supabase.auth.signOut();
                toast({
                  title: "Akun Tidak Aktif",
                  description: "Akun Anda telah dinonaktifkan. Silakan hubungi administrator.",
                  variant: "destructive",
                });
                setUser(null);
                setUserRole(null);
                setLoading(false);
                return;
              }

              setUser(userProfile);
              setUserRole(userProfile.role);
              console.log(`✅ User set in context: ${userProfile.email} (${userProfile.role})`);
            } else {
              console.error('❌ User profile not found in database');
              setUser(null);
              setUserRole(null);
            }
            setLoading(false);
          }, 0);
        } else {
          console.log('🚪 No user session, clearing state');
          setUser(null);
          setUserRole(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Initial session check:', session?.user?.email || 'No session');
      if (session?.user) {
        fetchUserProfile(session.user.id).then((userProfile) => {
          if (userProfile) {
            setUser(userProfile);
            setUserRole(userProfile.role);
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
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      console.log('🔐 Attempting login with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password,
      });

      console.log('📨 Login response:', { 
        user: data?.user?.email, 
        error: error?.message || 'None' 
      });

      if (error) {
        console.error('❌ Login error:', error);
        let errorMessage = 'Login failed';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email atau password salah. Pastikan akun sudah dibuat dengan benar.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Silakan konfirmasi email Anda terlebih dahulu.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Terlalu banyak percobaan login. Silakan coba lagi nanti.';
        } else {
          errorMessage = error.message;
        }

        toast({
          title: "Login Error",
          description: errorMessage,
          variant: "destructive",
        });

        return { error: errorMessage };
      }

      if (data.user) {
        console.log('✅ User authenticated successfully:', data.user.email);
        
        toast({
          title: "Login Berhasil!",
          description: `Selamat datang, ${data.user.email}`,
        });
      }

      return {};
    } catch (error) {
      console.error('💥 Unexpected login error:', error);
      toast({
        title: "Login Error",
        description: "Terjadi kesalahan tak terduga. Silakan coba lagi.",
        variant: "destructive",
      });
      return { error: 'An unexpected error occurred' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      await supabase.auth.signOut();
      setUser(null);
      setUserRole(null);
      toast({
        title: "Logged out",
        description: "Anda telah berhasil logout.",
      });
    } catch (error) {
      console.error('❌ Logout error:', error);
      toast({
        title: "Logout Error",
        description: "Terjadi kesalahan saat logout.",
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
      console.error('❌ Update profile error:', error);
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
