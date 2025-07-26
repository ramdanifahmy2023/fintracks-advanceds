
import { useState, useMemo } from 'react';
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

  const peakDay = useMemo(() => {
    if (!chartData || chartData.length === 0) return 'N/A';
    
    try {
      // Create a safe copy of the array before sorting
      const sortedData = [...chartData].sort((a, b) => (b[metric] || 0) - (a[metric] || 0));
      return sortedData[0] ? format(new Date(sortedData[0].date), 'dd MMM') : 'N/A';
    } catch (error) {
      console.error('Error calculating peak day:', error);
      return 'N/A';
    }
  }, [chartData, metric]);

  const averageDaily = useMemo(() => {
    if (!chartData || chartData.length === 0) return 0;
    return chartData.reduce((sum, d) => sum + (d[metric] || 0), 0) / chartData.length;
  }, [chartData, metric]);

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
            {format(new Date(label), 'dd MMM yyyy')}
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
              <p className="text-xs text-muted-foreground">Klik untuk detail lengkap</p>
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
            Analisis Omset
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-destructive font-medium">Kesalahan memuat data grafik</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof Error ? error.message : 'Gagal memuat analisis omset'}
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
            Analisis Omset
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
            Analisis Omset
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">Tidak ada data tersedia</p>
              <p className="text-sm text-muted-foreground mt-1">
                Coba sesuaikan filter atau rentang tanggal Anda
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
              Analisis Omset
            </CardTitle>
            <CardDescription>
              Tren {metric === 'revenue' ? 'Omset' : 
                    metric === 'profit' ? 'Profit' : 
                    metric === 'transactions' ? 'Jumlah Transaksi' : 'Margin Profit'} 
              selama {timeframe}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Select value={chartType} onValueChange={(value) => setChartType(value as any)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Grafik Garis</SelectItem>
                <SelectItem value="bar">Grafik Batang</SelectItem>
                <SelectItem value="area">Grafik Area</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComparison(!showComparison)}
            >
              <BarChart className="h-4 w-4 mr-1" />
              Bandingkan
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
                tickFormatter={(value) => format(new Date(value), 'dd MMM')}
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
                name={metric === 'revenue' ? 'Omset' : 
                      metric === 'profit' ? 'Profit' : 
                      metric === 'transactions' ? 'Transaksi' : 'Margin %'}
              />
              
              {chartData.some(d => d.trendLine !== undefined) && (
                <Line
                  type="monotone"
                  dataKey="trendLine"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  name="Tren"
                />
              )}
            </LineChart>
          ) : chartType === 'bar' ? (
            <RechartsBarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => format(new Date(value), 'dd MMM')}
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
                tickFormatter={(value) => format(new Date(value), 'dd MMM')}
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
          <h4 className="font-medium text-primary mb-2">Wawasan Utama</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Hari Puncak:</span>
              <span className="ml-2 font-medium">{peakDay}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Rata-rata Harian:</span>
              <span className="ml-2 font-medium">
                {formatCurrency(averageDaily)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Tren:</span>
              <span className="ml-2 font-medium">
                📈 Berkembang
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
