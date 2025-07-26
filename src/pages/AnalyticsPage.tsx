
// =============================================
// UPDATED: src/pages/AnalyticsPage.tsx - Now with Indonesian Labels
// =============================================

import { useState, useMemo } from 'react';
import { startOfMonth, endOfMonth } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { AnalyticsControls } from '@/components/analytics/AnalyticsControls';
import { AnalyticsKPIGrid } from '@/components/analytics/AnalyticsKPIGrid';
import { RevenueAnalyticsChart } from '@/components/analytics/RevenueAnalyticsChart';
import { PlatformPerformanceChart } from '@/components/analytics/PlatformPerformanceChart';
import { ProductPerformanceAnalytics } from '@/components/analytics/ProductPerformanceAnalytics';
import { TrendAnalysisPanel } from '@/components/analytics/TrendAnalysisPanel';
import { ComparativeAnalysisSection } from '@/components/analytics/ComparativeAnalysisSection';
import { AnalyticsExportModal } from '@/components/analytics/AnalyticsExportModal';
import { useDashboardSummary } from '@/hooks/useDashboard';
import { FilterState } from '@/types/dashboard';

// REAL PROFIT ANALYTICS IMPORTS
import { useProfitAnalytics } from '@/hooks/useProfitAnalytics';
import { StoreProfitAnalysis } from '@/components/analytics/StoreProfitAnalysis';
import { ProfitKPICards } from '@/components/analytics/ProfitKPICards';
import { AnalyticsErrorBoundary } from '@/components/analytics/AnalyticsErrorBoundary';

export const AnalyticsPage = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y' | 'custom'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'profit' | 'transactions' | 'margin'>('revenue');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Create filters based on selected timeframe and platforms
  const filters = useMemo((): FilterState => {
    const now = new Date();
    let fromDate: Date;
    
    switch (selectedTimeframe) {
      case '7d':
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        fromDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
      default:
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }
    
    return {
      dateRange: {
        from: fromDate,
        to: now,
        preset: selectedTimeframe
      },
      platforms: selectedPlatforms,
      stores: []
    };
  }, [selectedTimeframe, selectedPlatforms]);

  // Fetch real data from database
  const { data: summaryData, isLoading: summaryLoading } = useDashboardSummary(filters);
  
  // REAL PROFIT ANALYTICS HOOK
  const { data: profitData, isLoading: profitLoading, error: profitError } = useProfitAnalytics(filters);

  // Calculate real analytics data
  const analyticsData = useMemo(() => {
    if (!summaryData) {
      return {
        totalRevenue: 0,
        totalProfit: 0,
        profitMargin: 0,
        totalTransactions: 0,
        growthRate: 0
      };
    }

    const totalRevenue = summaryData.total_revenue || 0;
    const totalProfit = summaryData.total_profit || 0;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const totalTransactions = summaryData.total_orders || 0;
    
    // For growth rate, we'll calculate based on completed vs total
    const completedRevenue = summaryData.completed_revenue || 0;
    const growthRate = totalRevenue > 0 ? ((completedRevenue / totalRevenue) * 100) - 100 : 0;

    return {
      totalRevenue,
      totalProfit,
      profitMargin: Number(profitMargin.toFixed(1)),
      totalTransactions,
      growthRate: Number(growthRate.toFixed(1))
    };
  }, [summaryData]);

  const handleChartDrillDown = (type: string, data: any) => {
    console.log('Chart drill-down:', type, data);
  };

  const handleRefreshData = () => {
    // Force refresh by updating a state that triggers re-render
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Analytics Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Analisis Lanjutan</h1>
          <p className="text-muted-foreground">
            Analisis komprehensif dengan grafik, tren, dan wawasan real-time
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setExportModalOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Ekspor Laporan
          </Button>
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Perbarui Data
          </Button>
        </div>
      </div>

      {/* Analytics Controls */}
      <Card>
        <CardContent className="p-4">
          <AnalyticsControls
            timeframe={selectedTimeframe}
            metric={selectedMetric}
            platforms={selectedPlatforms}
            onTimeframeChange={(value) => setSelectedTimeframe(value as any)}
            onMetricChange={(value) => setSelectedMetric(value as any)}
            onPlatformsChange={setSelectedPlatforms}
          />
        </CardContent>
      </Card>

      {/* Data Loading State */}
      {summaryLoading && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Memuat data analisis...</p>
          </CardContent>
        </Card>
      )}

      {/* REAL PROFIT KPI CARDS */}
      <AnalyticsErrorBoundary error={profitError}>
        <ProfitKPICards 
          data={profitData?.storeSummaryProfit || []} 
          loading={profitLoading} 
        />
      </AnalyticsErrorBoundary>

      {/* Key Performance Indicators */}
      <AnalyticsKPIGrid timeframe={selectedTimeframe} platforms={selectedPlatforms} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueAnalyticsChart 
          timeframe={selectedTimeframe} 
          metric={selectedMetric}
          platforms={selectedPlatforms}
          onChartClick={(data) => handleChartDrillDown('revenue', data)}
        />
        <PlatformPerformanceChart 
          timeframe={selectedTimeframe}
          platforms={selectedPlatforms}
          onChartClick={(data) => handleChartDrillDown('platform', data)}
        />
      </div>

      {/* REAL PROFIT ANALYSIS SECTION */}
      <AnalyticsErrorBoundary error={profitError}>
        <StoreProfitAnalysis 
          data={profitData?.storeSummaryProfit || []} 
          loading={profitLoading} 
        />
      </AnalyticsErrorBoundary>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ProductPerformanceAnalytics timeframe={selectedTimeframe} />
        </div>
        <div>
          <TrendAnalysisPanel timeframe={selectedTimeframe} />
        </div>
      </div>

      {/* Comparative Analysis */}
      <ComparativeAnalysisSection timeframe={selectedTimeframe} platforms={selectedPlatforms} />

      {/* Export Modal with Real Data */}
      <AnalyticsExportModal 
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        timeframe={selectedTimeframe}
        selectedData={analyticsData}
      />

      {/* Data Summary for Debug */}
      {!summaryLoading && summaryData && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Ringkasan Data Real-time (Terakhir {selectedTimeframe})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Omset:</span>
                <p className="font-medium">
                  {new Intl.NumberFormat('id-ID', { 
                    style: 'currency', 
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format(analyticsData.totalRevenue)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Profit:</span>
                <p className="font-medium">
                  {new Intl.NumberFormat('id-ID', { 
                    style: 'currency', 
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format(analyticsData.totalProfit)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Margin:</span>
                <p className="font-medium">{analyticsData.profitMargin}%</p>
              </div>
              <div>
                <span className="text-muted-foreground">Order:</span>
                <p className="font-medium">{analyticsData.totalTransactions}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Penyelesaian:</span>
                <p className="font-medium">{Math.abs(analyticsData.growthRate)}%</p>
              </div>
            </div>
            
            {/* REAL PROFIT DATA SECTION */}
            {profitData && profitData.storeSummaryProfit.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-sm font-medium text-green-800 mb-2">
                  ✅ Analisis Profit Real Aktif
                </h4>
                <p className="text-sm text-green-700">
                  Menampilkan {profitData.storeSummaryProfit.length} toko dengan perhitungan profit real-time: 
                  Profit Bersih = (Harga Jual - Harga Beli - Biaya Iklan) untuk order selesai saja
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
