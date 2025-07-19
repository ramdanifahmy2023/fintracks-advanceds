
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, BarChart3, Crown, Activity, Star, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useAnalyticsKPI } from '@/hooks/useAnalytics';
import { formatCurrency } from '@/lib/formatters';

interface KPIGridProps {
  timeframe: string;
  platforms: string[];
}

export const AnalyticsKPIGrid = ({ timeframe, platforms }: KPIGridProps) => {
  const { data: kpiData, isLoading, error } = useAnalyticsKPI(timeframe, platforms);
  
  const kpiMetrics = [
    {
      title: "Total Revenue",
      value: formatCurrency(kpiData?.totalRevenue || 0),
      change: kpiData?.revenueChange || 0,
      trend: kpiData?.revenueTrend || 'neutral',
      icon: DollarSign,
      color: "green",
      subtitle: `${kpiData?.totalTransactions || 0} transactions`
    },
    {
      title: "Gross Profit", 
      value: formatCurrency(kpiData?.totalProfit || 0),
      change: kpiData?.profitChange || 0,
      trend: kpiData?.profitTrend || 'neutral',
      icon: TrendingUp,
      color: "blue",
      subtitle: `${((kpiData?.totalProfit || 0) / (kpiData?.totalRevenue || 1) * 100).toFixed(1)}% margin`
    },
    {
      title: "Average Order Value",
      value: formatCurrency(kpiData?.avgOrderValue || 0),
      change: kpiData?.aovChange || 0,
      trend: kpiData?.aovTrend || 'neutral',
      icon: BarChart3,
      color: "purple",
      subtitle: "Per transaction"
    },
    {
      title: "Top Platform",
      value: kpiData?.topPlatform || 'N/A',
      change: kpiData?.topPlatformChange || 0,
      trend: kpiData?.topPlatformTrend || 'neutral',
      icon: Crown,
      color: "orange",
      subtitle: formatCurrency(kpiData?.topProduct?.revenue || 0)
    },
    {
      title: "Growth Rate",
      value: `${(kpiData?.growthRate || 0).toFixed(1)}%`,
      change: kpiData?.growthRateChange || 0,
      trend: kpiData?.growthRateTrend || 'neutral',
      icon: Activity,
      color: "indigo",
      subtitle: "Month over month"
    },
    {
      title: "Best Product",
      value: kpiData?.topProduct?.name ? (kpiData.topProduct.name.length > 20 ? kpiData.topProduct.name.substring(0, 20) + '...' : kpiData.topProduct.name) : 'N/A',
      change: kpiData?.topProductChange || 0,
      trend: kpiData?.topProductTrend || 'neutral',
      icon: Star,
      color: "yellow",
      subtitle: `${kpiData?.topProduct?.units || 0} units sold`
    }
  ];

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="col-span-full">
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p className="font-medium">Error loading KPI data</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof Error ? error.message : 'Failed to load analytics data'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kpiMetrics.map((metric, index) => (
        <Card key={`kpi-${index}`} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg bg-${metric.color}-100`}>
                  <metric.icon className={`h-5 w-5 text-${metric.color}-600`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`flex items-center text-sm ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                }`}>
                  {metric.trend === 'up' && <ArrowUpRight className="h-4 w-4 mr-1" />}
                  {metric.trend === 'down' && <ArrowDownRight className="h-4 w-4 mr-1" />}
                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{metric.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
