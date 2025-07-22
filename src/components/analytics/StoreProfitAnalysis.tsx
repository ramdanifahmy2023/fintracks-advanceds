
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { StoreSummaryProfit } from '@/types/analytics';
import { formatCurrency } from '@/lib/formatters';

interface StoreProfitAnalysisProps {
  data: StoreSummaryProfit[];
  loading?: boolean;
}

export const StoreProfitAnalysis: React.FC<StoreProfitAnalysisProps> = ({
  data,
  loading
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analisis Profit per Toko</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Loading analisis profit...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Analisis Profit Bersih per Toko
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Tidak ada data profit dalam periode ini. Coba ubah filter tanggal.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Analisis Profit Bersih per Toko
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Toko</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Biaya Iklan</TableHead>
                <TableHead>Profit Bersih</TableHead>
                <TableHead>Margin (%)</TableHead>
                <TableHead>Order Selesai</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((store) => (
                <TableRow key={store.store_id}>
                  <TableCell className="font-medium">
                    {store.store_name}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(store.total_revenue)}
                  </TableCell>
                  <TableCell className="text-red-600">
                    -{formatCurrency(store.total_ad_cost)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {store.net_profit >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={store.net_profit >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        {formatCurrency(store.net_profit)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={store.overall_profit_margin >= 0 ? 'default' : 'destructive'}
                    >
                      {store.overall_profit_margin.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{store.total_completed_orders}</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={store.net_profit >= 0 ? 'default' : 'secondary'}
                      className={store.net_profit >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                    >
                      {store.net_profit >= 0 ? 'Profit' : 'Loss'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">Ringkasan Total</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Revenue:</span>
              <p className="font-medium text-lg">
                {formatCurrency(data.reduce((sum, store) => sum + store.total_revenue, 0))}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Biaya Iklan:</span>
              <p className="font-medium text-lg text-red-600">
                -{formatCurrency(data.reduce((sum, store) => sum + store.total_ad_cost, 0))}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Profit Bersih:</span>
              <p className="font-medium text-lg text-green-600">
                {formatCurrency(data.reduce((sum, store) => sum + store.net_profit, 0))}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Rata-rata Margin:</span>
              <p className="font-medium text-lg">
                {(data.reduce((sum, store) => sum + store.overall_profit_margin, 0) / data.length).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
