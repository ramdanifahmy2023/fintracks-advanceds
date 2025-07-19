import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Papa from 'papaparse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Download, Upload, Database, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CSVUploadZone } from '@/components/upload/CSVUploadZone';
import { ValidationResultsDisplay, ValidationResults } from '@/components/upload/ValidationResults';
import { DuplicateHandlingSection } from '@/components/upload/DuplicateHandling';
import { UploadStatsGrid } from '@/components/upload/UploadStats';

const UploadPage = () => {
  const { user, userRole } = useAuth();
  const queryClient = useQueryClient();
  
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);
  const [duplicateHandling, setDuplicateHandling] = useState<'skip' | 'update' | 'create'>('skip');
  const [uploadStats, setUploadStats] = useState({
    today: 0,
    successful: 0,
    errors: 0,
    totalSize: 0
  });

  // Load upload stats
  useEffect(() => {
    loadUploadStats();
  }, []);

  const loadUploadStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's upload stats
      const { data: uploads, error } = await supabase
        .from('upload_batches')
        .select('processed_rows, failed_rows, total_rows')
        .gte('uploaded_at', today)
        .eq('uploaded_by', user?.id);

      if (error) throw error;

      const stats = uploads.reduce((acc, upload) => ({
        today: acc.today + 1,
        successful: acc.successful + (upload.processed_rows || 0),
        errors: acc.errors + (upload.failed_rows || 0),
        totalSize: acc.totalSize + (upload.total_rows || 0)
      }), { today: 0, successful: 0, errors: 0, totalSize: 0 });

      setUploadStats(stats);
    } catch (error) {
      console.error('Error loading upload stats:', error);
    }
  };

  const validateCSVData = (data: any[]): ValidationResults => {
    const requiredColumns = [
      'pic_name', 'platform_name', 'store_name', 'order_number',
      'product_name', 'cost_price', 'selling_price', 'quantity',
      'order_created_at', 'delivery_status'
    ];
    
    const validRecords = [];
    const errors = [];
    
    if (data.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Check if all required columns exist
    const headers = Object.keys(data[0] || {});
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
    }
    
    // Validate each record
    data.forEach((record, index) => {
      const rowErrors = [];
      
      // Validate required fields
      requiredColumns.forEach(column => {
        if (!record[column] || record[column] === '') {
          rowErrors.push(`${column} is required`);
        }
      });
      
      // Validate data types and formats
      if (record.cost_price && isNaN(parseFloat(record.cost_price))) {
        rowErrors.push('cost_price must be a valid number');
      }
      
      if (record.selling_price && isNaN(parseFloat(record.selling_price))) {
        rowErrors.push('selling_price must be a valid number');
      }
      
      if (record.quantity && isNaN(parseInt(record.quantity))) {
        rowErrors.push('quantity must be a valid number');
      }
      
      // Validate date format
      if (record.order_created_at && isNaN(Date.parse(record.order_created_at))) {
        rowErrors.push('order_created_at must be a valid date');
      }
      
      // Validate delivery status
      const validStatuses = ['Selesai', 'Sedang Dikirim', 'Batal', 'Return', 'Menunggu Konfirmasi'];
      if (record.delivery_status && !validStatuses.includes(record.delivery_status)) {
        rowErrors.push(`delivery_status must be one of: ${validStatuses.join(', ')}`);
      }
      
      if (rowErrors.length === 0) {
        validRecords.push(record);
      } else {
        errors.push({
          row: index + 2, // +2 because of header and 0-based index
          errors: rowErrors,
          data: record
        });
      }
    });
    
    return {
      totalRecords: data.length,
      validRecords,
      errors,
      duplicates: [],
      uniqueRecords: [],
      processedCount: 0
    };
  };

  const handleCSVUpload = useCallback(async (file: File) => {
    setUploadState('uploading');
    setUploadProgress(0);
    
    try {
      // 1. Parse CSV with Papa Parse
      const csvText = await file.text();
      const parseResult = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // Keep as strings to handle validation properly
        transformHeader: (header) => header.trim().toLowerCase().replace(/\s+/g, '_')
      });
      
      if (parseResult.errors.length > 0) {
        throw new Error('CSV parsing failed: ' + parseResult.errors[0].message);
      }
      
      setUploadProgress(25);
      setUploadState('processing');
      
      // 2. Validate CSV structure and data
      const validationResults = validateCSVData(parseResult.data);
      setUploadProgress(50);
      
      // 3. Process valid records if any
      if (validationResults.validRecords.length > 0) {
        // Create batch record
        const { data: batch, error: batchError } = await supabase
          .from('upload_batches')
          .insert({
            filename: file.name,
            total_rows: validationResults.totalRecords,
            uploaded_by: user?.id,
            status: 'processing'
          })
          .select()
          .single();

        if (batchError) throw batchError;

        setUploadProgress(75);

        // Process data using the stored procedure
        const { data: processResult, error: processError } = await supabase
          .rpc('process_csv_data', {
            p_batch_id: batch.id,
            p_csv_data: validationResults.validRecords
          });

        if (processError) throw processError;

        const result = processResult[0];
        validationResults.processedCount = result.success_count;
        validationResults.duplicates = JSON.parse(String(result.error_details || '[]')).filter((err: any) => 
          err.error?.includes('duplicate')
        );
        
        setUploadProgress(100);
        
        toast.success(
          `Upload completed! ${result.success_count} records processed successfully.`
        );

        // Refresh dashboard and stats
        queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
        queryClient.invalidateQueries({ queryKey: ['chart-data'] });
        loadUploadStats();
      }
      
      setValidationResults(validationResults);
      setUploadState('completed');
      
    } catch (error: any) {
      setUploadState('error');
      toast.error(`Upload failed: ${error.message}`);
      console.error('CSV upload error:', error);
    }
  }, [user?.id, queryClient]);

  const downloadTemplate = () => {
    const headers = [
      'pic_name',
      'platform_name', 
      'store_name',
      'store_id_external',
      'order_number',
      'manual_order_number',
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
      'Admin Store',
      'Shopee',
      'Toko Prima Shopee',
      'shopee_001',
      'SP-12345678',
      'MAN-001',
      'JNE Express',
      'Selesai',
      'Smartphone Samsung Galaxy A54',
      'JNE1234567890',
      '2024-01-15 10:30:00',
      '3500000',
      '4200000',
      'PHONE-SAM-A54',
      '1'
    ];

    const csvContent = [
      headers.join(','),
      sampleData.join(',')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_upload_marketplace_data.csv';
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
        <Alert variant="destructive">
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
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Data Management</h1>
          <p className="text-muted-foreground">Upload data CSV atau input manual transaksi baru</p>
        </div>
        <div className="text-sm text-muted-foreground">
          User: <Badge variant="secondary">{userRole?.replace('_', ' ').toUpperCase()}</Badge> | 
          Upload Hari Ini: {uploadStats.today}
        </div>
      </div>

      {/* Upload Guidelines Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2 text-primary" />
            Panduan Upload Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Format CSV yang Diperlukan:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• File format: .csv</li>
                <li>• Ukuran maksimal: 10MB</li>
                <li>• Encoding: UTF-8</li>
                <li>• Separator: koma (,)</li>
                <li>• 15 kolom wajib sesuai template</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Field Wajib:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• PIC, Platform, Order Number</li>
                <li>• Product Name, Store Info</li>
                <li>• Cost Price & Selling Price</li>
                <li>• Quantity & Order Date</li>
                <li>• Delivery Status</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" className="flex items-center" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* CSV Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2 text-success" />
            Upload Data CSV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CSVUploadZone 
            onUpload={handleCSVUpload}
            uploadState={uploadState}
            progress={uploadProgress}
          />
          
          {/* Validation Results */}
          {validationResults && (
            <ValidationResultsDisplay results={validationResults} />
          )}
          
          {/* Duplicate Handling Options */}
          {validationResults?.duplicates && validationResults.duplicates.length > 0 && (
            <DuplicateHandlingSection 
              duplicates={validationResults.duplicates}
              onHandlingChange={setDuplicateHandling}
            />
          )}
        </CardContent>
      </Card>

      {/* Upload Statistics */}
      <UploadStatsGrid
        today={uploadStats.today}
        successful={uploadStats.successful}
        errors={uploadStats.errors}
        totalSize={uploadStats.totalSize}
      />
    </div>
  );
};

export default UploadPage;