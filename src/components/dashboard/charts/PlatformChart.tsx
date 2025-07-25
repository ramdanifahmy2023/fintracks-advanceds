
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';

interface PlatformChartProps {
  data: any[];
  loading?: boolean;
}

export const PlatformChart: React.FC<PlatformChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performa Platform</CardTitle>
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
    platform: item.platform_name || 'Tidak Diketahui',
    revenue: Number(item.total_revenue || 0),
    profit: Number(item.total_profit || 0),
    transactions: Number(item.total_transactions || 0),
    margin: Number(item.profit_margin_percentage || 0)
  })).sort((a, b) => b.revenue - a.revenue) || [];

  if (processedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performa Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Belum ada data platform untuk periode ini</p>
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
        <CardTitle>Performa Platform</CardTitle>
        <p className="text-sm text-muted-foreground">
          Perbandingan omset dan profit antar platform
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="platform" 
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
                name === 'revenue' ? 'Omset' : 'Profit'
              ]}
              labelFormatter={(label) => `Platform: ${label}`}
            />
            <Bar dataKey="revenue" fill="#3b82f6" name="revenue" />
            <Bar dataKey="profit" fill="#10b981" name="profit" />
          </BarChart>
        </ResponsiveContainer>

        {/* Platform Stats Table */}
        <div className="mt-6">
          <h4 className="font-medium mb-3">Detail Platform</h4>
          <div className="space-y-2">
            {processedData.map((platform, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">{platform.platform}</span>
                <div className="text-right text-sm">
                  <div>{formatCurrency(platform.revenue)}</div>
                  <div className="text-muted-foreground">{platform.transactions} transaksi</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
