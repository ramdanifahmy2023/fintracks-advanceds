
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

        // Fetch transactions with proper filtering
        let transactionQuery = supabase
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
          transactionQuery = transactionQuery.in('platform_id', filters.platforms);
        }
        if (filters.stores.length > 0) {
          transactionQuery = transactionQuery.in('store_id', filters.stores);
        }

        const { data: transactionData, error: transactionError } = await transactionQuery;

        if (transactionError) {
          throw new Error(`Transaction query failed: ${transactionError.message}`);
        }

        // Fetch ad expenses with proper filtering
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
          throw new Error(`Ad expense query failed: ${adExpenseError.message}`);
        }

        // Process data safely
        const processedData = processTransactionData(transactionData || [], adExpenseData || []);

        console.log('✅ Profit analytics data processed:', {
          transactions: transactionData?.length || 0,
          adExpenses: adExpenseData?.length || 0,
          stores: processedData.storeSummaryProfit.length
        });
        
        setData(processedData);
        
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

// Helper function to process transaction data
function processTransactionData(transactions: any[], adExpenses: any[]): ProfitAnalyticsData {
  // Group by store for store summary
  const storeGroups: { [key: string]: any } = {};
  
  transactions.forEach((transaction) => {
    try {
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
      
      const revenue = safeNumber(transaction.selling_price) * safeNumber(transaction.quantity, 1);
      const cost = safeNumber(transaction.cost_price) * safeNumber(transaction.quantity, 1);
      const profit = safeNumber(transaction.profit);
      
      storeGroups[storeId].total_revenue += revenue;
      storeGroups[storeId].total_cost += cost;
      storeGroups[storeId].gross_profit += profit;
      
      if (transaction.delivery_status === 'Selesai') {
        storeGroups[storeId].total_completed_orders += 1;
      }
    } catch (error) {
      console.warn('Error processing transaction:', error, transaction);
    }
  });

  // Add ad expenses to stores
  adExpenses.forEach((expense) => {
    try {
      const storeId = expense.store_id;
      if (storeGroups[storeId]) {
        storeGroups[storeId].total_ad_cost += safeNumber(expense.amount);
      }
    } catch (error) {
      console.warn('Error processing expense:', error, expense);
    }
  });

  // Calculate net profit and margins
  const storeSummaryProfit = Object.values(storeGroups).map((store: any) => {
    const netProfit = store.gross_profit - store.total_ad_cost;
    const profitMargin = store.total_revenue > 0 ? (netProfit / store.total_revenue) * 100 : 0;
    
    return {
      ...store,
      net_profit: netProfit,
      overall_profit_margin: safeNumber(profitMargin, 0)
    };
  });

  // Process monthly trend data
  const monthlyTrend = processMonthlyData(transactions, adExpenses);

  // Create top performing stores (no circular reference)
  const topPerformingStores = [...storeSummaryProfit]
    .sort((a, b) => b.net_profit - a.net_profit)
    .slice(0, 5);

  return {
    storeSummaryProfit,
    monthlyTrend,
    storeProfitAnalysis: [], // Will be populated by separate query if needed
    topPerformingStores,
    profitGrowthRate: calculateGrowthRate(monthlyTrend)
  };
}

// Helper function to process monthly data
function processMonthlyData(transactions: any[], adExpenses: any[]) {
  const monthlyGroups: { [key: string]: any } = {};

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
      
      if (!monthlyGroups[monthKey]) {
        monthlyGroups[monthKey] = {
          store_id: transaction.store_id || '',
          store_name: transaction.stores?.store_name || 'Unknown Store',
          month: `${year}-${String(month).padStart(2, '0')}-01`,
          monthly_revenue: 0,
          monthly_gross_profit: 0,
          monthly_ad_cost: 0,
          monthly_net_profit: 0,
          monthly_orders: 0
        };
      }
      
      const revenue = safeNumber(transaction.selling_price) * safeNumber(transaction.quantity, 1);
      const profit = safeNumber(transaction.profit);
      
      monthlyGroups[monthKey].monthly_revenue += revenue;
      monthlyGroups[monthKey].monthly_gross_profit += profit;
      monthlyGroups[monthKey].monthly_orders += 1;
    } catch (error) {
      console.warn('Error processing transaction:', error, transaction);
    }
  });

  // Process ad expenses
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
      
      if (monthlyGroups[monthKey]) {
        monthlyGroups[monthKey].monthly_ad_cost += safeNumber(expense.amount);
      }
    } catch (error) {
      console.warn('Error processing expense:', error, expense);
    }
  });

  // Calculate net profit and return sorted array
  return Object.values(monthlyGroups)
    .map((item: any) => ({
      ...item,
      monthly_net_profit: item.monthly_gross_profit - item.monthly_ad_cost
    }))
    .sort((a: any, b: any) => new Date(a.month).getTime() - new Date(b.month).getTime());
}

// Helper function to calculate growth rate
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
