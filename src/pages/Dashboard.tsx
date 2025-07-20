import { useDashboard } from '@/hooks/useDashboard';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { RevenueTrendChart } from '@/components/dashboard/charts/RevenueTrendChart';
import { PlatformChart } from '@/components/dashboard/charts/PlatformChart';
import { CategoryChart } from '@/components/dashboard/charts/CategoryChart';
import { GlobalFilters } from '@/components/dashboard/GlobalFilters';
import { BusinessInsightsPanel } from '@/components/insights/BusinessInsightsPanel';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

const Dashboard = () => {
  const { summary, revenueTrend, platformPerformance, categoryPerformance, isLoading, isError } = useDashboard();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Gagal memuat data dashboard. Silakan coba lagi nanti.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <GlobalFilters />
      <SummaryCards data={summary.data} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueTrendChart data={revenueTrend.data} />
        </div>
        <div>
          <PlatformChart data={platformPerformance.data} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CategoryChart data={categoryPerformance.data} />
        </div>
        <div>
          <BusinessInsightsPanel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
