
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Transaction, useUpdateTransaction, useCreateTransaction } from '@/hooks/useTransactions';
import { usePlatforms } from '@/hooks/usePlatforms';
import { useStores } from '@/hooks/useStores';

interface TransactionEditFormProps {
  transaction: Transaction | null;
  onSuccess: () => void;
}

const DELIVERY_STATUSES = [
  'Selesai',
  'Sedang Dikirim',
  'Batal',
  'Return',
  'Menunggu Konfirmasi'
];

export const TransactionEditForm: React.FC<TransactionEditFormProps> = ({
  transaction,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: platforms } = usePlatforms();
  const { data: stores } = useStores();
  const updateTransaction = useUpdateTransaction();
  const createTransaction = useCreateTransaction();

  const isEditMode = !!transaction;

  const form = useForm({
    defaultValues: {
      order_number: transaction?.order_number || '',
      manual_order_number: transaction?.manual_order_number || '',
      product_name: transaction?.product_name || '',
      sku_reference: transaction?.sku_reference || '',
      platform_id: transaction?.platform_id || '',
      store_id: transaction?.store_id || '',
      quantity: transaction?.quantity || 1,
      cost_price: transaction?.cost_price || 0,
      selling_price: transaction?.selling_price || 0,
      delivery_status: transaction?.delivery_status || 'Menunggu Konfirmasi',
      expedition: transaction?.expedition || '',
      tracking_number: transaction?.tracking_number || '',
      pic_name: transaction?.pic_name || '',
      order_created_at: transaction?.order_created_at 
        ? new Date(transaction.order_created_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]
    }
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Calculate profit
      const profit = data.selling_price - data.cost_price;
      
      const transactionData = {
        ...data,
        profit,
        order_created_at: new Date(data.order_created_at).toISOString()
      };

      if (isEditMode) {
        await updateTransaction.mutateAsync({
          id: transaction.id,
          updates: transactionData
        });
      } else {
        await createTransaction.mutateAsync(transactionData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="order_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Pesanan *</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="manual_order_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Manual</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="product_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Produk *</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku_reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU Reference</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="platform_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Platform *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} required>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih platform" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {platforms?.map((platform) => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.platform_name}
                      </SelectItem>
                    ))}
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
                <FormLabel>Toko *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} required>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih toko" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {stores?.map((store) => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.store_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)} 
                    required 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cost_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Beli *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    step="0.01"
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                    required 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="selling_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Jual *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    step="0.01"
                    {...field} 
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} 
                    required 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="delivery_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status Pengiriman *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} required>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DELIVERY_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expedition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ekspedisi</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tracking_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nomor Resi</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pic_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PIC *</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="order_created_at"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Pesanan *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : isEditMode ? 'Simpan Perubahan' : 'Tambah Transaksi'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
