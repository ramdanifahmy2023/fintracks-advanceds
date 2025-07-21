
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Platform {
  id: string;
  platform_name: string;
  platform_code: string;
  is_active: boolean;
}

export const usePlatforms = () => {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .eq('is_active', true)
        .order('platform_name');

      if (error) {
        console.error('Error fetching platforms:', error);
        throw error;
      }

      return data as Platform[];
    },
  });
};
