
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FilterState } from '@/types/dashboard';

// Optimized hook for store profit summary using database function
export const useStoreProfitSummary = (filters: FilterState) => {
  return useQuery({
    queryKey: ['store-profit-summary', filters],
    queryFn: async () => {
      console.log('🔍 useStoreProfitSummary: Using database function');
      
      const fromDate = filters.dateRange.from.toISOString().split('T')[0];
      const toDate = filters.dateRange.to.toISOString().split('T')[0];

      const { data, error } = await supabase.rpc('get_store_summary_profit', {
        p_from_date: fromDate,
        p_to_date: toDate,
        p_platform_ids: filters.platforms.length > 0 ? filters.platforms : null,
        p_store_ids: filters.stores.length > 0 ? filters.stores : null
      });

      if (error) {
        console.error('Store profit summary error:', error);
        throw new Error(`Database query failed: ${error.message}`);
      }

      console.log('✅ Store profit summary loaded:', data?.length || 0, 'stores');
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

// Optimized hook for ad expenses with proper filtering
export const useAdExpensesFiltered = (filters: FilterState) => {
  return useQuery({
    queryKey: ['ad-expenses-filtered', filters],
    queryFn: async () => {
      console.log('🔍 useAdExpensesFiltered: Fetching with filters');
      
      const fromDate = filters.dateRange.from.toISOString().split('T')[0];
      const toDate = filters.dateRange.to.toISOString().split('T')[0];

      let query = supabase
        .from('ad_expenses')
        .select(`
          id,
          store_id,
          platform_id,
          amount,
          expense_date,
          notes,
          stores!inner(store_name),
          platforms!inner(platform_name)
        `)
        .gte('expense_date', fromDate)
        .lte('expense_date', toDate);

      if (filters.platforms.length > 0) {
        query = query.in('platform_id', filters.platforms);
      }
      if (filters.stores.length > 0) {
        query = query.in('store_id', filters.stores);
      }

      const { data, error } = await query.order('expense_date', { ascending: false });

      if (error) {
        console.error('Ad expenses filtered error:', error);
        throw new Error(`Ad expenses query failed: ${error.message}`);
      }

      console.log('✅ Ad expenses filtered loaded:', data?.length || 0, 'expenses');
      return data || [];
    },
    staleTime: 30 * 1000, // 30 seconds for ad expenses (more frequent updates)
    retry: 2,
  });
};

// Optimized hook for monthly profit trends
export const useMonthlyProfitTrends = (filters: FilterState) => {
  return useQuery({
    queryKey: ['monthly-profit-trends', filters],
    queryFn: async () => {
      console.log('🔍 useMonthlyProfitTrends: Using optimized query');
      
      const fromDate = filters.dateRange.from.toISOString().split('T')[0];
      const toDate = filters.dateRange.to.toISOString().split('T')[0];

      // Use existing monthly trends view with additional profit data
      let query = supabase
        .from('v_monthly_trends')
        .select('*')
        .gte('month_start', fromDate)
        .lte('month_start', toDate);

      // Apply platform filter if specified
      if (filters.platforms.length > 0) {
        // Since v_monthly_trends might not have platform_id, we'll fetch from sales_transactions
        query = supabase
          .from('sales_transactions')
          .select(`
            order_created_at,
            selling_price,
            cost_price,
            profit,
            quantity,
            delivery_status,
            store_id,
            platform_id,
            stores!inner(store_name),
            platforms!inner(platform_name)
          `)
          .gte('order_created_at', fromDate)
          .lte('order_created_at', toDate)
          .in('platform_id', filters.platforms);

        if (filters.stores.length > 0) {
          query = query.in('store_id', filters.stores);
        }
      }

      const { data, error } = await query.order('order_created_at');

      if (error) {
        console.error('Monthly profit trends error:', error);
        throw new Error(`Monthly trends query failed: ${error.message}`);
      }

      console.log('✅ Monthly profit trends loaded:', data?.length || 0, 'records');
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
