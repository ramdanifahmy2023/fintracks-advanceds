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
const presetOptions = [{
  label: 'Hari Ini',
  value: 'today',
  action: 'today'
}, {
  label: 'Kemarin',
  value: 'yesterday',
  action: 'yesterday'
}, {
  label: 'Minggu Ini',
  value: 'thisWeek',
  action: 'thisWeek'
}, {
  label: 'Bulan Ini',
  value: 'thisMonth',
  action: 'thisMonth'
}, {
  label: 'Bulan Lalu',
  value: 'lastMonth',
  action: 'lastMonth'
}];
export const GlobalDateFilter = () => {
  const {
    dateRange,
    setDateRange,
    presets,
    formatDateRange
  } = useDateFilter();
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
  return;
};