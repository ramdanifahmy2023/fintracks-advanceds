import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAnalyticsKPI = (timeframe: string, platforms: string[]) => {
  return useQuery({
    queryKey: ['analytics-kpi', timeframe, platforms],
    queryFn: async () => {
      // Mock data for demonstration
      return {
        totalRevenue: 85000000,
        totalProfit: 25500000,
        profitMargin: 30.0,
        totalTransactions: 1250,
        avgOrderValue: 68000,
        topPlatform: 'Shopee',
        growthRate: 8.9,
        revenueChange: 8.9,
        revenueTrend: 'up',
        profitChange: 15.9,
        profitTrend: 'up',
        aovChange: 2.9,
        aovTrend: 'up',
        topPlatformChange: 5.2,
        topPlatformTrend: 'up',
        growthRateChange: 1.2,
        growthRateTrend: 'up',
        topProduct: {
          name: 'Kaos Kaki Wudhu Premium',
          units: 234,
          revenue: 5850000
        },
        topProductChange: 12.5,
        topProductTrend: 'up'
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useRevenueAnalytics = (timeframe: string, platforms: string[]) => {
  return useQuery({
    queryKey: ['revenue-analytics', timeframe, platforms],
    queryFn: async () => {
      // Mock data for demonstration
      const data = [];
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        data.push({
          date: date.toISOString().split('T')[0],
          revenue: Math.floor(Math.random() * 5000000) + 2000000,
          profit: Math.floor(Math.random() * 1500000) + 600000,
          transactions: Math.floor(Math.random() * 50) + 20,
          margin: Math.random() * 10 + 25,
          trendLine: Math.floor(Math.random() * 4000000) + 2500000
        });
      }
      
      return data;
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const usePlatformPerformance = (timeframe: string, platforms: string[]) => {
  return useQuery({
    queryKey: ['platform-performance', timeframe, platforms],
    queryFn: async () => {
      // Mock data for demonstration
      return [
        {
          platform_name: 'Shopee',
          revenue: 35000000,
          profit: 10500000,
          margin: 30.0,
          transactions: 520,
          growth_rate: 12.5
        },
        {
          platform_name: 'Tokopedia',
          revenue: 28000000,
          profit: 8400000,
          margin: 30.0,
          transactions: 410,
          growth_rate: 8.2
        },
        {
          platform_name: 'Lazada',
          revenue: 15000000,
          profit: 4200000,
          margin: 28.0,
          transactions: 220,
          growth_rate: 5.8
        },
        {
          platform_name: 'TikTok Shop',
          revenue: 7000000,
          profit: 2100000,
          margin: 30.0,
          transactions: 100,
          growth_rate: 25.6
        }
      ];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useProductPerformance = (timeframe: string, limit: number) => {
  return useQuery({
    queryKey: ['product-performance', timeframe, limit],
    queryFn: async () => {
      // Mock data for demonstration
      return [
        {
          sku_reference: 'KKW001',
          product_name: 'Kaos Kaki Wudhu Premium Wanita',
          total_revenue: 5850000,
          total_profit: 1755000,
          total_units: 234,
          margin: 30.0
        },
        {
          sku_reference: 'JAK002',
          product_name: 'Jaket Hijab Muslimah Modern',
          total_revenue: 4200000,
          total_profit: 1260000,
          total_units: 84,
          margin: 30.0
        },
        {
          sku_reference: 'HJB003',
          product_name: 'Hijab Instant Syari Premium',
          total_revenue: 3750000,
          total_profit: 1125000,
          total_units: 150,
          margin: 30.0
        },
        {
          sku_reference: 'MUK004',
          product_name: 'Mukena Katun Jepang Dewasa',
          total_revenue: 3200000,
          total_profit: 960000,
          total_units: 64,
          margin: 30.0
        },
        {
          sku_reference: 'TAS005',
          product_name: 'Tas Ransel Muslimah Trendy',
          total_revenue: 2800000,
          total_profit: 840000,
          total_units: 56,
          margin: 30.0
        }
      ];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useTrendAnalysis = (timeframe: string) => {
  return useQuery({
    queryKey: ['trend-analysis', timeframe],
    queryFn: async () => {
      // Mock data for demonstration
      return {
        revenue: {
          direction: 'up' as const,
          percentage: 8.9,
          label: 'Strong revenue growth',
          description: 'Revenue is growing rapidly with strong momentum',
          volatility: 'Low',
          confidence: 85
        },
        profit: {
          direction: 'up' as const,
          percentage: 15.9,
          label: 'Excellent profit growth',
          description: 'Profit shows healthy positive growth',
          volatility: 'Medium',
          confidence: 78
        },
        growth: {
          direction: 'up' as const,
          percentage: 12.3,
          label: 'Positive growth trend',
          description: 'Business expansion shows steady growth',
          volatility: 'Low',
          confidence: 92
        },
        forecast: {
          summary: 'Based on current trends, expect continued growth with 15% revenue increase next month',
          revenue: 97750000,
          profit: 29325000,
          growth: 15.0
        },
        patterns: [
          {
            type: 'seasonal',
            title: 'Weekend Sales Peak',
            description: 'Sales consistently peak on weekends with 25% higher conversion'
          },
          {
            type: 'growth',
            title: 'Monthly Growth Acceleration',
            description: 'Growth rate has been accelerating month-over-month'
          },
          {
            type: 'cyclical',
            title: 'Platform Rotation',
            description: 'Customers show preference cycling between platforms'
          }
        ]
      };
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};