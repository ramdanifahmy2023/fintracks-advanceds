import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, BarChart3 } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreateTestUsersButton } from '@/components/auth/CreateTestUsersButton';
export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const {
    user,
    login
  } = useAuth();
  const {
    isDarkMode,
    toggleDarkMode
  } = useDarkMode();
  const {
    toast
  } = useToast();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('🔐 Form submitted:', {
      email: email.trim().toLowerCase(),
      isSignUp
    });
    if (isSignUp) {
      // Sign up logic
      if (password !== confirmPassword) {
        toast({
          title: "Password Tidak Cocok",
          description: "Password dan konfirmasi password tidak sama.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      try {
        console.log('📝 Attempting signup for:', email.trim());
        const {
          error
        } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: fullName
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        if (error) {
          console.error('❌ Sign up error:', error);
          toast({
            title: "Error Pendaftaran",
            description: error.message,
            variant: "destructive"
          });
        } else {
          console.log('✅ Signup successful');
          toast({
            title: "Pendaftaran Berhasil!",
            description: "Silakan cek email untuk konfirmasi akun, kemudian login."
          });
          setIsSignUp(false);
        }
      } catch (error) {
        console.error('💥 Unexpected signup error:', error);
        toast({
          title: "Error Pendaftaran",
          description: "Terjadi kesalahan tak terduga. Silakan coba lagi.",
          variant: "destructive"
        });
      }
    } else {
      // Login logic
      console.log('🔑 Attempting login...');
      const result = await login(email.trim().toLowerCase(), password);
      if (!result.error && rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
    }
    setIsLoading(false);
  };

  // Quick login helpers for testing
  const quickLogin = (testEmail: string, testPassword: string) => {
    console.log('⚡ Quick login:', {
      email: testEmail
    });
    setEmail(testEmail);
    setPassword(testPassword);
  };
  return <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Hiban Analytics</h1>
            <p className="text-white/80 text-sm">Marketplace Analytics Dashboard</p>
          </div>
        </div>

        {/* Debug and Setup Section */}
        {!isSignUp && <Card className="border-0 shadow-xl bg-red-50/95 backdrop-blur-sm">
            
            
          </Card>}

        {/* Auth Card */}
        <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="font-semibold text-2xl text-slate-900">
              {isSignUp ? 'Buat Akun' : 'Selamat Datang Kembali'}
            </CardTitle>
            <CardDescription>
              {isSignUp ? 'Buat akun dashboard analytics Anda' : 'Masuk ke dashboard analytics Anda'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && <div className="space-y-2">
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <Input id="fullName" type="text" placeholder="Masukkan nama lengkap" value={fullName} onChange={e => setFullName(e.target.value)} required={isSignUp} className="h-11" />
                </div>}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Masukkan email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" className="h-11" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Masukkan password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete={isSignUp ? "new-password" : "current-password"} className="h-11" />
              </div>

              {isSignUp && <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                  <Input id="confirmPassword" type="password" placeholder="Konfirmasi password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required={isSignUp} autoComplete="new-password" className="h-11" />
                </div>}

              <div className="flex items-center justify-between">
                {!isSignUp && <div className="flex items-center space-x-2">
                    <Checkbox id="remember" checked={rememberMe} onCheckedChange={checked => setRememberMe(checked as boolean)} />
                    <Label htmlFor="remember" className="text-sm">
                      Ingat saya
                    </Label>
                  </div>}
                
                <Button type="button" variant="ghost" size="sm" onClick={toggleDarkMode} className="text-muted-foreground hover:text-foreground ml-auto">
                  {isDarkMode ? '☀️' : '🌙'}
                </Button>
              </div>

              <Button type="submit" className="w-full h-11 bg-gradient-primary hover:opacity-90 text-white font-medium shadow-lg" disabled={isLoading}>
                {isLoading ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isSignUp ? 'Membuat Akun...' : 'Masuk...'}
                  </> : isSignUp ? 'Buat Akun' : 'Masuk'}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-4">
              <Button type="button" variant="ghost" className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Sudah punya akun? Masuk' : "Belum punya akun? Daftar"}
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Butuh bantuan? Hubungi administrator
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-white/60 text-xs">
          <p>© 2024 Hiban Analytics. All rights reserved.</p>
        </div>
      </div>
    </div>;
};