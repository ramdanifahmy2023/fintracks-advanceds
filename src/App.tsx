import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import UploadPage from "@/pages/UploadPage";
import { ManualInputPlaceholder } from "@/components/placeholders/ManualInputPlaceholder";
import { AnalyticsPlaceholder } from "@/components/placeholders/AnalyticsPlaceholder";
import { ProductsPlaceholder, StoresPlaceholder, UsersPlaceholder, SettingsPlaceholder } from "@/components/placeholders/ProductsPlaceholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
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
              <ProtectedRoute requiredRoles={['super_admin', 'admin']}>
                <AppLayout>
                  <ManualInputPlaceholder />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute requiredRoles={['super_admin', 'admin', 'manager']}>
                <AppLayout>
                  <AnalyticsPlaceholder />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/products" element={
              <ProtectedRoute requiredRoles={['super_admin', 'admin', 'manager']}>
                <AppLayout>
                  <ProductsPlaceholder />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/stores" element={
              <ProtectedRoute requiredRoles={['super_admin', 'admin']}>
                <AppLayout>
                  <StoresPlaceholder />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/users" element={
              <ProtectedRoute requiredRoles={['super_admin']}>
                <AppLayout>
                  <UsersPlaceholder />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute requiredRoles={['super_admin']}>
                <AppLayout>
                  <SettingsPlaceholder />
                </AppLayout>
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
