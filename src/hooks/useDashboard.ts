import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FilterState, DashboardSummary, ChartData } from '@/types/dashboard';
import { useEffect } from 'react';

export const usePlatforms = () => {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      console.log('🔍 usePlatforms: Starting optimized query...');
      
      const { data, error } = await supabase
        .from('platforms')
        .select('id, platform_name, platform_code, is_active')
        .eq('is_active', true)
        .order('platform_name');
      
      if (error) throw error;
      
      console.log('✅ usePlatforms: Success -', data?.length, 'platforms');
      return data || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - platforms rarely change
    retry: 2,
  });
};

export const useStores = (platformIds: string[]) => {
  return useQuery({
    queryKey: ['stores', platformIds],
    queryFn: async () => {
      console.log('🔍 useStores: Starting optimized query for platforms:', platformIds);
      
      let query = supabase
        .from('stores')
        .select('id, store_name, store_id_external, platform_id, platforms(platform_name)')
        .eq('is_active', true);
      
      if (platformIds.length > 0) {
        query = query.in('platform_id', platformIds);
      }
      
      const { data, error } = await query.order('store_name');
      
      if (error) throw error;
      
      console.log('✅ useStores: Success -', data?.length, 'stores');
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

// OPTIMIZED: Use existing database function instead of heavy frontend processing
export const useDashboardSummary = (filters: FilterState) => {
  return useQuery({
    queryKey: ['dashboard-summary', filters],
    queryFn: async () => {
      console.log('🔍 useDashboardSummary: Using optimized database function');
      
      try {
        const { data, error } = await supabase.rpc('get_dashboard_summary', {
          start_date: filters.dateRange.from.toISOString().split('T')[0],
          end_date: filters.dateRange.to.toISOString().split('T')[0],
          platform_ids: filters.platforms.length > 0 ? filters.platforms : null,
          store_ids: filters.stores.length > 0 ? filters.stores : null
        });
        
        if (error) throw error;
        
        // Simple change calculation (avoiding heavy comparison logic)
        const summary: DashboardSummary = {
          ...data[0],
          changes: {
            completed_revenue: 0, // Will be calculated properly later if needed
            total_packages: 0,
            completed_profit: 0,
            completion_rate: 0,
            avg_order_value: 0
          }
        };

        console.log('✅ useDashboardSummary: Success using database function');
        return summary;
      } catch (error) {
        console.error('❌ useDashboardSummary: Error:', error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// OPTIMIZED: Use database views instead of heavy frontend processing
export const useChartData = (filters: FilterState) => {
  return useQuery({
    queryKey: ['chart-data', filters],
    queryFn: async () => {
      console.log('🔍 useChartData: Using optimized database views');
      
      try {
        // Use optimized views instead of processing thousands of records
        const [revenueTrendQuery, platformPerfQuery] = await Promise.all([
          // Revenue trend from optimized view
          supabase
            .from('v_revenue_trend')
            .select('*')
            .gte('month_start', filters.dateRange.from.toISOString().split('T')[0])
            .lte('month_start', filters.dateRange.to.toISOString().split('T')[0])
            .order('month_start'),
          
          // Platform performance from optimized view
          supabase
            .from('v_platform_performance_chart')
            .select('*')
            .order('total_revenue', { ascending: false })
        ]);

        // Lightweight product query - only top 10 to avoid heavy processing
        const productPerfQuery = await supabase
          .from('sales_transactions')
          .select('sku_reference, product_name, selling_price, profit, delivery_status')
          .gte('order_created_at', filters.dateRange.from.toISOString().split('T')[0])
          .lte('order_created_at', filters.dateRange.to.toISOString().split('T')[0])
          .eq('delivery_status', 'Selesai')
          .order('selling_price', { ascending: false })
          .limit(10); // Limit to top 10 to avoid processing thousands

        if (revenueTrendQuery.error) throw revenueTrendQuery.error;
        if (platformPerfQuery.error) throw platformPerfQuery.error;
        if (productPerfQuery.error) throw productPerfQuery.error;

        // Apply platform filter on client side (small dataset now from views)
        let platformData = platformPerfQuery.data || [];
        if (filters.platforms.length > 0) {
          platformData = platformData.filter(p => filters.platforms.includes(p.platform_id));
        }

        // Minimal product processing (only top 10 items)
        const productData = productPerfQuery.data?.map(p => ({
          sku_reference: p.sku_reference || 'UNKNOWN',
          product_name: p.product_name || 'Unknown Product',
          completed_profit: Number(p.profit || 0),
          completed_revenue: Number(p.selling_price || 0),
          category: 'Fashion Muslim',
          total_sales: 1,
          profit_margin_percentage: p.selling_price > 0 ? (Number(p.profit || 0) / Number(p.selling_price || 0)) * 100 : 0
        })) || [];

        const result = {
          revenueTrend: revenueTrendQuery.data || [],
          platformPerf: platformData,
          productPerf: productData
        };

        console.log('✅ useChartData: Success using views', {
          revenueTrend: result.revenueTrend.length,
          platformPerf: result.platformPerf.length, 
          productPerf: result.productPerf.length
        });

        return result;
      } catch (error) {
        console.error('❌ useChartData: Error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

// OPTIMIZED: Simpler recent transactions query
export const useRecentTransactions = (filters: FilterState) => {
  return useQuery({
    queryKey: ['recent-transactions', filters],
    queryFn: async () => {
      console.log('🔍 useRecentTransactions: Optimized query');
      
      try {
        let query = supabase
          .from('sales_transactions')
          .select(`
            id, order_number, product_name, delivery_status, selling_price,
            platforms!inner(platform_name),
            stores!inner(store_name)
          `)
          .gte('order_created_at', filters.dateRange.from.toISOString().split('T')[0])
          .lte('order_created_at', filters.dateRange.to.toISOString().split('T')[0])
          .order('order_created_at', { ascending: false })
          .limit(10); // Only 10 recent transactions

        if (filters.platforms.length > 0) {
          query = query.in('platform_id', filters.platforms);
        }
        if (filters.stores.length > 0) {
          query = query.in('store_id', filters.stores);
        }

        const { data, error } = await query;
        if (error) throw error;

        console.log('✅ useRecentTransactions: Success -', data?.length, 'transactions');
        return data || [];
      } catch (error) {
        console.error('❌ useRecentTransactions: Error:', error);
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
};

// SIMPLIFIED: Less aggressive realtime updates to prevent query spam
export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    console.log('🔄 Setting up simplified realtime updates...');
    
    const salesSubscription = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'sales_transactions' },
        (payload) => {
          console.log('🔄 New transaction:', payload);
          // Only invalidate on INSERT to reduce unnecessary updates
          queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
          queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
        }
      )
      .subscribe();
    
    return () => {
      console.log('🔄 Cleanup realtime subscription');
      supabase.removeChannel(salesSubscription);
    };
  }, [queryClient]);
};