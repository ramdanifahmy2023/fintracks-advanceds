
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
      <div className="space-y-6">
        <GlobalFilters 
          filters={filters} 
          onFiltersChange={handleFiltersChange}
          loading={summaryLoading || chartLoading || profitLoading}
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
        loading={summaryLoading || chartLoading || profitLoading}
      />

      <div className="space-y-6 px-4 pb-6">
        {/* Hero Section */}
        <div className="bg-gradient-hero rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard Analitik</h1>
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
          profitData={profitData}
          loading={summaryLoading}
          profitLoading={profitLoading}
        />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Ringkasan</TabsTrigger>
            <TabsTrigger value="platforms">Platform</TabsTrigger>
            <TabsTrigger value="products">Produk</TabsTrigger>
            <TabsTrigger value="profit">Analisis Profit</TabsTrigger>
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

          {/* FIXED PROFIT ANALYSIS TAB */}
          <TabsContent value="profit" className="space-y-6">
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
                <div className="flex items-center justify-center py-8">
                  <div className="text-muted-foreground">
                    Memuat data analisis profit...
                  </div>
                </div>
              )}
            </AnalyticsErrorBoundary>
          </TabsContent>
        </Tabs>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Memuat...</div>
              </div>
            ) : recentTransactions && recentTransactions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nomor Order</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Jumlah</TableHead>
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
      </div>
    </div>
  );
};

export default Dashboard;
