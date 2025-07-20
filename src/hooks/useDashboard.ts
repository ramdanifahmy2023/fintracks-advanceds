
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FilterState, DashboardSummary, ChartData } from '@/types/dashboard';
import { useEffect } from 'react';

export const usePlatforms = () => {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      console.log('🔍 Fetching platforms...');
      const { data, error } = await supabase
        .from('platforms')
        .select('id, platform_name, platform_code, is_active')
        .eq('is_active', true)
        .order('platform_name');
      
      if (error) {
        console.error('❌ Error fetching platforms:', error);
        throw error;
      }
      
      console.log('✅ Platforms fetched:', data?.length || 0, 'platforms');
      console.log('📊 Platform data:', data);
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useStores = (platformIds: string[]) => {
  return useQuery({
    queryKey: ['stores', platformIds],
    queryFn: async () => {
      console.log('🔍 Fetching stores for platforms:', platformIds);
      let query = supabase
        .from('stores')
        .select('id, store_name, store_id_external, platform_id, platforms(platform_name)')
        .eq('is_active', true);
      
      if (platformIds.length > 0) {
        query = query.in('platform_id', platformIds);
      }
      
      const { data, error } = await query.order('store_name');
      
      if (error) {
        console.error('❌ Error fetching stores:', error);
        throw error;
      }
      
      console.log('✅ Stores fetched:', data?.length || 0, 'stores');
      console.log('📊 Store data:', data);
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
    enabled: true, // Always enabled, but filtered by platformIds
  });
};

export const useDashboardSummary = (filters: FilterState) => {
  return useQuery({
    queryKey: ['dashboard-summary', filters],
    queryFn: async () => {
      console.log('🔍 Fetching dashboard summary with filters:', filters);
      const { data, error } = await supabase.rpc('get_dashboard_summary', {
        start_date: filters.dateRange.from.toISOString().split('T')[0],
        end_date: filters.dateRange.to.toISOString().split('T')[0],
        platform_ids: filters.platforms.length > 0 ? filters.platforms : null,
        store_ids: filters.stores.length > 0 ? filters.stores : null
      });
      
      if (error) {
        console.error('❌ Error fetching dashboard summary:', error);
        throw error;
      }
      
      console.log('✅ Dashboard summary fetched:', data?.[0]);
      return data?.[0] as DashboardSummary;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useChartData = (filters: FilterState) => {
  return useQuery({
    queryKey: ['chart-data', filters],
    queryFn: async () => {
      console.log('🔍 Fetching chart data with filters:', filters);
      
      // Revenue trend data
      const revenueTrendQuery = supabase
        .from('v_monthly_trends')
        .select('*')
        .gte('month_start', filters.dateRange.from.toISOString())
        .lte('month_start', filters.dateRange.to.toISOString());

      if (filters.platforms.length > 0) {
        revenueTrendQuery.in('platform_name', filters.platforms);
      }

      // Platform performance data
      const platformPerfQuery = supabase
        .from('v_platform_analytics')
        .select('*');

      // Product performance data  
      const productPerfQuery = supabase
        .from('v_product_performance')
        .select('*')
        .order('completed_profit', { ascending: false })
        .limit(10);

      const [revenueTrend, platformPerf, productPerf] = await Promise.all([
        revenueTrendQuery,
        platformPerfQuery,
        productPerfQuery
      ]);

      if (revenueTrend.error) {
        console.error('❌ Error fetching revenue trend:', revenueTrend.error);
        throw revenueTrend.error;
      }
      if (platformPerf.error) {
        console.error('❌ Error fetching platform performance:', platformPerf.error);
        throw platformPerf.error;
      }
      if (productPerf.error) {
        console.error('❌ Error fetching product performance:', productPerf.error);
        throw productPerf.error;
      }

      console.log('✅ Chart data fetched successfully');
      console.log('📊 Revenue trend:', revenueTrend.data?.length || 0, 'records');
      console.log('📊 Platform performance:', platformPerf.data?.length || 0, 'records');
      console.log('📊 Product performance:', productPerf.data?.length || 0, 'records');

      return {
        revenueTrend: revenueTrend.data || [],
        platformPerf: platformPerf.data || [],
        productPerf: productPerf.data || []
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useRecentTransactions = (filters: FilterState) => {
  return useQuery({
    queryKey: ['recent-transactions', filters],
    queryFn: async () => {
      console.log('🔍 Fetching recent transactions with filters:', filters);
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
        .gte('order_created_at', filters.dateRange.from.toISOString())
        .lte('order_created_at', filters.dateRange.to.toISOString())
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
        console.error('❌ Error fetching recent transactions:', error);
        throw error;
      }

      console.log('✅ Recent transactions fetched:', data?.length || 0, 'transactions');
      return data || [];
    },
    staleTime: 30000, // 30 seconds
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
