
import React from "react";

// Temporarily disabled Sonner to prevent conflicts with shadcn toast
// This component is kept for compatibility but will return null

type ToasterProps = {
  theme?: "light" | "dark" | "system";
  className?: string;
  toastOptions?: any;
};

const Toaster = ({ ...props }: ToasterProps) => {
  // Disabled to prevent toast system conflicts
  console.log('Sonner Toaster disabled to prevent conflicts');
  return null;
};

export { Toaster };
