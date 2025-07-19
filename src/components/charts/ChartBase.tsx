import React from 'react';
import { cn } from '@/lib/utils';

// Simple chart wrapper component that we'll use for our dashboard
export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
  }
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('w-full h-full', className)}
      {...props}
    >
      {children}
    </div>
  );
});

ChartContainer.displayName = 'ChartContainer';

// Simple tooltip for charts
export const ChartTooltip = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const ChartTooltipContent = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};