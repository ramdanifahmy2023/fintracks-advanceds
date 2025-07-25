
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

        // Fetch store profit summary with manual query
        let storeProfitQuery = supabase
          .from('sales_transactions')
          .select(`
            store_id,
            selling_price,
            cost_price,
            profit,
            quantity,
            delivery_status,
            order_created_at,
            stores!inner(store_name),
            platforms!inner(platform_name)
          `)
          .gte('order_created_at', fromDate)
          .lte('order_created_at', toDate);

        if (filters.platforms.length > 0) {
          storeProfitQuery = storeProfitQuery.in('platform_id', filters.platforms);
        }
        if (filters.stores.length > 0) {
          storeProfitQuery = storeProfitQuery.in('store_id', filters.stores);
        }

        const { data: storeData, error: storeError } = await storeProfitQuery;

        if (storeError) {
          console.error('Store profit error:', storeError);
          throw new Error(`Store profit query failed: ${storeError.message}`);
        }

        // Fetch ad expenses for the same period
        let adExpenseQuery = supabase
          .from('ad_expenses')
          .select('store_id, amount, expense_date')
          .gte('expense_date', fromDate)
          .lte('expense_date', toDate);

        if (filters.stores.length > 0) {
          adExpenseQuery = adExpenseQuery.in('store_id', filters.stores);
        }

        const { data: adExpenseData, error: adExpenseError } = await adExpenseQuery;

        if (adExpenseError) {
          console.error('Ad expense error:', adExpenseError);
          throw new Error(`Ad expense query failed: ${adExpenseError.message}`);
        }

        // Process store profit data with safe number conversion
        const storeGrouped = (storeData || []).reduce((acc: any, transaction: any) => {
          const storeId = transaction.store_id;
          const storeName = transaction.stores?.store_name || 'Unknown Store';
          
          if (!acc[storeId]) {
            acc[storeId] = {
              store_id: storeId,
              store_name: storeName,
              total_revenue: 0,
              total_cost: 0,
              gross_profit: 0,
              total_ad_cost: 0,
              net_profit: 0,
              total_completed_orders: 0,
              overall_profit_margin: 0
            };
          }
          
          // Safe number conversion
          const safeNumber = (value: any, fallback: number = 0): number => {
            const num = Number(value);
            return isNaN(num) ? fallback : num;
          };

          const revenue = safeNumber(transaction.selling_price) * safeNumber(transaction.quantity, 1);
          const cost = safeNumber(transaction.cost_price) * safeNumber(transaction.quantity, 1);
          const profit = safeNumber(transaction.profit);
          
          acc[storeId].total_revenue += revenue;
          acc[storeId].total_cost += cost;
          acc[storeId].gross_profit += profit;
          
          if (transaction.delivery_status === 'Selesai') {
            acc[storeId].total_completed_orders += 1;
          }
          
          return acc;
        }, {});

        // Add ad expenses to store data
        (adExpenseData || []).forEach((expense: any) => {
          const storeId = expense.store_id;
          if (storeGrouped[storeId]) {
            storeGrouped[storeId].total_ad_cost += Number(expense.amount || 0);
          }
        });

        // Calculate net profit and profit margin
        const storeSummaryProfit = Object.values(storeGrouped).map((store: any) => {
          const netProfit = store.gross_profit - store.total_ad_cost;
          const profitMargin = store.total_revenue > 0 
            ? (netProfit / store.total_revenue) * 100 
            : 0;

          return {
            ...store,
            net_profit: netProfit,
            overall_profit_margin: Number(profitMargin.toFixed(2))
          };
        });

        // Process monthly trend data with proper date formatting
        const monthlyTrend = processMonthlyData(storeData || [], adExpenseData || []);

        // Fix: Create topPerformingStores separately to avoid circular reference
        const topPerformingStores = [...storeSummaryProfit]
          .sort((a, b) => b.net_profit - a.net_profit)
          .slice(0, 5);

        const responseData: ProfitAnalyticsData = {
          storeSummaryProfit: storeSummaryProfit,
          monthlyTrend: monthlyTrend,
          storeProfitAnalysis: [],
          topPerformingStores: topPerformingStores,
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

// Helper function to process monthly data with proper date formatting
function processMonthlyData(transactions: any[], adExpenses: any[]) {
  // Group transactions by month with proper date formatting
  const monthlyGrouped = transactions.reduce((acc: any, transaction: any) => {
    const date = new Date(transaction.order_created_at);
    
    // Fix: Proper date formatting to avoid NaN-NaN-01
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() returns 0-11, so add 1
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        store_id: transaction.store_id || '',
        store_name: transaction.stores?.store_name || 'Unknown Store',
        month: monthStart,
        monthly_revenue: 0,
        monthly_gross_profit: 0,
        monthly_ad_cost: 0,
        monthly_net_profit: 0,
        monthly_orders: 0
      };
    }
    
    const safeNumber = (value: any, fallback: number = 0): number => {
      const num = Number(value);
      return isNaN(num) ? fallback : num;
    };

    acc[monthKey].monthly_revenue += safeNumber(transaction.selling_price) * safeNumber(transaction.quantity, 1);
    acc[monthKey].monthly_gross_profit += safeNumber(transaction.profit);
    acc[monthKey].monthly_orders += 1;
    
    return acc;
  }, {});

  // Add ad expenses to monthly data
  adExpenses.forEach((expense: any) => {
    const date = new Date(expense.expense_date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    
    if (monthlyGrouped[monthKey]) {
      monthlyGrouped[monthKey].monthly_ad_cost += Number(expense.amount || 0);
    }
  });

  // Calculate net profit for each month and return sorted array
  return Object.values(monthlyGrouped)
    .map((item: any) => ({
      ...item,
      monthly_net_profit: item.monthly_gross_profit - item.monthly_ad_cost
    }))
    .sort((a: any, b: any) => new Date(a.month).getTime() - new Date(b.month).getTime());
}

function calculateGrowthRate(monthlyData: any[]): number {
  if (monthlyData.length < 2) return 0;
  
  // Sort by date to ensure proper comparison
  const sortedData = monthlyData.sort((a, b) => 
    new Date(b.month).getTime() - new Date(a.month).getTime()
  );
  
  const latest = sortedData[0]?.monthly_net_profit || 0;
  const previous = sortedData[1]?.monthly_net_profit || 0;
  
  if (previous === 0) return latest > 0 ? 100 : 0;
  return Number(((latest - previous) / Math.abs(previous) * 100).toFixed(2));
}
