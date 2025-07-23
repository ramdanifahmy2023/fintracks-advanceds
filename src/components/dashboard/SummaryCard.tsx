
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SummaryCardData } from '@/types/dashboard';

interface SummaryCardProps extends SummaryCardData {}

const colorClasses = {
  blue: 'text-blue-600 dark:text-blue-400',
  green: 'text-green-600 dark:text-green-400',
  orange: 'text-orange-600 dark:text-orange-400',
  red: 'text-red-600 dark:text-red-400',
  purple: 'text-purple-600 dark:text-purple-400',
  indigo: 'text-indigo-600 dark:text-indigo-400'
};

const backgroundColorClasses = {
  blue: 'bg-blue-50 dark:bg-blue-950/20',
  green: 'bg-green-50 dark:bg-green-950/20',
  orange: 'bg-orange-50 dark:bg-orange-950/20',
  red: 'bg-red-50 dark:bg-red-950/20',
  purple: 'bg-purple-50 dark:bg-purple-950/20',
  indigo: 'bg-indigo-50 dark:bg-indigo-950/20'
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
  // Handle loading state
  if (loading) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    );
  }

  // Validate required props
  if (!title || !value || !Icon || !color) {
    console.warn('SummaryCard: Missing required props', { title, value, Icon, color });
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground text-sm">
            Data tidak tersedia
          </div>
        </CardContent>
      </Card>
    );
  }

  const getChangeIcon = () => {
    if (!change || typeof change.value !== 'number') return null;
    
    const changeValue = Number(change.value);
    
    if (changeValue > 0) {
      return <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />;
    } else if (changeValue < 0) {
      return <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />;
    } else {
      return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getChangeTextColor = () => {
    if (!change || typeof change.value !== 'number') return 'text-muted-foreground';
    
    const changeValue = Number(change.value);
    
    if (changeValue > 0) return 'text-green-600 dark:text-green-400';
    if (changeValue < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const formatChangeValue = (value: number) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return '0.0';
    
    const formatted = Math.abs(numValue).toFixed(1);
    return numValue > 0 ? `+${formatted}` : numValue < 0 ? `-${formatted}` : formatted;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer border-border/40 hover:border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className={cn(
          'p-2 rounded-lg transition-all duration-300',
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
            <span className="text-muted-foreground truncate flex-1 mr-2">
              {subtitle}
            </span>
          )}
          
          {change && typeof change.value === 'number' && !isNaN(change.value) && (
            <div className={cn('flex items-center gap-1 flex-shrink-0', getChangeTextColor())}>
              {getChangeIcon()}
              <span className="font-medium">
                {formatChangeValue(change.value)}%
              </span>
              {change.period && (
                <span className="text-muted-foreground hidden sm:inline">
                  {change.period}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const SummaryCardSkeleton = () => (
  <Card className="border-border/40">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-8 rounded" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-32" />
    </CardContent>
  </Card>
);
