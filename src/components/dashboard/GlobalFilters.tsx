import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronDown, Search, AlertTriangle, Store, Smartphone, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilterState } from '@/types/dashboard';
import { usePlatformsOptimized, useStoresOptimized } from '@/hooks/useOptimizedDashboard';

interface GlobalFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  loading?: boolean;
}

export const GlobalFilters = ({ filters, onFiltersChange, loading }: GlobalFiltersProps) => {
  const [platformSearch, setPlatformSearch] = useState('');
  const [storeSearch, setStoreSearch] = useState('');
  
  const { data: platforms = [], isLoading: platformsLoading, error: platformsError } = usePlatformsOptimized();
  const { data: stores = [], isLoading: storesLoading, error: storesError } = useStoresOptimized(filters.platforms);

  // Memoized filtered data for better performance
  const filteredPlatforms = useMemo(() => 
    platforms.filter(platform =>
      platform.platform_name.toLowerCase().includes(platformSearch.toLowerCase())
    ), [platforms, platformSearch]
  );

  const filteredStores = useMemo(() => 
    stores.filter(store =>
      store.store_name.toLowerCase().includes(storeSearch.toLowerCase())
    ), [stores, storeSearch]
  );

  const handlePlatformToggle = (platformId: string) => {
    const newPlatforms = filters.platforms.includes(platformId)
      ? filters.platforms.filter(id => id !== platformId)
      : [...filters.platforms, platformId];
    
    const newFilters: FilterState = {
      ...filters,
      platforms: newPlatforms,
      stores: [] // Clear stores when platforms change
    };
    onFiltersChange(newFilters);
  };

  const handleStoreToggle = (storeId: string) => {
    const newStores = filters.stores.includes(storeId)
      ? filters.stores.filter(id => id !== storeId)
      : [...filters.stores, storeId];
    
    const newFilters: FilterState = {
      ...filters,
      stores: newStores
    };
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const newFilters: FilterState = {
      dateRange: filters.dateRange, // Keep date range, only clear platform/store filters
      platforms: [],
      stores: []
    };
    onFiltersChange(newFilters);
  };

  // Show error state if there are errors
  if (platformsError || storesError) {
    return (
      <Card className="shadow-md border">
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
    );
  }

  return (
    <Card className="shadow-md border">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Platform Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium">Platform</Label>
            </div>
            
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
                      </div>
                    ) : filteredPlatforms.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        Tidak ada platform yang cocok dengan pencarian
                      </div>
                    ) : (
                      filteredPlatforms.map((platform) => (
                        <div key={platform.id} className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded transition-colors">
                          <Checkbox
                            id={`platform-${platform.id}`}
                            checked={filters.platforms.includes(platform.id)}
                            onCheckedChange={() => handlePlatformToggle(platform.id)}
                          />
                          <Label
                            htmlFor={`platform-${platform.id}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {platform.platform_name}
                          </Label>
                          <Badge variant="outline" className="text-xs">
                            {platform.platform_code}
                          </Badge>
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
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-primary" />
              <Label className="text-sm font-medium">Toko</Label>
            </div>
            
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
                    ) : filters.platforms.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        Pilih platform terlebih dahulu untuk melihat toko
                      </div>
                    ) : stores.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        Tidak ada toko untuk platform yang dipilih
                      </div>
                    ) : filteredStores.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        Tidak ada toko yang cocok dengan pencarian
                      </div>
                    ) : (
                      filteredStores.map((store) => (
                        <div key={store.id} className="flex items-center space-x-2 px-2 py-1 hover:bg-accent rounded transition-colors">
                          <Checkbox
                            id={`store-${store.id}`}
                            checked={filters.stores.includes(store.id)}
                            onCheckedChange={() => handleStoreToggle(store.id)}
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={`store-${store.id}`}
                              className="text-sm cursor-pointer block"
                            >
                              {store.store_name}
                            </Label>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {store.store_id_external}
                          </Badge>
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

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={clearAllFilters}
            className="flex-1"
            disabled={loading || (filters.platforms.length === 0 && filters.stores.length === 0)}
          >
            <X className="mr-2 h-4 w-4" />
            Bersihkan Filter
          </Button>
          
          {(filters.platforms.length > 0 || filters.stores.length > 0) && (
            <Badge variant="secondary" className="px-3 py-2">
              {filters.platforms.length + filters.stores.length} filter aktif
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};