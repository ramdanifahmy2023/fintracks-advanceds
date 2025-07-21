import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FilterState, DashboardSummary, ChartData } from '@/types/dashboard';
import { useEffect } from 'react';

export const usePlatforms = () => {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platforms')
        .select('id, platform_name, platform_code, is_active')
        .eq('is_active', true)
        .order('platform_name');
      if (error) throw error;
      return data || [];
    },
  });
};

export const useStores = (platformIds: string[]) => {
  return useQuery({
    queryKey: ['stores', platformIds],
    queryFn: async () => {
      let query = supabase
        .from('stores')
        .select('id, store_name, store_id_external, platform_id, platforms(platform_name)')
        .eq('is_active', true);
      if (platformIds.length > 0) {
        query = query.in('platform_id', platformIds);
      }
      const { data, error } = await query.order('store_name');
      if (error) throw error;
      return data || [];
    },
    enabled: true,
  });
};

export const useDashboardSummary = (filters: FilterState) => {
  return useQuery({
    queryKey: ['dashboard-summary', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_summary', {
        start_date: filters.dateRange.from.toISOString(),
        end_date: filters.dateRange.to.toISOString(),
        platform_ids: filters.platforms.length > 0 ? filters.platforms : null,
        store_ids: filters.stores.length > 0 ? filters.stores : null,
      });

      if (error) {
        console.error('❌ useDashboardSummary RPC error:', error);
        throw error;
      }

      console.log('✅ useDashboardSummary RPC successful:', data);
      
      // Since the RPC returns an array with one object, we extract it.
      // If data is null or empty, provide a default structure.
      return data?.[0] || {
        total_orders: 0, total_packages: 0, total_revenue: 0, total_profit: 0,
        completed_orders: 0, completed_revenue: 0, completed_profit: 0,
        shipping_orders: 0, shipping_revenue: 0, cancelled_orders: 0,
        cancelled_revenue: 0, returned_orders: 0, returned_revenue: 0,
        changes: { completed_revenue: 0, total_packages: 0, completed_profit: 0, completion_rate: 0, avg_order_value: 0 }
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};


export const useChartData = (filters: FilterState) => {
  return useQuery({
    queryKey: ['chart-data', filters],
    queryFn: async () => {
      const timeframe = filters.dateRange.preset || '30d';
      
      const { data: revenueTrend, error: revenueError } = await supabase.rpc('get_revenue_analytics', {
        p_timeframe: timeframe,
        p_platform_ids: filters.platforms.length > 0 ? filters.platforms : null,
      });

      const { data: platformPerf, error: platformError } = await supabase.rpc('get_platform_performance', {
        p_timeframe: timeframe,
        p_platform_ids: filters.platforms.length > 0 ? filters.platforms : null,
      });

      const { data: productPerf, error: productError } = await supabase.rpc('get_product_performance', {
        p_timeframe: timeframe,
        p_limit: 10,
      });

      if (revenueError || platformError || productError) {
        console.error({ revenueError, platformError, productError });
        throw new Error('Failed to fetch chart data');
      }

      const result = {
        revenueTrend: revenueTrend || [],
        platformPerf: platformPerf || [],
        productPerf: productPerf || [],
      };

      console.log('✅ useChartData RPC successful:', result);
      return result as ChartData;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useRecentTransactions = (filters: FilterState) => {
  return useQuery({
    queryKey: ['recent-transactions', filters],
    queryFn: async () => {
      let query = supabase
        .from('sales_transactions')
        .select(`
          id, order_number, product_name, delivery_status, selling_price,
          profit, order_created_at, platforms!inner(platform_name), stores!inner(store_name)
        `)
        .gte('order_created_at', filters.dateRange.from.toISOString())
        .lte('order_created_at', filters.dateRange.to.toISOString())
        .order('order_created_at', { ascending: false })
        .limit(10);

      if (filters.platforms.length > 0) {
        query = query.in('platform_id', filters.platforms);
      }
      if (filters.stores.length > 0) {
        query = query.in('store_id', filters.stores);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const subscription = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sales_transactions' },
        (payload) => {
          console.log('🔄 Realtime update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
          queryClient.invalidateQueries({ queryKey: ['chart-data'] });
          queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [queryClient]);
};