
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AdExpense {
  id: string;
  expense_date: string;
  platform_id: string;
  store_id?: string;
  amount: number;
  notes?: string;
  created_by: string;
  created_at: string;
  platform?: {
    platform_name: string;
  };
  store?: {
    store_name: string;
  };
}

export interface CreateAdExpenseData {
  expense_date: string;
  platform_id: string;
  store_id?: string;
  amount: number;
  notes?: string;
}

export interface UpdateAdExpenseData extends CreateAdExpenseData {
  id: string;
}

export interface AdExpenseFilters {
  dateFrom?: string;
  dateTo?: string;
  platformId?: string;
  storeId?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export const useAdExpenses = () => {
  return useQuery({
    queryKey: ['ad-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_expenses')
        .select(`
          *,
          platform:platforms(platform_name),
          store:stores(store_name)
        `)
        .order('expense_date', { ascending: false });

      if (error) {
        console.error('Error fetching ad expenses:', error);
        throw error;
      }

      return data as AdExpense[];
    },
  });
};

export const useAdExpensesWithFilter = (filters: AdExpenseFilters = {}, page = 1, pageSize = 25) => {
  return useQuery({
    queryKey: ['ad-expenses-filtered', filters, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('ad_expenses')
        .select(`
          *,
          platform:platforms(platform_name),
          store:stores(store_name)
        `, { count: 'exact' });

      // Apply filters
      if (filters.dateFrom) {
        query = query.gte('expense_date', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('expense_date', filters.dateTo);
      }
      if (filters.platformId) {
        query = query.eq('platform_id', filters.platformId);
      }
      if (filters.storeId) {
        query = query.eq('store_id', filters.storeId);
      }
      if (filters.minAmount) {
        query = query.gte('amount', filters.minAmount);
      }
      if (filters.maxAmount) {
        query = query.lte('amount', filters.maxAmount);
      }
      if (filters.search) {
        query = query.or(`notes.ilike.%${filters.search}%`);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order('expense_date', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching filtered ad expenses:', error);
        throw error;
      }

      return {
        data: data as AdExpense[],
        count: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      };
    },
  });
};

export const useCreateAdExpense = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateAdExpenseData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('ad_expenses')
        .insert({
          ...data,
          created_by: user.user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating ad expense:', error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['ad-expenses-filtered'] });
      toast({
        title: 'Berhasil',
        description: 'Biaya iklan berhasil ditambahkan',
      });
    },
    onError: (error) => {
      console.error('Error creating ad expense:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan biaya iklan',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateAdExpense = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateAdExpenseData) => {
      const { id, ...updateData } = data;
      const { data: result, error } = await supabase
        .from('ad_expenses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating ad expense:', error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['ad-expenses-filtered'] });
      toast({
        title: 'Berhasil',
        description: 'Biaya iklan berhasil diperbarui',
      });
    },
    onError: (error) => {
      console.error('Error updating ad expense:', error);
      toast({
        title: 'Error',
        description: 'Gagal memperbarui biaya iklan',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteAdExpense = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ad_expenses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting ad expense:', error);
        throw error;
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['ad-expenses-filtered'] });
      toast({
        title: 'Berhasil',
        description: 'Biaya iklan berhasil dihapus',
      });
    },
    onError: (error) => {
      console.error('Error deleting ad expense:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus biaya iklan',
        variant: 'destructive',
      });
    },
  });
};

export const useAdExpenseSummary = (dateFrom?: string, dateTo?: string) => {
  return useQuery({
    queryKey: ['ad-expenses-summary', dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from('ad_expenses')
        .select(`
          amount,
          platform:platforms(platform_name),
          store:stores(store_name),
          expense_date
        `);

      if (dateFrom) query = query.gte('expense_date', dateFrom);
      if (dateTo) query = query.lte('expense_date', dateTo);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching ad expense summary:', error);
        throw error;
      }

      // Calculate summary statistics
      const totalAmount = data.reduce((sum, expense) => sum + expense.amount, 0);
      const platformBreakdown = data.reduce((acc, expense) => {
        const platform = expense.platform?.platform_name || 'Unknown';
        acc[platform] = (acc[platform] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);

      const storeBreakdown = data.reduce((acc, expense) => {
        const store = expense.store?.store_name || 'No Store';
        acc[store] = (acc[store] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalAmount,
        totalTransactions: data.length,
        platformBreakdown,
        storeBreakdown,
        averageAmount: data.length > 0 ? totalAmount / data.length : 0
      };
    },
  });
};
