import { useState, useEffect } from 'react';
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
        
        const params = new URLSearchParams({
          from: filters.dateRange.from.toISOString().split('T')[0],
          to: filters.dateRange.to.toISOString().split('T')[0],
        });

        if (filters.platforms.length > 0) {
          params.append('platforms', JSON.stringify(filters.platforms));
        }
        
        if (filters.stores.length > 0) {
          params.append('stores', JSON.stringify(filters.stores));
        }

        console.log('🔍 Fetching profit analytics with params:', params.toString());

        const response = await fetch(`/api/analytics/profit?${params}`, {
          signal: abortController.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'API returned error status');
        }
        
        console.log('✅ Profit analytics data received:', result.data);
        setData(result.data);
        
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