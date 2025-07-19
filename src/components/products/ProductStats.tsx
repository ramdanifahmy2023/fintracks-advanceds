
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Package, TrendingUp, DollarSign, Star } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

export const ProductStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['product-stats'],
    queryFn: async () => {
      // Get total products count
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get unique categories
      const { data: categories } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);

      const uniqueCategories = new Set(categories?.map(item => item.category)).size;

      // Get best selling product from sales transactions
      const { data: bestSeller } = await supabase
        .from('sales_transactions')
        .select('product_name, quantity')
        .eq('delivery_status', 'Selesai')
        .order('quantity', { ascending: false })
        .limit(1);

      // Calculate average margin from products with sales data
      const { data: productProfits } = await supabase
        .from('sales_transactions')
        .select('profit, selling_price, quantity')
        .eq('delivery_status', 'Selesai');

      let avgMargin = 0;
      if (productProfits && productProfits.length > 0) {
        const totalRevenue = productProfits.reduce((sum, item) => sum + (item.selling_price * item.quantity), 0);
        const totalProfit = productProfits.reduce((sum, item) => sum + (item.profit || 0), 0);
        avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
      }

      return {
        totalProducts: totalProducts || 0,
        totalCategories: uniqueCategories,
        bestSellerName: bestSeller?.[0]?.product_name || 'N/A',
        avgMargin: avgMargin,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 w-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
          <p className="text-xs text-muted-foreground">Active products</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalCategories || 0}</div>
          <p className="text-xs text-muted-foreground">Product categories</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Best Seller</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-bold truncate" title={stats?.bestSellerName}>
            {stats?.bestSellerName || 'N/A'}
          </div>
          <p className="text-xs text-muted-foreground">Top performing product</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Margin</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.avgMargin ? `${stats.avgMargin.toFixed(1)}%` : '0%'}
          </div>
          <p className="text-xs text-muted-foreground">Profit margin</p>
        </CardContent>
      </Card>
    </div>
  );
};
