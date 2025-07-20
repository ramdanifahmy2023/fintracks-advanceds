import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { FinancialSummary } from '@/hooks/useFinancialDashboard';

interface FinancialSummaryCardsProps {
  data: FinancialSummary | undefined;
  loading: boolean;
}

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  data,
  loading,
}) => {
  if (loading) {
    return (
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Pemasukan',
      value: data?.totalIncome || 0,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
      description: 'Pendapatan periode ini'
    },
    {
      title: 'Total Pengeluaran',
      value: data?.totalExpense || 0,
      icon: TrendingDown,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      description: 'Pengeluaran periode ini'
    },
    {
      title: 'Laba Bersih',
      value: data?.netProfit || 0,
      icon: DollarSign,
      color: (data?.netProfit || 0) >= 0 ? 'text-success' : 'text-destructive',
      bgColor: (data?.netProfit || 0) >= 0 ? 'bg-success/10' : 'bg-destructive/10',
      description: 'Profit/Loss periode ini'
    },
    {
      title: 'Total Transaksi',
      value: data?.transactionCount || 0,
      icon: BarChart3,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      description: 'Jumlah transaksi',
      isCount: true
    }
  ];

  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color} mb-1`}>
                {card.isCount ? 
                  card.value.toLocaleString('id-ID') : 
                  formatCurrency(card.value)
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
            
            {/* Gradient background effect */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-full transform translate-x-8 -translate-y-8" />
          </Card>
        );
      })}
    </div>
  );
};