"use client";

import { FormProvider, useForm } from "react-hook-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useRef } from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import { ConsentProvider } from "@/contexts/ConsentContext";
import { SearchParamsProvider } from "./SearchParamsProvider";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ThemeProviders } from "@/providers/theme-providers";
import { useLogger } from "@/hooks/useLogger";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data freshness and caching
      staleTime: 1000 * 60 * 10, // 10 minutes - increased from 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours - Keep unused data in cache for 24 hours

      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 429 (rate limit) or 4xx errors
        if (
          error?.response?.status === 429 ||
          (error?.response?.status >= 400 && error?.response?.status < 500)
        ) {
          return false;
        }
        // Retry up to 2 times for other errors (reduced from 3)
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000), // Reduced max delay

      // Refetch behavior - more conservative
      refetchOnWindowFocus: false, // Disabled to reduce requests
      refetchOnMount: false, // Disabled to reduce requests - use stale data if available
      refetchOnReconnect: true, // Keep this for network recovery
      refetchInterval: false, // Disable automatic refetching by default

      // Data persistence
      placeholderData: (previousData) => previousData, // Keep previous data while loading

      // Error handling
      throwOnError: false, // Don't throw errors to the UI by default

      // Network behavior
      networkMode: "online", // Only run queries when online
    },
    mutations: {
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 429 (rate limit) or 4xx errors
        if (
          error?.response?.status === 429 ||
          (error?.response?.status >= 400 && error?.response?.status < 500)
        ) {
          return false;
        }
        // Retry up to 1 time for other errors (reduced from 2)
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Reduced max delay

      // Error handling
      throwOnError: false, // Don't throw errors to the UI by default

      // Network behavior
      networkMode: "online", // Only run mutations when online
    },
  },
});

// Fixed LoggerProvider - keep this as it's not causing issues
const LoggerProvider = ({ children }: { children: ReactNode }) => {
  const logger = useLogger({ context: "App" });
  const loggerRef = useRef(logger);

  useEffect(() => {
    loggerRef.current = logger;
  }, [logger]);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      loggerRef.current.error("Unhandled error occurred", error);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  return <>{children}</>;
};

// Combined Providers - REMOVED AnalyticsProvider completely
export function AppProviders({ children }: { children: ReactNode }) {
  const methods = useForm();

  return (
    <QueryClientProvider client={queryClient}>
      <SearchParamsProvider>
        <LoggerProvider>
          <ConsentProvider>
            <AuthProvider>
              <ThemeProviders>
                <FormProvider {...methods}>
                  <SidebarProvider>{children}</SidebarProvider>
                </FormProvider>
              </ThemeProviders>
            </AuthProvider>
          </ConsentProvider>
          {/* <ReactQueryDevtools initialIsOpen={false} /> */}
        </LoggerProvider>
      </SearchParamsProvider>
    </QueryClientProvider>
  );
}
