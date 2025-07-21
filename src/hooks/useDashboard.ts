import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FilterState, DashboardSummary, ChartData } from '@/types/dashboard';
import { useEffect } from 'react';

export const usePlatforms = () => {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      console.log('🔍 usePlatforms: Starting query...');
      
      try {
        const { data, error, count } = await supabase
          .from('platforms')
          .select('id, platform_name, platform_code, is_active', { count: 'exact' })
          .eq('is_active', true)
          .order('platform_name');
        
        if (error) {
          console.error('❌ usePlatforms: Query error:', error);
          throw error;
        }
        
        console.log('✅ usePlatforms: Query successful');
        console.log('📊 usePlatforms: Data received:', {
          count: count,
          recordsReturned: data?.length || 0,
          sampleData: data?.slice(0, 3)
        });
        
        return data || [];
      } catch (error) {
        console.error('❌ usePlatforms: Unexpected error:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      console.log(`🔄 usePlatforms: Retry attempt ${failureCount + 1}`);
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useStores = (platformIds: string[]) => {
  return useQuery({
    queryKey: ['stores', platformIds],
    queryFn: async () => {
      console.log('🔍 useStores: Starting query with platforms:', platformIds);
      
      try {
        let query = supabase
          .from('stores')
          .select('id, store_name, store_id_external, platform_id, platforms(platform_name)', { count: 'exact' })
          .eq('is_active', true);
        
        if (platformIds.length > 0) {
          console.log('🔍 useStores: Filtering by platform IDs:', platformIds);
          query = query.in('platform_id', platformIds);
        }
        
        const { data, error, count } = await query.order('store_name');
        
        if (error) {
          console.error('❌ useStores: Query error:', error);
          throw error;
        }
        
        console.log('✅ useStores: Query successful');
        console.log('📊 useStores: Data received:', {
          count: count,
          recordsReturned: data?.length || 0,
          platformFilter: platformIds.length > 0 ? platformIds : 'No filter applied',
          sampleData: data?.slice(0, 3)
        });
        
        return data || [];
      } catch (error) {
        console.error('❌ useStores: Unexpected error:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000,
    enabled: true,
    retry: (failureCount, error) => {
      console.log(`🔄 useStores: Retry attempt ${failureCount + 1}`);
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// FIXED: Dashboard Summary with REAL DATA (same logic as Analytics KPI)
export const useDashboardSummary = (filters: FilterState) => {
  return useQuery({
    queryKey: ['dashboard-summary', filters],
    queryFn: async () => {
      console.log('🔍 useDashboardSummary: Fetching with filters:', {
        dateRange: {
          from: filters.dateRange.from.toISOString().split('T')[0],
          to: filters.dateRange.to.toISOString().split('T')[0]
        },
        platforms: filters.platforms,
        stores: filters.stores
      });
      
      try {
        const startDate = filters.dateRange.from.toISOString().split('T')[0];
        const endDate = filters.dateRange.to.toISOString().split('T')[0];

        // Expand date range to capture more data (same logic as Analytics)
        const expandedStartDate = new Date(filters.dateRange.from.getTime() - (90 * 24 * 60 * 60 * 1000));
        const expandedStart = expandedStartDate.toISOString().split('T')[0];

        console.log('📅 Dashboard date range:', {
          original: `${startDate} to ${endDate}`,
          expanded: `${expandedStart} to ${endDate}`
        });

        // Get transactions data with expanded date range
        let query = supabase
          .from('sales_transactions')
          .select(`
            selling_price,
            profit,
            quantity,
            delivery_status,
            order_created_at,
            platforms!inner(platform_name),
            stores!inner(store_name)
          `)
          .gte('order_created_at', expandedStart)
          .lte('order_created_at', endDate);

        // Apply platform filter
        if (filters.platforms.length > 0) {
          query = query.in('platform_id', filters.platforms);
        }

        // Apply store filter
        if (filters.stores.length > 0) {
          query = query.in('store_id', filters.stores);
        }

        const { data: transactions, error } = await query;

        if (error) {
          console.error('❌ useDashboardSummary: Error:', error);
          throw error;
        }

        console.log('📊 Dashboard transactions found:', {
          total: transactions?.length || 0,
          sample: transactions?.[0]
        });

        // If no data found, return zero values
        if (!transactions || transactions.length === 0) {
          console.log('⚠️ No transactions found, returning zero summary');
          return {
            total_orders: 0,
            total_packages: 0,
            total_revenue: 0,
            total_profit: 0,
            completed_orders: 0,
            completed_revenue: 0,
            completed_profit: 0,
            shipping_orders: 0,
            shipping_revenue: 0,
            cancelled_orders: 0,
            cancelled_revenue: 0,
            returned_orders: 0,
            returned_revenue: 0
          };
        }

        // Calculate summary metrics
        const summary = {
          total_orders: transactions.length,
          total_packages: transactions.reduce((sum, t) => sum + Number(t.quantity || 0), 0),
          total_revenue: transactions.reduce((sum, t) => sum + Number(t.selling_price || 0), 0),
          total_profit: transactions.reduce((sum, t) => sum + Number(t.profit || 0), 0),
          completed_orders: transactions.filter(t => t.delivery_status === 'Selesai').length,
          completed_revenue: transactions
            .filter(t => t.delivery_status === 'Selesai')
            .reduce((sum, t) => sum + Number(t.selling_price || 0), 0),
          completed_profit: transactions
            .filter(t => t.delivery_status === 'Selesai')
            .reduce((sum, t) => sum + Number(t.profit || 0), 0),
          shipping_orders: transactions.filter(t => t.delivery_status === 'Sedang Dikirim').length,
          shipping_revenue: transactions
            .filter(t => t.delivery_status === 'Sedang Dikirim')
            .reduce((sum, t) => sum + Number(t.selling_price || 0), 0),
          cancelled_orders: transactions.filter(t => t.delivery_status === 'Batal').length,
          cancelled_revenue: transactions
            .filter(t => t.delivery_status === 'Batal')
            .reduce((sum, t) => sum + Number(t.selling_price || 0), 0),
          returned_orders: transactions.filter(t => t.delivery_status === 'Return').length,
          returned_revenue: transactions
            .filter(t => t.delivery_status === 'Return')
            .reduce((sum, t) => sum + Number(t.selling_price || 0), 0)
        };

        console.log('✅ Dashboard summary calculated:', summary);
        return summary as DashboardSummary;
      } catch (error) {
        console.error('❌ useDashboardSummary: Unexpected error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// FIXED: Chart Data with REAL DATA
export const useChartData = (filters: FilterState) => {
  return useQuery({
    queryKey: ['chart-data', filters],
    queryFn: async () => {
      console.log('🔍 useChartData: Fetching with filters:', {
        dateRange: {
          from: filters.dateRange.from.toISOString().split('T')[0],
          to: filters.dateRange.to.toISOString().split('T')[0]
        },
        platforms: filters.platforms,
        stores: filters.stores
      });
      
      try {
        const startDate = filters.dateRange.from.toISOString().split('T')[0];
        const endDate = filters.dateRange.to.toISOString().split('T')[0];

        // Expand date range to capture more data
        const expandedStartDate = new Date(filters.dateRange.from.getTime() - (90 * 24 * 60 * 60 * 1000));
        const expandedStart = expandedStartDate.toISOString().split('T')[0];

        // Revenue trend data
        let revenueTrendQuery = supabase
          .from('sales_transactions')
          .select(`
            order_created_at,
            selling_price,
            profit,
            quantity,
            platforms!inner(platform_name)
          `)
          .gte('order_created_at', expandedStart)
          .lte('order_created_at', endDate)
          .order('order_created_at');

        if (filters.platforms.length > 0) {
          revenueTrendQuery = revenueTrendQuery.in('platform_id', filters.platforms);
        }

        // Platform performance data
        let platformPerfQuery = supabase
          .from('sales_transactions')
          .select(`
            platform_id,
            selling_price,
            profit,
            quantity,
            delivery_status,
            platforms!inner(platform_name)
          `)
          .gte('order_created_at', expandedStart)
          .lte('order_created_at', endDate);

        if (filters.platforms.length > 0) {
          platformPerfQuery = platformPerfQuery.in('platform_id', filters.platforms);
        }

        // Product performance data  
        let productPerfQuery = supabase
          .from('sales_transactions')
          .select(`
            sku_reference,
            product_name,
            selling_price,
            profit,
            quantity,
            delivery_status
          `)
          .gte('order_created_at', expandedStart)
          .lte('order_created_at', endDate)
          .order('selling_price', { ascending: false })
          .limit(10);

        const [revenueTrend, platformPerf, productPerf] = await Promise.all([
          revenueTrendQuery,
          platformPerfQuery,
          productPerfQuery
        ]);

        if (revenueTrend.error) {
          console.error('❌ useChartData: Revenue trend error:', revenueTrend.error);
          throw revenueTrend.error;
        }
        if (platformPerf.error) {
          console.error('❌ useChartData: Platform performance error:', platformPerf.error);
          throw platformPerf.error;
        }
        if (productPerf.error) {
          console.error('❌ useChartData: Product performance error:', productPerf.error);
          throw productPerf.error;
        }

        // Process revenue trend data (group by date)
        const revenueTrendProcessed = revenueTrend.data?.reduce((acc: any, transaction: any) => {
          const date = new Date(transaction.order_created_at);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!acc[monthKey]) {
            acc[monthKey] = {
              month_start: `${monthKey}-01`,
              revenue: 0,
              profit: 0,
              total_orders: 0,
              platform_name: 'All',
              avg_order_value: 0,
              month: date.getMonth() + 1,
              year: date.getFullYear(),
              total_packages: 0,
              unique_products_sold: 0
            };
          }
          
          acc[monthKey].revenue += Number(transaction.selling_price || 0);
          acc[monthKey].profit += Number(transaction.profit || 0);
          acc[monthKey].total_orders += 1;
          acc[monthKey].total_packages += Number(transaction.quantity || 0);
          
          return acc;
        }, {}) || {};

        const revenueTrendArray = Object.values(revenueTrendProcessed).map((item: any) => ({
          ...item,
          avg_order_value: item.total_orders > 0 ? item.revenue / item.total_orders : 0
        }));

        // Process platform performance data
        const platformPerfProcessed = platformPerf.data?.reduce((acc: any, transaction: any) => {
          const platformName = transaction.platforms?.platform_name || 'Unknown';
          
          if (!acc[platformName]) {
            acc[platformName] = {
              platform_name: platformName,
              platform_id: transaction.platform_id,
              total_revenue: 0,
              total_profit: 0,
              total_transactions: 0,
              completion_rate_percentage: 0,
              profit_margin_percentage: 0,
              avg_transaction_value: 0,
              total_packages: 0,
              active_days: 1,
              total_stores: 1,
              completed_revenue: 0,
              completed_profit: 0
            };
          }
          
          acc[platformName].total_revenue += Number(transaction.selling_price || 0);
          acc[platformName].total_profit += Number(transaction.profit || 0);
          acc[platformName].total_transactions += 1;
          acc[platformName].total_packages += Number(transaction.quantity || 0);
          
          if (transaction.delivery_status === 'Selesai') {
            acc[platformName].completed_revenue += Number(transaction.selling_price || 0);
            acc[platformName].completed_profit += Number(transaction.profit || 0);
          }
          
          return acc;
        }, {}) || {};

        const platformPerfArray = Object.values(platformPerfProcessed).map((platform: any) => ({
          ...platform,
          profit_margin_percentage: platform.total_revenue > 0 ? (platform.total_profit / platform.total_revenue) * 100 : 0,
          avg_transaction_value: platform.total_transactions > 0 ? platform.total_revenue / platform.total_transactions : 0,
          completion_rate_percentage: platform.total_transactions > 0 ? (platform.completed_revenue / platform.total_revenue) * 100 : 0
        }));

        // Process product performance data
        const productPerfProcessed = productPerf.data?.reduce((acc: any, transaction: any) => {
          const sku = transaction.sku_reference || 'UNKNOWN';
          const productName = transaction.product_name || 'Unknown Product';
          
          if (!acc[sku]) {
            acc[sku] = {
              product_name: productName,
              category: 'Fashion Muslim', // Default category
              sku_reference: sku,
              completed_profit: 0,
              completed_revenue: 0,
              total_quantity_sold: 0,
              avg_profit_per_sale: 0,
              profit_margin_percentage: 0,
              first_sale_date: transaction.order_created_at,
              last_sale_date: transaction.order_created_at,
              platforms_sold_on: 1,
              total_sales: 0,
              completed_quantity: 0
            };
          }
          
          acc[sku].total_sales += 1;
          acc[sku].total_quantity_sold += Number(transaction.quantity || 0);
          
          if (transaction.delivery_status === 'Selesai') {
            acc[sku].completed_profit += Number(transaction.profit || 0);
            acc[sku].completed_revenue += Number(transaction.selling_price || 0);
            acc[sku].completed_quantity += Number(transaction.quantity || 0);
          }
          
          return acc;
        }, {}) || {};

        const productPerfArray = Object.values(productPerfProcessed).map((product: any) => ({
          ...product,
          avg_profit_per_sale: product.total_sales > 0 ? product.completed_profit / product.total_sales : 0,
          profit_margin_percentage: product.completed_revenue > 0 ? (product.completed_profit / product.completed_revenue) * 100 : 0
        }));

        const result = {
          revenueTrend: revenueTrendArray,
          platformPerf: platformPerfArray,
          productPerf: productPerfArray
        };

        console.log('✅ useChartData: Data processed successfully', {
          revenueTrendCount: result.revenueTrend.length,
          platformPerfCount: result.platformPerf.length,
          productPerfCount: result.productPerf.length
        });

        return result;
      } catch (error) {
        console.error('❌ useChartData: Unexpected error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useRecentTransactions = (filters: FilterState) => {
  return useQuery({
    queryKey: ['recent-transactions', filters],
    queryFn: async () => {
      console.log('🔍 useRecentTransactions: Fetching with filters:', {
        dateRange: {
          from: filters.dateRange.from.toISOString().split('T')[0],
          to: filters.dateRange.to.toISOString().split('T')[0]
        },
        platforms: filters.platforms,
        stores: filters.stores
      });
      
      try {
        // Expand date range to capture more data
        const expandedStartDate = new Date(filters.dateRange.from.getTime() - (90 * 24 * 60 * 60 * 1000));
        const expandedStart = expandedStartDate.toISOString().split('T')[0];
        const endDate = filters.dateRange.to.toISOString().split('T')[0];

        let query = supabase
          .from('sales_transactions')
          .select(`
            id,
            order_number,
            product_name,
            delivery_status,
            selling_price,
            profit,
            order_created_at,
            platforms!inner(platform_name),
            stores!inner(store_name)
          `)
          .gte('order_created_at', expandedStart)
          .lte('order_created_at', endDate)
          .order('order_created_at', { ascending: false })
          .limit(10);

        // Apply platform filter if selected
        if (filters.platforms.length > 0) {
          query = query.in('platform_id', filters.platforms);
        }

        // Apply store filter if selected
        if (filters.stores.length > 0) {
          query = query.in('store_id', filters.stores);
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ useRecentTransactions: Error:', error);
          throw error;
        }

        console.log('✅ useRecentTransactions: Fetched', data?.length || 0, 'transactions');
        return data || [];
      } catch (error) {
        console.error('❌ useRecentTransactions: Unexpected error:', error);
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    console.log('🔄 Setting up realtime updates...');
    const subscription = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sales_transactions' },
        (payload) => {
          console.log('🔄 Realtime update received:', payload);
          // Invalidate dashboard queries on data changes
          queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
          queryClient.invalidateQueries({ queryKey: ['chart-data'] });
          queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
        }
      )
      .subscribe();
    
    return () => {
      console.log('🔄 Cleaning up realtime subscription...');
      supabase.removeChannel(subscription);
    };
  }, [queryClient]);
};