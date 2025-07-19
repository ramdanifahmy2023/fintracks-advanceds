
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart as RechartsBarChart, Bar, AreaChart, Area } from 'recharts';
import { useRevenueAnalytics } from '@/hooks/useAnalytics';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';

interface RevenueChartProps {
  timeframe: string;
  metric: string;
  platforms: string[];
  onChartClick: (data: any) => void;
}

export const RevenueAnalyticsChart = ({ 
  timeframe, 
  metric, 
  platforms, 
  onChartClick 
}: RevenueChartProps) => {
  const { data: chartData, isLoading, error } = useRevenueAnalytics(timeframe, platforms);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [showComparison, setShowComparison] = useState(false);

  const handleDataPointClick = (data: any, index: number) => {
    onChartClick({
      type: 'revenue-detail',
      date: data.date,
      value: data[metric],
      breakdown: data.breakdown
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-4 border rounded-lg shadow-lg">
          <p className="font-medium">
            {format(new Date(label), 'MMM dd, yyyy')}
          </p>
          <div className="space-y-2 mt-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{entry.name}:</span>
                <span className="font-medium" style={{ color: entry.color }}>
                  {metric === 'margin' ? `${entry.value}%` : 
                   metric === 'transactions' ? entry.value.toLocaleString() :
                   formatCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>
          
          {data.breakdown && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-xs text-muted-foreground">Click for detailed breakdown</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Revenue Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-destructive font-medium">Error loading chart data</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof Error ? error.message : 'Failed to load revenue analytics'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Revenue Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Revenue Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">No data available</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your filters or date range
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Revenue Analytics
            </CardTitle>
            <CardDescription>
              {metric === 'revenue' ? 'Revenue' : 
               metric === 'profit' ? 'Profit' : 
               metric === 'transactions' ? 'Transaction Count' : 'Profit Margin'} 
              trends over {timeframe}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Select value={chartType} onValueChange={(value) => setChartType(value as any)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="area">Area Chart</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComparison(!showComparison)}
            >
              <BarChart className="h-4 w-4 mr-1" />
              Compare
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          {chartType === 'line' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => 
                  metric === 'margin' ? `${value}%` : formatCurrency(value)
                }
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1 }}
              />
              <Legend />
              
              <Line
                type="monotone"
                dataKey={metric}
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                activeDot={{ 
                  r: 6, 
                  stroke: 'hsl(var(--primary))', 
                  strokeWidth: 2, 
                  fill: 'hsl(var(--background))'
                }}
                name={metric === 'revenue' ? 'Revenue' : 
                      metric === 'profit' ? 'Profit' : 
                      metric === 'transactions' ? 'Transactions' : 'Margin %'}
              />
              
              {chartData.some(d => d.trendLine !== undefined) && (
                <Line
                  type="monotone"
                  dataKey="trendLine"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  name="Trend"
                />
              )}
            </LineChart>
          ) : chartType === 'bar' ? (
            <RechartsBarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
              />
              <YAxis tickFormatter={(value) => 
                metric === 'margin' ? `${value}%` : formatCurrency(value)
              } />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={metric} 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
            </RechartsBarChart>
          ) : (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MMM dd')}
              />
              <YAxis tickFormatter={(value) => 
                metric === 'margin' ? `${value}%` : formatCurrency(value)
              } />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={metric}
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary)/0.2)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
        
        {/* Chart Insights */}
        <div className="mt-4 p-4 bg-primary/5 rounded-lg">
          <h4 className="font-medium text-primary mb-2">Key Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Peak Day:</span>
              <span className="ml-2 font-medium">
                {(() => {
                  const peakData = [...chartData].sort((a, b) => (b[metric] || 0) - (a[metric] || 0))[0];
                  return peakData ? format(new Date(peakData.date), 'MMM dd') : 'N/A';
                })()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Average Daily:</span>
              <span className="ml-2 font-medium">
                {formatCurrency((chartData.reduce((sum, d) => sum + (d[metric] || 0), 0)) / chartData.length)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Trend:</span>
              <span className="ml-2 font-medium">
                📈 Growing
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
