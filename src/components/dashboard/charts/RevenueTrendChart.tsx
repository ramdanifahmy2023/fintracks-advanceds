
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatCurrency } from '@/lib/formatters';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface RevenueTrendChartProps {
  data: Array<{
    month_start: string;
    revenue: number;
    profit: number;
    total_orders: number;
    platform_name: string;
    avg_order_value: number;
    month: number;
    year: number;
    total_packages: number;
    unique_products_sold: number;
  }>;
  loading?: boolean;
}

export const RevenueTrendChart = ({ data, loading }: RevenueTrendChartProps) => {
  // Process data for chart
  const chartData = data.reduce((acc, item) => {
    const dateKey = format(parseISO(item.month_start), 'yyyy-MM');
    const existing = acc.find(d => d.date === dateKey);
    
    if (existing) {
      existing.revenue += item.revenue || 0;
      existing.profit += item.profit || 0;
      existing.orders += item.total_orders || 0;
    } else {
      acc.push({
        date: dateKey,
        revenue: item.revenue || 0,
        profit: item.profit || 0,
        orders: item.total_orders || 0,
        displayDate: format(parseISO(item.month_start), 'MMM yyyy', { locale: id }),
        profitMargin: item.revenue > 0 ? ((item.profit / item.revenue) * 100) : 0
      });
    }
    
    return acc;
  }, [] as Array<{
    date: string;
    revenue: number;
    profit: number;
    orders: number;
    displayDate: string;
    profitMargin: number;
  }>).sort((a, b) => a.date.localeCompare(b.date));

  // Calculate trend
  const currentRevenue = chartData[chartData.length - 1]?.revenue || 0;
  const previousRevenue = chartData[chartData.length - 2]?.revenue || 0;
  const trendPercentage = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const isPositiveTrend = trendPercentage > 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Trend Penjualan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Trend Penjualan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed border-muted">
            <div className="text-center">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">Belum ada data trend</p>
              <p className="text-sm">Data akan muncul setelah upload transaksi</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Trend Penjualan
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            {isPositiveTrend ? (
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            <span className={`font-medium ${isPositiveTrend ? 'text-success' : 'text-destructive'}`}>
              {Math.abs(trendPercentage).toFixed(1)}%
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Perkembangan revenue dan profit dari waktu ke waktu
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--muted-foreground))" 
                opacity={0.3}
              />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => formatCurrency(value)}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background/95 backdrop-blur-sm p-4 border rounded-lg shadow-lg border-border min-w-[250px]">
                        <p className="font-medium text-foreground mb-3">{label}</p>
                        
                        <div className="space-y-2">
                          {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm text-muted-foreground">
                                  {entry.dataKey === 'revenue' ? 'Revenue' : 'Profit'}:
                                </span>
                              </div>
                              <span className="font-medium text-foreground">
                                {formatCurrency(entry.value as number)}
                              </span>
                            </div>
                          ))}
                          
                          <div className="pt-2 border-t border-border space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Pesanan:</span>
                              <span className="font-medium text-foreground">
                                {data.orders?.toLocaleString() || 0}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Profit Margin:</span>
                              <span className="font-medium text-foreground">
                                {data.profitMargin?.toFixed(1) || 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              {/* Revenue Line */}
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ 
                  r: 4, 
                  strokeWidth: 2, 
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--background))"
                }}
                activeDot={{ 
                  r: 6, 
                  strokeWidth: 2,
                  fill: "hsl(var(--primary))",
                  stroke: "hsl(var(--background))"
                }}
                name="Revenue"
              />
              
              {/* Profit Line */}
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="hsl(var(--success))"
                strokeWidth={3}
                dot={{ 
                  r: 4, 
                  strokeWidth: 2,
                  fill: "hsl(var(--success))",
                  stroke: "hsl(var(--background))"
                }}
                activeDot={{ 
                  r: 6, 
                  strokeWidth: 2,
                  fill: "hsl(var(--success))",
                  stroke: "hsl(var(--background))"
                }}
                name="Profit"
              />
              
              {/* Zero reference line for profit */}
              <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" opacity={0.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
