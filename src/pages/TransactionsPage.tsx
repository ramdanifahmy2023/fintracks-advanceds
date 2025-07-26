
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Download } from 'lucide-react';
import { TransactionSummaryCards } from '@/components/transactions/TransactionSummaryCards';
import { TransactionFiltersComponent } from '@/components/transactions/TransactionFilters';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { useTransactions, type TransactionFilters } from '@/hooks/useTransactions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TransactionEditForm } from '@/components/transactions/TransactionEditForm';

const TransactionsPage: React.FC = () => {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const { data, isLoading, error } = useTransactions(filters, page, 50);
  const transactions = data?.transactions || [];
  const totalCount = data?.totalCount || 0;

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleEdit = (transaction: any) => {
    setSelectedTransaction(transaction);
  };

  const handleExport = () => {
    console.log('Export functionality coming soon');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rincian Transaksi</h1>
          <p className="text-muted-foreground mt-2">
            Kelola semua transaksi penjualan dari berbagai platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Transaksi
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <TransactionSummaryCards filters={filters} />

      {/* Filters */}
      <TransactionFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Transactions Table */}
      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        onEdit={handleEdit}
      />

      {/* Pagination */}
      {totalCount > 50 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Menampilkan {((page - 1) * 50) + 1} - {Math.min(page * 50, totalCount)} dari {totalCount} transaksi
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Sebelumnya
            </Button>
            <span className="text-sm">
              Halaman {page} dari {Math.ceil(totalCount / 50)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(totalCount / 50)}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Transaksi Baru</DialogTitle>
          </DialogHeader>
          <TransactionEditForm
            transaction={null}
            onSuccess={() => {
              setShowAddModal(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionsPage;
