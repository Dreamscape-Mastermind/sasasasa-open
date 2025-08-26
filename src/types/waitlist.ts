import { PaginatedResponse, SuccessResponse, TimeStamp } from "./common";

// Waitlist entry types
export interface WaitlistEntry extends TimeStamp {
  id: string;
  email: string;
}

// Request types
export interface JoinWaitlistRequest {
  email: string;
}

// Response types
export interface WaitlistResponse extends SuccessResponse<WaitlistEntry> {}

export interface WaitlistsResponse extends SuccessResponse<PaginatedResponse<WaitlistEntry>> {}

export interface WaitlistAnalyticsResponse
  extends SuccessResponse<{
    total_waitlist_entries: number;
    conversion_rate: number;
    average_wait_time: number;
    entries_by_date: Record<string, number>;
  }> {}

export interface WaitlistListResponse {
  message: string;
  data: {
    count: number;
    next: string | null;
    previous: string | null;
    results: WaitlistEntry[];
  };
}

export interface JoinWaitlistResponse {
  message: string;
  data?: {
    email: string;
  };
}
