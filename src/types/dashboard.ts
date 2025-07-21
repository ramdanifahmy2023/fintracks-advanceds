export interface FilterState {
  dateRange: {
    from: Date;
    to: Date;
    preset?: string;
  };
  platforms: string[];
  stores: string[];
}

export interface SummaryCardData {
  title: string;
  value: string;
  subtitle?: string;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period: string;
  };
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'indigo';
  loading?: boolean;
}

export interface DashboardSummary {
  total_orders: number;
  total_packages: number;
  total_revenue: number;
  total_profit: number;
  completed_orders: number;
  completed_revenue: number;
  completed_profit: number;
  shipping_orders: number;
  shipping_revenue: number;
  cancelled_orders: number;
  cancelled_revenue: number;
  returned_orders: number;
  returned_revenue: number;
  changes?: {
    completed_revenue: number;
    total_packages: number;
    completed_profit: number;
    completion_rate: number;
    avg_order_value: number;
  };
}

export interface ChartData {
  revenueTrend: Array<{
    date: string;
    revenue: number;
    profit: number;
    transactions: number;
    margin: number;
  }>;
  platformPerf: Array<{
    platform_name: string;
    revenue: number;
    profit: number;
    margin: number;
    transactions: number;
  }>;
  productPerf: Array<{
    sku_reference: string;
    product_name: string;
    total_revenue: number;
    total_profit: number;
    total_units: number;
    margin: number;
  }>;
}