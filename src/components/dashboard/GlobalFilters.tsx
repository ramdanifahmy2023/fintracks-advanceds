import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, ChevronDown, X, Search, AlertTriangle, Filter } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { FilterState } from '@/types/dashboard';
import { usePlatforms, useStores } from '@/hooks/useDashboard';

interface GlobalFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  loading?: boolean;
}

const datePresets = [
  { label: 'Hari Ini', value: 'today' as const },
  { label: 'Kemarin', value: 'yesterday' as const },
  { label: 'Minggu Ini', value: 'thisWeek' as const },
  { label: 'Bulan Ini', value: 'thisMonth' as const },
  { label: 'Bulan Lalu', value: 'lastMonth' as const },
];

export const GlobalFilters = ({ filters, onFiltersChange, loading }: GlobalFiltersProps) => {
  const [platformSearch, setPlatformSearch] = useState('');
  const [storeSearch, setStoreSearch] = useState('');
  
  const { data: platforms = [], isLoading: platformsLoading, error: platformsError } = usePlatforms();
  const { data: stores = [], isLoading: storesLoading, error: storesError } = useStores(filters.platforms);

  const getDateRange = (preset: FilterState['dateRange']['preset']) => {
    const today = new Date();
    
    switch (preset) {
      case 'today':
        return { from: startOfDay(today), to: endOfDay(today) };
      case 'yesterday':
        const yesterday = subDays(today, 1);
        return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
      case 'thisWeek':
        return { from: startOfWeek(today, { weekStartsOn: 1 }), to: endOfWeek(today, { weekStartsOn: 1 }) };
      case 'thisMonth':
        return { from: startOfMonth(today), to: endOfMonth(today) };
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
      default:
        return { from: filters.dateRange.from, to: filters.dateRange.to };
    }
  };

  const handlePresetChange = (preset: FilterState['dateRange']['preset']) => {
    const range = getDateRange(preset);
    onFiltersChange({
      ...filters,
      dateRange: { ...range, preset }
    });
  };

  const handleDateSelect = (date: Date | undefined, type: 'from' | 'to') => {
    if (!date) return;
    
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: date,
        preset: 'custom' as const
      }
    });
  };

  const handlePlatformToggle = (platformId: string) => {
    const newPlatforms = filters.platforms.includes(platformId)
      ? filters.platforms.filter(id => id !== platformId)
      : [...filters.platforms, platformId];
    
    onFiltersChange({
      ...filters,
      platforms: newPlatforms,
      stores: [] // Clear stores when platforms change
    });
  };

  const handleStoreToggle = (storeId: string) => {
    const newStores = filters.stores.includes(storeId)
      ? filters.stores.filter(id => id !== storeId)
      : [...filters.stores, storeId];
    
    onFiltersChange({
      ...filters,
      stores: newStores
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      dateRange: {
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
        preset: 'thisMonth' as const
      },
      platforms: [],
      stores: []
    });
  };

  const filteredPlatforms = platforms.filter(platform =>
    platform.platform_name.toLowerCase().includes(platformSearch.toLowerCase())
  );

  const filteredStores = stores.filter(store =>
    store.store_name.toLowerCase().includes(storeSearch.toLowerCase())
  );

  // Show error state if there are errors
  if (platformsError || storesError) {
    return (
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="mx-4 my-2">
          <Alert variant="destructive" className="border-destructive/50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Error loading filter data. 
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 h-auto ml-1 text-destructive underline"
                onClick={() => window.location.reload()}
              >
                Refresh page
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <Card className="mx-4 my-2 border-0 shadow-sm bg-card/95 backdrop-blur-sm">
        <CardContent className="p-4">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <div className="text-sm font-medium">Filter Data</div>
              <div className="text-xs text-muted-foreground">
                {format(filters.dateRange.from, 'dd MMM', { locale: id })} - {format(filters.dateRange.to, 'dd MMM yyyy', { locale: id })}
                {filters.platforms.length > 0 && ` • ${filters.platforms.length} platform`}
                {filters.stores.length > 0 && ` • ${filters.stores.length} toko`}
              </div>
            </div>
            
            {/* Clear All - Show only when filters are active */}
            {(filters.platforms.length > 0 || filters.stores.length > 0 || filters.dateRange.preset !== 'thisMonth') && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7 px-2 text-xs">
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Date Range Filter - Compact */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Periode</Label>
              
              {/* Compact Preset Buttons */}
              <div className="flex flex-wrap gap-1">
                {datePresets.map(preset => (
                  <Button
                    key={preset.value}
                    variant={filters.dateRange.preset === preset.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePresetChange(preset.value)}
                    className="h-7 px-2 text-xs"
                  >
                    {preset.label}
                  </Button>
                ))}
                
                {/* Custom Date Trigger */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={filters.dateRange.preset === 'custom' ? "default" : "outline"}
                      size="sm"
                      className="h-7 px-2 text-xs"
                    >
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      Custom
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex">
                      <div className="p-3 border-r">
                        <div className="text-xs font-medium mb-2">Dari Tanggal</div>
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.from}
                          onSelect={(date) => handleDateSelect(date, 'from')}
                          disabled={(date) => date > filters.dateRange.to}
                          initialFocus
                        />
                      </div>
                      <div className="p-3">
                        <div className="text-xs font-medium mb-2">Sampai Tanggal</div>
                        <Calendar
                          mode="single"
                          selected={filters.dateRange.to}
                          onSelect={(date) => handleDateSelect(date, 'to')}
                          disabled={(date) => date < filters.dateRange.from}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Platform Filter - Compact */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Platform</Label>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between h-8 text-xs"
                    disabled={platformsLoading}
                  >
                    {platformsLoading ? (
                      "Loading..."
                    ) : filters.platforms.length === 0 ? (
                      "Select Platform"
                    ) : (
                      `${filters.platforms.length} selected`
                    )}
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72" align="start">
                  <div className="space-y-3">
                    <Input
                      placeholder="Search platforms..."
                      value={platformSearch}
                      onChange={(e) => setPlatformSearch(e.target.value)}
                      className="h-8 text-xs"
                    />
                    
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onFiltersChange({ ...filters, platforms: platforms.map(p => p.id) })}
                        disabled={platforms.length === 0}
                        className="h-7 px-2 text-xs"
                      >
                        All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onFiltersChange({ ...filters, platforms: [], stores: [] })}
                        className="h-7 px-2 text-xs"
                      >
                        None
                      </Button>
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {platforms.length === 0 ? (
                        <div className="text-xs text-muted-foreground p-2">No platforms available</div>
                      ) : (
                        filteredPlatforms.map(platform => (
                          <div key={platform.id} className="flex items-center space-x-2 p-1">
                            <Checkbox
                              id={platform.id}
                              checked={filters.platforms.includes(platform.id)}
                              onCheckedChange={() => handlePlatformToggle(platform.id)}
                            />
                            <Label
                              htmlFor={platform.id}
                              className="text-xs font-normal cursor-pointer flex-1"
                            >
                              {platform.platform_name}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Compact Selected Platform Badges */}
              {filters.platforms.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {filters.platforms.slice(0, 2).map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    return platform ? (
                      <Badge key={platformId} variant="secondary" className="text-xs h-5 px-1">
                        {platform.platform_name}
                        <X 
                          className="ml-1 h-2 w-2 cursor-pointer" 
                          onClick={() => handlePlatformToggle(platformId)}
                        />
                      </Badge>
                    ) : null;
                  })}
                  {filters.platforms.length > 2 && (
                    <Badge variant="secondary" className="text-xs h-5 px-1">
                      +{filters.platforms.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Store Filter - Compact */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Toko</Label>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between h-8 text-xs"
                    disabled={filters.platforms.length === 0 || storesLoading}
                  >
                    {storesLoading ? (
                      "Loading..."
                    ) : filters.platforms.length === 0 ? (
                      "Select platform first"
                    ) : filters.stores.length === 0 ? (
                      "Select Store"
                    ) : (
                      `${filters.stores.length} selected`
                    )}
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72" align="start">
                  <div className="space-y-3">
                    <Input
                      placeholder="Search stores..."
                      value={storeSearch}
                      onChange={(e) => setStoreSearch(e.target.value)}
                      className="h-8 text-xs"
                    />
                    
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onFiltersChange({ ...filters, stores: stores.map(s => s.id) })}
                        disabled={stores.length === 0}
                        className="h-7 px-2 text-xs"
                      >
                        All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onFiltersChange({ ...filters, stores: [] })}
                        className="h-7 px-2 text-xs"
                      >
                        None
                      </Button>
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {stores.length === 0 ? (
                        <div className="text-xs text-muted-foreground p-2">
                          {filters.platforms.length === 0 ? 'Select platform first' : 'No stores available'}
                        </div>
                      ) : (
                        filteredStores.map(store => (
                          <div key={store.id} className="flex items-center space-x-2 p-1">
                            <Checkbox
                              id={store.id}
                              checked={filters.stores.includes(store.id)}
                              onCheckedChange={() => handleStoreToggle(store.id)}
                            />
                            <Label
                              htmlFor={store.id}
                              className="text-xs font-normal cursor-pointer flex-1"
                            >
                              {store.store_name}
                              <span className="text-xs text-muted-foreground block">
                                {(store.platforms as any)?.platform_name}
                              </span>
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Compact Selected Store Badges */}
              {filters.stores.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {filters.stores.slice(0, 2).map(storeId => {
                    const store = stores.find(s => s.id === storeId);
                    return store ? (
                      <Badge key={storeId} variant="secondary" className="text-xs h-5 px-1">
                        {store.store_name}
                        <X 
                          className="ml-1 h-2 w-2 cursor-pointer" 
                          onClick={() => handleStoreToggle(storeId)}
                        />
                      </Badge>
                    ) : null;
                  })}
                  {filters.stores.length > 2 && (
                    <Badge variant="secondary" className="text-xs h-5 px-1">
                      +{filters.stores.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};