
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
