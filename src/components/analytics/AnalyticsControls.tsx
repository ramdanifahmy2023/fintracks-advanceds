
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TrendingUp, RotateCcw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsControlsProps {
  timeframe: string;
  metric: string;
  platforms: string[];
  onTimeframeChange: (value: string) => void;
  onMetricChange: (value: string) => void;
  onPlatformsChange: (value: string[]) => void;
}

export const AnalyticsControls = ({
  timeframe,
  metric,
  platforms,
  onTimeframeChange,
  onMetricChange,
  onPlatformsChange
}: AnalyticsControlsProps) => {
  const { data: availablePlatforms, error: platformsError } = useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      console.log('🔍 Fetching platforms for analytics controls...');
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .eq('is_active', true)
        .order('platform_name');
      
      if (error) {
        console.error('❌ Error fetching platforms:', error);
        throw error;
      }
      
      console.log('✅ Platforms fetched:', data?.length || 0);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const handleCompareWithPrevious = () => {
    console.log('Compare with previous period');
  };

  const handleResetFilters = () => {
    onTimeframeChange('30d');
    onMetricChange('revenue');
    onPlatformsChange([]);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Timeframe Selection */}
      <div className="space-y-2">
        <Label>Periode Waktu</Label>
        <Select value={timeframe} onValueChange={onTimeframeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 Hari Terakhir</SelectItem>
            <SelectItem value="30d">30 Hari Terakhir</SelectItem>
            <SelectItem value="90d">90 Hari Terakhir</SelectItem>
            <SelectItem value="1y">1 Tahun Terakhir</SelectItem>
            <SelectItem value="custom">Rentang Khusus</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Primary Metric Selection */}
      <div className="space-y-2">
        <Label>Metrik Utama</Label>
        <Select value={metric} onValueChange={onMetricChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">Omset</SelectItem>
            <SelectItem value="profit">Profit</SelectItem>
            <SelectItem value="transactions">Transaksi</SelectItem>
            <SelectItem value="margin">Margin Profit</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Platform Filter */}
      <div className="space-y-2">
        <Label>Platform</Label>
        <Select 
          value={platforms.length > 0 ? platforms[0] : "all"}
          onValueChange={(value) => onPlatformsChange(value === "all" ? [] : [value])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semua Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Platform</SelectItem>
            {platformsError ? (
              <SelectItem value="error" disabled>
                Kesalahan memuat platform
              </SelectItem>
            ) : availablePlatforms ? (
              availablePlatforms.map((platform) => (
                <SelectItem key={platform.id} value={platform.id}>
                  {platform.platform_name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="loading" disabled>
                Memuat platform...
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Label>Aksi Cepat</Label>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={handleCompareWithPrevious}>
            <TrendingUp className="h-4 w-4 mr-1" />
            Bandingkan
          </Button>
          <Button size="sm" variant="outline" onClick={handleResetFilters}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};
