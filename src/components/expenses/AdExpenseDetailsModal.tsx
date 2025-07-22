
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Building, FileText, Clock } from 'lucide-react';
import { AdExpense } from '@/hooks/useAdExpenses';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';

interface AdExpenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: AdExpense | null;
  onEdit: () => void;
}

export const AdExpenseDetailsModal: React.FC<AdExpenseDetailsModalProps> = ({
  isOpen,
  onClose,
  expense,
  onEdit
}) => {
  if (!expense) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ad Expense Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Amount - Featured */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(expense.amount)}
            </p>
          </div>

          {/* Main Details */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-muted-foreground">Expense Date</p>
                <p className="font-medium">
                  {format(new Date(expense.expense_date), 'EEEE, dd MMMM yyyy')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-muted-foreground">Platform</p>
                <Badge variant="outline" className="mt-1">
                  {expense.platform?.platform_name || 'Unknown Platform'}
                </Badge>
              </div>
            </div>

            {expense.store?.store_name && (
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-muted-foreground">Store</p>
                  <Badge variant="secondary" className="mt-1">
                    {expense.store.store_name}
                  </Badge>
                </div>
              </div>
            )}

            {expense.notes && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm bg-gray-50 p-3 rounded-md">
                    {expense.notes}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                Created on {format(new Date(expense.created_at), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onEdit}>
              Edit Expense
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
