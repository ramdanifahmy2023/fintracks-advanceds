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
import { TablesInsert } from '@/integrations/supabase/types';

// Skema validasi menggunakan Zod
const adExpenseSchema = z.object({
  expense_date: z.date({
    required_error: 'Tanggal iklan harus diisi.',
  }),
  platform_id: z.string().min(1, 'Platform harus dipilih.'),
  store_id: z.string().optional(),
  amount: z.preprocess(
    (val) => (typeof val === 'string' ? parseInt(val.replace(/[^0-9]/g, ''), 10) || 0 : val),
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

  // PERBAIKAN: Fungsi onSubmit diubah untuk membuat payload yang benar
  const onSubmit = async (data: AdExpenseFormValues) => {
    if (!user) {
      toast.error('Anda harus login untuk menambahkan data.');
      return;
    }

    // Membuat payload yang sesuai dengan tipe `ad_expenses` di database
    const payload: TablesInsert<'ad_expenses'> = {
      expense_date: format(data.expense_date, 'yyyy-MM-dd'),
      platform_id: data.platform_id,
      store_id: data.store_id || null,
      amount: data.amount,
      notes: data.notes || null,
      created_by: user.id,
    };

    await createAdExpense.mutateAsync(payload, {
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
            <Label>Tanggal Iklan *</Label>
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
            <Label>Pilih Platform *</Label>
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
            <Label>Pilih Toko (Opsional)</Label>
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
            <Label>Biaya Iklan *</Label>
            <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                    <Input
                        placeholder="Rp 0"
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/[^0-9]/g, '');
                            const numberValue = parseInt(rawValue, 10);
                            field.onChange(isNaN(numberValue) ? 0 : numberValue);
                        }}
                        value={new Intl.NumberFormat('id-ID').format(field.value || 0)}
                        className={cn(errors.amount && "border-destructive", "pl-8")}
                    />
                )}
            />
            {errors.amount && <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>}
          </div>

          {/* Keterangan */}
          <div>
            <Label>Keterangan</Label>
            {/* PERBAIKAN: Menggunakan Controller untuk konsistensi */}
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  value={field.value ?? ''} // Pastikan nilai tidak pernah undefined
                  placeholder="Contoh: Iklan produk gamis di Shopee Live"
                  className="min-h-[128px]"
                />
              )}
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