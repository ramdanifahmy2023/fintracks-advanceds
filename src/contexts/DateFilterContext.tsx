import React, { createContext, useContext, useState, ReactNode } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay, subDays, subMonths, format } from 'date-fns';
import { id } from 'date-fns/locale';

interface DateRange {
  from: Date;
  to: Date;
  preset?: string;
}

interface DateFilterContextType {
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  presets: {
    today: () => void;
    yesterday: () => void;
    thisWeek: () => void;
    thisMonth: () => void;
    lastMonth: () => void;
  };
  formatDateRange: () => string;
}

const DateFilterContext = createContext<DateFilterContextType | undefined>(undefined);

export const useDateFilter = () => {
  const context = useContext(DateFilterContext);
  if (context === undefined) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
};

interface DateFilterProviderProps {
  children: ReactNode;
}

export const DateFilterProvider: React.FC<DateFilterProviderProps> = ({ children }) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
    preset: 'thisMonth'
  });

  const presets = {
    today: () => {
      const today = new Date();
      setDateRange({
        from: startOfDay(today),
        to: endOfDay(today),
        preset: 'today'
      });
    },
    yesterday: () => {
      const yesterday = subDays(new Date(), 1);
      setDateRange({
        from: startOfDay(yesterday),
        to: endOfDay(yesterday),
        preset: 'yesterday'
      });
    },
    thisWeek: () => {
      const today = new Date();
      setDateRange({
        from: startOfWeek(today, { weekStartsOn: 1 }),
        to: endOfWeek(today, { weekStartsOn: 1 }),
        preset: 'thisWeek'
      });
    },
    thisMonth: () => {
      const today = new Date();
      setDateRange({
        from: startOfMonth(today),
        to: endOfMonth(today),
        preset: 'thisMonth'
      });
    },
    lastMonth: () => {
      const lastMonth = subMonths(new Date(), 1);
      setDateRange({
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
        preset: 'lastMonth'
      });
    }
  };

  const formatDateRange = () => {
    if (dateRange.preset === 'today') return 'Hari Ini';
    if (dateRange.preset === 'yesterday') return 'Kemarin';
    if (dateRange.preset === 'thisWeek') return 'Minggu Ini';
    if (dateRange.preset === 'thisMonth') return 'Bulan Ini';
    if (dateRange.preset === 'lastMonth') return 'Bulan Lalu';
    
    return `${format(dateRange.from, 'dd MMM', { locale: id })} - ${format(dateRange.to, 'dd MMM yyyy', { locale: id })}`;
  };

  const value: DateFilterContextType = {
    dateRange,
    setDateRange,
    presets,
    formatDateRange
  };

  return (
    <DateFilterContext.Provider value={value}>
      {children}
    </DateFilterContext.Provider>
  );
};

export default DateFilterContext;