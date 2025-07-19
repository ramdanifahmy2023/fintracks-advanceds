import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  Plus, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Download
} from 'lucide-react';
import { CSVUpload } from '@/components/upload/CSVUpload';
import { ManualInputForm } from '@/components/upload/ManualInputForm';
import { UploadResult, TransactionFormData } from '@/types/upload';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const UploadPage = () => {
  const [activeTab, setActiveTab] = useState('csv-upload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { userRole } = useAuth();

  const handleCSVUploadComplete = async (result: UploadResult) => {
    if (result.success) {
      toast({
        title: "Upload Berhasil",
        description: `${result.summary.processedRows} dari ${result.summary.totalRows} baris berhasil diproses`,
        variant: "default"
      });
    } else {
      toast({
        title: "Upload Sebagian Berhasil",
        description: `${result.summary.processedRows} berhasil, ${result.summary.errorRows} error`,
        variant: "destructive"
      });
    }
  };

  const handleManualSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    
    try {
      // Here you would implement the actual submission to Supabase
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Manual transaction data:', data);
      
      toast({
        title: "Transaksi Berhasil Disimpan",
        description: "Data transaksi manual telah ditambahkan",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan transaksi",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualCancel = () => {
    // Reset form or navigate back
    console.log('Manual input cancelled');
  };

  const downloadTemplate = () => {
    const headers = [
      'pic',
      'platform_name', 
      'store_id_external',
      'order_number',
      'manual_order_number',
      'store_name',
      'expedition',
      'delivery_status',
      'product_name',
      'tracking_number',
      'order_created_at',
      'cost_price',
      'selling_price',
      'sku_reference',
      'quantity'
    ];
    
    const sampleData = [
      'Admin1',
      'Shopee',
      'SHOP001',
      'SP-12345678',
      'MO-001',
      'Toko Sample',
      'JNE',
      'Selesai',
      'Product Sample A',
      'JNE1234567890',
      '2024-01-15 10:30:00',
      '15000',
      '25000',
      'SKU-001',
      '2'
    ];

    const csvContent = [
      headers.join(','),
      sampleData.join(',')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_upload_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Check if user has permission to upload
  const hasUploadPermission = userRole === 'super_admin' || userRole === 'admin';

  if (!hasUploadPermission) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Anda tidak memiliki akses untuk melakukan upload data. Hubungi administrator untuk mendapatkan izin.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Management</h1>
          <p className="text-muted-foreground mt-1">
            Upload data CSV atau input manual transaksi baru
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{userRole?.replace('_', ' ').toUpperCase()}</Badge>
        </div>
      </div>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Panduan Upload Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Format CSV yang Diperlukan:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• File format: .csv</li>
                <li>• Ukuran maksimal: 10MB</li>
                <li>• Encoding: UTF-8</li>
                <li>• Separator: koma (,)</li>
                <li>• 15 kolom wajib sesuai template</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Field Wajib:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• PIC, Platform, Order Number</li>
                <li>• Product Name, Store Info</li>
                <li>• Cost Price & Selling Price</li>
                <li>• Quantity & Order Date</li>
                <li>• Delivery Status</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="csv-upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload CSV
          </TabsTrigger>
          <TabsTrigger value="manual-input" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Input Manual
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="csv-upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Data CSV
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CSVUpload 
                onUploadComplete={handleCSVUploadComplete}
                maxFileSize={10 * 1024 * 1024} // 10MB
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="manual-input" className="space-y-6">
          <ManualInputForm
            onSubmit={handleManualSubmit}
            onCancel={handleManualCancel}
            isSubmitting={isSubmitting}
          />
        </TabsContent>
      </Tabs>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Upload Hari Ini</p>
                <p className="text-2xl font-bold">0</p>
              </div>
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Berhasil Diproses</p>
                <p className="text-2xl font-bold text-green-600">0</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error/Duplikasi</p>
                <p className="text-2xl font-bold text-red-600">0</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadPage;