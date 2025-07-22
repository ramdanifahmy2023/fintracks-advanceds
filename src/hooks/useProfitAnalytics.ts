
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

        // Get store summary data from the view
        const { data: storeSummaryData, error: summaryError } = await supabase
          .from('store_summary_profit')
          .select('*');

        if (summaryError) {
          console.error('Store summary error:', summaryError);
          throw new Error(`Store summary query failed: ${summaryError.message}`);
        }

        // Get monthly trend data from the view
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('monthly_store_profit_trend')
          .select('*')
          .gte('month', fromDate)
          .lte('month', toDate)
          .order('month', { ascending: false });

        if (monthlyError) {
          console.error('Monthly trend error:', monthlyError);
          throw new Error(`Monthly trend query failed: ${monthlyError.message}`);
        }

        const responseData: ProfitAnalyticsData = {
          storeSummaryProfit: storeSummaryData || [],
          monthlyTrend: monthlyData || [],
          storeProfitAnalysis: [],
          topPerformingStores: (storeSummaryData || []).slice(0, 5),
          profitGrowthRate: calculateGrowthRate(monthlyData || [])
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
