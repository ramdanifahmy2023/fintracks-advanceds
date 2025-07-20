import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { subDays, formatISO } from 'date-fns';

/**
 * Mengambil data ringkasan untuk dashboard dari Supabase.
 * @param {Date} fromDate - Tanggal mulai.
 * @param {Date} toDate - Tanggal akhir.
 * @returns {Promise<any>} - Data ringkasan.
 */
const fetchDashboardSummary = async (fromDate: Date, toDate: Date) => {
  const { data, error } = await supabase.rpc('get_dashboard_summary_with_comparison', {
    start_date: formatISO(fromDate),
    end_date: formatISO(toDate),
  });

  if (error) {
    console.error('Error fetching dashboard summary:', error);
    throw new Error('Failed to fetch dashboard summary');
  }
  return data[0];
};

/**
 * Mengambil data tren pendapatan untuk chart.
 * @param {Date} fromDate - Tanggal mulai.
 * @param {Date} toDate - Tanggal akhir.
 * @returns {Promise<any[]>} - Data tren pendapatan.
 */
const fetchRevenueTrend = async (fromDate: Date, toDate: Date) => {
    const { data, error } = await supabase.rpc('get_daily_revenue_trend', {
        start_date: formatISO(fromDate),
        end_date: formatISO(toDate),
    });

    if (error) {
        console.error('Error fetching revenue trend:', error);
        throw new Error('Failed to fetch revenue trend');
    }
    return data;
}

/**
 * Mengambil data performa platform untuk chart.
 * @param {Date} fromDate - Tanggal mulai.
 * @param {Date} toDate - Tanggal akhir.
 * @returns {Promise<any[]>} - Data performa platform.
 */
const fetchPlatformPerformance = async (fromDate: Date, toDate: Date) => {
    const { data, error } = await supabase.rpc('get_platform_performance', {
        start_date: formatISO(fromDate),
        end_date: formatISO(toDate),
    });

    if (error) {
        console.error('Error fetching platform performance:', error);
        throw new Error('Failed to fetch platform performance');
    }
    return data;
}

/**
 * Mengambil data performa kategori untuk chart.
 * @param {Date} fromDate - Tanggal mulai.
 * @param {Date} toDate - Tanggal akhir.
 * @returns {Promise<any[]>} - Data performa kategori.
 */
const fetchCategoryPerformance = async (fromDate: Date, toDate: Date) => {
    const { data, error } = await supabase.rpc('get_category_performance', {
        start_date: formatISO(fromDate),
        end_date: formatISO(toDate),
    });

    if (error) {
        console.error('Error fetching category performance:', error);
        throw new Error('Failed to fetch category performance');
    }
    return data;
}


/**
 * Hook kustom untuk mengambil semua data yang dibutuhkan oleh halaman Dashboard.
 * @returns {object} - Status dan data dari semua query.
 */
export const useDashboard = () => {
  const { dateRange } = useDateFilter();
  const fromDate = dateRange?.from || subDays(new Date(), 30);
  const toDate = dateRange?.to || new Date();

  const summaryQuery = useQuery({
    queryKey: ['dashboardSummary', fromDate, toDate],
    queryFn: () => fetchDashboardSummary(fromDate, toDate),
    enabled: !!fromDate && !!toDate,
  });

  const revenueTrendQuery = useQuery({
      queryKey: ['revenueTrend', fromDate, toDate],
      queryFn: () => fetchRevenueTrend(fromDate, toDate),
      enabled: !!fromDate && !!toDate,
  });

  const platformPerformanceQuery = useQuery({
      queryKey: ['platformPerformance', fromDate, toDate],
      queryFn: () => fetchPlatformPerformance(fromDate, toDate),
      enabled: !!fromDate && !!toDate,
  });

  const categoryPerformanceQuery = useQuery({
      queryKey: ['categoryPerformance', fromDate, toDate],
      queryFn: () => fetchCategoryPerformance(fromDate, toDate),
      enabled: !!fromDate && !!toDate,
  });

  return {
    summary: summaryQuery,
    revenueTrend: revenueTrendQuery,
    platformPerformance: platformPerformanceQuery,
    categoryPerformance: categoryPerformanceQuery,
    isLoading: summaryQuery.isLoading || revenueTrendQuery.isLoading || platformPerformanceQuery.isLoading || categoryPerformanceQuery.isLoading,
    isError: summaryQuery.isError || revenueTrendQuery.isError || platformPerformanceQuery.isError || categoryPerformanceQuery.isError,
  };
};
