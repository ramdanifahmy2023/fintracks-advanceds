import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, TrendingUp, TrendingDown, Package, DollarSign, ShoppingCart, Target, Filter, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ProductAnalyticsProps {
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// Hook untuk fetch product performance data
const useProductAnalytics = (timeframe: string, sortBy: string, limit: number) => {
  return useQuery({
    queryKey: ['product-analytics', timeframe, sortBy, limit],
    queryFn: async () => {
      console.log('🔍 Fetching product analytics...', { timeframe, sortBy, limit });
      
      try {
        // Calculate date range
        const now = new Date();
        let daysBack = 90; // Default expanded range
        
        switch (timeframe) {
          case '7d':
            daysBack = 60;
            break;
          case '30d':
            daysBack = 90;
            break;
          case '90d':
            daysBack = 180;
            break;
          case '1y':
            daysBack = 365;
            break;
        }
        
        const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
        const endDate = now;

        const { data, error } = await supabase
          .from('sales_transactions')
          .select(`
            sku_reference,
            product_name,
            selling_price,
            cost_price,
            profit,
            quantity,
            delivery_status,
            order_created_at,
            platforms!inner(platform_name)
          `)
          .gte('order_created_at', startDate.toISOString().split('T')[0])
          .lte('order_created_at', endDate.toISOString().split('T')[0]);

        if (error) {
          console.error('❌ Error fetching product analytics:', error);
          throw error;
        }

        // Group by product
        const productData = data?.reduce((acc: any, transaction: any) => {
          const sku = transaction.sku_reference || 'UNKNOWN';
          const productName = transaction.product_name || 'Unknown Product';
          
          if (!acc[sku]) {
            acc[sku] = {
              sku_reference: sku,
              product_name: productName,
              total_revenue: 0,
              total_profit: 0,
              total_units: 0,
              total_transactions: 0,
              completed_revenue: 0,
              completed_profit: 0,
              completed_units: 0,
              margin: 0,
              avg_selling_price: 0,
              conversion_rate: 0,
              platforms: new Set(),
              first_sale: transaction.order_created_at,
              last_sale: transaction.order_created_at
            };
          }
          
          acc[sku].total_revenue += Number(transaction.selling_price || 0);
          acc[sku].total_profit += Number(transaction.profit || 0);
          acc[sku].total_units += Number(transaction.quantity || 0);
          acc[sku].total_transactions += 1;
          acc[sku].platforms.add(transaction.platforms?.platform_name || 'Unknown');
          
          // Update date range
          if (transaction.order_created_at < acc[sku].first_sale) {
            acc[sku].first_sale = transaction.order_created_at;
          }
          if (transaction.order_created_at > acc[sku].last_sale) {
            acc[sku].last_sale = transaction.order_created_at;
          }
          
          if (transaction.delivery_status === 'Selesai') {
            acc[sku].completed_revenue += Number(transaction.selling_price || 0);
            acc[sku].completed_profit += Number(transaction.profit || 0);
            acc[sku].completed_units += Number(transaction.quantity || 0);
          }
          
          return acc;
        }, {}) || {};

        // Calculate derived metrics and convert to array
        const result = Object.values(productData).map((product: any) => ({
          ...product,
          platforms: Array.from(product.platforms),
          margin: product.total_revenue > 0 ? (product.total_profit / product.total_revenue) * 100 : 0,
          avg_selling_price: product.total_transactions > 0 ? product.total_revenue / product.total_transactions : 0,
          conversion_rate: product.total_transactions > 0 ? (product.completed_units / product.total_units) * 100 : 0
        }));

        // Sort by selected criteria
        result.sort((a: any, b: any) => {
          switch (sortBy) {
            case 'revenue':
              return b.total_revenue - a.total_revenue;
            case 'profit':
              return b.total_profit - a.total_profit;
            case 'units':
              return b.total_units - a.total_units;
            case 'margin':
              return b.margin - a.margin;
            case 'transactions':
              return b.total_transactions - a.total_transactions;
            default:
              return b.total_revenue - a.total_revenue;
          }
        });

        console.log('✅ Product analytics fetched:', result.length, 'products');
        return result.slice(0, limit);
      } catch (error) {
        console.error('❌ Error in product analytics:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const ProductPerformancePage = ({ dateRange }: ProductAnalyticsProps) => {
  const [timeframe, setTimeframe] = useState('30d');
  const [sortBy, setSortBy] = useState('revenue');
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCharts, setShowCharts] = useState(true);

  const { data: productData, isLoading, error } = useProductAnalytics(timeframe, sortBy, limit);

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!productData) return [];
    
    if (!searchTerm) return productData;
    
    return productData.filter(product => 
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku_reference.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [productData, searchTerm]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!filteredProducts.length) return null;
    
    return {
      totalProducts: filteredProducts.length,
      totalRevenue: filteredProducts.reduce((sum, p) => sum + p.total_revenue, 0),
      totalProfit: filteredProducts.reduce((sum, p) => sum + p.total_profit, 0),
      totalUnits: filteredProducts.reduce((sum, p) => sum + p.total_units, 0),
      avgMargin: filteredProducts.reduce((sum, p) => sum + p.margin, 0) / filteredProducts.length,
      topPerformer: filteredProducts[0]
    };
  }, [filteredProducts]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!filteredProducts.length) return [];
    
    return filteredProducts.slice(0, 10).map(product => ({
      name: product.product_name.length > 20 ? product.product_name.substring(0, 20) + '...' : product.product_name,
      revenue: product.total_revenue,
      profit: product.total_profit,
      units: product.total_units,
      margin: product.margin
    }));
  }, [filteredProducts]);

  // Color scheme for charts
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive font-medium">Error loading product analytics</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : 'Failed to load product data'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Product Performance Analytics</h2>
          <p className="text-muted-foreground">Track sales performance and profitability by product</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowCharts(!showCharts)}
          >
            <BarChart className="h-4 w-4 mr-2" />
            {showCharts ? 'Hide Charts' : 'Show Charts'}
          </Button>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="profit">Profit</SelectItem>
                  <SelectItem value="units">Units Sold</SelectItem>
                  <SelectItem value="margin">Profit Margin</SelectItem>
                  <SelectItem value="transactions">Transactions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Show Top</label>
              <Select value={limit.toString()} onValueChange={(v) => setLimit(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">Top 10</SelectItem>
                  <SelectItem value="20">Top 20</SelectItem>
                  <SelectItem value="50">Top 50</SelectItem>
                  <SelectItem value="100">Top 100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Search Products</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by product name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      {summaryStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{summaryStats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(summaryStats.totalRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Units</p>
                  <p className="text-2xl font-bold">{summaryStats.totalUnits.toLocaleString()}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Margin</p>
                  <p className="text-2xl font-bold">{summaryStats.avgMargin.toFixed(1)}%</p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      {showCharts && chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Products by {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={(value) => 
                      sortBy === 'margin' ? `${value}%` : 
                      sortBy === 'units' ? value.toLocaleString() :
                      formatCurrency(value)
                    }
                  />
                  <Tooltip 
                    formatter={(value: any) => [
                      sortBy === 'margin' ? `${value.toFixed(1)}%` : 
                      sortBy === 'units' ? value.toLocaleString() :
                      formatCurrency(value),
                      sortBy.charAt(0).toUpperCase() + sortBy.slice(1)
                    ]}
                  />
                  <Bar dataKey={sortBy} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.slice(0, 6)}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Product Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded">
                  <div className="w-12 h-12 bg-muted rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                  <div className="w-20 h-4 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-3">
              {filteredProducts.map((product, index) => (
                <div key={product.sku_reference} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                      <span className="text-sm font-bold text-primary">#{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{product.product_name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span>SKU: {product.sku_reference}</span>
                        <span>•</span>
                        <span>{product.total_units} units</span>
                        <span>•</span>
                        <span>{product.margin.toFixed(1)}% margin</span>
                        <span>•</span>
                        <span>{product.platforms.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(product.total_revenue)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Profit: {formatCurrency(product.total_profit)}
                    </p>
                    <div className="flex items-center justify-end mt-1">
                      {product.margin > 25 ? (
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : product.margin < 10 ? (
                        <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                      ) : null}
                      <Badge variant={product.margin > 25 ? "default" : product.margin < 10 ? "destructive" : "secondary"}>
                        {product.total_transactions} transactions
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};