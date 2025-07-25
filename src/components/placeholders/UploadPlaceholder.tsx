
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';

export const UploadPlaceholder = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Upload Data</h1>
          <p className="text-muted-foreground mt-2">
            Upload dan proses data penjualan marketplace Anda
          </p>
        </div>
        <Badge variant="outline">Segera Hadir di Fase 2</Badge>
      </div>

      <Card className="border-dashed border-2 border-muted">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Fitur Upload Data</CardTitle>
          <CardDescription>
            Upload massal data penjualan dari berbagai platform marketplace
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 bg-muted/50 rounded-lg">
              <FileSpreadsheet className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium">Upload CSV</h4>
              <p className="text-sm text-muted-foreground">Dukungan untuk file CSV dari semua marketplace besar</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-warning mb-2" />
              <h4 className="font-medium">Validasi Data</h4>
              <p className="text-sm text-muted-foreground">Validasi otomatis dan deteksi duplikasi</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <Upload className="h-6 w-6 text-success mb-2" />
              <h4 className="font-medium">Batch Processing</h4>
              <p className="text-sm text-muted-foreground">Pemrosesan efisien dataset besar</p>
            </div>
          </div>
          <Button disabled className="mt-6">
            <Upload className="mr-2 h-4 w-4" />
            Upload Data (Segera Hadir)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
