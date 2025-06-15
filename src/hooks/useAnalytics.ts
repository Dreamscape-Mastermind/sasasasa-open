import { sendGAEvent } from "@next/third-parties/google";
import { useCallback } from "react";
import { useLogger } from "./useLogger";
import { useConsent } from "@/contexts/ConsentContext";

export type AnalyticsEvent = {
  event: string;
  [key: string]: any;
};

export const useAnalytics = () => {
  const logger = useLogger({ context: "Analytics" });
  const { hasAnalyticsConsent, consentStatus, preferences } = useConsent();

  // Track event - sends immediately if consent is granted
  const trackEvent = useCallback(
    async (event: AnalyticsEvent) => {
      try {
        // Check consent before tracking inline to avoid function dependency
        const hasConsent = consentStatus === 'granted' && preferences.analytics;
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
    [logger, consentStatus, preferences.analytics]
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
    hasConsent: hasAnalyticsConsent, // Expose consent status
  };
};
