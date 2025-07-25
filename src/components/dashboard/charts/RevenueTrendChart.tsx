
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';

interface RevenueTrendChartProps {
  data: any[];
  loading?: boolean;
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tren Penjualan Bulanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-muted-foreground">Memuat grafik...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Process data untuk chart
  const processedData = data?.map(item => ({
    period: item.month_start ? new Date(item.month_start).toLocaleDateString('id-ID', { 
      month: 'short', 
      year: 'numeric' 
    }) : 'N/A',
    revenue: Number(item.revenue || 0),
    profit: Number(item.profit || 0),
    orders: Number(item.total_orders || 0)
  })).sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime()) || [];

  if (processedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tren Penjualan Bulanan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Belum ada data tren untuk periode ini</p>
              <p className="text-sm text-muted-foreground">Data akan muncul setelah ada transaksi dalam periode yang dipilih</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Penjualan Bulanan</CardTitle>
        <p className="text-sm text-muted-foreground">
          Perkembangan omset dan profit dari waktu ke waktu
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="period" 
              fontSize={12}
              tick={{ fill: '#666' }}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: '#666' }}
              tickFormatter={(value) => formatCurrency(value, true)}
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'revenue' ? 'Omset' : name === 'profit' ? 'Profit' : 'Pesanan'
              ]}
              labelFormatter={(label) => `Periode: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="revenue"
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ r: 4 }}
              name="profit"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
