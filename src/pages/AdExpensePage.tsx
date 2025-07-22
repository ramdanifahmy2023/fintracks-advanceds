
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AdExpenseForm } from '@/components/expenses/AdExpenseForm';
import { AdExpenseFilters } from '@/components/expenses/AdExpenseFilters';
import { AdExpenseSummaryCards } from '@/components/expenses/AdExpenseSummaryCards';
import { AdExpenseTable } from '@/components/expenses/AdExpenseTable';
import { EditAdExpenseModal } from '@/components/expenses/EditAdExpenseModal';
import { DeleteAdExpenseModal } from '@/components/expenses/DeleteAdExpenseModal';
import { AdExpenseDetailsModal } from '@/components/expenses/AdExpenseDetailsModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAdExpensesWithFilter, AdExpenseFilters as FilterType, AdExpense } from '@/hooks/useAdExpenses';
import { usePlatforms } from '@/hooks/usePlatforms';
import { useStores } from '@/hooks/useStores';
import { subDays } from 'date-fns';

const AdExpensePage = () => {
  // State management
  const [filters, setFilters] = useState<FilterType>({
    dateFrom: subDays(new Date(), 30).toISOString().split('T')[0], // Default: last 30 days
    dateTo: new Date().toISOString().split('T')[0]
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<AdExpense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<AdExpense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<AdExpense | null>(null);

  // Data fetching
  const { data: expensesData, isLoading: expensesLoading } = useAdExpensesWithFilter(filters, currentPage, pageSize);
  const { data: platforms = [] } = usePlatforms();
  const { data: stores = [] } = useStores();

  // Event handlers
  const handleFiltersChange = (newFilters: FilterType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleEdit = (expense: AdExpense) => {
    setEditingExpense(expense);
  };

  const handleDelete = (expense: AdExpense) => {
    setDeletingExpense(expense);
  };

  const handleView = (expense: AdExpense) => {
    setViewingExpense(expense);
  };

  const handleViewEdit = () => {
    setEditingExpense(viewingExpense);
    setViewingExpense(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Biaya Iklan</h1>
          <p className="text-muted-foreground">
            Kelola dan pantau biaya iklan di semua platform dan toko
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Biaya Iklan
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Tambah Biaya Iklan Baru</DialogTitle>
              </DialogHeader>
              <AdExpenseForm onSuccess={() => setIsCreateModalOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <AdExpenseSummaryCards 
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
      />

      {/* Filters */}
      <AdExpenseFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        platforms={platforms}
        stores={stores}
      />

      {/* Main Table */}
      <AdExpenseTable
        expenses={expensesData?.data || []}
        totalCount={expensesData?.count || 0}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        loading={expensesLoading}
      />

      {/* Modals */}
      <EditAdExpenseModal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        expense={editingExpense}
        platforms={platforms}
        stores={stores}
      />

      <DeleteAdExpenseModal
        isOpen={!!deletingExpense}
        onClose={() => setDeletingExpense(null)}
        expense={deletingExpense}
      />

      <AdExpenseDetailsModal
        isOpen={!!viewingExpense}
        onClose={() => setViewingExpense(null)}
        expense={viewingExpense}
        onEdit={handleViewEdit}
      />
    </div>
  );
};

export default AdExpensePage;
