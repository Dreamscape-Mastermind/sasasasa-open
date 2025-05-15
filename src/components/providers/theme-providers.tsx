"use client";

import { ThemeProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";
import siteMetadata from "@/config/siteMetadata";

export function ThemeProviders({ children, ...props }: ThemeProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={siteMetadata.theme}
      enableSystem
      {...props}
    >
      {children}
    </ThemeProvider>
  );
}
