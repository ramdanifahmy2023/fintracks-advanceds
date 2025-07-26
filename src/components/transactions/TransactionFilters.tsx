
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import { TransactionFilters } from '@/hooks/useTransactions';
import { usePlatforms } from '@/hooks/usePlatforms';
import { useStores } from '@/hooks/useStores';

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onFiltersChange: (filters: TransactionFilters) => void;
}

const DELIVERY_STATUSES = [
  { value: 'Selesai', label: 'Selesai' },
  { value: 'Sedang Dikirim', label: 'Sedang Dikirim' },
  { value: 'Batal', label: 'Batal' },
  { value: 'Return', label: 'Return' },
  { value: 'Menunggu Konfirmasi', label: 'Menunggu Konfirmasi' }
];

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const [localFilters, setLocalFilters] = useState<TransactionFilters>(filters);
  const { data: platforms } = usePlatforms();
  const { data: stores } = useStores();

  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    const newFilters = { ...localFilters, [key]: value || undefined };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const activeFiltersCount = Object.values(localFilters).filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter Transaksi
          </CardTitle>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} filter aktif</Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              disabled={activeFiltersCount === 0}
            >
              <X className="h-4 w-4 mr-1" />
              Hapus Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Pencarian</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk, SKU, atau nomor pesanan..."
                value={localFilters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Order Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Nomor Pesanan</label>
            <Input
              placeholder="Masukkan nomor pesanan..."
              value={localFilters.order_number || ''}
              onChange={(e) => handleFilterChange('order_number', e.target.value)}
            />
          </div>

          {/* Delivery Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status Pengiriman</label>
            <Select
              value={localFilters.delivery_status || ''}
              onValueChange={(value) => handleFilterChange('delivery_status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Status</SelectItem>
                {DELIVERY_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Platform</label>
            <Select
              value={localFilters.platform_id || ''}
              onValueChange={(value) => handleFilterChange('platform_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih platform..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Platform</SelectItem>
                {platforms?.map((platform) => (
                  <SelectItem key={platform.id} value={platform.id}>
                    {platform.platform_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Store */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Toko</label>
            <Select
              value={localFilters.store_id || ''}
              onValueChange={(value) => handleFilterChange('store_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih toko..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Toko</SelectItem>
                {stores?.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.store_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tanggal Mulai</label>
            <Input
              type="date"
              value={localFilters.start_date || ''}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tanggal Akhir</label>
            <Input
              type="date"
              value={localFilters.end_date || ''}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
