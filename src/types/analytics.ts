
export interface StoreProfitAnalysis {
  store_id: string;
  store_name: string;
  platform_id: string;
  platform_name: string;
  total_revenue: number;
  total_cost: number;
  gross_profit: number;
  ad_cost: number;
  net_profit: number;
  completed_orders: number;
  profit_margin_percent: number;
  order_date: string;
}

export interface StoreSummaryProfit {
  store_id: string;
  store_name: string;
  total_revenue: number;
  total_cost: number;
  gross_profit: number;
  total_ad_cost: number;
  net_profit: number;
  total_completed_orders: number;
  overall_profit_margin: number;
}

export interface MonthlyProfitTrend {
  store_id: string;
  store_name: string;
  month: string;
  monthly_revenue: number;
  monthly_gross_profit: number;
  monthly_ad_cost: number;
  monthly_net_profit: number;
  monthly_orders: number;
}

export interface ProfitAnalyticsData {
  storeProfitAnalysis: StoreProfitAnalysis[];
  storeSummaryProfit: StoreSummaryProfit[];
  monthlyTrend: MonthlyProfitTrend[];
  topPerformingStores: StoreSummaryProfit[];
  profitGrowthRate: number;
}
