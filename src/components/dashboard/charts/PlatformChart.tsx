import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatNumber } from '@/lib/formatters';

interface PlatformChartProps {
  data: Array<{
    platform_name: string;
    total_revenue: number;
    total_profit: number;
    total_transactions: number;
    completion_rate_percentage: number;
    profit_margin_percentage: number;
    avg_transaction_value: number;
    total_packages: number;
    active_days: number;
    total_stores: number;
    completed_revenue: number;
    completed_profit: number;
    platform_id: string;
  }>;
  loading?: boolean;
}

export const PlatformChart = ({ data, loading }: PlatformChartProps) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performa Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // Sort platforms by revenue for better visualization
  const sortedData = [...data].sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performa Platform</CardTitle>
        <p className="text-sm text-muted-foreground">
          Perbandingan revenue dan profit antar platform
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={sortedData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="platform_name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
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
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-4 border rounded-lg shadow-lg border-border min-w-[200px]">
                      <p className="font-medium text-foreground mb-3">{label}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Revenue:</span>
                          <span className="font-medium text-foreground">
                            {formatCurrency(data.total_revenue || 0)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Profit:</span>
                          <span className="font-medium text-success">
                            {formatCurrency(data.total_profit || 0)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Transaksi:</span>
                          <span className="font-medium text-foreground">
                            {formatNumber(data.total_transactions || 0)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Completion:</span>
                          <span className="font-medium text-foreground">
                            {(data.completion_rate_percentage || 0).toFixed(1)}%
                          </span>
                        </div>
                        
                        {data.total_revenue > 0 && (
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="text-sm text-muted-foreground">Profit Margin:</span>
                            <span className="font-medium text-foreground">
                              {((data.total_profit / data.total_revenue) * 100).toFixed(1)}%
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
            <Bar 
              dataKey="total_revenue" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              name="Revenue"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};