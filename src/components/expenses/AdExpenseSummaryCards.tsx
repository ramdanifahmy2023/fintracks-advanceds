
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Target, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useAdExpenseSummary } from '@/hooks/useAdExpenses';

interface AdExpenseSummaryCardsProps {
  dateFrom?: string;
  dateTo?: string;
}

export const AdExpenseSummaryCards: React.FC<AdExpenseSummaryCardsProps> = ({
  dateFrom,
  dateTo
}) => {
  const { data: summary, isLoading } = useAdExpenseSummary(dateFrom, dateTo);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
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

  const topPlatform = summary?.platformBreakdown ? 
    Object.entries(summary.platformBreakdown).sort(([,a], [,b]) => b - a)[0] : null;

  const cards = [
    {
      title: 'Total Ad Spend',
      value: formatCurrency(summary?.totalAmount || 0),
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Transactions',
      value: summary?.totalTransactions?.toString() || '0',
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Average Spend',
      value: formatCurrency(summary?.averageAmount || 0),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Top Platform',
      value: topPlatform ? topPlatform[0] : 'N/A',
      subtitle: topPlatform ? formatCurrency(topPlatform[1]) : '',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
              {card.subtitle && (
                <p className="text-xs text-muted-foreground">
                  {card.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
