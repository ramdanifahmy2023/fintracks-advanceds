
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { AdExpense, useDeleteAdExpense } from '@/hooks/useAdExpenses';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';

interface DeleteAdExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: AdExpense | null;
}

export const DeleteAdExpenseModal: React.FC<DeleteAdExpenseModalProps> = ({
  isOpen,
  onClose,
  expense
}) => {
  const deleteMutation = useDeleteAdExpense();

  const handleDelete = async () => {
    if (!expense) return;

    try {
      await deleteMutation.mutateAsync(expense.id);
      onClose();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete Ad Expense
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the ad expense record.
          </DialogDescription>
        </DialogHeader>
        
        {expense && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Expense Details:</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Date:</span> {format(new Date(expense.expense_date), 'dd/MM/yyyy')}</p>
              <p><span className="font-medium">Platform:</span> {expense.platform?.platform_name || 'Unknown'}</p>
              <p><span className="font-medium">Amount:</span> {formatCurrency(expense.amount)}</p>
              {expense.store?.store_name && (
                <p><span className="font-medium">Store:</span> {expense.store.store_name}</p>
              )}
              {expense.notes && (
                <p><span className="font-medium">Notes:</span> {expense.notes}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Expense'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
