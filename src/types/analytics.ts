import type { SuccessResponse } from "./common";

export type AnalyticsGranularity = "day" | "week" | "month";

export interface EventAnalyticsQuery {
  date_from?: string; // ISO 8601 date/time
  date_to?: string; // ISO 8601 date/time
  granularity?: AnalyticsGranularity; // default: "day"
  tz?: string; // IANA timezone
  include_checkins?: boolean; // default: true
}

// New API overview shape (camelCase)
export interface EventAnalyticsOverview {
  totalRevenue: number;
  totalTicketsSold: number;
  totalAttendees: number;
  attendanceRate: number; // percentage e.g., 95.3
  averageTicketPrice: number;
  refundRate?: number;
  revenueGrowth?: number;
  ticketGrowth?: number;
  attendeeGrowth?: number;
}

// New API ticket sales timeline
export interface EventAnalyticsTicketSalesTimelinePoint {
  date: string; // ISO date (respecting granularity)
  cumulative: number;
  daily: number;
}

// New API ticket type breakdown
export interface EventAnalyticsTicketTypeBreakdownItem {
  type: string;
  sold: number;
  revenue: number;
  percentage: number;
}

export interface EventAnalyticsTicketSalesSection {
  timeline: EventAnalyticsTicketSalesTimelinePoint[];
  byType: EventAnalyticsTicketTypeBreakdownItem[];
}

export interface EventAnalyticsCheckInTimelinePoint {
  time: string; // e.g., "17:00"
  count: number;
}

export interface EventAnalyticsCheckInSection {
  timeline: EventAnalyticsCheckInTimelinePoint[];
  peakTime?: string;
  averageWaitTime?: string; // e.g., "0 minutes"
}

export interface EventAnalyticsEventMeta {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  venue: string;
  cover_image?: string | null;
}

export interface EventAnalyticsDemographics {
  locations?: Array<{ city: string; count: number; percentage: number }>;
}

export interface EventAnalyticsEngagement {
  socialMedia?: {
    shares: number;
    likes: number;
    comments: number;
    reach: number;
    impressions: number;
  };
}

export interface EventAnalyticsPayload {
  event: EventAnalyticsEventMeta;
  overview: EventAnalyticsOverview;
  ticketSales: EventAnalyticsTicketSalesSection;
  checkIn: EventAnalyticsCheckInSection;
  demographics?: EventAnalyticsDemographics;
  engagement?: EventAnalyticsEngagement;
}

export interface EventAnalyticsResponse
  extends SuccessResponse<EventAnalyticsPayload> {}

export type AnalyticsExportFormat = "csv" | "excel";

export interface EventAnalyticsExportRequest extends EventAnalyticsQuery {
  format: AnalyticsExportFormat;
  // Keep these optional to avoid tight coupling; backend may ignore
  sections?: {
    overview?: boolean;
    ticketSales?: boolean;
    checkIn?: boolean;
  };
}

export interface EventAnalyticsExportResponse
  extends SuccessResponse<{
    download_url: string;
    file_name: string;
    file_size?: number;
    expires_at?: string;
  }> {}
