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
import { CalendarIcon, ChevronDown, X, Filter, AlertTriangle, CalendarDays } from 'lucide-react';
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
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  const [tempFromDate, setTempFromDate] = useState<Date>(filters.dateRange.from);
  const [tempToDate, setTempToDate] = useState<Date>(filters.dateRange.to);

  const { data: platforms = [], isLoading: platformsLoading, error: platformsError } = usePlatforms();
  const { data: stores = [], isLoading: storesLoading, error: storesError } = useStores(filters.platforms);

  console.log('🗓️ GlobalFilters: Rendered with filters:', {
    dateRange: {
      from: format(filters.dateRange.from, 'yyyy-MM-dd'),
      to: format(filters.dateRange.to, 'yyyy-MM-dd'),
      preset: filters.dateRange.preset
    },
    platforms: filters.platforms,
    stores: filters.stores
  });

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
    console.log('🗓️ GlobalFilters: Preset clicked:', preset);
    const range = getDateRange(preset);
    onFiltersChange({
      ...filters,
      dateRange: { ...range, preset }
    });
  };

  const handleCustomDateSubmit = () => {
    console.log('🗓️ GlobalFilters: Custom date applied:', {
      from: format(tempFromDate, 'yyyy-MM-dd'),
      to: format(tempToDate, 'yyyy-MM-dd')
    });
    onFiltersChange({
      ...filters,
      dateRange: {
        from: tempFromDate,
        to: tempToDate,
        preset: 'custom'
      }
    });
    setIsCustomDateOpen(false);
  };

  const openCustomPicker = () => {
    setTempFromDate(filters.dateRange.from);
    setTempToDate(filters.dateRange.to);
    setIsCustomDateOpen(true);
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

  const formatDateRange = () => {
    const preset = datePresets.find(p => p.value === filters.dateRange.preset);
    if (preset && filters.dateRange.preset !== 'custom') {
      return preset.label;
    }
    return `${format(filters.dateRange.from, 'dd MMM', { locale: id })} - ${format(filters.dateRange.to, 'dd MMM yyyy', { locale: id })}`;
  };

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

  const hasActiveFilters = filters.platforms.length > 0 || filters.stores.length > 0 || filters.dateRange.preset !== 'thisMonth';

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <Card className="mx-4 my-4 border-0 shadow-lg bg-card/95 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Filter Periode & Data</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDateRange()}
                  {filters.platforms.length > 0 && ` • ${filters.platforms.length} platform`}
                  {filters.stores.length > 0 && ` • ${filters.stores.length} toko`}
                </p>
              </div>
            </div>

            {/* Clear All - Show only when filters are active */}
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearAllFilters} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Reset Filter
              </Button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Date Range Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Periode Waktu</Label>
              
              {/* Preset Buttons */}
              <div className="flex flex-wrap gap-2">
                {datePresets.map(preset => (
                  <Button
                    key={preset.value}
                    variant={filters.dateRange.preset === preset.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePresetChange(preset.value)}
                    className={cn(
                      "transition-all duration-200 hover:scale-105",
                      filters.dateRange.preset === preset.value && "shadow-md"
                    )}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              {/* Custom Date Range Picker */}
              <Popover open={isCustomDateOpen} onOpenChange={setIsCustomDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openCustomPicker}
                    className={cn(
                      "w-full justify-start text-left font-normal transition-all duration-200 hover:scale-105",
                      filters.dateRange.preset === 'custom' && "border-primary bg-primary/5"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>
                      {filters.dateRange.preset === 'custom' ? 'Custom Range' : 'Pilih Custom'}
                    </span>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0 bg-popover/95 backdrop-blur-sm border shadow-xl" 
                  align="start"
                  sideOffset={8}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* From Date Calendar */}
                    <div className="p-4 border-b sm:border-b-0 sm:border-r border-border">
                      <div className="text-sm font-medium mb-3 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Dari Tanggal
                      </div>
                      <Calendar
                        mode="single"
                        selected={tempFromDate}
                        onSelect={(date) => date && setTempFromDate(date)}
                        disabled={(date) => date > tempToDate}
                        initialFocus
                        className="p-3"
                      />
                    </div>
                    
                    {/* To Date Calendar */}
                    <div className="p-4">
                      <div className="text-sm font-medium mb-3 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Sampai Tanggal
                      </div>
                      <Calendar
                        mode="single"
                        selected={tempToDate}
                        onSelect={(date) => date && setTempToDate(date)}
                        disabled={(date) => date < tempFromDate}
                        className="p-3"
                      />
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="p-4 border-t border-border bg-muted/50 flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      {format(tempFromDate, 'dd MMM yyyy')} - {format(tempToDate, 'dd MMM yyyy')}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCustomDateOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button size="sm" onClick={handleCustomDateSubmit}>
                        Terapkan
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Platform Filter Section */}
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
                      "Loading..."
                    ) : filters.platforms.length === 0 ? (
                      "Pilih Platform"
                    ) : (
                      `${filters.platforms.length} platform dipilih`
                    )}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-4">
                    <Input
                      placeholder="Cari platform..."
                      value={platformSearch}
                      onChange={(e) => setPlatformSearch(e.target.value)}
                      className="h-9"
                    />

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
                        Hapus Semua
                      </Button>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {platforms.length === 0 ? (
                        <div className="text-sm text-muted-foreground p-3 text-center">
                          Tidak ada platform tersedia
                        </div>
                      ) : (
                        filteredPlatforms.map(platform => (
                          <div key={platform.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
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
                          className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
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

            {/* Store Filter Section */}
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
                      "Loading..."
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
                  <div className="space-y-4">
                    <Input
                      placeholder="Cari toko..."
                      value={storeSearch}
                      onChange={(e) => setStoreSearch(e.target.value)}
                      className="h-9"
                    />

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
                        Hapus Semua
                      </Button>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {stores.length === 0 ? (
                        <div className="text-sm text-muted-foreground p-3 text-center">
                          {filters.platforms.length === 0 ? 'Pilih platform terlebih dahulu' : 'Tidak ada toko tersedia'}
                        </div>
                      ) : (
                        filteredStores.map(store => (
                          <div key={store.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50">
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
                  {filters.stores.slice(0, 3).map(storeId => {
                    const store = stores.find(s => s.id === storeId);
                    return store ? (
                      <Badge key={storeId} variant="secondary" className="text-xs">
                        {store.store_name}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => handleStoreToggle(storeId)}
                        />
                      </Badge>
                    ) : null;
                  })}
                  {filters.stores.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{filters.stores.length - 3} lainnya
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