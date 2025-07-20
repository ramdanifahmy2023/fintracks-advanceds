
import { useState, useEffect, useCallback } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { GlobalDateFilter } from '@/components/dashboard/GlobalDateFilter';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, BarChart3 } from 'lucide-react';
import { FilterState } from '@/types/dashboard';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, userRole } = useAuth();
  const { dateRange } = useDateFilter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  
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

  // Simple data fetching without complex optimizations
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching dashboard data...');
      
      // Simple direct query to get basic data
      const { data: salesData, error: salesError } = await supabase
        .from('sales_transactions')
        .select(`
          id,
          order_number,
          product_name,
          delivery_status,
          selling_price,
          profit,
          quantity,
          order_created_at,
          platforms!inner(platform_name),
          stores!inner(store_name)
        `)
        .gte('order_created_at', filters.dateRange.from.toISOString())
        .lte('order_created_at', filters.dateRange.to.toISOString())
        .order('order_created_at', { ascending: false })
        .limit(100);

      if (salesError) {
        console.error('❌ Sales data error:', salesError);
        throw salesError;
      }

      console.log('✅ Sales data fetched:', salesData?.length || 0, 'records');

      // Calculate simple summary from the data
      const summary = {
        total_orders: salesData?.length || 0,
        total_packages: salesData?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
        total_revenue: salesData?.reduce((sum, item) => sum + (Number(item.selling_price) || 0), 0) || 0,
        total_profit: salesData?.reduce((sum, item) => sum + (Number(item.profit) || 0), 0) || 0,
        completed_orders: salesData?.filter(item => item.delivery_status === 'Selesai').length || 0,
        completed_revenue: salesData?.filter(item => item.delivery_status === 'Selesai').reduce((sum, item) => sum + (Number(item.selling_price) || 0), 0) || 0,
        completed_profit: salesData?.filter(item => item.delivery_status === 'Selesai').reduce((sum, item) => sum + (Number(item.profit) || 0), 0) || 0,
        shipping_orders: salesData?.filter(item => item.delivery_status === 'Sedang Dikirim').length || 0,
        cancelled_orders: salesData?.filter(item => item.delivery_status === 'Batal').length || 0,
        returned_orders: salesData?.filter(item => item.delivery_status === 'Return').length || 0,
      };

      setDashboardData({
        summary,
        recent_transactions: salesData?.slice(0, 10) || [],
        platform_performance: [],
        revenue_trend: [],
        top_products: []
      });

      console.log('✅ Dashboard data processed successfully');
    } catch (err: any) {
      console.error('❌ Dashboard fetch error:', err);
      setError(err.message || 'Terjadi kesalahan saat memuat data');
    } finally {
      setLoading(false);
    }
  }, [filters.dateRange]);

  // Load data on component mount and filter changes
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <GlobalDateFilter />
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <br />
            <button 
              onClick={fetchDashboardData}
              className="mt-2 px-3 py-1 bg-destructive text-destructive-foreground rounded text-sm hover:bg-destructive/90"
            >
              Coba Lagi
            </button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-0">
        <GlobalDateFilter />
        <div className="space-y-6 px-4 pb-6">
          <div className="bg-gradient-hero rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard Analytics</h1>
                <p className="text-white/80 mb-4">Loading data...</p>
              </div>
              <div className="hidden md:block">
                <BarChart3 className="h-24 w-24 text-white/30" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(null).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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

        <SummaryCards 
          data={dashboardData?.summary} 
          loading={loading}
        />

        <Card>
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>
              {dashboardData?.recent_transactions?.length || 0} transaksi terbaru
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData?.recent_transactions?.length > 0 ? (
              <div className="space-y-2">
                {dashboardData.recent_transactions.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.platforms?.platform_name} • {transaction.stores?.store_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{Number(transaction.selling_price)?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</p>
                      <p className="text-sm text-muted-foreground">{transaction.delivery_status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                {loading ? 'Loading...' : 'Data transaksi tersedia setelah upload data CSV'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
