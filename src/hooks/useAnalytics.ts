import { sendGAEvent } from "@next/third-parties/google";
import { useCallback, useMemo } from "react";
import { useLogger } from "./useLogger";
import { useConsent } from "@/contexts/ConsentContext";

export type AnalyticsEvent = {
  event: string;
  [key: string]: any;
};

export const useAnalytics = () => {
  const logger = useLogger({ context: "Analytics" });
  const { consentStatus, preferences } = useConsent();

  // Memoize consent check to reduce recreations
  const hasConsent = useMemo(() => {
    return consentStatus === 'granted' && preferences.analytics;
  }, [consentStatus, preferences.analytics]);

  // More stable trackEvent with fewer dependencies
  const trackEvent = useCallback(
    async (event: AnalyticsEvent) => {
      try {
        if (!hasConsent) {
          logger.debug(`Event blocked (no consent): ${event.event}`, event);
          return;
        }

        if (process.env.NODE_ENV === "development") {
          logger.debug(`Event sent: ${event.event}`, event);
          return;
        }
        
        await sendGAEvent(event);
        logger.debug(`Event sent: ${event.event}`, event);
      } catch (error) {
        logger.error(`Failed to send event: ${event.event}`, error);
      }
    },
    [hasConsent, logger] // Reduced dependencies
  );

  // Track page view
  const trackPageView = useCallback(
    (path: string, title: string = "Page View") => {
      trackEvent({
        event: "page_view",
        page_path: path,
        page_title: title,
      });
    },
    [trackEvent]
  );

  // Track user action
  const trackUserAction = useCallback(
    (action: string, category: string, label?: string, value?: number) => {
      trackEvent({
        event: "user_action",
        action,
        category,
        label,
        value,
      });
    },
    [trackEvent]
  );

  // Track error
  const trackError = useCallback(
    (error: Error, context?: Record<string, any>) => {
      trackEvent({
        event: "error",
        error_name: error.name,
        error_message: error.message,
        error_stack: error.stack,
        ...context,
      });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackPageView,
    trackUserAction,
    trackError,
    hasConsent,
  };
};
