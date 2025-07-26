
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTrendAnalysis } from '@/hooks/useAnalytics';

interface TrendAnalysisProps {
  timeframe: string;
}

export const TrendAnalysisPanel = ({ timeframe }: TrendAnalysisProps) => {
  const { data: trendData, isLoading } = useTrendAnalysis(timeframe);
  const [selectedTrend, setSelectedTrend] = useState<'revenue' | 'profit' | 'growth'>('revenue');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-muted-foreground" />
            Analisis Tren
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-20 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTrend = trendData?.[selectedTrend];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2 text-primary" />
          Analisis Tren
        </CardTitle>
        <CardDescription>
          Pengenalan pola dan peramalan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trend Selector */}
        <div className="flex space-x-2">
          {(['revenue', 'profit', 'growth'] as const).map((trend) => (
            <Button
              key={trend}
              variant={selectedTrend === trend ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTrend(trend)}
              className="flex-1"
            >
              {trend === 'revenue' ? 'Omset' : trend === 'profit' ? 'Profit' : 'Pertumbuhan'}
            </Button>
          ))}
        </div>

        {/* Main Trend Indicator */}
        <div className="text-center p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg">
          <div className="text-3xl mb-2">
            {currentTrend?.direction === 'up' ? '📈' : 
             currentTrend?.direction === 'down' ? '📉' : '➡️'}
          </div>
          <p className="text-lg font-semibold">
            {currentTrend?.label || 'Tidak ada data tersedia'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {currentTrend?.description || 'Menganalisis pola tren...'}
          </p>
        </div>

        {/* Trend Metrics */}
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Tren Saat Ini:</span>
            <span className={`font-medium flex items-center ${
              (currentTrend?.percentage || 0) > 0 ? 'text-green-600' : 
              (currentTrend?.percentage || 0) < 0 ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              {(currentTrend?.percentage || 0) > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : 
               (currentTrend?.percentage || 0) < 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : 
               <Minus className="h-3 w-3 mr-1" />}
              {(currentTrend?.percentage || 0) > 0 ? '+' : ''}
              {(currentTrend?.percentage || 0).toFixed(1)}%
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Volatilitas:</span>
            <span className="font-medium">
              {currentTrend?.volatility || 'Rendah'}
            </span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Kepercayaan:</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${currentTrend?.confidence || 0}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {currentTrend?.confidence || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Forecast */}
        {trendData?.forecast && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Perkiraan 30 Hari</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {trendData.forecast.summary}
            </p>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-blue-700 dark:text-blue-300">Proyeksi {selectedTrend === 'revenue' ? 'Omset' : selectedTrend === 'profit' ? 'Profit' : 'Pertumbuhan'}:</span>
              <span className="font-medium text-blue-900 dark:text-blue-100">
                {selectedTrend === 'growth' ? 
                  `${trendData.forecast[selectedTrend]?.toFixed(1)}%` :
                  `$${(trendData.forecast[selectedTrend] || 0).toLocaleString()}`
                }
              </span>
            </div>
          </div>
        )}

        {/* Key Patterns */}
        {trendData?.patterns && (
          <div>
            <h4 className="font-medium mb-3">Pola Utama</h4>
            <div className="space-y-2">
              {trendData.patterns.map((pattern: any, index: number) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg">
                    {pattern.type === 'seasonal' ? '📅' :
                     pattern.type === 'growth' ? '📈' :
                     pattern.type === 'cyclical' ? '🔄' : '🎯'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{pattern.title}</p>
                    <p className="text-xs text-muted-foreground">{pattern.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
