export const useRecentTransactions = (filters: FilterState) => {
  return useQuery({
    queryKey: ['recent-transactions', filters],
    queryFn: async () => {
      console.log('🔍 useRecentTransactions: Simple query');
      
      try {
        const { data, error } = await supabase
          .from('sales_transactions')
          .select(`
            id,
            order_number,
            product_name,
            delivery_status,
            selling_price,
            order_created_at,
            platforms(platform_name),
            stores(store_name)
          `)
          .gte('order_created_at', filters.dateRange.from.toISOString().split('T')[0])
          .lte('order_created_at', filters.dateRange.to.toISOString().split('T')[0])
          .order('order_created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('❌ Recent transactions error:', error);
          return [];
        }

        console.log('✅ useRecentTransactions: Found', data?.length || 0, 'transactions');
        return data || [];
      } catch (error) {
        console.error('❌ useRecentTransactions: Catch error:', error);
        return [];
      }
    },
    staleTime: 30000,
    retry: 1,
  });
};