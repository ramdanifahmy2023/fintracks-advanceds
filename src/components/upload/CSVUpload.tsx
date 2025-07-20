import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Download,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Papa from 'papaparse';
import { UploadResult, ValidationError, REQUIRED_COLUMNS } from '@/types/upload';
import { useToast } from '@/hooks/use-toast';

interface CSVUploadProps {
  onUploadComplete: (result: UploadResult) => void;
  maxFileSize?: number; // 10MB default
  className?: string;
}

export const CSVUpload = ({ 
  onUploadComplete, 
  maxFileSize = 10 * 1024 * 1024,
  className 
}: CSVUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const { toast } = useToast();

  const validateRow = useCallback((row: any, rowNumber: number): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Validate required fields
    if (!row.pic || !row.pic.toString().trim()) {
      errors.push({ row: rowNumber, field: 'pic', message: 'PIC tidak boleh kosong' });
    }
    
    if (!row.platform_name || !row.platform_name.toString().trim()) {
      errors.push({ row: rowNumber, field: 'platform_name', message: 'Platform name tidak boleh kosong' });
    }
    
    if (!row.order_number || !row.order_number.toString().trim()) {
      errors.push({ row: rowNumber, field: 'order_number', message: 'Order number tidak boleh kosong' });
    }
    
    if (!row.product_name || !row.product_name.toString().trim()) {
      errors.push({ row: rowNumber, field: 'product_name', message: 'Product name tidak boleh kosong' });
    }
    
    // Validate numeric fields
    if (row.cost_price && isNaN(parseFloat(row.cost_price.toString()))) {
      errors.push({ row: rowNumber, field: 'cost_price', message: 'Harga beli harus berupa angka', value: row.cost_price });
    }
    
    if (row.selling_price && isNaN(parseFloat(row.selling_price.toString()))) {
      errors.push({ row: rowNumber, field: 'selling_price', message: 'Harga jual harus berupa angka', value: row.selling_price });
    }
    
    if (row.quantity && (!Number.isInteger(parseInt(row.quantity.toString())) || parseInt(row.quantity.toString()) <= 0)) {
      errors.push({ row: rowNumber, field: 'quantity', message: 'Quantity harus berupa angka bulat positif', value: row.quantity });
    }
    
    // Validate date format
    if (row.order_created_at && isNaN(Date.parse(row.order_created_at.toString()))) {
      errors.push({ row: rowNumber, field: 'order_created_at', message: 'Format tanggal tidak valid', value: row.order_created_at });
    }
    
    // Validate delivery status
    const validStatuses = ['Selesai', 'Sedang Dikirim', 'Batal', 'Return', 'Menunggu Konfirmasi'];
    if (row.delivery_status && !validStatuses.includes(row.delivery_status.toString())) {
      errors.push({ 
        row: rowNumber, 
        field: 'delivery_status', 
        message: `Status tidak valid. Gunakan: ${validStatuses.join(', ')}`,
        value: row.delivery_status
      });
    }
    
    return errors;
  }, []);

  const validateCSVStructure = useCallback((data: any[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    if (data.length === 0) {
      errors.push({ row: 0, field: 'file', message: 'File CSV kosong' });
      return errors;
    }
    
    // Check for required columns
    const headers = Object.keys(data[0]);
    const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
      errors.push({
        row: 0,
        field: 'structure',
        message: `Kolom yang hilang: ${missingColumns.join(', ')}`,
      });
    }
    
    return errors;
  }, []);

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setUploadProgress(0);
    setValidationErrors([]);
    setFileName(file.name);
    
    try {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: (results) => {
          setUploadProgress(30);
          
          const data = results.data as any[];
          
          // Validate CSV structure
          const structureErrors = validateCSVStructure(data);
          if (structureErrors.length > 0) {
            setValidationErrors(structureErrors);
            setIsProcessing(false);
            return;
          }
          
          setUploadProgress(60);
          
          // Validate each row
          const allErrors: ValidationError[] = [];
          data.forEach((row, index) => {
            const rowErrors = validateRow(row, index + 2); // +2 because header is row 1
            allErrors.push(...rowErrors);
          });
          
          setUploadProgress(90);
          
          if (allErrors.length > 0) {
            setValidationErrors(allErrors);
            toast({
              title: "Validasi Gagal",
              description: `Ditemukan ${allErrors.length} error dalam file CSV`,
              variant: "destructive"
            });
          } else {
            setParsedData(data);
            setPreviewData(data.slice(0, 10));
            toast({
              title: "Validasi Berhasil",
              description: `${data.length} baris data siap diproses`,
              variant: "default"
            });
          }
          
          setUploadProgress(100);
          setIsProcessing(false);
        },
        error: (error) => {
          setValidationErrors([{
            row: 0,
            field: 'file',
            message: `Error parsing CSV: ${error.message}`
          }]);
          setIsProcessing(false);
          toast({
            title: "Error",
            description: "Gagal membaca file CSV",
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      setValidationErrors([{
        row: 0,
        field: 'file',
        message: 'Gagal memproses file'
      }]);
      setIsProcessing(false);
    }
  }, [validateCSVStructure, validateRow, toast]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (!file) return;
    
    if (file.size > maxFileSize) {
      toast({
        title: "File Terlalu Besar",
        description: `Ukuran file maksimal ${(maxFileSize / 1024 / 1024).toFixed(0)}MB`,
        variant: "destructive"
      });
      return;
    }
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Format File Salah",
        description: "Hanya file CSV yang diperbolehkan",
        variant: "destructive"
      });
      return;
    }
    
    processFile(file);
  }, [maxFileSize, processFile, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const handleConfirmUpload = async () => {
    if (!parsedData) return;
    
    try {
      // Here you would implement the actual upload to Supabase
      // For now, simulate success
      const result: UploadResult = {
        success: true,
        batchId: 'batch_' + Date.now(),
        summary: {
          totalRows: parsedData.length,
          processedRows: parsedData.length,
          duplicateRows: 0,
          errorRows: 0
        }
      };
      
      onUploadComplete(result);
      
      // Reset state
      setParsedData(null);
      setPreviewData(null);
      setValidationErrors([]);
      setFileName('');
    } catch (error) {
      toast({
        title: "Upload Gagal",
        description: "Terjadi kesalahan saat upload data",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    setParsedData(null);
    setPreviewData(null);
    setValidationErrors([]);
    setFileName('');
    setUploadProgress(0);
  };

  const downloadErrorLog = () => {
    const csvContent = [
      ['Row', 'Field', 'Error', 'Value'],
      ...validationErrors.map(error => [
        error.row,
        error.field,
        error.message,
        error.value || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error_log_${fileName.replace('.csv', '')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Data CSV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              isProcessing && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="p-3 rounded-full bg-muted">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? "Drop file di sini..." : "Drag & drop file CSV atau klik untuk pilih"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Maksimal {(maxFileSize / 1024 / 1024).toFixed(0)}MB, format .csv
                </p>
              </div>
              {!isDragActive && (
                <Button variant="outline" disabled={isProcessing}>
                  Pilih File
                </Button>
              )}
            </div>
          </div>
          
          {isProcessing && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Memproses {fileName}...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Error Validasi ({validationErrors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="max-h-60 overflow-y-auto space-y-2">
                {validationErrors.slice(0, 10).map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertDescription>
                      <strong>Baris {error.row}, Kolom {error.field}:</strong> {error.message}
                      {error.value && <span className="block text-xs mt-1">Nilai: "{error.value}"</span>}
                    </AlertDescription>
                  </Alert>
                ))}
                {validationErrors.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center">
                    ... dan {validationErrors.length - 10} error lainnya
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={downloadErrorLog}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Error Log
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <X className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Data */}
      {previewData && (
        <Card className="border-success">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-success">
              <CheckCircle className="h-5 w-5" />
              Preview Data ({parsedData?.length} baris total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      {previewData[0] && Object.keys(previewData[0]).map(key => (
                        <th key={key} className="border border-border p-2 text-left font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        {Object.values(row).map((value: any, cellIndex) => (
                          <td key={cellIndex} className="border border-border p-2">
                            {value?.toString() || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    <Eye className="h-3 w-3 mr-1" />
                    Preview (10 baris pertama)
                  </Badge>
                  <Badge variant="outline">
                    Total: {parsedData?.length} baris
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleReset}>
                    <X className="h-4 w-4 mr-2" />
                    Batal
                  </Button>
                  <Button onClick={handleConfirmUpload}>
                    <Upload className="h-4 w-4 mr-2" />
                    Konfirmasi Upload
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};