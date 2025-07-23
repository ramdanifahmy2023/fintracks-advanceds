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
    staleTime: 15 * 60 * 1000, // 15 minutes
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

// OPTIMIZED: Use existing database function
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
        
        // Simple summary without heavy change calculation
        const summary: DashboardSummary = {
          ...data[0],
          changes: {
            completed_revenue: 0,
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

// OPTIMIZED: Use existing views
export const useChartData = (filters: FilterState) => {
  return useQuery({
    queryKey: ['chart-data', filters],
    queryFn: async () => {
      console.log('🔍 useChartData: Using existing views');
      
      try {
        // Use existing views that are registered in Supabase types
        const [monthlyTrendQuery, platformAnalyticsQuery, productPerfQuery] = await Promise.all([
          // Use v_monthly_trends (already registered)
          supabase
            .from('v_monthly_trends')
            .select('*')
            .gte('month_start', filters.dateRange.from.toISOString().split('T')[0])
            .lte('month_start', filters.dateRange.to.toISOString().split('T')[0])
            .order('month_start'),
          
          // Use v_platform_analytics (already registered)
          supabase
            .from('v_platform_analytics')
            .select('*')
            .order('total_revenue', { ascending: false }),

          // Use v_product_performance (already registered)
          supabase
            .from('v_product_performance')
            .select('*')
            .order('completed_profit', { ascending: false })
            .limit(10)
        ]);

        if (monthlyTrendQuery.error) throw monthlyTrendQuery.error;
        if (platformAnalyticsQuery.error) throw platformAnalyticsQuery.error;
        if (productPerfQuery.error) throw productPerfQuery.error;

        // Apply platform filter on client side (small dataset)
        let platformData = platformAnalyticsQuery.data || [];
        if (filters.platforms.length > 0) {
          platformData = platformData.filter(p => filters.platforms.includes(p.platform_id));
        }

        const result = {
          revenueTrend: monthlyTrendQuery.data || [],
          platformPerf: platformData,
          productPerf: productPerfQuery.data || []
        };

        console.log('✅ useChartData: Success using existing views', {
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

// FIXED: Recent transactions with proper error handling
export const useRecentTransactions = (filters: FilterState) => {
  return useQuery({
    queryKey: ['recent-transactions', filters],
    queryFn: async () => {
      console.log('🔍 useRecentTransactions: Simple query');
      
      try {
        const { data, error } = await supabase
          .from('sales_transactions')
          .select(`
            id,
            order_number,
            product_name,
            delivery_status,
            selling_price,
            order_created_at,
            platforms(platform_name),
            stores(store_name)
          `)
          .gte('order_created_at', filters.dateRange.from.toISOString().split('T')[0])
          .lte('order_created_at', filters.dateRange.to.toISOString().split('T')[0])
          .order('order_created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('❌ Recent transactions error:', error);
          return [];
        }

        console.log('✅ useRecentTransactions: Found', data?.length || 0, 'transactions');
        return data || [];
      } catch (error) {
        console.error('❌ useRecentTransactions: Catch error:', error);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1,
  });
};

// SIMPLIFIED: Less aggressive realtime updates
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