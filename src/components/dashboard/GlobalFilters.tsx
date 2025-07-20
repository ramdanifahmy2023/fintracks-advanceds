
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, ChevronDown, X, Search, AlertTriangle } from 'lucide-react';
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
  { label: 'Custom Range', value: 'custom' as const }
];

export const GlobalFilters = ({ filters, onFiltersChange, loading }: GlobalFiltersProps) => {
  const [platformSearch, setPlatformSearch] = useState('');
  const [storeSearch, setStoreSearch] = useState('');
  
  const { data: platforms = [], isLoading: platformsLoading, error: platformsError } = usePlatforms();
  const { data: stores = [], isLoading: storesLoading, error: storesError } = useStores(filters.platforms);

  // Debug logging for filter state changes
  useEffect(() => {
    console.log('🔍 GlobalFilters: Filter state changed:', filters);
    console.log('🔍 GlobalFilters: Platforms data:', platforms);
    console.log('🔍 GlobalFilters: Stores data:', stores);
  }, [filters, platforms, stores]);

  // Debug logging for errors
  useEffect(() => {
    if (platformsError) {
      console.error('❌ GlobalFilters: Platforms error:', platformsError);
    }
    if (storesError) {
      console.error('❌ GlobalFilters: Stores error:', storesError);
    }
  }, [platformsError, storesError]);

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
    console.log('🔍 GlobalFilters: Changing date preset to:', preset);
    const range = getDateRange(preset);
    const newFilters = {
      ...filters,
      dateRange: {
        ...range,
        preset
      }
    };
    console.log('🔍 GlobalFilters: New filters after date change:', newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateSelect = (date: Date | undefined, type: 'from' | 'to') => {
    if (!date) return;
    
    console.log('🔍 GlobalFilters: Changing date', type, 'to:', date);
    const newFilters = {
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: date,
        preset: 'custom'
      }
    };
    console.log('🔍 GlobalFilters: New filters after date select:', newFilters);
    onFiltersChange(newFilters);
  };

  const handlePlatformToggle = (platformId: string) => {
    console.log('🔍 GlobalFilters: Toggling platform:', platformId);
    const newPlatforms = filters.platforms.includes(platformId)
      ? filters.platforms.filter(id => id !== platformId)
      : [...filters.platforms, platformId];
    
    const newFilters = {
      ...filters,
      platforms: newPlatforms,
      stores: [] // Clear stores when platforms change
    };
    console.log('🔍 GlobalFilters: New filters after platform toggle:', newFilters);
    onFiltersChange(newFilters);
  };

  const handleStoreToggle = (storeId: string) => {
    console.log('🔍 GlobalFilters: Toggling store:', storeId);
    const newStores = filters.stores.includes(storeId)
      ? filters.stores.filter(id => id !== storeId)
      : [...filters.stores, storeId];
    
    const newFilters = {
      ...filters,
      stores: newStores
    };
    console.log('🔍 GlobalFilters: New filters after store toggle:', newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    console.log('🔍 GlobalFilters: Clearing all filters');
    const newFilters = {
      dateRange: {
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
        preset: 'thisMonth'
      },
      platforms: [],
      stores: []
    };
    console.log('🔍 GlobalFilters: New filters after clear:', newFilters);
    onFiltersChange(newFilters);
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
      <Card className="sticky top-4 z-10 shadow-lg border-2">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Terjadi kesalahan saat memuat data filter. Silakan refresh halaman.
              <br />
              Error: {platformsError?.message || storesError?.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4 z-10 shadow-lg border-2">
      <CardContent className="p-6">
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-2 bg-muted rounded text-xs">
            <div>Debug Info:</div>
            <div>Platforms: {platforms.length} loaded, loading: {platformsLoading.toString()}</div>
            <div>Stores: {stores.length} loaded, loading: {storesLoading.toString()}</div>
            <div>Selected platforms: {filters.platforms.length}</div>
            <div>Selected stores: {filters.stores.length}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Date Range Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Periode Tanggal</Label>
            
            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-2 mb-3">
              {datePresets.map(preset => (
                <Button
                  key={preset.value}
                  variant={filters.dateRange.preset === preset.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetChange(preset.value)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Custom Date Range */}
            {filters.dateRange.preset === 'custom' && (
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? format(filters.dateRange.from, "dd MMM yyyy", { locale: id }) : "Dari"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from}
                      onSelect={(date) => handleDateSelect(date, 'from')}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !filters.dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.to ? format(filters.dateRange.to, "dd MMM yyyy", { locale: id }) : "Sampai"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to}
                      onSelect={(date) => handleDateSelect(date, 'to')}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            {filters.dateRange.preset !== 'custom' && (
              <div className="text-sm text-muted-foreground">
                {format(filters.dateRange.from, "dd MMM", { locale: id })} - {format(filters.dateRange.to, "dd MMM yyyy", { locale: id })}
              </div>
            )}
          </div>

          {/* Platform Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Platform</Label>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  disabled={platformsLoading}
                >
                  {platformsLoading ? (
                    "Loading platforms..."
                  ) : filters.platforms.length === 0 ? (
                    "Pilih Platform"
                  ) : (
                    `${filters.platforms.length} platform dipilih`
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari platform..."
                      value={platformSearch}
                      onChange={(e) => setPlatformSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, platforms: platforms.map(p => p.id) })}
                      disabled={platforms.length === 0}
                    >
                      Pilih Semua
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, platforms: [], stores: [] })}
                    >
                      Bersihkan
                    </Button>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {platformsLoading ? (
                      <div className="text-sm text-muted-foreground">Loading platforms...</div>
                    ) : platforms.length === 0 ? (
                      <div className="text-sm text-muted-foreground">Tidak ada platform tersedia</div>
                    ) : (
                      filteredPlatforms.map(platform => (
                        <div key={platform.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={platform.id}
                            checked={filters.platforms.includes(platform.id)}
                            onCheckedChange={() => handlePlatformToggle(platform.id)}
                          />
                          <Label
                            htmlFor={platform.id}
                            className="text-sm font-normal cursor-pointer flex-1"
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

            {/* Selected Platform Badges */}
            {filters.platforms.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.platforms.slice(0, 3).map(platformId => {
                  const platform = platforms.find(p => p.id === platformId);
                  return platform ? (
                    <Badge key={platformId} variant="secondary" className="text-xs">
                      {platform.platform_name}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer" 
                        onClick={() => handlePlatformToggle(platformId)}
                      />
                    </Badge>
                  ) : null;
                })}
                {filters.platforms.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{filters.platforms.length - 3} lainnya
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Store Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Toko</Label>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  disabled={filters.platforms.length === 0 || storesLoading}
                >
                  {storesLoading ? (
                    "Loading stores..."
                  ) : filters.platforms.length === 0 ? (
                    "Pilih platform dulu"
                  ) : filters.stores.length === 0 ? (
                    "Pilih Toko"
                  ) : (
                    `${filters.stores.length} toko dipilih`
                  )}
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari toko..."
                      value={storeSearch}
                      onChange={(e) => setStoreSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, stores: stores.map(s => s.id) })}
                      disabled={stores.length === 0}
                    >
                      Pilih Semua
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onFiltersChange({ ...filters, stores: [] })}
                    >
                      Bersihkan
                    </Button>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {storesLoading ? (
                      <div className="text-sm text-muted-foreground">Loading stores...</div>
                    ) : stores.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        {filters.platforms.length === 0 ? 'Pilih platform terlebih dahulu' : 'Tidak ada toko tersedia'}
                      </div>
                    ) : (
                      filteredStores.map(store => (
                        <div key={store.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={store.id}
                            checked={filters.stores.includes(store.id)}
                            onCheckedChange={() => handleStoreToggle(store.id)}
                          />
                          <Label
                            htmlFor={store.id}
                            className="text-sm font-normal cursor-pointer flex-1"
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

            {/* Selected Store Badges */}
            {filters.stores.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {filters.stores.slice(0, 2).map(storeId => {
                  const store = stores.find(s => s.id === storeId);
                  return store ? (
                    <Badge key={storeId} variant="secondary" className="text-xs">
                      {store.store_name}
                      <X 
                        className="ml-1 h-3 w-3 cursor-pointer" 
                        onClick={() => handleStoreToggle(storeId)}
                      />
                    </Badge>
                  ) : null;
                })}
                {filters.stores.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{filters.stores.length - 2} lainnya
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Clear All Button */}
        {(filters.platforms.length > 0 || filters.stores.length > 0 || filters.dateRange.preset !== 'thisMonth') && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              <X className="mr-2 h-4 w-4" />
              Bersihkan Semua Filter
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
