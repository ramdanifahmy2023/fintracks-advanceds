import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/lib/formatters';

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
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))', 
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(var(--secondary))',
  '#8b5cf6',
  '#f59e0b',
  '#10b981'
];

export const CategoryChart = ({ data, loading }: CategoryChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Kategori Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // Process data for pie chart
  const chartData = data
    .filter(item => item.category && item.completed_profit > 0)
    .map(item => ({
      name: item.category || 'Tidak Dikategorikan',
      value: item.completed_profit || 0,
      revenue: item.completed_revenue || 0,
      quantity: item.total_quantity_sold || 0
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8); // Top 8 categories

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribusi Kategori Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Tidak ada data kategori untuk ditampilkan
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribusi Kategori Produk</CardTitle>
        <p className="text-sm text-muted-foreground">
          Kontribusi profit berdasarkan kategori produk
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={30}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const percentage = ((data.value / totalValue) * 100).toFixed(1);
                  
                  return (
                    <div className="bg-white p-4 border rounded-lg shadow-lg border-border min-w-[200px]">
                      <p className="font-medium text-foreground mb-3">{data.name}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Profit:</span>
                          <span className="font-medium text-success">
                            {formatCurrency(data.value)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Revenue:</span>
                          <span className="font-medium text-foreground">
                            {formatCurrency(data.revenue)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Terjual:</span>
                          <span className="font-medium text-foreground">
                            {data.quantity.toLocaleString()} pcs
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-border">
                          <span className="text-sm text-muted-foreground">Kontribusi:</span>
                          <span className="font-medium text-foreground">
                            {percentage}%
                          </span>
                        </div>
                        
                        {data.revenue > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Profit Margin:</span>
                            <span className="font-medium text-foreground">
                              {((data.value / data.revenue) * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Legend with detailed info */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          {chartData.slice(0, 6).map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="truncate">{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};