
import { useMemo } from 'react';
import { SummaryCard, SummaryCardSkeleton } from './SummaryCard';
import { DashboardSummary, SummaryCardData } from '@/types/dashboard';
import { ProfitAnalyticsData } from '@/types/analytics';
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
  profitData: ProfitAnalyticsData | undefined;
  loading?: boolean;
  profitLoading?: boolean;
}

export const SummaryCards = ({ data, profitData, loading, profitLoading }: SummaryCardsProps) => {
  const summaryCards: SummaryCardData[] = useMemo(() => {
    if (loading || !data) {
      return Array(8).fill(null).map((_, index) => ({
        title: 'Loading...',
        value: '...',
        icon: DollarSign,
        color: 'blue' as const,
        loading: true
      }));
    }

    // Safe number conversion with fallbacks
    const safeNumber = (value: any, fallback: number = 0): number => {
      const num = Number(value);
      return isNaN(num) ? fallback : num;
    };

    const totalOrders = safeNumber(data.total_orders);
    const completedOrders = safeNumber(data.completed_orders);
    const completedRevenue = safeNumber(data.completed_revenue);
    const totalPackages = safeNumber(data.total_packages);
    const shippingOrders = safeNumber(data.shipping_orders);
    const cancelledOrders = safeNumber(data.cancelled_orders);
    const returnedOrders = safeNumber(data.returned_orders);

    // Calculate net profit with ad expenses from profitData
    let netProfit = safeNumber(data.completed_profit);
    let totalAdCost = 0;
    
    if (profitData && profitData.storeSummaryProfit && !profitLoading) {
      totalAdCost = profitData.storeSummaryProfit.reduce((sum, store) => 
        sum + safeNumber(store.total_ad_cost), 0
      );
      netProfit = profitData.storeSummaryProfit.reduce((sum, store) => 
        sum + safeNumber(store.net_profit), 0
      );
    }

    // Calculate completion rate
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    
    // Calculate average order value
    const avgOrderValue = completedOrders > 0 ? completedRevenue / completedOrders : 0;

    // Safe change calculation
    const getChangeValue = (key: keyof NonNullable<DashboardSummary['changes']>, fallback: number = 0): number => {
      if (!data.changes || !data.changes[key]) return fallback;
      const value = Number(data.changes[key]);
      return isNaN(value) ? fallback : value;
    };

    return [
      {
        title: 'Total Omset',
        value: formatCurrency(completedRevenue),
        subtitle: 'Penjualan selesai',
        change: {
          value: getChangeValue('completed_revenue'),
          type: getChangeValue('completed_revenue') >= 0 ? 'increase' : 'decrease',
          period: 'vs periode lalu'
        },
        icon: DollarSign,
        color: 'green' as const
      },
      {
        title: 'Total Paket',
        value: `${formatNumber(totalPackages)} paket`,
        subtitle: 'Kuantitas terjual',
        change: {
          value: getChangeValue('total_packages'),
          type: getChangeValue('total_packages') >= 0 ? 'increase' : 'decrease',
          period: 'vs periode lalu'
        },
        icon: Package,
        color: 'blue' as const
      },
      {
        title: 'Profit Bersih',
        value: formatCurrency(netProfit),
        subtitle: totalAdCost > 0 ? `Setelah potong iklan ${formatCurrency(totalAdCost)}` : 'Setelah potong biaya',
        change: {
          value: getChangeValue('completed_profit'),
          type: netProfit >= 0 ? 'increase' : 'decrease',
          period: 'net profit'
        },
        icon: TrendingUp,
        color: netProfit >= 0 ? 'purple' : 'red' as const
      },
      {
        title: 'Tingkat Selesai',
        value: formatPercentage(completionRate),
        subtitle: 'Pesanan berhasil',
        change: {
          value: getChangeValue('completion_rate'),
          type: getChangeValue('completion_rate') >= 0 ? 'increase' : 'decrease',
          period: 'completion rate'
        },
        icon: CheckCircle,
        color: 'indigo' as const
      },
      {
        title: 'Sedang Dikirim',
        value: `${formatNumber(shippingOrders)} pesanan`,
        subtitle: 'Dalam proses pengiriman',
        icon: Truck,
        color: 'orange' as const
      },
      {
        title: 'Pesanan Batal',
        value: `${formatNumber(cancelledOrders)} pesanan`,
        subtitle: 'Dibatalkan customer/sistem',
        icon: XCircle,
        color: 'red' as const
      },
      {
        title: 'Return/Refund',
        value: `${formatNumber(returnedOrders)} pesanan`,
        subtitle: 'Dikembalikan customer',
        icon: RotateCcw,
        color: 'red' as const
      },
      {
        title: 'Rata-rata Order',
        value: formatCurrency(avgOrderValue),
        subtitle: 'Per transaksi',
        change: {
          value: getChangeValue('avg_order_value'),
          type: getChangeValue('avg_order_value') >= 0 ? 'increase' : 'decrease',
          period: 'average value'
        },
        icon: Calculator,
        color: 'blue' as const
      }
    ];
  }, [data, profitData, loading, profitLoading]);

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
        <SummaryCard key={`${card.title}-${index}`} {...card} />
      ))}
    </div>
  );
};
