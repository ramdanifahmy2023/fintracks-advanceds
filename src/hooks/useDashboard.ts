export const useRecentTransactions = (filters: FilterState) => {
  return useQuery({
    queryKey: ['recent-transactions', filters],
    queryFn: async () => {
      console.log('🔍 useRecentTransactions: Optimized query');
      
      try {
        let query = supabase
          .from('sales_transactions')
          .select(`
            id, order_number, product_name, delivery_status, selling_price, order_created_at,
            platforms!inner(platform_name),
            stores!inner(store_name)
          `)
          .gte('order_created_at', filters.dateRange.from.toISOString().split('T')[0])
          .lte('order_created_at', filters.dateRange.to.toISOString().split('T')[0])
          .order('order_created_at', { ascending: false })
          .limit(10);

        if (filters.platforms.length > 0) {
          query = query.in('platform_id', filters.platforms);
        }
        if (filters.stores.length > 0) {
          query = query.in('store_id', filters.stores);
        }

        const { data, error } = await query;
        if (error) throw error;

        console.log('✅ useRecentTransactions: Success -', data?.length, 'transactions');
        return data || [];
      } catch (error) {
        console.error('❌ useRecentTransactions: Error:', error);
        // Return empty array instead of throwing to prevent UI crash
        return [];
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
};