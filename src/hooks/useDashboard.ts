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
    staleTime: 10 * 60 * 1000, // 10 minutes
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
    staleTime: 10 * 60 * 1000,
    enabled: true, // Always enabled, but filtered by platformIds
  });
};

export const useDashboardSummary = (filters: FilterState) => {
  return useQuery({
    queryKey: ['dashboard-summary', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_summary', {
        start_date: filters.dateRange.from.toISOString().split('T')[0],
        end_date: filters.dateRange.to.toISOString().split('T')[0],
        platform_ids: filters.platforms.length > 0 ? filters.platforms : null,
        store_ids: filters.stores.length > 0 ? filters.stores : null
      });
      
      if (error) throw error;
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

      if (revenueTrend.error) throw revenueTrend.error;
      if (platformPerf.error) throw platformPerf.error;
      if (productPerf.error) throw productPerf.error;

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

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const subscription = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sales_transactions' },
        () => {
          // Invalidate dashboard queries on data changes
          queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
          queryClient.invalidateQueries({ queryKey: ['chart-data'] });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [queryClient]);
};