import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FilterState } from '@/types/dashboard';
import { useEffect, useMemo } from 'react';

// Optimized single query hook using the new RPC function
export const useOptimizedDashboard = (filters: FilterState) => {
  return useQuery({
    queryKey: ['dashboard-complete', filters],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_complete', {
        p_start_date: filters.dateRange.from.toISOString().split('T')[0],
        p_end_date: filters.dateRange.to.toISOString().split('T')[0],
        p_platform_ids: filters.platforms.length > 0 ? filters.platforms : null,
        p_store_ids: filters.stores.length > 0 ? filters.stores : null
      });
      
      if (error) {
        console.error('❌ useOptimizedDashboard: Error:', error);
        throw error;
      }
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Lightweight platforms hook with minimal data
export const usePlatformsOptimized = () => {
  return useQuery({
    queryKey: ['platforms-optimized'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platforms')
        .select('id, platform_name, platform_code')
        .eq('is_active', true)
        .order('platform_name');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });
};

// Lightweight stores hook with minimal data
export const useStoresOptimized = (platformIds: string[]) => {
  return useQuery({
    queryKey: ['stores-optimized', platformIds],
    queryFn: async () => {
      if (platformIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('stores')
        .select('id, store_name, store_id_external, platform_id')
        .in('platform_id', platformIds)
        .eq('is_active', true)
        .order('store_name');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: platformIds.length > 0,
    refetchOnWindowFocus: false,
  });
};

// Optimized realtime updates with debouncing
export const useOptimizedRealtimeUpdates = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const debouncedInvalidate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-complete'] });
      }, 1000); // Debounce for 1 second
    };
    
    const subscription = supabase
      .channel('optimized-dashboard-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sales_transactions' },
        debouncedInvalidate
      )
      .subscribe();
    
    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(subscription);
    };
  }, [queryClient]);
};

// Memoized data selectors for better performance
export const useDashboardSelectors = (dashboardData: any) => {
  return useMemo(() => {
    if (!dashboardData) return null;
    
    return {
      summary: dashboardData.summary,
      recentTransactions: dashboardData.recent_transactions || [],
      platformPerformance: dashboardData.platform_performance || [],
      revenueTrend: dashboardData.revenue_trend || [],
      topProducts: dashboardData.top_products || []
    };
  }, [dashboardData]);
};

// Prefetch data for better navigation performance
export const usePrefetchData = () => {
  const queryClient = useQueryClient();
  
  const prefetchAnalytics = () => {
    queryClient.prefetchQuery({
      queryKey: ['analytics-kpi'],
      queryFn: () => supabase.rpc('get_analytics_kpi'),
      staleTime: 5 * 60 * 1000,
    });
  };
  
  const prefetchProducts = () => {
    queryClient.prefetchQuery({
      queryKey: ['product-performance'],
      queryFn: () => supabase.rpc('get_product_performance'),
      staleTime: 5 * 60 * 1000,
    });
  };
  
  return { prefetchAnalytics, prefetchProducts };
};