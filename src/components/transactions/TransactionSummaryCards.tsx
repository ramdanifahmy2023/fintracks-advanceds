
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw, Truck, Clock } from 'lucide-react';
import { formatNumber } from '@/lib/formatters';
import { TransactionFilters, useTransactionSummary } from '@/hooks/useTransactions';

interface TransactionSummaryCardsProps {
  filters: TransactionFilters;
}

export const TransactionSummaryCards: React.FC<TransactionSummaryCardsProps> = ({
  filters
}) => {
  const { data: summary, isLoading } = useTransactionSummary(filters);

  const cards = [
    {
      title: 'Total Transaksi',
      value: summary?.total_transactions || 0,
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pesanan Selesai',
      value: summary?.completed_orders || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Sedang Dikirim',
      value: summary?.shipping_orders || 0,
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Pesanan Batal',
      value: summary?.cancelled_orders || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: 'Return/Refund',
      value: summary?.returned_orders || 0,
      icon: RotateCcw,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Menunggu Konfirmasi',
      value: summary?.pending_orders || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {isLoading ? '-' : formatNumber(card.value)}
                </span>
                <Badge variant="secondary" className="ml-2">
                  {isLoading ? '-%' : summary?.total_transactions ? ((card.value / summary.total_transactions) * 100).toFixed(1) : '0'}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
