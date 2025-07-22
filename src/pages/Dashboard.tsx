// =============================================
// FIXED: src/pages/Dashboard.tsx - Without Profit Analytics (Fase 1 Focus)
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
import { AlertTriangle, BarChart3, TrendingUp } from 'lucide-react';
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

// COMMENT OUT PROFIT ANALYTICS FOR NOW (FASE 1 FOCUS)
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
  
  // COMMENT OUT PROFIT ANALYTICS FOR NOW
  // const { data: profitData, isLoading: profitLoading, error: profitError } = useProfitAnalytics(filters);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    console.log('📊 Dashboard: All filters changed:', newFilters);
    setFilters(newFilters);
  }, []);

  const hasError = summaryError || chartError;

  if (hasError) {
    return (
      <div className="min-h-screen bg-background">
        {/* Unified Filter - Even during error state */}
        <GlobalFilters 
          filters={filters} 
          onFiltersChange={handleFiltersChange}
          loading={summaryLoading || chartLoading}
        />
        
        <div className="px-4 py-6">
          <Alert variant="destructive">
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
    <div className="min-h-screen bg-background">
      {/* UNIFIED FILTER COMPONENT - Sticky at top, no duplication */}
      <GlobalFilters 
        filters={filters} 
        onFiltersChange={handleFiltersChange}
        loading={summaryLoading || chartLoading}
      />

      {/* Main Content */}
      <div className="space-y-6 px-4 pb-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Dashboard Analytics</h1>
              <p className="text-white/90 mb-4 max-w-2xl">
                Selamat datang kembali, <span className="font-semibold">{user?.full_name}</span>! 
                Monitor performa bisnis marketplace Anda dengan data real-time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                    {userRole?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </div>
                  <div className="h-4 w-px bg-white/30" />
                  <span className="text-sm text-white/80">
                    Periode: {format(filters.dateRange.from, 'dd MMM')} - {format(filters.dateRange.to, 'dd MMM yyyy')}
                  </span>
                </div>
                {(filters.platforms.length > 0 || filters.stores.length > 0) && (
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <TrendingUp className="h-4 w-4" />
                    <span>
                      {filters.platforms.length > 0 && `${filters.platforms.length} platform`}
                      {filters.platforms.length > 0 && filters.stores.length > 0 && ' • '}
                      {filters.stores.length > 0 && `${filters.stores.length} toko`}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="hidden lg:block">
              <BarChart3 className="h-24 w-24 text-white/20" />
            </div>
          </div>
        </div>

        {/* Main KPI Cards */}
        <SummaryCards 
          data={summaryData} 
          loading={summaryLoading}
        />

        {/* COMMENTED OUT: Profit Analytics KPI Cards */}
        {/* Will be enabled in Fase 2 after fixing database views */}
        {/*
        {profitData?.storeSummaryProfit && profitData.storeSummaryProfit.length > 0 && (
          <AnalyticsErrorBoundary error={profitError}>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold">Analisis Profit Detail</h2>
              </div>
              <ProfitKPICards 
                data={profitData.storeSummaryProfit} 
                loading={profitLoading} 
              />
            </div>
          </AnalyticsErrorBoundary>
        )}
        */}

        {/* Charts & Analytics Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          {/* SIMPLIFIED TO 3 TABS FOR FASE 1 */}
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="platforms">Platform</TabsTrigger>
            <TabsTrigger value="products">Produk</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <RevenueTrendChart data={chartData?.revenueTrend || []} loading={chartLoading} />
            
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Periode Aktif</p>
                    <p className="text-lg font-semibold">
                      {Math.ceil((filters.dateRange.to.getTime() - filters.dateRange.from.getTime()) / (1000 * 60 * 60 * 24))} hari
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Platform Aktif</p>
                    <p className="text-lg font-semibold">
                      {filters.platforms.length > 0 ? filters.platforms.length : 'Semua'}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Toko Dipantau</p>
                    <p className="text-lg font-semibold">
                      {filters.stores.length > 0 ? filters.stores.length : 'Semua'}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="platforms" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <PlatformChart data={chartData?.platformPerf || []} loading={chartLoading} />
              
              {/* Platform Summary Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  {chartLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-muted-foreground">Loading...</div>
                    </div>
                  ) : chartData?.platformPerf && chartData.platformPerf.length > 0 ? (
                    <div className="space-y-4">
                      {chartData.platformPerf.slice(0, 5).map((platform, index) => (
                        <div key={platform.platform_id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{platform.platform_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {platform.total_transactions} transaksi
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(platform.total_revenue)}</p>
                            <p className="text-sm text-green-600">
                              {platform.profit_margin_percentage.toFixed(1)}% margin
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Tidak ada data platform untuk ditampilkan
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <CategoryChart data={chartData?.productPerf || []} loading={chartLoading} />
              
              {/* Top Products Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Produk Terlaris</CardTitle>
                </CardHeader>
                <CardContent>
                  {chartLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-muted-foreground">Loading...</div>
                    </div>
                  ) : chartData?.productPerf && chartData.productPerf.length > 0 ? (
                    <div className="space-y-4">
                      {chartData.productPerf
                        .sort((a, b) => b.completed_revenue - a.completed_revenue)
                        .slice(0, 5)
                        .map((product, index) => (
                        <div key={product.sku_reference} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium text-green-700">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{product.product_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.total_quantity_sold} terjual
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(product.completed_revenue)}</p>
                            <p className="text-sm text-green-600">
                              {formatCurrency(product.completed_profit)} profit
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Tidak ada data produk untuk ditampilkan
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PROFIT TAB COMMENTED OUT FOR FASE 1 */}
          {/* Will be re-enabled in Fase 2 after fixing database schema */}
          {/*
          <TabsContent value="profit" className="space-y-6">
            <AnalyticsErrorBoundary error={profitError}>
              <StoreProfitAnalysis 
                data={profitData?.storeSummaryProfit || []} 
                loading={profitLoading} 
              />
            </AnalyticsErrorBoundary>
          </TabsContent>
          */}
        </Tabs>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Transaksi Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-muted-foreground">Loading transaksi...</span>
              </div>
            ) : recentTransactions && recentTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Toko</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{transaction.order_number}</TableCell>
                        <TableCell className="max-w-xs truncate">{transaction.product_name}</TableCell>
                        <TableCell>{transaction.platforms?.platform_name || 'N/A'}</TableCell>
                        <TableCell>{transaction.stores?.store_name || 'N/A'}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(transaction.selling_price)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={transaction.profit > 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(transaction.profit)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={
                              transaction.delivery_status === 'Selesai' ? 'default' : 
                              transaction.delivery_status === 'Sedang Dikirim' ? 'secondary' :
                              transaction.delivery_status === 'Batal' ? 'destructive' : 'outline'
                            }
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
              <div className="text-center text-muted-foreground py-12">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Belum ada transaksi</p>
                <p className="text-sm">
                  Tidak ada transaksi dalam periode ini. Coba ubah filter tanggal atau platform.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;