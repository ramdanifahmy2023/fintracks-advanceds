
import { createContext, useContext, useState, ReactNode } from 'react';
import { startOfMonth, endOfMonth, startOfWeek, subDays, subMonths, format } from 'date-fns';

export interface DateRange {
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
  if (!context) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
};

interface DateFilterProviderProps {
  children: ReactNode;
}

export function DateFilterProvider({ children }: DateFilterProviderProps) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfMonth(new Date()),
    to: new Date(),
    preset: 'thisMonth'
  });

  // Console log whenever dateRange changes
  const handleSetDateRange = (range: DateRange) => {
    console.log('🗓️ DateFilter: Range changed:', {
      from: format(range.from, 'yyyy-MM-dd'),
      to: format(range.to, 'yyyy-MM-dd'),
      preset: range.preset,
      formattedDisplay: `${format(range.from, 'dd MMM yyyy')} - ${format(range.to, 'dd MMM yyyy')}`
    });
    setDateRange(range);
  };

  const presets = {
    today: () => {
      const today = new Date();
      handleSetDateRange({ from: today, to: today, preset: 'today' });
    },
    yesterday: () => {
      const yesterday = subDays(new Date(), 1);
      handleSetDateRange({ from: yesterday, to: yesterday, preset: 'yesterday' });
    },
    thisWeek: () => {
      handleSetDateRange({ 
        from: startOfWeek(new Date(), { weekStartsOn: 1 }), 
        to: new Date(),
        preset: 'thisWeek'
      });
    },
    thisMonth: () => {
      handleSetDateRange({ 
        from: startOfMonth(new Date()), 
        to: new Date(),
        preset: 'thisMonth'
      });
    },
    lastMonth: () => {
      const lastMonth = subMonths(new Date(), 1);
      handleSetDateRange({ 
        from: startOfMonth(lastMonth), 
        to: endOfMonth(lastMonth),
        preset: 'lastMonth'
      });
    }
  };

  const formatDateRange = () => {
    return `${format(dateRange.from, 'dd MMM yyyy')} - ${format(dateRange.to, 'dd MMM yyyy')}`;
  };

  const contextValue: DateFilterContextType = {
    dateRange,
    setDateRange: handleSetDateRange,
    presets,
    formatDateRange
  };

  return (
    <DateFilterContext.Provider value={contextValue}>
      {children}
    </DateFilterContext.Provider>
  );
}
