
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/lib/formatters';
import { Tag, TrendingUp, Package2 } from 'lucide-react';
import { useState } from 'react';

interface CategoryChartProps {
  data: Array<{
    product_name: string;
    category: string;
    sku_reference: string;
    completed_profit: number;
    completed_revenue: number;
    total_quantity_sold: number;
    avg_profit_per_sale: number;
    profit_margin_percentage: number;
    first_sale_date: string;
    last_sale_date: string;
    platforms_sold_on: number;
    total_sales: number;
    completed_quantity: number;
  }>;
  loading?: boolean;
  onCategoryClick?: (category: string) => void;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))', 
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(var(--secondary))',
  '#8b5cf6',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#f43f5e'
];

export const CategoryChart = ({ data, loading, onCategoryClick }: CategoryChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Distribusi Kategori Produk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
            <div className="text-muted-foreground">Loading category data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Process data for pie chart - group by category
  const categoryMap = new Map<string, {
    name: string;
    value: number;
    revenue: number;
    quantity: number;
    products: number;
    avgMargin: number;
  }>();

  data.forEach(item => {
    const category = item.category || 'Tidak Dikategorikan';
    const existing = categoryMap.get(category);
    
    if (existing) {
      existing.value += item.completed_profit || 0;
      existing.revenue += item.completed_revenue || 0;
      existing.quantity += item.total_quantity_sold || 0;
      existing.products += 1;
    } else {
      categoryMap.set(category, {
        name: category,
        value: item.completed_profit || 0,
        revenue: item.completed_revenue || 0,
        quantity: item.total_quantity_sold || 0,
        products: 1,
        avgMargin: item.profit_margin_percentage || 0
      });
    }
  });

  const chartData = Array.from(categoryMap.values())
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8) // Top 8 categories
    .map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length],
      avgMargin: item.revenue > 0 ? (item.value / item.revenue) * 100 : 0
    }));

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Distribusi Kategori Produk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed border-muted">
            <div className="text-center">
              <Tag className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">Belum ada data kategori</p>
              <p className="text-sm">Data akan muncul setelah upload transaksi</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
  const topCategory = chartData[0];

  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices < 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Distribusi Kategori Produk
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Top: {topCategory?.name}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Kontribusi profit berdasarkan kategori produk
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={(data) => {
                  if (onCategoryClick) {
                    onCategoryClick(data.name);
                  }
                }}
                style={{ cursor: onCategoryClick ? 'pointer' : 'default' }}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                    stroke={activeIndex === index ? "hsl(var(--background))" : "none"}
                    strokeWidth={activeIndex === index ? 2 : 0}
                  />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const percentage = ((data.value / totalValue) * 100).toFixed(1);
                    
                    return (
                      <div className="bg-background/95 backdrop-blur-sm p-4 border rounded-lg shadow-lg border-border min-w-[250px]">
                        <div className="flex items-center gap-2 mb-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: data.color }}
                          />
                          <p className="font-medium text-foreground">{data.name}</p>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Profit:</span>
                            <span className="font-medium text-success">
                              {formatCurrency(data.value)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Revenue:</span>
                            <span className="font-medium text-foreground">
                              {formatCurrency(data.revenue)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Terjual:</span>
                            <span className="font-medium text-foreground">
                              {data.quantity.toLocaleString()} pcs
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Produk:</span>
                            <span className="font-medium text-foreground">
                              {data.products} jenis
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="text-muted-foreground">Kontribusi:</span>
                            <span className="font-medium text-primary">
                              {percentage}%
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Profit Margin:</span>
                            <span className="font-medium text-foreground">
                              {data.avgMargin.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        
                        {onCategoryClick && (
                          <div className="mt-3 text-xs text-muted-foreground">
                            Click untuk filter kategori ini
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Category Legend */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {chartData.slice(0, 6).map((item, index) => (
            <div key={item.name} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground truncate">{item.name}</div>
                <div className="text-muted-foreground">{formatCurrency(item.value)}</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-foreground">{chartData.length}</div>
              <div className="text-sm text-muted-foreground">Kategori</div>
            </div>
            <div>
              <div className="text-lg font-bold text-success">{formatCurrency(totalValue)}</div>
              <div className="text-sm text-muted-foreground">Total Profit</div>
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">
                {chartData.reduce((sum, item) => sum + item.products, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Produk</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
