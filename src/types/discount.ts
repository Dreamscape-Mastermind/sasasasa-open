import {
  Nullable,
  PaginatedResponse,
  SuccessResponse,
  TimeStamp,
} from "./common";

import { UserProfile } from "./user";

/**
 * Discount type enum
 */
export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
}

/**
 * Discount status enum
 */
export enum DiscountStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  EXPIRED = "EXPIRED",
}

/**
 * Base interfaces
 */
export interface BaseDiscountEntity extends TimeStamp {
  id: string;
}

/**
 * Discount interface
 */
export interface Discount extends BaseDiscountEntity {
  event: string; // Event ID
  name: string;
  description: string;
  code: string;
  discount_type: DiscountType;
  amount: number;
  max_uses: number;
  current_uses: number; // Read-only field from serializer
  min_ticket_count: number;
  max_discount_amount: Nullable<number>;
  start_date: string;
  end_date: string;
  status: DiscountStatus;
}

/**
 * Discount usage interface
 */
export interface DiscountUsage extends BaseDiscountEntity {
  discount: Discount;
  user: UserProfile;
  ticket: string; // Ticket ID
  amount_saved: number;
}

/**
 * Request interfaces
 */
export interface CreateDiscountRequest {
  name: string;
  description?: string;
  code: string;
  discount_type: DiscountType;
  amount: number;
  max_uses?: number;
  min_ticket_count?: number;
  max_discount_amount?: number;
  start_date: string;
  end_date: string;
  status?: DiscountStatus;
}

export interface UpdateDiscountRequest extends Partial<CreateDiscountRequest> {}

export interface DiscountOverallStats {
  total_discounts: number;
  active_discounts: number;
  total_uses: number;
  total_amount_saved: number;
  average_discount_per_use: number;
  type_distribution: Array<{
    discount_type: DiscountType;
    count: number;
    total_uses: number;
    total_saved: number;
  }>;
  status_distribution: Array<{
    status: DiscountStatus;
    count: number;
    total_uses: number;
  }>;
  usage_over_time: Array<{
    date: string;
    count: number;
    amount_saved: number;
  }>;
  top_performing_discounts: Array<{
    id: string;
    code: string;
    name: string;
    total_uses: number;
    total_saved: number;
    discount_type: DiscountType;
    amount: number;
  }>;
}
/**
 * Response interfaces
 */
export interface DiscountResponse extends SuccessResponse<Discount> {}

export interface DiscountsResponse
  extends SuccessResponse<PaginatedResponse<Discount>> {}

export interface DiscountUsageResponse
  extends SuccessResponse<DiscountUsage[]> {}

export interface DiscountAnalyticsResponse
  extends SuccessResponse<{
    total_uses: number;
    total_amount_saved: number;
    average_discount_per_use: number;
    usage_by_date: Record<string, number>;
    total_unique_users: number;
  }> {}

export interface DiscountOverallStatsResponse
  extends SuccessResponse<DiscountOverallStats> {}

/**
 * Query parameter interfaces
 */
export interface DiscountQueryParams {
  event?: string;
  status?: DiscountStatus;
  discount_type?: DiscountType;
  search?: string;
  ordering?: string;
  page?: number;
  verbose?: boolean;
}

export interface DiscountUsageQueryParams {
  discount?: string;
  user?: string;
  ticket?: string;
  start_date?: string;
  end_date?: string;
  ordering?: string;
  page?: number;
}
