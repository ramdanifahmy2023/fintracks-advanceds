
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package } from 'lucide-react';
import { useProductPerformance } from '@/hooks/useAnalytics';
import { formatCurrency } from '@/lib/formatters';

interface ProductAnalyticsProps {
  timeframe: string;
}

export const ProductPerformanceAnalytics = ({ timeframe }: ProductAnalyticsProps) => {
  const [viewMode, setViewMode] = useState<'revenue' | 'profit' | 'units' | 'margin'>('revenue');
  const [showTop, setShowTop] = useState<10 | 20 | 50>(10);
  const { data: productData, isLoading } = useProductPerformance(timeframe, showTop);

  const sortedProductData = useMemo(() => {
    if (!productData || !Array.isArray(productData)) return [];
    
    try {
      // Create a safe copy before any operations
      return [...productData];
    } catch (error) {
      console.error('Error processing product data:', error);
      return [];
    }
  }, [productData]);

  const bestPerformer = useMemo(() => {
    if (!sortedProductData || sortedProductData.length === 0) return 'N/A';
    return sortedProductData[0]?.product_name?.substring(0, 30) + '...' || 'N/A';
  }, [sortedProductData]);

  const highestMargin = useMemo(() => {
    if (!sortedProductData || sortedProductData.length === 0) return 0;
    
    try {
      const marginSorted = [...sortedProductData].sort((a, b) => (b.margin || 0) - (a.margin || 0));
      return marginSorted[0]?.margin?.toFixed(1) || '0';
    } catch (error) {
      console.error('Error calculating highest margin:', error);
      return '0';
    }
  }, [sortedProductData]);

  const mostUnitsSold = useMemo(() => {
    if (!sortedProductData || sortedProductData.length === 0) return 0;
    
    try {
      const unitsSorted = [...sortedProductData].sort((a, b) => (b.total_units || 0) - (a.total_units || 0));
      return unitsSorted[0]?.total_units?.toLocaleString() || '0';
    } catch (error) {
      console.error('Error calculating most units sold:', error);
      return '0';
    }
  }, [sortedProductData]);

  const averageMargin = useMemo(() => {
    if (!sortedProductData || sortedProductData.length === 0) return '0.0';
    
    try {
      const totalMargin = sortedProductData.reduce((sum, p) => sum + (p.margin || 0), 0);
      return (totalMargin / sortedProductData.length).toFixed(1);
    } catch (error) {
      console.error('Error calculating average margin:', error);
      return '0.0';
    }
  }, [sortedProductData]);

  const handleProductClick = (product: any) => {
    console.log('Product clicked:', product);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2 text-primary" />
            Product Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="w-8 h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
                <div className="w-20 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-primary" />
              Product Performance Analysis
            </CardTitle>
            <CardDescription>
              Top performing products by {viewMode} over {timeframe}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Select value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="profit">Profit</SelectItem>
                <SelectItem value="units">Units Sold</SelectItem>
                <SelectItem value="margin">Margin %</SelectItem>
              </SelectContent>
            </Select>
            <Select value={showTop.toString()} onValueChange={(v) => setShowTop(Number(v) as any)}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">Top 10</SelectItem>
                <SelectItem value="20">Top 20</SelectItem>
                <SelectItem value="50">Top 50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedProductData?.map((product, index) => (
            <div 
              key={product.sku_reference} 
              className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              onClick={() => handleProductClick(product)}
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                  <span className="text-sm font-bold text-primary">#{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium line-clamp-1">
                    {product.product_name}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <span>SKU: {product.sku_reference}</span>
                    <span>•</span>
                    <span>{product.total_units} units</span>
                    <span>•</span>
                    <span>{product.margin.toFixed(1)}% margin</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  {viewMode === 'revenue' && formatCurrency(product.total_revenue)}
                  {viewMode === 'profit' && formatCurrency(product.total_profit)}
                  {viewMode === 'units' && product.total_units.toLocaleString()}
                  {viewMode === 'margin' && `${product.margin.toFixed(1)}%`}
                </p>
                <p className="text-sm text-muted-foreground">
                  {viewMode !== 'revenue' && `Revenue: ${formatCurrency(product.total_revenue)}`}
                  {viewMode !== 'profit' && `Profit: ${formatCurrency(product.total_profit)}`}
                  {viewMode !== 'units' && `${product.total_units} units`}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Product Insights */}
        <div className="mt-6 p-4 bg-primary/5 rounded-lg">
          <h4 className="font-medium text-primary mb-3">Product Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Best Performer:</span>
              <span className="ml-2 font-medium">{bestPerformer}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Highest Margin:</span>
              <span className="ml-2 font-medium">{highestMargin}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Most Units Sold:</span>
              <span className="ml-2 font-medium">{mostUnitsSold}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Average Margin:</span>
              <span className="ml-2 font-medium">{averageMargin}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
