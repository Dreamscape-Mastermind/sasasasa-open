import { sendGAEvent } from "@next/third-parties/google";
import { useCallback } from "react";
import { useLogger } from "./useLogger";

export type AnalyticsEvent = {
  event: string;
  [key: string]: any;
};

export const useAnalytics = () => {
  const logger = useLogger({ context: "Analytics" });

  // Track event - sends immediately
  const trackEvent = useCallback(
    async (event: AnalyticsEvent) => {
      try {
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
    [logger]
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
  };
};
