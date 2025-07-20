import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ValidatedRow } from './CSVUpload';
import { supabase } from '@/integrations/supabase/client';

interface CSVUploadZoneProps {
  onFileProcessed: (rows: ValidatedRow[]) => void;
}

// Fungsi untuk memvalidasi setiap baris
const validateRow = (row: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!row.order_number) errors.push('Nomor pesanan tidak boleh kosong.');
    if (!row.product_name) errors.push('Nama produk tidak boleh kosong.');
    if (isNaN(parseInt(row.quantity))) errors.push('Kuantitas harus berupa angka.');
    if (isNaN(parseFloat(row.selling_price))) errors.push('Harga jual harus berupa angka.');
    
    return { isValid: errors.length === 0, errors };
};

export const CSVUploadZone: React.FC<CSVUploadZoneProps> = ({ onFileProcessed }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setIsLoading(true);
    const file = acceptedFiles[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsedRows = results.data;
        
        const validationPromises = parsedRows.map(async (row: any) => {
            const { isValid, errors } = validateRow(row);
            let isDuplicate: 'checking' | 'true' | 'false' = 'checking';

            if (isValid) {
                const { data: isDup, error } = await supabase.rpc('check_duplicate_transaction', {
                    p_order_number: row.order_number,
                    p_product_name: row.product_name
                });
                if (error) console.error("Error checking duplicate:", error);
                isDuplicate = isDup ? 'true' : 'false';
            }

            return {
                originalRow: row,
                data: row, // Nanti bisa di-mapping ke skema DB
                isValid,
                errors,
                isDuplicate
            };
        });

        const validatedRows = await Promise.all(validationPromises);

        onFileProcessed(validatedRows);
        toast({ title: "File diproses", description: `${validatedRows.length} baris ditemukan dan divalidasi.` });
        setIsLoading(false);
      },
      error: (error) => {
        toast({ title: "Gagal mem-parsing CSV", description: error.message, variant: "destructive" });
        setIsLoading(false);
      }
    });
  }, [onFileProcessed, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary'}`}
    >
      <input {...getInputProps()} />
      {isLoading ? (
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Memproses file...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <UploadCloud className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="font-semibold">Tarik & lepas file CSV di sini, atau klik untuk memilih file</p>
          <p className="text-sm text-muted-foreground mt-2">Hanya file .csv yang didukung</p>
        </div>
      )}
    </div>
  );
};