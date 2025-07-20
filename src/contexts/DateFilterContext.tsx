import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DateRange } from 'react-day-picker';
import { subDays, startOfMonth, endOfMonth } from 'date-fns';

// Mendefinisikan tipe untuk state filter
interface FilterState {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
  setPreset: (preset: string) => void;
  selectedPreset: string;
}

// Membuat context dengan nilai default
const DateFilterContext = createContext<FilterState | undefined>(undefined);

// Props untuk provider
interface DateFilterProviderProps {
  children: ReactNode;
}

// Preset tanggal yang bisa dipilih
const PRESETS = {
  today: { from: new Date(), to: new Date() },
  last7days: { from: subDays(new Date(), 6), to: new Date() },
  last30days: { from: subDays(new Date(), 29), to: new Date() },
  thisMonth: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) },
  lastMonth: { 
    from: startOfMonth(subDays(new Date(), new Date().getDate())), 
    to: endOfMonth(subDays(new Date(), new Date().getDate())) 
  },
};

/**
 * Provider untuk DateFilterContext.
 * Membungkus aplikasi Anda dengan provider ini agar bisa mengakses state filter tanggal.
 * @param {DateFilterProviderProps} props
 */
export const DateFilterProvider = ({ children }: DateFilterProviderProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(PRESETS.last30days);
  const [selectedPreset, setSelectedPreset] = useState<string>('last30days');

  // Fungsi untuk mengubah preset tanggal
  const setPreset = (preset: string) => {
    if (PRESETS[preset as keyof typeof PRESETS]) {
      setDateRange(PRESETS[preset as keyof typeof PRESETS]);
      setSelectedPreset(preset);
    } else {
        setSelectedPreset('custom');
    }
  };

  const value = { dateRange, setDateRange, setPreset, selectedPreset };

  return (
    <DateFilterContext.Provider value={value}>
      {children}
    </DateFilterContext.Provider>
  );
};

/**
 * Hook kustom untuk menggunakan DateFilterContext.
 * @returns {FilterState} - State dan fungsi-fungsi dari context.
 * @throws {Error} - Jika digunakan di luar DateFilterProvider.
 */
export const useDateFilter = (): FilterState => {
  const context = useContext(DateFilterContext);
  if (context === undefined) {
    throw new Error('useDateFilter must be used within a DateFilterProvider');
  }
  return context;
};