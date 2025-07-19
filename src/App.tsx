
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import UploadPage from "@/pages/UploadPage";
import ManualInputPage from "@/pages/ManualInputPage"; 
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { StoresPage } from "@/pages/StoresPage";
import { UsersPage } from "@/pages/UsersPage";
import { SettingsPage } from "@/pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { PWAManager } from "@/components/pwa/PWAManager";
import ErrorBoundary from "@/components/ErrorBoundary";

// Konfigurasi QueryClient untuk caching data
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data dianggap fresh selama 5 menit
      refetchOnWindowFocus: false, // Tidak otomatis fetch ulang saat window focus
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <PWAManager>
              <BrowserRouter>
                <Routes>
                  {/* Rute Publik */}
                  <Route path="/login" element={<LoginPage />} />
                  
                  {/* Rute Terproteksi */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Dashboard />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/upload" element={
                    <ProtectedRoute requiredRoles={['super_admin', 'admin']}>
                      <AppLayout>
                        <UploadPage />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/manual-input" element={
                    <ProtectedRoute requiredRoles={['super_admin', 'admin', 'manager']}>
                      <AppLayout>
                        <ManualInputPage />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/analytics" element={
                    <ProtectedRoute requiredRoles={['super_admin', 'admin', 'manager']}>
                      <AppLayout>
                        <AnalyticsPage />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/products" element={
                    <ProtectedRoute requiredRoles={['super_admin', 'admin', 'manager']}>
                      <AppLayout>
                        <ProductsPage />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/stores" element={
                    <ProtectedRoute requiredRoles={['super_admin', 'admin']}>
                      <AppLayout>
                        <StoresPage />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/users" element={
                    <ProtectedRoute requiredRoles={['super_admin']}>
                      <AppLayout>
                        <UsersPage />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/settings" element={
                    <ProtectedRoute requiredRoles={['super_admin']}>
                      <AppLayout>
                        <SettingsPage />
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                  
                  {/* Rute jika halaman tidak ditemukan */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              
              {/* Toast system - single instance at the end */}
              <Toaster />
            </PWAManager>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
