
import { useMemo } from 'react';
import { SummaryCard, SummaryCardSkeleton } from './SummaryCard';
import { DashboardSummary, SummaryCardData } from '@/types/dashboard';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/formatters';
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  CheckCircle, 
  Truck, 
  XCircle, 
  RotateCcw, 
  Calculator 
} from 'lucide-react';

interface SummaryCardsProps {
  data: DashboardSummary | undefined;
  loading?: boolean;
}

export const SummaryCards = ({ data, loading }: SummaryCardsProps) => {
  const summaryCards: SummaryCardData[] = useMemo(() => {
    if (!data) {
      return Array(8).fill(null).map((_, index) => ({
        title: '',
        value: '',
        icon: DollarSign,
        color: 'blue' as const,
        loading: true
      }));
    }

    const completionRate = data.total_orders > 0 
      ? (Number(data.completed_orders) / Number(data.total_orders)) * 100 
      : 0;
    
    const avgOrderValue = Number(data.completed_orders) > 0 
      ? Number(data.completed_revenue) / Number(data.completed_orders) 
      : 0;

    return [
      {
        title: 'Total Omset',
        value: formatCurrency(Number(data.completed_revenue) || 0),
        subtitle: 'Penjualan selesai',
        change: {
          value: 15.2, // This would come from period comparison
          type: 'increase' as const,
          period: 'vs bulan lalu'
        },
        icon: DollarSign,
        color: 'green' as const
      },
      {
        title: 'Total Paket',
        value: `${formatNumber(Number(data.total_packages) || 0)} paket`,
        subtitle: 'Kuantitas terjual',
        change: {
          value: 8.7,
          type: 'increase' as const,
          period: 'vs periode lalu'
        },
        icon: Package,
        color: 'blue' as const
      },
      {
        title: 'Profit Bersih',
        value: formatCurrency(Number(data.completed_profit) || 0),
        subtitle: 'Setelah potong biaya',
        change: {
          value: -2.1,
          type: 'decrease' as const,
          period: 'vs bulan lalu'
        },
        icon: TrendingUp,
        color: 'purple' as const
      },
      {
        title: 'Tingkat Selesai',
        value: formatPercentage(completionRate),
        subtitle: 'Pesanan berhasil',
        change: {
          value: 1.5,
          type: 'increase' as const,
          period: 'completion rate'
        },
        icon: CheckCircle,
        color: 'indigo' as const
      },
      {
        title: 'Sedang Dikirim',
        value: `${formatNumber(Number(data.shipping_orders) || 0)} pesanan`,
        subtitle: 'Dalam proses pengiriman',
        icon: Truck,
        color: 'orange' as const
      },
      {
        title: 'Pesanan Batal',
        value: `${formatNumber(Number(data.cancelled_orders) || 0)} pesanan`,
        subtitle: 'Dibatalkan customer/sistem',
        icon: XCircle,
        color: 'red' as const
      },
      {
        title: 'Return/Refund',
        value: `${formatNumber(Number(data.returned_orders) || 0)} pesanan`,
        subtitle: 'Dikembalikan customer',
        icon: RotateCcw,
        color: 'red' as const
      },
      {
        title: 'Rata-rata Order',
        value: formatCurrency(avgOrderValue),
        subtitle: 'Per transaksi',
        change: {
          value: 12.3,
          type: 'increase' as const,
          period: 'average value'
        },
        icon: Calculator,
        color: 'blue' as const
      }
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array(8).fill(null).map((_, index) => (
          <SummaryCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryCards.map((card, index) => (
        <SummaryCard key={index} {...card} />
      ))}
    </div>
  );
};
