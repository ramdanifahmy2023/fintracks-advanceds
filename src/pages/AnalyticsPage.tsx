import { useState } from 'react';
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

export const AnalyticsPage = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y' | 'custom'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'profit' | 'transactions' | 'margin'>('revenue');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  const handleChartDrillDown = (type: string, data: any) => {
    console.log('Chart drill-down:', type, data);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Analytics Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">Comprehensive analytics with charts, trends, and AI insights</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setExportModalOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
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

      {/* Export Modal */}
      <AnalyticsExportModal 
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        timeframe={selectedTimeframe}
        selectedData={{
          totalRevenue: 85000000,
          totalProfit: 25500000,
          profitMargin: 30.0,
          totalTransactions: 1250,
          growthRate: 8.9
        }}
      />
    </div>
  );
};