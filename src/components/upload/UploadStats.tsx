import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Copy } from 'lucide-react';

interface UploadStatsProps {
  stats: {
    success: number;
    failed: number;
    duplicates: number;
  };
}

export const UploadStats: React.FC<UploadStatsProps> = ({ stats }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hasil Unggahan</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center p-4 bg-green-100 dark:bg-green-900/50 rounded-lg">
          <CheckCircle className="h-8 w-8 text-success mb-2" />
          <p className="text-2xl font-bold">{stats.success}</p>
          <p className="text-sm text-muted-foreground">Berhasil</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-red-100 dark:bg-red-900/50 rounded-lg">
          <XCircle className="h-8 w-8 text-destructive mb-2" />
          <p className="text-2xl font-bold">{stats.failed}</p>
          <p className="text-sm text-muted-foreground">Gagal</p>
        </div>
        <div className="flex flex-col items-center p-4 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
          <Copy className="h-8 w-8 text-warning mb-2" />
          <p className="text-2xl font-bold">{stats.duplicates}</p>
          <p className="text-sm text-muted-foreground">Duplikat Dilewati</p>
        </div>
      </CardContent>
    </Card>
  );
};
