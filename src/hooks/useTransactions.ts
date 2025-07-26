
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TransactionFilters {
  order_number?: string;
  delivery_status?: string;
  platform_id?: string;
  store_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface TransactionSummary {
  total_transactions: number;
  completed_orders: number;
  cancelled_orders: number;
  returned_orders: number;
  shipping_orders: number;
  pending_orders: number;
}

export interface Transaction {
  id: string;
  order_number: string;
  manual_order_number?: string;
  product_name: string;
  sku_reference?: string;
  quantity: number;
  cost_price: number;
  selling_price: number;
  profit: number;
  delivery_status: string;
  expedition?: string;
  tracking_number?: string;
  order_created_at: string;
  pic_name: string;
  platform_id: string;
  store_id: string;
  platform_name?: string;
  store_name?: string;
  created_at: string;
  updated_at: string;
}

export const useTransactions = (
  filters: TransactionFilters = {},
  page: number = 1,
  limit: number = 50
) => {
  return useQuery({
    queryKey: ['transactions', filters, page, limit],
    queryFn: async () => {
      let query = supabase
        .from('sales_transactions')
        .select(`
          *,
          platforms(platform_name),
          stores(store_name)
        `)
        .order('order_created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      // Apply filters
      if (filters.order_number) {
        query = query.ilike('order_number', `%${filters.order_number}%`);
      }
      
      if (filters.delivery_status) {
        query = query.eq('delivery_status', filters.delivery_status);
      }
      
      if (filters.platform_id) {
        query = query.eq('platform_id', filters.platform_id);
      }
      
      if (filters.store_id) {
        query = query.eq('store_id', filters.store_id);
      }
      
      if (filters.start_date) {
        query = query.gte('order_created_at', filters.start_date);
      }
      
      if (filters.end_date) {
        query = query.lte('order_created_at', filters.end_date);
      }
      
      if (filters.search) {
        query = query.or(`product_name.ilike.%${filters.search}%,sku_reference.ilike.%${filters.search}%,order_number.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      return {
        transactions: data?.map(item => ({
          ...item,
          platform_name: item.platforms?.platform_name,
          store_name: item.stores?.store_name
        })) || [],
        totalCount: count || 0
      };
    },
  });
};

export const useTransactionSummary = (filters: TransactionFilters = {}) => {
  return useQuery({
    queryKey: ['transaction-summary', filters],
    queryFn: async () => {
      let query = supabase
        .from('sales_transactions')
        .select('delivery_status');

      // Apply same filters as main query
      if (filters.order_number) {
        query = query.ilike('order_number', `%${filters.order_number}%`);
      }
      
      if (filters.delivery_status) {
        query = query.eq('delivery_status', filters.delivery_status);
      }
      
      if (filters.platform_id) {
        query = query.eq('platform_id', filters.platform_id);
      }
      
      if (filters.store_id) {
        query = query.eq('store_id', filters.store_id);
      }
      
      if (filters.start_date) {
        query = query.gte('order_created_at', filters.start_date);
      }
      
      if (filters.end_date) {
        query = query.lte('order_created_at', filters.end_date);
      }
      
      if (filters.search) {
        query = query.or(`product_name.ilike.%${filters.search}%,sku_reference.ilike.%${filters.search}%,order_number.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching transaction summary:', error);
        throw error;
      }

      const summary = data?.reduce((acc, item) => {
        acc.total_transactions++;
        switch (item.delivery_status) {
          case 'Selesai':
            acc.completed_orders++;
            break;
          case 'Batal':
            acc.cancelled_orders++;
            break;
          case 'Return':
            acc.returned_orders++;
            break;
          case 'Sedang Dikirim':
            acc.shipping_orders++;
            break;
          case 'Menunggu Konfirmasi':
            acc.pending_orders++;
            break;
        }
        return acc;
      }, {
        total_transactions: 0,
        completed_orders: 0,
        cancelled_orders: 0,
        returned_orders: 0,
        shipping_orders: 0,
        pending_orders: 0
      }) || {
        total_transactions: 0,
        completed_orders: 0,
        cancelled_orders: 0,
        returned_orders: 0,
        shipping_orders: 0,
        pending_orders: 0
      };

      return summary;
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Transaction> }) => {
      const { error } = await supabase
        .from('sales_transactions')
        .update(data.updates)
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] });
      toast.success('Transaksi berhasil diperbarui');
    },
    onError: (error) => {
      console.error('Error updating transaction:', error);
      toast.error('Gagal memperbarui transaksi');
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sales_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] });
      toast.success('Transaksi berhasil dihapus');
    },
    onError: (error) => {
      console.error('Error deleting transaction:', error);
      toast.error('Gagal menghapus transaksi');
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('sales_transactions')
        .insert([data]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] });
      toast.success('Transaksi berhasil ditambahkan');
    },
    onError: (error) => {
      console.error('Error creating transaction:', error);
      toast.error('Gagal menambahkan transaksi');
    },
  });
};
