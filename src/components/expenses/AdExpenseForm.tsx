import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { usePlatforms, useStores } from '@/hooks/useDashboard';
import { useCreateAdExpense } from '@/hooks/useAdExpenses';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Skema validasi menggunakan Zod untuk memastikan data yang diinput benar
const adExpenseSchema = z.object({
  expense_date: z.date({
    required_error: 'Tanggal iklan harus diisi.',
  }),
  platform_id: z.string().min(1, 'Platform harus dipilih.'),
  store_id: z.string().optional(),
  amount: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val.replace(/[^0-9]/g, ''), 10) : val),
    z.number().min(1, 'Biaya iklan harus lebih dari 0.')
  ),
  notes: z.string().optional(),
});

type AdExpenseFormValues = z.infer<typeof adExpenseSchema>;

export const AdExpenseForm = () => {
  const { user } = useAuth();
  const { data: platforms = [], isLoading: platformsLoading } = usePlatforms();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const { data: stores = [], isLoading: storesLoading } = useStores(selectedPlatform ? [selectedPlatform] : []);

  const createAdExpense = useCreateAdExpense();

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<AdExpenseFormValues>({
    resolver: zodResolver(adExpenseSchema),
    defaultValues: {
      expense_date: new Date(),
      platform_id: '',
      store_id: '',
      amount: 0,
      notes: '',
    },
  });

  const platformId = watch('platform_id');

  const onSubmit = async (data: AdExpenseFormValues) => {
    if (!user) {
      toast.error('Anda harus login untuk menambahkan data.');
      return;
    }

    await createAdExpense.mutateAsync({
      ...data,
      created_by: user.id,
      store_id: data.store_id || null, // Pastikan mengirim null jika kosong
    }, {
      onSuccess: () => {
        toast.success('Biaya iklan berhasil ditambahkan!');
        reset({
          expense_date: new Date(),
          platform_id: '',
          store_id: '',
          amount: 0,
          notes: ''
        });
        setSelectedPlatform('');
      },
      onError: (error) => {
        toast.error(`Gagal menyimpan: ${error.message}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Kolom Kiri */}
        <div className="space-y-4">
          {/* Tanggal Iklan */}
          <div>
            <Label htmlFor="expense_date">Tanggal Iklan *</Label>
            <Controller
              name="expense_date"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground",
                        errors.expense_date && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.expense_date && <p className="text-sm text-destructive mt-1">{errors.expense_date.message}</p>}
          </div>

          {/* Pilih Platform */}
          <div>
            <Label htmlFor="platform_id">Pilih Platform *</Label>
            <Controller
              name="platform_id"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedPlatform(value);
                  }}
                  value={field.value}
                  disabled={platformsLoading}
                >
                  <SelectTrigger className={cn(errors.platform_id && "border-destructive")}>
                    <SelectValue placeholder="Pilih platform..." />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.platform_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.platform_id && <p className="text-sm text-destructive mt-1">{errors.platform_id.message}</p>}
          </div>

          {/* Pilih Toko (Opsional) */}
          <div>
            <Label htmlFor="store_id">Pilih Toko (Opsional)</Label>
            <Controller
              name="store_id"
              control={control}
              render={({ field }) => (
                 <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!platformId || storesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih toko jika ada..." />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.store_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Kolom Kanan */}
        <div className="space-y-4">
          {/* Biaya Iklan */}
          <div>
            <Label htmlFor="amount">Biaya Iklan *</Label>
            <Controller
                name="amount"
                control={control}
                render={({ field: { onChange, value, ...rest } }) => (
                    <Input
                        {...rest}
                        placeholder="Rp 100.000"
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/[^0-9]/g, '');
                            const numberValue = parseInt(rawValue, 10);
                            
                            if (!isNaN(numberValue)) {
                                onChange(numberValue); // Simpan sebagai angka
                            } else {
                                onChange(0);
                            }
                        }}
                        // Tampilkan nilai yang diformat
                        value={new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        }).format(value || 0)}
                        className={cn(errors.amount && "border-destructive")}
                    />
                )}
            />
            {errors.amount && <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>}
          </div>

          {/* Keterangan */}
          <div>
            <Label htmlFor="notes">Keterangan</Label>
            <Textarea
              {...register('notes')}
              placeholder="Contoh: Iklan produk gamis di Shopee Live"
              className="min-h-[128px]"
            />
          </div>
        </div>
      </div>

      {/* Tombol Aksi */}
      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={createAdExpense.isPending}>
          {createAdExpense.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Biaya Iklan
        </Button>
      </div>
    </form>
  );
};