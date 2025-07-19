import { format } from 'date-fns';
import { ExportData, ExportOptions, ExportResult } from '@/types/export';

export const generateCSVReport = async (
  data: ExportData, 
  options: ExportOptions
): Promise<ExportResult> => {
  try {
    const delimiter = options.delimiter || ',';
    const includeHeaders = options.includeHeaders !== false;
    
    let csvContent = '';
    
    // Headers
    if (includeHeaders) {
      const headers = [
        'tanggal',
        'platform', 
        'toko',
        'no_pesanan',
        'produk',
        'qty',
        'harga_beli',
        'harga_jual', 
        'profit',
        'status'
      ];
      csvContent += headers.join(delimiter) + '\n';
    }
    
    // Data rows
    data.transactions.forEach(transaction => {
      const row = [
        format(new Date(transaction.orderDate), 'yyyy-MM-dd'),
        `"${transaction.platform}"`,
        `"${transaction.store}"`, 
        `"${transaction.orderNumber}"`,
        `"${transaction.productName.replace(/"/g, '""')}"`, // Escape quotes
        transaction.quantity,
        transaction.costPrice,
        transaction.sellingPrice,
        transaction.profit,
        `"${transaction.status}"`
      ];
      csvContent += row.join(delimiter) + '\n';
    });
    
    // Create and download file
    const fileName = `data-transaksi-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
    const blob = new Blob([csvContent], { 
      type: `text/csv;charset=${options.encoding || 'utf-8'}` 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return {
      success: true,
      fileName
    };
  } catch (error) {
    console.error('CSV generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal membuat CSV'
    };
  }
};