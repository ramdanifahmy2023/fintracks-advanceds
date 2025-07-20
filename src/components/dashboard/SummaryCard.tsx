import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SummaryCardData } from '@/types/dashboard';

interface SummaryCardProps extends SummaryCardData {}

const colorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  orange: 'text-orange-600',
  red: 'text-red-600',
  purple: 'text-purple-600',
  indigo: 'text-indigo-600'
};

const backgroundColorClasses = {
  blue: 'bg-blue-50',
  green: 'bg-green-50',
  orange: 'bg-orange-50',
  red: 'bg-red-50',
  purple: 'bg-purple-50',
  indigo: 'bg-indigo-50'
};

export const SummaryCard = ({ 
  title, 
  value, 
  subtitle, 
  change, 
  icon: Icon, 
  color, 
  loading 
}: SummaryCardProps) => {
  if (loading) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  const getChangeIcon = () => {
    if (!change) return null;
    
    if (change.type === 'increase') {
      return <TrendingUp className="h-3 w-3 text-green-600" />;
    } else if (change.type === 'decrease') {
      return <TrendingDown className="h-3 w-3 text-red-600" />;
    } else {
      return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getChangeTextColor = () => {
    if (!change) return 'text-muted-foreground';
    
    if (change.type === 'increase') return 'text-green-600';
    if (change.type === 'decrease') return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className={cn(
          'p-2 rounded-lg transition-colors duration-300',
          backgroundColorClasses[color],
          'group-hover:scale-110'
        )}>
          <Icon className={cn('h-4 w-4', colorClasses[color])} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1 group-hover:text-primary transition-colors">
          {value}
        </div>
        
        <div className="flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-muted-foreground">{subtitle}</span>
          )}
          
          {change && (
            <div className={cn('flex items-center gap-1', getChangeTextColor())}>
              {getChangeIcon()}
              <span className="font-medium">
                {change.value > 0 ? '+' : ''}{change.value.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">
                {change.period}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const SummaryCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4 rounded" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-32" />
    </CardContent>
  </Card>
);