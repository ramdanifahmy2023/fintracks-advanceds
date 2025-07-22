export const formatCurrency = (amount: number, compact = false): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard'
  }).format(amount).replace('IDR', 'Rp');
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return new Intl.NumberFormat('id-ID').format(num);
  }
  return num.toString();
};

export const formatPercentage = (num: number): string => {
  return `${num.toFixed(1)}%`;
};

export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// NEW FUNCTIONS FOR PROFIT ANALYTICS
export const calculateProfitMargin = (revenue: number, profit: number): number => {
  return revenue > 0 ? (profit / revenue) * 100 : 0;
};

export const formatCurrencyCompact = (amount: number): string => {
  return formatCurrency(amount, true);
};