import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ComparativeAnalysisProps {
  timeframe: string;
  platforms: string[];
}

// Helper function to get date ranges
const getDateRanges = (timeframe: string) => {
  const now = new Date();
  let daysBack = 30;

  switch (timeframe) {
    case '7d':
      daysBack = 7;
      break;
    case '30d':
      daysBack = 30;
      break;
    case '90d':
      daysBack = 90;
      break;
    case '1y':
      daysBack = 365;
      break;
  }

  const currentStart = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
  const currentEnd = now;
  
  const previousStart = new Date(currentStart.getTime() - (daysBack * 24 * 60 * 60 * 1000));
  const previousEnd = currentStart;

  return {
    current: {
      start: currentStart.toISOString().split('T')[0],
      end: currentEnd.toISOString().split('T')[0]
    },
    previous: {
      start: previousStart.toISOString().split('T')[0],
      end: previousEnd.toISOString().split('T')[0]
    }
  };
};

// Hook to fetch comparative data
const useComparativeData = (timeframe: string, platforms: string[]) => {
  return useQuery({
    queryKey: ['comparative-analysis', timeframe, platforms],
    queryFn: async () => {
      console.log('🔍 Fetching comparative analysis data...', { timeframe, platforms });
      
      try {
        const dateRanges = getDateRanges(timeframe);

        // Build platform filter
        let platformFilter = {};
        if (platforms && platforms.length > 0) {
          platformFilter = { platform_id: { in: platforms } };
        }

        // Fetch current period data
        const currentQuery = supabase
          .from('sales_transactions')
          .select('selling_price, profit, quantity, order_created_at')
          .gte('order_created_at', dateRanges.current.start)
          .lte('order_created_at', dateRanges.current.end);

        if (platforms && platforms.length > 0) {
          currentQuery.in('platform_id', platforms);
        }

        const { data: currentData, error: currentError } = await currentQuery;

        if (currentError) {
          console.error('❌ Error fetching current period data:', currentError);
          throw currentError;
        }

        // Fetch previous period data
        const previousQuery = supabase
          .from('sales_transactions')
          .select('selling_price, profit, quantity, order_created_at')
          .gte('order_created_at', dateRanges.previous.start)
          .lte('order_created_at', dateRanges.previous.end);

        if (platforms && platforms.length > 0) {
          previousQuery.in('platform_id', platforms);
        }

        const { data: previousData, error: previousError } = await previousQuery;

        if (previousError) {
          console.error('❌ Error fetching previous period data:', previousError);
          throw previousError;
        }

        // Calculate current period metrics
        const currentMetrics = {
          revenue: currentData?.reduce((sum, t) => sum + Number(t.selling_price || 0), 0) || 0,
          profit: currentData?.reduce((sum, t) => sum + Number(t.profit || 0), 0) || 0,
          transactions: currentData?.length || 0,
          avgOrderValue: 0
        };
        
        currentMetrics.avgOrderValue = currentMetrics.transactions > 0 
          ? currentMetrics.revenue / currentMetrics.transactions 
          : 0;

        // Calculate previous period metrics
        const previousMetrics = {
          revenue: previousData?.reduce((sum, t) => sum + Number(t.selling_price || 0), 0) || 0,
          profit: previousData?.reduce((sum, t) => sum + Number(t.profit || 0), 0) || 0,
          transactions: previousData?.length || 0,
          avgOrderValue: 0
        };

        previousMetrics.avgOrderValue = previousMetrics.transactions > 0 
          ? previousMetrics.revenue / previousMetrics.transactions 
          : 0;

        console.log('✅ Comparative analysis data fetched successfully', {
          current: currentMetrics,
          previous: previousMetrics
        });

        return {
          currentPeriod: currentMetrics,
          previousPeriod: previousMetrics
        };
      } catch (error) {
        console.error('❌ Error fetching comparative data:', error);
        throw new Error('Failed to fetch comparative analysis data');
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const ComparativeAnalysisSection = ({ timeframe, platforms }: ComparativeAnalysisProps) => {
  const { data: comparisonData, isLoading, error } = useComparativeData(timeframe, platforms);

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const metrics = useMemo(() => {
    if (!comparisonData) return [];

    return [
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
  }, [comparisonData]);

  if (error) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Comparative Analysis - Current vs Previous {timeframe}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-destructive p-6">
            <p className="font-medium">Error loading comparison data</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : 'Failed to load comparative analysis'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Comparative Analysis - Current vs Previous {timeframe}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading comparison data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!comparisonData) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary" />
            Comparative Analysis - Current vs Previous {timeframe}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground p-6">
            <p>No data available for comparison</p>
            <p className="text-sm mt-1">Try adjusting your filters or date range</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                    isPositive ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3" /> : 
                     change < 0 ? <ArrowDownRight className="h-3 w-3" /> : null}
                    {change !== 0 && (isPositive ? '+' : '')}{change.toFixed(1)}%
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
                    <span className={`font-medium ${
                      isPositive ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      {metric.format(Math.abs(metric.current - metric.previous))}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Summary Insights - Real Data Based */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Period Comparison Summary</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Revenue growth of {calculateChange(comparisonData.currentPeriod.revenue, comparisonData.previousPeriod.revenue).toFixed(1)}% indicates {calculateChange(comparisonData.currentPeriod.revenue, comparisonData.previousPeriod.revenue) > 0 ? 'strong business performance' : 'need for improvement'}</p>
            <p>• Profit margin is {comparisonData.currentPeriod.revenue > 0 ? ((comparisonData.currentPeriod.profit / comparisonData.currentPeriod.revenue) * 100).toFixed(1) : '0'}% in current period</p>
            <p>• Transaction volume {calculateChange(comparisonData.currentPeriod.transactions, comparisonData.previousPeriod.transactions) > 0 ? 'increased' : calculateChange(comparisonData.currentPeriod.transactions, comparisonData.previousPeriod.transactions) < 0 ? 'decreased' : 'remained stable'} by {Math.abs(calculateChange(comparisonData.currentPeriod.transactions, comparisonData.previousPeriod.transactions)).toFixed(1)}%</p>
            <p>• Average order value {calculateChange(comparisonData.currentPeriod.avgOrderValue, comparisonData.previousPeriod.avgOrderValue) > 0 ? 'grew' : calculateChange(comparisonData.currentPeriod.avgOrderValue, comparisonData.previousPeriod.avgOrderValue) < 0 ? 'declined' : 'stayed the same'} by {Math.abs(calculateChange(comparisonData.currentPeriod.avgOrderValue, comparisonData.previousPeriod.avgOrderValue)).toFixed(1)}%</p>
          </div>
        </div>

        {/* Debug Info - Remove in production */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h5 className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">Data Source Info:</h5>
          <div className="text-xs text-blue-800 dark:text-blue-200 grid grid-cols-2 gap-2">
            <div>Current Period: {comparisonData.currentPeriod.transactions} transactions</div>
            <div>Previous Period: {comparisonData.previousPeriod.transactions} transactions</div>
            <div>Platform Filter: {platforms.length > 0 ? `${platforms.length} selected` : 'All platforms'}</div>
            <div>Timeframe: {timeframe}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};