"use client";

import { FormProvider, useForm } from "react-hook-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SidebarProvider } from "./SidebarContext";
import { ThemeProviders } from "./theme-providers";
import { Toaster } from "react-hot-toast";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1 * 60 * 1000, // 5 minutes
            cacheTime: 30 * 60 * 1000, // 30 minutes
            retry: 3, // retry 3 times
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000), // 30 seconds
            refetchOnWindowFocus: true, // refetch on window focus
            refetchOnMount: true, // refetch on mount
            refetchOnReconnect: true, // refetch on reconnect
            suspense: false, // disable suspense
            keepPreviousData: true, // keep previous data
          },
          mutations: {
            retry: 2,
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 15000), // 15 seconds
          },
        },
      })
  );
  const methods = useForm();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProviders>
        <FormProvider {...methods}>
          <SidebarProvider>
            {children}
            <Toaster />
          </SidebarProvider>
        </FormProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProviders>
    </QueryClientProvider>
  );
}
