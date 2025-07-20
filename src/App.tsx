
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { DateFilterProvider } from '@/contexts/DateFilterContext';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { PWAManager } from "@/components/pwa/PWAManager";
import ErrorBoundary from "@/components/ErrorBoundary";

// Direct imports - no lazy loading for now to fix loading issues
import Dashboard from "@/pages/Dashboard";
import UploadPage from "@/pages/UploadPage";
import ManualInputPage from "@/pages/ManualInputPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { StoresPage } from "@/pages/StoresPage";
import { UsersPage } from "@/pages/UsersPage";
import { SettingsPage } from "@/pages/SettingsPage";
import UserGuidePage from "@/pages/UserGuidePage";
import NotFound from "./pages/NotFound";

// Simple QueryClient configuration - no heavy optimizations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
      throwOnError: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  
  return (
    <ErrorBoundary fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">Application Error</h2>
          <p className="text-muted-foreground mb-4">
            Something went wrong. Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    }>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <QueryClientProvider client={queryClient}>
          <DateFilterProvider>
            <AuthProvider>
            <TooltipProvider>
              <PWAManager>
                <BrowserRouter>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    
                    {/* Protected Routes - Direct imports, no lazy loading */}
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
                          <ErrorBoundary fallback={
                            <div className="p-8 text-center">
                              <h3 className="text-lg font-semibold text-destructive mb-2">Analytics Error</h3>
                              <p className="text-muted-foreground">
                                Unable to load analytics page. Please try refreshing.
                              </p>
                            </div>
                          }>
                            <AnalyticsPage />
                          </ErrorBoundary>
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
                    
                    <Route path="/help" element={
                      <ProtectedRoute>
                        <AppLayout>
                          <UserGuidePage />
                        </AppLayout>
                      </ProtectedRoute>
                    } />
                    
                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
                
                {/* Toast system - single instance */}
                <Toaster />
              </PWAManager>
            </TooltipProvider>
            </AuthProvider>
          </DateFilterProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
