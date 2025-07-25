
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
        
        console.log('🔍 Fetching optimized profit analytics with filters:', filters);

        const fromDate = filters.dateRange.from.toISOString().split('T')[0];
        const toDate = filters.dateRange.to.toISOString().split('T')[0];

        // Use database function for store profit summary - more efficient
        const { data: storeProfitData, error: storeProfitError } = await supabase.rpc('get_store_summary_profit', {
          p_from_date: fromDate,
          p_to_date: toDate,
          p_platform_ids: filters.platforms.length > 0 ? filters.platforms : null,
          p_store_ids: filters.stores.length > 0 ? filters.stores : null
        });

        if (storeProfitError) {
          console.error('Store profit RPC error:', storeProfitError);
          throw new Error(`Database query failed: ${storeProfitError.message}`);
        }

        // Fetch monthly trend using optimized query with proper JOINs
        let monthlyTrendQuery = supabase
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
          monthlyTrendQuery = monthlyTrendQuery.in('platform_id', filters.platforms);
        }
        if (filters.stores.length > 0) {
          monthlyTrendQuery = monthlyTrendQuery.in('store_id', filters.stores);
        }

        const { data: transactionData, error: transactionError } = await monthlyTrendQuery;

        if (transactionError) {
          console.error('Monthly trend error:', transactionError);
          throw new Error(`Monthly trend query failed: ${transactionError.message}`);
        }

        // Fetch ad expenses with proper date filtering
        let adExpenseQuery = supabase
          .from('ad_expenses')
          .select(`
            store_id,
            platform_id,
            amount,
            expense_date,
            stores!inner(store_name)
          `)
          .gte('expense_date', fromDate)
          .lte('expense_date', toDate);

        if (filters.platforms.length > 0) {
          adExpenseQuery = adExpenseQuery.in('platform_id', filters.platforms);
        }
        if (filters.stores.length > 0) {
          adExpenseQuery = adExpenseQuery.in('store_id', filters.stores);
        }

        const { data: adExpenseData, error: adExpenseError } = await adExpenseQuery;

        if (adExpenseError) {
          console.error('Ad expense error:', adExpenseError);
          throw new Error(`Ad expense query failed: ${adExpenseError.message}`);
        }

        // Process monthly trend data with better date handling
        const monthlyTrend = processOptimizedMonthlyData(transactionData || [], adExpenseData || []);

        // Convert RPC result to expected format with proper type safety
        const storeSummaryProfit = (storeProfitData || []).map((store: any) => ({
          store_id: store.store_id,
          store_name: store.store_name,
          total_revenue: safeNumber(store.total_revenue),
          total_cost: safeNumber(store.total_cost),
          gross_profit: safeNumber(store.gross_profit),
          total_ad_cost: safeNumber(store.total_ad_cost),
          net_profit: safeNumber(store.net_profit),
          total_completed_orders: safeNumber(store.total_completed_orders),
          overall_profit_margin: safeNumber(store.overall_profit_margin)
        }));

        // Create top performing stores (avoid circular reference)
        const topPerformingStores = [...storeSummaryProfit]
          .sort((a, b) => b.net_profit - a.net_profit)
          .slice(0, 5);

        const responseData: ProfitAnalyticsData = {
          storeSummaryProfit: storeSummaryProfit,
          monthlyTrend: monthlyTrend,
          storeProfitAnalysis: [], // Will be populated by separate query if needed
          topPerformingStores: topPerformingStores,
          profitGrowthRate: calculateGrowthRate(monthlyTrend)
        };

        console.log('✅ Optimized profit analytics data processed:', {
          stores: responseData.storeSummaryProfit.length,
          monthlyTrend: responseData.monthlyTrend.length,
          topStores: responseData.topPerformingStores.length
        });
        
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

// Helper function with improved performance and error handling
function processOptimizedMonthlyData(transactions: any[], adExpenses: any[]) {
  const monthlyGrouped: { [key: string]: any } = {};

  // Process transactions
  transactions.forEach((transaction) => {
    try {
      const date = new Date(transaction.order_created_at);
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date in transaction:', transaction.order_created_at);
        return;
      }

      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
      
      if (!monthlyGrouped[monthKey]) {
        monthlyGrouped[monthKey] = {
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
      
      const revenue = safeNumber(transaction.selling_price) * safeNumber(transaction.quantity, 1);
      const profit = safeNumber(transaction.profit);
      
      monthlyGrouped[monthKey].monthly_revenue += revenue;
      monthlyGrouped[monthKey].monthly_gross_profit += profit;
      monthlyGrouped[monthKey].monthly_orders += 1;
    } catch (error) {
      console.warn('Error processing transaction:', error, transaction);
    }
  });

  // Process ad expenses with better date handling
  adExpenses.forEach((expense) => {
    try {
      const date = new Date(expense.expense_date);
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid expense date:', expense.expense_date);
        return;
      }

      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      
      if (monthlyGrouped[monthKey]) {
        monthlyGrouped[monthKey].monthly_ad_cost += safeNumber(expense.amount);
      }
    } catch (error) {
      console.warn('Error processing expense:', error, expense);
    }
  });

  // Calculate net profit and return sorted array
  return Object.values(monthlyGrouped)
    .map((item: any) => ({
      ...item,
      monthly_net_profit: item.monthly_gross_profit - item.monthly_ad_cost
    }))
    .sort((a: any, b: any) => new Date(a.month).getTime() - new Date(b.month).getTime());
}

// Improved growth rate calculation
function calculateGrowthRate(monthlyData: any[]): number {
  if (!Array.isArray(monthlyData) || monthlyData.length < 2) {
    return 0;
  }
  
  try {
    const sortedData = [...monthlyData].sort((a, b) => 
      new Date(b.month).getTime() - new Date(a.month).getTime()
    );
    
    const latest = safeNumber(sortedData[0]?.monthly_net_profit);
    const previous = safeNumber(sortedData[1]?.monthly_net_profit);
    
    if (previous === 0) return latest > 0 ? 100 : 0;
    
    const growthRate = ((latest - previous) / Math.abs(previous)) * 100;
    return safeNumber(growthRate, 0);
  } catch (error) {
    console.warn('Error calculating growth rate:', error);
    return 0;
  }
}

// Safe number conversion utility
function safeNumber(value: any, fallback: number = 0): number {
  if (value === null || value === undefined) return fallback;
  const num = Number(value);
  return isNaN(num) ? fallback : num;
}
