
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Search, 
  Filter,
  ArrowUpDown,
  Eye
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useProductAnalytics } from '@/hooks/useProductAnalytics';
import { formatCurrency, formatNumber } from '@/lib/formatters';

interface ProductPerformanceAnalyticsProps {
  timeframe?: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#0088fe', '#ff8042', '#8dd1e1', '#d084d0', '#ffb347'];

export const ProductPerformanceAnalytics = ({ timeframe = '30d' }: ProductPerformanceAnalyticsProps) => {
  const [filters, setFilters] = useState({
    timeframe: timeframe as '7d' | '30d' | '90d' | '1y',
    sortBy: 'revenue' as 'revenue' | 'profit' | 'units' | 'margin' | 'transactions',
    searchTerm: '',
    limit: 50
  });

  const { data, isLoading, error } = useProductAnalytics(filters);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const barChartData = data?.products?.slice(0, 10).map(product => ({
    name: product.product_name.length > 20 
      ? product.product_name.substring(0, 20) + '...' 
      : product.product_name,
    revenue: product.total_revenue,
    profit: product.total_profit,
    units: product.total_units
  })) || [];

  const pieChartData = data?.products?.slice(0, 8).map((product, index) => ({
    name: product.product_name.length > 15 
      ? product.product_name.substring(0, 15) + '...' 
      : product.product_name,
    value: product.total_revenue,
    color: COLORS[index % COLORS.length]
  })) || [];

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Error loading product analytics data</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Performance Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis of product sales and profitability
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={filters.timeframe} onValueChange={(value) => handleFilterChange('timeframe', value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="profit">Profit</SelectItem>
              <SelectItem value="units">Units Sold</SelectItem>
              <SelectItem value="margin">Margin %</SelectItem>
              <SelectItem value="transactions">Transactions</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.limit.toString()} onValueChange={(value) => handleFilterChange('limit', Number(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">Top 25</SelectItem>
              <SelectItem value="50">Top 50</SelectItem>
              <SelectItem value="100">Top 100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products by name or SKU..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '...' : formatNumber(data?.summary?.total_products || 0)}
                </p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '...' : formatCurrency(data?.summary?.total_revenue || 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Units Sold</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '...' : formatNumber(data?.summary?.total_units || 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Margin</p>
                <p className="text-2xl font-bold">
                  {isLoading ? '...' : `${(data?.summary?.average_margin || 0).toFixed(1)}%`}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Products by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'revenue' ? formatCurrency(value as number) : formatNumber(value as number),
                      name === 'revenue' ? 'Revenue' : name === 'profit' ? 'Profit' : 'Units'
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Product Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Product Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center space-x-4">
                  <div className="w-8 h-8 bg-muted rounded" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                    <TableHead className="text-right">Transactions</TableHead>
                    <TableHead className="text-right">Avg. Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.products?.map((product) => (
                    <TableRow key={`${product.sku_reference}_${product.product_name}`}>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{product.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            SKU: {product.sku_reference}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(product.total_revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={product.total_profit > 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(product.total_profit)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(product.total_units)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={product.margin_percentage > 20 ? 'default' : 'secondary'}>
                          {product.margin_percentage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatNumber(product.total_transactions)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.avg_selling_price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
