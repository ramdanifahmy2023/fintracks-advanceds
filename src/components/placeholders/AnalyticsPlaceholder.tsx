import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, PieChart, LineChart } from 'lucide-react';

export const AnalyticsPlaceholder = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Advanced analytics and insights for your marketplace data
          </p>
        </div>
        <Badge variant="outline">Coming in Phase 3</Badge>
      </div>

      <Card className="border-dashed border-2 border-muted">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Advanced Analytics Dashboard</CardTitle>
          <CardDescription>
            Comprehensive analytics with charts, trends, and AI insights
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="p-4 bg-muted/50 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium">Sales Charts</h4>
              <p className="text-sm text-muted-foreground">Interactive sales performance charts</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-success mb-2" />
              <h4 className="font-medium">Trend Analysis</h4>
              <p className="text-sm text-muted-foreground">Identify patterns and trends</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <PieChart className="h-6 w-6 text-warning mb-2" />
              <h4 className="font-medium">Platform Breakdown</h4>
              <p className="text-sm text-muted-foreground">Performance by marketplace platform</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <LineChart className="h-6 w-6 text-info mb-2" />
              <h4 className="font-medium">AI Insights</h4>
              <p className="text-sm text-muted-foreground">Machine learning powered insights</p>
            </div>
          </div>
          <Button disabled className="mt-6">
            <BarChart3 className="mr-2 h-4 w-4" />
            View Analytics (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};