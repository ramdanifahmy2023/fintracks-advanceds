
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FilterState } from '@/types/dashboard';
import { ProfitAnalyticsData, StoreSummaryProfit, MonthlyProfitTrend } from '@/types/analytics';

export const useProfitAnalytics = (filters: FilterState) => {
  return useQuery({
    queryKey: ['profit-analytics', filters],
    queryFn: async (): Promise<ProfitAnalyticsData> => {
      console.log('🔍 useProfitAnalytics: Fetching profit data with filters:', {
        dateRange: {
          from: filters.dateRange.from.toISOString().split('T')[0],
          to: filters.dateRange.to.toISOString().split('T')[0]
        },
        platforms: filters.platforms,
        stores: filters.stores
      });

      try {
        const fromDate = filters.dateRange.from.toISOString().split('T')[0];
        const toDate = filters.dateRange.to.toISOString().split('T')[0];

        // Get store summary profit using database function
        const { data: storeSummaryData, error: summaryError } = await supabase
          .rpc('get_store_summary_profit', {
            p_from_date: fromDate,
            p_to_date: toDate,
            p_platform_ids: filters.platforms.length > 0 ? filters.platforms : null,
            p_store_ids: filters.stores.length > 0 ? filters.stores : null
          });

        if (summaryError) {
          console.error('❌ useProfitAnalytics: Store summary error:', summaryError);
          throw new Error(`Store summary query failed: ${summaryError.message}`);
        }

        // Get monthly profit trend data
        const { data: monthlyData, error: monthlyError } = await supabase
          .from('monthly_store_profit_trend')
          .select('*')
          .gte('month', fromDate)
          .lte('month', toDate)
          .order('month', { ascending: false });

        if (monthlyError) {
          console.error('❌ useProfitAnalytics: Monthly trend error:', monthlyError);
          throw new Error(`Monthly trend query failed: ${monthlyError.message}`);
        }

        // Calculate profit growth rate
        const calculateGrowthRate = (monthlyTrend: MonthlyProfitTrend[]): number => {
          if (monthlyTrend.length < 2) return 0;
          
          const sortedData = monthlyTrend.sort((a, b) => 
            new Date(b.month).getTime() - new Date(a.month).getTime()
          );
          
          const latest = sortedData[0]?.monthly_net_profit || 0;
          const previous = sortedData[1]?.monthly_net_profit || 0;
          
          if (previous === 0) return latest > 0 ? 100 : 0;
          return Number(((latest - previous) / Math.abs(previous) * 100).toFixed(2));
        };

        const result: ProfitAnalyticsData = {
          storeSummaryProfit: (storeSummaryData || []) as StoreSummaryProfit[],
          monthlyTrend: (monthlyData || []) as MonthlyProfitTrend[],
          storeProfitAnalysis: [], // This would need a separate query if detailed analysis is needed
          topPerformingStores: ((storeSummaryData || []) as StoreSummaryProfit[]).slice(0, 5),
          profitGrowthRate: calculateGrowthRate((monthlyData || []) as MonthlyProfitTrend[])
        };

        console.log('✅ useProfitAnalytics: Data fetched successfully', {
          storeSummaryCount: result.storeSummaryProfit.length,
          monthlyTrendCount: result.monthlyTrend.length,
          topStoresCount: result.topPerformingStores.length,
          profitGrowthRate: result.profitGrowthRate
        });

        return result;

      } catch (error) {
        console.error('❌ useProfitAnalytics: Unexpected error:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
