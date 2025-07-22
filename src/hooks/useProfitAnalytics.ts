
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { FilterState } from '@/types/dashboard';
import { ProfitAnalyticsData } from '@/types/analytics';

export const useProfitAnalytics = (filters: FilterState) => {
  const [data, setData] = useState<ProfitAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchProfitData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use direct Supabase query instead of API call
        const dateFrom = filters.dateRange.from.toISOString().split('T')[0];
        const dateTo = filters.dateRange.to.toISOString().split('T')[0];

        // Get sales transactions with completed status
        let query = supabase
          .from('sales_transactions')
          .select(`
            *,
            platform:platforms(platform_name),
            store:stores(store_name)
          `)
          .eq('order_status', 'Selesai')
          .gte('order_date', dateFrom)
          .lte('order_date', dateTo);

        if (filters.platforms.length > 0) {
          query = query.in('platform_id', filters.platforms);
        }
        
        if (filters.stores.length > 0) {
          query = query.in('store_id', filters.stores);
        }

        const { data: salesData, error: salesError } = await query;

        if (salesError) {
          throw new Error(`Sales data query failed: ${salesError.message}`);
        }

        // Get ad expenses for the same period
        let adQuery = supabase
          .from('ad_expenses')
          .select('*')
          .gte('expense_date', dateFrom)
          .lte('expense_date', dateTo);

        if (filters.platforms.length > 0) {
          adQuery = adQuery.in('platform_id', filters.platforms);
        }
        
        if (filters.stores.length > 0) {
          adQuery = adQuery.in('store_id', filters.stores);
        }

        const { data: adData, error: adError } = await adQuery;

        if (adError) {
          throw new Error(`Ad expenses query failed: ${adError.message}`);
        }

        // Calculate store summaries
        const storeMap = new Map();
        
        // Process sales data
        salesData?.forEach(transaction => {
          const storeId = transaction.store_id;
          const storeName = transaction.store?.store_name || 'Unknown Store';
          
          if (!storeMap.has(storeId)) {
            storeMap.set(storeId, {
              store_id: storeId,
              store_name: storeName,
              total_revenue: 0,
              total_ad_cost: 0,
              net_profit: 0,
              overall_profit_margin: 0,
              total_completed_orders: 0
            });
          }
          
          const store = storeMap.get(storeId);
          store.total_revenue += transaction.selling_price || 0;
          store.total_completed_orders += 1;
        });

        // Process ad expenses
        adData?.forEach(expense => {
          const storeId = expense.store_id;
          if (storeMap.has(storeId)) {
            const store = storeMap.get(storeId);
            store.total_ad_cost += expense.amount;
          }
        });

        // Calculate net profit and margins
        const storeSummaryProfit = Array.from(storeMap.values()).map(store => {
          store.net_profit = store.total_revenue - store.total_ad_cost;
          store.overall_profit_margin = store.total_revenue > 0 
            ? (store.net_profit / store.total_revenue) * 100 
            : 0;
          return store;
        });

        const responseData = {
          storeSummaryProfit,
          monthlyTrend: [], // Simplified for now
          storeProfitAnalysis: [],
          topPerformingStores: storeSummaryProfit.slice(0, 5),
          profitGrowthRate: 0
        };

        console.log('✅ Profit analytics data processed:', responseData);
        setData(responseData);
        
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('🚫 Profit analytics request aborted');
          return;
        }
        
        console.error('❌ Error fetching profit analytics:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        setData(null);
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchProfitData();

    return () => {
      abortController.abort();
    };
  }, [
    filters.dateRange.from.getTime(), 
    filters.dateRange.to.getTime(), 
    JSON.stringify(filters.platforms), 
    JSON.stringify(filters.stores)
  ]);

  return { data, isLoading, error };
};
