
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3 } from 'lucide-react';
import { ProfitAnalyticsData } from '@/types/analytics';
import { formatCurrency } from '@/lib/formatters';

interface ProfitAnalyticsSectionProps {
  data: ProfitAnalyticsData;
  loading?: boolean;
  showKPIs?: boolean;
  showTable?: boolean;
  title?: string;
}

export const ProfitAnalyticsSection: React.FC<ProfitAnalyticsSectionProps> = ({
  data,
  loading,
  showKPIs = true,
  showTable = true,
  title = "Analisis Profit"
}) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {showKPIs && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {showTable && (
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  if (!data || !data.storeSummaryProfit || data.storeSummaryProfit.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {title}
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

  // Calculate totals for KPIs
  const totalRevenue = data.storeSummaryProfit.reduce((sum, store) => sum + Number(store.total_revenue || 0), 0);
  const totalNetProfit = data.storeSummaryProfit.reduce((sum, store) => sum + Number(store.net_profit || 0), 0);
  const totalAdCost = data.storeSummaryProfit.reduce((sum, store) => sum + Number(store.total_ad_cost || 0), 0);
  const avgProfitMargin = data.storeSummaryProfit.length > 0 
    ? data.storeSummaryProfit.reduce((sum, store) => sum + Number(store.overall_profit_margin || 0), 0) / data.storeSummaryProfit.length 
    : 0;

  const kpis = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Net Profit',
      value: formatCurrency(totalNetProfit),
      icon: TrendingUp,
      color: totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: totalNetProfit >= 0 ? 'bg-green-50' : 'bg-red-50'
    },
    {
      title: 'Total Biaya Iklan',
      value: formatCurrency(totalAdCost),
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Rata-rata Margin',
      value: `${avgProfitMargin.toFixed(1)}%`,
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-6">
      {showKPIs && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </CardTitle>
                  <div className={`p-2 rounded-full ${kpi.bgColor}`}>
                    <Icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${kpi.color}`}>
                    {kpi.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showTable && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {title} per Toko
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
                  {data.storeSummaryProfit.map((store) => (
                    <TableRow key={store.store_id}>
                      <TableCell className="font-medium">
                        {store.store_name}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(Number(store.total_revenue || 0))}
                      </TableCell>
                      <TableCell className="text-red-600">
                        -{formatCurrency(Number(store.total_ad_cost || 0))}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {Number(store.net_profit || 0) >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className={Number(store.net_profit || 0) >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {formatCurrency(Number(store.net_profit || 0))}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={Number(store.overall_profit_margin || 0) >= 0 ? 'default' : 'destructive'}
                        >
                          {Number(store.overall_profit_margin || 0).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{Number(store.total_completed_orders || 0)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={Number(store.net_profit || 0) >= 0 ? 'default' : 'secondary'}
                          className={Number(store.net_profit || 0) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {Number(store.net_profit || 0) >= 0 ? 'Profit' : 'Loss'}
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
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Biaya Iklan:</span>
                  <p className="font-medium text-lg text-red-600">
                    -{formatCurrency(totalAdCost)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Profit Bersih:</span>
                  <p className="font-medium text-lg text-green-600">
                    {formatCurrency(totalNetProfit)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Rata-rata Margin:</span>
                  <p className="font-medium text-lg">
                    {avgProfitMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
