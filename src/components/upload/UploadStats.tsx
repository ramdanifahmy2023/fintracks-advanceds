import { Card, CardContent } from '@/components/ui/card';
import { Upload, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'red' | 'orange';
  subtitle?: string;
}

export const StatCard = ({ title, value, icon: Icon, color, subtitle }: StatCardProps) => {
  const colorClasses = {
    blue: {
      icon: 'text-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-600'
    },
    green: {
      icon: 'text-green-500', 
      bg: 'bg-green-50',
      text: 'text-green-600'
    },
    red: {
      icon: 'text-red-500',
      bg: 'bg-red-50', 
      text: 'text-red-600'
    },
    orange: {
      icon: 'text-orange-500',
      bg: 'bg-orange-50',
      text: 'text-orange-600'
    }
  };

  const styles = colorClasses[color];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${styles.bg}`}>
            <Icon className={`h-5 w-5 ${styles.icon}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${styles.text}`}>
              {value.toLocaleString()}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface UploadStatsProps {
  today: number;
  successful: number;
  errors: number;
  totalSize?: number;
}

export const UploadStatsGrid = ({ today, successful, errors, totalSize }: UploadStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="Upload Hari Ini"
        value={today}
        icon={Upload}
        color="blue"
        subtitle="Files uploaded"
      />
      <StatCard
        title="Berhasil Diproses"
        value={successful}
        icon={CheckCircle}
        color="green"
        subtitle="Records processed"
      />
      <StatCard
        title="Error/Duplikasi"
        value={errors}
        icon={AlertTriangle}
        color="red"
        subtitle="Failed records"
      />
      <StatCard
        title="Total Data"
        value={totalSize || 0}
        icon={TrendingUp}
        color="orange"
        subtitle="Total records"
      />
    </div>
  );
};