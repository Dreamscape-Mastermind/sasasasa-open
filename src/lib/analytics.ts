// lib/analytics.ts
import { sendGAEvent } from "@next/third-parties/google";

type AnalyticsEvent = {
  event: string;
  [key: string]: any;
};

export function trackEvent(eventData: AnalyticsEvent) {
  try {
    sendGAEvent(eventData);
    if (process.env.NODE_ENV === "development") {
      console.debug("[GA]", eventData);
    }
  } catch (error) {
    console.error("[GA Error]", error);
  }
}
