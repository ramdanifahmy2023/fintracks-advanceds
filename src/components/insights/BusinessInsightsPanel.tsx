import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  ChevronDown,
  ArrowRight,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { BusinessInsight } from '@/types/export';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface BusinessInsightsPanelProps {
  data: {
    current: {
      totalRevenue: number;
      totalProfit: number;
      totalTransactions: number;
    };
    previousPeriod?: {
      totalRevenue: number;
      totalProfit: number;
      totalTransactions: number;
    };
    platformPerformance: Array<{
      name: string;
      revenue: number;
      profit: number;
      transactions: number;
    }>;
    productPerformance: Array<{
      revenue: number;
      profit: number;
    }>;
    monthlyTrend?: Array<{
      month: string;
      revenue: number;
      profit: number;
      transactions: number;
    }>;
  };
}

export const BusinessInsightsPanel = ({ data }: BusinessInsightsPanelProps) => {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const insights = useMemo((): BusinessInsight[] => {
    const generatedInsights: BusinessInsight[] = [];
    
    // Revenue Growth Analysis
    if (data.previousPeriod) {
      const growthRate = ((data.current.totalRevenue - data.previousPeriod.totalRevenue) / data.previousPeriod.totalRevenue) * 100;
      
      generatedInsights.push({
        type: 'revenue_growth',
        title: 'Pertumbuhan Revenue',
        description: growthRate > 0 
          ? `Revenue meningkat ${growthRate.toFixed(1)}% dibanding periode sebelumnya`
          : `Revenue turun ${Math.abs(growthRate).toFixed(1)}% dibanding periode sebelumnya`,
        sentiment: growthRate > 10 ? 'positive' : growthRate > 0 ? 'neutral' : 'negative',
        value: growthRate,
        actionable: growthRate < 0,
        recommendations: growthRate < 0 ? [
          'Review strategy marketing untuk platform dengan performa rendah',
          'Fokus pada produk dengan margin profit tinggi',
          'Analisis feedback customer untuk improvement'
        ] : [],
        priority: growthRate < -10 ? 'high' : growthRate < 0 ? 'medium' : 'low'
      });
    }
    
    // Platform Performance Analysis
    const topPlatform = data.platformPerformance[0];
    const worstPlatform = data.platformPerformance[data.platformPerformance.length - 1];
    
    if (topPlatform && worstPlatform && data.platformPerformance.length > 1) {
      const performanceGap = ((topPlatform.revenue - worstPlatform.revenue) / topPlatform.revenue) * 100;
      
      generatedInsights.push({
        type: 'platform_performance',
        title: 'Performa Platform',
        description: `${topPlatform.name} outperform ${worstPlatform.name} sebesar ${performanceGap.toFixed(1)}%`,
        sentiment: 'neutral',
        value: performanceGap,
        actionable: performanceGap > 50,
        recommendations: performanceGap > 50 ? [
          `Terapkan strategi sukses ${topPlatform.name} ke ${worstPlatform.name}`,
          'Tingkatkan visibility produk di platform underperforming',
          'Review pricing strategy untuk platform dengan conversion rendah'
        ] : [],
        priority: performanceGap > 70 ? 'high' : 'medium'
      });
    }
    
    // Product Concentration Analysis
    const topProducts = data.productPerformance.slice(0, 5);
    const totalProductRevenue = topProducts.reduce((sum, p) => sum + p.revenue, 0);
    const revenueConcentration = (totalProductRevenue / data.current.totalRevenue) * 100;
    
    generatedInsights.push({
      type: 'product_concentration',
      title: 'Konsentrasi Produk',
      description: `Top 5 produk menyumbang ${revenueConcentration.toFixed(1)}% dari total revenue`,
      sentiment: revenueConcentration > 80 ? 'negative' : revenueConcentration > 60 ? 'neutral' : 'positive',
      value: revenueConcentration,
      actionable: revenueConcentration > 70,
      recommendations: revenueConcentration > 70 ? [
        'Diversifikasi portfolio produk untuk mengurangi risiko',
        'Develop produk baru dengan potential margin tinggi',
        'Cross-sell produk existing ke customer base'
      ] : [],
      priority: revenueConcentration > 80 ? 'high' : 'medium'
    });
    
    // Profit Margin Analysis
    const profitMargin = (data.current.totalProfit / data.current.totalRevenue) * 100;
    
    generatedInsights.push({
      type: 'profit_margin',
      title: 'Analisis Profit Margin',
      description: profitMargin > 25 
        ? `Profit margin sangat baik (${profitMargin.toFixed(1)}%)`
        : profitMargin > 15 
          ? `Profit margin dalam range normal (${profitMargin.toFixed(1)}%)`
          : `Profit margin perlu optimasi (${profitMargin.toFixed(1)}%)`,
      sentiment: profitMargin > 25 ? 'positive' : profitMargin > 15 ? 'neutral' : 'negative',
      value: profitMargin,
      actionable: profitMargin < 15,
      recommendations: profitMargin < 15 ? [
        'Review struktur cost untuk efisiensi operasional',
        'Negosiasi harga supplier untuk cost reduction',
        'Optimasi pricing strategy untuk margin improvement',
        'Eliminasi produk dengan margin rendah dari portfolio'
      ] : [],
      priority: profitMargin < 10 ? 'high' : profitMargin < 15 ? 'medium' : 'low'
    });
    
    // Seasonal Pattern Detection (if monthly trend available)
    if (data.monthlyTrend && data.monthlyTrend.length >= 6) {
      const revenues = data.monthlyTrend.map(m => m.revenue);
      const avgRevenue = revenues.reduce((sum, r) => sum + r, 0) / revenues.length;
      const variance = revenues.reduce((sum, r) => sum + Math.pow(r - avgRevenue, 2), 0) / revenues.length;
      const standardDeviation = Math.sqrt(variance);
      const coefficientOfVariation = (standardDeviation / avgRevenue) * 100;
      
      generatedInsights.push({
        type: 'seasonality',
        title: 'Pattern Seasonal',
        description: `Penjualan menunjukkan variasi seasonal ${coefficientOfVariation.toFixed(1)}%`,
        sentiment: 'neutral',
        value: coefficientOfVariation,
        actionable: coefficientOfVariation > 30,
        recommendations: coefficientOfVariation > 30 ? [
          'Prepare inventory lebih awal untuk peak season',
          'Develop promotional strategy untuk low season',
          'Adjust marketing budget berdasarkan seasonal pattern'
        ] : [],
        priority: 'medium'
      });
    }
    
    return generatedInsights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority || 'low'] || 1) - (priorityOrder[a.priority || 'low'] || 1);
    });
  }, [data]);

  const getSentimentIcon = (sentiment: BusinessInsight['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'negative':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <BarChart3 className="h-5 w-5 text-blue-600" />;
    }
  };

  const getSentimentColor = (sentiment: BusinessInsight['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return 'border-green-200 bg-green-50';
      case 'negative':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getPriorityBadge = (priority?: BusinessInsight['priority']) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Medium Priority</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Low Priority</Badge>;
    }
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Tidak cukup data untuk menghasilkan insights. 
            Upload lebih banyak data untuk mendapatkan analisis AI.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          AI Business Insights
          <Badge variant="secondary" className="ml-auto">
            {insights.length} Insights
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div 
            key={insight.type}
            className={cn(
              "border rounded-lg p-4 transition-all duration-200",
              getSentimentColor(insight.sentiment)
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getSentimentIcon(insight.sentiment)}
                <div>
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    {insight.title}
                    {insight.priority && getPriorityBadge(insight.priority)}
                  </h4>
                  {insight.actionable && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-3 w-3 text-orange-500" />
                      <span className="text-xs text-orange-700 font-medium">
                        Action Required
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
            
            {insight.recommendations.length > 0 && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedInsight(
                    expandedInsight === insight.type ? null : insight.type
                  )}
                  className="text-sm text-blue-600 hover:text-blue-800 p-0 h-auto font-normal"
                >
                  <Lightbulb className="h-3 w-3 mr-1" />
                  {expandedInsight === insight.type ? 'Sembunyikan' : 'Lihat'} Rekomendasi
                  <ChevronDown className={cn(
                    "h-3 w-3 ml-1 transition-transform",
                    expandedInsight === insight.type ? 'rotate-180' : ''
                  )} />
                </Button>
                
                {expandedInsight === insight.type && (
                  <div className="mt-3 pl-4 border-l-2 border-blue-300 bg-white/50 rounded-r-lg p-3">
                    <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                      <Lightbulb className="h-4 w-4 text-yellow-600" />
                      Rekomendasi Actionable:
                    </h5>
                    <ul className="space-y-2">
                      {insight.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <ArrowRight className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {insights.some(i => i.actionable) && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <h4 className="font-medium text-orange-900">
                {insights.filter(i => i.actionable).length} area memerlukan perhatian
              </h4>
            </div>
            <p className="text-sm text-orange-700">
              Review rekomendasi di atas untuk mengoptimalkan performa bisnis Anda.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};