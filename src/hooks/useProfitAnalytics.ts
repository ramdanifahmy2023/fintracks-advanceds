import { useState, useEffect } from 'react';
import { FilterState } from '@/types/dashboard';
import { ProfitAnalyticsData } from '@/types/analytics';

export const useProfitAnalytics = (filters: FilterState) => {
  const [data, setData] = useState<ProfitAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simulate API call with mock data based on our Supabase data
    const timer = setTimeout(() => {
      const mockData: ProfitAnalyticsData = {
        storeSummaryProfit: [
          {
            store_id: '5cc3a04e-a74d-41e2-a2c1-8bbad7713121',
            store_name: 'Hiban Signature',
            total_revenue: 48700000,
            total_cost: 30800000,
            gross_profit: 17900000,
            total_ad_cost: 0,
            net_profit: 17900000,
            total_completed_orders: 34,
            overall_profit_margin: 36.76
          },
          {
            store_id: '9fcf6ba7-aa18-43e0-9d4c-16ee6abc8016',
            store_name: 'Hiban signature',
            total_revenue: 47000000,
            total_cost: 29800000,
            gross_profit: 17200000,
            total_ad_cost: 0,
            net_profit: 17200000,
            total_completed_orders: 32,
            overall_profit_margin: 36.60
          }
        ],
        monthlyTrend: [
          {
            store_id: '5cc3a04e-a74d-41e2-a2c1-8bbad7713121',
            store_name: 'Hiban Signature',
            month: '2025-07-01',
            monthly_revenue: 3900000,
            monthly_gross_profit: 1500000,
            monthly_ad_cost: 0,
            monthly_net_profit: 1500000,
            monthly_orders: 4
          },
          {
            store_id: '5cc3a04e-a74d-41e2-a2c1-8bbad7713121',
            store_name: 'Hiban Signature',
            month: '2025-06-01',
            monthly_revenue: 8400000,
            monthly_gross_profit: 3050000,
            monthly_ad_cost: 0,
            monthly_net_profit: 3050000,
            monthly_orders: 5
          }
        ],
        storeProfitAnalysis: [],
        topPerformingStores: [
          {
            store_id: '5cc3a04e-a74d-41e2-a2c1-8bbad7713121',
            store_name: 'Hiban Signature',
            total_revenue: 48700000,
            total_cost: 30800000,
            gross_profit: 17900000,
            total_ad_cost: 0,
            net_profit: 17900000,
            total_completed_orders: 34,
            overall_profit_margin: 36.76
          }
        ],
        profitGrowthRate: 15.5
      };

      setData(mockData);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [filters]);

  return { data, isLoading, error };
};