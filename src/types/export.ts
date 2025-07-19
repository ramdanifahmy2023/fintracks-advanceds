export interface ExportFormat {
  id: 'pdf' | 'excel' | 'csv' | 'whatsapp';
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  options?: ExportOptions;
}

export interface ExportOptions {
  includeCharts?: boolean;
  includeSummary?: boolean;
  pageOrientation?: 'portrait' | 'landscape';
  reportTemplate?: 'executive' | 'detailed' | 'summary';
  includeFormulas?: boolean;
  multipleSheets?: boolean;
  formatCurrency?: boolean;
  delimiter?: string;
  includeHeaders?: boolean;
  encoding?: string;
  includeEmoji?: boolean;
  compactFormat?: boolean;
  keyMetricsOnly?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  groupBy?: 'platform' | 'product' | 'date';
  sortBy?: 'revenue' | 'profit' | 'quantity';
  customFields?: string[];
}

export interface ExportResult {
  success: boolean;
  fileName?: string;
  error?: string;
  downloadUrl?: string;
}

export interface ExportData {
  summary: {
    totalRevenue: number;
    totalProfit: number;
    totalTransactions: number;
    avgOrderValue: number;
    topPlatform: string;
    topProduct: string;
    profitMargin: number;
  };
  dateRange: {
    from: Date;
    to: Date;
  };
  platformPerformance: Array<{
    name: string;
    revenue: number;
    profit: number;
    profitMargin: number;
    transactions: number;
    completionRate: number;
  }>;
  topProducts: Array<{
    name: string;
    sku: string;
    quantitySold: number;
    revenue: number;
    profit: number;
    profitMargin: number;
  }>;
  transactions: Array<{
    orderDate: string;
    platform: string;
    store: string;
    orderNumber: string;
    productName: string;
    quantity: number;
    costPrice: number;
    sellingPrice: number;
    profit: number;
    status: string;
  }>;
  growth?: {
    revenue: number;
    transactions: number;
    profit: number;
  };
  monthlyTrend?: Array<{
    month: string;
    revenue: number;
    profit: number;
    transactions: number;
  }>;
}

export interface BusinessInsight {
  type: 'revenue_growth' | 'platform_performance' | 'product_concentration' | 'seasonality' | 'profit_margin';
  title: string;
  description: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  value: number;
  actionable: boolean;
  recommendations: string[];
  priority?: 'high' | 'medium' | 'low';
}

export interface MemoryInfo {
  used: number;
  total: number;
  limit: number;
}