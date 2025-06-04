"use client";

import { FormProvider, useForm } from "react-hook-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect } from "react";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ThemeProviders } from "@/providers/theme-providers";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";
import { AuthProvider } from "@/contexts/AuthContext";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data freshness and caching
      staleTime: 1000 * 60 * 5, // 5 minutes - Consider data fresh for 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours - Keep unused data in cache for 24 hours

      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff, max 30s

      // Refetch behavior
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnMount: true, // Refetch when component mounts
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchInterval: false, // Disable automatic refetching by default

      // Data persistence
      placeholderData: (previousData) => previousData, // Keep previous data while loading

      // Error handling
      throwOnError: false, // Don't throw errors to the UI by default

      // Network behavior
      networkMode: "online", // Only run queries when online

      // Suspense mode
      suspense: false, // Disable suspense mode by default
    },
    mutations: {
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000), // Exponential backoff, max 15s

      // Error handling
      throwOnError: false, // Don't throw errors to the UI by default

      // Network behavior
      networkMode: "online", // Only run mutations when online
    },
  },
  // Global query client settings
  logger: {
    log: (...args) => {
      if (process.env.NODE_ENV === "development") {
        console.log(...args);
      }
    },
    warn: (...args) => {
      if (process.env.NODE_ENV === "development") {
        console.warn(...args);
      }
    },
    error: (...args) => {
      // Always log errors in both development and production
      console.error(...args);
    },
  },
});

// Analytics Provider
const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const analytics = useAnalytics();

  // Track page views on route changes
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      analytics.trackPageView(url);
    };

    // Track initial page view
    analytics.trackPageView(window.location.pathname);

    // Add route change listener
    window.addEventListener("popstate", () =>
      handleRouteChange(window.location.pathname)
    );

    return () => {
      window.removeEventListener("popstate", () =>
        handleRouteChange(window.location.pathname)
      );
    };
  }, [analytics]);

  return <>{children}</>;
};

// Logger Provider
const LoggerProvider = ({ children }: { children: ReactNode }) => {
  const logger = useLogger({ context: "App" });

  // Log unhandled errors
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      logger.error("Unhandled error occurred", error);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, [logger]);

  return <>{children}</>;
};

// Combined Providers
export function AppProviders({ children }: { children: ReactNode }) {
  const methods = useForm();

  return (
    <QueryClientProvider client={queryClient}>
      <LoggerProvider>
        <AnalyticsProvider>
          <AuthProvider>
          <ThemeProviders>
            <FormProvider {...methods}>
              <SidebarProvider>{children}</SidebarProvider>
            </FormProvider>
          </ThemeProviders>
          </AuthProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </AnalyticsProvider>
      </LoggerProvider>
    </QueryClientProvider>
  );
}
