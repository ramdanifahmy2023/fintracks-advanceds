
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency, formatNumber } from '@/lib/formatters';
import { Smartphone, TrendingUp, Package } from 'lucide-react';
import { useState } from 'react';

interface PlatformChartProps {
  data: Array<{
    platform_name: string;
    total_revenue: number;
    total_profit: number;
    total_transactions: number;
    completion_rate_percentage: number;
    profit_margin_percentage: number;
    avg_transaction_value: number;
    total_packages: number;
    active_days: number;
    total_stores: number;
    completed_revenue: number;
    completed_profit: number;
    platform_id: string;
  }>;
  loading?: boolean;
  onPlatformClick?: (platformId: string) => void;
}

const PLATFORM_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  '#8b5cf6',
  '#f59e0b',
  '#10b981',
  '#3b82f6'
];

export const PlatformChart = ({ data, loading, onPlatformClick }: PlatformChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Performa Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted animate-pulse rounded-lg flex items-center justify-center">
            <div className="text-muted-foreground">Loading platform data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort platforms by revenue for better visualization
  const sortedData = [...data]
    .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))
    .map((item, index) => ({
      ...item,
      color: PLATFORM_COLORS[index % PLATFORM_COLORS.length]
    }));

  if (sortedData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Performa Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground bg-muted/30 rounded-lg border-2 border-dashed border-muted">
            <div className="text-center">
              <Smartphone className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p className="text-lg font-medium">Belum ada data platform</p>
              <p className="text-sm">Data akan muncul setelah upload transaksi</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topPlatform = sortedData[0];
  const totalRevenue = sortedData.reduce((sum, item) => sum + (item.total_revenue || 0), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Performa Platform
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Top: {topPlatform?.platform_name}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Perbandingan revenue dan profit antar platform
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={sortedData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--muted-foreground))" 
                opacity={0.3}
              />
              <XAxis 
                dataKey="platform_name" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                angle={-45}
                textAnchor="end"
                height={80}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => formatCurrency(value)}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const platformShare = totalRevenue > 0 ? ((data.total_revenue / totalRevenue) * 100) : 0;
                    
                    return (
                      <div className="bg-background/95 backdrop-blur-sm p-4 border rounded-lg shadow-lg border-border min-w-[280px]">
                        <div className="flex items-center gap-2 mb-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: data.color }}
                          />
                          <p className="font-medium text-foreground">{label}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="space-y-2">
                            <div>
                              <span className="text-muted-foreground">Revenue:</span>
                              <div className="font-medium text-foreground">
                                {formatCurrency(data.total_revenue || 0)}
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-muted-foreground">Profit:</span>
                              <div className="font-medium text-success">
                                {formatCurrency(data.total_profit || 0)}
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-muted-foreground">Transaksi:</span>
                              <div className="font-medium text-foreground">
                                {formatNumber(data.total_transactions || 0)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <span className="text-muted-foreground">Market Share:</span>
                              <div className="font-medium text-foreground">
                                {platformShare.toFixed(1)}%
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-muted-foreground">Completion:</span>
                              <div className="font-medium text-foreground">
                                {(data.completion_rate_percentage || 0).toFixed(1)}%
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-muted-foreground">Avg Order:</span>
                              <div className="font-medium text-foreground">
                                {formatCurrency(data.avg_transaction_value || 0)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {data.total_revenue > 0 && (
                          <div className="flex items-center justify-between pt-3 mt-3 border-t border-border">
                            <span className="text-sm text-muted-foreground">Profit Margin:</span>
                            <span className="font-medium text-foreground">
                              {((data.total_profit / data.total_revenue) * 100).toFixed(1)}%
                            </span>
                          </div>
                        )}
                        
                        <div className="mt-2 text-xs text-muted-foreground">
                          Click untuk filter data platform
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="total_revenue" 
                name="Revenue"
                radius={[4, 4, 0, 0]}
                onClick={(data, index) => {
                  if (onPlatformClick && data?.payload?.platform_id) {
                    onPlatformClick(data.payload.platform_id);
                  }
                }}
                style={{ cursor: onPlatformClick ? 'pointer' : 'default' }}
              >
                {sortedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Platform Legend */}
        <div className="mt-4 flex flex-wrap gap-2">
          {sortedData.slice(0, 6).map((platform, index) => (
            <div 
              key={platform.platform_name} 
              className="flex items-center gap-2 text-xs px-2 py-1 bg-muted/50 rounded-full"
            >
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: platform.color }}
              />
              <span className="text-muted-foreground">{platform.platform_name}</span>
              <span className="font-medium">{formatCurrency(platform.total_revenue)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
