
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AdExpense, useUpdateAdExpense } from '@/hooks/useAdExpenses';

interface EditAdExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: AdExpense | null;
  platforms: Array<{ id: string; platform_name: string }>;
  stores: Array<{ id: string; store_name: string }>;
}

export const EditAdExpenseModal: React.FC<EditAdExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
  platforms,
  stores
}) => {
  const [formData, setFormData] = useState({
    expense_date: '',
    platform_id: '',
    store_id: '',
    amount: '',
    notes: ''
  });

  const updateMutation = useUpdateAdExpense();

  useEffect(() => {
    if (expense) {
      setFormData({
        expense_date: expense.expense_date,
        platform_id: expense.platform_id,
        store_id: expense.store_id || '',
        amount: expense.amount.toString(),
        notes: expense.notes || ''
      });
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense) return;

    try {
      await updateMutation.mutateAsync({
        id: expense.id,
        expense_date: formData.expense_date,
        platform_id: formData.platform_id,
        store_id: formData.store_id || undefined,
        amount: Number(formData.amount),
        notes: formData.notes || undefined
      });
      onClose();
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleClose = () => {
    setFormData({
      expense_date: '',
      platform_id: '',
      store_id: '',
      amount: '',
      notes: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Ad Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.expense_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.expense_date 
                    ? format(new Date(formData.expense_date), 'dd/MM/yyyy')
                    : 'Select date'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
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
                  className="pointer-events-auto"
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
