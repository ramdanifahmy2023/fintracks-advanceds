
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Target, ShoppingBag } from 'lucide-react';
import { StoreSummaryProfit } from '@/types/analytics';
import { formatCurrency } from '@/lib/formatters';

interface ProfitKPICardsProps {
  data: StoreSummaryProfit[];
  loading?: boolean;
}

export const ProfitKPICards: React.FC<ProfitKPICardsProps> = ({
  data,
  loading
}) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalRevenue = data.reduce((sum, store) => sum + store.total_revenue, 0);
  const totalNetProfit = data.reduce((sum, store) => sum + store.net_profit, 0);
  const totalAdCost = data.reduce((sum, store) => sum + store.total_ad_cost, 0);
  const avgProfitMargin = data.length > 0 
    ? data.reduce((sum, store) => sum + store.overall_profit_margin, 0) / data.length 
    : 0;

  const kpis = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Net Profit',
      value: formatCurrency(totalNetProfit),
      icon: TrendingUp,
      color: totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: totalNetProfit >= 0 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Total Biaya Iklan',
      value: formatCurrency(totalAdCost),
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Rata-rata Margin',
      value: `${avgProfitMargin.toFixed(1)}%`,
      icon: ShoppingBag,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${kpi.bgColor}`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${kpi.color}`}>
                {kpi.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
