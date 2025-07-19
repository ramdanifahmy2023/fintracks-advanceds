import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { formatCurrency } from '@/lib/formatters';

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
        displayDate: format(parseISO(item.month_start), 'MMM yyyy', { locale: id })
      });
    }
    
    return acc;
  }, [] as Array<{
    date: string;
    revenue: number;
    profit: number;
    orders: number;
    displayDate: string;
  }>).sort((a, b) => a.date.localeCompare(b.date));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trend Penjualan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Trend Penjualan</CardTitle>
        <p className="text-sm text-muted-foreground">
          Perkembangan revenue dan profit dari waktu ke waktu
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-4 border rounded-lg shadow-lg border-border">
                      <p className="font-medium text-foreground mb-2">{label}</p>
                      {payload.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm text-muted-foreground">
                              {entry.name === 'revenue' ? 'Revenue' : 'Profit'}:
                            </span>
                          </div>
                          <span className="font-medium text-foreground">
                            {formatCurrency(entry.value as number)}
                          </span>
                        </div>
                      ))}
                      <div className="mt-2 pt-2 border-t border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Pesanan:</span>
                          <span className="font-medium text-foreground">
                            {(payload[0]?.payload as any)?.orders?.toLocaleString() || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name="revenue"
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="hsl(var(--success))"
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name="profit"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};