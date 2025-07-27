
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Store {
  id: string;
  store_name: string;
  store_id_external: string;
  platform_id: string;
  is_active: boolean;
}

export const useStores = (platformId?: string) => {
  return useQuery({
    queryKey: ['stores', platformId],
    queryFn: async () => {
      let query = supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('store_name');

      if (platformId) {
        query = query.eq('platform_id', platformId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching stores:', error);
        throw error;
      }

      return data as Store[];
    },
    // Remove enabled condition so it always fetches
  });
};
