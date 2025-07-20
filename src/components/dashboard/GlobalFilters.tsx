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
import { CalendarIcon, ChevronDown, X, Search, AlertTriangle, Bug, Filter } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { FilterState } from '@/types/dashboard';
import { usePlatforms, useStores } from '@/hooks/useDashboard';
import { supabase } from '@/integrations/supabase/client';

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
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [showDebug, setShowDebug] = useState(false);
  
  const { data: platforms = [], isLoading: platformsLoading, error: platformsError } = usePlatforms();
  const { data: stores = [], isLoading: storesLoading, error: storesError } = useStores(filters.platforms);

  // Enhanced debugging with user info and API status
  useEffect(() => {
    const getCurrentUserInfo = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        
        // Test direct queries to check RLS
        const { data: platformsTest, error: platformsTestError, count: platformsCount } = await supabase
          .from('platforms')
          .select('*', { count: 'exact' });
        
        const { data: storesTest, error: storesTestError, count: storesCount } = await supabase
          .from('stores')
          .select('*', { count: 'exact' });

        const debug = {
          timestamp: new Date().toISOString(),
          user: {
            id: user?.id,
            email: user?.email,
            role: user?.user_metadata?.role,
            authenticated: !!user
          },
          session: {
            exists: !!session,
            accessToken: (session as any)?.access_token ? 'present' : 'missing',
            refreshToken: (session as any)?.refresh_token ? 'present' : 'missing'
          },
          directQueries: {
            platforms: {
              count: platformsCount,
              error: platformsTestError?.message,
              hasData: platformsTest && platformsTest.length > 0
            },
            stores: {
              count: storesCount,
              error: storesTestError?.message,
              hasData: storesTest && storesTest.length > 0
            }
          },
          hookStates: {
            platforms: {
              loading: platformsLoading,
              error: platformsError?.message,
              count: platforms.length
            },
            stores: {
              loading: storesLoading,
              error: storesError?.message,
              count: stores.length,
              dependsOnPlatforms: filters.platforms.length
            }
          },
          errors: {
            user: userError?.message,
            session: sessionError?.message
          }
        };

        setDebugInfo(debug);
        console.log('🔍 Complete Debug Info:', debug);
      } catch (error) {
        console.error('❌ Debug info collection failed:', error);
        setDebugInfo({ error: 'Failed to collect debug info' });
      }
    };

    getCurrentUserInfo();
  }, [platforms, stores, platformsLoading, storesLoading, platformsError, storesError, filters.platforms]);

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
    const newFilters: FilterState = {
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
    const newFilters: FilterState = {
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: date,
        preset: 'custom' as const
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
    
    const newFilters: FilterState = {
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
    
    const newFilters: FilterState = {
      ...filters,
      stores: newStores
    };
    console.log('🔍 GlobalFilters: New filters after store toggle:', newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    console.log('🔍 GlobalFilters: Clearing all filters');
    const newFilters: FilterState = {
      dateRange: {
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
        preset: 'thisMonth' as const
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
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <Card className="mx-4 my-4 border-0 shadow-lg bg-card/95 backdrop-blur-sm">
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Terjadi kesalahan saat memuat data filter. Silakan refresh halaman.
                <br />
                Platform Error: {platformsError?.message}
                <br />
                Store Error: {storesError?.message}
                <br />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  Refresh Halaman
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <Card className="mx-4 my-4 border-0 shadow-lg bg-card/95 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Header Section */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Filter Periode & Platform</h3>
              <p className="text-sm text-muted-foreground">
                {format(filters.dateRange.from, 'dd MMM yyyy')} - {format(filters.dateRange.to, 'dd MMM yyyy')}
                {filters.platforms.length > 0 && ` • ${filters.platforms.length} platform`}
                {filters.stores.length > 0 && ` • ${filters.stores.length} toko`}
              </p>
            </div>
          </div>

          {/* Debug Panel - Show detailed information */}
          {showDebug && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  <span className="font-semibold">Debug Panel</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowDebug(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div>
                  <strong>User:</strong> {debugInfo.user?.email || 'Not logged in'} 
                  (ID: {debugInfo.user?.id || 'None'})
                </div>
                
                <div>
                  <strong>Authentication:</strong> {debugInfo.user?.authenticated ? '✅ Yes' : '❌ No'}
                </div>
                
                <div>
                  <strong>Direct Database Queries:</strong>
                  <ul className="ml-4 mt-1">
                    <li>Platforms: {debugInfo.directQueries?.platforms?.count || 0} records 
                      {debugInfo.directQueries?.platforms?.error && ` (Error: ${debugInfo.directQueries.platforms.error})`}
                    </li>
                    <li>Stores: {debugInfo.directQueries?.stores?.count || 0} records
                      {debugInfo.directQueries?.stores?.error && ` (Error: ${debugInfo.directQueries.stores.error})`}
                    </li>
                  </ul>
                </div>
                
                <div>
                  <strong>Hook States:</strong>
                  <ul className="ml-4 mt-1">
                    <li>Platforms Loading: {debugInfo.hookStates?.platforms?.loading ? '⏳' : '✅'}</li>
                    <li>Stores Loading: {debugInfo.hookStates?.stores?.loading ? '⏳' : '✅'}</li>
                    <li>Selected Platforms: {filters.platforms.length}</li>
                  </ul>
                </div>
              </div>
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
                    className={cn(
                      "text-xs transition-all duration-200 hover:scale-105",
                      filters.dateRange.preset === preset.value && "shadow-md"
                    )}
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
                        <div className="text-sm text-muted-foreground">
                          Tidak ada platform tersedia
                          {debugInfo.directQueries?.platforms?.count > 0 && (
                            <div className="text-xs text-orange-600 mt-1">
                              Database memiliki {debugInfo.directQueries.platforms.count} platform, 
                              tapi hook tidak bisa mengaksesnya
                            </div>
                          )}
                        </div>
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
                          {debugInfo.directQueries?.stores?.count > 0 && (
                            <div className="text-xs text-orange-600 mt-1">
                              Database memiliki {debugInfo.directQueries.stores.count} toko, 
                              tapi hook tidak bisa mengaksesnya
                            </div>
                          )}
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
            <div className="mt-6 pt-4 border-t">
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="mr-2 h-4 w-4" />
                Bersihkan Semua Filter
              </Button>
            </div>
          )}

          {/* Debug Toggle for Production */}
          {!showDebug && (
            <div className="mt-4 pt-4 border-t">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowDebug(true)}
                className="text-xs"
              >
                <Bug className="mr-2 h-3 w-3" />
                Show Debug Info
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};