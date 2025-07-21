import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Minus, 
  Calculator, 
  Save, 
  X,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TransactionFormData, DELIVERY_STATUSES } from '@/types/upload';
import { usePlatforms, useStores } from '@/hooks/useDashboard';
import { formatCurrency } from '@/lib/formatters';
import { useToast } from '@/hooks/use-toast';

const transactionSchema = z.object({
  pic_name: z.string().min(1, 'PIC name wajib diisi'),
  platform_id: z.string().min(1, 'Platform wajib dipilih'),
  store_id: z.string().min(1, 'Store wajib dipilih'),
  order_number: z.string().min(1, 'Order number wajib diisi'),
  manual_order_number: z.string().optional(),
  expedition: z.string().optional(),
  delivery_status: z.enum(DELIVERY_STATUSES, {
    required_error: 'Delivery status wajib dipilih'
  }),
  product_name: z.string().min(1, 'Product name wajib diisi'),
  tracking_number: z.string().optional(),
  order_created_at: z.string().min(1, 'Order date wajib diisi'),
  cost_price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Harga beli harus berupa angka positif'
  }),
  selling_price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Harga jual harus berupa angka positif'
  }),
  sku_reference: z.string().optional(),
  quantity: z.number().min(1, 'Quantity minimal 1')
});

interface ManualInputFormProps {
  onSubmit: (data: TransactionFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<TransactionFormData>;
  isSubmitting?: boolean;
}

const deliveryStatusIcons = {
  'Selesai': CheckCircle,
  'Sedang Dikirim': Truck,
  'Batal': XCircle,
  'Return': Package,
  'Menunggu Konfirmasi': Clock
} as const;

const deliveryStatusColors = {
  'Selesai': 'text-green-600',
  'Sedang Dikirim': 'text-blue-600',
  'Batal': 'text-red-600',
  'Return': 'text-orange-600',
  'Menunggu Konfirmasi': 'text-yellow-600'
} as const;

export const ManualInputForm = ({ 
  onSubmit, 
  onCancel, 
  initialData,
  isSubmitting = false 
}: ManualInputFormProps) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const { toast } = useToast();
  
  const { data: platforms = [], isLoading: platformsLoading } = usePlatforms();
  const { data: stores = [], isLoading: storesLoading } = useStores(selectedPlatforms);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      pic_name: '',
      platform_id: '',
      store_id: '',
      order_number: '',
      manual_order_number: '',
      expedition: '',
      delivery_status: 'Menunggu Konfirmasi',
      product_name: '',
      tracking_number: '',
      order_created_at: new Date().toISOString().slice(0, 16),
      cost_price: '',
      selling_price: '',
      sku_reference: '',
      quantity: 1,
      ...initialData
    }
  });

  const watchedValues = watch();
  const profit = calculateProfit(watchedValues.cost_price, watchedValues.selling_price, watchedValues.quantity);

  function calculateProfit(costPrice: string, sellingPrice: string, quantity: number): number {
    const cost = parseFloat(costPrice) || 0;
    const selling = parseFloat(sellingPrice) || 0;
    return (selling - cost) * quantity;
  }

  const adjustQuantity = (increment: boolean) => {
    const currentQuantity = watchedValues.quantity;
    const newQuantity = increment ? currentQuantity + 1 : Math.max(1, currentQuantity - 1);
    setValue('quantity', newQuantity);
  };

  const handlePlatformChange = (platformId: string) => {
    setValue('platform_id', platformId);
    setValue('store_id', ''); // Reset store when platform changes
    setSelectedPlatforms([platformId]);
  };

  const formatCurrencyInput = (value: string): string => {
    const number = parseFloat(value.replace(/[^\d]/g, ''));
    return isNaN(number) ? '' : number.toString();
  };

  const handleFormSubmit = async (data: TransactionFormData) => {
    try {
      await onSubmit(data);
      reset();
      toast({
        title: "Data Berhasil Disimpan",
        description: "Transaksi baru telah ditambahkan",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan data transaksi",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (initialData?.platform_id) {
      setSelectedPlatforms([initialData.platform_id]);
    }
  }, [initialData]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Input Manual Transaksi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Row 1: PIC Name + Platform */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pic_name">PIC Name *</Label>
              <Input
                id="pic_name"
                {...register('pic_name')}
                placeholder="Nama admin/PIC"
                className={cn(errors.pic_name && "border-destructive")}
              />
              {errors.pic_name && (
                <p className="text-sm text-destructive">{errors.pic_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Platform *</Label>
              <Select
                value={watchedValues.platform_id}
                onValueChange={handlePlatformChange}
                disabled={platformsLoading}
              >
                <SelectTrigger className={cn(errors.platform_id && "border-destructive")}>
                  <SelectValue placeholder="Pilih platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.platform_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.platform_id && (
                <p className="text-sm text-destructive">{errors.platform_id.message}</p>
              )}
            </div>
          </div>

          {/* Row 2: Store + Order Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Store *</Label>
              <Select
                value={watchedValues.store_id}
                onValueChange={(value) => setValue('store_id', value)}
                disabled={storesLoading || !watchedValues.platform_id}
              >
                <SelectTrigger className={cn(errors.store_id && "border-destructive")}>
                  <SelectValue placeholder="Pilih store" />
                </SelectTrigger>
                <SelectContent>
                  {storesLoading ? (
                    <SelectItem value="loading" disabled>
                      Memuat store...
                    </SelectItem>
                  ) : stores.length === 0 ? (
                    <SelectItem value="no-stores" disabled>
                      Store tidak tersedia
                    </SelectItem>
                  ) : (
                    stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.store_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.store_id && (
                <p className="text-sm text-destructive">{errors.store_id.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="order_number">Order Number *</Label>
              <Input
                id="order_number"
                {...register('order_number')}
                placeholder="Nomor pesanan"
                className={cn(errors.order_number && "border-destructive")}
              />
              {errors.order_number && (
                <p className="text-sm text-destructive">{errors.order_number.message}</p>
              )}
            </div>
          </div>

          {/* Row 3: Manual Order Number + Expedition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manual_order_number">Manual Order Number</Label>
              <Input
                id="manual_order_number"
                {...register('manual_order_number')}
                placeholder="Nomor pesanan manual (opsional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expedition">Expedition</Label>
              <Input
                id="expedition"
                {...register('expedition')}
                placeholder="Nama kurir"
              />
            </div>
          </div>

          {/* Row 4: Product Name + Delivery Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_name">Product Name *</Label>
              <Input
                id="product_name"
                {...register('product_name')}
                placeholder="Nama barang"
                className={cn(errors.product_name && "border-destructive")}
              />
              {errors.product_name && (
                <p className="text-sm text-destructive">{errors.product_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Delivery Status *</Label>
              <RadioGroup
                value={watchedValues.delivery_status}
                onValueChange={(value) => setValue('delivery_status', value as any)}
                className="flex flex-wrap gap-4"
              >
                {DELIVERY_STATUSES.map((status) => {
                  const Icon = deliveryStatusIcons[status];
                  return (
                    <div key={status} className="flex items-center space-x-2">
                      <RadioGroupItem value={status} id={status} />
                      <Label 
                        htmlFor={status} 
                        className={cn(
                          "flex items-center gap-2 cursor-pointer",
                          deliveryStatusColors[status]
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {status}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
              {errors.delivery_status && (
                <p className="text-sm text-destructive">{errors.delivery_status.message}</p>
              )}
            </div>
          </div>

          {/* Row 5: Tracking Number + Order Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tracking_number">Tracking Number</Label>
              <Input
                id="tracking_number"
                {...register('tracking_number')}
                placeholder="Nomor resi (opsional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="order_created_at">Order Date & Time *</Label>
              <Input
                id="order_created_at"
                {...register('order_created_at')}
                type="datetime-local"
                className={cn(errors.order_created_at && "border-destructive")}
              />
              {errors.order_created_at && (
                <p className="text-sm text-destructive">{errors.order_created_at.message}</p>
              )}
            </div>
          </div>

          {/* Row 6: Prices + Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost_price">Cost Price *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">Rp</span>
                <Input
                  id="cost_price"
                  {...register('cost_price')}
                  placeholder="0"
                  className={cn("pl-8", errors.cost_price && "border-destructive")}
                  onChange={(e) => {
                    const formatted = formatCurrencyInput(e.target.value);
                    setValue('cost_price', formatted);
                  }}
                />
              </div>
              {errors.cost_price && (
                <p className="text-sm text-destructive">{errors.cost_price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="selling_price">Selling Price *</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">Rp</span>
                <Input
                  id="selling_price"
                  {...register('selling_price')}
                  placeholder="0"
                  className={cn("pl-8", errors.selling_price && "border-destructive")}
                  onChange={(e) => {
                    const formatted = formatCurrencyInput(e.target.value);
                    setValue('selling_price', formatted);
                  }}
                />
              </div>
              {errors.selling_price && (
                <p className="text-sm text-destructive">{errors.selling_price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Quantity *</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => adjustQuantity(false)}
                  disabled={watchedValues.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  {...register('quantity', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  className={cn("text-center", errors.quantity && "border-destructive")}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => adjustQuantity(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          {/* Row 7: SKU Reference */}
          <div className="space-y-2">
            <Label htmlFor="sku_reference">SKU Reference</Label>
            <Input
              id="sku_reference"
              {...register('sku_reference')}
              placeholder="Nomor referensi SKU (opsional)"
            />
          </div>

          {/* Profit Calculation Display */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Profit Calculation</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    ({formatCurrency(parseFloat(watchedValues.selling_price) || 0)} - {formatCurrency(parseFloat(watchedValues.cost_price) || 0)}) × {watchedValues.quantity}
                  </div>
                  <div className={cn(
                    "text-lg font-bold",
                    profit > 0 ? "text-green-600" : profit < 0 ? "text-red-600" : "text-muted-foreground"
                  )}>
                    {formatCurrency(profit)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              <X className="h-4 w-4 mr-2" />
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};