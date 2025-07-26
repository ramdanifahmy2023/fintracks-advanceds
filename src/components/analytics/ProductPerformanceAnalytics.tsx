
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Package, TrendingUp, BarChart3, Star } from 'lucide-react';
import { useProductAnalytics } from '@/hooks/useAnalytics';
import { formatCurrency } from '@/lib/formatters';

interface ProductAnalyticsProps {
  timeframe: string;
}

export const ProductPerformanceAnalytics = ({ timeframe }: ProductAnalyticsProps) => {
  const { data: productData, isLoading, error } = useProductAnalytics(timeframe);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'revenue' | 'profit' | 'units' | 'margin'>('revenue');
  const [showTopOnly, setShowTopOnly] = useState<'25' | '50' | '100' | 'all'>('25');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2 text-primary" />
            Analisis Performa Produk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-4" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2 text-primary" />
            Analisis Performa Produk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            <p className="font-medium">Kesalahan memuat data analisis produk</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : 'Gagal memuat data produk'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredData = productData?.filter(product => 
    product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return (b.revenue || 0) - (a.revenue || 0);
      case 'profit':
        return (b.profit || 0) - (a.profit || 0);
      case 'units':
        return (b.units_sold || 0) - (a.units_sold || 0);
      case 'margin':
        return (b.margin || 0) - (a.margin || 0);
      default:
        return 0;
    }
  });

  const displayData = showTopOnly === 'all' 
    ? sortedData 
    : sortedData.slice(0, parseInt(showTopOnly));

  const totalRevenue = filteredData.reduce((sum, p) => sum + (p.revenue || 0), 0);
  const totalUnits = filteredData.reduce((sum, p) => sum + (p.units_sold || 0), 0);
  const avgMargin = filteredData.length > 0 
    ? filteredData.reduce((sum, p) => sum + (p.margin || 0), 0) / filteredData.length 
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="h-5 w-5 mr-2 text-primary" />
          Analisis Performa Produk
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Omset</SelectItem>
              <SelectItem value="profit">Profit</SelectItem>
              <SelectItem value="units">Unit Terjual</SelectItem>
              <SelectItem value="margin">Margin %</SelectItem>
            </SelectContent>
          </Select>
          <Select value={showTopOnly} onValueChange={(value) => setShowTopOnly(value as any)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">Teratas 25</SelectItem>
              <SelectItem value="50">Teratas 50</SelectItem>
              <SelectItem value="100">Teratas 100</SelectItem>
              <SelectItem value="all">Semua</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Produk</p>
                  <p className="text-xl font-bold">{filteredData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Omset</p>
                  <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Unit Terjual</p>
                  <p className="text-xl font-bold">{totalUnits.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Rata-rata Margin</p>
                  <p className="text-xl font-bold">{avgMargin.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead>Omset</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Harga Rata-rata</TableHead>
                <TableHead>Transaksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((product, index) => (
                <TableRow key={product.product_name}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">
                        {product.product_name.length > 30 
                          ? product.product_name.substring(0, 30) + '...' 
                          : product.product_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    {formatCurrency(product.revenue || 0)}
                  </TableCell>
                  <TableCell className="font-medium text-blue-600">
                    {formatCurrency(product.profit || 0)}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{product.units_sold || 0}</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={(product.margin || 0) > 20 ? 'default' : 'secondary'}
                      className={(product.margin || 0) > 20 ? 'bg-green-100 text-green-800' : ''}
                    >
                      {(product.margin || 0).toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(product.avg_price || 0)}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {product.transactions || 0}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Show more button */}
        {showTopOnly !== 'all' && sortedData.length > parseInt(showTopOnly) && (
          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => setShowTopOnly('all')}
            >
              Tampilkan Semua {sortedData.length} Produk
            </Button>
          </div>
        )}

        {/* Data Summary */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Ringkasan Data (Periode {timeframe})</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Produk Teratas:</span>
              <p className="font-medium">{displayData[0]?.product_name || 'N/A'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Margin Terbaik:</span>
              <p className="font-medium">
                {Math.max(...displayData.map(p => p.margin || 0)).toFixed(1)}%
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Kategori:</span>
              <p className="font-medium">{filteredData.length} produk</p>
            </div>
            <div>
              <span className="text-muted-foreground">Filter:</span>
              <p className="font-medium">
                {showTopOnly === 'all' ? 'Semua' : `${showTopOnly} Teratas`}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
