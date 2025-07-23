
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
        
        console.log('🔍 Fetching profit analytics with filters:', filters);

        const fromDate = filters.dateRange.from.toISOString().split('T')[0];
        const toDate = filters.dateRange.to.toISOString().split('T')[0];

        // Use the existing database function for profit summary
        const { data: functionResult, error: functionError } = await supabase
          .rpc('get_store_summary_profit', {
            p_from_date: fromDate,
            p_to_date: toDate,
            p_platform_ids: filters.platforms.length > 0 ? filters.platforms : null,
            p_store_ids: filters.stores.length > 0 ? filters.stores : null
          });

        if (functionError) {
          console.error('Function error:', functionError);
          throw new Error(`Database function failed: ${functionError.message}`);
        }

        // Get monthly trend data from sales_transactions directly
        let monthlyQuery = supabase
          .from('sales_transactions')
          .select(`
            order_created_at,
            selling_price,
            cost_price,
            profit,
            delivery_status,
            stores!inner(store_name)
          `)
          .gte('order_created_at', fromDate)
          .lte('order_created_at', toDate)
          .eq('delivery_status', 'Selesai')
          .order('order_created_at', { ascending: false });

        if (filters.platforms.length > 0) {
          monthlyQuery = monthlyQuery.in('platform_id', filters.platforms);
        }
        if (filters.stores.length > 0) {
          monthlyQuery = monthlyQuery.in('store_id', filters.stores);
        }

        const { data: monthlyData, error: monthlyError } = await monthlyQuery;

        if (monthlyError) {
          console.error('Monthly trend error:', monthlyError);
          throw new Error(`Monthly trend query failed: ${monthlyError.message}`);
        }

        // Process monthly data
        const monthlyTrend = processMonthlyData(monthlyData || []);

        const responseData: ProfitAnalyticsData = {
          storeSummaryProfit: functionResult || [],
          monthlyTrend: monthlyTrend,
          storeProfitAnalysis: [],
          topPerformingStores: (functionResult || []).slice(0, 5),
          profitGrowthRate: calculateGrowthRate(monthlyTrend)
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

// Helper function to process monthly data
function processMonthlyData(transactions: any[]) {
  const monthlyGrouped = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.order_created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        store_id: transaction.store_id || '',
        store_name: transaction.stores?.store_name || 'Unknown Store',
        month: `${monthKey}-01`,
        monthly_revenue: 0,
        monthly_gross_profit: 0,
        monthly_ad_cost: 0,
        monthly_net_profit: 0,
        monthly_orders: 0
      };
    }
    
    acc[monthKey].monthly_revenue += Number(transaction.selling_price || 0);
    acc[monthKey].monthly_gross_profit += Number(transaction.profit || 0);
    acc[monthKey].monthly_net_profit += Number(transaction.profit || 0); // Simplified for now
    acc[monthKey].monthly_orders += 1;
    
    return acc;
  }, {});

  return Object.values(monthlyGrouped);
}

function calculateGrowthRate(monthlyData: any[]): number {
  if (monthlyData.length < 2) return 0;
  
  const sortedData = monthlyData.sort((a, b) => 
    new Date(b.month).getTime() - new Date(a.month).getTime()
  );
  
  const latest = sortedData[0]?.monthly_net_profit || 0;
  const previous = sortedData[1]?.monthly_net_profit || 0;
  
  if (previous === 0) return latest > 0 ? 100 : 0;
  return Number(((latest - previous) / Math.abs(previous) * 100).toFixed(2));
}
