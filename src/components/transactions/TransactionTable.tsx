
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Eye, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { Transaction, useDeleteTransaction } from '@/hooks/useTransactions';
import { TransactionEditForm } from './TransactionEditForm';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  onEdit: (transaction: Transaction) => void;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    'Selesai': { variant: 'default' as const, className: 'bg-green-500' },
    'Sedang Dikirim': { variant: 'secondary' as const, className: 'bg-blue-500' },
    'Batal': { variant: 'destructive' as const, className: 'bg-red-500' },
    'Return': { variant: 'outline' as const, className: 'bg-orange-500' },
    'Menunggu Konfirmasi': { variant: 'outline' as const, className: 'bg-yellow-500' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'outline' as const, className: '' };
  
  return (
    <Badge variant={config.variant} className={config.className}>
      {status}
    </Badge>
  );
};

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  isLoading,
  onEdit
}) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const deleteTransaction = useDeleteTransaction();

  const handleView = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTransaction.mutate(id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rincian Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Rincian Transaksi ({transactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor Pesanan</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Toko</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Harga Beli</TableHead>
                  <TableHead>Harga Jual</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{transaction.order_number}</div>
                        {transaction.manual_order_number && (
                          <div className="text-xs text-muted-foreground">
                            Manual: {transaction.manual_order_number}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={transaction.product_name}>
                        {transaction.product_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {transaction.sku_reference || 'N/A'}
                      </code>
                    </TableCell>
                    <TableCell>{transaction.platform_name}</TableCell>
                    <TableCell>{transaction.store_name}</TableCell>
                    <TableCell className="text-center">{transaction.quantity}</TableCell>
                    <TableCell>{formatCurrency(transaction.cost_price)}</TableCell>
                    <TableCell>{formatCurrency(transaction.selling_price)}</TableCell>
                    <TableCell className={transaction.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(transaction.profit)}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.delivery_status)}</TableCell>
                    <TableCell className="text-sm">
                      {formatDate(transaction.order_created_at)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(transaction)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(transaction.id)}>
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {transactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Tidak ada transaksi yang ditemukan.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nomor Pesanan</label>
                  <p className="text-sm">{selectedTransaction.order_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Nomor Manual</label>
                  <p className="text-sm">{selectedTransaction.manual_order_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Produk</label>
                  <p className="text-sm">{selectedTransaction.product_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">SKU</label>
                  <p className="text-sm">{selectedTransaction.sku_reference || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Platform</label>
                  <p className="text-sm">{selectedTransaction.platform_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Toko</label>
                  <p className="text-sm">{selectedTransaction.store_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Ekspedisi</label>
                  <p className="text-sm">{selectedTransaction.expedition || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Resi</label>
                  <p className="text-sm">{selectedTransaction.tracking_number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">PIC</label>
                  <p className="text-sm">{selectedTransaction.pic_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="pt-1">
                    {getStatusBadge(selectedTransaction.delivery_status)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Tanggal Pesanan</label>
                  <p className="text-sm">{formatDate(selectedTransaction.order_created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <p className="text-sm">{selectedTransaction.quantity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Harga Beli</label>
                  <p className="text-sm">{formatCurrency(selectedTransaction.cost_price)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Harga Jual</label>
                  <p className="text-sm">{formatCurrency(selectedTransaction.selling_price)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Profit</label>
                  <p className={`text-sm ${selectedTransaction.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(selectedTransaction.profit)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Transaksi</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <TransactionEditForm
              transaction={selectedTransaction}
              onSuccess={() => {
                setIsEditModalOpen(false);
                setSelectedTransaction(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
