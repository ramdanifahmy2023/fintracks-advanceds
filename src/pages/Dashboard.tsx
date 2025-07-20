import { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { GlobalFilters } from '@/components/dashboard/GlobalFilters';
import { GlobalDateFilter } from '@/components/dashboard/GlobalDateFilter';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, BarChart3, Filter } from 'lucide-react';
import { FilterState } from '@/types/dashboard';
import { 
  useOptimizedDashboard, 
  usePlatformsOptimized, 
  useStoresOptimized,
  useOptimizedRealtimeUpdates,
  useDashboardSelectors,
  usePrefetchData
} from '@/hooks/useOptimizedDashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DashboardSkeleton, ChartSkeleton } from '@/components/ui/loading-skeleton';

// Lazy load chart components for better performance
const RevenueTrendChart = lazy(() => import('@/components/dashboard/charts/RevenueTrendChart').then(module => ({ default: module.RevenueTrendChart })));
const PlatformChart = lazy(() => import('@/components/dashboard/charts/PlatformChart').then(module => ({ default: module.PlatformChart })));
const CategoryChart = lazy(() => import('@/components/dashboard/charts/CategoryChart').then(module => ({ default: module.CategoryChart })));

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const { dateRange } = useDateFilter();
  
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
      preset: 'thisMonth'
    },
    platforms: [],
    stores: []
  });

  // Update filters when dateRange from context changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      dateRange
    }));
  }, [dateRange]);

  // Use optimized hooks for better performance
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useOptimizedDashboard(filters);
  const { data: platforms = [] } = usePlatformsOptimized();
  const { data: stores = [] } = useStoresOptimized(filters.platforms);
  
  // Use selectors for memoized data access
  const selectedData = useDashboardSelectors(dashboardData);
  
  // Setup optimized realtime updates
  useOptimizedRealtimeUpdates();
  
  // Prefetch data for better navigation performance
  const { prefetchAnalytics, prefetchProducts } = usePrefetchData();

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  // Handle chart click interactions with prefetching
  const handlePlatformClick = useCallback((platformId: string) => {
    setFilters(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId) 
        ? prev.platforms.filter(id => id !== platformId)
        : [...prev.platforms, platformId]
    }));
    // Prefetch related data
    prefetchAnalytics();
  }, [prefetchAnalytics]);

  const handleCategoryClick = useCallback((category: string) => {
    // Category filtering logic can be implemented here
    prefetchProducts();
  }, [prefetchProducts]);

  const hasError = dashboardError;

  if (hasError) {
    return (
      <div className="space-y-6">
        <GlobalDateFilter />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Terjadi kesalahan saat memuat data dashboard. Silakan refresh halaman atau coba lagi nanti.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show loading state while fetching data
  if (dashboardLoading || !selectedData) {
    return (
      <div className="space-y-0">
        <GlobalDateFilter />
        <div className="space-y-6 px-4 pb-6">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Global Date Filter - Sticky at top */}
      <GlobalDateFilter />

      <div className="space-y-6 px-4 pb-6">
        {/* Hero Section */}
        <div className="bg-gradient-hero rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard Analytics</h1>
              <p className="text-white/80 mb-4">
                Selamat datang kembali, {user?.full_name}! Monitor performa bisnis marketplace Anda.
              </p>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  {userRole?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <div className="text-sm opacity-90">
                  Periode: {format(filters.dateRange.from, 'dd MMM yyyy')} - {format(filters.dateRange.to, 'dd MMM yyyy')}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <BarChart3 className="h-24 w-24 text-white/30" />
            </div>
          </div>
        </div>

        <GlobalFilters 
          filters={filters} 
          onFiltersChange={handleFiltersChange}
          loading={dashboardLoading}
        />

        <SummaryCards 
          data={selectedData.summary} 
          loading={dashboardLoading}
        />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="platforms">Platform</TabsTrigger>
            <TabsTrigger value="products">Produk</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Suspense fallback={<ChartSkeleton />}>
              <RevenueTrendChart 
                data={selectedData.revenueTrend} 
                loading={dashboardLoading} 
              />
            </Suspense>
          </TabsContent>
          
          <TabsContent value="platforms" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Suspense fallback={<ChartSkeleton />}>
                <PlatformChart 
                  data={selectedData.platformPerformance} 
                  loading={dashboardLoading}
                  onPlatformClick={handlePlatformClick}
                />
              </Suspense>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Suspense fallback={<ChartSkeleton />}>
                <CategoryChart 
                  data={selectedData.topProducts} 
                  loading={dashboardLoading}
                  onCategoryClick={handleCategoryClick}
                />
              </Suspense>
            </div>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>
              {filters.platforms.length > 0 || filters.stores.length > 0 ? (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filtered data</span>
                </div>
              ) : (
                'Semua platform dan toko'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : selectedData.recentTransactions.length > 0 ? (
              <div className="space-y-2">
                {selectedData.recentTransactions.slice(0, 5).map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.platform_name} • {transaction.store_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{transaction.selling_price?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
                      <p className="text-sm text-muted-foreground">{transaction.delivery_status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Data transaksi tersedia setelah upload data CSV
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
