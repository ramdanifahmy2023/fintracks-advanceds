import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/formatters';
import { format } from 'date-fns';
import { RecentTransaction } from '@/hooks/useFinancialDashboard';
import { TrendingUp, TrendingDown, Calendar, Tag, CreditCard } from 'lucide-react';

interface RecentTransactionsTableProps {
  transactions: RecentTransaction[];
  loading: boolean;
}

export const RecentTransactionsTable: React.FC<RecentTransactionsTableProps> = ({
  transactions,
  loading,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTypeIcon = (type: 'income' | 'expense') => {
    return type === 'income' ? TrendingUp : TrendingDown;
  };

  const getTypeColor = (type: 'income' | 'expense') => {
    return type === 'income' ? 'text-success' : 'text-destructive';
  };

  const getChannelIcon = (channel: string) => {
    switch (channel.toLowerCase()) {
      case 'shopee':
      case 'tokopedia':
      case 'lazada':
        return CreditCard;
      case 'offline':
        return Tag;
      default:
        return CreditCard;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Transaksi Terbaru
        </CardTitle>
        <CardDescription>
          {transactions.length > 0 ? 
            `${transactions.length} transaksi terakhir` : 
            'Tidak ada transaksi dalam periode yang dipilih'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="space-y-4">
            {/* Mobile View */}
            <div className="block md:hidden space-y-4">
              {transactions.map((transaction) => {
                const TypeIcon = getTypeIcon(transaction.type);
                const ChannelIcon = getChannelIcon(transaction.channel);
                
                return (
                  <div key={transaction.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'
                        }`}>
                          <TypeIcon className={`h-4 w-4 ${getTypeColor(transaction.type)}`} />
                        </div>
                        <div>
                          <p className="font-medium truncate max-w-48">
                            {transaction.description}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ChannelIcon className="h-3 w-3" />
                            <span className="capitalize">{transaction.channel}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${getTypeColor(transaction.type)}`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.transaction_date), 'dd MMM yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {transaction.category}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Jenis</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => {
                    const TypeIcon = getTypeIcon(transaction.type);
                    const ChannelIcon = getChannelIcon(transaction.channel);
                    
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(new Date(transaction.transaction_date), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-48 truncate font-medium">
                            {transaction.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {transaction.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ChannelIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">{transaction.channel}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <TypeIcon className={`h-4 w-4 ${getTypeColor(transaction.type)}`} />
                            <span className="capitalize">
                              {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-medium ${getTypeColor(transaction.type)}`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Tidak ada transaksi</p>
            <p className="text-sm">Belum ada transaksi dalam periode yang dipilih</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};