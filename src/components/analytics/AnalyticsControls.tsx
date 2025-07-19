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
  const { data: availablePlatforms } = useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const { data } = await supabase.from('platforms').select('*').eq('is_active', true);
      return data || [];
    }
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
        <Label>Time Period</Label>
        <Select value={timeframe} onValueChange={onTimeframeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="1y">Last 1 Year</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Primary Metric Selection */}
      <div className="space-y-2">
        <Label>Primary Metric</Label>
        <Select value={metric} onValueChange={onMetricChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="revenue">Revenue</SelectItem>
            <SelectItem value="profit">Profit</SelectItem>
            <SelectItem value="transactions">Transactions</SelectItem>
            <SelectItem value="margin">Profit Margin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Platform Filter */}
      <div className="space-y-2">
        <Label>Platforms</Label>
        <Select 
          value={platforms.length > 0 ? platforms[0] : "all"}
          onValueChange={(value) => onPlatformsChange(value === "all" ? [] : [value])}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            {availablePlatforms?.map((platform) => (
              <SelectItem key={platform.id} value={platform.id}>
                {platform.platform_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <Label>Quick Actions</Label>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={handleCompareWithPrevious}>
            <TrendingUp className="h-4 w-4 mr-1" />
            Compare
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