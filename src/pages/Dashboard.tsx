
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

// FIXED PROFIT ANALYTICS IMPORTS
import { useProfitAnalytics } from '@/hooks/useProfitAnalytics';
import { useStoreProfitSummary, useAdExpensesFiltered } from '@/hooks/useProfitQueries';
import { ProfitAnalyticsSection } from '@/components/analytics/ProfitAnalyticsSection';
import { AnalyticsErrorBoundary } from '@/components/analytics/AnalyticsErrorBoundary';

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
  
  // FIXED PROFIT ANALYTICS WITH DIRECT TABLE QUERIES
  const { data: profitData, isLoading: profitLoading, error: profitError } = useProfitAnalytics(filters);
  const { data: storeProfitData, isLoading: storeProfitLoading } = useStoreProfitSummary(filters);
  const { data: adExpensesData, isLoading: adExpensesLoading } = useAdExpensesFiltered(filters);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    console.log('📊 Dashboard: Filters changed:', newFilters);
    setFilters(newFilters);
  }, []);

  const hasError = summaryError || chartError || profitError;

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <GlobalFilters 
            filters={filters} 
            onFiltersChange={handleFiltersChange}
            loading={summaryLoading || chartLoading || profitLoading}
          />
          <Alert variant="destructive" className="shadow-lg">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Terjadi kesalahan saat memuat data dashboard. Silakan refresh halaman atau coba lagi nanti.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Filter Component - Sticky at top */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <GlobalFilters 
            filters={filters} 
            onFiltersChange={handleFiltersChange}
            loading={summaryLoading || chartLoading || profitLoading}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Enhanced Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-1">Dashboard Analitik</h1>
                  <p className="text-blue-100 text-lg">
                    Selamat datang kembali, <span className="font-semibold">{user?.full_name}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full backdrop-blur-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">
                    {userRole?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
                  <span className="text-sm">
                    📅 {format(filters.dateRange.from, 'dd MMM yyyy')} - {format(filters.dateRange.to, 'dd MMM yyyy')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="relative">
                <div className="w-32 h-32 bg-white/10 rounded-3xl backdrop-blur-sm flex items-center justify-center">
                  <BarChart3 className="h-16 w-16 text-white/60" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="animate-fade-in">
          <SummaryCards 
            data={summaryData} 
            profitData={profitData}
            loading={summaryLoading}
            profitLoading={profitLoading}
          />
        </div>

        {/* Enhanced Tabs Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm rounded-2xl p-1 shadow-inner">
              <TabsTrigger 
                value="overview" 
                className="rounded-xl font-medium data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                🔍 Ringkasan
              </TabsTrigger>
              <TabsTrigger 
                value="platforms" 
                className="rounded-xl font-medium data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                🏪 Platform
              </TabsTrigger>
              <TabsTrigger 
                value="products" 
                className="rounded-xl font-medium data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                📦 Produk
              </TabsTrigger>
              <TabsTrigger 
                value="profit" 
                className="rounded-xl font-medium data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                💰 Analisis Profit
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-8">
              <TabsContent value="overview" className="space-y-6 animate-fade-in">
                <RevenueTrendChart data={chartData?.revenueTrend || []} loading={chartLoading} />
              </TabsContent>
              
              <TabsContent value="platforms" className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <PlatformChart data={chartData?.platformPerf || []} loading={chartLoading} />
                </div>
              </TabsContent>
              
              <TabsContent value="products" className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <CategoryChart data={chartData?.productPerf || []} loading={chartLoading} />
                </div>
              </TabsContent>

              <TabsContent value="profit" className="space-y-6 animate-fade-in">
                <AnalyticsErrorBoundary error={profitError}>
                  {profitData && (
                    <ProfitAnalyticsSection
                      data={profitData}
                      loading={profitLoading || storeProfitLoading || adExpensesLoading}
                      showKPIs={true}
                      showTable={true}
                      title="Analisis Profit Terintegrasi"
                    />
                  )}
                  {(profitLoading || storeProfitLoading || adExpensesLoading) && (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                        <div className="text-muted-foreground">
                          Memuat data analisis profit...
                        </div>
                      </div>
                    </div>
                  )}
                </AnalyticsErrorBoundary>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Enhanced Recent Transactions */}
        <Card className="bg-white/70 backdrop-blur-sm shadow-xl border border-white/20 rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-white/20">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-blue-100 rounded-xl">
                📋
              </div>
              Transaksi Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                  <div className="text-muted-foreground">Memuat transaksi...</div>
                </div>
              </div>
            ) : recentTransactions && recentTransactions.length > 0 ? (
              <div className="rounded-2xl overflow-hidden border border-white/20">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-semibold">Nomor Order</TableHead>
                      <TableHead className="font-semibold">Produk</TableHead>
                      <TableHead className="font-semibold">Platform</TableHead>
                      <TableHead className="font-semibold">Jumlah</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-blue-50/50 transition-colors">
                        <TableCell className="font-medium">{transaction.order_number}</TableCell>
                        <TableCell className="max-w-xs truncate">{transaction.product_name}</TableCell>
                        <TableCell>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {transaction.platforms?.platform_name || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(transaction.selling_price)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={transaction.delivery_status === 'Selesai' ? 'default' : 'secondary'}
                            className={transaction.delivery_status === 'Selesai' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {transaction.delivery_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <div className="text-xl font-medium text-muted-foreground mb-2">
                  Belum ada transaksi
                </div>
                <div className="text-sm text-muted-foreground">
                  Belum ada transaksi dalam periode ini. Coba ubah filter tanggal.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
