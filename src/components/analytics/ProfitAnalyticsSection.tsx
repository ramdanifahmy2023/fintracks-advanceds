
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, AlertCircle } from 'lucide-react';
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

  // Fix: Better data validation and error handling
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

  // Safe number conversion helper
  const safeNumber = (value: any, fallback: number = 0): number => {
    const num = Number(value);
    return isNaN(num) ? fallback : num;
  };

  // Calculate totals for KPIs with error handling
  let totalRevenue = 0;
  let totalGrossProfit = 0;
  let totalAdCost = 0;
  let totalNetProfit = 0;

  try {
    totalRevenue = data.storeSummaryProfit.reduce((sum, store) => sum + safeNumber(store.total_revenue), 0);
    totalGrossProfit = data.storeSummaryProfit.reduce((sum, store) => sum + safeNumber(store.gross_profit), 0);
    totalAdCost = data.storeSummaryProfit.reduce((sum, store) => sum + safeNumber(store.total_ad_cost), 0);
    totalNetProfit = data.storeSummaryProfit.reduce((sum, store) => sum + safeNumber(store.net_profit), 0);
  } catch (error) {
    console.error('Error calculating profit totals:', error);
  }

  const avgProfitMargin = data.storeSummaryProfit.length > 0 
    ? data.storeSummaryProfit.reduce((sum, store) => sum + safeNumber(store.overall_profit_margin), 0) / data.storeSummaryProfit.length 
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
      title: 'Gross Profit',
      value: formatCurrency(totalGrossProfit),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Biaya Iklan',
      value: formatCurrency(totalAdCost),
      icon: Target,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      alert: totalAdCost > 0
    },
    {
      title: 'Net Profit',
      value: formatCurrency(totalNetProfit),
      icon: BarChart3,
      color: totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: totalNetProfit >= 0 ? 'bg-green-50' : 'bg-red-50'
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
                    {kpi.alert && <AlertCircle className="h-3 w-3 inline-block ml-1 text-orange-500" />}
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
                    <TableHead>Revenue</TableHead>
                    <TableHead>Gross Profit</TableHead>
                    <TableHead className="text-red-600">Biaya Iklan</TableHead>
                    <TableHead>Net Profit</TableHead>
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
                        {formatCurrency(safeNumber(store.total_revenue))}
                      </TableCell>
                      <TableCell className="text-green-600">
                        {formatCurrency(safeNumber(store.gross_profit))}
                      </TableCell>
                      <TableCell className="text-red-600 font-medium">
                        {safeNumber(store.total_ad_cost) > 0 ? (
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            -{formatCurrency(safeNumber(store.total_ad_cost))}
                          </span>
                        ) : (
                          <span className="text-gray-400">Rp 0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {safeNumber(store.net_profit) >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className={safeNumber(store.net_profit) >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                            {formatCurrency(safeNumber(store.net_profit))}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={safeNumber(store.overall_profit_margin) >= 0 ? 'default' : 'destructive'}
                        >
                          {safeNumber(store.overall_profit_margin).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{safeNumber(store.total_completed_orders)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={safeNumber(store.net_profit) >= 0 ? 'default' : 'secondary'}
                          className={safeNumber(store.net_profit) >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {safeNumber(store.net_profit) >= 0 ? 'Profit' : 'Loss'}
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
                  <p className="font-medium text-lg text-blue-600">
                    {formatCurrency(totalRevenue)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Gross Profit:</span>
                  <p className="font-medium text-lg text-green-600">
                    {formatCurrency(totalGrossProfit)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Biaya Iklan:</span>
                  <p className="font-medium text-lg text-red-600">
                    -{formatCurrency(totalAdCost)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Net Profit:</span>
                  <p className={`font-medium text-lg ${totalNetProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalNetProfit)}
                  </p>
                </div>
              </div>
              
              {totalAdCost > 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      Biaya iklan sebesar {formatCurrency(totalAdCost)} telah diperhitungkan dalam net profit
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
