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
            Upload and process your marketplace sales data
          </p>
        </div>
        <Badge variant="outline">Coming in Phase 2</Badge>
      </div>

      <Card className="border-dashed border-2 border-muted">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Data Upload Feature</CardTitle>
          <CardDescription>
            Bulk upload your sales data from various marketplace platforms
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 bg-muted/50 rounded-lg">
              <FileSpreadsheet className="h-6 w-6 text-primary mb-2" />
              <h4 className="font-medium">CSV Upload</h4>
              <p className="text-sm text-muted-foreground">Support for CSV files from all major marketplaces</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-warning mb-2" />
              <h4 className="font-medium">Data Validation</h4>
              <p className="text-sm text-muted-foreground">Automatic validation and duplicate detection</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <Upload className="h-6 w-6 text-success mb-2" />
              <h4 className="font-medium">Batch Processing</h4>
              <p className="text-sm text-muted-foreground">Efficient processing of large datasets</p>
            </div>
          </div>
          <Button disabled className="mt-6">
            <Upload className="mr-2 h-4 w-4" />
            Upload Data (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};