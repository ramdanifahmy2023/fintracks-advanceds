
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { usePlatforms } from '@/hooks/usePlatforms';
import { useStores } from '@/hooks/useStores';
import { useCreateAdExpense } from '@/hooks/useAdExpenses';

const formSchema = z.object({
  expense_date: z.date({
    required_error: 'Tanggal iklan harus diisi',
  }),
  platform_id: z.string({
    required_error: 'Platform harus dipilih',
  }),
  store_id: z.string().optional(),
  amount: z.number({
    required_error: 'Biaya iklan harus diisi',
  }).min(0, 'Biaya iklan tidak boleh negatif'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const AdExpenseForm = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  
  const { data: platforms, isLoading: isLoadingPlatforms } = usePlatforms();
  const { data: stores, isLoading: isLoadingStores } = useStores(selectedPlatform);
  const createAdExpense = useCreateAdExpense();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      expense_date: new Date(),
      platform_id: '',
      store_id: '',
      amount: 0,
      notes: '',
    },
  });

  const formatCurrency = (value: string) => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, '');
    
    // Format as currency
    if (numericValue === '') return '';
    
    const number = parseInt(numericValue);
    return new Intl.NumberFormat('id-ID').format(number);
  };

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    setAmountInput(formatCurrency(value));
    
    if (numericValue) {
      form.setValue('amount', parseInt(numericValue));
    } else {
      form.setValue('amount', 0);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await createAdExpense.mutateAsync({
        expense_date: format(data.expense_date, 'yyyy-MM-dd'),
        platform_id: data.platform_id,
        store_id: data.store_id || undefined,
        amount: data.amount,
        notes: data.notes || undefined,
      });
      
      // Reset form
      form.reset();
      setAmountInput('');
      setSelectedPlatform('');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Tambah Biaya Iklan</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="expense_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tanggal Iklan</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pilih tanggal</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="platform_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Platform</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedPlatform(value);
                      form.setValue('store_id', '');
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingPlatforms ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : (
                        platforms?.map((platform) => (
                          <SelectItem key={platform.id} value={platform.id}>
                            {platform.platform_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="store_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Toko (Opsional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!selectedPlatform}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih toko" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingStores ? (
                        <SelectItem value="loading" disabled>
                          Loading...
                        </SelectItem>
                      ) : (
                        stores?.map((store) => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.store_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biaya Iklan</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        Rp
                      </span>
                      <Input
                        placeholder="0"
                        value={amountInput}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keterangan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Masukkan keterangan biaya iklan..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={createAdExpense.isPending}
            >
              {createAdExpense.isPending ? 'Menyimpan...' : 'Simpan Biaya Iklan'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
