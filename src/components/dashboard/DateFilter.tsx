import { useState } from 'react';
import { Calendar, ChevronDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subMonths } from 'date-fns';
import { DateRange } from '@/hooks/useFinancialDashboard';

interface DateFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const presets = [
  { label: 'Hari Ini', value: 'today' },
  { label: '7 Hari Terakhir', value: '7days' },
  { label: '30 Hari Terakhir', value: '30days' },
  { label: 'Bulan Ini', value: 'thisMonth' },
  { label: 'Bulan Lalu', value: 'lastMonth' },
  { label: 'Tahun Ini', value: 'thisYear' },
  { label: 'Custom', value: 'custom' },
];

const getDateRangeFromPreset = (preset: string): DateRange => {
  const today = new Date();
  
  switch (preset) {
    case 'today':
      return { from: today, to: today, preset };
    case '7days':
      return { from: subDays(today, 6), to: today, preset };
    case '30days':
      return { from: subDays(today, 29), to: today, preset };
    case 'thisMonth':
      return { from: startOfMonth(today), to: endOfMonth(today), preset };
    case 'lastMonth':
      const lastMonth = subMonths(today, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth), preset };
    case 'thisYear':
      return { from: startOfYear(today), to: endOfYear(today), preset };
    default:
      return { from: startOfMonth(today), to: endOfMonth(today), preset };
  }
};

export const DateFilter: React.FC<DateFilterProps> = ({
  dateRange,
  onDateRangeChange,
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [tempFromDate, setTempFromDate] = useState<Date>(dateRange.from);
  const [tempToDate, setTempToDate] = useState<Date>(dateRange.to);

  const handlePresetChange = (preset: string) => {
    const newRange = getDateRangeFromPreset(preset);
    onDateRangeChange(newRange);
  };

  const handleCustomDateSubmit = () => {
    onDateRangeChange({
      from: tempFromDate,
      to: tempToDate,
      preset: 'custom'
    });
    setIsCalendarOpen(false);
  };

  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Filter Periode</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Preset Selector */}
          <Select
            value={dateRange.preset || 'thisMonth'}
            onValueChange={handlePresetChange}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Pilih periode" />
            </SelectTrigger>
            <SelectContent>
              {presets.map((preset) => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Range Display */}
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {format(dateRange.from, 'dd MMM yyyy')} - {format(dateRange.to, 'dd MMM yyyy')}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="flex">
                <div className="p-3">
                  <div className="text-sm font-medium mb-2">Dari Tanggal</div>
                  <CalendarComponent
                    mode="single"
                    selected={tempFromDate}
                    onSelect={(date) => date && setTempFromDate(date)}
                    disabled={(date) => date > tempToDate}
                    initialFocus
                  />
                </div>
                <div className="p-3 border-l">
                  <div className="text-sm font-medium mb-2">Sampai Tanggal</div>
                  <CalendarComponent
                    mode="single"
                    selected={tempToDate}
                    onSelect={(date) => date && setTempToDate(date)}
                    disabled={(date) => date < tempFromDate}
                  />
                </div>
              </div>
              <div className="p-3 border-t flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCalendarOpen(false)}
                >
                  Batal
                </Button>
                <Button size="sm" onClick={handleCustomDateSubmit}>
                  Terapkan
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};