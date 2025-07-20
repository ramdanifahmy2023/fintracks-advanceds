import { LucideIcon } from 'lucide-react';

// State untuk filter global
export interface FilterState {
  dateRange: {
    from: Date;
    to: Date;
    preset: string;
  };
  platforms: string[];
  stores: string[];
}

// Data untuk kartu ringkasan di dashboard
export interface SummaryCardData {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: LucideIcon;
  color: string;
  loading?: boolean;
}

// Data ringkasan dari Supabase
export interface DashboardSummary {
  total_revenue: number;
  total_profit: number;
  total_orders: number;
  avg_order_value: number;
  last_total_revenue: number;
  last_total_profit: number;
  last_total_orders: number;
  last_avg_order_value: number;
}

// Data untuk chart
export interface ChartData {
  revenueTrend: Array<{
    date: string;
    revenue: number;
    profit: number;
  }>;
  platformPerf: Array<{
    platform_name: string;
    total_revenue: number;
  }>;
  categoryPerf: Array<{
    category: string;
    total_revenue: number;
  }>;
}

// Tipe data untuk produk
export interface Product {
    id: string;
    created_at: string;
    product_name: string;
    sku_reference: string;
    base_cost: number | null;
    category: string | null;
    is_active: boolean;
}

// Tipe data untuk toko
export interface Store {
    id: string;
    created_at: string;
    store_name: string;
    platform_id: string;
    pic_name: string | null;
    is_active: boolean;
}
