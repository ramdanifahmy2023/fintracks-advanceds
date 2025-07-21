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
    month_start: string;
    revenue: number;
    profit: number;
    total_orders: number;
    platform_name: string;
    avg_order_value: number;
    month: number;
    year: number;
    total_packages: number;
    unique_products_sold: number;
  }>;
  platformPerf: Array<{
    platform_name: string;
    total_revenue: number;
    total_profit: number;
    total_transactions: number;
    completion_rate_percentage: number;
    profit_margin_percentage: number;
    avg_transaction_value: number;
    total_packages: number;
    active_days: number;
    total_stores: number;
    completed_revenue: number;
    completed_profit: number;
    platform_id: string;
  }>;
  productPerf: Array<{
    product_name: string;
    category: string;
    sku_reference: string;
    completed_profit: number;
    completed_revenue: number;
    total_quantity_sold: number;
    avg_profit_per_sale: number;
    profit_margin_percentage: number;
    first_sale_date: string;
    last_sale_date: string;
    platforms_sold_on: number;
    total_sales: number;
    completed_quantity: number;
  }>;
}