import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  FileSpreadsheet, 
  Download, 
  MessageCircle,
  Loader2,
  Check,
  Copy,
  Share2
} from 'lucide-react';
import { ExportFormat, ExportOptions, ExportData, ExportResult } from '@/types/export';
import { generatePDFReport } from '@/lib/export/pdfGenerator';
import { generateExcelReport } from '@/lib/export/excelGenerator';
import { generateCSVReport } from '@/lib/export/csvGenerator';
import { generateWhatsAppSummary } from '@/lib/export/whatsappGenerator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExportData;
  className?: string;
}

export const ExportModal = ({ isOpen, onClose, data, className }: ExportModalProps) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat['id']>('pdf');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeCharts: true,
    includeSummary: true,
    pageOrientation: 'portrait',
    reportTemplate: 'executive',
    includeFormulas: true,
    multipleSheets: true,
    formatCurrency: true,
    includeEmoji: true,
    compactFormat: true,
    keyMetricsOnly: false
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const { toast } = useToast();

  const exportFormats: ExportFormat[] = [
    {
      id: 'pdf',
      name: 'PDF Report',
      description: 'Laporan lengkap dengan charts dan summary',
      icon: FileText
    },
    {
      id: 'excel',
      name: 'Excel Spreadsheet',
      description: 'Data terstruktur dengan multiple sheets',
      icon: FileSpreadsheet
    },
    {
      id: 'csv',
      name: 'CSV Data',
      description: 'Raw data untuk analisis external',
      icon: Download
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Summary',
      description: 'Summary ringkas untuk sharing',
      icon: MessageCircle
    }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportResult(null);

    try {
      let result: ExportResult;

      setExportProgress(20);

      switch (selectedFormat) {
        case 'pdf':
          result = await generatePDFReport(data, exportOptions);
          break;
        case 'excel':
          result = await generateExcelReport(data, exportOptions);
          break;
        case 'csv':
          result = await generateCSVReport(data, exportOptions);
          break;
        case 'whatsapp':
          result = await generateWhatsAppSummary(data, exportOptions);
          break;
        default:
          throw new Error('Format tidak didukung');
      }

      setExportProgress(100);
      setExportResult(result);

      if (result.success) {
        toast({
          title: "Export Berhasil",
          description: `File ${selectedFormat.toUpperCase()} berhasil dibuat`,
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Export error:', error);
      setExportResult({
        success: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan saat export'
      });
      toast({
        title: "Export Gagal",
        description: "Terjadi kesalahan saat membuat file export",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setIsExporting(false);
    setExportProgress(0);
    setExportResult(null);
    setSelectedFormat('pdf');
  };

  const getFormatOptions = () => {
    switch (selectedFormat) {
      case 'pdf':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeSummary"
                checked={exportOptions.includeSummary}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeSummary: !!checked }))
                }
              />
              <Label htmlFor="includeSummary">Include Executive Summary</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeCharts"
                checked={exportOptions.includeCharts}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeCharts: !!checked }))
                }
              />
              <Label htmlFor="includeCharts">Include Charts & Tables</Label>
            </div>

            <div className="space-y-2">
              <Label>Page Orientation</Label>
              <RadioGroup
                value={exportOptions.pageOrientation}
                onValueChange={(value) => 
                  setExportOptions(prev => ({ ...prev, pageOrientation: value as 'portrait' | 'landscape' }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="portrait" id="portrait" />
                  <Label htmlFor="portrait">Portrait</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="landscape" id="landscape" />
                  <Label htmlFor="landscape">Landscape</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Report Template</Label>
              <Select
                value={exportOptions.reportTemplate}
                onValueChange={(value) => 
                  setExportOptions(prev => ({ ...prev, reportTemplate: value as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive Summary</SelectItem>
                  <SelectItem value="detailed">Detailed Report</SelectItem>
                  <SelectItem value="summary">Quick Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'excel':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="multipleSheets"
                checked={exportOptions.multipleSheets}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, multipleSheets: !!checked }))
                }
              />
              <Label htmlFor="multipleSheets">Multiple Sheets</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeFormulas"
                checked={exportOptions.includeFormulas}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeFormulas: !!checked }))
                }
              />
              <Label htmlFor="includeFormulas">Include Formulas</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="formatCurrency"
                checked={exportOptions.formatCurrency}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, formatCurrency: !!checked }))
                }
              />
              <Label htmlFor="formatCurrency">Format Currency</Label>
            </div>
          </div>
        );

      case 'csv':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeHeaders"
                checked={exportOptions.includeHeaders}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeHeaders: !!checked }))
                }
              />
              <Label htmlFor="includeHeaders">Include Headers</Label>
            </div>

            <div className="space-y-2">
              <Label>Delimiter</Label>
              <Select
                value={exportOptions.delimiter}
                onValueChange={(value) => 
                  setExportOptions(prev => ({ ...prev, delimiter: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">Comma (,)</SelectItem>
                  <SelectItem value=";">Semicolon (;)</SelectItem>
                  <SelectItem value="\t">Tab</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Encoding</Label>
              <Select
                value={exportOptions.encoding}
                onValueChange={(value) => 
                  setExportOptions(prev => ({ ...prev, encoding: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTF-8">UTF-8</SelectItem>
                  <SelectItem value="Windows-1252">Windows-1252</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'whatsapp':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeEmoji"
                checked={exportOptions.includeEmoji}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeEmoji: !!checked }))
                }
              />
              <Label htmlFor="includeEmoji">Include Emojis</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="compactFormat"
                checked={exportOptions.compactFormat}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, compactFormat: !!checked }))
                }
              />
              <Label htmlFor="compactFormat">Compact Format</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="keyMetricsOnly"
                checked={exportOptions.keyMetricsOnly}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, keyMetricsOnly: !!checked }))
                }
              />
              <Label htmlFor="keyMetricsOnly">Key Metrics Only</Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-3xl", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Export Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Pilih Format Export</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {exportFormats.map((format) => {
                const Icon = format.icon;
                return (
                  <Card
                    key={format.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      selectedFormat === format.id ? "ring-2 ring-primary bg-primary/5" : ""
                    )}
                    onClick={() => setSelectedFormat(format.id)}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <h4 className="font-medium text-sm">{format.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Options</Label>
            <Card>
              <CardContent className="p-4">
                {getFormatOptions()}
              </CardContent>
            </Card>
          </div>

          {/* Progress & Result */}
          {isExporting && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Generating {selectedFormat.toUpperCase()} file...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} />
            </div>
          )}

          {exportResult && (
            <div className="space-y-3">
              {exportResult.success ? (
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span>Export berhasil!</span>
                  {exportResult.fileName && (
                    <Badge variant="secondary">{exportResult.fileName}</Badge>
                  )}
                </div>
              ) : (
                <div className="text-red-600">
                  <p>Export gagal: {exportResult.error}</p>
                </div>
              )}
            </div>
          )}

          {/* Preview Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Preview</Label>
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Data Period:</span>
                    <span>{data.dateRange.from.toLocaleDateString()} - {data.dateRange.to.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Transactions:</span>
                    <span>{data.summary.totalTransactions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Revenue:</span>
                    <span>Rp {data.summary.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platforms:</span>
                    <span>{data.platformPerformance.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Products:</span>
                    <span>{data.topProducts.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isExporting}>
              Batal
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={isExporting}>
              Reset
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export {selectedFormat.toUpperCase()}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};