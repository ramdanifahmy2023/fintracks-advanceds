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
          console.error('❌ usePlatforms: Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
        
        console.log('✅ usePlatforms: Query successful');
        console.log('📊 usePlatforms: Data received:', {
          count: count,
          recordsReturned: data?.length || 0,
          sampleData: data?.slice(0, 3)
        });
        
        // Check for user authentication
        const { data: { user } } = await supabase.auth.getUser();
        console.log('👤 usePlatforms: Current user:', {
          id: user?.id,
          email: user?.email,
          authenticated: !!user
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
          console.error('❌ useStores: Error details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }
        
        console.log('✅ useStores: Query successful');
        console.log('📊 useStores: Data received:', {
          count: count,
          recordsReturned: data?.length || 0,
          platformFilter: platformIds.length > 0 ? platformIds : 'No filter applied',
          sampleData: data?.slice(0, 3)
        });
        
        // Check for user authentication and permissions
        const { data: { user } } = await supabase.auth.getUser();
        console.log('👤 useStores: Current user:', {
          id: user?.id,
          email: user?.email,
          authenticated: !!user
        });
        
        // Test RLS by trying to query without filters
        const { data: allStores, error: allStoresError, count: allStoresCount } = await supabase
          .from('stores')
          .select('*', { count: 'exact' });
        
        console.log('🔍 useStores: RLS test (all stores query):', {
          success: !allStoresError,
          error: allStoresError?.message,
          totalInDB: allStoresCount,
          canAccess: allStores?.length || 0
        });
        
        return data || [];
      } catch (error) {
        console.error('❌ useStores: Unexpected error:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000,
    enabled: true, // Always enabled, but filtered by platformIds
    retry: (failureCount, error) => {
      console.log(`🔄 useStores: Retry attempt ${failureCount + 1}`);
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

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
      
      const { data, error } = await supabase.rpc('get_dashboard_summary', {
        start_date: filters.dateRange.from.toISOString().split('T')[0],
        end_date: filters.dateRange.to.toISOString().split('T')[0],
        platform_ids: filters.platforms.length > 0 ? filters.platforms : null,
        store_ids: filters.stores.length > 0 ? filters.stores : null
      });
      
      if (error) {
        console.error('❌ useDashboardSummary: Error:', error);
        throw error;
      }
      
      console.log('✅ useDashboardSummary: Data fetched:', data?.[0]);
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
      console.log('🔍 useChartData: Fetching with filters:', {
        dateRange: {
          from: filters.dateRange.from.toISOString().split('T')[0],
          to: filters.dateRange.to.toISOString().split('T')[0]
        },
        platforms: filters.platforms,
        stores: filters.stores
      });
      
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

      console.log('✅ useChartData: Data fetched successfully', {
        revenueTrendCount: revenueTrend.data?.length || 0,
        platformPerfCount: platformPerf.data?.length || 0,
        productPerfCount: productPerf.data?.length || 0
      });

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
      console.log('🔍 useRecentTransactions: Fetching with filters:', {
        dateRange: {
          from: filters.dateRange.from.toISOString().split('T')[0],
          to: filters.dateRange.to.toISOString().split('T')[0]
        },
        platforms: filters.platforms,
        stores: filters.stores
      });
      
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
        console.error('❌ useRecentTransactions: Error:', error);
        throw error;
      }

      console.log('✅ useRecentTransactions: Fetched', data?.length || 0, 'transactions');
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
