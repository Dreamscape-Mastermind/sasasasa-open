import {
  ApiResponse,
  DiscountType,
  PaginatedResponse,
  TimeStamped,
} from "./common";

export type DiscountStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";

export interface Discount extends TimeStamped {
  id: string;
  event: string;
  name: string;
  description?: string;
  code: string;
  discount_type: DiscountType;
  amount: number;
  max_uses: number;
  current_uses: number;
  min_ticket_count: number;
  max_discount_amount: number | null;
  start_date: string;
  end_date: string;
  status: DiscountStatus;
}

export interface DiscountUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export interface DiscountUsage {
  id: string;
  discount: Discount;
  user: DiscountUser;
  ticket: string;
  amount_saved: number;
  created_at: string;
}

export interface DiscountAnalytics {
  total_uses: number;
  total_amount_saved: number;
  average_discount_per_use: number;
  usage_by_date: Record<string, number>;
  total_unique_users: number;
}

export interface DiscountCreateRequest {
  name: string;
  description?: string;
  code: string;
  discount_type: DiscountType;
  amount: number;
  max_uses: number;
  min_ticket_count?: number;
  max_discount_amount?: number;
  start_date: string;
  end_date: string;
  status?: DiscountStatus;
}

export interface DiscountUpdateRequest {
  name?: string;
  description?: string;
  code?: string;
  discount_type?: DiscountType;
  amount?: number;
  max_uses?: number;
  min_ticket_count?: number;
  max_discount_amount?: number;
  start_date?: string;
  end_date?: string;
  status?: DiscountStatus;
}

export interface DiscountFilterParams {
  status?: DiscountStatus;
  discount_type?: DiscountType;
  search?: string;
  ordering?: string;
}

export type DiscountResponse = ApiResponse<Discount>;
export type DiscountListResponse = ApiResponse<PaginatedResponse<Discount>>;
export type DiscountUsageResponse = ApiResponse<DiscountUsage[]>;
export type DiscountAnalyticsResponse = ApiResponse<DiscountAnalytics>;
