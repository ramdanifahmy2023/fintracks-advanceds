
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProductAnalyticsData {
  sku_reference: string;
  product_name: string;
  total_revenue: number;
  total_profit: number;
  total_units: number;
  total_transactions: number;
  margin_percentage: number;
  avg_selling_price: number;
  first_sale_date: string;
  last_sale_date: string;
}

interface ProductAnalyticsFilters {
  timeframe: '7d' | '30d' | '90d' | '1y';
  sortBy: 'revenue' | 'profit' | 'units' | 'margin' | 'transactions';
  searchTerm: string;
  limit: number;
}

const getDateRangeStart = (timeframe: string): string => {
  const now = new Date();
  let daysBack = 30;

  switch (timeframe) {
    case '7d':
      daysBack = 7;
      break;
    case '30d':
      daysBack = 30;
      break;
    case '90d':
      daysBack = 90;
      break;
    case '1y':
      daysBack = 365;
      break;
    default:
      daysBack = 30;
  }

  const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
  return startDate.toISOString().split('T')[0];
};

export const useProductAnalytics = (filters: ProductAnalyticsFilters) => {
  return useQuery({
    queryKey: ['product-analytics', filters],
    queryFn: async () => {
      console.log('🔍 Fetching product analytics data...', filters);
      
      try {
        const startDate = getDateRangeStart(filters.timeframe);
        const endDate = new Date().toISOString().split('T')[0];

        let query = supabase
          .from('sales_transactions')
          .select('sku_reference, product_name, selling_price, cost_price, profit, quantity, order_created_at')
          .gte('order_created_at', startDate)
          .lte('order_created_at', endDate)
          .order('order_created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
          console.error('❌ Error fetching product analytics:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.log('⚠️ No product data found');
          return {
            products: [],
            summary: {
              total_products: 0,
              total_revenue: 0,
              total_units: 0,
              average_margin: 0
            }
          };
        }

        // Group by SKU and product name
        const productMap = new Map<string, ProductAnalyticsData>();

        data.forEach(transaction => {
          const sku = transaction.sku_reference || 'UNKNOWN';
          const productName = transaction.product_name || 'Unknown Product';
          const key = `${sku}_${productName}`;

          if (!productMap.has(key)) {
            productMap.set(key, {
              sku_reference: sku,
              product_name: productName,
              total_revenue: 0,
              total_profit: 0,
              total_units: 0,
              total_transactions: 0,
              margin_percentage: 0,
              avg_selling_price: 0,
              first_sale_date: transaction.order_created_at,
              last_sale_date: transaction.order_created_at
            });
          }

          const product = productMap.get(key)!;
          const revenue = Number(transaction.selling_price || 0) * Number(transaction.quantity || 0);
          const profit = Number(transaction.profit || 0);
          const units = Number(transaction.quantity || 0);

          product.total_revenue += revenue;
          product.total_profit += profit;
          product.total_units += units;
          product.total_transactions += 1;

          // Update date range
          if (transaction.order_created_at < product.first_sale_date) {
            product.first_sale_date = transaction.order_created_at;
          }
          if (transaction.order_created_at > product.last_sale_date) {
            product.last_sale_date = transaction.order_created_at;
          }
        });

        // Calculate derived metrics
        const products = Array.from(productMap.values()).map(product => ({
          ...product,
          margin_percentage: product.total_revenue > 0 ? (product.total_profit / product.total_revenue) * 100 : 0,
          avg_selling_price: product.total_units > 0 ? product.total_revenue / product.total_units : 0
        }));

        // Apply search filter
        const filteredProducts = products.filter(product => {
          if (!filters.searchTerm) return true;
          const searchLower = filters.searchTerm.toLowerCase();
          return (
            product.product_name.toLowerCase().includes(searchLower) ||
            product.sku_reference.toLowerCase().includes(searchLower)
          );
        });

        // Sort products
        const sortedProducts = filteredProducts.sort((a, b) => {
          switch (filters.sortBy) {
            case 'revenue':
              return b.total_revenue - a.total_revenue;
            case 'profit':
              return b.total_profit - a.total_profit;
            case 'units':
              return b.total_units - a.total_units;
            case 'margin':
              return b.margin_percentage - a.margin_percentage;
            case 'transactions':
              return b.total_transactions - a.total_transactions;
            default:
              return b.total_revenue - a.total_revenue;
          }
        });

        // Limit results
        const limitedProducts = sortedProducts.slice(0, filters.limit);

        // Calculate summary
        const summary = {
          total_products: filteredProducts.length,
          total_revenue: filteredProducts.reduce((sum, p) => sum + p.total_revenue, 0),
          total_units: filteredProducts.reduce((sum, p) => sum + p.total_units, 0),
          average_margin: filteredProducts.length > 0 
            ? filteredProducts.reduce((sum, p) => sum + p.margin_percentage, 0) / filteredProducts.length 
            : 0
        };

        console.log('✅ Product analytics data processed:', {
          totalProducts: limitedProducts.length,
          summary
        });

        return {
          products: limitedProducts,
          summary
        };
      } catch (error) {
        console.error('❌ Error in product analytics query:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
