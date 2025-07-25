
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FilterState } from '@/types/dashboard';

// Simplified store profit summary using direct table queries
export const useStoreProfitSummary = (filters: FilterState) => {
  return useQuery({
    queryKey: ['store-profit-summary', filters],
    queryFn: async () => {
      console.log('🔍 useStoreProfitSummary: Using direct table query');
      
      const fromDate = filters.dateRange.from.toISOString().split('T')[0];
      const toDate = filters.dateRange.to.toISOString().split('T')[0];

      // Direct query from sales_transactions with proper joins
      let query = supabase
        .from('sales_transactions')
        .select(`
          store_id,
          selling_price,
          cost_price,
          profit,
          quantity,
          delivery_status,
          stores!inner(store_name)
        `)
        .gte('order_created_at', fromDate)
        .lte('order_created_at', toDate);

      if (filters.platforms.length > 0) {
        query = query.in('platform_id', filters.platforms);
      }
      if (filters.stores.length > 0) {
        query = query.in('store_id', filters.stores);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Store profit summary error:', error);
        throw new Error(`Store profit query failed: ${error.message}`);
      }

      // Group by store and calculate summary
      const storeGroups: { [key: string]: any } = {};
      
      (data || []).forEach((transaction) => {
        const storeId = transaction.store_id;
        if (!storeGroups[storeId]) {
          storeGroups[storeId] = {
            store_id: storeId,
            store_name: transaction.stores?.store_name || 'Unknown Store',
            total_revenue: 0,
            total_cost: 0,
            gross_profit: 0,
            total_ad_cost: 0,
            net_profit: 0,
            total_completed_orders: 0,
            overall_profit_margin: 0
          };
        }
        
        const revenue = (transaction.selling_price || 0) * (transaction.quantity || 1);
        const cost = (transaction.cost_price || 0) * (transaction.quantity || 1);
        const profit = transaction.profit || 0;
        
        storeGroups[storeId].total_revenue += revenue;
        storeGroups[storeI
[storeId].total_cost += cost;
        storeGroups[storeId].gross_profit += profit;
        
        if (transaction.delivery_status === 'Selesai') {
          storeGroups[storeId].total_completed_orders += 1;
        }
      });

      const result = Object.values(storeGroups).map((store: any) => ({
        ...store,
        net_profit: store.gross_profit - store.total_ad_cost,
        overall_profit_margin: store.total_revenue > 0 ? (store.gross_profit / store.total_revenue) * 100 : 0
      }));

      console.log('✅ Store profit summary loaded:', result.length, 'stores');
      return result;
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

// Simplified monthly profit trends using direct queries
export const useMonthlyProfitTrends = (filters: FilterState) => {
  return useQuery({
    queryKey: ['monthly-profit-trends', filters],
    queryFn: async () => {
      console.log('🔍 useMonthlyProfitTrends: Using direct transaction query');
      
      const fromDate = filters.dateRange.from.toISOString().split('T')[0];
      const toDate = filters.dateRange.to.toISOString().split('T')[0];

      // Use direct sales_transactions query
      let query = supabase
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
        .lte('order_created_at', toDate);

      if (filters.platforms.length > 0) {
        query = query.in('platform_id', filters.platforms);
      }
      if (filters.stores.length > 0) {
        query = query.in('store_id', filters.stores);
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
