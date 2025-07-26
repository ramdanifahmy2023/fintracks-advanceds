
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, Image, FileSpreadsheet, MessageCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeframe: string;
  selectedData: any;
}

export const AnalyticsExportModal = ({ 
  isOpen, 
  onClose, 
  timeframe, 
  selectedData 
}: ExportModalProps) => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'excel' | 'summary'>('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeCharts: true,
    includeKPIs: true,
    includeTrends: true,
    includeInsights: true,
    includeRawData: false
  });
  const [isExporting, setIsExporting] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      switch (exportFormat) {
        case 'pdf':
          await generatePDFReport();
          break;
        case 'png':
          await exportChartsAsPNG();
          break;
        case 'excel':
          await generateExcelReport();
          break;
        case 'summary':
          await generateBusinessSummary();
          break;
      }
      toast.success('Ekspor berhasil diselesaikan!');
      onClose();
    } catch (error: any) {
      toast.error(`Ekspor gagal: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const generatePDFReport = async () => {
    const doc = new jsPDF();
    
    doc.text("Laporan Analisis", 14, 22);
    doc.setFontSize(11);
    doc.text(`Periode: ${timeframe}`, 14, 30);
    doc.text(`Dibuat pada: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 36);

    autoTable(doc, {
      startY: 50,
      head: [['Metrik', 'Nilai']],
      body: [
        ['Total Omset', formatCurrency(selectedData?.totalRevenue || 0)],
        ['Total Profit', formatCurrency(selectedData?.totalProfit || 0)],
        ['Margin Profit', `${(selectedData?.profitMargin || 0).toFixed(1)}%`],
        ['Total Transaksi', (selectedData?.totalTransactions || 0).toLocaleString()],
      ],
    });

    doc.save(`laporan-analisis-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const exportChartsAsPNG = async () => {
    toast.info('Fitur ekspor grafik akan diimplementasikan dengan library html2canvas');
  };

  const generateExcelReport = async () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([
      { Metrik: "Total Omset", Nilai: selectedData?.totalRevenue || 0 },
      { Metrik: "Total Profit", Nilai: selectedData?.totalProfit || 0 },
      { Metrik: "Margin Profit", Nilai: `${(selectedData?.profitMargin || 0).toFixed(1)}%` },
      { Metrik: "Total Transaksi", Nilai: selectedData?.totalTransactions || 0 },
    ]);
    XLSX.utils.book_append_sheet(wb, ws, "Ringkasan");
    XLSX.writeFile(wb, `data-analisis-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const generateBusinessSummary = async () => {
    const summary = `
📊 *RINGKASAN ANALISIS - HIBAN STORE*

📅 Periode: ${timeframe}

💰 *METRIK UTAMA*
- Total Omset: *${formatCurrency(selectedData?.totalRevenue || 0)}*
- Total Profit: *${formatCurrency(selectedData?.totalProfit || 0)}*
- Margin Profit: *${(selectedData?.profitMargin || 0).toFixed(1)}%*
- Tingkat Pertumbuhan: *${(selectedData?.growthRate || 0) > 0 ? '+' : ''}${(selectedData?.growthRate || 0).toFixed(1)}%*

📈 *WAWASAN*
- Tren performa: ${(selectedData?.growthRate || 0) > 0 ? 'Positif 📈' : 'Perlu perhatian 📉'}
- Kesehatan bisnis: ${(selectedData?.profitMargin || 0) > 20 ? 'Sangat Baik' : (selectedData?.profitMargin || 0) > 10 ? 'Baik' : 'Sedang Berkembang'}

─────────────────────
🤖 Dibuat oleh Hiban Analytics
⏰ ${format(new Date(), 'dd MMM yyyy, HH:mm')}
    `.trim();

    try {
      await navigator.clipboard.writeText(summary);
      toast.success('Ringkasan bisnis berhasil disalin ke clipboard!');
    } catch (error) {
      const blob = new Blob([summary], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ringkasan-bisnis-${format(new Date(), 'yyyy-MM-dd')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2 text-primary" />
            Ekspor Laporan Analisis
          </DialogTitle>
          <DialogDescription>
            Buat laporan analisis komprehensif dalam berbagai format
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Export Format Selection */}
          <div className="space-y-3">
            <Label>Format Ekspor</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'pdf', label: 'Laporan PDF', icon: FileText, desc: 'Laporan lengkap dengan grafik' },
                { value: 'png', label: 'Gambar Grafik', icon: Image, desc: 'Ekspor grafik resolusi tinggi' },
                { value: 'excel', label: 'Data Excel', icon: FileSpreadsheet, desc: 'Data mentah dalam spreadsheet' },
                { value: 'summary', label: 'Ringkasan WhatsApp', icon: MessageCircle, desc: 'Teks ringkasan cepat' }
              ].map((format) => (
                <div
                  key={format.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    exportFormat === format.value 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setExportFormat(format.value as any)}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <format.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{format.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{format.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Export Options */}
          <div className="space-y-3">
            <Label>Sertakan dalam Ekspor</Label>
            <div className="space-y-2">
              {[
                { key: 'includeCharts', label: 'Grafik & Visualisasi' },
                { key: 'includeKPIs', label: 'Indikator Kinerja Utama' },
                { key: 'includeTrends', label: 'Analisis Tren' },
                { key: 'includeInsights', label: 'Wawasan Bisnis' },
                { key: 'includeRawData', label: 'Tabel Data Mentah' }
              ].map((option) => (
                <div key={option.key} className="flex items-center space-x-2">
                  <Checkbox
                    checked={exportOptions[option.key as keyof typeof exportOptions]}
                    onCheckedChange={(checked) => 
                      setExportOptions(prev => ({ ...prev, [option.key]: checked }))
                    }
                  />
                  <label className="text-sm">{option.label}</label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Export Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengekspor...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Ekspor Laporan
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
