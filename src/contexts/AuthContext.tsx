import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextType } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { Session } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data as User | null;
  };

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id);
          if (userProfile) {
            setUser(userProfile);
            setUserRole(userProfile.role);
          } else {
            // Jika profil tidak ditemukan, mungkin karena trigger DB belum selesai.
            // Kita logout agar pengguna bisa mencoba login kembali.
            await supabase.auth.signOut();
            setUser(null);
            setUserRole(null);
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);


  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast({ title: "Login Gagal", description: error.message, variant: "destructive" });
        setLoading(false); // Pastikan loading berhenti jika error
        return { error: error.message };
      }
      // `onAuthStateChange` akan menangani sisanya, termasuk setLoading(false)
    } catch (e) {
      const error = e as Error;
      toast({ title: "Login Error", description: error.message, variant: "destructive" });
      setLoading(false);
      return { error: error.message };
    }
    return {};
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      toast({ title: "Update Gagal", description: error.message, variant: "destructive" });
    } else if (data) {
      setUser(data as User);
      toast({ title: "Profil Diperbarui", description: "Profil Anda telah berhasil diperbarui." });
    }
  };

  const value = { user, userRole, loading, login, logout, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
