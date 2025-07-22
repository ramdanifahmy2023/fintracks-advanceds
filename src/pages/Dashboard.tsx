// =============================================
// FIXED: src/pages/Dashboard.tsx (Temporary - Until Lovable Creates Components)
// =============================================

import { useState, useCallback, useEffect } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { GlobalFilters } from '@/components/dashboard/GlobalFilters';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { RevenueTrendChart } from '@/components/dashboard/charts/RevenueTrendChart';
import { PlatformChart } from '@/components/dashboard/charts/PlatformChart';
import { CategoryChart } from '@/components/dashboard/charts/CategoryChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, BarChart3 } from 'lucide-react';
import { FilterState } from '@/types/dashboard';
import { 
  useDashboardSummary, 
  useChartData, 
  useRecentTransactions, 
  useRealtimeUpdates 
} from '@/hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';

// COMMENTED OUT IMPORTS UNTIL LOVABLE CREATES THE FILES
// import { useProfitAnalytics } from '@/hooks/useProfitAnalytics';
// import { StoreProfitAnalysis } from '@/components/analytics/StoreProfitAnalysis';
// import { ProfitKPICards } from '@/components/analytics/ProfitKPICards';
// import { AnalyticsErrorBoundary } from '@/components/analytics/AnalyticsErrorBoundary';

const Dashboard = () => {
  const { user, userRole } = useAuth();
  
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
      preset: 'thisMonth'
    },
    platforms: [],
    stores: []
  });

  useRealtimeUpdates();

  // Log when component mounts and when filters change
  useEffect(() => {
    console.log('📊 Dashboard: Component mounted with filters:', filters);
  }, []);

  useEffect(() => {
    console.log('📊 Dashboard: Filters changed:', {
      dateRange: {
        from: format(filters.dateRange.from, 'yyyy-MM-dd'),
        to: format(filters.dateRange.to, 'yyyy-MM-dd'),
        preset: filters.dateRange.preset
      },
      platforms: filters.platforms,
      stores: filters.stores
    });
  }, [filters]);

  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useDashboardSummary(filters);
  const { data: chartData, isLoading: chartLoading, error: chartError } = useChartData(filters);
  const { data: recentTransactions, isLoading: transactionsLoading, error: transactionsError } = useRecentTransactions(filters);
  
  // COMMENTED OUT UNTIL LOVABLE CREATES THE HOOK
  // const { data: profitData, isLoading: profitLoading, error: profitError } = useProfitAnalytics(filters);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    console.log('📊 Dashboard: All filters changed:', newFilters);
    setFilters(newFilters);
  }, []);

  const hasError = summaryError || chartError;

  if (hasError) {
    return (
      <div className="space-y-6">
        <GlobalFilters 
          filters={filters} 
          onFiltersChange={handleFiltersChange}
          loading={summaryLoading || chartLoading}
        />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Terjadi kesalahan saat memuat data dashboard. Silakan refresh halaman atau coba lagi nanti.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Single Filter Component - Sticky at top */}
      <GlobalFilters 
        filters={filters} 
        onFiltersChange={handleFiltersChange}
        loading={summaryLoading || chartLoading}
      />

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

        <SummaryCards 
          data={summaryData} 
          loading={summaryLoading}
        />

        {/* PROFIT KPI CARDS PLACEHOLDER */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">🚧 Profit Analytics Coming Soon</h3>
              <p className="text-muted-foreground">
                Profit KPI cards will appear here once Lovable AI creates the components
              </p>
              <div className="mt-4 text-sm text-blue-600">
                Features: Net Profit, Ad Costs, Profit Margins, Store Performance
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          {/* TEMPORARY: Keep 3 tabs until profit components are ready */}
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="platforms">Platform</TabsTrigger>
            <TabsTrigger value="products">Produk</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <RevenueTrendChart data={chartData?.revenueTrend || []} loading={chartLoading} />
          </TabsContent>
          
          <TabsContent value="platforms" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <PlatformChart data={chartData?.platformPerf || []} loading={chartLoading} />
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <CategoryChart data={chartData?.productPerf || []} loading={chartLoading} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Transactions - EXISTING */}
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : recentTransactions && recentTransactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.order_number}</TableCell>
                      <TableCell>{transaction.product_name}</TableCell>
                      <TableCell>{transaction.platforms?.platform_name || 'N/A'}</TableCell>
                      <TableCell>{formatCurrency(transaction.selling_price)}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.delivery_status === 'Selesai' ? 'default' : 'secondary'}>
                          {transaction.delivery_status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Belum ada transaksi dalam periode ini. Coba ubah filter tanggal.
              </div>
            )}
          </CardContent>
        </Card>

        {/* PROFIT PREVIEW SECTION */}
        <Card>
          <CardHeader>
            <CardTitle>Preview: Profit Analytics (Coming Soon)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-400">Rp 35M</div>
                <div className="text-sm text-gray-500">Net Profit</div>
              </div>
              <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-400">Rp 0</div>
                <div className="text-sm text-gray-500">Ad Costs</div>
              </div>
              <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-400">36.7%</div>
                <div className="text-sm text-gray-500">Avg Margin</div>
              </div>
              <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-400">2</div>
                <div className="text-sm text-gray-500">Active Stores</div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                🎯 Preview berdasarkan data Supabase: Hiban Signature dengan 48M revenue & 36% margin
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;