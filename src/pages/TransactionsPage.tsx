
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TransactionFilters, useTransactions, useTransactionSummary } from '@/hooks/useTransactions';
import { TransactionSummaryCards } from '@/components/transactions/TransactionSummaryCards';
import { TransactionFilters as TransactionFiltersComponent } from '@/components/transactions/TransactionFilters';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { useAuth } from '@/contexts/AuthContext';

const TransactionsPage = () => {
  const { userRole } = useAuth();
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const { data: transactionData, isLoading: isTransactionsLoading } = useTransactions(
    filters,
    currentPage,
    pageSize
  );

  const { data: summary, isLoading: isSummaryLoading } = useTransactionSummary(filters);

  const transactions = transactionData?.transactions || [];
  const totalCount = transactionData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleEdit = (transaction: any) => {
    // This will be handled by the TransactionTable component
  };

  const canCreateTransaction = userRole === 'super_admin' || userRole === 'admin';
  const canEditTransaction = userRole === 'super_admin' || userRole === 'admin';

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Transaksi</h1>
          <p className="text-muted-foreground">
            Kelola dan pantau semua transaksi dari upload CSV dan input manual
          </p>
        </div>
        {canCreateTransaction && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Transaksi
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <TransactionSummaryCards
        summary={summary || {
          total_transactions: 0,
          completed_orders: 0,
          cancelled_orders: 0,
          returned_orders: 0,
          shipping_orders: 0,
          pending_orders: 0
        }}
        isLoading={isSummaryLoading}
      />

      {/* Filters */}
      <TransactionFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Transaction Table */}
      <TransactionTable
        transactions={transactions}
        isLoading={isTransactionsLoading}
        onEdit={handleEdit}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      onClick={() => setCurrentPage(pageNumber)}
                      isActive={currentPage === pageNumber}
                      className="cursor-pointer"
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Page Info */}
      <div className="text-center text-sm text-muted-foreground">
        Menampilkan {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} dari {totalCount} transaksi
      </div>
    </div>
  );
};

export default TransactionsPage;
