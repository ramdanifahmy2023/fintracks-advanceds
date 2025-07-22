
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useCreateAdExpense } from '@/hooks/useAdExpenses';
import { usePlatforms } from '@/hooks/usePlatforms';
import { useStores } from '@/hooks/useStores';

interface AdExpenseFormProps {
  onSuccess?: () => void;
}

export const AdExpenseForm: React.FC<AdExpenseFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    expense_date: new Date().toISOString().split('T')[0],
    platform_id: '',
    store_id: '',
    amount: '',
    notes: ''
  });

  const { data: platforms = [] } = usePlatforms();
  const { data: stores = [] } = useStores();
  const createMutation = useCreateAdExpense();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync({
        expense_date: formData.expense_date,
        platform_id: formData.platform_id,
        store_id: formData.store_id || undefined,
        amount: Number(formData.amount),
        notes: formData.notes || undefined
      });

      // Reset form
      setFormData({
        expense_date: new Date().toISOString().split('T')[0],
        platform_id: '',
        store_id: '',
        amount: '',
        notes: ''
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating expense:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Date *</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.expense_date 
                ? format(new Date(formData.expense_date), 'dd/MM/yyyy')
                : 'Select date'
              }
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.expense_date ? new Date(formData.expense_date) : undefined}
              onSelect={(date) => 
                setFormData(prev => ({ 
                  ...prev, 
                  expense_date: date?.toISOString().split('T')[0] || '' 
                }))
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Platform *</label>
        <Select
          value={formData.platform_id}
          onValueChange={(value) => setFormData(prev => ({ ...prev, platform_id: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            {platforms.map((platform) => (
              <SelectItem key={platform.id} value={platform.id}>
                {platform.platform_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Store (Optional)</label>
        <Select
          value={formData.store_id}
          onValueChange={(value) => setFormData(prev => ({ ...prev, store_id: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select store (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No specific store</SelectItem>
            {stores.map((store) => (
              <SelectItem key={store.id} value={store.id}>
                {store.store_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Amount *</label>
        <Input
          type="number"
          placeholder="Enter amount"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Notes</label>
        <Textarea
          placeholder="Add notes about this expense..."
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? 'Creating...' : 'Create Expense'}
      </Button>
    </form>
  );
};
