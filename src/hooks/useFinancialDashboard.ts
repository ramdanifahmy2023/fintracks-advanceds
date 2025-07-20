import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface DateRange {
  from: Date;
  to: Date;
  preset?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactionCount: number;
}

export interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface DailyChartData {
  date: string;
  income: number;
  expense: number;
}

export interface RecentTransaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  transaction_date: string;
  channel: string;
}

export const useFinancialSummary = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['financial-summary', dateRange],
    queryFn: async () => {
      console.log('🔍 Fetching financial summary with date range:', dateRange);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get income transactions
      const { data: incomeData, error: incomeError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'income')
        .gte('transaction_date', dateRange.from.toISOString().split('T')[0])
        .lte('transaction_date', dateRange.to.toISOString().split('T')[0]);

      if (incomeError) throw incomeError;

      // Get expense transactions
      const { data: expenseData, error: expenseError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('transaction_date', dateRange.from.toISOString().split('T')[0])
        .lte('transaction_date', dateRange.to.toISOString().split('T')[0]);

      if (expenseError) throw expenseError;

      // Get total transaction count
      const { count: transactionCount, error: countError } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('transaction_date', dateRange.from.toISOString().split('T')[0])
        .lte('transaction_date', dateRange.to.toISOString().split('T')[0]);

      if (countError) throw countError;

      const totalIncome = incomeData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const totalExpense = expenseData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      console.log('✅ Financial summary fetched');
      return {
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
        transactionCount: transactionCount || 0
      } as FinancialSummary;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useChartData = (dateRange: DateRange) => {
  return useQuery({
    queryKey: ['chart-data', dateRange],
    queryFn: async () => {
      console.log('🔍 Fetching chart data with date range:', dateRange);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get daily aggregated data
      const { data, error } = await supabase
        .from('transactions')
        .select('transaction_date, amount, type')
        .eq('user_id', user.id)
        .gte('transaction_date', dateRange.from.toISOString().split('T')[0])
        .lte('transaction_date', dateRange.to.toISOString().split('T')[0])
        .order('transaction_date');

      if (error) {
        console.error('❌ Error fetching chart data:', error);
        throw error;
      }

      // Group by date and aggregate
      const dailyData: Record<string, { income: number; expense: number }> = {};
      
      data?.forEach(transaction => {
        const date = transaction.transaction_date;
        if (!dailyData[date]) {
          dailyData[date] = { income: 0, expense: 0 };
        }
        
        if (transaction.type === 'income') {
          dailyData[date].income += Number(transaction.amount);
        } else {
          dailyData[date].expense += Number(transaction.amount);
        }
      });

      const chartData = Object.entries(dailyData).map(([date, values]) => ({
        date,
        income: values.income,
        expense: values.expense
      }));

      console.log('✅ Chart data fetched:', chartData.length, 'records');
      return chartData;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useCategoryBreakdown = (dateRange: DateRange, type: 'income' | 'expense') => {
  return useQuery({
    queryKey: ['category-breakdown', dateRange, type],
    queryFn: async () => {
      console.log('🔍 Fetching category breakdown for:', type, dateRange);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get transactions with categories
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('amount, category')
        .eq('user_id', user.id)
        .eq('type', type)
        .gte('transaction_date', dateRange.from.toISOString().split('T')[0])
        .lte('transaction_date', dateRange.to.toISOString().split('T')[0]);

      if (transError) throw transError;

      // Get category colors
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('name, color, icon')
        .eq('user_id', user.id)
        .eq('type', type);

      if (catError) throw catError;

      // Group by category and calculate totals
      const categoryTotals: Record<string, number> = {};
      transactions?.forEach(t => {
        const cat = t.category || 'Lainnya';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount);
      });

      const totalAmount = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

      const result = Object.entries(categoryTotals).map(([category, amount]) => {
        const categoryInfo = categories?.find(c => c.name === category);
        return {
          category,
          amount,
          percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0,
          color: categoryInfo?.color || '#3B82F6',
          icon: categoryInfo?.icon || 'circle'
        };
      });

      console.log('✅ Category breakdown fetched:', result.length, 'categories');
      return result;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useRecentTransactions = (dateRange: DateRange, limit = 10) => {
  return useQuery({
    queryKey: ['recent-transactions', dateRange, limit],
    queryFn: async () => {
      console.log('🔍 Fetching recent transactions:', limit, 'records');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('transaction_date', dateRange.from.toISOString().split('T')[0])
        .lte('transaction_date', dateRange.to.toISOString().split('T')[0])
        .order('transaction_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching recent transactions:', error);
        throw error;
      }

      console.log('✅ Recent transactions fetched:', data?.length || 0, 'transactions');
      return data || [];
    },
    staleTime: 30000, // 30 seconds
  });
};

export const useCategories = (type?: 'income' | 'expense') => {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: async () => {
      console.log('🔍 Fetching categories for type:', type || 'all');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching categories:', error);
        throw error;
      }

      console.log('✅ Categories fetched:', data?.length || 0, 'categories');
      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    console.log('🔄 Setting up financial realtime updates...');
    const subscription = supabase
      .channel('financial-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          console.log('🔄 Transaction realtime update received:', payload);
          // Invalidate financial queries on data changes
          queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
          queryClient.invalidateQueries({ queryKey: ['chart-data'] });
          queryClient.invalidateQueries({ queryKey: ['category-breakdown'] });
          queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          console.log('🔄 Category realtime update received:', payload);
          queryClient.invalidateQueries({ queryKey: ['categories'] });
        }
      )
      .subscribe();
    
    return () => {
      console.log('🔄 Cleaning up financial realtime subscription...');
      supabase.removeChannel(subscription);
    };
  }, [queryClient]);
};