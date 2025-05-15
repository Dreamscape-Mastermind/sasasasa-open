"use client";

import { FormProvider, useForm } from "react-hook-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/context/auth-context";
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
            staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
            gcTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
            retry: 3, // retry 3 times
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000), // 30 seconds
            refetchOnWindowFocus: true, // refetch on window focus
            refetchOnMount: true, // refetch on mount
            refetchOnReconnect: true, // refetch on reconnect
            placeholderData: (previousData) => previousData, // keep previous data
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
        <AuthProvider>
          <FormProvider {...methods}>
            <SidebarProvider>
              {children}
              <Toaster />
            </SidebarProvider>
          </FormProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProviders>
    </QueryClientProvider>
  );
}
