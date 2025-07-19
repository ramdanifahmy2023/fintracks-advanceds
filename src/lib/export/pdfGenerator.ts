import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ExportData, ExportOptions, ExportResult } from '@/types/export';
import { formatCurrency } from '@/lib/formatters';

export const generatePDFReport = async (
  data: ExportData, 
  options: ExportOptions
): Promise<ExportResult> => {
  try {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    
    const doc = new jsPDF(options.pageOrientation || 'portrait', 'mm', 'a4');
    
    // Company Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Hiban Analytics', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text('Laporan Penjualan Marketplace', 20, 30);
    
    // Report Period
    doc.setFontSize(10);
    doc.text(
      `Periode: ${format(data.dateRange.from, 'dd MMM yyyy', { locale: id })} - ${format(data.dateRange.to, 'dd MMM yyyy', { locale: id })}`, 
      20, 40
    );
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm', { locale: id })}`, 20, 45);
    
    let yPosition = 60;
    
    // Executive Summary
    if (options.includeSummary) {
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Executive Summary', 20, yPosition);
      yPosition += 10;
      
      const summaryData = [
        ['Total Omset', formatCurrency(data.summary.totalRevenue)],
        ['Total Profit', formatCurrency(data.summary.totalProfit)],
        ['Total Transaksi', data.summary.totalTransactions.toLocaleString()],
        ['Rata-rata Order Value', formatCurrency(data.summary.avgOrderValue)],
        ['Profit Margin', `${data.summary.profitMargin.toFixed(1)}%`],
        ['Platform Terbaik', data.summary.topPlatform],
        ['Produk Terlaris', data.summary.topProduct]
      ];
      
      (doc as any).autoTable({
        startY: yPosition,
        head: [['Metrik', 'Nilai']],
        body: summaryData,
        theme: 'grid',
        headStyles: { 
          fillColor: [59, 130, 246],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 9,
          cellPadding: 3
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 60 },
          1: { cellWidth: 80 }
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }
    
    // Platform Performance
    if (options.includeCharts && data.platformPerformance.length > 0) {
      // Add new page if needed
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text('Platform Performance', 20, yPosition);
      yPosition += 10;
      
      const chartData = data.platformPerformance.map(platform => [
        platform.name,
        formatCurrency(platform.revenue),
        formatCurrency(platform.profit),
        `${platform.profitMargin.toFixed(1)}%`,
        platform.transactions.toLocaleString(),
        `${platform.completionRate.toFixed(1)}%`
      ]);
      
      (doc as any).autoTable({
        startY: yPosition,
        head: [['Platform', 'Revenue', 'Profit', 'Margin', 'Transaksi', 'Completion']],
        body: chartData,
        theme: 'striped',
        headStyles: { 
          fillColor: [34, 197, 94],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 35 },
          2: { cellWidth: 35 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 }
        }
      });
      
      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }
    
    // Top Products Section
    if (data.topProducts.length > 0) {
      // Add new page if needed
      if (yPosition > 180) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text('Top 10 Products', 20, yPosition);
      yPosition += 10;
      
      const productData = data.topProducts.slice(0, 10).map((product, index) => [
        index + 1,
        product.sku || '-',
        product.name.length > 35 ? product.name.substring(0, 35) + '...' : product.name,
        product.quantitySold.toLocaleString(),
        formatCurrency(product.revenue),
        formatCurrency(product.profit),
        `${product.profitMargin.toFixed(1)}%`
      ]);
      
      (doc as any).autoTable({
        startY: yPosition,
        head: [['#', 'SKU', 'Product Name', 'Qty', 'Revenue', 'Profit', 'Margin']],
        body: productData,
        theme: 'striped',
        headStyles: { 
          fillColor: [168, 85, 247],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 8,
          cellPadding: 2
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 25 },
          2: { cellWidth: 50 },
          3: { cellWidth: 20, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' },
          5: { cellWidth: 30, halign: 'right' },
          6: { cellWidth: 20, halign: 'right' }
        }
      });
    }
    
    // Growth Analysis (if available)
    if (data.growth && options.reportTemplate === 'detailed') {
      const finalY = (doc as any).lastAutoTable?.finalY || yPosition;
      if (finalY > 220) {
        doc.addPage();
        yPosition = 20;
      } else {
        yPosition = finalY + 15;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);
      doc.text('Growth Analysis', 20, yPosition);
      yPosition += 10;
      
      const growthData = [
        ['Revenue Growth', `${data.growth.revenue > 0 ? '+' : ''}${data.growth.revenue.toFixed(1)}%`],
        ['Transaction Growth', `${data.growth.transactions > 0 ? '+' : ''}${data.growth.transactions.toFixed(1)}%`],
        ['Profit Growth', `${data.growth.profit > 0 ? '+' : ''}${data.growth.profit.toFixed(1)}%`]
      ];
      
      (doc as any).autoTable({
        startY: yPosition,
        head: [['Metric', 'Growth Rate']],
        body: growthData,
        theme: 'grid',
        headStyles: { 
          fillColor: [249, 115, 22],
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        styles: { 
          fontSize: 9,
          cellPadding: 3
        }
      });
    }
    
    // Footer with page numbers
    const pageCount = (doc as any).getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Halaman ${i} dari ${pageCount}`, (doc as any).internal.pageSize.width - 30, (doc as any).internal.pageSize.height - 10, { align: 'right' });
      doc.text('Generated by Hiban Analytics', 20, (doc as any).internal.pageSize.height - 10);
    }
    
    // Save PDF
    const fileName = `laporan-penjualan-${format(new Date(), 'yyyy-MM-dd-HHmm')}.pdf`;
    doc.save(fileName);
    
    return {
      success: true,
      fileName
    };
  } catch (error) {
    console.error('PDF generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Gagal membuat PDF'
    };
  }
};