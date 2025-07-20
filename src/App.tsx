import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DateFilterProvider } from "@/contexts/DateFilterContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import UploadPage from "@/pages/UploadPage";
import ManualInputPage from "@/pages/ManualInputPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import ProductsPage from "@/pages/ProductsPage";
import StoresPage from "@/pages/StoresPage";
import UsersPage from "@/pages/UsersPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { PWAManager } from "./components/pwa/PWAManager";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DateFilterProvider>
          <TooltipProvider>
            <Toaster />
            <PWAManager />
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
                  <ProtectedRoute requiredRoles={['super_admin', 'admin']}>
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
          </TooltipProvider>
        </DateFilterProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
