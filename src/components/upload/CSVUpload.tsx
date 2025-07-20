import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CSVUploadZone } from './CSVUploadZone';
import { ValidationResults } from './ValidationResults';
import { DuplicateHandling } from './DuplicateHandling';
import { UploadStats } from './UploadStats';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// Tipe untuk baris data yang divalidasi
export interface ValidatedRow {
  originalRow: any;
  data: any;
  isValid: boolean;
  errors: string[];
  isDuplicate?: 'checking' | 'true' | 'false';
}

export const CSVUpload: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [validatedRows, setValidatedRows] = useState<ValidatedRow[]>([]);
  const [duplicateOption, setDuplicateOption] = useState<'skip' | 'overwrite'>('skip');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStats, setUploadStats] = useState({ success: 0, failed: 0, duplicates: 0 });

  const handleFileProcessed = (rows: ValidatedRow[]) => {
    setValidatedRows(rows);
    // Reset stats saat file baru diproses
    setUploadStats({ success: 0, failed: 0, duplicates: 0 });
  };
  
  const handleSubmit = async () => {
    if (!user) {
        toast({ title: "Error", description: "Anda harus login untuk mengunggah data.", variant: "destructive" });
        return;
    }

    setIsProcessing(true);

    // Filter baris yang valid dan bukan duplikat (jika opsi 'skip')
    const rowsToUpload = validatedRows.filter(row => 
        row.isValid && (duplicateOption === 'overwrite' || row.isDuplicate !== 'true')
    );

    if (rowsToUpload.length === 0) {
        toast({ title: "Tidak ada data untuk diunggah", description: "Tidak ada baris data yang valid untuk diunggah." });
        setIsProcessing(false);
        return;
    }

    // Format data untuk Supabase
    const formattedData = rowsToUpload.map(row => ({
        ...row.data,
        // Pastikan semua kolom yang diperlukan ada
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    }));

    // Panggil fungsi RPC di Supabase untuk memproses batch
    const { data, error } = await supabase.rpc('bulk_insert_transactions', {
        transactions: formattedData,
        p_duplicate_option: duplicateOption
    });

    if (error) {
        toast({ title: "Gagal Mengunggah", description: error.message, variant: "destructive" });
        setUploadStats({ success: 0, failed: rowsToUpload.length, duplicates: 0 });
    } else if (data) {
        toast({ title: "Unggah Berhasil", description: `${data.success_count} baris berhasil diunggah.` });
        setUploadStats({ 
            success: data.success_count, 
            failed: data.error_count, 
            duplicates: data.duplicate_count 
        });
        setValidatedRows([]); // Kosongkan setelah berhasil
    }

    setIsProcessing(false);
  };


  return (
    <div className="space-y-6">
      <CSVUploadZone onFileProcessed={handleFileProcessed} />

      {validatedRows.length > 0 && (
        <>
          <DuplicateHandling value={duplicateOption} onChange={setDuplicateOption} />
          <ValidationResults rows={validatedRows} setRows={setValidatedRows} />
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setValidatedRows([])} disabled={isProcessing}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={isProcessing}>
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isProcessing ? 'Memproses...' : `Unggah ${validatedRows.filter(r => r.isValid).length} Baris Valid`}
            </Button>
          </div>
        </>
      )}

      {(uploadStats.success > 0 || uploadStats.failed > 0) && (
        <UploadStats stats={uploadStats} />
      )}
    </div>
  );
};
