import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart3, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePlatformPerformance } from '@/hooks/useAnalytics';
import { formatCurrency } from '@/lib/formatters';

interface PlatformChartProps {
  timeframe: string;
  platforms: string[];
  onChartClick: (data: any) => void;
}

export const PlatformPerformanceChart = ({ 
  timeframe, 
  platforms, 
  onChartClick 
}: PlatformChartProps) => {
  const { data: platformData, isLoading } = usePlatformPerformance(timeframe, platforms);
  const [sortBy, setSortBy] = useState<'revenue' | 'profit' | 'margin' | 'transactions'>('revenue');
  const [showDetails, setShowDetails] = useState(false);

  const sortedData = useMemo(() => {
    return platformData?.sort((a, b) => b[sortBy] - a[sortBy]) || [];
  }, [platformData, sortBy]);

  const handleBarClick = (data: any) => {
    onChartClick({
      type: 'platform-detail',
      platform: data.platform_name,
      metrics: data,
      timeframe
    });
  };

  const PlatformTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-4 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Revenue:</span>
              <span className="font-medium text-green-600">{formatCurrency(data.revenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Profit:</span>
              <span className="font-medium text-blue-600">{formatCurrency(data.profit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Margin:</span>
              <span className="font-medium text-purple-600">{data.margin.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Transactions:</span>
              <span className="font-medium text-orange-600">{data.transactions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Growth:</span>
              <span className={`font-medium ${data.growth_rate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.growth_rate > 0 ? '+' : ''}{data.growth_rate.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t">
            <p className="text-xs text-muted-foreground">Click for detailed analysis</p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Platform Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] bg-muted rounded animate-pulse" />
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
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              Platform Performance
            </CardTitle>
            <CardDescription>
              Comparative analysis across marketplace platforms
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="profit">Profit</SelectItem>
                <SelectItem value="margin">Margin %</SelectItem>
                <SelectItem value="transactions">Transactions</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Details
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={sortedData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              tickFormatter={(value) => 
                sortBy === 'margin' ? `${value}%` : 
                sortBy === 'transactions' ? value.toLocaleString() :
                formatCurrency(value)
              }
            />
            <YAxis type="category" dataKey="platform_name" width={100} />
            <Tooltip 
              content={<PlatformTooltip />}
              cursor={{ fill: 'hsl(var(--primary)/0.1)' }}
            />
            <Bar 
              dataKey={sortBy} 
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
              onClick={handleBarClick}
              className="cursor-pointer hover:opacity-80"
            />
          </BarChart>
        </ResponsiveContainer>
        
        {showDetails && (
          <div className="mt-4 space-y-3">
            <h4 className="font-medium">Platform Details</h4>
            {sortedData.map((platform, index) => (
              <div key={platform.platform_name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{platform.platform_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {platform.transactions} transactions • {platform.margin.toFixed(1)}% margin
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    {formatCurrency(platform.revenue)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Profit: {formatCurrency(platform.profit)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Performance Summary */}
        <div className="mt-4 p-4 bg-primary/5 rounded-lg">
          <h4 className="font-medium text-primary mb-2">Performance Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Top Performer:</span>
              <span className="ml-2 font-medium">{sortedData[0]?.platform_name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Best Margin:</span>
              <span className="ml-2 font-medium">
                {sortedData.sort((a, b) => b.margin - a.margin)[0]?.platform_name}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Most Active:</span>
              <span className="ml-2 font-medium">
                {sortedData.sort((a, b) => b.transactions - a.transactions)[0]?.platform_name}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Growth Leader:</span>
              <span className="ml-2 font-medium">
                {sortedData.sort((a, b) => b.growth_rate - a.growth_rate)[0]?.platform_name}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};