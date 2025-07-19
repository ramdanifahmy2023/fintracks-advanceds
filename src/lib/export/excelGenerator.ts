import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ExportData, ExportOptions, ExportResult } from '@/types/export';

export const generateExcelReport = async (
  data: ExportData, 
  options: ExportOptions
): Promise<ExportResult> => {
  try {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    
    // Sheet 1: Summary
    const summaryData = [
      ['HIBAN ANALYTICS - LAPORAN PENJUALAN'],
      [''],
      ['Periode', `${format(data.dateRange.from, 'dd MMM yyyy', { locale: id })} - ${format(data.dateRange.to, 'dd MMM yyyy', { locale: id })}`],
      ['Generated', format(new Date(), 'dd MMM yyyy HH:mm', { locale: id })],
      [''],
      ['RINGKASAN KEUANGAN'],
      ['Total Omset', data.summary.totalRevenue],
      ['Total Profit', data.summary.totalProfit],
      ['Total Transaksi', data.summary.totalTransactions],
      ['Rata-rata Order Value', data.summary.avgOrderValue],
      ['Profit Margin', data.summary.profitMargin / 100],
      ['Platform Terbaik', data.summary.topPlatform],
      ['Produk Terlaris', data.summary.topProduct],
      [''],
      ['PLATFORM PERFORMANCE'],
      ['Platform', 'Revenue', 'Profit', 'Margin %', 'Transaksi', 'Completion %'],
      ...data.platformPerformance.map(p => [
        p.name, 
        p.revenue, 
        p.profit, 
        p.profitMargin / 100, 
        p.transactions,
        p.completionRate / 100
      ])
    ];
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Format currency and percentage columns
    const currencyFormat = '"Rp"#,##0';
    const percentageFormat = '0.00%';
    
    // Apply formatting
    if (summarySheet['B7']) summarySheet['B7'].z = currencyFormat; // Total Omset
    if (summarySheet['B8']) summarySheet['B8'].z = currencyFormat; // Total Profit
    if (summarySheet['B10']) summarySheet['B10'].z = currencyFormat; // Avg Order Value
    if (summarySheet['B11']) summarySheet['B11'].z = percentageFormat; // Profit Margin
    
    // Format platform performance data
    const startRow = 16;
    for (let i = 0; i < data.platformPerformance.length; i++) {
      const row = startRow + i + 1;
      if (summarySheet[`B${row}`]) summarySheet[`B${row}`].z = currencyFormat; // Revenue
      if (summarySheet[`C${row}`]) summarySheet[`C${row}`].z = currencyFormat; // Profit
      if (summarySheet[`D${row}`]) summarySheet[`D${row}`].z = percentageFormat; // Margin
      if (summarySheet[`F${row}`]) summarySheet[`F${row}`].z = percentageFormat; // Completion
    }
    
    // Set column widths
    summarySheet['!cols'] = [
      { wch: 25 }, // Column A
      { wch: 20 }, // Column B
      { wch: 20 }, // Column C
      { wch: 15 }, // Column D
      { wch: 15 }, // Column E
      { wch: 15 }  // Column F
    ];
    
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    // Sheet 2: Transactions (if multiple sheets enabled)
    if (options.multipleSheets && data.transactions.length > 0) {
      const transactionHeaders = [
        'Tanggal', 'Platform', 'Toko', 'No Pesanan', 'Produk', 
        'Qty', 'Harga Beli', 'Harga Jual', 'Profit', 'Status'
      ];
      
      const transactionData = [
        transactionHeaders,
        ...data.transactions.map(t => [
          format(new Date(t.orderDate), 'dd/MM/yyyy'),
          t.platform,
          t.store,
          t.orderNumber,
          t.productName,
          t.quantity,
          t.costPrice,
          t.sellingPrice,
          t.profit,
          t.status
        ])
      ];
      
      const transactionSheet = XLSX.utils.aoa_to_sheet(transactionData);
      
      // Format currency columns in transaction sheet
      for (let row = 2; row <= data.transactions.length + 1; row++) {
        if (transactionSheet[`G${row}`]) transactionSheet[`G${row}`].z = currencyFormat; // Harga Beli
        if (transactionSheet[`H${row}`]) transactionSheet[`H${row}`].z = currencyFormat; // Harga Jual
        if (transactionSheet[`I${row}`]) transactionSheet[`I${row}`].z = currencyFormat; // Profit
      }
      
      // Auto-width columns
      transactionSheet['!cols'] = [
        { wch: 12 }, // Tanggal
        { wch: 15 }, // Platform
        { wch: 20 }, // Toko
        { wch: 20 }, // No Pesanan
        { wch: 30 }, // Produk
        { wch: 8 },  // Qty
        { wch: 15 }, // Harga Beli
        { wch: 15 }, // Harga Jual
        { wch: 15 }, // Profit
        { wch: 15 }  // Status
      ];
      
      XLSX.utils.book_append_sheet(workbook, transactionSheet, 'Transactions');
      
      // Sheet 3: Product Performance
      if (data.topProducts.length > 0) {
        const productHeaders = [
          'Rank', 'SKU', 'Product Name', 'Qty Sold', 'Revenue', 'Profit', 'Margin %'
        ];
        const productData = [
          productHeaders,
          ...data.topProducts.map((p, index) => [
            index + 1,
            p.sku || '-',
            p.name,
            p.quantitySold,
            p.revenue,
            p.profit,
            p.profitMargin / 100
          ])
        ];
        
        const productSheet = XLSX.utils.aoa_to_sheet(productData);
        
        // Format currency and percentage columns
        for (let row = 2; row <= data.topProducts.length + 1; row++) {
          if (productSheet[`E${row}`]) productSheet[`E${row}`].z = currencyFormat; // Revenue
          if (productSheet[`F${row}`]) productSheet[`F${row}`].z = currencyFormat; // Profit
          if (productSheet[`G${row}`]) productSheet[`G${row}`].z = percentageFormat; // Margin
        }
        
        productSheet['!cols'] = [
          { wch: 8 },  // Rank
          { wch: 15 }, // SKU
          { wch: 40 }, // Product Name
          { wch: 12 }, // Qty Sold
          { wch: 15 }, // Revenue
          { wch: 15 }, // Profit
          { wch: 12 }  // Margin
        ];
        
        XLSX.utils.book_append_sheet(workbook, productSheet, 'Products');
      }
      
      // Sheet 4: Monthly Trend (if available)
      if (data.monthlyTrend && data.monthlyTrend.length > 0) {
        const trendHeaders = ['Month', 'Revenue', 'Profit', 'Transactions'];
        const trendData = [
          trendHeaders,
          ...data.monthlyTrend.map(m => [
            m.month,
            m.revenue,
            m.profit,
            m.transactions
          ])
        ];
        
        const trendSheet = XLSX.utils.aoa_to_sheet(trendData);
        
        // Format currency columns
        for (let row = 2; row <= data.monthlyTrend.length + 1; row++) {
          if (trendSheet[`B${row}`]) trendSheet[`B${row}`].z = currencyFormat; // Revenue
          if (trendSheet[`C${row}`]) trendSheet[`C${row}`].z = currencyFormat; // Profit
        }
        
        trendSheet['!cols'] = [
          { wch: 15 }, // Month
          { wch: 20 }, // Revenue
          { wch: 20 }, // Profit
          { wch: 15 }  // Transactions
        ];
        
        XLSX.utils.book_append_sheet(workbook, trendSheet, 'Monthly Trend');
      }
    }
    
    // Add formulas if enabled
    if (options.includeFormulas) {
      // Add calculation formulas to summary sheet
      const summarySheetRef = workbook.Sheets['Summary'];
      const formulaRow = data.platformPerformance.length + 18;
      
      if (summarySheetRef[`A${formulaRow}`]) {
        summarySheetRef[`A${formulaRow}`] = { v: 'Total Platform Revenue', t: 's' };
        summarySheetRef[`B${formulaRow}`] = { 
          f: `SUM(B17:B${formulaRow-1})`, // Sum of platform revenues
          t: 'n',
          z: currencyFormat
        };
      }
    }
    
    // Generate and download
    const fileName = `data-penjualan-${format(new Date(), 'yyyy-MM-dd-HHmm')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    return {
      success: true,
      fileName
    };
  } catch (error) {
    console.error('Excel generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal membuat Excel'
    };
  }
};