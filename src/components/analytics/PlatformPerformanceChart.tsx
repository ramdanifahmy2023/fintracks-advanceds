
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart3, Eye, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePlatformPerformance } from '@/hooks/useAnalytics';
import { formatCurrency } from '@/lib/formatters';

interface PlatformChartProps {
  timeframe: string;
  platforms: string[];
  onChartClick: (data: any) => void;
}

export const PlatformPerformanceChart = ({ 
  timeframe, 
  platforms, 
  onChartClick 
}: PlatformChartProps) => {
  const { data: platformData, isLoading, error } = usePlatformPerformance(timeframe, platforms);
  const [sortBy, setSortBy] = useState<'revenue' | 'profit' | 'margin' | 'transactions'>('revenue');
  const [showDetails, setShowDetails] = useState(false);

  const sortedData = useMemo(() => {
    if (!platformData || !Array.isArray(platformData)) return [];
    
    try {
      // Create a safe copy before sorting
      return [...platformData].sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0));
    } catch (error) {
      console.error('Error sorting platform data:', error);
      return platformData;
    }
  }, [platformData, sortBy]);

  const topPerformer = useMemo(() => {
    return sortedData[0]?.platform_name || 'N/A';
  }, [sortedData]);

  const bestMarginPlatform = useMemo(() => {
    if (!sortedData || sortedData.length === 0) return 'N/A';
    
    try {
      const marginSorted = [...sortedData].sort((a, b) => (b.margin || 0) - (a.margin || 0));
      return marginSorted[0]?.platform_name || 'N/A';
    } catch (error) {
      console.error('Error calculating best margin platform:', error);
      return 'N/A';
    }
  }, [sortedData]);

  const mostActivePlatform = useMemo(() => {
    if (!sortedData || sortedData.length === 0) return 'N/A';
    
    try {
      const transactionsSorted = [...sortedData].sort((a, b) => (b.transactions || 0) - (a.transactions || 0));
      return transactionsSorted[0]?.platform_name || 'N/A';
    } catch (error) {
      console.error('Error calculating most active platform:', error);
      return 'N/A';
    }
  }, [sortedData]);

  const growthLeader = useMemo(() => {
    if (!sortedData || sortedData.length === 0) return 'N/A';
    
    try {
      const growthSorted = [...sortedData].sort((a, b) => (b.growth_rate || 0) - (a.growth_rate || 0));
      return growthSorted[0]?.platform_name || 'N/A';
    } catch (error) {
      console.error('Error calculating growth leader:', error);
      return 'N/A';
    }
  }, [sortedData]);

  const handleBarClick = (data: any) => {
    console.log('Platform bar clicked:', data);
    onChartClick({
      type: 'platform-detail',
      platform: data.platform_name,
      metrics: data,
      timeframe
    });
  };

  const PlatformTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-4 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Omset:</span>
              <span className="font-medium text-green-600">{formatCurrency(data.revenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Profit:</span>
              <span className="font-medium text-blue-600">{formatCurrency(data.profit)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Margin:</span>
              <span className="font-medium text-purple-600">{(data.margin || 0).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Transaksi:</span>
              <span className="font-medium text-orange-600">{data.transactions || 0}</span>
            </div>
            {data.growth_rate !== undefined && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pertumbuhan:</span>
                <span className={`font-medium ${(data.growth_rate || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(data.growth_rate || 0) > 0 ? '+' : ''}{(data.growth_rate || 0).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <div className="mt-2 pt-2 border-t">
            <p className="text-xs text-muted-foreground">Klik untuk analisis detail</p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Performa Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-destructive font-medium">Kesalahan memuat data platform</p>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof Error ? error.message : 'Gagal memuat performa platform'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Performa Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-muted-foreground">Memuat data platform...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sortedData || sortedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Performa Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">Tidak ada data platform tersedia</p>
              <p className="text-sm text-muted-foreground mt-1">
                Coba sesuaikan filter atau rentang tanggal Anda
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              Performa Platform
            </CardTitle>
            <CardDescription>
              Analisis perbandingan lintas platform marketplace - Data Real
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Omset</SelectItem>
                <SelectItem value="profit">Profit</SelectItem>
                <SelectItem value="margin">Margin %</SelectItem>
                <SelectItem value="transactions">Transaksi</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Detail
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={sortedData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              tickFormatter={(value) => 
                sortBy === 'margin' ? `${value}%` : 
                sortBy === 'transactions' ? value.toLocaleString() :
                formatCurrency(value)
              }
            />
            <YAxis type="category" dataKey="platform_name" width={100} />
            <Tooltip 
              content={<PlatformTooltip />}
              cursor={{ fill: 'hsl(var(--primary)/0.1)' }}
            />
            <Bar 
              dataKey={sortBy} 
              fill="hsl(var(--primary))"
              radius={[0, 4, 4, 0]}
              onClick={handleBarClick}
              className="cursor-pointer hover:opacity-80"
            />
          </BarChart>
        </ResponsiveContainer>
        
        {showDetails && (
          <div className="mt-4 space-y-3">
            <h4 className="font-medium">Detail Platform (Data Real)</h4>
            {sortedData.map((platform, index) => (
              <div key={platform.platform_name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{platform.platform_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {platform.transactions || 0} transaksi • {(platform.margin || 0).toFixed(1)}% margin
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    {formatCurrency(platform.revenue || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Profit: {formatCurrency(platform.profit || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Performance Summary */}
        <div className="mt-4 p-4 bg-primary/5 rounded-lg">
          <h4 className="font-medium text-primary mb-2">Ringkasan Performa (Data Real)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Performa Teratas:</span>
              <span className="ml-2 font-medium">{topPerformer}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Margin Terbaik:</span>
              <span className="ml-2 font-medium">{bestMarginPlatform}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Paling Aktif:</span>
              <span className="ml-2 font-medium">{mostActivePlatform}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Pemimpin Pertumbuhan:</span>
              <span className="ml-2 font-medium">{growthLeader}</span>
            </div>
          </div>
          
          {/* Real Data Summary */}
          <div className="mt-3 pt-3 border-t">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs text-muted-foreground">
              <div>Total Platform: {sortedData.length}</div>
              <div>Total Omset: {formatCurrency(sortedData.reduce((sum, p) => sum + (p.revenue || 0), 0))}</div>
              <div>Total Transaksi: {sortedData.reduce((sum, p) => sum + (p.transactions || 0), 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Debug Info - Remove in production */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h5 className="text-xs font-medium text-blue-900 dark:text-blue-100 mb-1">Info Sumber Data:</h5>
          <div className="text-xs text-blue-800 dark:text-blue-200 grid grid-cols-2 gap-2">
            <div>Platform Ditemukan: {sortedData.length}</div>
            <div>Filter Platform: {platforms.length > 0 ? `${platforms.length} dipilih` : 'Semua platform'}</div>
            <div>Rentang Waktu: {timeframe}</div>
            <div>Diurutkan berdasarkan: {sortBy}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
