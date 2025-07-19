import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';

interface ComparativeAnalysisProps {
  timeframe: string;
  platforms: string[];
}

export const ComparativeAnalysisSection = ({ timeframe, platforms }: ComparativeAnalysisProps) => {
  // Mock data - in real implementation, fetch from API
  const comparisonData = {
    currentPeriod: {
      revenue: 85000000,
      profit: 25500000,
      transactions: 1250,
      avgOrderValue: 68000
    },
    previousPeriod: {
      revenue: 78000000,
      profit: 22000000,
      transactions: 1180,
      avgOrderValue: 66100
    }
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const metrics = [
    {
      label: 'Revenue',
      current: comparisonData.currentPeriod.revenue,
      previous: comparisonData.previousPeriod.revenue,
      format: formatCurrency
    },
    {
      label: 'Profit',
      current: comparisonData.currentPeriod.profit,
      previous: comparisonData.previousPeriod.profit,
      format: formatCurrency
    },
    {
      label: 'Transactions',
      current: comparisonData.currentPeriod.transactions,
      previous: comparisonData.previousPeriod.transactions,
      format: (val: number) => val.toLocaleString()
    },
    {
      label: 'Avg Order Value',
      current: comparisonData.currentPeriod.avgOrderValue,
      previous: comparisonData.previousPeriod.avgOrderValue,
      format: formatCurrency
    }
  ];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-primary" />
          Comparative Analysis - Current vs Previous {timeframe}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => {
            const change = calculateChange(metric.current, metric.previous);
            const isPositive = change > 0;
            
            return (
              <div key={metric.label} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm text-muted-foreground">{metric.label}</h4>
                  <div className={`flex items-center text-xs ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {isPositive ? '+' : ''}{change.toFixed(1)}%
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Current</p>
                    <p className="text-lg font-bold">{metric.format(metric.current)}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Previous</p>
                    <p className="text-sm text-muted-foreground">{metric.format(metric.previous)}</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Change:</span>
                    <span className={`font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.format(metric.current - metric.previous)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Summary Insights */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Period Comparison Summary</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Revenue growth of {calculateChange(comparisonData.currentPeriod.revenue, comparisonData.previousPeriod.revenue).toFixed(1)}% indicates strong business performance</p>
            <p>• Profit margin improved to {((comparisonData.currentPeriod.profit / comparisonData.currentPeriod.revenue) * 100).toFixed(1)}%</p>
            <p>• Transaction volume increased by {calculateChange(comparisonData.currentPeriod.transactions, comparisonData.previousPeriod.transactions).toFixed(1)}%</p>
            <p>• Average order value grew {calculateChange(comparisonData.currentPeriod.avgOrderValue, comparisonData.previousPeriod.avgOrderValue).toFixed(1)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};