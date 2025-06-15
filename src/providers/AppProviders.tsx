"use client";

import { FormProvider, useForm } from "react-hook-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useEffect, useState, useRef } from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SearchParamsProvider } from "./SearchParamsProvider";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ThemeProviders } from "@/providers/theme-providers";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useLogger } from "@/hooks/useLogger";
import { ConsentProvider } from "@/contexts/ConsentContext";

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
});

// Fixed AnalyticsProvider - remove analytics dependency and use refs
const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const analytics = useAnalytics();
  const [hasTrackedInitial, setHasTrackedInitial] = useState(false);
  const analyticsRef = useRef(analytics);
  
  // Update ref when analytics changes
  useEffect(() => {
    analyticsRef.current = analytics;
  }, [analytics]);

  // Track initial page view - only once
  useEffect(() => {
    if (!hasTrackedInitial) {
      analyticsRef.current.trackPageView(window.location.pathname, document.title);
      setHasTrackedInitial(true);
    }
  }, [hasTrackedInitial]); // No analytics dependency

  // Track route changes - setup only once  
  useEffect(() => {
    const handleRouteChange = () => {
      analyticsRef.current.trackPageView(window.location.pathname);
    };

    window.addEventListener("popstate", handleRouteChange);
    return () => window.removeEventListener("popstate", handleRouteChange);
  }, []); // Empty dependency - setup once only

  return <>{children}</>;
};

// Fixed LoggerProvider - remove logger from dependencies
const LoggerProvider = ({ children }: { children: ReactNode }) => {
  const logger = useLogger({ context: "App" });
  const loggerRef = useRef(logger);
  
  // Update ref when logger changes
  useEffect(() => {
    loggerRef.current = logger;
  }, [logger]);

  // Log unhandled errors - setup once only
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      loggerRef.current.error("Unhandled error occurred", error);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []); // No logger dependency

  return <>{children}</>;
};

// Combined Providers
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
                  <AnalyticsProvider>
                    <SidebarProvider>{children}</SidebarProvider>
                  </AnalyticsProvider>
                </FormProvider>
              </ThemeProviders>
            </AuthProvider>
          </ConsentProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </LoggerProvider>
      </SearchParamsProvider>
    </QueryClientProvider>
  );
}
