import { useState } from 'react';
import { Calendar, ChevronDown, Filter, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useDateFilter } from '@/contexts/DateFilterContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const presetOptions = [
  { label: 'Hari Ini', value: 'today', action: 'today' },
  { label: 'Kemarin', value: 'yesterday', action: 'yesterday' },
  { label: 'Minggu Ini', value: 'thisWeek', action: 'thisWeek' },
  { label: 'Bulan Ini', value: 'thisMonth', action: 'thisMonth' },
  { label: 'Bulan Lalu', value: 'lastMonth', action: 'lastMonth' },
];

export const GlobalDateFilter = () => {
  const { dateRange, setDateRange, presets, formatDateRange } = useDateFilter();
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [tempFromDate, setTempFromDate] = useState<Date>(dateRange.from);
  const [tempToDate, setTempToDate] = useState<Date>(dateRange.to);

  console.log('🗓️ GlobalDateFilter: Rendered with dateRange:', {
    from: format(dateRange.from, 'yyyy-MM-dd'),
    to: format(dateRange.to, 'yyyy-MM-dd'),
    preset: dateRange.preset
  });

  const handlePresetClick = (action: keyof typeof presets) => {
    console.log('🗓️ GlobalDateFilter: Preset clicked:', action);
    presets[action]();
  };

  const handleCustomDateSubmit = () => {
    console.log('🗓️ GlobalDateFilter: Custom date applied:', {
      from: format(tempFromDate, 'yyyy-MM-dd'),
      to: format(tempToDate, 'yyyy-MM-dd')
    });
    setDateRange({
      from: tempFromDate,
      to: tempToDate,
      preset: 'custom'
    });
    setIsCustomOpen(false);
  };

  const openCustomPicker = () => {
    setTempFromDate(dateRange.from);
    setTempToDate(dateRange.to);
    setIsCustomOpen(true);
  };

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <Card className="mx-4 my-4 border-0 shadow-lg bg-card/95 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Left Section - Filter Label */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Filter className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Filter Periode</h3>
                <p className="text-sm text-muted-foreground">
                  {formatDateRange()}
                </p>
              </div>
            </div>

            {/* Right Section - Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Preset Buttons */}
              <div className="flex flex-wrap gap-2">
                {presetOptions.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={dateRange.preset === preset.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePresetClick(preset.action as keyof typeof presets)}
                    className={cn(
                      "transition-all duration-200 hover:scale-105",
                      dateRange.preset === preset.value && "shadow-md"
                    )}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              {/* Custom Date Range Picker */}
              <Popover open={isCustomOpen} onOpenChange={setIsCustomOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openCustomPicker}
                    className={cn(
                      "justify-start text-left font-normal min-w-[200px] transition-all duration-200 hover:scale-105",
                      dateRange.preset === 'custom' && "border-primary bg-primary/5"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    <span className="truncate">
                      {dateRange.preset === 'custom' ? 'Custom Range' : 'Pilih Custom'}
                    </span>
                    <ChevronDown className="ml-auto h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0 bg-popover/95 backdrop-blur-sm border shadow-xl" 
                  align="end"
                  sideOffset={8}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* From Date Calendar */}
                    <div className="p-4 border-b sm:border-b-0 sm:border-r border-border">
                      <div className="text-sm font-medium mb-3 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Dari Tanggal
                      </div>
                      <CalendarComponent
                        mode="single"
                        selected={tempFromDate}
                        onSelect={(date) => date && setTempFromDate(date)}
                        disabled={(date) => date > tempToDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </div>
                    
                    {/* To Date Calendar */}
                    <div className="p-4">
                      <div className="text-sm font-medium mb-3 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Sampai Tanggal
                      </div>
                      <CalendarComponent
                        mode="single"
                        selected={tempToDate}
                        onSelect={(date) => date && setTempToDate(date)}
                        disabled={(date) => date < tempFromDate}
                        className="p-3 pointer-events-auto"
                      />
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="p-4 border-t border-border bg-muted/50 flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      {format(tempFromDate, 'dd MMM yyyy')} - {format(tempToDate, 'dd MMM yyyy')}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsCustomOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button size="sm" onClick={handleCustomDateSubmit}>
                        Terapkan
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Current Range Badge */}
              {dateRange.preset && (
                <Badge variant="secondary" className="hidden sm:flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {presetOptions.find(p => p.value === dateRange.preset)?.label || 'Custom'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};