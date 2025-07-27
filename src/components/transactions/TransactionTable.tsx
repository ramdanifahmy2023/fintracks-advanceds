
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Package } from 'lucide-react';
import { formatNumber, formatDate } from '@/lib/formatters';
import { TransactionLoadingFallback } from './TransactionLoadingFallback';
import { Transaction } from '@/hooks/useTransactions';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  onEdit: (transaction: Transaction) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Selesai':
      return 'bg-green-100 text-green-800';
    case 'Sedang Dikirim':
      return 'bg-blue-100 text-blue-800';
    case 'Batal':
      return 'bg-red-100 text-red-800';
    case 'Return':
      return 'bg-orange-100 text-orange-800';
    case 'Menunggu Konfirmasi':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  isLoading,
  onEdit
}) => {
  if (isLoading) {
    return <TransactionLoadingFallback />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2" />
          Daftar Transaksi ({transactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Belum Ada Transaksi</p>
            <p className="text-muted-foreground">
              Tidak ada transaksi yang sesuai dengan filter yang dipilih
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Pesanan</th>
                  <th className="text-left p-3">Produk</th>
                  <th className="text-left p-3">Platform/Toko</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Qty</th>
                  <th className="text-left p-3">Harga</th>
                  <th className="text-left p-3">Profit</th>
                  <th className="text-left p-3">Tanggal</th>
                  <th className="text-left p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="font-medium">{transaction.order_number}</div>
                      {transaction.manual_order_number && (
                        <div className="text-sm text-muted-foreground">
                          Manual: {transaction.manual_order_number}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{transaction.product_name}</div>
                      {transaction.sku_reference && (
                        <div className="text-sm text-muted-foreground">
                          SKU: {transaction.sku_reference}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{transaction.platform_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.store_name}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusColor(transaction.delivery_status)}>
                        {transaction.delivery_status}
                      </Badge>
                    </td>
                    <td className="p-3">{transaction.quantity}</td>
                    <td className="p-3">
                      <div className="font-medium">
                        Rp {formatNumber(transaction.selling_price)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        HPP: Rp {formatNumber(transaction.cost_price)}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className={`font-medium ${transaction.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Rp {formatNumber(transaction.profit)}
                      </div>
                    </td>
                    <td className="p-3">
                      {formatDate(transaction.order_created_at)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(transaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
