import { useState, useCallback } from 'react';
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
import { useDashboardSummary, useChartData, useRecentTransactions, useRealtimeUpdates } from '@/hooks/useDashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';

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

  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useDashboardSummary(filters);
  const { data: chartData, isLoading: chartLoading, error: chartError } = useChartData(filters);
  const { data: recentTransactions, isLoading: transactionsLoading, error: transactionsError } = useRecentTransactions(filters);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const hasError = summaryError || chartError;

  if (hasError) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
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
        loading={summaryLoading || chartLoading}
      />

      <SummaryCards 
        data={summaryData} 
        loading={summaryLoading}
      />

      <div className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
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
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4">Platform Insights</h3>
                <div className="space-y-4">
                  {chartData?.platformPerf?.slice(0, 3).map((platform) => (
                    <div key={platform.platform_name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{platform.platform_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(platform.total_transactions || 0).toLocaleString()} transaksi
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-success">
                          {(platform.completion_rate_percentage || 0).toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">completion</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-muted-foreground py-8">
                      {chartLoading ? 'Loading...' : 'Tidak ada data platform'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <CategoryChart data={chartData?.productPerf || []} loading={chartLoading} />
              <div className="bg-card rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4">Top Produk</h3>
                <div className="space-y-4">
                  {chartData?.productPerf?.slice(0, 5).map((product) => (
                    <div key={product.sku_reference} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.category || 'Tidak dikategorikan'}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-medium text-success">
                          {((product.completed_profit || 0) / 1000000).toFixed(1)}M
                        </p>
                        <p className="text-sm text-muted-foreground">profit</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-muted-foreground py-8">
                      {chartLoading ? 'Loading...' : 'Tidak ada data produk'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
          <CardDescription>10 transaksi terakhir berdasarkan filter yang dipilih</CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading transaksi...</div>
            </div>
          ) : recentTransactions && recentTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>No. Pesanan</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.order_created_at), 'dd MMM yyyy')}
                    </TableCell>
                    <TableCell>{transaction.platforms?.platform_name}</TableCell>
                    <TableCell className="font-medium">{transaction.order_number}</TableCell>
                    <TableCell className="max-w-xs truncate">{transaction.product_name}</TableCell>
                    <TableCell>
                      <Badge variant={
                        transaction.delivery_status === 'Selesai' ? 'default' :
                        transaction.delivery_status === 'Sedang Dikirim' ? 'secondary' :
                        transaction.delivery_status === 'Batal' ? 'destructive' : 'outline'
                      }>
                        {transaction.delivery_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(transaction.selling_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={transaction.profit > 0 ? 'text-success' : 'text-destructive'}>
                        {formatCurrency(transaction.profit)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Tidak ada transaksi dalam periode yang dipilih
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;